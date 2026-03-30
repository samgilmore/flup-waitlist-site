# Supabase Setup

Use this guide for either a fresh project or an existing Supabase project you want this repo to target.

## 1. Create the project

1. Sign in to [Supabase](https://supabase.com/dashboard).
2. Click `New project`.
3. Choose the `FLUP` organization.
4. Project name: choose your public-facing project name.
5. Region: `us-west-2` unless your primary audience changes.
6. Generate a strong database password and save it in a password manager.
7. Wait for the project to finish provisioning and show healthy status.

## 2. API and security settings

1. Open `Project Settings -> Data API`.
2. Leave the Data API enabled. The frontend and Edge Functions rely on it.
3. Do not rely on dashboard defaults for row-level security. This repo’s migration explicitly enables RLS on:
   - `public.waitlist_users`
   - `public.referrals`
   - `public.admin_profiles`
4. If the dashboard shows an automatic RLS option for future tables, it is not the source of truth for this project. Leave the default alone or keep it off. The migration in this repo is what matters.

Official references:

- [Data API hardening](https://supabase.com/docs/guides/api/hardening-data-api)
- [Securing your API](https://supabase.com/docs/guides/api/securing-your-api)

## 3. Copy the frontend keys

1. Open `Project Settings -> API`.
2. Copy:
   - `Project URL`
   - the public browser key
3. Put them in `.env.local`:

```bash
VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co"
VITE_SUPABASE_ANON_KEY="<your-public-browser-key>"
```

The variable name still says `ANON_KEY`, but the safer current choice is the publishable browser key if Supabase shows one.

## 4. Configure auth URLs

This MVP does not use auth for normal waitlist users. Auth is only for the hidden admin page.

1. Open `Authentication -> URL Configuration`.
2. Set `Site URL` to your final GitHub Pages URL:

```text
https://<github-user>.github.io/<repo-name>/
```

3. Add these redirect URLs for future-proofing:

```text
http://127.0.0.1:4173/*
http://localhost:4173/*
https://<github-user>.github.io/<repo-name>/*
https://<github-user>.github.io/<repo-name>/admin/*
```

Reference:

- [Auth redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)

## 5. Link the CLI to the project

Install the CLI if needed:

```bash
brew install supabase/tap/supabase
```

Then log in and link:

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

## 6. Push the database schema

From the repo root:

```bash
supabase db push --project-ref <your-project-ref>
```

That applies the migration in `supabase/migrations/20260330_000001_waitlist_schema.sql`.

## 7. Set function secrets

Set the public site URL and the referral threshold:

```bash
supabase secrets set \
  --project-ref <your-project-ref> \
  SITE_URL="https://<github-user>.github.io/<repo-name>/" \
  EARLY_ACCESS_REFERRAL_TARGET="5"
```

`SITE_URL` matters because the public functions build referral links from it when the browser does not send a usable `Origin` header.

## 8. Deploy the Edge Functions

Public functions:

```bash
supabase functions deploy signup-waitlist --project-ref <your-project-ref> --no-verify-jwt
supabase functions deploy lookup-waitlist --project-ref <your-project-ref> --no-verify-jwt
```

Admin-only functions:

```bash
supabase functions deploy admin-list-users --project-ref <your-project-ref> --no-verify-jwt
supabase functions deploy admin-update-user-status --project-ref <your-project-ref> --no-verify-jwt
```

Reference:

- [Edge Functions quickstart](https://supabase.com/docs/guides/functions/quickstart-dashboard)

## 9. Verify the core tables

Open the SQL editor and run:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('waitlist_users', 'referrals', 'admin_profiles')
order by table_name;
```

You should see all three tables.
