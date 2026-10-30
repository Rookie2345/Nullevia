-- NULLEVIA Database Schema
-- Designed for PostgreSQL (Neon)

CREATE TABLE IF NOT EXISTS artifacts (
    id SERIAL PRIMARY KEY,
    artifact_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    era VARCHAR(100),
    origin VARCHAR(255),
    material VARCHAR(255),
    discovery_location VARCHAR(255),
    description TEXT NOT NULL,
    historical_background TEXT,
    discovery_story TEXT,
    image_url VARCHAR(500),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial test artifact (The Chronos Seed) if not exists
INSERT INTO artifacts (
    artifact_id,
    name,
    category,
    era,
    origin,
    material,
    discovery_location,
    description,
    historical_background,
    discovery_story,
    image_url,
    is_featured
)
VALUES (
    'NUL-001',
    'The Chronos Seed',
    'Impossible Inventions',
    'Pre-Singularity Epoch IV',
    'Subterranean Vaults of Oakhaven',
    'Crystallized Tachyon Core & Electrum Cage',
    'Temporal Rift Sector 7G',
    'An impossible relic that indefinitely anchors a single cubic centimeter of space to 0.003 seconds before the collapse of its origin reality.',
    'Discovered encased in a leaden sphere deep within a geologically inactive rift, the Chronos Seed vibrates at a constant 432 Hz. Chrono-spectroscopy suggests the core does not age, nor can light reflect off its interior lattice without experiencing a momentary temporal loop.',
    'Recovered during the 2084 Deep Sub-Strata expedition. The retrieval team noted that digital recording equipment placed within two meters suffered immediate non-linear clock drift.',
    '/assets/images/chronos-seed.png',
    TRUE
)
ON CONFLICT (artifact_id) DO NOTHING;
