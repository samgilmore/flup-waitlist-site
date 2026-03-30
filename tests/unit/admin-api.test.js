import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchAdminWaitlist, updateAdminUserStatus } from "../../src/lib/admin-api.js";

function createClient(accessToken = "admin-token") {
  return {
    auth: {
      async getSession() {
        return {
          data: {
            session: accessToken ? { access_token: accessToken } : null
          }
        };
      }
    }
  };
}

describe("admin api helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads waitlist rows with the active admin session", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      async json() {
        return {
          rows: [{ email: "sam@example.com", referral_count: 5 }]
        };
      }
    });

    vi.stubGlobal("fetch", fetchMock);

    const rows = await fetchAdminWaitlist(
      createClient(),
      {
        search: "sam",
        threshold: "5"
      },
      {
        supabaseUrl: "https://example.supabase.co"
      }
    );

    expect(rows).toEqual([{ email: "sam@example.com", referral_count: 5 }]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.supabase.co/functions/v1/admin-list-users?search=sam&threshold=5",
      {
        headers: {
          Authorization: "Bearer admin-token"
        }
      }
    );
  });

  it("updates a user status with the active admin session", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      async json() {
        return {
          row: {
            id: "user-1",
            status: "early_access"
          }
        };
      }
    });

    vi.stubGlobal("fetch", fetchMock);

    const row = await updateAdminUserStatus(
      createClient(),
      {
        userId: "user-1",
        status: "early_access"
      },
      {
        supabaseUrl: "https://example.supabase.co"
      }
    );

    expect(row).toEqual({
      id: "user-1",
      status: "early_access"
    });
    expect(fetchMock).toHaveBeenCalledWith("https://example.supabase.co/functions/v1/admin-update-user-status", {
      body: JSON.stringify({
        userId: "user-1",
        status: "early_access"
      }),
      headers: {
        Authorization: "Bearer admin-token",
        "Content-Type": "application/json"
      },
      method: "POST"
    });
  });
});
