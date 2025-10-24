-- Migration: Add original_price column to menu_items table
-- This allows showing discounted pricing with strikethrough

ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2);

-- Optional: Set original_price for existing items if needed
-- UPDATE menu_items SET original_price = price * 1.2 WHERE original_price IS NULL;
