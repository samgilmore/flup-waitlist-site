import { describe, expect, it } from "vitest";
import {
  buildReferralProgress,
  normalizeEmail,
  validateReferralAttribution
} from "../../supabase/functions/_shared/referral.ts";

describe("shared referral logic", () => {
  it("normalizes email by trimming and lowercasing", () => {
    expect(normalizeEmail(" Sam@Example.com ")).toBe("sam@example.com");
  });

  it("caps progress percentage at one hundred", () => {
    expect(buildReferralProgress(7, 5).percent).toBe(100);
  });

  it("rejects self referrals", () => {
    expect(() => validateReferralAttribution("sam@example.com", "sam@example.com")).toThrow(
      /self-referrals/i
    );
  });
});
