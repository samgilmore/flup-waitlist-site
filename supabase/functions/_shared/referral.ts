export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function sanitizePhoneDigits(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }

  return digits;
}

export function normalizePhoneNumber(phoneNumber: string) {
  const trimmed = phoneNumber.trim();

  if (!trimmed) {
    return null;
  }

  const digits = sanitizePhoneDigits(trimmed);

  if (digits.length !== 10) {
    throw new Error("Please enter a valid 10-digit phone number or leave it blank.");
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
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
