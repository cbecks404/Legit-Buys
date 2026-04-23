-- Follow graph migration for Legit Buys
-- Run in the Supabase SQL editor (Dashboard → SQL Editor → New query)
-- Review the pending_reviews INSERT column list before running — adjust if your schema differs.


-- ============================================================
-- 1. follows table
--    Stores the directed follow relationships between users.
-- ============================================================

CREATE TABLE follows (
  follower_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followee_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id)
);

-- Enable Row Level Security
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Anyone can read follow relationships (public feed / follower counts)
CREATE POLICY "follows_select_public"
  ON follows
  FOR SELECT
  USING (true);

-- A user may only follow as themselves
CREATE POLICY "follows_insert_own"
  ON follows
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- A user may only unfollow relationships they created
CREATE POLICY "follows_delete_own"
  ON follows
  FOR DELETE
  USING (auth.uid() = follower_id);


-- ============================================================
-- 2. profiles — add verified column
--    Marks accounts that have been verified by admins.
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false;


-- ============================================================
-- 3. reviews — add user_id column
--    Links each review back to the auth user who submitted it.
-- ============================================================

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;


-- ============================================================
-- 4. pending_reviews → reviews: publish all pending picks,
--    then drop the pending_reviews table.
--
-- Adjust column names to match your actual pending_reviews schema if needed before running.
-- ============================================================

-- First: publish all pending reviews as approved
INSERT INTO reviews (
  product, category, categories, rating, review, submitter,
  where_field, price, price_range, link, map_query, image_url,
  city, diet_tags, user_id, submitter_email, verified, upvotes, date
)
SELECT
  product, category, categories, rating, review, submitter,
  "where", price, price_range, link, map_query, image_url,
  city, diet_tags, user_id, submitter_email, verified, 0, date
FROM pending_reviews;

-- Then drop it
DROP TABLE IF EXISTS pending_reviews;


-- ============================================================
-- 5. get_following_reviews(p_user_id)
--    Returns all reviews posted by users that p_user_id follows,
--    ordered newest first.
-- ============================================================

CREATE OR REPLACE FUNCTION get_following_reviews(p_user_id uuid)
RETURNS SETOF reviews
LANGUAGE sql
STABLE
AS $$
  SELECT r.*
  FROM reviews r
  WHERE r.user_id IN (
    SELECT followee_id FROM follows WHERE follower_id = p_user_id
  )
  ORDER BY r.created_at DESC;
$$;


-- ============================================================
-- 6. get_suggested_users(p_user_id, p_limit)
--    Returns up to p_limit users that p_user_id does not yet
--    follow, ranked by verified status then total upvotes.
-- ============================================================

CREATE OR REPLACE FUNCTION get_suggested_users(p_user_id uuid, p_limit int DEFAULT 8)
RETURNS TABLE (
  user_id       uuid,
  display_name  text,
  verified      boolean,
  review_count  bigint,
  total_upvotes bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id                                AS user_id,
    p.display_name,
    p.verified,
    COUNT(r.id)                         AS review_count,
    COALESCE(SUM(r.upvotes), 0)         AS total_upvotes
  FROM profiles p
  LEFT JOIN reviews r ON r.user_id = p.id
  WHERE p.id != p_user_id
    AND p.id NOT IN (
      SELECT followee_id FROM follows WHERE follower_id = p_user_id
    )
  GROUP BY p.id, p.display_name, p.verified
  ORDER BY p.verified DESC, total_upvotes DESC
  LIMIT p_limit;
$$;
