import { describe, expect, it } from "vitest";
import { buildAdminSummary } from "../../src/lib/admin-summary.js";

describe("admin summary helpers", () => {
  it("counts total signups and referral thresholds", () => {
    const rows = [
      { referral_count: 0 },
      { referral_count: 4 },
      { referral_count: 5 },
      { referral_count: 8 },
      { referral_count: 10 },
      { referral_count: 12 }
    ];

    expect(buildAdminSummary(rows)).toEqual({
      totalSignups: 6,
      fivePlusCount: 4,
      tenPlusCount: 2
    });
  });
});
