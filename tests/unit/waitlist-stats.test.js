import { describe, expect, it } from "vitest";
import {
  WAITLIST_EXTERNAL_OFFSET,
  buildPublicTotalLabel,
  buildWaitlistPositionLabel,
  formatCount
} from "../../src/lib/waitlist-stats.js";

describe("waitlist stats helpers", () => {
  it("formats counts for the public total label", () => {
    expect(formatCount(1004)).toBe("1,004");
    expect(buildPublicTotalLabel(WAITLIST_EXTERNAL_OFFSET)).toBe("1,004 people already joined");
  });

  it("formats a place-in-line label", () => {
    expect(buildWaitlistPositionLabel(1129)).toBe("You’re #1,129 on the list");
  });
});
