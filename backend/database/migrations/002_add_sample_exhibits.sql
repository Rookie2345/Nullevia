-- Migration 002: Add exhibit metadata fields and seed sample 3D exhibits
-- Idempotent and non-destructive

-- 1. Ensure new optional fields exist
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS classification VARCHAR(100);
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS mystery TEXT;
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS model_type VARCHAR(50);

-- 2. Update existing NUL-001 record with classification and model_type
UPDATE artifacts 
SET 
    classification = COALESCE(classification, 'Temporal Specimen'),
    mystery = COALESCE(mystery, 'Spectroscopy confirms the tachyon core exists in a permanent 0.003-second loop. Micro-clocks placed within its containment chamber continuously desynchronize.'),
    model_type = COALESCE(model_type, 'chronos')
WHERE artifact_id = 'NUL-001';

-- 3. Idempotently insert NUL-002: The Leviathan's Feather
INSERT INTO artifacts (
    artifact_id,
    name,
    category,
    classification,
    era,
    origin,
    material,
    discovery_location,
    description,
    historical_background,
    discovery_story,
    mystery,
    image_url,
    model_type,
    is_featured
)
VALUES (
    'NUL-002',
    'The Leviathan''s Feather',
    'Creatures That Never Were',
    'Bioluminescent Biocrystal',
    'Abyssal Epoch II',
    'Hadopelagic Trench of Tartarus',
    'Iridescent Organic Quartz & Phosphorite Lattice',
    'Depth 11,400m — Abyssal Trench V',
    'A crystalline feather exceeding 1.2 meters in length, shedding an ethereal cyan-violet bioluminescence that does not require an external light source or chemical sustenance.',
    'Recovered from a colossal calcified ribcage embedded in benthic basalt. Paleobiological analysis reveals the cellular matrix is composed of crystalline quartz interwoven with neural phosphor fibers, defying conventional evolutionary biology.',
    'Retrieved by autonomous submersible ''Nadir-IV'' during the 2091 Hadal survey. The retrieval arm reported zero thermal emission despite the specimen radiating intense cold luminescence.',
    'Submerged in saltwater, the feather emits a low-frequency hum (14 Hz) that induces rhythmic wave patterns on the surface of the container.',
    '/assets/images/feather.png',
    'feather',
    FALSE
)
ON CONFLICT (artifact_id) DO NOTHING;

-- 4. Idempotently insert NUL-003: The Crystal City of Al-Qona
INSERT INTO artifacts (
    artifact_id,
    name,
    category,
    classification,
    era,
    origin,
    material,
    discovery_location,
    description,
    historical_background,
    discovery_story,
    mystery,
    image_url,
    model_type,
    is_featured
)
VALUES (
    'NUL-003',
    'The Crystal City of Al-Qona',
    'Lost Civilizations',
    'Subterranean Architectural Relic',
    'Fourth Dynasty of the Hollow Sun',
    'Basalt Caverns of Al-Qona',
    'Piezoelectric Hexagonal Calcite & Electrum Micro-Spire Inlays',
    'Subterranean Vault 9, Libyan Erg Basin',
    'A miniature metropolis perfectly carved from a single massive quartz geode. Thousands of millimeter-tall towers, aqueducts, and plazas pulse with internal harmonic light.',
    'Scholars debate whether Al-Qona was a master architect''s model for an underground sanctuary or a real civilization compressed through non-Euclidean spatial warping. Microscopic examination reveals detailed interior colonnades inside every spire.',
    'Discovered by spelunkers inside a natural sealed geode chamber in 2073. The chamber walls were inscribed with warning glyphs designating the model as an ''inhabited coordinate anchor''.',
    'At solar noon, harmonic resonance inside the quartz spires causes miniature shadows within the city to move in reverse.',
    '/assets/images/crystal-city.png',
    'crystal_city',
    FALSE
)
ON CONFLICT (artifact_id) DO NOTHING;
