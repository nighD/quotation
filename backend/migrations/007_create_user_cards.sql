-- Migration: 007_create_user_cards.sql
-- Description: Create user_cards table to store card information
CREATE TABLE IF NOT EXISTS user_cards (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username    VARCHAR(255) NOT NULL,
    so_the      VARCHAR(100) NOT NULL,
    loai_the    VARCHAR(100) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_cards_username ON user_cards(username);
