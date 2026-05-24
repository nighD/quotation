-- ============================================================
-- Migration: 004_update_articles_schema.sql
-- Description: Drop and recreate articles table with a custom VARCHAR(255) primary key ID
--              and add new metadata fields while preserving pdf_key.
-- ============================================================

DROP TABLE IF EXISTS articles CASCADE;

CREATE TABLE articles (
    id              VARCHAR(255) PRIMARY KEY,
    title           VARCHAR(500) NOT NULL,
    slug            VARCHAR(600) NOT NULL UNIQUE,
    description     TEXT,
    thumbnail       TEXT,
    layouts         VARCHAR(255),
    content         TEXT,
    blocks          JSONB,
    status          VARCHAR(50)  NOT NULL DEFAULT 'draft',
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    pdf_key         VARCHAR(500),
    seo_title       VARCHAR(255),
    seo_description TEXT,
    seo_keywords    VARCHAR(500),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_created_by ON articles(created_by);
CREATE INDEX idx_articles_deleted_at ON articles(deleted_at);
