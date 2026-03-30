# FLUP Landing Page Visual Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the public FLUP landing page into a clean, premium, animated app-launch waitlist page without changing the existing waitlist or referral behavior.

**Architecture:** Keep the existing public data flow intact and limit the redesign to the public frontend shell. Rework the markup in `src/main.js`, import the new brand assets from `src/assets`, and replace the public-page CSS with a hero-first visual system that includes gradients, subtle motion, and a more integrated success/lookup state.

**Tech Stack:** Vite, plain HTML/CSS/JS, Playwright, Vitest

---

### Task 1: Lock the Public Hero Structure Around the Real Brand Assets

**Files:**
- Modify: `src/main.js`
- Modify: `tests/e2e/site-shell.spec.ts`
- Modify: `tests/e2e/public-content.spec.ts`

**Step 1: Write the failing test expectations**

Update the public-page tests so they expect:

- the FLUP wordmark image in the top bar
- a hero section with a primary headline
- a hero visual area that contains branded artwork
- the signup form embedded in the hero area instead of below it

**Step 2: Run tests to verify they fail**

Run:

```bash
npm exec playwright test tests/e2e/site-shell.spec.ts tests/e2e/public-content.spec.ts
```

Expected: FAIL because the page still renders the old shell.

**Step 3: Write the minimal markup changes**

In `src/main.js`:

- import the three assets from `src/assets`
- replace the old top bar with a wordmark-led top bar
- rebuild the hero markup into:
  - `hero-copy`
  - `hero-actions`
  - `hero-visual`
- move the waitlist form and lookup control into the hero CTA cluster
- move the value section below the hero

Keep all existing form ids and JS event hooks stable where practical.

**Step 4: Run tests to verify the new structure passes**

Run:

```bash
npm exec playwright test tests/e2e/site-shell.spec.ts tests/e2e/public-content.spec.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/main.js tests/e2e/site-shell.spec.ts tests/e2e/public-content.spec.ts
git commit -m "feat: restructure landing page hero"
```

### Task 2: Redesign the Public Visual System and Background

**Files:**
- Modify: `src/styles/base.css`
- Modify: `src/styles/site.css`

**Step 1: Write the failing visual assertions**

Extend or add Playwright checks so the public page verifies:

- the hero renders before the fold
- the branded visual is visible
- the waitlist form is visible in the hero
- the value section still exists after the hero

**Step 2: Run tests to verify they fail if needed**

Run:

```bash
npm exec playwright test tests/e2e/site-shell.spec.ts tests/e2e/public-content.spec.ts
```

Expected: FAIL if the new visual hooks/classes are not present yet.

**Step 3: Rewrite the CSS around the new design**

In `src/styles/base.css`:

- keep the font imports
- define a richer set of surface/background variables
- add a cleaner page background foundation

In `src/styles/site.css`:

- replace the card-heavy layout with a hero-first composition
- add layered background treatments
- add refined gradient and blur accents
- style the hero visual art with depth and soft shadow
- tighten the value strip into a minimal secondary section
- preserve mobile responsiveness

Do not style this like the iOS UI. Style it like a premium waitlist page.

**Step 4: Run the visual smoke checks**

Run:

```bash
npm exec playwright test tests/e2e/site-shell.spec.ts tests/e2e/public-content.spec.ts tests/e2e/status-panel.spec.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/styles/base.css src/styles/site.css tests/e2e/site-shell.spec.ts tests/e2e/public-content.spec.ts tests/e2e/status-panel.spec.ts
git commit -m "feat: redesign landing page visuals"
```

### Task 3: Add Idle Motion and Premium State Transitions

**Files:**
- Modify: `src/styles/site.css`

**Step 1: Add a focused test or visual check target**

Use existing Playwright tests to verify that the hero visual, signup area, and result state still render with the new classes present.

**Step 2: Run the relevant tests before changing motion**

Run:

```bash
npm exec playwright test tests/e2e/status-panel.spec.ts tests/e2e/site-shell.spec.ts
```

Expected: PASS baseline before motion changes.

**Step 3: Implement the motion system**

In `src/styles/site.css`, add:

- fade-up entry animations for hero content
- slow float/drift for the FLUP hero art
- subtle shimmer/glow animation on a decorative gradient layer
- smooth reveal styles for lookup and result states

Keep the animations slow, soft, and non-distracting.

**Step 4: Run the regression tests**

Run:

```bash
npm exec playwright test tests/e2e/status-panel.spec.ts tests/e2e/site-shell.spec.ts tests/e2e/public-content.spec.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/styles/site.css
git commit -m "feat: add landing page motion treatment"
```

### Task 4: Re-Skin the Waitlist Success and Lookup States

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles/site.css`
- Test: `tests/e2e/status-panel.spec.ts`

**Step 1: Write the failing test adjustments**

Update `tests/e2e/status-panel.spec.ts` so it expects the lookup interaction and result state inside the redesigned hero CTA area.

**Step 2: Run the test to verify it fails**

Run:

```bash
npm exec playwright test tests/e2e/status-panel.spec.ts
```

Expected: FAIL if the selectors or layout assumptions are outdated.

**Step 3: Implement the minimal state markup/styling changes**

In `src/main.js` and `src/styles/site.css`:

- make the lookup trigger feel like a secondary inline action
- render the result state as a premium success panel
- keep referral link, count, and progress visible
- avoid reverting to stacked utility-card styling

Do not change the underlying signup and lookup logic.

**Step 4: Run the state test**

Run:

```bash
npm exec playwright test tests/e2e/status-panel.spec.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/main.js src/styles/site.css tests/e2e/status-panel.spec.ts
git commit -m "feat: polish public waitlist states"
```

### Task 5: Final Public Experience Verification

**Files:**
- Modify as needed: any files above

**Step 1: Run unit tests**

Run:

```bash
npm run test:unit
```

Expected: PASS

**Step 2: Run end-to-end tests**

Run:

```bash
npm exec playwright test
```

Expected: PASS

**Step 3: Run production builds**

Run:

```bash
npm run build
GITHUB_ACTIONS=true GITHUB_REPOSITORY=sam/flup-waitlist-site npm run build
```

Expected: PASS and both `dist/index.html` and `dist/admin/index.html` should still be emitted.

**Step 4: Manual local review**

Run:

```bash
npm run dev
```

Visually verify:

- hero feels premium and launch-oriented
- gradients/background feel intentional
- icon idle motion is subtle
- signup area reads clearly on desktop and mobile
- result state still feels integrated

**Step 5: Commit**

```bash
git add .
git commit -m "feat: refresh landing page art direction"
```
