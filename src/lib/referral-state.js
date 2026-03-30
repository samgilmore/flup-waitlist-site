export function getReferralCodeFromUrl(url) {
  const searchParams = new URL(url).searchParams;
  return searchParams.get("ref");
}

export function getRewardProgress(current, target = 5) {
  const safeCurrent = Math.max(0, Number(current) || 0);
  const safeTarget = Math.max(1, Number(target) || 1);
  const percent = Math.min(100, Math.round((safeCurrent / safeTarget) * 100));

  return {
    current: safeCurrent,
    target: safeTarget,
    percent,
    remaining: Math.max(0, safeTarget - safeCurrent),
    unlocked: safeCurrent >= safeTarget
  };
}

export function buildReferralLink(code, origin = window.location.origin) {
  const url = new URL(origin);
  url.searchParams.set("ref", code);
  return url.toString();
}

export function isEligibleForEarlyAccess(referralCount, target = 5) {
  return getRewardProgress(referralCount, target).unlocked;
}
