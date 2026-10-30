/**
 * NULLEVIA Main UI Controller
 * 
 * Manages museum presentation, live backend status uplink,
 * and high-fidelity fallback rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
  initUplinkBadge();
  initFeaturedArtifact();
  initCollections();
  initInteractions();
});

/**
 * 1. Archive Uplink Status Badge
 */
function initUplinkBadge() {
  const badge = document.getElementById('uplink-badge');
  const dot = document.getElementById('uplink-dot');
  const text = document.getElementById('uplink-text');

  if (!badge || !dot || !text) return;

  // Listen to API status transitions
  window.NulleviaAPI.onStatusChange((state) => {
    dot.className = 'status-dot';

    switch (state.status) {
      case 'online':
        dot.classList.add('online');
        text.textContent = state.details || 'Archive Uplink: Operational';
        badge.title = state.database && state.database.connected 
          ? 'PostgreSQL Database Connected' 
          : 'Backend Online (Database in Standby/Unconfigured)';
        break;
      case 'waking':
        dot.classList.add('waking');
        text.textContent = 'Archive Reawakening (Spinning up)...';
        badge.title = 'Render free service is spinning up. Artifact cache is active.';
        break;
      case 'offline':
        dot.classList.add('offline');
        text.textContent = 'Archive Uplink: Standalone Cache';
        badge.title = 'Backend unreachable. Running in local standalone mode.';
        break;
      default:
        text.textContent = 'Connecting to Archive...';
    }
  });

  // Trigger initial health check
  window.NulleviaAPI.checkHealth();

  // Periodic health ping every 30 seconds
  setInterval(() => {
    window.NulleviaAPI.checkHealth();
  }, (window.NULLEVIA_CONFIG && window.NULLEVIA_CONFIG.HEALTH_CHECK_INTERVAL_MS) || 30000);
}

/**
 * 2. Featured Artifact Showcase
 */
async function initFeaturedArtifact() {
  const container = document.getElementById('featured-specimen-container');
  if (!container) return;

  // Default instant curated specimen (guarantees zero layout shift / instant load)
  const defaultSpecimen = {
    artifact_id: 'NUL-001',
    name: 'The Chronos Seed',
    category: 'Impossible Inventions',
    era: 'Pre-Singularity Epoch IV',
    origin: 'Subterranean Vaults of Oakhaven',
    material: 'Crystallized Tachyon Core & Electrum Cage',
    discovery_location: 'Temporal Rift Sector 7G',
    description: 'An impossible relic that indefinitely anchors a single cubic centimeter of space to 0.003 seconds before the collapse of its origin reality.',
  };

  renderFeaturedArtifact(defaultSpecimen, 'Instant Verified Archive');

  // Asynchronously query live API
  const liveArtifact = await window.NulleviaAPI.getFeaturedArtifact();
  if (liveArtifact) {
    renderFeaturedArtifact(liveArtifact, 'Live PostgreSQL Record');
  }
}

function renderFeaturedArtifact(item, sourceLabel) {
  const tagEl = document.getElementById('specimen-id-tag');
  const titleEl = document.getElementById('specimen-title');
  const catEl = document.getElementById('specimen-category');
  const eraEl = document.getElementById('specimen-era');
  const originEl = document.getElementById('specimen-origin');
  const materialEl = document.getElementById('specimen-material');
  const locationEl = document.getElementById('specimen-location');
  const descEl = document.getElementById('specimen-description');
  const sourceIndicator = document.getElementById('specimen-source-tag');

  if (tagEl) tagEl.textContent = item.artifact_id || 'NUL-001';
  if (titleEl) titleEl.textContent = item.name || 'Unknown Specimen';
  if (catEl) catEl.textContent = item.category || 'Unclassified';
  if (eraEl) eraEl.textContent = item.era || 'Unknown Epoch';
  if (originEl) originEl.textContent = item.origin || 'Lost to Time';
  if (materialEl) materialEl.textContent = item.material || 'Anomalous Alloy';
  if (locationEl) locationEl.textContent = item.discovery_location || 'Restricted Coordinates';
  if (descEl) descEl.textContent = item.description || '';
  if (sourceIndicator) sourceIndicator.textContent = sourceLabel;
}

/**
 * 3. Six Core Collections
 */
const FALLBACK_COLLECTIONS = [
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

async function initCollections() {
  const grid = document.getElementById('collections-grid');
  if (!grid) return;

  renderCollections(FALLBACK_COLLECTIONS);

  // Check if backend has live catalog updates
  const remoteCollections = await window.NulleviaAPI.getCollections();
  if (remoteCollections && Array.isArray(remoteCollections) && remoteCollections.length > 0) {
    renderCollections(remoteCollections);
  }
}

function renderCollections(items) {
  const grid = document.getElementById('collections-grid');
  if (!grid) return;

  grid.innerHTML = items.map((col) => `
    <article class="collection-card">
      <div>
        <span class="collection-code">${escapeHtml(col.code || 'COL-XX')}</span>
        <h3 class="collection-name">${escapeHtml(col.name)}</h3>
        <p class="collection-tagline">${escapeHtml(col.tagline)}</p>
      </div>
      <div class="collection-footer">
        <span>Catalogued: ${col.count || 0} specimens</span>
        <a href="exhibitions.html?collection=${encodeURIComponent(col.id)}">Explore Vault &rarr;</a>
      </div>
    </article>
  `).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 4. Interactive Navigation
 */
function initInteractions() {
  // Navigation elements
}
