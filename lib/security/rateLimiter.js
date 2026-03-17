import connectDB from "@/lib/db";
import RequestLog from "@/models/RequestLog";

const WINDOW_SIZE_MS = 60 * 1000;
const MAX_REQUESTS = 10;

export async function checkRateLimit(tenantId, ip) {
  await connectDB();

  const windowStart = new Date(Date.now() - WINDOW_SIZE_MS);
  const recentCount = await RequestLog.countDocuments({
    tenantId,
    ip,
    createdAt: { $gte: windowStart },
  });

  if (recentCount >= MAX_REQUESTS) {
    const oldestRecentLog = await RequestLog.findOne({
      tenantId,
      ip,
      createdAt: { $gte: windowStart },
    })
      .sort({ createdAt: 1 })
      .select("createdAt")
      .lean();

    const retryAfter = oldestRecentLog?.createdAt
      ? Math.max(
          1,
          Math.ceil(
            (WINDOW_SIZE_MS -
              (Date.now() - new Date(oldestRecentLog.createdAt).getTime())) /
              1000,
          ),
        )
      : 60;

    return {
      limited: true,
      retryAfter,
    };
  }

  return { limited: false };
}
