import { describe, expect, it } from "vitest";
import { formatUsPhoneNumber, normalizeUsPhoneNumber } from "../../src/lib/phone.js";

describe("phone helpers", () => {
  it("formats a phone number as the user types", () => {
    expect(formatUsPhoneNumber("3")).toBe("(3");
    expect(formatUsPhoneNumber("3125")).toBe("(312) 5");
    expect(formatUsPhoneNumber("3125550199")).toBe("(312) 555-0199");
  });

  it("normalizes complete us phone numbers only", () => {
    expect(normalizeUsPhoneNumber("3125550199")).toBe("(312) 555-0199");
    expect(normalizeUsPhoneNumber("+1 (312) 555-0199")).toBe("(312) 555-0199");
    expect(normalizeUsPhoneNumber("3125550")).toBeNull();
    expect(normalizeUsPhoneNumber("   ")).toBeNull();
  });
});
