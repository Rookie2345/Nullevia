/**
 * NULLEVIA Interactive Exhibits & Display Cases
 * 
 * Features:
 * - Architectural pedestals with transparent glass enclosures & warm interior spotlights
 * - 3 Initial Sample 3D Artifacts (Chronos Seed, Leviathan's Feather, Crystal City)
 * - Kinetic animation loop (counter-rotating rings, levitation, quartz glow)
 * - Proximity & angle detection for first-person interaction
 */

window.MuseumExhibits = (function () {
  let scene;
  const exhibitObjects = [];
  const colliders = [];

  // Kinetic animation hooks
  let chronosRings = [];
  let leviathanFeather = null;
  let crystalCityLights = [];

  function build(targetScene) {
    scene = targetScene;

    // 1. Shared display case materials
    const materials = {
      plinth: new THREE.MeshStandardMaterial({
        color: 0x3d352b,
        roughness: 0.7,
        metalness: 0.1,
      }),
      bronzeTrim: new THREE.MeshStandardMaterial({
        color: 0xd4b477,
        roughness: 0.35,
        metalness: 0.8,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.92,
        ior: 1.52,
      }),
      cyanGlow: new THREE.MeshBasicMaterial({
        color: 0x69c7d5,
      }),
      amberGlow: new THREE.MeshBasicMaterial({
        color: 0xffcc66,
      }),
    };

    // 2. Build Exhibit 1: The Chronos Seed (NUL-001) - Left Display
    createDisplayCase({
      id: 'NUL-001',
      name: 'The Chronos Seed',
      classification: 'Temporal Specimen',
      position: new THREE.Vector3(-5.5, 0, 3.2),
      rotationY: Math.PI * 0.25,
      materials,
      createArtifact: buildChronosArtifact,
    });

    // 3. Build Exhibit 2: The Leviathan's Feather (NUL-002) - Right Display
    createDisplayCase({
      id: 'NUL-002',
      name: "The Leviathan's Feather",
      classification: 'Bioluminescent Biocrystal',
      position: new THREE.Vector3(5.5, 0, 3.2),
      rotationY: -Math.PI * 0.25,
      materials,
      createArtifact: buildLeviathanFeatherArtifact,
    });

    // 4. Build Exhibit 3: The Crystal City of Al-Qona (NUL-003) - Central Grand Vitrine
    createGrandVitrine({
      id: 'NUL-003',
      name: 'The Crystal City of Al-Qona',
      classification: 'Subterranean Architectural Relic',
      position: new THREE.Vector3(0, 0, -2.5),
      materials,
      createArtifact: buildCrystalCityArtifact,
    });

    console.log(`[MuseumExhibits] ${exhibitObjects.length} interactive exhibits ready.`);
    return { colliders, exhibits: exhibitObjects };
  }

  /**
   * Builds an individual architectural display case
   */
  function createDisplayCase(config) {
    const group = new THREE.Group();
    group.position.copy(config.position);
    group.rotation.y = config.rotationY || 0;

    const { materials } = config;

    // 1. Carved Plinth Base
    const baseGeo = new THREE.BoxGeometry(1.6, 1.1, 1.6);
    const base = new THREE.Mesh(baseGeo, materials.plinth);
    base.position.y = 0.55;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Decorative bronze plinth moldings
    const moldGeo = new THREE.BoxGeometry(1.7, 0.12, 1.7);
    const mold = new THREE.Mesh(moldGeo, materials.bronzeTrim);
    mold.position.y = 1.12;
    group.add(mold);

    // 2. Glass Vitrine Enclosure
    const glassGeo = new THREE.BoxGeometry(1.5, 1.8, 1.5);
    const glass = new THREE.Mesh(glassGeo, materials.glass);
    glass.position.y = 2.05;
    group.add(glass);

    // Vitrine bronze top cap
    const topCapGeo = new THREE.BoxGeometry(1.58, 0.1, 1.58);
    const topCap = new THREE.Mesh(topCapGeo, materials.bronzeTrim);
    topCap.position.y = 2.98;
    group.add(topCap);

    // 3. Interior Warm Spotlight
    const spot = new THREE.SpotLight(0xfff1d0, 1.8, 4.5, Math.PI / 4, 0.4, 1);
    spot.position.set(0, 2.9, 0);
    spot.target.position.set(0, 1.8, 0);
    group.add(spot);
    group.add(spot.target);

    // 4. Curatorial Podium Stand with Plaque (in front of vitrine)
    const podiumGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.95, 8);
    const podium = new THREE.Mesh(podiumGeo, materials.bronzeTrim);
    podium.position.set(0, 0.48, 1.05);
    group.add(podium);

    const plaqueGeo = new THREE.BoxGeometry(0.55, 0.35, 0.03);
    const plaque = new THREE.Mesh(plaqueGeo, materials.plinth);
    plaque.position.set(0, 0.96, 1.05);
    plaque.rotation.x = -Math.PI / 5;
    group.add(plaque);

    // Plaque identification label canvas
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 256;
    pCanvas.height = 128;
    const pCtx = pCanvas.getContext('2d');
    pCtx.fillStyle = '#10151f';
    pCtx.fillRect(0, 0, 256, 128);
    pCtx.strokeStyle = '#69c7d5';
    pCtx.lineWidth = 4;
    pCtx.strokeRect(2, 2, 252, 124);
    pCtx.fillStyle = '#d4b477';
    pCtx.font = 'bold 22px serif';
    pCtx.textAlign = 'center';
    pCtx.fillText(config.id, 128, 40);
    pCtx.fillStyle = '#e9e2d2';
    pCtx.font = '16px sans-serif';
    pCtx.fillText(config.name, 128, 76);
    pCtx.fillStyle = '#69c7d5';
    pCtx.font = '12px monospace';
    pCtx.fillText('[PRESS E TO INSPECT]', 128, 106);

    const pTex = new THREE.CanvasTexture(pCanvas);
    const pMat = new THREE.MeshBasicMaterial({ map: pTex });
    const pMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.3), pMat);
    pMesh.position.set(0, 0.97, 1.07);
    pMesh.rotation.x = -Math.PI / 5;
    group.add(pMesh);

    // 5. Build Specific 3D Artifact Inside
    if (config.createArtifact) {
      const artifact = config.createArtifact(materials);
      artifact.position.y = 1.85;
      group.add(artifact);
    }

    scene.add(group);

    // Register Exhibit for interaction
    exhibitObjects.push({
      id: config.id,
      name: config.name,
      classification: config.classification,
      worldPosition: config.position.clone(),
      viewRadius: 3.2,
    });

    // Register Box Collider
    colliders.push({
      type: 'box',
      minX: config.position.x - 1.1,
      maxX: config.position.x + 1.1,
      minZ: config.position.z - 1.2,
      maxZ: config.position.z + 1.2,
    });
  }

  /**
   * Central Large Vitrine (for The Crystal City)
   */
  function createGrandVitrine(config) {
    const group = new THREE.Group();
    group.position.copy(config.position);

    const { materials } = config;

    // Grand carved plinth
    const plinthGeo = new THREE.BoxGeometry(3.6, 1.1, 2.6);
    const plinth = new THREE.Mesh(plinthGeo, materials.plinth);
    plinth.position.y = 0.55;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    group.add(plinth);

    const moldGeo = new THREE.BoxGeometry(3.75, 0.12, 2.75);
    const mold = new THREE.Mesh(moldGeo, materials.bronzeTrim);
    mold.position.y = 1.12;
    group.add(mold);

    // Grand glass vitrine
    const glassGeo = new THREE.BoxGeometry(3.4, 2.2, 2.4);
    const glass = new THREE.Mesh(glassGeo, materials.glass);
    glass.position.y = 2.25;
    group.add(glass);

    const topCapGeo = new THREE.BoxGeometry(3.5, 0.12, 2.5);
    const topCap = new THREE.Mesh(topCapGeo, materials.bronzeTrim);
    topCap.position.y = 3.38;
    group.add(topCap);

    // Grand interior spotlights
    const spot1 = new THREE.SpotLight(0x69c7d5, 2.2, 5, Math.PI / 3, 0.4, 1);
    spot1.position.set(-1.2, 3.3, 0);
    spot1.target.position.set(0, 1.8, 0);
    group.add(spot1);
    group.add(spot1.target);

    const spot2 = new THREE.SpotLight(0xffecc2, 1.8, 5, Math.PI / 3, 0.4, 1);
    spot2.position.set(1.2, 3.3, 0);
    spot2.target.position.set(0, 1.8, 0);
    group.add(spot2);
    group.add(spot2.target);

    // Build artifact inside
    if (config.createArtifact) {
      const artifact = config.createArtifact(materials);
      artifact.position.y = 1.25;
      group.add(artifact);
    }

    scene.add(group);

    exhibitObjects.push({
      id: config.id,
      name: config.name,
      classification: config.classification,
      worldPosition: config.position.clone(),
      viewRadius: 3.8,
    });

    colliders.push({
      type: 'box',
      minX: config.position.x - 2.1,
      maxX: config.position.x + 2.1,
      minZ: config.position.z - 1.5,
      maxZ: config.position.z + 1.5,
    });
  }

  /**
   * Artifact 1: The Chronos Seed (NUL-001)
   * Kinetic Armillary Sphere with concentric bronze rings & glowing core
   */
  function buildChronosArtifact(mat) {
    const group = new THREE.Group();

    // Central Glowing Tachyon Core
    const coreGeo = new THREE.IcosahedronGeometry(0.18, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x69c7d5,
      emissive: 0x69c7d5,
      emissiveIntensity: 0.85,
      roughness: 0.1,
      metalness: 0.2,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Three Concentric Bronze Armillary Rings
    const ringRadii = [0.35, 0.48, 0.62];
    chronosRings = [];

    ringRadii.forEach((r, idx) => {
      const ringGeo = new THREE.TorusGeometry(r, 0.022, 12, 36);
      const ring = new THREE.Mesh(ringGeo, mat.bronzeTrim);
      ring.rotation.x = (idx * Math.PI) / 3;
      ring.rotation.y = (idx * Math.PI) / 4;
      group.add(ring);
      chronosRings.push(ring);
    });

    // Base pedestal stand
    const standGeo = new THREE.CylinderGeometry(0.04, 0.14, 0.4, 16);
    const stand = new THREE.Mesh(standGeo, mat.bronzeTrim);
    stand.position.y = -0.45;
    group.add(stand);

    return group;
  }

  /**
   * Artifact 2: The Leviathan's Feather (NUL-002)
   * Iridescent bioluminescent crystalline feather floating vertically
   */
  function buildLeviathanFeatherArtifact(mat) {
    const group = new THREE.Group();

    // Central rachis / shaft
    const shaftCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, -0.65, 0),
      new THREE.Vector3(0.08, 0, 0.06),
      new THREE.Vector3(-0.06, 0.75, 0)
    );
    const shaftGeo = new THREE.TubeGeometry(shaftCurve, 24, 0.016, 8, false);
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0xe0f7fa,
      roughness: 0.2,
      metalness: 0.6,
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    group.add(shaft);

    // Iridescent crystalline vanes (semi-translucent cyan/purple bioluminescent crystal)
    const featherMat = new THREE.MeshPhysicalMaterial({
      color: 0x69c7d5,
      emissive: 0x5c4da8,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.85,
      roughness: 0.15,
      metalness: 0.3,
      transmission: 0.7,
      ior: 1.6,
    });

    // Vane segments radiating outward
    for (let i = -12; i <= 14; i++) {
      const t = (i + 12) / 26;
      const width = Math.sin(t * Math.PI) * 0.28;
      const y = -0.6 + t * 1.35;

      const barbLeftGeo = new THREE.ConeGeometry(0.012, width, 4);
      barbLeftGeo.rotateZ(Math.PI / 2.3);
      const barbLeft = new THREE.Mesh(barbLeftGeo, featherMat);
      barbLeft.position.set(-width / 2, y, 0);
      group.add(barbLeft);

      const barbRightGeo = new THREE.ConeGeometry(0.012, width * 0.9, 4);
      barbRightGeo.rotateZ(-Math.PI / 2.3);
      const barbRight = new THREE.Mesh(barbRightGeo, featherMat);
      barbRight.position.set(width / 2, y, 0);
      group.add(barbRight);
    }

    leviathanFeather = group;
    return group;
  }

  /**
   * Artifact 3: The Crystal City of Al-Qona (NUL-003)
   * Miniature quartz geode metropolis with glowing spires & micro-colonnades
   */
  function buildCrystalCityArtifact(mat) {
    const group = new THREE.Group();

    // Geode Basalt Base Platter
    const baseGeo = new THREE.CylinderGeometry(1.4, 1.5, 0.22, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1f1d1a,
      roughness: 0.85,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.11;
    group.add(base);

    // Faceted Quartz Crystals & Micro-Spires
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0xaef2fc,
      emissive: 0x3d9cb0,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.9,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.65,
      ior: 1.54,
    });

    const spireCount = 38;
    for (let i = 0; i < spireCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = Math.random() * 1.1;
      const height = 0.35 + Math.random() * 0.95;
      const radius = 0.04 + Math.random() * 0.05;

      const spireGeo = new THREE.CylinderGeometry(0.005, radius, height, 6);
      const spire = new THREE.Mesh(spireGeo, crystalMat);
      spire.position.set(Math.sin(ang) * dist, 0.22 + height / 2, Math.cos(ang) * dist);
      spire.rotation.x = (Math.random() - 0.5) * 0.15;
      spire.rotation.z = (Math.random() - 0.5) * 0.15;
      group.add(spire);
    }

    // Central Tallest Spire / Citadel
    const citadelGeo = new THREE.CylinderGeometry(0.01, 0.09, 1.35, 6);
    const citadel = new THREE.Mesh(citadelGeo, crystalMat);
    citadel.position.set(0, 0.22 + 1.35 / 2, 0);
    group.add(citadel);

    // Internal Harmonic Pulsing Light
    const pulseLight = new THREE.PointLight(0x69c7d5, 2.5, 3.5);
    pulseLight.position.set(0, 0.8, 0);
    group.add(pulseLight);
    crystalCityLights.push(pulseLight);

    return group;
  }

  /**
   * Updates kinetic artifact animations and checks player proximity
   */
  function update(delta, playerPos) {
    // 1. Animate Chronos Rings (Counter-rotation)
    if (chronosRings.length === 3) {
      chronosRings[0].rotation.x += delta * 0.85;
      chronosRings[0].rotation.y += delta * 0.45;
      chronosRings[1].rotation.y -= delta * 0.65;
      chronosRings[1].rotation.z += delta * 0.35;
      chronosRings[2].rotation.z += delta * 0.5;
      chronosRings[2].rotation.x -= delta * 0.3;
    }

    // 2. Animate Leviathan's Feather (Gentle levitation and yaw sway)
    if (leviathanFeather) {
      const time = performance.now() * 0.0015;
      leviathanFeather.position.y = 1.85 + Math.sin(time) * 0.045;
      leviathanFeather.rotation.y = Math.sin(time * 0.7) * 0.25;
    }

    // 3. Pulse Crystal City Light
    if (crystalCityLights.length > 0) {
      const time = performance.now() * 0.0025;
      crystalCityLights[0].intensity = 2.0 + Math.sin(time) * 0.8;
    }

    // 4. Proximity Detection
    let activeExhibit = null;
    let minDistance = Infinity;

    for (let i = 0; i < exhibitObjects.length; i++) {
      const ex = exhibitObjects[i];
      const dist = playerPos.distanceTo(ex.worldPosition);

      if (dist < ex.viewRadius && dist < minDistance) {
        minDistance = dist;
        activeExhibit = ex;
      }
    }

    return activeExhibit;
  }

  return {
    build,
    update,
    getExhibits: () => exhibitObjects,
  };
})();
