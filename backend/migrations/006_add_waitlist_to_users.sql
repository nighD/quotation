-- ============================================================
-- Migration: 006_add_waitlist_to_users.sql
-- Description: Add is_joined_waitlist column to users table
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_joined_waitlist BOOLEAN NOT NULL DEFAULT FALSE;
