import { describe, expect, it } from "vitest";
import { buildAdminWaitlistCsv } from "../../src/lib/admin-export.js";

describe("admin export helpers", () => {
  it("builds a csv for the full unfiltered waitlist", () => {
    const csv = buildAdminWaitlistCsv([
      {
        email: "sam@example.com",
        first_name: "Sam",
        phone_number: "(312) 555-0199",
        referral_count: 6,
        status: "waiting",
        created_at: "2026-03-30T12:34:56.000Z"
      }
    ]);

    expect(csv).toContain("email,first_name,phone_number,referral_count,status,created_at");
    expect(csv).toContain("sam@example.com,Sam,(312) 555-0199,6,waiting,2026-03-30T12:34:56.000Z");
  });
});
