-- ============================================================
-- Migration: 003_add_avatar_and_profile_fields.sql
-- Description: Add missing avatar_url and profile details to users table
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100);
