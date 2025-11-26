-- Migration: Create Grocery Lists Tables
-- Date: 2025-11-26
-- Description: Add grocery_lists and grocery_list_items tables for automated shopping list generation

-- Create grocery_lists table
CREATE TABLE IF NOT EXISTS grocery_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Grocery List',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create grocery_list_items table
CREATE TABLE IF NOT EXISTS grocery_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES grocery_lists(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, -- 'protein', 'produce', 'dairy', 'grains', 'pantry', 'other'
  ingredient TEXT NOT NULL,
  amount TEXT,
  unit TEXT,
  checked BOOLEAN DEFAULT FALSE,
  is_custom BOOLEAN DEFAULT FALSE, -- user-added item
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_grocery_lists_user ON grocery_lists(user_id);
CREATE INDEX idx_grocery_lists_plan ON grocery_lists(plan_id);
CREATE INDEX idx_grocery_items_list ON grocery_list_items(list_id);
CREATE INDEX idx_grocery_items_category ON grocery_list_items(list_id, category);

-- Enable Row Level Security
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy for grocery_lists
-- Users can only view, create, update, and delete their own grocery lists
CREATE POLICY "Users can manage own grocery lists"
  ON grocery_lists FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policy for grocery_list_items
-- Users can only manage items in their own grocery lists
CREATE POLICY "Users can manage own grocery items"
  ON grocery_list_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM grocery_lists
      WHERE grocery_lists.id = grocery_list_items.list_id
      AND grocery_lists.user_id = auth.uid()
    )
  );

-- Add updated_at trigger for grocery_lists
CREATE OR REPLACE FUNCTION update_grocery_lists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER grocery_lists_updated_at
  BEFORE UPDATE ON grocery_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_grocery_lists_updated_at();
