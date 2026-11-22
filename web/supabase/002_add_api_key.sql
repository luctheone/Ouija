-- Migration 002: Add api_key column to companies
-- Run after migration.sql (001)

ALTER TABLE companies ADD COLUMN IF NOT EXISTS api_key text UNIQUE;
