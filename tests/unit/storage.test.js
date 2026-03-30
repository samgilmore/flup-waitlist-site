import { describe, expect, it } from "vitest";
import { getSavedWaitlistState, saveWaitlistState } from "../../src/lib/storage.js";

function createStorage() {
  const data = new Map();

  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    removeItem(key) {
      data.delete(key);
    },
    setItem(key, value) {
      data.set(key, value);
    }
  };
}

describe("storage helpers", () => {
  it("stores and reads a waitlist state payload", () => {
    const storage = createStorage();
    const payload = {
      email: "sam@example.com",
      referralCode: "ABC123",
      referralCount: 1
    };

    saveWaitlistState(storage, payload);

    expect(getSavedWaitlistState(storage)).toEqual(payload);
  });
});
