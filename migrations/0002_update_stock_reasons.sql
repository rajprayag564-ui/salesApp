-- Migration: update allowed values for stock_transactions.reason
-- Run this in Supabase SQL editor as a project admin.

BEGIN;

-- Drop existing check constraint (if present) and recreate with extended list.
ALTER TABLE public.stock_transactions
DROP CONSTRAINT IF EXISTS stock_transactions_reason_check;

ALTER TABLE public.stock_transactions
ADD CONSTRAINT stock_transactions_reason_check
CHECK (
  reason IN (
    'initial_stock',
    'sale',
    'adjustment',
    'purchase',
    'return',
    'damage'
  )
);

COMMIT;

-- Note: This migration will fail if there are existing rows with reason values
-- outside the allowed list. If that happens, either update those rows or
-- choose a different set of allowed reasons before running.
