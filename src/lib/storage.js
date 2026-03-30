const WAITLIST_STATE_KEY = "flup.waitlist.state";
const WAITLIST_REFERRAL_KEY = "flup.waitlist.referral";

export function getSavedWaitlistState(storage = window.localStorage) {
  const raw = storage.getItem(WAITLIST_STATE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    storage.removeItem(WAITLIST_STATE_KEY);
    return null;
  }
}

export function getSavedReferralCode(storage = window.localStorage) {
  return storage.getItem(WAITLIST_REFERRAL_KEY);
}

export function saveWaitlistState(storage = window.localStorage, payload) {
  storage.setItem(WAITLIST_STATE_KEY, JSON.stringify(payload));
}

export function saveReferralCode(storage = window.localStorage, referralCode) {
  if (!referralCode) {
    storage.removeItem(WAITLIST_REFERRAL_KEY);
    return;
  }

  storage.setItem(WAITLIST_REFERRAL_KEY, referralCode);
}
