export function analyzeThreat({ statusCode, blocked, reason }) {
  const threatDelta =
    (statusCode === 401 || statusCode === 403 ? 2 : 0) + (blocked ? 3 : 0);

  const reasons = [];

  if (statusCode === 401 || statusCode === 403) {
    reasons.push("Unauthorized or forbidden access attempt");
  }

  if (blocked) {
    reasons.push(reason || "Blocked by Sentinel Guard");
  }

  return {
    threatDelta,
    reasons,
  };
}
