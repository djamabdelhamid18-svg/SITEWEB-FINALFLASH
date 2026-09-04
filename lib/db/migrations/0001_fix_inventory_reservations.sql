-- Migration: Fix inventory_reservations
-- 1. Remove the UNIQUE constraint from order_id (was preventing buying 2 rare items in one order)
-- 2. Add expires_at for automatic reservation TTL (anti-squatting)

-- Step 1: Drop the broken unique constraint on order_id
ALTER TABLE inventory_reservations
  DROP CONSTRAINT IF EXISTS inventory_reservations_order_id_unique;

-- Step 2: Add expires_at column with 60-minute default TTL
ALTER TABLE inventory_reservations
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '60 minutes');

-- Step 3: Create index on expires_at for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_expires_at
  ON inventory_reservations (expires_at);

-- Step 4: Create index on product_id for fast reservation checks
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_product_id
  ON inventory_reservations (product_id);
