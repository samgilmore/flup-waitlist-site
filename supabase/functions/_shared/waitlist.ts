import { buildReferralProgress } from "./referral.ts";
import type { WaitlistResponse } from "./types.ts";

export interface WaitlistUserRow {
  created_at: string;
  email: string;
  first_name: string | null;
  id: string;
  phone_number?: string | null;
  referral_code: string;
  referral_count: number;
  status: WaitlistResponse["userStatus"];
}

export async function getTotalSignups(
  supabase: { from: (table: string) => any },
  externalOffset: number
) {
  const totalResult = await supabase
    .from("waitlist_users")
    .select("id", { count: "exact", head: true });

  if (totalResult.error) {
    throw totalResult.error;
  }

  return (totalResult.count ?? 0) + externalOffset;
}

export async function getWaitlistPosition(
  supabase: { from: (table: string) => any },
  user: WaitlistUserRow,
  externalOffset: number
) {
  const beforeResult = await supabase
    .from("waitlist_users")
    .select("id", { count: "exact", head: true })
    .lt("created_at", user.created_at);

  if (beforeResult.error) {
    throw beforeResult.error;
  }

  const sameTimestampResult = await supabase
    .from("waitlist_users")
    .select("id", { count: "exact", head: true })
    .eq("created_at", user.created_at)
    .lte("id", user.id);

  if (sameTimestampResult.error) {
    throw sameTimestampResult.error;
  }

  return externalOffset + (beforeResult.count ?? 0) + (sameTimestampResult.count ?? 0);
}

export function buildWaitlistResponse(
  user: WaitlistUserRow,
  siteUrl: string,
  rewardTarget: number,
  status: WaitlistResponse["status"],
  totalSignups: number,
  waitlistPosition: number
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
    totalSignups,
    userStatus: user.status,
    waitlistPosition
  };
}
