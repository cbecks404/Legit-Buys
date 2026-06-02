-- place_name: the venue/restaurant a review's dish comes from.
-- Shown on the card title beside the food item so people can scan by place.
-- Run in the Supabase SQL editor.

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS place_name text;
