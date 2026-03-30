import { createServiceClient } from "./supabase.ts";

function getToken(request: Request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing admin authorization.");
  }

  return authHeader.replace("Bearer ", "");
}

export async function requireAdmin(request: Request) {
  const token = getToken(request);
  const supabase = createServiceClient();
  const userResult = await supabase.auth.getUser(token);

  if (userResult.error || !userResult.data.user) {
    throw new Error("Invalid admin session.");
  }

  const adminResult = await supabase
    .from("admin_profiles")
    .select("id, auth_user_id, email, role")
    .eq("auth_user_id", userResult.data.user.id)
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
    user: userResult.data.user
  };
}
