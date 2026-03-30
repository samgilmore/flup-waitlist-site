# FLUP Landing Page And Waitlist Design

**Date:** 2026-03-30
**Status:** Approved for implementation planning
**Project Location:** `/Users/sam.gilmore/Documents/GitHub/flup-waitlist-site`

## Objective

Create a statically hosted FLUP landing page with a low-cost waitlist and referral system. The public site should run on GitHub Pages, the backend should use Supabase, and the overall system should stay simple enough to manage without traditional server hosting.

## Product Intent

This site is not a generic SaaS homepage and should not look like one. It should feel like a branded launch surface for a modern, premium relationship tool aimed at young and early-career professionals.

Approved headline and subheadline:

- `Follow up like it matters.`
- `A smarter way to keep relationships warm and your network moving.`

Audience:

- young professionals
- early-career professionals
- people intentionally building a network

## Experience Goals

- Make FLUP feel distinct from generic AI startup websites.
- Keep the page focused enough to convert without clutter.
- Make signup easy and immediate.
- Give users a clear personal referral state after signup.
- Let returning users recover their referral status with email lookup.
- Keep the waitlist reward simple: `5` successful referrals unlock early access.

## Visual Direction

The landing page should inherit the FLUP design system defined in the iOS repo while adapting it to the web.

Required brand cues:

- light mode only
- blue-led structure
- warm accent gradients used selectively
- premium but warm tone
- editorial influence in layout and typography
- avoid default AI-SaaS tropes such as floating dashboard mockups, generic purple glows, or sterile enterprise copy

Typography direction:

- `Manrope` for major headlines and branded emphasis
- `Plus Jakarta Sans` for UI copy, labels, and supporting text

Visual lane:

- hybrid of editorial premium and warm social

## Site Structure

The public site should remain a single page with four main zones:

1. Hero
2. Value proposition section
3. Waitlist signup section
4. Post-signup referral state

Supporting chrome:

- simple top brand bar with FLUP wordmark and icon
- small footer with basic placeholder legal text and contact placeholder only if needed later

No fake social links should be added before real destinations exist.

## Public Content Structure

### Hero

Purpose:

- establish the FLUP brand
- make the app category legible fast
- drive the first CTA

Content:

- approved headline
- approved subheadline
- primary CTA leading to signup
- optional supporting microcopy about launch updates and early access via referrals
- branded visual composition using uploaded app icon, foreground mark, and wordmark assets

### Value Section

Three concise pillars are enough for MVP. The section should reinforce that FLUP helps users:

- remember context
- stay consistent with follow-up
- keep momentum with the right people

### Signup Section

Form fields:

- `email` required
- `first_name` optional

Behavior:

- if the page loads with `?ref=CODE`, store that code client-side for the current signup flow
- submit to a secure backend endpoint, not directly to the database
- show clear loading, success, and error states

### Referral Result State

After signup or lookup, replace the form with a personalized card that shows:

- success or existing-user state
- referral link
- current successful referral count
- progress toward `5 referrals = early access`
- copy-to-clipboard action
- a subtle `Check your status` or `Look up your invite` path for returning users

This state should feel rewarding without turning the page into a dashboard.

## User Flows

### New Signup

1. Visitor lands on the page.
2. If a referral query param exists, the frontend preserves it through the signup flow.
3. Visitor submits email and optional first name.
4. Backend checks whether the email already exists.
5. If the email is new, backend creates the user, generates a referral code, applies valid referral attribution once, and returns referral stats.
6. Frontend shows the personalized referral card.

### Existing Email

1. Visitor submits an email already on the waitlist.
2. Backend does not create a duplicate user.
3. Backend returns the existing referral code, referral count, reward progress, and current status.
4. Frontend shows the same personalized referral card with copy tuned for an existing signup.

### Return Lookup

1. Returning user clicks a lightweight `Already joined? Check your status.` action.
2. User enters email.
3. Backend returns their referral details if the email exists.
4. Frontend restores the personalized referral card.

This flow intentionally avoids a full auth system for waitlist users.

## Reward Logic

- Joining the waitlist means users receive updates and launch notifications before the general public.
- A user earns early access once they reach `5` successful referrals.
- Reward thresholds should be configurable later, but `5` is the only active threshold for MVP.

## Architecture

Recommended architecture:

- static frontend hosted on GitHub Pages
- Supabase Postgres for persistence
- Supabase Edge Functions for signup, referral attribution, lookup, and admin APIs
- Supabase Auth for admin-only access to the hidden admin page

Why this architecture:

- GitHub Pages keeps frontend hosting free and simple
- Supabase provides database, auth, and serverless logic in one place
- Edge Functions keep business logic off the client
- the system stays easy to extend with email, webhooks, or analytics later

## Data Model

### `waitlist_users`

Core fields:

- `id`
- `email` unique and required
- `first_name`
- `referral_code` unique and required
- `referred_by_user_id` nullable foreign key to `waitlist_users.id`
- `referral_count` integer default `0`
- `status` default `waiting`
- `created_at`
- `updated_at`

Suggested future-safe status values:

- `waiting`
- `early_access`
- `invited`
- `archived`

### `referrals`

Purpose:

- create a durable record of successful credited referrals
- prevent double counting
- keep reward logic auditable

Core fields:

- `id`
- `referrer_user_id` required foreign key
- `referred_user_id` required unique foreign key
- `referral_code_used`
- `created_at`

Constraints:

- one referred signup can only generate one referral record
- one new signup can only be attributed to one referrer
- self-referrals are rejected

### `admin_profiles` or allowlist-backed admin check

For MVP, admin access should be controlled by Supabase Auth plus an allowlist check in backend logic. This can be implemented as:

- a small `admin_profiles` table keyed by auth user id
- or a hard allowlist of admin emails stored in Edge Function config

Recommendation:

- use a small table for cleaner future admin growth

## Backend Responsibilities

### Public Edge Functions

`signup-waitlist`

- validate input
- normalize email
- detect existing users
- create new user if needed
- generate referral code if needed
- validate and apply referral attribution
- increment referrer count once
- return referral link, count, and reward progress

`lookup-waitlist`

- accept email lookup
- return existing referral info when present
- return generic not-found messaging otherwise
- avoid revealing admin-only data

### Admin Edge Functions

`admin-list-users`

- require authenticated admin user
- support search, sorting, threshold filters, and pagination

`admin-update-user-status`

- require authenticated admin user
- allow status changes such as `early_access`

## Referral Logic Rules

- each user has exactly one referral code
- a valid referred signup can only credit one referrer
- self-referrals are blocked
- existing emails do not create new users or new referral credit
- referrer counts change only when a genuinely new user is created through a valid referral
- referral code validation happens server-side

## Admin Experience

The site should include a hidden admin route, but it should not be security through obscurity alone.

The real protection should be:

- Supabase Auth login for admins
- server-side allowlist check
- admin-only Edge Function endpoints

The initial admin page only needs:

- user list table
- sort by `referral_count`
- filter for thresholds such as `>= 5`
- search by email
- user detail drawer or inline panel
- manual status update control

This is intentionally lightweight and internal.

## Security And Abuse Prevention

MVP protections should stay practical:

- unique email constraint
- unique referral code constraint
- unique credited referral event per referred signup
- self-referral prevention
- server-side referral validation
- server-side signup logic only
- basic rate limiting guidance on public endpoints
- generic response copy for lookup misses where possible

Not required for MVP:

- advanced anti-fraud scoring
- device fingerprinting
- captcha unless abuse appears

## Deployment Model

Frontend:

- hosted as a static site on GitHub Pages

Backend:

- Supabase project with Postgres, Auth, and Edge Functions

Environment variables:

- public site gets only the safe public project URL and publishable or anon key
- service-role credentials remain server-side only in Supabase secrets

## Manual Setup Expectations

The implementation plan must include exact, first-time-user-friendly steps for:

- creating a new Supabase project
- understanding which dashboard settings matter for this MVP
- running SQL schema setup
- setting Edge Function secrets
- creating an admin auth user
- configuring auth redirect URLs for the hidden admin route
- connecting the frontend to Supabase
- deploying the static site to GitHub Pages

## Assets

The site will use FLUP brand assets provided from the iOS project and upcoming uploads:

- existing FLUP wordmark
- existing foreground icon
- uploaded app icons or additional marks

The implementation should keep asset paths easy to swap as the final web-ready exports are added.

## Deferred Work

Explicitly deferred from MVP:

- public product screenshot gallery unless strong assets exist
- social links until real accounts exist
- email automation as a launch requirement
- full user authentication for waitlist members
- complex dashboard analytics
- leaderboard unless it can be added with minimal noise

## Success Criteria

The design is successful if:

- the site looks recognizably FLUP rather than generic
- signup works on a fully static frontend
- referral attribution is reliable and audit-friendly
- returning users can recover their referral status by email
- admin management is simple but secure enough for MVP
- the full setup remains low-cost and understandable for a first-time Supabase user
