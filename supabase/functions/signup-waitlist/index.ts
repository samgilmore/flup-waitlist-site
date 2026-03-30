import { corsHeaders } from "../_shared/cors.ts";
import {
  createReferralCode,
  normalizeEmail,
  normalizePhoneNumber,
  validateReferralAttribution
} from "../_shared/referral.ts";
import {
  createServiceClient,
  getExternalSignupOffset,
  getRewardTarget,
  getSiteUrl
} from "../_shared/supabase.ts";
import {
  buildWaitlistResponse,
  getTotalSignups,
  getWaitlistPosition,
  type WaitlistUserRow
} from "../_shared/waitlist.ts";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: corsHeaders,
    status
  });
}

function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

async function generateUniqueReferralCode(supabase: ReturnType<typeof createServiceClient>) {
  for (let index = 0; index < 12; index += 1) {
    const referralCode = createReferralCode();
    const { data } = await supabase
      .from("waitlist_users")
      .select("id")
      .eq("referral_code", referralCode)
      .maybeSingle();

    if (!data) {
      return referralCode;
    }
  }

  throw new Error("Unable to generate a unique referral code.");
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
    const externalSignupOffset = getExternalSignupOffset();
    const rewardTarget = getRewardTarget();
    const siteUrl = getSiteUrl(request);
    const body = await request.json();

    const email = normalizeEmail(String(body.email ?? ""));
    const firstName = String(body.firstName ?? "").trim() || null;
    const phoneNumber = normalizePhoneNumber(String(body.phoneNumber ?? ""));
    const suppliedReferralCode = String(body.referralCode ?? "").trim().toUpperCase() || null;

    if (!isValidEmail(email)) {
      return json({ error: "Please enter a valid email address." }, 400);
    }

    const existingResult = await supabase
      .from("waitlist_users")
      .select("id, created_at, email, first_name, phone_number, referral_code, referral_count, status")
      .eq("email", email)
      .maybeSingle<WaitlistUserRow>();

    if (existingResult.error) {
      throw existingResult.error;
    }

    if (existingResult.data) {
      const [totalSignups, waitlistPosition] = await Promise.all([
        getTotalSignups(supabase, externalSignupOffset),
        getWaitlistPosition(supabase, existingResult.data, externalSignupOffset)
      ]);

      return json(
        buildWaitlistResponse(
          existingResult.data,
          siteUrl,
          rewardTarget,
          "existing",
          totalSignups,
          waitlistPosition
        )
      );
    }

    let referrer:
      | ({
          id: string;
          email: string;
        } & WaitlistUserRow)
      | null = null;

    if (suppliedReferralCode) {
      const referrerResult = await supabase
        .from("waitlist_users")
        .select("id, created_at, email, first_name, phone_number, referral_code, referral_count, status")
        .eq("referral_code", suppliedReferralCode)
        .maybeSingle();

      if (referrerResult.error) {
        throw referrerResult.error;
      }

      referrer = referrerResult.data;

      if (referrer) {
        validateReferralAttribution(email, referrer.email);
      }
    }

    const referralCode = await generateUniqueReferralCode(supabase);
    const createdUserResult = await supabase
      .from("waitlist_users")
      .insert({
        email,
        first_name: firstName,
        phone_number: phoneNumber,
        referral_code: referralCode,
        referred_by_user_id: referrer?.id ?? null
      })
      .select("id, created_at, email, first_name, phone_number, referral_code, referral_count, status")
      .single();

    if (createdUserResult.error) {
      throw createdUserResult.error;
    }

    if (referrer) {
      const referralInsert = await supabase.from("referrals").insert({
        referrer_user_id: referrer.id,
        referred_user_id: createdUserResult.data.id,
        referral_code_used: referrer.referral_code
      });

      if (referralInsert.error) {
        throw referralInsert.error;
      }

      const countResult = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_user_id", referrer.id);

      if (countResult.error) {
        throw countResult.error;
      }

      const syncedCount = countResult.count ?? 0;
      const updateResult = await supabase
        .from("waitlist_users")
        .update({ referral_count: syncedCount })
        .eq("id", referrer.id);

      if (updateResult.error) {
        throw updateResult.error;
      }
    }

    const [totalSignups, waitlistPosition] = await Promise.all([
      getTotalSignups(supabase, externalSignupOffset),
      getWaitlistPosition(supabase, createdUserResult.data, externalSignupOffset)
    ]);

    const response = buildWaitlistResponse(
      createdUserResult.data,
      siteUrl,
      rewardTarget,
      "created",
      totalSignups,
      waitlistPosition
    );

    return json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to join the waitlist.";
    return json({ error: message }, 500);
  }
});
