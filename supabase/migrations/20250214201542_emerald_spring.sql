/*
  # Grundlegende Datenbankstruktur für WochenKocher

  1. Neue Tabellen
    - `dishes` (Gerichte)
      - `id` (uuid, Primärschlüssel)
      - `name` (text, Name des Gerichts)
      - `recipe` (text, Zubereitungsanleitung)
      - `image_url` (text, URL zum Bild des Gerichts)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `ingredients` (Zutaten)
      - `id` (uuid, Primärschlüssel)
      - `name` (text, Name der Zutat)
      - `created_at` (timestamp)

    - `dish_ingredients` (Verbindungstabelle zwischen Gerichten und Zutaten)
      - `id` (uuid, Primärschlüssel)
      - `dish_id` (Referenz auf dishes)
      - `ingredient_id` (Referenz auf ingredients)
      - `amount` (decimal, Menge)
      - `unit` (text, Einheit - g, kg, Stk, TL, EL)

    - `weekly_plan` (Wochenplanung)
      - `id` (uuid, Primärschlüssel)
      - `date` (date, Tag für den das Gericht geplant ist)
      - `dish_id` (Referenz auf dishes)
      - `user_id` (Referenz auf auth.users)

  2. Sicherheit
    - RLS für alle Tabellen aktiviert
    - Policies für authentifizierte Benutzer
*/

-- Erstelle enum für Einheiten
CREATE TYPE unit_type AS ENUM ('g', 'kg', 'Stk', 'TL', 'EL');

-- Gerichte Tabelle
CREATE TABLE IF NOT EXISTS dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  recipe text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Zutaten Tabelle
CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Verbindungstabelle für Gerichte und Zutaten
CREATE TABLE IF NOT EXISTS dish_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id uuid REFERENCES dishes(id) ON DELETE CASCADE,
  ingredient_id uuid REFERENCES ingredients(id) ON DELETE RESTRICT,
  amount decimal NOT NULL,
  unit unit_type NOT NULL,
  UNIQUE(dish_id, ingredient_id)
);

-- Wochenplanung Tabelle
CREATE TABLE IF NOT EXISTS weekly_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  dish_id uuid REFERENCES dishes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(date, user_id)
);

-- Aktiviere Row Level Security
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plan ENABLE ROW LEVEL SECURITY;

-- Policies für dishes
CREATE POLICY "Users can view all dishes"
  ON dishes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own dishes"
  ON dishes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dishes"
  ON dishes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies für ingredients
CREATE POLICY "Everyone can view ingredients"
  ON ingredients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert ingredients"
  ON ingredients FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies für dish_ingredients
CREATE POLICY "Users can view all dish ingredients"
  ON dish_ingredients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage ingredients for their dishes"
  ON dish_ingredients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dishes
      WHERE dishes.id = dish_ingredients.dish_id
      AND dishes.user_id = auth.uid()
    )
  );

-- Policies für weekly_plan
CREATE POLICY "Users can view their own weekly plan"
  ON weekly_plan FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own weekly plan"
  ON weekly_plan FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dishes_updated_at
  BEFORE UPDATE ON dishes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();