import { corsHeaders } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/admin.ts";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: corsHeaders,
    status
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "GET") {
    return json({ error: "Method not allowed." }, 405);
  }

  try {
    const { supabase } = await requireAdmin(request);
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim() ?? "";
    const threshold = Number(url.searchParams.get("threshold") ?? "0");
    const safeThreshold = Number.isFinite(threshold) ? threshold : 0;

    let query = supabase
      .from("waitlist_users")
      .select("id, email, first_name, phone_number, referral_count, status, created_at, referred_by_user_id")
      .order("referral_count", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(200);

    if (search) {
      query = query.ilike("email", `%${search}%`);
    }

    if (safeThreshold > 0) {
      query = query.gte("referral_count", safeThreshold);
    }

    const result = await query;

    if (result.error) {
      throw result.error;
    }

    return json({ rows: result.data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load waitlist data.";
    return json({ error: message }, 401);
  }
});
