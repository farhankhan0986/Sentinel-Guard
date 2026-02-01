import { NextResponse } from "next/server";
import { evaluateRule } from "@/lib/security/ruleEngine";
import { checkRateLimit } from "@/lib/security/rateLimiter";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // 🚫 Ignore internal / Sentinel Guard APIs
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/rules") ||
    pathname.startsWith("/api/logs") ||
    pathname.startsWith("/api/threats") // ⬅️ IMPORTANT
  ) {
    return NextResponse.next();
  }

  const requestContext = {
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.ip ||
      "unknown",
    method: request.method,
    path: pathname,
    userAgent: request.headers.get("user-agent"),
    timestamp: new Date().toISOString(),
  };

  // 🚨 PART D — Auto-block check (BEFORE firewall & rate limit)
  const threatRes = await fetch(
    `${request.nextUrl.origin}/api/threats/check?ip=${requestContext.ip}`
  );

  const threatData = await threatRes.json();

  if (threatData.blocked) {
    return new NextResponse(
      JSON.stringify({
        error: "IP temporarily blocked due to suspicious activity",
      }),
      { status: 403 }
    );
  }

  // 🔐 Firewall rules
  const rulesRes = await fetch(`${request.nextUrl.origin}/api/rules`);
  const { rules } = await rulesRes.json();

  const decision = evaluateRule(requestContext, rules);

  if (decision.blocked) {
    return new NextResponse(
      JSON.stringify({
        error: "Request blocked by Sentinel Guard",
        reason: decision.reason,
      }),
      { status: 403 }
    );
  }

  // 🚦 Rate limiting
  const rateResult = checkRateLimit(requestContext.ip);

  if (rateResult.limited) {
    return new NextResponse(
      JSON.stringify({
        error: "Too many requests",
        reason: "Rate limit exceeded",
        retryAfter: rateResult.retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Retry-After": rateResult.retryAfter.toString(),
        },
      }
    );
  }

  // ✅ Allow request
  const response = NextResponse.next();
  response.headers.set(
    "x-sentinel-context",
    JSON.stringify(requestContext)
  );

  return response;
}
