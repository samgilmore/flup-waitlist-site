# GitHub Pages Deployment

This repo already includes a Pages workflow at `.github/workflows/deploy-pages.yml`.

## 1. Create the GitHub repo

1. Create a new GitHub repository for this site.
2. Add it as the remote for this local repo:

```bash
git remote add origin <repo-url>
```

3. Push the branch you want to publish:

```bash
git push -u origin main
```

## 2. Add repository secrets

In GitHub, open `Settings -> Secrets and variables -> Actions` and add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Use the same values you placed in `.env.local`.

## 3. Enable Pages for Actions

1. Open `Settings -> Pages`.
2. Under `Build and deployment`, choose `GitHub Actions`.

The included workflow handles:

- `npm ci`
- `npm run build`
- artifact upload
- deploy to Pages

## 4. Understand the base path

This repo uses a Vite config that automatically sets the base path to `/<repo-name>/` when it builds inside GitHub Actions. That means standard GitHub Pages project sites work without manual edits.

Examples:

- Repo `flup-waitlist-site` becomes `https://<github-user>.github.io/flup-waitlist-site/`
- Admin route becomes `https://<github-user>.github.io/flup-waitlist-site/admin/`

If you later move to a custom domain or a user/organization root site, set `VITE_SITE_BASE=/` before building.

## 5. First production deploy

1. Push to `main`.
2. Wait for the `Deploy GitHub Pages` workflow to pass.
3. Open the live Pages URL.
4. Go back to Supabase and set the `SITE_URL` secret to that exact URL if you have not already.
5. Redeploy `signup-waitlist` and `lookup-waitlist` after updating `SITE_URL`.

## 6. Local build check with a repo base path

You can simulate the Pages build locally:

```bash
GITHUB_ACTIONS=true GITHUB_REPOSITORY=<github-user>/<repo-name> npm run build
```

If that succeeds, the built asset paths are aligned with a project-site Pages deploy.

Reference:

- [GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
