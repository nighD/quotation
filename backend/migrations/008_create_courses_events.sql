-- =============================================
-- Migration 008: Create courses, events, event_registrations
-- =============================================

-- Enable pgcrypto if not already enabled (for gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- Table: courses
-- =============================================
CREATE TABLE IF NOT EXISTS courses (
    id             UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title          VARCHAR(500) NOT NULL,
    booking_type   VARCHAR(100) NOT NULL UNIQUE,
    booking_title  VARCHAR(500) NOT NULL,
    description    TEXT,
    image          TEXT,
    fallback_image TEXT,
    instructor     VARCHAR(255),
    duration       VARCHAR(100),
    schedule       VARCHAR(100),
    tuition_fee    DECIMAL(12, 2) DEFAULT 0,
    status         VARCHAR(50)  NOT NULL DEFAULT 'active',
    order_index    INTEGER      NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_courses_status       ON courses (status);
CREATE INDEX IF NOT EXISTS idx_courses_booking_type ON courses (booking_type);

-- =============================================
-- Table: events
-- =============================================
CREATE TABLE IF NOT EXISTS events (
    id          UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title       VARCHAR(500) NOT NULL,
    subtitle    VARCHAR(500),
    location    VARCHAR(255),
    date        VARCHAR(100),
    image       TEXT,
    badge       VARCHAR(100),
    luma_url    TEXT,
    description TEXT,
    status      VARCHAR(50)  NOT NULL DEFAULT 'active',
    order_index INTEGER      NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_events_status ON events (status);

-- =============================================
-- Table: event_registrations
-- =============================================
CREATE TABLE IF NOT EXISTS event_registrations (
    id          UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID,
    email       VARCHAR(255) NOT NULL,
    full_name   VARCHAR(255),
    phone       VARCHAR(50),
    event_id    VARCHAR(100),
    event_title VARCHAR(500) NOT NULL,
    event_date  VARCHAR(100),
    location    VARCHAR(255),
    status      VARCHAR(50)  NOT NULL DEFAULT 'pending',
    notes       TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_email    ON event_registrations (email);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status   ON event_registrations (status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations (event_id);
