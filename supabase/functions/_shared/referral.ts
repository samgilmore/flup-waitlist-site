export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizePhoneNumber(phoneNumber: string) {
  const normalized = phoneNumber.trim();
  return normalized ? normalized : null;
}

export function buildReferralProgress(current: number, target = 5) {
  const safeCurrent = Math.max(0, Number(current) || 0);
  const safeTarget = Math.max(1, Number(target) || 1);
  const percent = Math.min(100, Math.round((safeCurrent / safeTarget) * 100));

  return {
    current: safeCurrent,
    percent,
    remaining: Math.max(0, safeTarget - safeCurrent),
    target: safeTarget,
    unlocked: safeCurrent >= safeTarget
  };
}

export function createReferralCode() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
}

export function validateReferralAttribution(newUserEmail: string, referrerEmail: string | null) {
  if (!referrerEmail) {
    return;
  }

  if (normalizeEmail(newUserEmail) === normalizeEmail(referrerEmail)) {
    throw new Error("Self-referrals are not allowed.");
  }
}
