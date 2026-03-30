import { corsHeaders } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/admin.ts";
import type { WaitlistStatus } from "../_shared/types.ts";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: corsHeaders,
    status
  });
}

function isValidStatus(status: string): status is WaitlistStatus {
  return ["waiting", "early_access", "invited", "archived"].includes(status);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  try {
    const { supabase } = await requireAdmin(request);
    const body = await request.json();
    const userId = String(body.userId ?? "");
    const status = String(body.status ?? "");

    if (!userId || !isValidStatus(status)) {
      return json({ error: "A valid user id and status are required." }, 400);
    }

    const result = await supabase
      .from("waitlist_users")
      .update({ status })
      .eq("id", userId)
      .select("id, email, first_name, phone_number, referral_count, status, created_at, referred_by_user_id")
      .single();

    if (result.error) {
      throw result.error;
    }

    return json({ row: result.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update waitlist status.";
    return json({ error: message }, 401);
  }
});
