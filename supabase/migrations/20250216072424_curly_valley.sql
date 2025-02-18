/*
  # Fix ingredients RLS policies

  1. Changes
    - Add RLS policy for ingredients table to allow authenticated users to create ingredients
*/

-- Erlaube authentifizierten Benutzern das Erstellen von Zutaten
CREATE POLICY "Authenticated users can create ingredients"
  ON ingredients FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Erlaube authentifizierten Benutzern das Lesen von Zutaten
CREATE POLICY "Authenticated users can read ingredients"
  ON ingredients FOR SELECT
  TO authenticated
  USING (true);