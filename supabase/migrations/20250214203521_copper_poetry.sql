/*
  # Add Liter unit to unit_type enum

  1. Changes
    - Add 'l' (Liter) to unit_type enum
  
  2. Notes
    - Existing data remains unchanged
    - New unit can be used immediately after migration
*/

ALTER TYPE unit_type ADD VALUE 'l';