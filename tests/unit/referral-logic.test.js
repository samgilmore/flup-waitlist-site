import { describe, expect, it } from "vitest";
import {
  buildReferralProgress,
  normalizeEmail,
  normalizePhoneNumber,
  validateReferralAttribution
} from "../../supabase/functions/_shared/referral.ts";

describe("shared referral logic", () => {
  it("normalizes email by trimming and lowercasing", () => {
    expect(normalizeEmail(" Sam@Example.com ")).toBe("sam@example.com");
  });

  it("caps progress percentage at one hundred", () => {
    expect(buildReferralProgress(7, 5).percent).toBe(100);
  });

  it("normalizes optional phone numbers by trimming or nulling blank values", () => {
    expect(normalizePhoneNumber("  (312) 555-0199  ")).toBe("(312) 555-0199");
    expect(normalizePhoneNumber("3125550199")).toBe("(312) 555-0199");
    expect(normalizePhoneNumber("+1 (312) 555-0199")).toBe("(312) 555-0199");
    expect(normalizePhoneNumber("   ")).toBeNull();
    expect(() => normalizePhoneNumber("3125550")).toThrow(/10-digit phone number/i);
  });

  it("rejects self referrals", () => {
    expect(() => validateReferralAttribution("sam@example.com", "sam@example.com")).toThrow(
      /self-referrals/i
    );
  });
});
