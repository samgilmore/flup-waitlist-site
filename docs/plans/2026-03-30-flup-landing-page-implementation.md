# FLUP Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a statically hosted FLUP launch site with a waitlist, referral tracking, return-user lookup, and a hidden admin page backed by Supabase.

**Architecture:** Use a Vite vanilla JavaScript frontend so the output remains static and GitHub Pages-friendly while still giving clean module structure and easy local development. Use Supabase Postgres for persistence, Edge Functions for all signup and admin logic, and Supabase Auth plus an admin allowlist for the hidden admin page.

**Tech Stack:** Vite, vanilla JavaScript, CSS, Supabase Postgres, Supabase Edge Functions, Supabase Auth, Deno tests, Vitest, Playwright

---

### Task 1: Bootstrap The Static Site And Tooling

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `index.html`
- Create: `admin/index.html`
- Create: `src/main.js`
- Create: `src/admin.js`
- Create: `src/styles/base.css`
- Create: `src/styles/site.css`
- Create: `src/styles/admin.css`
- Create: `src/lib/config.js`
- Create: `public/assets/.gitkeep`
- Create: `tests/e2e/site-shell.spec.ts`

**Step 1: Write the failing shell test**

```ts
import { test, expect } from "@playwright/test";

test("public shell shows FLUP hero and waitlist form", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Follow up like it matters." })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByRole("button", { name: /join/i })).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `npm exec playwright test tests/e2e/site-shell.spec.ts`
Expected: FAIL because the project files and dev server config do not exist yet.

**Step 3: Add the minimal static app scaffold**

Create a Vite vanilla app with:

- public root route for the landing page
- `/admin/` route for the future hidden admin page
- shared `src/lib/config.js` that reads:

```js
export const config = {
  siteBaseUrl: import.meta.env.BASE_URL,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};
```

**Step 4: Run the shell test again**

Run: `npm install && npm exec playwright install --with-deps && npm exec playwright test tests/e2e/site-shell.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "chore: bootstrap static landing site"
```

### Task 2: Build The FLUP Public Page Layout And Brand System

**Files:**
- Modify: `index.html`
- Modify: `src/main.js`
- Modify: `src/styles/base.css`
- Modify: `src/styles/site.css`
- Create: `src/lib/content.js`
- Create: `tests/e2e/public-content.spec.ts`

**Step 1: Write the failing page-content test**

```ts
import { test, expect } from "@playwright/test";

test("landing page shows hero, value section, signup, and lookup path", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("A smarter way to keep relationships warm and your network moving.")).toBeVisible();
  await expect(page.getByText(/remember context/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /join the waitlist/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /check your status/i })).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `npm exec playwright test tests/e2e/public-content.spec.ts`
Expected: FAIL because the sections and copy are not rendered yet.

**Step 3: Implement the layout**

Build a single-page structure with:

- top brand bar
- hero with distinctive FLUP composition
- three-point value section
- waitlist section
- hidden-by-default lookup panel
- footer placeholder

Add tokenized CSS variables instead of ad hoc colors:

```css
:root {
  --flup-ink: #10233f;
  --flup-blue: #2f6df6;
  --flup-blue-deep: #163a86;
  --flup-mist: #eef4ff;
  --flup-warm: #ff8d5d;
  --flup-warm-soft: #ffd3bf;
  --flup-surface: #ffffff;
  --flup-border: rgba(16, 35, 63, 0.1);
}
```

Keep the composition editorial and warm, not SaaS-generic.

**Step 4: Run the content test**

Run: `npm exec playwright test tests/e2e/public-content.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add index.html src tests
git commit -m "feat: add branded landing page shell"
```

### Task 3: Implement Public Waitlist And Referral UI Behavior

**Files:**
- Modify: `index.html`
- Modify: `src/main.js`
- Create: `src/lib/api.js`
- Create: `src/lib/referral-state.js`
- Create: `src/lib/storage.js`
- Create: `tests/unit/referral-state.test.js`
- Create: `tests/unit/storage.test.js`

**Step 1: Write the failing unit tests**

```js
import { describe, it, expect } from "vitest";
import { getRewardProgress, getReferralCodeFromUrl } from "../../src/lib/referral-state";

describe("referral-state", () => {
  it("reads a referral code from the URL", () => {
    expect(getReferralCodeFromUrl("https://flup.app/?ref=ABC123")).toBe("ABC123");
  });

  it("calculates progress toward five referrals", () => {
    expect(getRewardProgress(2, 5)).toEqual({ current: 2, target: 5, percent: 40, remaining: 3 });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm exec vitest run tests/unit/referral-state.test.js tests/unit/storage.test.js`
Expected: FAIL because the modules do not exist yet.

**Step 3: Implement the public state flow**

Add:

- referral query param capture
- submit handler for waitlist signup
- email lookup handler
- success card rendering
- copy-to-clipboard button
- local storage for the most recent successful lookup or signup

The API module should stay thin:

```js
export async function signupWaitlist(payload) {
  return fetch(`${config.supabaseUrl}/functions/v1/signup-waitlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${config.supabaseAnonKey}`,
    },
    body: JSON.stringify(payload),
  });
}
```

**Step 4: Run unit tests and the end-to-end shell tests**

Run: `npm exec vitest run tests/unit/referral-state.test.js tests/unit/storage.test.js && npm exec playwright test tests/e2e/site-shell.spec.ts tests/e2e/public-content.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add index.html src tests
git commit -m "feat: add waitlist and referral UI states"
```

### Task 4: Add Supabase Schema, RLS, And Shared Referral Logic

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/20260330_000001_waitlist_schema.sql`
- Create: `supabase/functions/_shared/cors.ts`
- Create: `supabase/functions/_shared/referral.ts`
- Create: `supabase/functions/_shared/referral_test.ts`
- Create: `supabase/functions/_shared/types.ts`

**Step 1: Write the failing Deno test**

```ts
import { assertEquals, assertThrows } from "jsr:@std/assert";
import { normalizeEmail, buildReferralProgress, validateReferralAttribution } from "./referral.ts";

Deno.test("normalizeEmail trims and lowercases email", () => {
  assertEquals(normalizeEmail(" Sam@Example.com "), "sam@example.com");
});

Deno.test("buildReferralProgress caps percent at 100", () => {
  assertEquals(buildReferralProgress(7, 5).percent, 100);
});

Deno.test("validateReferralAttribution rejects self-referrals", () => {
  assertThrows(() => validateReferralAttribution("sam@example.com", "sam@example.com"));
});
```

**Step 2: Run test to verify it fails**

Run: `deno test supabase/functions/_shared/referral_test.ts`
Expected: FAIL because the shared module does not exist yet.

**Step 3: Implement the shared helper and migration**

The migration should create:

- `waitlist_users`
- `referrals`
- `admin_profiles`
- indexes on `email`, `referral_code`, and `referral_count desc`
- trigger to maintain `updated_at`

Enable RLS explicitly and do not rely only on dashboard defaults:

```sql
alter table public.waitlist_users enable row level security;
alter table public.referrals enable row level security;
alter table public.admin_profiles enable row level security;
```

Public direct table access should be denied by default. Edge Functions will use the service role for server-side operations.

**Step 4: Run the Deno test**

Run: `deno test supabase/functions/_shared/referral_test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add supabase
git commit -m "feat: add waitlist schema and shared referral logic"
```

### Task 5: Implement Signup And Lookup Edge Functions

**Files:**
- Create: `supabase/functions/signup-waitlist/index.ts`
- Create: `supabase/functions/lookup-waitlist/index.ts`
- Create: `tests/smoke/signup-and-lookup.sh`
- Create: `tests/fixtures/signup-payload.json`

**Step 1: Write the failing smoke script**

```bash
#!/usr/bin/env bash
set -euo pipefail

SIGNUP_RESPONSE=$(curl -s -X POST "http://127.0.0.1:54321/functions/v1/signup-waitlist" \
  -H "Content-Type: application/json" \
  -d @tests/fixtures/signup-payload.json)

echo "$SIGNUP_RESPONSE" | jq -e '.referralCode and .referralLink and .referralCount == 0'
```

**Step 2: Run the script to verify it fails**

Run: `bash tests/smoke/signup-and-lookup.sh`
Expected: FAIL because the functions do not exist or are not serving.

**Step 3: Implement the functions**

`signup-waitlist` must:

- validate request body
- normalize email
- return existing user payload if email already exists
- generate unique referral code
- resolve optional referral code to referrer
- reject self-referrals
- insert user and referral record in a single transaction pattern
- increment `referral_count` only for a genuinely new referred signup

`lookup-waitlist` must:

- accept email
- return referral info for existing users
- return a generic not-found response for missing users
- avoid exposing internal-only columns

Response shape:

```json
{
  "status": "existing",
  "email": "sam@example.com",
  "firstName": "Sam",
  "referralCode": "ABC123",
  "referralLink": "https://example.com/?ref=ABC123",
  "referralCount": 2,
  "rewardTarget": 5,
  "rewardUnlocked": false
}
```

**Step 4: Serve locally and rerun smoke**

Run:

```bash
supabase start
supabase db reset
supabase functions serve signup-waitlist --env-file .env.local
supabase functions serve lookup-waitlist --env-file .env.local
bash tests/smoke/signup-and-lookup.sh
```

Expected: PASS

**Step 5: Commit**

```bash
git add supabase tests
git commit -m "feat: add public waitlist edge functions"
```

### Task 6: Build The Hidden Admin Page And Protected Admin APIs

**Files:**
- Modify: `admin/index.html`
- Modify: `src/admin.js`
- Create: `src/lib/admin-api.js`
- Create: `supabase/functions/admin-list-users/index.ts`
- Create: `supabase/functions/admin-update-user-status/index.ts`
- Create: `tests/unit/admin-auth.test.js`
- Create: `tests/e2e/admin-shell.spec.ts`

**Step 1: Write the failing tests**

```js
import { describe, it, expect } from "vitest";
import { isEligibleForEarlyAccess } from "../../src/lib/referral-state";

describe("admin reward helpers", () => {
  it("marks users eligible at five referrals", () => {
    expect(isEligibleForEarlyAccess(5, 5)).toBe(true);
  });
});
```

```ts
import { test, expect } from "@playwright/test";

test("admin shell shows login gate", async ({ page }) => {
  await page.goto("/admin/");
  await expect(page.getByText(/admin sign in/i)).toBeVisible();
});
```

**Step 2: Run tests to verify they fail**

Run: `npm exec vitest run tests/unit/admin-auth.test.js && npm exec playwright test tests/e2e/admin-shell.spec.ts`
Expected: FAIL because the admin shell is not implemented.

**Step 3: Implement admin auth and data flow**

Frontend:

- use Supabase JS client only on the admin page for admin sign-in state
- require email/password auth
- call admin Edge Functions after auth succeeds
- render filters for search, status, and `5+ referrals`

Backend:

- `admin-list-users` verifies auth token, loads admin profile, and returns paginated user rows
- `admin-update-user-status` verifies auth token and updates `waitlist_users.status`

Minimal admin columns:

- email
- first_name
- referral_count
- status
- referred_by_user_id
- created_at

**Step 4: Run the tests**

Run: `npm exec vitest run tests/unit/admin-auth.test.js && npm exec playwright test tests/e2e/admin-shell.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add admin src supabase tests
git commit -m "feat: add protected admin waitlist tools"
```

### Task 7: Write First-Time-User Setup Docs And Deployment Instructions

**Files:**
- Create: `README.md`
- Create: `docs/setup/supabase.md`
- Create: `docs/setup/github-pages.md`
- Create: `docs/setup/admin-access.md`
- Create: `docs/setup/assets.md`

**Step 1: Write the docs that should fail a completeness audit**

Draft the files with TODO placeholders for:

- Supabase project creation
- dashboard settings
- SQL migration
- function deployment
- admin user creation
- GitHub Pages deployment
- asset export instructions

**Step 2: Run a completeness check to prove the docs are still incomplete**

Run: `rg -n "TODO" README.md docs/setup`
Expected: FINDS TODO markers

**Step 3: Replace placeholders with exact instructions**

`docs/setup/supabase.md` must include exact first-run steps:

1. Sign into Supabase and click `New project`.
2. Choose the target organization.
3. Project name: `flup-waitlist-site-prod` or another environment-specific name.
4. Generate and save the database password in a password manager.
5. Pick the region closest to the primary audience.
6. Keep the Data API enabled.
7. Do not assume dashboard defaults are enough for security; run the provided SQL migration to enable RLS explicitly.
8. In `Project Settings -> API`, copy:
   - Project URL
   - publishable or anon key for the frontend
9. In `Authentication -> URL Configuration`, add the production GitHub Pages URL and local dev URL.
10. In `Authentication -> Users`, create the first admin user manually.
11. Insert the admin into `admin_profiles`.
12. Deploy Edge Functions with `supabase functions deploy`.
13. Set function secrets with:

```bash
supabase secrets set \
  SITE_URL="https://<github-user>.github.io/<repo-name>/" \
  EARLY_ACCESS_REFERRAL_TARGET="5" \
  ADMIN_ALLOWED_EMAILS="you@example.com"
```

`docs/setup/github-pages.md` must include:

- creating a GitHub repo
- setting the Vite base path for a project site
- pushing the repo
- enabling GitHub Pages from GitHub Actions or static `dist/`
- verifying the built site under the final Pages URL

`docs/setup/admin-access.md` must include:

- how to create or reset the admin user
- how to add future admins
- how to hide the admin link from the public UI while keeping the route accessible directly

`docs/setup/assets.md` must include:

- where to place uploaded icons, wordmark, and any future mockups
- required file names or the asset manifest strategy
- font-loading guidance for `Manrope` and `Plus Jakarta Sans`

**Step 4: Verify docs and production build**

Run:

```bash
rg -n "TODO" README.md docs/setup && exit 1 || true
npm run build
npm exec playwright test
```

Expected: no TODO markers, production build succeeds, test suite passes

**Step 5: Commit**

```bash
git add README.md docs
git commit -m "docs: add setup and deployment guides"
```

### Task 8: Final Verification And Launch Readiness Pass

**Files:**
- Modify as needed: any files touched above

**Step 1: Run the full verification suite**

Run:

```bash
npm run build
npm exec vitest run
npm exec playwright test
deno test supabase/functions/_shared/referral_test.ts
```

Expected: all commands pass

**Step 2: Run local manual smoke checks**

Run:

```bash
npm run dev
supabase start
supabase db reset
supabase functions serve signup-waitlist --env-file .env.local
supabase functions serve lookup-waitlist --env-file .env.local
supabase functions serve admin-list-users --env-file .env.local
supabase functions serve admin-update-user-status --env-file .env.local
```

Manually verify:

- signup with no referral
- signup with valid referral
- duplicate signup returns existing data
- lookup returns referral card
- admin sign-in works
- `5` referrals shows early-access eligibility

**Step 3: Fix any issues uncovered**

Only make targeted corrections discovered in verification.

**Step 4: Commit the final implementation state**

```bash
git add .
git commit -m "feat: ship flup waitlist landing site"
```

**Step 5: Prepare GitHub Pages and Supabase deployment**

Run:

```bash
git remote add origin <repo-url>
git push -u origin main
supabase link --project-ref <project-ref>
supabase db push
supabase functions deploy signup-waitlist
supabase functions deploy lookup-waitlist
supabase functions deploy admin-list-users
supabase functions deploy admin-update-user-status
```
