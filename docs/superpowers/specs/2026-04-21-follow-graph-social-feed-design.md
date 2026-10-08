# Follow Graph + Social Feed — Design Spec

**Date:** 2026-04-21
**Scope:** One-way follow graph, social feed tab, user profiles with verified badge, remove admin moderation queue (direct publish), suggested users for empty Following state.

---

## Overview

Legit Buys becomes a social food log. Users follow each other to see picks from people they trust. Reviews publish immediately (no moderation queue). Verified badges replace pre-screening as the trust signal.

---

## 1. Database schema

### New table: `follows`

```sql
CREATE TABLE follows (
  follower_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followee_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id)
);
```

Composite primary key prevents duplicate follows. Both columns cascade on user deletion.

**RLS policies:**
- `SELECT`: public (anyone can read follow counts and check follow status).
- `INSERT`: `auth.uid() = follower_id` — you can only follow as yourself.
- `DELETE`: `auth.uid() = follower_id` — you can only unfollow yourself.

### `profiles` table update

Add column: `verified boolean NOT NULL DEFAULT false`.

Admin sets `verified = true` per user via the new Verified Users admin panel (replaces AdminQueue). No app-level UI for users to self-verify.

### `reviews` table update

Add column: `user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL`.

- New submissions set `user_id = auth.uid()`.
- Existing reviews keep `user_id = null`. They appear in the All feed but never in any Following feed. Admins can backfill manually via Supabase SQL editor: `UPDATE reviews SET user_id = '<uuid>' WHERE submitter = '<name>'`.

### Remove `pending_reviews` table

Migration:
1. `INSERT INTO reviews SELECT <mapped columns> FROM pending_reviews` — publish everything pending.
2. `DROP TABLE pending_reviews`.

### Supabase RPCs

**`get_following_reviews(p_user_id uuid)`**
Returns approved reviews where `user_id` is in the set of accounts followed by `p_user_id`, ordered by `created_at DESC`. Respects city/category filters client-side after fetch (same as the All feed).

**`get_suggested_users(p_user_id uuid, p_limit int DEFAULT 8)`**
Returns up to `p_limit` user profiles not yet followed by `p_user_id`. Verified users first, then ordered by total upvotes across their reviews. Returns: `user_id`, `display_name`, `verified`, `review_count`, `total_upvotes`.

---

## 2. Home screen feed tabs

A single toggle pill sits between the city filter row and the card list. It reads **ALL** or **FOLLOWING** and switches state on each press.

- Default: **ALL** (existing behaviour, no change for logged-out users).
- **FOLLOWING** active: `#C8FF47` filled pill; **ALL** active: outlined pill.
- Logged-out users who tap FOLLOWING see a prompt to log in — not silently shown the All feed.
- The existing city/category/diet filters apply to both tabs.
- FOLLOWING tab with follows but no matching results (due to filters): "None of your follows have reviewed this yet."

**State in `App.jsx`:**
- `feedTab: "all" | "following"` — new state, defaults to `"all"`.
- `followingReviews` — separate state array, fetched via `get_following_reviews` when `feedTab === "following"` and user is logged in. Cached until a follow/unfollow action or manual refresh.

---

## 3. Profile page

The existing `ProfilePage` component is extended to handle two modes: own profile and another user's profile.

### Own profile
- Display name (editable inline or via a field).
- Verified badge if `profiles.verified = true`: small `✦ VERIFIED` chip in `#C8FF47`.
- Follower count · following count (tappable — future work, out of scope here).
- Their submitted reviews listed below (same cards).

### Another user's profile
- Display name + verified badge if applicable.
- Follower count · following count.
- **Follow / Unfollow button** — single button, label toggles. Calls `INSERT INTO follows` or `DELETE FROM follows`. Optimistic UI: update counts immediately, revert on error.
- Their approved reviews listed below (same cards). `onSubmitterClick` is a no-op to prevent recursive profile navigation.
- No edit controls.

### Navigation
`onSubmitterClick` in `App.jsx` (currently a no-op stub) sets new `viewingUserId` state. App renders the profile screen for that user. Back arrow or close button clears `viewingUserId`.

---

## 4. Empty Following state — suggested users

When FOLLOWING tab is active and the current user follows nobody, render a **"People to follow"** list instead of an empty screen.

- Fetched via `get_suggested_users(user.id, 8)` on mount (when Following tab is first opened with zero follows).
- Each suggestion shows: display name, verified badge if applicable, review count, Follow button.
- Once the user follows at least one person the suggestion list disappears and the feed takes over.

---

## 5. Remove moderation — direct publish

**SubmitFlow:**
- Writes directly to `reviews` with `user_id = auth.uid()`.
- No insert into `pending_reviews`.

**App.jsx:**
- Remove all `pending` state, `pending_reviews` fetches, and related logic.
- Remove `AdminQueue` import and usage.

**AdminQueue component:**
- Deleted.

**Admin role repurposed — Verified Users panel:**
- New lightweight component replacing `AdminQueue`.
- Lists all users from `profiles` with their display name and a toggle for `verified`.
- Admin can flip `verified` on/off per user.
- Only visible to `user.app_metadata.role === "admin"`.

**Edge function:**
- `notify-submission` stays — called on new submission to send notifications.

---

## 6. Rate limiting

Unchanged: localStorage 3-per-24h cap on submissions. Client-side only. Direct publish doesn't change this.

---

## Out of scope (deferred)

- Follower/following list screens (tapping counts to see who follows whom).
- Blocking/muting users.
- Notifications when someone follows you.
- Buy of the Week feature.
- Profile bio/tagline field.
- Review counts and stats on profile.

---

## Validation

1. `npm run dev` + Claude Preview.
2. Log in as two different users; follow one from the other; confirm Following feed shows their reviews.
3. Submit a new review; confirm it appears immediately in All feed without admin approval.
4. Log in as admin; confirm Verified Users panel visible; toggle a user's verified badge; confirm badge appears on their cards.
5. Check empty Following state shows suggested users for a fresh account.
6. `npm run lint` and `npm run build` clean.
