import { config } from "./config.js";

async function callFunction(functionName, payload) {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured yet.");
  }

  const response = await fetch(`${config.supabaseUrl}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${config.supabaseAnonKey}`
    },
    body: JSON.stringify(payload)
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error ?? "Request failed.");
  }

  return body;
}

export function lookupWaitlist(payload) {
  return callFunction("lookup-waitlist", payload);
}

export function signupWaitlist(payload) {
  return callFunction("signup-waitlist", payload);
}
