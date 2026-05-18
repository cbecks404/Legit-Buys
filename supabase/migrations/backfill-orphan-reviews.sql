-- Backfill: assign all reviews with NULL user_id to the seed account.
-- Run once via the Supabase SQL editor.

update reviews
set user_id = '1f0bd382-b4f3-4671-ab46-890bbaca947f'
where user_id is null;

-- Sanity check: should return 0
select count(*) as remaining_orphans from reviews where user_id is null;
