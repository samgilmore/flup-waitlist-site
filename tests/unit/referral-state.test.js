import { describe, expect, it } from "vitest";
import { getReferralCodeFromUrl, getRewardProgress } from "../../src/lib/referral-state.js";

describe("referral-state", () => {
  it("reads a referral code from the URL", () => {
    expect(getReferralCodeFromUrl("https://flup.app/?ref=ABC123")).toBe("ABC123");
  });

  it("calculates progress toward five referrals", () => {
    expect(getRewardProgress(2, 5)).toEqual({
      current: 2,
      target: 5,
      percent: 40,
      remaining: 3,
      unlocked: false
    });
  });
});
