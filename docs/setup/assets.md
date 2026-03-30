# Assets And Brand Files

The site is ready for brand assets, but it currently uses a text-based FLUP mark until you drop in the final files.

## Folder Layout

Use these folders:

- `public/assets/brand/`
- `public/assets/icons/`
- `public/assets/mockups/`
- `public/assets/fonts/` if you later self-host fonts

## Recommended File Names

Use stable names so the frontend swap is easy later:

- `public/assets/brand/wordmark.svg`
- `public/assets/brand/app-icon.png`
- `public/assets/brand/foreground-icon.png`

If you add future product screenshots or promotional art:

- `public/assets/mockups/hero-shot.png`
- `public/assets/mockups/phone-stack.png`

## Current Font Setup

The site currently loads:

- `Manrope` for display moments
- `Plus Jakarta Sans` for UI copy

They are loaded from Google Fonts in `src/styles/base.css`.

If you want to self-host later:

1. Put `.woff2` files in `public/assets/fonts/`
2. Replace the Google Fonts import in `src/styles/base.css` with local `@font-face` rules

## When You Upload Brand Assets

Once the assets are ready, the next frontend pass should:

1. Replace the text `FLUP` lockup in `src/main.js`
2. Replace the fallback `F` brand mark in the header
3. Optionally add the wordmark to the hero and footer
4. Keep the layout weight and spacing as-is so the page does not slide back into generic SaaS styling
