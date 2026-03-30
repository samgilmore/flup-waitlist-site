# FLUP Waitlist Site

Static landing page + waitlist referral MVP for FLUP.

The frontend is a Vite-built static site meant for GitHub Pages. Supabase handles the database, referral attribution, and hidden admin tools through Edge Functions.

## Stack

- Frontend: Vite, plain HTML/CSS/JS
- Hosting: GitHub Pages
- Backend: Supabase Edge Functions
- Database: Supabase Postgres
- Admin access: Supabase Auth + `admin_profiles`

## Project Structure

```text
.
├── admin/
│   └── index.html
├── docs/
│   ├── plans/
│   └── setup/
├── public/
│   └── assets/
├── src/
│   ├── lib/
│   ├── styles/
│   ├── admin.js
│   └── main.js
├── supabase/
│   ├── functions/
│   └── migrations/
├── tests/
│   ├── e2e/
│   ├── fixtures/
│   ├── smoke/
│   └── unit/
└── .github/
    └── workflows/
```

## Local Development

1. Install dependencies:

```bash
npm ci
```

2. Create a local env file from `.env.example`:

```bash
cp .env.example .env.local
```

3. Fill in:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Use the public browser key from Supabase. If your project shows both a publishable key and a legacy anon key, prefer the publishable key.

4. Start the frontend:

```bash
npm run dev
```

5. Run checks:

```bash
npm run test:unit
npm exec playwright test
npm run build
```

## Setup Guides

- [Supabase setup](./docs/setup/supabase.md)
- [GitHub Pages deployment](./docs/setup/github-pages.md)
- [Admin access](./docs/setup/admin-access.md)
- [Assets and brand files](./docs/setup/assets.md)
