# FLUP Landing Page Visual Redesign

## Goal

Redesign the public FLUP landing page so it feels like a polished app launch page instead of an internal product shell, while keeping the existing waitlist, lookup, referral, and Supabase behavior intact.

## Approved Direction

The page should feel like a clean, modern app waitlist page:

- large hero-first composition
- refined gradients and atmospheric background
- subtle idle motion and fade-in behavior
- much less card density
- stronger use of negative space
- real FLUP brand assets in the layout

The redesign should not imitate the iOS app UI. The iOS design system is only a loose reference for type and color temperament, not layout.

## Visual Language

### Overall Mood

- airy, premium, modern
- editorial rather than dashboard-like
- soft but high-contrast
- more desirable launch page, less product console

### Color Direction

- bright off-white to pale-sky background base
- soft blue radial bloom behind the hero art
- warm peach/cream glow in lower areas for depth
- black or near-black branding from the assets should stay crisp against the light atmosphere

### Typography

- oversized headline in `Manrope`
- supporting copy in `Plus Jakarta Sans`
- strong typographic hierarchy with fewer labels and less chrome

## Layout

### Top Bar

- use the real FLUP wordmark
- no placeholder `F` mark
- keep the top bar minimal and quiet

### Hero

- near full-screen first impression
- left side: headline, subheadline, short launch promise, waitlist CTA
- right side: oversized FLUP icon composition using the uploaded assets
- keep the signup form directly in the hero instead of a detached lower card

### Supporting Content

- follow the hero with a compact three-point value strip
- keep the rest minimal
- no dashboard-like feature grid
- no fake social or fake product screenshots

### Referral/Lookup State

- keep the same underlying flow
- visually integrate the success state into the hero CTA area
- lookup should feel like a refined secondary action, not a separate utility panel

## Motion

Motion should stay subtle, premium, and CSS-only:

- hero content fades upward on load
- FLUP icon art drifts slowly at idle
- a soft sheen or glow passes across the hero visual on a long interval
- success and lookup panels reveal with opacity + translate instead of abrupt toggles

No bouncy or gimmicky motion.

## Asset Usage

Use the assets already added in `src/assets`:

- `flup-wordmark.png`
- `flup-ios-icon.png`
- `flup-ios-icon-foreground.png`

The icon treatment should feel layered and dimensional rather than pasted flat onto the page.

## Non-Goals

- no backend changes
- no referral logic changes
- no admin redesign in this pass
- no additional product sections or fake mockups

## Technical Scope

This redesign should stay focused on the public landing page:

- `src/main.js`
- `src/styles/base.css`
- `src/styles/site.css`

Supporting public-page tests can be updated as needed, but Supabase functions, schema, and admin behavior should remain unchanged.

## Success Criteria

The redesign is successful if:

- the page immediately reads as a polished app launch page
- the hero is the dominant visual moment
- the waitlist form feels premium and integrated
- the FLUP branding assets are used cleanly
- the result state still works without cluttering the page
- the page remains fast, mobile-friendly, and statically hostable on GitHub Pages
