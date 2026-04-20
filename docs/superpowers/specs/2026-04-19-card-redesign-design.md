# Card Redesign — Design Spec

**Date:** 2026-04-19
**Scope:** Redesign `src/components/Card.jsx` so the rating and review are the card's hero content, Letterboxd-style. Convert the app's theming from the prop-threaded `T` object to CSS custom properties. Land both changes in the same pass.

This is the first in a planned series of changes (follow graph, social feed, buy of the week). Those are **out of scope** here but the card's API leaves a tap target for a future submitter-profile route.

---

## Motivation

Today's card treats the product name as the hero (17pt serif), tucks the rating in the top-right corner, and sets the review as small italic body text. The ask: flip that — rating and review read first, everything else second.

A second, long-standing pain point is the `T` theme object threaded through every component as a `theme` prop. Color work repeatedly breaks because each component duplicates conditional styling logic. This redesign is the natural moment to retire `T` and switch to CSS variables.

---

## Collapsed card — visual hierarchy

Top to bottom:

1. **Rating band** (full-width, colored by score)
   - Content: score label + score marks, e.g. `BIG LEGIT ●●○`
   - Score color comes from `SCORE_COLORS` in `src/constants.js`
   - **Certified (score 3) + pricey** → existing holo animated gradient is preserved on the band
   - **Pass (score 0)** → outlined-only variant (border + label in score color, no fill) so the card doesn't feel shouty
2. **Product name** — caption-sized line directly under the band (smaller than today's 17pt; this is no longer the hero)
3. **Review quote** — large display text, `LBReview` italic serif kept, capped at ~3 lines with a `…more` affordance; full text visible on expand
4. **Metadata line** — `price · category chip · location`, small monospace
5. **Footer** — submitter name (tap target, see Submitter click below) · save button · upvote button

### In expand (in-place, on tap)

- Image
- Map iframe + "Open in Google Maps" link
- Link preview block
- Diet tags

### Submitter click

Footer submitter becomes a tap target. `Card` exposes `onSubmitterClick(submitterId)`. `App.jsx` wires it to a no-op (or temporary alert) for now. The real profile route ships with the follow-graph work later. The click target lands now so we don't re-plumb the card later.

---

## Theming rewrite — CSS variables

**Drop the `T` prop entirely.**

- New file: `src/theme.css`. Defines both palettes as CSS custom properties under `[data-theme="light"]` and `[data-theme="dark"]`. Keys mirror the worktree's current `T` object (`--bg`, `--surface`, `--surface2`, `--border`, `--border2`, `--text`, `--text-mid`, `--text-dim`, `--pill`, `--card-bg`, `--sheet-bg`, `--sheet-border`). Score colors exposed as `--score-0` through `--score-3`. No new accent keys.
- `App.jsx` keeps the `darkMode` state and the theme-toggle button. On toggle it sets `document.documentElement.dataset.theme = 'dark' | 'light'` and persists to localStorage. No more `T` object constructed in `App`.
- Every component that currently takes `theme={T}` is converted in the same PR:
  - `Card`, `Sheet`, `Pills`, `FilterPanel`, `MenuPanel`, `ProfilePage`, `SubmitFlow`, `AdminQueue`, `UserAuth`, `Walkthroughs`, `ScoreSelector`.
  - Inline styles change from `{ background: T.bg }` to `{ background: "var(--bg)" }`.
  - The `theme={T}` prop is dropped from the JSX at call sites.
  - Per-component conditional color logic (e.g. `isDark ? A : B`) is deleted — CSS vars handle that.
- `src/main.jsx` (or the top of `App.jsx`) imports `theme.css` once.

**Why one PR for the full conversion:** a partial conversion leaves two theming systems in parallel, which is worse than either alone. The conversion is mechanical.

---

## Component structure

### Files

- `src/theme.css` — new; palette definitions.
- `src/components/Card.jsx` — rewrite; new layout; no `theme` prop.
- `src/components/Card/RatingBand.jsx` — new subcomponent; owns the band style, holo animation, and Pass outlined variant. Props: `score: 0 | 1 | 2 | 3`, `priceRange: 'cheap' | 'fair' | 'pricey'`.
- `src/components/ScoreSelector.jsx` — keep as-is for the submit flow. No longer rendered inside `Card`.
- All other listed components — touched only for the `T` → CSS-var conversion.

### Card public API

```jsx
<Card
  r={review}             // same shape as today (reviews table row)
  saved={boolean}
  upped={boolean}
  onSave={(id) => void}
  onUp={(id) => void}
  onSubmitterClick={(submitterId) => void}  // new
/>
```

`theme` prop removed.

---

## Out of scope (deferred)

- Follow graph (tables, RLS, follow/unfollow UI)
- Social feed (home screen sourced from followed users)
- Buy of the Week
- Profile page route (the click target is wired; the route isn't)
- Short-form "tagline" schema field
- Unit tests (repo has none; introducing a harness isn't part of this pass)

---

## Validation

1. `npm run dev` from `Legit-Buys-main/legit-buys/`, open Claude Preview against the local server.
2. Iterate the card visually against three seeded review states:
   - Certified (score 3) + pricey → holo band renders
   - Pass (score 0) → outlined band, not filled
   - Standard (score 1 or 2) → filled colored band in score color
3. Toggle light/dark via the existing theme button. Confirm every converted component reads correctly and no stale `T.x` reference crashes.
4. `npm run lint` clean.
5. `npm run build` clean.

---

## Open questions

None. All design choices resolved during brainstorming.
