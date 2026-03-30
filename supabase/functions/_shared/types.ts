export type WaitlistStatus = "waiting" | "early_access" | "invited" | "archived";

export interface ReferralProgress {
  current: number;
  percent: number;
  remaining: number;
  target: number;
  unlocked: boolean;
}

export interface WaitlistResponse {
  email: string;
  firstName: string | null;
  referralCode: string;
  referralCount: number;
  referralLink: string;
  rewardTarget: number;
  rewardUnlocked: boolean;
  status: "created" | "existing";
  userStatus: WaitlistStatus;
}
