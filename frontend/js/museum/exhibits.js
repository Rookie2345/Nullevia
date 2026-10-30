/**
 * NULLEVIA Interactive Exhibits & Premium Vitrines
 * 
 * Rebuilt with architectural tiered pedestals, crystal glass vitrines,
 * dedicated golden spotlights, and faithfully preserved specimens.
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

    // 1. Premium Display Case Materials
    const materials = {
      plinthStone: new THREE.MeshStandardMaterial({
        color: 0x2e2720,
        roughness: 0.65,
        metalness: 0.1,
      }),
      ivoryMarble: new THREE.MeshStandardMaterial({
        color: 0xd8d0c2,
        roughness: 0.42,
        metalness: 0.15,
      }),
      bronzeTrim: new THREE.MeshStandardMaterial({
        color: 0xd4b477,
        roughness: 0.3,
        metalness: 0.82,
      }),
      crystalGlass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.28,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.94,
        ior: 1.54,
      }),
      cyanGlow: new THREE.MeshBasicMaterial({
        color: 0x69c7d5,
      }),
      goldGlow: new THREE.MeshBasicMaterial({
        color: 0xffd175,
      }),
    };

    // 2. Build Exhibit 1: The Chronos Seed (NUL-001) - Left Gallery Plaza
    createDisplayCase({
      id: 'NUL-001',
      name: 'The Chronos Seed',
      classification: 'Temporal Specimen',
      position: new THREE.Vector3(-6.2, 0, 2.8),
      rotationY: Math.PI * 0.22,
      materials,
      createArtifact: buildChronosArtifact,
    });

    // 3. Build Exhibit 2: The Leviathan's Feather (NUL-002) - Right Gallery Plaza
    createDisplayCase({
      id: 'NUL-002',
      name: "The Leviathan's Feather",
      classification: 'Bioluminescent Biocrystal',
      position: new THREE.Vector3(6.2, 0, 2.8),
      rotationY: -Math.PI * 0.22,
      materials,
      createArtifact: buildLeviathanFeatherArtifact,
    });

    // 4. Build Exhibit 3: The Crystal City of Al-Qona (NUL-003) - Central Sunken Plaza Vitrine
    createGrandVitrine({
      id: 'NUL-003',
      name: 'The Crystal City of Al-Qona',
      classification: 'Subterranean Architectural Relic',
      position: new THREE.Vector3(0, 0, -3.2),
      materials,
      createArtifact: buildCrystalCityArtifact,
    });

    console.log(`[MuseumExhibits] ${exhibitObjects.length} premium exhibits installed.`);
    return { colliders, exhibits: exhibitObjects };
  }

  /**
   * Builds an architecturally detailed individual display case
   */
  function createDisplayCase(config) {
    const group = new THREE.Group();
    group.position.copy(config.position);
    group.rotation.y = config.rotationY || 0;

    const { materials } = config;

    // 1. Stepped Plinth Base
    // Bottom stone plinth slab
    const slabGeo = new THREE.BoxGeometry(1.85, 0.25, 1.85);
    const slab = new THREE.Mesh(slabGeo, materials.plinthStone);
    slab.position.y = 0.125;
    slab.castShadow = true;
    slab.receiveShadow = true;
    group.add(slab);

    // Mid-plinth ivory marble riser with bronze bevels
    const midGeo = new THREE.BoxGeometry(1.55, 0.75, 1.55);
    const mid = new THREE.Mesh(midGeo, materials.ivoryMarble);
    mid.position.y = 0.625;
    mid.castShadow = true;
    mid.receiveShadow = true;
    group.add(mid);

    // Antique bronze cornice molding
    const corniceGeo = new THREE.BoxGeometry(1.72, 0.14, 1.72);
    const cornice = new THREE.Mesh(corniceGeo, materials.bronzeTrim);
    cornice.position.y = 1.07;
    group.add(cornice);

    // 2. Crystal Glass Vitrine Enclosure
    const glassGeo = new THREE.BoxGeometry(1.5, 1.85, 1.5);
    const glass = new THREE.Mesh(glassGeo, materials.crystalGlass);
    glass.position.y = 2.05;
    group.add(glass);

    // Brass corner brackets for vitrine
    const bracketPositions = [
      { x: -0.74, z: -0.74 },
      { x: 0.74, z: -0.74 },
      { x: -0.74, z: 0.74 },
      { x: 0.74, z: 0.74 },
    ];
    bracketPositions.forEach((bp) => {
      const bGeo = new THREE.CylinderGeometry(0.016, 0.016, 1.85, 6);
      const bMesh = new THREE.Mesh(bGeo, materials.bronzeTrim);
      bMesh.position.set(bp.x, 2.05, bp.z);
      group.add(bMesh);
    });

    // Vitrine top bronze hood
    const hoodGeo = new THREE.BoxGeometry(1.62, 0.16, 1.62);
    const hood = new THREE.Mesh(hoodGeo, materials.bronzeTrim);
    hood.position.y = 3.05;
    group.add(hood);

    // 3. Dedicated Interior Warm Spotlight
    const spot = new THREE.SpotLight(0xffecc2, 2.2, 5.5, Math.PI / 3.8, 0.35, 1);
    spot.position.set(0, 3.0, 0);
    spot.target.position.set(0, 1.85, 0);
    group.add(spot);
    group.add(spot.target);

    // 4. Curatorial Stanchion Podium & Engraved Brass Plaque
    const stanchionGeo = new THREE.CylinderGeometry(0.035, 0.045, 0.9, 8);
    const stanchion = new THREE.Mesh(stanchionGeo, materials.bronzeTrim);
    stanchion.position.set(0, 0.45, 1.15);
    group.add(stanchion);

    const plaqueBaseGeo = new THREE.BoxGeometry(0.62, 0.38, 0.04);
    const plaqueBase = new THREE.Mesh(plaqueBaseGeo, materials.plinthStone);
    plaqueBase.position.set(0, 0.95, 1.15);
    plaqueBase.rotation.x = -Math.PI / 4.5;
    group.add(plaqueBase);

    // Plaque identification label canvas
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 512;
    pCanvas.height = 256;
    const pCtx = pCanvas.getContext('2d');
    pCtx.fillStyle = '#10151f';
    pCtx.fillRect(0, 0, 512, 256);
    pCtx.strokeStyle = '#d4b477';
    pCtx.lineWidth = 6;
    pCtx.strokeRect(4, 4, 504, 248);
    pCtx.fillStyle = '#d4b477';
    pCtx.font = 'bold 36px serif';
    pCtx.textAlign = 'center';
    pCtx.fillText(config.id, 256, 68);
    pCtx.fillStyle = '#e9e2d2';
    pCtx.font = '28px sans-serif';
    pCtx.fillText(config.name, 256, 130);
    pCtx.fillStyle = '#69c7d5';
    pCtx.font = 'bold 20px monospace';
    pCtx.fillText('[PRESS E TO INSPECT]', 256, 195);

    const pTex = new THREE.CanvasTexture(pCanvas);
    const pMat = new THREE.MeshBasicMaterial({ map: pTex });
    const pMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.34), pMat);
    pMesh.position.set(0, 0.96, 1.17);
    pMesh.rotation.x = -Math.PI / 4.5;
    group.add(pMesh);

    // 5. Build Specific 3D Artifact Inside
    if (config.createArtifact) {
      const artifact = config.createArtifact(materials);
      artifact.position.y = 1.9;
      group.add(artifact);
    }

    scene.add(group);

    // Register Exhibit for interaction
    exhibitObjects.push({
      id: config.id,
      name: config.name,
      classification: config.classification,
      worldPosition: config.position.clone(),
      viewRadius: 3.4,
    });

    // Solid Collider Box
    colliders.push({
      type: 'box',
      minX: config.position.x - 1.25,
      maxX: config.position.x + 1.25,
      minZ: config.position.z - 1.35,
      maxZ: config.position.z + 1.35,
    });
  }

  /**
   * Central Grand Vitrine (for The Crystal City)
   */
  function createGrandVitrine(config) {
    const group = new THREE.Group();
    group.position.copy(config.position);

    const { materials } = config;

    // Stepped grand plinth base
    const plinthGeo = new THREE.BoxGeometry(4.2, 0.35, 3.2);
    const plinth = new THREE.Mesh(plinthGeo, materials.plinthStone);
    plinth.position.y = 0.175;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    group.add(plinth);

    const riserGeo = new THREE.BoxGeometry(3.8, 0.65, 2.8);
    const riser = new THREE.Mesh(riserGeo, materials.ivoryMarble);
    riser.position.y = 0.675;
    riser.castShadow = true;
    riser.receiveShadow = true;
    group.add(riser);

    const corniceGeo = new THREE.BoxGeometry(4.0, 0.14, 3.0);
    const cornice = new THREE.Mesh(corniceGeo, materials.bronzeTrim);
    cornice.position.y = 1.07;
    group.add(cornice);

    // Grand Crystal Vitrine
    const glassGeo = new THREE.BoxGeometry(3.6, 2.3, 2.6);
    const glass = new THREE.Mesh(glassGeo, materials.crystalGlass);
    glass.position.y = 2.25;
    group.add(glass);

    const hoodGeo = new THREE.BoxGeometry(3.8, 0.16, 2.8);
    const hood = new THREE.Mesh(hoodGeo, materials.bronzeTrim);
    hood.position.y = 3.48;
    group.add(hood);

    // Grand dual spotlights
    const spot1 = new THREE.SpotLight(0x69c7d5, 2.4, 6.0, Math.PI / 3.2, 0.4, 1);
    spot1.position.set(-1.4, 3.4, 0);
    spot1.target.position.set(0, 1.8, 0);
    group.add(spot1);
    group.add(spot1.target);

    const spot2 = new THREE.SpotLight(0xffecc2, 2.2, 6.0, Math.PI / 3.2, 0.4, 1);
    spot2.position.set(1.4, 3.4, 0);
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
      viewRadius: 4.2,
    });

    colliders.push({
      type: 'box',
      minX: config.position.x - 2.3,
      maxX: config.position.x + 2.3,
      minZ: config.position.z - 1.8,
      maxZ: config.position.z + 1.8,
    });
  }

  /**
   * Artifact 1: The Chronos Seed (NUL-001)
   * Kinetic Armillary Sphere with concentric bronze rings & glowing tachyon core
   */
  function buildChronosArtifact(mat) {
    const group = new THREE.Group();

    // Central Glowing Tachyon Core
    const coreGeo = new THREE.IcosahedronGeometry(0.2, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x69c7d5,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.95,
      roughness: 0.1,
      metalness: 0.3,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Three Concentric Counter-Rotating Bronze Armillary Rings
    const ringRadii = [0.38, 0.52, 0.68];
    chronosRings = [];

    ringRadii.forEach((r, idx) => {
      const ringGeo = new THREE.TorusGeometry(r, 0.024, 12, 36);
      const ring = new THREE.Mesh(ringGeo, mat.bronzeTrim);
      ring.rotation.x = (idx * Math.PI) / 3;
      ring.rotation.y = (idx * Math.PI) / 4;
      group.add(ring);
      chronosRings.push(ring);
    });

    // Base pedestal stand
    const standGeo = new THREE.CylinderGeometry(0.045, 0.16, 0.45, 16);
    const stand = new THREE.Mesh(standGeo, mat.bronzeTrim);
    stand.position.y = -0.48;
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
      new THREE.Vector3(0, -0.7, 0),
      new THREE.Vector3(0.09, 0, 0.06),
      new THREE.Vector3(-0.07, 0.82, 0)
    );
    const shaftGeo = new THREE.TubeGeometry(shaftCurve, 28, 0.018, 8, false);
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0xe0f7fa,
      roughness: 0.2,
      metalness: 0.7,
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    group.add(shaft);

    // Iridescent crystalline vanes (semi-translucent cyan/purple bioluminescent crystal)
    const featherMat = new THREE.MeshPhysicalMaterial({
      color: 0x69c7d5,
      emissive: 0x4a3a8a, // Subtle purple glow
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.88,
      roughness: 0.12,
      metalness: 0.35,
      transmission: 0.75,
      ior: 1.62,
    });

    // Vane segments radiating outward
    for (let i = -14; i <= 16; i++) {
      const t = (i + 14) / 30;
      const width = Math.sin(t * Math.PI) * 0.32;
      const y = -0.65 + t * 1.45;

      const barbLeftGeo = new THREE.ConeGeometry(0.012, width, 4);
      barbLeftGeo.rotateZ(Math.PI / 2.3);
      const barbLeft = new THREE.Mesh(barbLeftGeo, featherMat);
      barbLeft.position.set(-width / 2, y, 0);
      group.add(barbLeft);

      const barbRightGeo = new THREE.ConeGeometry(0.012, width * 0.92, 4);
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
    const baseGeo = new THREE.CylinderGeometry(1.5, 1.6, 0.25, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1c1a17,
      roughness: 0.85,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.125;
    group.add(base);

    // Faceted Quartz Crystals & Micro-Spires
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0xaef2fc,
      emissive: 0x2e8e9e,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.92,
      roughness: 0.08,
      metalness: 0.22,
      transmission: 0.7,
      ior: 1.54,
    });

    const spireCount = 42;
    for (let i = 0; i < spireCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = Math.random() * 1.15;
      const height = 0.38 + Math.random() * 1.05;
      const radius = 0.04 + Math.random() * 0.055;

      const spireGeo = new THREE.CylinderGeometry(0.005, radius, height, 6);
      const spire = new THREE.Mesh(spireGeo, crystalMat);
      spire.position.set(Math.sin(ang) * dist, 0.25 + height / 2, Math.cos(ang) * dist);
      spire.rotation.x = (Math.random() - 0.5) * 0.15;
      spire.rotation.z = (Math.random() - 0.5) * 0.15;
      group.add(spire);
    }

    // Central Tallest Spire / Citadel
    const citadelGeo = new THREE.CylinderGeometry(0.012, 0.1, 1.45, 6);
    const citadel = new THREE.Mesh(citadelGeo, crystalMat);
    citadel.position.set(0, 0.25 + 1.45 / 2, 0);
    group.add(citadel);

    // Internal Harmonic Pulsing Light
    const pulseLight = new THREE.PointLight(0x69c7d5, 2.6, 4.0);
    pulseLight.position.set(0, 0.9, 0);
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
      leviathanFeather.position.y = 1.9 + Math.sin(time) * 0.045;
      leviathanFeather.rotation.y = Math.sin(time * 0.7) * 0.25;
    }

    // 3. Pulse Crystal City Light
    if (crystalCityLights.length > 0) {
      const time = performance.now() * 0.0025;
      crystalCityLights[0].intensity = 2.2 + Math.sin(time) * 0.7;
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
