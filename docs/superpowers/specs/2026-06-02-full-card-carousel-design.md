# Full-Card Horizontal Carousel — Design

**Date:** 2026-06-02
**Branch:** `carousel-ui`
**Status:** Approved (pending spec review)

## Summary

Replace the feed's vertical, scroll-to-reveal card stack with a horizontal
**carousel of full-sized cards**. Each card shows all of its information at once
(rating, review, diet tags, photo, map, link, author, actions) — no tap-to-expand.
You swipe left/right to move between cards. The same full-card carousel is used on
profile pages (own profile and public profiles).

## Goals

- All card info visible instantly — remove the expand/collapse interaction.
- Horizontal swipe between cards, one card per screen with neighbors peeking.
- Consistent card design across the feed and both profile views (reuse one `Card`).
- No new dependencies; no Supabase/data-flow changes.

## Non-Goals

- No changes to filtering, feed tabs (Following/All), submission, moderation, or auth.
- No redesign of the rating band, score tiers, or theming model (keep CSS variables).

## Decisions (from brainstorming)

| Question | Decision |
|---|---|
| Map rendering | **Live iframe only for the active/centered card**; neighbors show a lightweight placeholder. |
| Card vertical overflow | **Card scrolls internally** — fills the viewport, content scrolls vertically while you swipe horizontally. |
| Carousel style | **One card per screen (~90% width), snap-to-center, edge peek** of prev/next. |
| Progress indicator | **Counter chip** (`3 / 24`). |
| Implementation | **Native CSS scroll-snap** (no library). |
| Profiles | **Option A** — reuse the real `Card` in a `Carousel`. |

## Architecture

Three units, each independently understandable:

1. **`Carousel`** — generic horizontal swipe container (layout + active-index tracking).
2. **`Card`** — presentational full card; gains a few optional props.
3. **Call sites** — feed (`App.jsx`), `ProfilePage.jsx`, `PublicProfile.jsx` wrap their
   card lists in `Carousel`.

### 1. `Carousel` component (`src/components/Carousel.jsx`)

A reusable horizontal swipe container.

- **Layout:** flex row; `overflow-x: auto`; `scroll-snap-type: x mandatory`;
  scrollbar hidden (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`).
- **Items:** each child is wrapped in a snap item at ~90% width,
  `scroll-snap-align: center`, `flex: 0 0 ~90%`. Container has horizontal
  side-padding (~5%) so the first and last cards can still center and neighbors
  **peek** at both edges.
- **Peek styling:** non-active (peeking) cards are visually de-emphasized —
  `filter: blur(2px)`, `opacity: .55`, `transform: scale(.96)`; the active/centered
  card is crisp (`blur(0)`, `opacity: 1`, `scale(1)`). Transition ~`.3s ease` on
  filter/opacity/transform gives a focus-pull as cards snap to center. (Validated in
  the HTML mockup at `docs/superpowers/specs/carousel-mockup.html`.)
- **Active index:** an `IntersectionObserver` (root = the scroll container,
  threshold ~0.6) marks the most-centered item as active. Exposes `activeIndex`.
- **Children API:** accepts an array of items via a render prop or by cloning:
  `Carousel` calls `children(activeIndex)` **or** maps over an `items` prop and
  passes `isActive={i === activeIndex}` to a render function. (Pick one in
  implementation; render-prop `({ isActive, index }) => node` per item is preferred.)
- **Counter chip:** renders `"{activeIndex + 1} / {count}"` in a small pill,
  absolutely positioned in a corner of the carousel viewport. Hidden when count ≤ 1.
- **Sizing:** the carousel fills the height of its parent container (the parent sets
  a concrete height); items are `height: 100%`.
- **Empty/loading:** `Carousel` renders nothing special for 0 items — callers keep
  their existing loading/empty placeholders and only mount `Carousel` when there is
  ≥ 1 item.

### 2. `Card` changes (`src/components/Card.jsx`)

- **Remove** the `expanded` state and the product-name tap-to-expand toggle. The
  map-pin button in the header is removed or becomes a static accent (no toggle).
- **Always render** diet tags, photo, map, and link inline (the content currently
  gated behind `expanded`).
- **Review** shows in full — drop the `WebkitLineClamp: 3` clamp.
- **Full-height layout:** card is a vertical flex column filling the carousel slot
  (`height: 100%`). The **rating band stays pinned at top** and the **footer**
  (author + actions) **stays pinned at bottom**; the **middle content area scrolls
  vertically** (`overflow-y: auto`) when it overflows.
- **Map gating — new `isActive` prop (default `true`):**
  - `isActive === true` → render the live Google Maps `<iframe>` as today.
  - `isActive === false` → render a lightweight placeholder in the same footprint
    (styled box, map-pin icon, and the existing "Open in Google Maps ↗" link). When
    the card becomes active, it swaps to the live iframe.
- **Optional handlers / actions (for profile reuse):**
  - `onUp`, `onSave` become optional — their buttons render only when the handler is
    provided. (Share button stays; it needs no external handler.)
  - New optional `extraActions` (ReactNode) rendered in the footer action group — used
    by profiles to inject **Edit** / **Unsave** buttons.
- Theming unchanged (existing CSS variables).

### 3. Feed wiring (`App.jsx`)

- The feed list container (currently `padding:"8px 12px"; display:flex; column; gap:10`,
  line ~345) gets a **concrete height** so the carousel and internal card-scroll work
  — e.g. `height: calc(100dvh - <top bar> - <bottom action bar>)`. (Use `100dvh` for
  mobile browser chrome; measure the existing top filter/tab bar and bottom action bar
  heights during implementation.)
- Replace the `filtered.map(r => <Card .../>)` (line ~364) with:
  `<Carousel>` whose per-item render returns the same `<Card>`, passing
  `isActive` from the carousel and the existing `onUp/onSave/onSubmitterClick`/saved/upped
  props unchanged.
- `loading`, empty, and `SuggestedUsers` states render **above/instead of** the carousel
  exactly as now (only mount `Carousel` when `filtered.length > 0`).

### 4. Profiles — Option A (`ProfilePage.jsx`, `PublicProfile.jsx`)

Reuse the real `Card` in a `Carousel`.

**`ProfilePage.jsx`**
- Remove the local `ReviewCard` *display* markup; render reviews through `Card` inside a
  `Carousel`. Two carousels remain where there are two lists today (My Reviews, Saved).
- **Editing stays where it is:** keep `editingId`, `editFields`, `startEdit`, `saveEdit`
  and the inline edit form. In the carousel item render, when `editingId === r.id`,
  render the **existing edit form** in place of `<Card>`; otherwise render `<Card>`.
- Inject profile actions via `Card`'s `extraActions`:
  - Own profile → **Edit** button (calls `startEdit(r)`).
  - Saved list → **Unsave** button (calls the existing unsave handler).
- On profiles, `onUp`/`onSave` are omitted (no upvote/save of your own/saved items),
  so those buttons don't render; the share button remains.
- The profile container that holds a carousel needs a concrete height (same approach as
  the feed). The surrounding profile chrome (header, profile info block, tabs) is unchanged.

**`PublicProfile.jsx`**
- Replace the inline read-only card markup with `Card` inside a `Carousel`, read-only
  (no `onUp`/`onSave`/`extraActions`). Note: this **adds** map/photo/tags/link display to
  public profile cards (they're omitted today) — an accepted, intentional improvement for
  consistency.

## Data flow

Unchanged. `Card` remains presentational. The only new prop is `isActive`, derived from
the `Carousel`'s active index. Edit/save/unsave/upvote logic stays in the existing owners
(`App.jsx`, `ProfilePage.jsx`).

## Edge cases & error handling

- **Single card:** carousel still works; counter chip hidden when count ≤ 1.
- **Many live maps:** prevented by design — only the active card mounts an iframe.
- **Tall cards on small screens:** internal vertical scroll; pinned band + footer keep
  identity/actions glanceable.
- **Image/map load failure:** existing `onError`/`loading="lazy"` behavior preserved.
- **Editing in a carousel item:** swapping to the edit form must not change item width
  (keeps snap stable); edit form renders within the same snap slot.
- **Accessibility:** scroll-snap container is keyboard/scroll accessible; counter chip is
  decorative. Map-pin toggle removal means one fewer interactive control.

## Testing / verification

- `npm run lint` and `npm run build` clean.
- Manual (mobile viewport): feed swipes one card at a time, snaps centered, neighbors peek;
  counter updates; only the centered card shows a live map; tall card scrolls internally
  while horizontal swipe still works; band + footer pinned.
- Own profile: Edit opens inline form in the slot, Save persists, card returns. Saved tab:
  Unsave removes the card. Public profile: read-only cards show full info, no action buttons.
- Light/dark theme both render correctly.

## Out of scope / future

- Drag-physics polish (momentum, rubber-banding) beyond native scroll-snap.
- Deep-link to a specific card scroll position.
