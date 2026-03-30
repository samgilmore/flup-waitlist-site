import { buildReferralProgress } from "./referral.ts";
import type { WaitlistResponse } from "./types.ts";

export interface WaitlistUserRow {
  email: string;
  first_name: string | null;
  referral_code: string;
  referral_count: number;
  status: WaitlistResponse["userStatus"];
}

export function buildWaitlistResponse(
  user: WaitlistUserRow,
  siteUrl: string,
  rewardTarget: number,
  status: WaitlistResponse["status"]
): WaitlistResponse {
  const progress = buildReferralProgress(user.referral_count, rewardTarget);
  const referralLink = new URL(siteUrl);

  referralLink.searchParams.set("ref", user.referral_code);

  return {
    email: user.email,
    firstName: user.first_name,
    referralCode: user.referral_code,
    referralCount: user.referral_count,
    referralLink: referralLink.toString(),
    rewardTarget,
    rewardUnlocked: progress.unlocked,
    status,
    userStatus: user.status
  };
}
