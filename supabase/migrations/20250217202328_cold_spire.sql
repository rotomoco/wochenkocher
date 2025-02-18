/*
  # Remove unique constraint from ingredients name

  1. Changes
    - Remove unique constraint from ingredients.name column
    - Keep existing data intact
*/

ALTER TABLE ingredients DROP CONSTRAINT IF EXISTS ingredients_name_key;