-- saved_reviews: per-user bookmarks of feed cards.
-- Run each block in Supabase SQL editor separately if the whole script errors.

-- ── 1. Table ──
CREATE TABLE IF NOT EXISTS saved_reviews (
  user_id    uuid   NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id  bigint NOT NULL REFERENCES reviews(id)    ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, review_id)
);

-- ── 2. Index ──
CREATE INDEX IF NOT EXISTS saved_reviews_user_idx ON saved_reviews (user_id);

-- ── 3. RLS ──
ALTER TABLE saved_reviews ENABLE ROW LEVEL SECURITY;

-- ── 4. Policies ──
CREATE POLICY saved_reviews_select_own ON saved_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY saved_reviews_insert_own ON saved_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY saved_reviews_delete_own ON saved_reviews FOR DELETE USING (auth.uid() = user_id);
