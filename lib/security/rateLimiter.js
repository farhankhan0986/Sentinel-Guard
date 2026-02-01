const rateLimitMap = new Map();

const WINDOW_SIZE_MS = 60 * 1000;
const MAX_REQUESTS = 10;

export function checkRateLimit(ip) {
  const now = Date.now();

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const timestamps = rateLimitMap.get(ip);

  const recentTimestamps = timestamps.filter((time) => {
    now - time < WINDOW_SIZE_MS;
  });

  recentTimestamps.push(now);
  rateLimitMap.set(ip, recentTimestamps);

  if (recentTimestamps.length > MAX_REQUESTS) {
    return {
      limited: true,
      retryAfter: Math.ceil(
        (WINDOW_SIZE_MS - (now - recentTimestamps[0])) / 1000,
      ),
    };

  }
    return { limited: false };
}
