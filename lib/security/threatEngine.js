export function analyzeThreat({
    ip,
    status,
    blocked,
    existingThreat
}) {
    let threatScore = existingThreat ? existingThreat.threatScore : 0;
    const reasons = existingThreat ? [...existingThreat.reasons] : [];

    if(status === 401 || status === 403){
        threatScore += 2;
        reasons.push("Repeated Unauthorized access");
    }

    if(blocked) {
        threatScore += 3;
        reasons.push("Blocked by Sentinel Guard");
    }

    const ShouldBlocked = threatScore >= 10;

    let blockedUntil = null;
    if(ShouldBlocked){
        blockedUntil = new Date(Date.now() + 15 * 60* 1000);
        reasons.push("IP blocked due to high threat score");
    }
    return {
        threatScore,
        reasons,
        blockedUntil
    };
}