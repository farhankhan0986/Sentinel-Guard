import { NextResponse } from "next/server";
import { evaluateRule } from "@/lib/security/ruleEngine";
import { checkRateLimit } from "@/lib/security/rateLimiter";

export default async function proxy(request) {
  const { pathname, origin } = request.nextUrl;
  const internalPaths = [
    "/api/admin",
    "/api/analytics",
    "/api/rules",
    "/api/logs",
    "/api/threats",
    "/api/platform",
    "/api/health",
    "/_next",
    "/favicon.ico",
  ];

  if (internalPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const tenantApiKey = request.headers.get("x-sentinel-api-key");
  if (!tenantApiKey) {
    return NextResponse.json(
      { error: "Missing x-sentinel-api-key header" },
      { status: 401 },
    );
  }

  const requestContext = {
    tenantId: null,
    tenantName: null,
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.ip ||
      "unknown",
    method: request.method,
    path: pathname,
    userAgent: request.headers.get("user-agent"),
    timestamp: new Date(),
  };

  const tenantRes = await fetch(`${origin}/api/platform/tenants/resolve`, {
    cache: "no-store",
    headers: {
      "x-sentinel-api-key": tenantApiKey,
    },
  });

  if (!tenantRes.ok) {
    return NextResponse.json(
      { error: "Invalid or suspended tenant API key" },
      { status: 403 },
    );
  }

  const tenantPayload = await tenantRes.json();
  const tenant = tenantPayload.tenant;
  requestContext.tenantId = tenant.id;
  requestContext.tenantName = tenant.name;

  const internalHeaders = {
    "Content-Type": "application/json",
    "x-sentinel-api-key": tenantApiKey,
  };

  const logRequest = async (payload) => {
    const res = await fetch(`${origin}/api/logs`, {
      method: "POST",
      cache: "no-store",
      headers: internalHeaders,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(
        `[Sentinel] CRITICAL: Log write failed (${res.status}). Rate limiting may be impaired.`,
        await res.text().catch(() => ""),
      );
    }
  };

  const updateThreat = async (payload) => {
    try {
      await fetch(`${origin}/api/threats`, {
        method: "POST",
        cache: "no-store",
        headers: internalHeaders,
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("[Sentinel] Threat update failed:", error);
    }
  };

  try {
    const threatRes = await fetch(
      `${origin}/api/threats/check?ip=${requestContext.ip}`,
      {
        cache: "no-store",
        headers: {
          "x-sentinel-api-key": tenantApiKey,
        },
      },
    );

    const threatData = await threatRes.json();

    if (threatData.blocked) {
      const retryAfter = threatData.remainingSeconds ?? 900;
      await logRequest({
        ...requestContext,
        status: "Blocked",
        blocked: true,
        reason: "Auto-blocked (Threat Engine)",
      });
      await updateThreat({
        ...requestContext,
        blocked: true,
        reason: "Auto-blocked (Threat Engine)",
        statusCode: 403,
      });

      return NextResponse.json(
        {
          error: "IP temporarily blocked due to suspicious activity",
          retryAfter,
          blockedUntil: threatData.blockedUntil,
        },
        {
          status: 403,
          headers: { "Retry-After": retryAfter.toString() },
        },
      );
    }
  } catch {
    // Fail open on threat lookups.
  }

  try {
    const rulesRes = await fetch(
      `${origin}/api/rules?tenantId=${tenant.id}&source=proxy`,
      {
        cache: "no-store",
        headers: {
          "x-sentinel-api-key": tenantApiKey,
        },
      },
    );

    if (rulesRes.ok) {
      const { rules } = await rulesRes.json();
      const decision = evaluateRule(requestContext, rules || []);

      if (decision.blocked) {
        await logRequest({
          ...requestContext,
          status: "Blocked",
          blocked: true,
          reason: decision.reason,
        });
        await updateThreat({
          ...requestContext,
          blocked: true,
          reason: decision.reason,
          statusCode: 403,
        });

        return NextResponse.json(
          {
            error: "Request blocked by Sentinel Guard",
            reason: decision.reason,
          },
          { status: 403 },
        );
      }
    }
  } catch {
    // Fail open on rule fetch issues.
  }

  // Bug #1 fix: write the log entry BEFORE calling checkRateLimit so
  // the current request is counted in the window. A single log entry
  // is written here for allowed requests; blocked paths above have
  // already written their own "Blocked" entries.
  try {
    await logRequest({
      ...requestContext,
      status: "Allowed",
      blocked: false,
    });
  } catch (error) {
    console.error("[Sentinel] CRITICAL: Pre-rate-limit log write threw:", error);
  }

  const rateResult = await checkRateLimit(tenant.id, requestContext.ip);
  if (rateResult.limited) {
    // Overwrite the status in a separate blocked log so dashboards reflect
    // the actual outcome, and update the threat score.
    await logRequest({
      ...requestContext,
      status: "Blocked",
      blocked: true,
      reason: "Rate limit exceeded",
    }).catch((e) => console.error("[Sentinel] Rate-limit log write failed:", e));

    await updateThreat({
      ...requestContext,
      blocked: true,
      reason: "Rate limit exceeded",
      statusCode: 429,
    });

    return NextResponse.json(
      {
        error: "Too many requests",
        reason: "Rate limit exceeded",
        retryAfter: rateResult.retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": rateResult.retryAfter.toString(),
        },
      },
    );
  }

  // Bug #8 fix: do NOT call updateThreat for clean allowed requests —
  // it was creating a Threat document for every visitor with a zero score.
  // Threat scores are only updated on actual security events (above).

  const response = NextResponse.next();
  response.headers.set("x-sentinel-context", JSON.stringify(requestContext));
  response.headers.set("x-sentinel-tenant", tenant.slug);

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
