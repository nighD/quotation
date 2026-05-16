-- ============================================================
-- Migration: 002_add_social_auth.sql
-- Description: Make password optional and add auth_provider tracking
-- ============================================================

-- 1. Make the password column optional
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- 2. Add social tracking columns
ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50) NOT NULL DEFAULT 'email';
ALTER TABLE users ADD COLUMN provider_id VARCHAR(255);

-- 3. Ensure uniqueness per provider (only relevant for social logins)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider ON users(auth_provider, provider_id) WHERE auth_provider != 'email';
