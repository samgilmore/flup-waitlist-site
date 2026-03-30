import { createServiceClient } from "./supabase.ts";

function decodeBase64Url(segment: string) {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

function getVerifiedUserId(request: Request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing admin authorization.");
  }

  const token = authHeader.replace("Bearer ", "");
  const [, payloadSegment] = token.split(".");

  if (!payloadSegment) {
    throw new Error("Invalid admin session.");
  }

  try {
    const payload = JSON.parse(decodeBase64Url(payloadSegment));
    const userId = String(payload.sub ?? "");

    if (!userId) {
      throw new Error("Missing subject.");
    }

    return userId;
  } catch {
    throw new Error("Invalid admin session.");
  }
}

export async function requireAdmin(request: Request) {
  const userId = getVerifiedUserId(request);
  const supabase = createServiceClient();

  const adminResult = await supabase
    .from("admin_profiles")
    .select("id, auth_user_id, email, role")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (adminResult.error) {
    throw adminResult.error;
  }

  if (!adminResult.data) {
    throw new Error("Admin access denied.");
  }

  return {
    admin: adminResult.data,
    supabase,
    user: {
      id: userId
    }
  };
}
