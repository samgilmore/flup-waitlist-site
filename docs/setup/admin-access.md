# Admin Access

The public site does not expose an admin link. The admin UI lives at `/admin/` and is protected by Supabase Auth plus the `admin_profiles` table.

## 1. Create the first admin auth user

1. Open `Authentication -> Users` in Supabase.
2. Click `Add user`.
3. Create an email/password user for yourself.
4. Mark the user confirmed if the dashboard asks.

This user is only for admin access. Normal waitlist users do not need auth accounts.

## 2. Add that user to `admin_profiles`

Open the SQL editor and run:

```sql
insert into public.admin_profiles (auth_user_id, email)
select id, email
from auth.users
where email = 'you@example.com'
on conflict (auth_user_id)
do update set email = excluded.email;
```

Replace `you@example.com` with the real admin email.

## 3. Sign in to the admin route

1. Open your site’s hidden admin URL:

```text
https://<github-user>.github.io/<repo-name>/admin/
```

2. Sign in with the email/password from step 1.
3. You can now:
   - search by email
   - filter to `5+` or `10+` referrals
   - review statuses
   - mark users as `early_access`, `invited`, or `archived`

## 4. Add more admins later

Repeat the same two-step process for each admin:

1. Create the auth user in `Authentication -> Users`
2. Insert that user into `public.admin_profiles`

## 5. Useful direct SQL queries

All waitlist users sorted by referrals:

```sql
select email, first_name, referral_count, status, created_at
from public.waitlist_users
order by referral_count desc, created_at asc;
```

Users who reached the early-access threshold:

```sql
select email, first_name, referral_count, status
from public.waitlist_users
where referral_count >= 5
order by referral_count desc, created_at asc;
```

Manually grant early access:

```sql
update public.waitlist_users
set status = 'early_access'
where email = 'friend@example.com';
```

## 6. Hiding the route

The route is intentionally not linked from the public landing page. That is enough for low-friction obscurity, but the real protection is auth plus `admin_profiles`.

If you want a less obvious path later, rename the `admin/` folder and update the deployment docs and auth URLs to match.
