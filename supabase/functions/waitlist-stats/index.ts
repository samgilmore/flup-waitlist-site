import { corsHeaders } from "../_shared/cors.ts";
import { getExternalSignupOffset, createServiceClient } from "../_shared/supabase.ts";
import { getTotalSignups } from "../_shared/waitlist.ts";

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
    const supabase = createServiceClient();
    const totalSignups = await getTotalSignups(supabase, getExternalSignupOffset());
    return json({ totalSignups });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load waitlist stats.";
    return json({ error: message }, 500);
  }
});
