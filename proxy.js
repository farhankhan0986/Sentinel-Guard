import { NextResponse } from "next/server";
import { evaluateRule } from "@/lib/security/ruleEngine";
import { checkRateLimit } from "@/lib/security/rateLimiter";

export async function proxy(request) {
  const { pathname, origin } = request.nextUrl;
  const INTERNAL_PATHS = [
    "/api/admin",
    "/api/analytics",
    "/api/rules",
    "/api/logs",
    "/api/threats",
    "/_next",
    "/favicon.ico",
  ];

  // 🚫 Ignore internal / Sentinel Guard APIs
  const isInternal = INTERNAL_PATHS.some((path) => pathname.startsWith(path));

  if (isInternal) {
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
    timestamp: new Date(),
  };

  // Helper: log request safely (never blocks request flow)
  const logRequest = async (payload) => {
    try {
      await fetch(`${origin}/api/logs`, {
        method: "POST",
        cache: "no-store", // 🔥 REQUIRED
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Logging failed:", err);
    }
  };

  /* ─────────────────────────────
     🚨 AUTO-BLOCK (Threat Engine)
     ───────────────────────────── */
  try {
    const threatRes = await fetch(
      `${origin}/api/threats/check?ip=${requestContext.ip}`,
      { cache: "no-store" },
    );

    const threatData = await threatRes.json();

    if (threatData.blocked) {
      await logRequest({
        ...requestContext,
        status: "Blocked",
        reason: "Auto-blocked (Threat Engine)",
      });

      return new NextResponse(
        JSON.stringify({
          error: "IP temporarily blocked due to suspicious activity",
        }),
        { status: 403 },
      );
    }
  } catch {
    // Fail open — security tools should not break app
  }

  /* ─────────────────────────────
     🔐 FIREWALL RULES
     ───────────────────────────── */
  try {
    const rulesRes = await fetch(`${origin}/api/rules`, {
      cache: "no-store",
    });

    const { rules } = await rulesRes.json();
    const decision = evaluateRule(requestContext, rules);

    if (decision.blocked) {
      await logRequest({
        ...requestContext,
        status: "Blocked",
        reason: decision.reason,
      });

      return new NextResponse(
        JSON.stringify({
          error: "Request blocked by Sentinel Guard",
          reason: decision.reason,
        }),
        { status: 403 },
      );
    }
  } catch {
    // Fail open
  }

  /* ─────────────────────────────
     🚦 RATE LIMITING
     ───────────────────────────── */
  const rateResult = checkRateLimit(requestContext.ip);

  if (rateResult.limited) {
    await logRequest({
      ...requestContext,
      status: "Blocked",
      reason: "Rate limit exceeded",
    });

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
      },
    );
  }

  /* ─────────────────────────────
     ✅ ALLOW REQUEST
     ───────────────────────────── */
  await logRequest({
    ...requestContext,
    status: "Allowed",
  });

  const response = NextResponse.next();
  response.headers.set("x-sentinel-context", JSON.stringify(requestContext));

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
