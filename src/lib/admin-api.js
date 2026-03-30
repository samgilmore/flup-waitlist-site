import { createClient } from "@supabase/supabase-js";
import { config } from "./config.js";

export function createAdminClient() {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return {
      missingConfig: true
    };
  }

  return createClient(config.supabaseUrl, config.supabaseAnonKey);
}

function assertConfigured(client) {
  if (client.missingConfig) {
    throw new Error("Supabase environment variables are not configured yet.");
  }
}

function getRuntimeConfig(runtimeConfig = config) {
  return runtimeConfig;
}

async function getAccessToken(client) {
  assertConfigured(client);
  const sessionResult = await client.auth.getSession();
  const accessToken = sessionResult.data.session?.access_token;

  if (!accessToken) {
    throw new Error("Admin session not found.");
  }

  return accessToken;
}

export async function fetchAdminWaitlist(client, params = {}, runtimeConfig = config) {
  const accessToken = await getAccessToken(client);
  const { supabaseAnonKey, supabaseUrl } = getRuntimeConfig(runtimeConfig);

  const url = new URL(`${supabaseUrl}/functions/v1/admin-list-users`);
  if (params.search) {
    url.searchParams.set("search", params.search);
  }
  if (params.threshold) {
    url.searchParams.set("threshold", params.threshold);
  }
  if (params.full) {
    url.searchParams.set("full", "true");
  }

  const response = await fetch(url.toString(), {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`
    }
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error ?? "Unable to load admin waitlist data.");
  }

  return body.rows ?? [];
}

export async function updateAdminUserStatus(client, payload, runtimeConfig = config) {
  const accessToken = await getAccessToken(client);
  const { supabaseAnonKey, supabaseUrl } = getRuntimeConfig(runtimeConfig);
  const response = await fetch(`${supabaseUrl}/functions/v1/admin-update-user-status`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error ?? "Unable to update the waitlist user.");
  }

  return body.row;
}

export async function signInAdmin(client, credentials) {
  assertConfigured(client);
  const result = await client.auth.signInWithPassword(credentials);

  if (result.error) {
    throw result.error;
  }

  return result.data;
}

export async function signOutAdmin(client) {
  if (client.missingConfig) {
    return;
  }

  await client.auth.signOut();
}
