export const config = {
  siteBaseUrl: import.meta.env.BASE_URL,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""
};
