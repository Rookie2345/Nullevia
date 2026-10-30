const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// 1. Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. Strict CORS Configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim().replace(/\/$/, ''))
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // In development, allow localhost/127.0.0.1 on any port
      if (!isProduction && (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin))) {
        return callback(null, true);
      }

      // In production or configured environments, check allowed list
      if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Also allow any render.com preview or production static site
      if (origin.endsWith('.onrender.com')) {
        return callback(null, true);
      }

      // In development fallback
      if (!isProduction) {
        return callback(null, true);
      }

      return callback(new Error(`CORS policy rejection: Origin ${origin} is not allowed.`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// 3. Body parsing with strict payload limits
app.use(express.json({ limit: '50kb' }));

// Initial Seed Fallback Data (ensures frontend stability if DB is still seeding or sleeping)
const SAMPLE_ARTIFACTS = [
  {
    artifact_id: 'NUL-001',
    name: 'The Chronos Seed',
    category: 'Impossible Inventions',
    classification: 'Temporal Specimen',
    era: 'Pre-Singularity Epoch IV',
    origin: 'Subterranean Vaults of Oakhaven',
    material: 'Crystallized Tachyon Core & Electrum Cage',
    discovery_location: 'Temporal Rift Sector 7G',
    description: 'An impossible relic that indefinitely anchors a single cubic centimeter of space to 0.003 seconds before the collapse of its origin reality.',
    historical_background: 'Discovered encased in a leaden sphere deep within a geologically inactive rift, the Chronos Seed vibrates at a constant 432 Hz. Chrono-spectroscopy suggests the core does not age, nor can light reflect off its interior lattice without experiencing a momentary temporal loop.',
    discovery_story: 'Recovered during the 2084 Deep Sub-Strata expedition. The retrieval team noted that digital recording equipment placed within two meters suffered immediate non-linear clock drift.',
    mystery: 'Spectroscopy confirms the tachyon core exists in a permanent 0.003-second loop. Micro-clocks placed within its containment chamber continuously desynchronize.',
    model_type: 'chronos',
    image_url: '/assets/images/chronos-seed.png',
    is_featured: true,
  },
  {
    artifact_id: 'NUL-002',
    name: "The Leviathan's Feather",
    category: 'Creatures That Never Were',
    classification: 'Bioluminescent Biocrystal',
    era: 'Abyssal Epoch II',
    origin: 'Hadopelagic Trench of Tartarus',
    material: 'Iridescent Organic Quartz & Phosphorite Lattice',
    discovery_location: 'Depth 11,400m — Abyssal Trench V',
    description: 'A crystalline feather exceeding 1.2 meters in length, shedding an ethereal cyan-violet bioluminescence that does not require an external light source or chemical sustenance.',
    historical_background: 'Recovered from a colossal calcified ribcage embedded in benthic basalt. Paleobiological analysis reveals the cellular matrix is composed of crystalline quartz interwoven with neural phosphor fibers, defying conventional evolutionary biology.',
    discovery_story: 'Retrieved by autonomous submersible Nadir-IV during the 2091 Hadal survey. The retrieval arm reported zero thermal emission despite the specimen radiating intense cold luminescence.',
    mystery: 'Submerged in saltwater, the feather emits a low-frequency hum (14 Hz) that induces rhythmic wave patterns on the surface of the container.',
    model_type: 'feather',
    image_url: '/assets/images/feather.png',
    is_featured: false,
  },
  {
    artifact_id: 'NUL-003',
    name: 'The Crystal City of Al-Qona',
    category: 'Lost Civilizations',
    classification: 'Subterranean Architectural Relic',
    era: 'Fourth Dynasty of the Hollow Sun',
    origin: 'Basalt Caverns of Al-Qona',
    material: 'Piezoelectric Hexagonal Calcite & Electrum Micro-Spire Inlays',
    discovery_location: 'Subterranean Vault 9, Libyan Erg Basin',
    description: 'A miniature metropolis perfectly carved from a single massive quartz geode. Thousands of millimeter-tall towers, aqueducts, and plazas pulse with internal harmonic light.',
    historical_background: 'Scholars debate whether Al-Qona was a master architect\'s model for an underground sanctuary or a real civilization compressed through non-Euclidean spatial warping. Microscopic examination reveals detailed interior colonnades inside every spire.',
    discovery_story: 'Discovered by spelunkers inside a natural sealed geode chamber in 2073. The chamber walls were inscribed with warning glyphs designating the model as an inhabited coordinate anchor.',
    mystery: 'At solar noon, harmonic resonance inside the quartz spires causes miniature shadows within the city to move in reverse.',
    model_type: 'crystal_city',
    image_url: '/assets/images/crystal-city.png',
    is_featured: false,
  },
];
const FALLBACK_FEATURED_ARTIFACT = SAMPLE_ARTIFACTS[0];

const COLLECTIONS_CATALOG = [
  {
    id: 'lost-civilizations',
    name: 'Lost Civilizations',
    tagline: 'Remnants of dynasties that bypassed historical chronology.',
    count: 4,
    code: 'COL-01',
  },
  {
    id: 'impossible-inventions',
    name: 'Impossible Inventions',
    tagline: 'Machines functioning contrary to standard thermodynamic models.',
    count: 5,
    code: 'COL-02',
  },
  {
    id: 'creatures-that-never-were',
    name: 'Creatures That Never Were',
    tagline: 'Fossilized and ethereal entities absent from Darwinian records.',
    count: 3,
    code: 'COL-03',
  },
  {
    id: 'objects-from-other-realities',
    name: 'Objects From Other Realities',
    tagline: 'Matter and artifacts slipping through topological rifts.',
    count: 3,
    code: 'COL-04',
  },
  {
    id: 'unexplained-objects',
    name: 'Unexplained Objects',
    tagline: 'Anomalies that defy material classification.',
    count: 3,
    code: 'COL-05',
  },
  {
    id: 'future-archives',
    name: 'Future Archives',
    tagline: 'Documents and relics recovered from potential future timelines.',
    count: 2,
    code: 'COL-06',
  },
];

// --- ROUTES ---

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = db.getStatus();
  const isHealthy = dbStatus.configured ? dbStatus.connected : true;

  res.status(200).json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'NULLEVIA Backend API',
    uptime: Math.floor(process.processUptime ? process.uptime() : process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      configured: dbStatus.configured,
      connected: dbStatus.connected,
      message: dbStatus.message,
      error: dbStatus.error,
      lastChecked: dbStatus.lastChecked,
    },
  });
});

// Collections Catalog Endpoint
app.get('/api/collections', (req, res) => {
  res.json({
    success: true,
    data: COLLECTIONS_CATALOG,
  });
});

// Featured Artifact Endpoint (Specific route)
app.get('/api/artifacts/featured', async (req, res, next) => {
  const dbStatus = db.getStatus();

  if (!dbStatus.connected) {
    return res.json({
      success: true,
      source: 'fallback_cache',
      data: FALLBACK_FEATURED_ARTIFACT,
      notice: 'Database offline or starting. Displaying verified archive fallback record.',
    });
  }

  try {
    const result = await db.query(
      `SELECT artifact_id, name, category, classification, era, origin, material, 
              discovery_location, description, historical_background, 
              discovery_story, mystery, model_type, image_url, is_featured, created_at
       FROM artifacts 
       WHERE is_featured = true 
       ORDER BY id ASC 
       LIMIT 1;`
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        source: 'fallback_empty_db',
        data: FALLBACK_FEATURED_ARTIFACT,
      });
    }

    res.json({
      success: true,
      source: 'database',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

// Artifacts Listing Endpoint (Specific route)
app.get('/api/artifacts', async (req, res, next) => {
  const dbStatus = db.getStatus();

  if (!dbStatus.connected) {
    return res.json({
      success: true,
      source: 'fallback_cache',
      data: SAMPLE_ARTIFACTS,
      notice: 'Database offline or starting. Serving bundled archive fallback catalog.',
    });
  }

  try {
    const result = await db.query(
      `SELECT artifact_id, name, category, classification, era, origin, material, 
              discovery_location, description, mystery, model_type, is_featured, created_at
       FROM artifacts 
       ORDER BY id ASC;`
    );
    res.json({
      success: true,
      source: 'database',
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
});

// Dynamic Artifact by ID Endpoint (Registered AFTER specific routes to avoid route collisions)
app.get('/api/artifacts/:id', async (req, res, next) => {
  const { id } = req.params;
  const dbStatus = db.getStatus();

  // Validate format
  if (!/^[A-Za-z0-9_-]{1,30}$/.test(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid artifact identifier format',
    });
  }

  if (!dbStatus.connected) {
    const fallbackItem = SAMPLE_ARTIFACTS.find(
      (a) => a.artifact_id.toLowerCase() === id.toLowerCase()
    );
    if (fallbackItem) {
      return res.json({
        success: true,
        source: 'fallback_cache',
        data: fallbackItem,
        notice: 'Database offline or starting. Serving bundled archive fallback record.',
      });
    }
    return res.status(404).json({
      success: false,
      source: 'fallback_cache',
      error: `Specimen record '${id}' not found in offline archive cache.`,
    });
  }

  try {
    const result = await db.query(
      `SELECT artifact_id, name, category, classification, era, origin, material, 
              discovery_location, description, historical_background, 
              discovery_story, mystery, model_type, image_url, is_featured, created_at
       FROM artifacts 
       WHERE artifact_id = $1 OR id::text = $1
       LIMIT 1;`,
      [id]
    );

    if (result.rows.length === 0) {
      // Fallback check if not in DB yet
      const fallbackItem = SAMPLE_ARTIFACTS.find(
        (a) => a.artifact_id.toLowerCase() === id.toLowerCase()
      );
      if (fallbackItem) {
        return res.json({
          success: true,
          source: 'fallback_cache',
          data: fallbackItem,
          notice: 'Record not present in database. Returned from verified fallback catalog.',
        });
      }
      return res.status(404).json({
        success: false,
        source: 'database',
        error: `Specimen record '${id}' does not exist in the museum archive.`,
      });
    }

    res.json({
      success: true,
      source: 'database',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

// Global 404 Route
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Nullevia Server Error]', err);
  res.status(500).json({
    success: false,
    error: isProduction ? 'Internal Server Error' : err.message,
  });
});

// Start Server and initialize DB
app.listen(PORT, async () => {
  console.log(`\x1b[36m[Nullevia Server]\x1b[0m Service operational on port ${PORT}`);
  console.log(`\x1b[36m[Nullevia Server]\x1b[0m Health status available at http://localhost:${PORT}/api/health`);
  await db.initDatabase();
});
