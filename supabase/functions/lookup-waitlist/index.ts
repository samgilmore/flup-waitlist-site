import { corsHeaders } from "../_shared/cors.ts";
import { normalizeEmail } from "../_shared/referral.ts";
import { createServiceClient, getRewardTarget, getSiteUrl } from "../_shared/supabase.ts";
import { buildWaitlistResponse, type WaitlistUserRow } from "../_shared/waitlist.ts";

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

  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  try {
    const supabase = createServiceClient();
    const rewardTarget = getRewardTarget();
    const siteUrl = getSiteUrl(request);
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));

    if (!email) {
      return json({ error: "Email is required." }, 400);
    }

    const userResult = await supabase
      .from("waitlist_users")
      .select("email, first_name, referral_code, referral_count, status")
      .eq("email", email)
      .maybeSingle<WaitlistUserRow>();

    if (userResult.error) {
      throw userResult.error;
    }

    if (!userResult.data) {
      return json({ error: "We could not find a waitlist entry for that email yet." }, 404);
    }

    return json(buildWaitlistResponse(userResult.data, siteUrl, rewardTarget, "existing"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to look up your invite.";
    return json({ error: message }, 500);
  }
});
