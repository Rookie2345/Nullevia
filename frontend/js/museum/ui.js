/**
 * NULLEVIA 3D Museum UI & Interaction Controller
 * 
 * Manages:
 * - Proximity HUD prompt ([E] Inspect)
 * - Curatorial Dossier Modal with live database integration & clear source tags
 * - Smooth inspection mode (hands reach, camera focus) without extra WebGL renderers
 * - Graphics Quality Presets menu (Low / Medium / High)
 */

window.MuseumUI = (function () {
  let activeExhibit = null;
  let isDossierOpen = false;

  // DOM Elements
  let promptEl, promptKeyEl, promptLabelEl;
  let reticleEl;
  let dossierModal, dossierCloseBtn;
  let graphicsBtn, graphicsDropdown;

  // Fallback museum archive records for offline resilience
  const FALLBACK_ARCHIVES = {
    'NUL-001': {
      artifact_id: 'NUL-001',
      name: 'The Chronos Seed',
      classification: 'Temporal Specimen',
      era: 'Pre-Singularity Epoch IV',
      origin: 'Subterranean Vaults of Oakhaven',
      material: 'Crystallized Tachyon Core & Electrum Cage',
      discovery_location: 'Temporal Rift Sector 7G',
      description: 'An impossible relic that indefinitely anchors a single cubic centimeter of space to 0.003 seconds before the collapse of its origin reality.',
      historical_background: 'Discovered encased in a leaden sphere deep within a geologically inactive rift, the Chronos Seed vibrates at a constant 432 Hz. Chrono-spectroscopy suggests the core does not age, nor can light reflect off its interior lattice without experiencing a momentary temporal loop.',
      discovery_story: 'Recovered during the 2084 Deep Sub-Strata expedition. The retrieval team noted that digital recording equipment placed within two meters suffered immediate non-linear clock drift.',
      mystery: 'Spectroscopy confirms the tachyon core exists in a permanent 0.003-second loop. Micro-clocks placed within its containment chamber continuously desynchronize.',
    },
    'NUL-002': {
      artifact_id: 'NUL-002',
      name: "The Leviathan's Feather",
      classification: 'Bioluminescent Biocrystal',
      era: 'Abyssal Epoch II',
      origin: 'Hadopelagic Trench of Tartarus',
      material: 'Iridescent Organic Quartz & Phosphorite Lattice',
      discovery_location: 'Depth 11,400m — Abyssal Trench V',
      description: 'A crystalline feather exceeding 1.2 meters in length, shedding an ethereal cyan-violet bioluminescence that does not require an external light source or chemical sustenance.',
      historical_background: 'Recovered from a colossal calcified ribcage embedded in benthic basalt. Paleobiological analysis reveals the cellular matrix is composed of crystalline quartz interwoven with neural phosphor fibers, defying conventional evolutionary biology.',
      discovery_story: 'Retrieved by autonomous submersible Nadir-IV during the 2091 Hadal survey. The retrieval arm reported zero thermal emission despite the specimen radiating intense cold luminescence.',
      mystery: 'Submerged in saltwater, the feather emits a low-frequency hum (14 Hz) that induces rhythmic wave patterns on the surface of the container.',
    },
    'NUL-003': {
      artifact_id: 'NUL-003',
      name: 'The Crystal City of Al-Qona',
      classification: 'Subterranean Architectural Relic',
      era: 'Fourth Dynasty of the Hollow Sun',
      origin: 'Basalt Caverns of Al-Qona',
      material: 'Piezoelectric Hexagonal Calcite & Electrum Micro-Spire Inlays',
      discovery_location: 'Subterranean Vault 9, Libyan Erg Basin',
      description: 'A miniature metropolis perfectly carved from a single massive quartz geode. Thousands of millimeter-tall towers, aqueducts, and plazas pulse with internal harmonic light.',
      historical_background: 'Scholars debate whether Al-Qona was a master architect\'s model for an underground sanctuary or a real civilization compressed through non-Euclidean spatial warping. Microscopic examination reveals detailed interior colonnades inside every spire.',
      discovery_story: 'Discovered by spelunkers inside a natural sealed geode chamber in 2073. The chamber walls were inscribed with warning glyphs designating the model as an inhabited coordinate anchor.',
      mystery: 'At solar noon, harmonic resonance inside the quartz spires causes miniature shadows within the city to move in reverse.',
    },
  };

  function init() {
    promptEl = document.getElementById('interaction-prompt');
    promptLabelEl = document.getElementById('prompt-label');
    reticleEl = document.getElementById('reticle');

    dossierModal = document.getElementById('artifact-dossier-modal');
    dossierCloseBtn = document.getElementById('dossier-close-btn');

    graphicsBtn = document.getElementById('btn-graphics');
    graphicsDropdown = document.getElementById('graphics-dropdown');

    // 1. Setup Listeners
    setupListeners();

    console.log('[MuseumUI] Interface and interaction handlers active.');
  }

  function setupListeners() {
    // E-key interaction
    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE' && activeExhibit && !isDossierOpen) {
        e.preventDefault();
        openDossier(activeExhibit);
      } else if (e.code === 'Escape' && isDossierOpen) {
        closeDossier();
      }
    });

    // Click prompt to open
    if (promptEl) {
      promptEl.addEventListener('click', () => {
        if (activeExhibit && !isDossierOpen) {
          openDossier(activeExhibit);
        }
      });
    }

    // Close button
    if (dossierCloseBtn) {
      dossierCloseBtn.addEventListener('click', closeDossier);
    }

    // Graphics Presets Toggle
    if (graphicsBtn && graphicsDropdown) {
      graphicsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        graphicsDropdown.classList.toggle('active');
      });

      document.addEventListener('click', () => {
        graphicsDropdown.classList.remove('active');
      });

      const options = graphicsDropdown.querySelectorAll('.graphics-option');
      options.forEach((opt) => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          const preset = opt.dataset.preset;
          window.MuseumEngine.applyPreset(preset);

          options.forEach((o) => o.classList.remove('selected'));
          opt.classList.add('selected');
          graphicsBtn.textContent = `Graphics: ${preset.toUpperCase()}`;
          graphicsDropdown.classList.remove('active');
        });
      });
    }

    // Enter 3D Click-to-Play Overlay
    const overlay = document.getElementById('click-to-play-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        window.MuseumPlayer.requestLock();
      });
    }
  }

  /**
   * Updates proximity prompt based on player position
   */
  function updatePrompt(closestExhibit) {
    if (isDossierOpen) {
      hidePrompt();
      return;
    }

    activeExhibit = closestExhibit;

    if (activeExhibit) {
      if (promptLabelEl) promptLabelEl.textContent = `Inspect ${activeExhibit.name}`;
      if (promptEl) promptEl.classList.add('visible');
      if (reticleEl) reticleEl.classList.add('active');
    } else {
      hidePrompt();
    }
  }

  function hidePrompt() {
    if (promptEl) promptEl.classList.remove('visible');
    if (reticleEl) reticleEl.classList.remove('active');
  }

  /**
   * Opens the curatorial archive dossier modal for the given exhibit
   */
  async function openDossier(exhibit) {
    isDossierOpen = true;
    hidePrompt();

    // Release mouse pointer lock so the user can interact with dossier
    window.MuseumPlayer.unlock();
    window.MuseumPlayer.setInspecting(true);

    // Populate with instantaneous high-fidelity fallback first
    const fallback = FALLBACK_ARCHIVES[exhibit.id] || {
      artifact_id: exhibit.id,
      name: exhibit.name,
      classification: exhibit.classification || 'Museum Specimen',
      era: 'Unrecorded Epoch',
      origin: 'Unknown',
      material: 'Anomalous Alloy',
      discovery_location: 'Classified',
      description: 'Archival record loading...',
      historical_background: '',
      discovery_story: '',
      mystery: '',
    };

    renderDossier(fallback, 'Bundled Archival Cache (Pre-fetch)');
    if (dossierModal) dossierModal.classList.add('active');

    // Query live backend API (Neon PostgreSQL)
    if (window.NulleviaAPI && window.NulleviaAPI.getArtifactById) {
      const result = await window.NulleviaAPI.getArtifactById(exhibit.id);
      if (result && result.success && result.data) {
        const sourceLabel =
          result.source === 'database'
            ? 'Verified Neon PostgreSQL Record'
            : 'Verified Archive Cache';
        renderDossier(result.data, sourceLabel);
      }
    }
  }

  function renderDossier(data, sourceLabel) {
    const idEl = document.getElementById('dossier-id');
    const titleEl = document.getElementById('dossier-title');
    const catEl = document.getElementById('dossier-category');
    const eraEl = document.getElementById('dossier-era');
    const originEl = document.getElementById('dossier-origin');
    const materialEl = document.getElementById('dossier-material');
    const locEl = document.getElementById('dossier-location');
    const descEl = document.getElementById('dossier-desc');
    const histEl = document.getElementById('dossier-history');
    const discEl = document.getElementById('dossier-discovery');
    const mysteryEl = document.getElementById('dossier-mystery');
    const sourceEl = document.getElementById('dossier-source');

    if (idEl) idEl.textContent = data.artifact_id || '';
    if (titleEl) titleEl.textContent = data.name || '';
    if (catEl) catEl.textContent = data.classification || data.category || 'Specimen';
    if (eraEl) eraEl.textContent = data.era || 'Unknown Epoch';
    if (originEl) originEl.textContent = data.origin || 'Lost to Time';
    if (materialEl) materialEl.textContent = data.material || 'Anomalous Matter';
    if (locEl) locEl.textContent = data.discovery_location || 'Coordinates Classified';
    if (descEl) descEl.textContent = data.description || '';
    if (histEl) histEl.textContent = data.historical_background || 'Curatorial documentation pending classification.';
    if (discEl) discEl.textContent = data.discovery_story || 'Recovered under sealed expedition protocol.';
    if (mysteryEl) mysteryEl.textContent = data.mystery || 'Anomalous properties under active observation.';
    if (sourceEl) sourceEl.textContent = `Source: ${sourceLabel}`;
  }

  function closeDossier() {
    isDossierOpen = false;
    if (dossierModal) dossierModal.classList.remove('active');
    window.MuseumPlayer.setInspecting(false);

    // Re-engage pointer lock when closing dossier
    window.MuseumPlayer.requestLock();
  }

  return {
    init,
    updatePrompt,
    openDossier,
    closeDossier,
    isDossierOpen: () => isDossierOpen,
  };
})();
