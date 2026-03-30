import { createClient } from "npm:@supabase/supabase-js@2";

export function createServiceClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service credentials are missing.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function getRewardTarget() {
  return Number(Deno.env.get("EARLY_ACCESS_REFERRAL_TARGET") ?? "5");
}

export function getSiteUrl(request: Request) {
  return (
    Deno.env.get("SITE_URL") ??
    request.headers.get("origin") ??
    "http://127.0.0.1:4173"
  );
}
