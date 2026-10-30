/**
 * NULLEVIA Central Grand Hall — Monumental Architectural World
 * 
 * Inspired by the Cathedral of Light reference architecture:
 * - Double-tier colonnade with 12 fluted pillars & Corinthian capitals
 * - Sweeping mezzanine balcony with bronze balustrades & warm under-glow
 * - Fan-vaulted Gothic arched bays with multi-layered ribs & window tracery
 * - Monumental Rosette Skylight Dome with concentric radial metal framework
 * - Sunken amphitheater plaza with subtle edge lighting
 * - Polished obsidian & ivory marble floor with geometric bronze inlays
 */

window.MuseumWorld = (function () {
  let scene;
  const colliders = [];

  function build(targetScene) {
    scene = targetScene;

    // 1. Procedural PBR Textures & Materials
    const materials = createMaterials();

    // 2. Polished Marble Floor & Sunken Plaza
    buildFloor(materials);

    // 3. Ground Colonnade (12 Monumental Fluted Pillars)
    buildGroundColonnade(materials);

    // 4. Mezzanine Balcony & Curved Balustrades
    buildMezzanineBalcony(materials);

    // 5. Fan-Vaulted Arched Bays & Upper Arcade
    buildFanVaultedArcade(materials);

    // 6. Monumental Rosette Skylight Dome
    buildRosetteSkylightDome(materials);

    // 7. Outer Wall Enclosure, Niches & Wing Portals
    buildOuterWallsAndPortals(materials);

    console.log(`[MuseumWorld] Monumental Grand Hall constructed with ${colliders.length} collision zones.`);
    return colliders;
  }

  /**
   * High-quality procedural textures and PBR materials optimized for Intel HD 520
   */
  function createMaterials() {
    // 1. Luxury Polished Marble Floor Canvas Texture
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 1024;
    floorCanvas.height = 1024;
    const fCtx = floorCanvas.getContext('2d');

    // Dark obsidian/navy marble base
    fCtx.fillStyle = '#10141c';
    fCtx.fillRect(0, 0, 1024, 1024);

    // Subtle natural marble grain/veining
    for (let i = 0; i < 2800; i++) {
      fCtx.fillStyle = Math.random() > 0.6 ? '#1b2330' : '#0c0f16';
      fCtx.fillRect(Math.random() * 1024, Math.random() * 1024, 3, 3);
    }

    // Concentric geometric bronze & ivory inlay bands
    fCtx.lineWidth = 10;
    fCtx.strokeStyle = '#252f40';
    fCtx.beginPath();
    fCtx.arc(512, 512, 480, 0, Math.PI * 2);
    fCtx.stroke();

    fCtx.lineWidth = 6;
    fCtx.strokeStyle = '#d4b477'; // Antique gold
    fCtx.beginPath();
    fCtx.arc(512, 512, 430, 0, Math.PI * 2);
    fCtx.stroke();

    fCtx.lineWidth = 14;
    fCtx.strokeStyle = '#1a222e';
    fCtx.beginPath();
    fCtx.arc(512, 512, 340, 0, Math.PI * 2);
    fCtx.stroke();

    fCtx.lineWidth = 5;
    fCtx.strokeStyle = '#d4b477';
    fCtx.beginPath();
    fCtx.arc(512, 512, 240, 0, Math.PI * 2);
    fCtx.stroke();

    // Central 12-point geometric rosette star
    fCtx.strokeStyle = '#69c7d5';
    fCtx.lineWidth = 2.5;
    for (let i = 0; i < 12; i++) {
      const ang = (i * Math.PI * 2) / 12;
      fCtx.beginPath();
      fCtx.moveTo(512, 512);
      fCtx.lineTo(512 + Math.cos(ang) * 235, 512 + Math.sin(ang) * 235);
      fCtx.stroke();
    }

    const floorTex = new THREE.CanvasTexture(floorCanvas);

    // 2. Fluted Stone Pillar Canvas Texture
    const flutedCanvas = document.createElement('canvas');
    flutedCanvas.width = 512;
    flutedCanvas.height = 512;
    const pCtx = flutedCanvas.getContext('2d');
    pCtx.fillStyle = '#3a332a';
    pCtx.fillRect(0, 0, 512, 512);

    // Vertical fluting shadows
    const fluteCount = 20;
    const fluteWidth = 512 / fluteCount;
    for (let i = 0; i < fluteCount; i++) {
      const x = i * fluteWidth;
      const grad = pCtx.createLinearGradient(x, 0, x + fluteWidth, 0);
      grad.addColorStop(0, '#241f19');
      grad.addColorStop(0.5, '#4f463a');
      grad.addColorStop(1, '#241f19');
      pCtx.fillStyle = grad;
      pCtx.fillRect(x + 2, 0, fluteWidth - 4, 512);
    }
    const flutedTex = new THREE.CanvasTexture(flutedCanvas);
    flutedTex.wrapS = THREE.RepeatWrapping;
    flutedTex.wrapT = THREE.RepeatWrapping;

    return {
      // Warm carved stone
      stone: new THREE.MeshStandardMaterial({
        color: 0x3d352b,
        roughness: 0.72,
        metalness: 0.1,
      }),
      // Ivory marble moldings & capitals
      ivoryMarble: new THREE.MeshStandardMaterial({
        color: 0xd8d0c2,
        roughness: 0.45,
        metalness: 0.15,
      }),
      // Fluted column stone
      flutedStone: new THREE.MeshStandardMaterial({
        map: flutedTex,
        roughness: 0.65,
        metalness: 0.12,
      }),
      // Dark coffered wood
      darkWood: new THREE.MeshStandardMaterial({
        color: 0x18120c,
        roughness: 0.78,
        metalness: 0.08,
      }),
      // Antique bronze filigree & railings
      bronze: new THREE.MeshStandardMaterial({
        color: 0xd4b477,
        roughness: 0.32,
        metalness: 0.78,
      }),
      // Polished luxury floor (balanced specular, no expensive real-time render mirrors)
      polishedFloor: new THREE.MeshStandardMaterial({
        map: floorTex,
        roughness: 0.22,
        metalness: 0.2,
      }),
      // Glowing cyan architectural accents
      cyanGlow: new THREE.MeshBasicMaterial({
        color: 0x69c7d5,
      }),
      // Subtle step neon edge glow
      stepGlow: new THREE.MeshBasicMaterial({
        color: 0x4a7a8c, // Muted cyan-teal, keeping purple/neon extremely subtle
      }),
      // Translucent dome glass
      skylightGlass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.88,
        ior: 1.5,
      }),
      // Window panes behind arcade
      windowGlass: new THREE.MeshBasicMaterial({
        color: 0xbbddee,
        transparent: true,
        opacity: 0.3,
      }),
    };
  }

  /**
   * Polished Marble Floor & Sunken Plaza Steps
   */
  function buildFloor(mat) {
    // 1. Main Outer Gallery Floor (y = 0.45m, radius 17m)
    const outerFloorGeo = new THREE.CylinderGeometry(17, 17, 0.4, 48);
    const outerFloor = new THREE.Mesh(outerFloorGeo, mat.stone);
    outerFloor.position.y = -0.2;
    outerFloor.receiveShadow = true;
    scene.add(outerFloor);

    // 2. Sunken Central Plaza (radius 11.2m, y = 0.0m)
    const plazaGeo = new THREE.CylinderGeometry(11.2, 11.2, 0.2, 48);
    const plaza = new THREE.Mesh(plazaGeo, mat.polishedFloor);
    plaza.position.y = 0.0;
    plaza.receiveShadow = true;
    scene.add(plaza);

    // 3. Three Curved Amphitheater Steps with subtle edge lighting
    const stepRadii = [11.2, 11.8, 12.4];
    stepRadii.forEach((r, idx) => {
      const stepY = (3 - idx) * 0.12;

      // Stone step ring
      const stepGeo = new THREE.TorusGeometry(r, 0.07, 8, 48);
      stepGeo.rotateX(Math.PI / 2);
      const step = new THREE.Mesh(stepGeo, mat.ivoryMarble);
      step.position.y = stepY;
      scene.add(step);

      // Subtle step neon edge glow strip under the lip
      const glowGeo = new THREE.TorusGeometry(r - 0.05, 0.02, 6, 48);
      glowGeo.rotateX(Math.PI / 2);
      const glow = new THREE.Mesh(glowGeo, mat.stepGlow);
      glow.position.y = stepY - 0.03;
      scene.add(glow);
    });
  }

  /**
   * Ground Colonnade: 12 Monumental Fluted Pillars with Corinthian capitals & bases
   */
  function buildGroundColonnade(mat) {
    const pillarCount = 12;
    const colonnadeRadius = 13.8;

    for (let i = 0; i < pillarCount; i++) {
      const ang = (i * Math.PI * 2) / pillarCount;
      const x = Math.sin(ang) * colonnadeRadius;
      const z = Math.cos(ang) * colonnadeRadius;

      const columnGroup = new THREE.Group();
      columnGroup.position.set(x, 0, z);

      // 1. Tiered Stepped Plinth Base
      const plinthBaseGeo = new THREE.BoxGeometry(1.6, 0.4, 1.6);
      const plinthBase = new THREE.Mesh(plinthBaseGeo, mat.stone);
      plinthBase.position.y = 0.2;
      plinthBase.castShadow = true;
      plinthBase.receiveShadow = true;
      columnGroup.add(plinthBase);

      const torusBaseGeo = new THREE.TorusGeometry(0.68, 0.12, 10, 24);
      torusBaseGeo.rotateX(Math.PI / 2);
      const torusBase = new THREE.Mesh(torusBaseGeo, mat.bronze);
      torusBase.position.y = 0.5;
      columnGroup.add(torusBase);

      // 2. Fluted Column Shaft
      const shaftGeo = new THREE.CylinderGeometry(0.52, 0.58, 6.4, 24);
      const shaft = new THREE.Mesh(shaftGeo, mat.flutedStone);
      shaft.position.y = 3.7;
      shaft.castShadow = true;
      shaft.receiveShadow = true;
      columnGroup.add(shaft);

      // 3. Corinthian / Classical Capital
      const capitalGeo = new THREE.BoxGeometry(1.45, 0.7, 1.45);
      const capital = new THREE.Mesh(capitalGeo, mat.ivoryMarble);
      capital.position.y = 7.15;
      columnGroup.add(capital);

      const capMoldingGeo = new THREE.TorusGeometry(0.65, 0.08, 8, 20);
      capMoldingGeo.rotateX(Math.PI / 2);
      const capMolding = new THREE.Mesh(capMoldingGeo, mat.bronze);
      capMolding.position.y = 6.8;
      columnGroup.add(capMolding);

      scene.add(columnGroup);

      // Solid cylinder collision box for every column
      colliders.push({
        type: 'cylinder',
        x: x,
        z: z,
        radius: 0.85,
      });
    }
  }

  /**
   * Sweeping Mezzanine Balcony Ring & Curved Bronze Balustrades
   */
  function buildMezzanineBalcony(mat) {
    const balconyGroup = new THREE.Group();
    balconyGroup.position.y = 7.5;

    // 1. Balcony Floor Ring (Inner radius 13.5m, Outer radius 17m)
    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, 17, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 13.5, 0, Math.PI * 2, true);
    ringShape.holes.push(hole);

    const extrudeSettings = { depth: 0.5, bevelEnabled: false, curveSegments: 48 };
    const ringGeo = new THREE.ExtrudeGeometry(ringShape, extrudeSettings);
    ringGeo.rotateX(Math.PI / 2);
    const balconyFloor = new THREE.Mesh(ringGeo, mat.ivoryMarble);
    balconyFloor.receiveShadow = true;
    balconyGroup.add(balconyFloor);

    // 2. Under-balcony Architectural Fascia with warm light trough
    const fasciaGeo = new THREE.TorusGeometry(13.5, 0.22, 10, 48);
    fasciaGeo.rotateX(Math.PI / 2);
    const fascia = new THREE.Mesh(fasciaGeo, mat.bronze);
    fascia.position.y = -0.3;
    balconyGroup.add(fascia);

    // Warm under-balcony light strip
    const underGlowGeo = new THREE.TorusGeometry(13.4, 0.06, 6, 48);
    underGlowGeo.rotateX(Math.PI / 2);
    const underGlow = new THREE.Mesh(underGlowGeo, mat.bronze);
    underGlow.position.y = -0.45;
    balconyGroup.add(underGlow);

    // 3. Curved Bronze Balustrade Railing along the inner edge
    const railingGeo = new THREE.TorusGeometry(13.6, 0.06, 8, 48);
    railingGeo.rotateX(Math.PI / 2);
    const railing = new THREE.Mesh(railingGeo, mat.bronze);
    railing.position.y = 0.95;
    balconyGroup.add(railing);

    // Vertical Balusters
    const balusterCount = 72;
    for (let i = 0; i < balusterCount; i++) {
      const ang = (i * Math.PI * 2) / balusterCount;
      const bx = Math.sin(ang) * 13.6;
      const bz = Math.cos(ang) * 13.6;

      const balusterGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.85, 6);
      const baluster = new THREE.Mesh(balusterGeo, mat.bronze);
      baluster.position.set(bx, 0.45, bz);
      balconyGroup.add(baluster);
    }

    scene.add(balconyGroup);
  }

  /**
   * Fan-Vaulted Gothic Arched Bays & Upper Arcade
   * Multi-layered ribbed vaulting framing the perimeter of the hall
   */
  function buildFanVaultedArcade(mat) {
    const bayCount = 12;
    const colonnadeRadius = 13.8;

    for (let i = 0; i < bayCount; i++) {
      const ang1 = (i * Math.PI * 2) / bayCount;
      const ang2 = ((i + 1) * Math.PI * 2) / bayCount;

      const p1 = new THREE.Vector3(Math.sin(ang1) * colonnadeRadius, 7.5, Math.cos(ang1) * colonnadeRadius);
      const p2 = new THREE.Vector3(Math.sin(ang2) * colonnadeRadius, 7.5, Math.cos(ang2) * colonnadeRadius);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const apex = mid.clone().setY(15.2);

      // 1. Monumental Outer Carved Stone Arch
      const archCurve = new THREE.QuadraticBezierCurve3(p1, apex, p2);
      const archGeo = new THREE.TubeGeometry(archCurve, 24, 0.28, 8, false);
      const archMesh = new THREE.Mesh(archGeo, mat.ivoryMarble);
      archMesh.castShadow = true;
      scene.add(archMesh);

      // 2. Embedded Glowing Cyan Inner Light Channel
      const glowGeo = new THREE.TubeGeometry(archCurve, 24, 0.07, 6, false);
      const glowMesh = new THREE.Mesh(glowGeo, mat.cyanGlow);
      glowMesh.position.y -= 0.12;
      scene.add(glowMesh);

      // 3. Vaulted Ribs converging into Fan-Vault (Radiating toward dome)
      const domeBasePoint = new THREE.Vector3(Math.sin((ang1 + ang2) / 2) * 8.5, 18.5, Math.cos((ang1 + ang2) / 2) * 8.5);
      const fanRib1 = new THREE.QuadraticBezierCurve3(p1, new THREE.Vector3(p1.x * 0.8, 14, p1.z * 0.8), domeBasePoint);
      const fanRib2 = new THREE.QuadraticBezierCurve3(p2, new THREE.Vector3(p2.x * 0.8, 14, p2.z * 0.8), domeBasePoint);

      const rib1Geo = new THREE.TubeGeometry(fanRib1, 20, 0.12, 6, false);
      const rib1Mesh = new THREE.Mesh(rib1Geo, mat.bronze);
      scene.add(rib1Mesh);

      const rib2Geo = new THREE.TubeGeometry(fanRib2, 20, 0.12, 6, false);
      const rib2Mesh = new THREE.Mesh(rib2Geo, mat.bronze);
      scene.add(rib2Mesh);

      // 4. Arched Cathedral Window Bay Glass (letting soft daylight through behind arch)
      const winCurve = new THREE.QuadraticBezierCurve3(
        p1.clone().multiplyScalar(1.15),
        apex.clone().multiplyScalar(1.15),
        p2.clone().multiplyScalar(1.15)
      );
      const winGeo = new THREE.TubeGeometry(winCurve, 16, 0.08, 4, false);
      const winMesh = new THREE.Mesh(winGeo, mat.windowGlass);
      scene.add(winMesh);
    }
  }

  /**
   * Monumental Rosette Skylight Dome
   * Centered overhead with concentric radial metal framework & rosette tracery
   */
  function buildRosetteSkylightDome(mat) {
    const domeGroup = new THREE.Group();
    domeGroup.position.set(0, 18.5, 0);

    const domeRadius = 8.5;
    const domeHeight = 7.5;

    // 1. Semi-translucent Glass Dome Shell
    const domeGeo = new THREE.SphereGeometry(domeRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.1);
    const domeGlass = new THREE.Mesh(domeGeo, mat.skylightGlass);
    domeGroup.add(domeGlass);

    // 2. Circular Base Ring
    const baseRingGeo = new THREE.TorusGeometry(domeRadius, 0.28, 10, 48);
    baseRingGeo.rotateX(Math.PI / 2);
    const baseRing = new THREE.Mesh(baseRingGeo, mat.bronze);
    domeGroup.add(baseRing);

    // 3. Primary 16 Radial Iron Ribs
    const ribCount = 16;
    for (let i = 0; i < ribCount; i++) {
      const ang = (i * Math.PI * 2) / ribCount;
      const ribCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(Math.sin(ang) * domeRadius, 0, Math.cos(ang) * domeRadius),
        new THREE.Vector3(Math.sin(ang) * 4.8, domeHeight * 0.72, Math.cos(ang) * 4.8),
        new THREE.Vector3(0, domeHeight, 0)
      );

      const ribGeo = new THREE.TubeGeometry(ribCurve, 20, 0.09, 6, false);
      const rib = new THREE.Mesh(ribGeo, mat.bronze);
      domeGroup.add(rib);

      // Rosette Petal / Gothic Cross-rib (Interlacing tracery)
      const nextAng = ((i + 1) * Math.PI * 2) / ribCount;
      const petalMidAng = (ang + nextAng) / 2;
      const crossCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(Math.sin(ang) * (domeRadius * 0.65), domeHeight * 0.42, Math.cos(ang) * (domeRadius * 0.65)),
        new THREE.Vector3(Math.sin(petalMidAng) * (domeRadius * 0.78), domeHeight * 0.52, Math.cos(petalMidAng) * (domeRadius * 0.78)),
        new THREE.Vector3(Math.sin(nextAng) * (domeRadius * 0.65), domeHeight * 0.42, Math.cos(nextAng) * (domeRadius * 0.65))
      );
      const crossGeo = new THREE.TubeGeometry(crossCurve, 12, 0.05, 4, false);
      const crossMesh = new THREE.Mesh(crossGeo, mat.bronze);
      domeGroup.add(crossMesh);
    }

    // 4. Central Glowing Oculus Ring
    const oculusGeo = new THREE.TorusGeometry(1.4, 0.16, 8, 24);
    oculusGeo.rotateX(Math.PI / 2);
    const oculus = new THREE.Mesh(oculusGeo, mat.bronze);
    oculus.position.y = domeHeight - 0.15;
    domeGroup.add(oculus);

    // Glowing Oculus Center Lens
    const oculusLensGeo = new THREE.CircleGeometry(1.35, 24);
    oculusLensGeo.rotateX(-Math.PI / 2);
    const oculusLens = new THREE.Mesh(oculusLensGeo, mat.cyanGlow);
    oculusLens.position.y = domeHeight - 0.14;
    domeGroup.add(oculusLens);

    scene.add(domeGroup);
  }

  /**
   * Outer Wall Enclosure, Architectural Niches & Six Wing Portals
   */
  function buildOuterWallsAndPortals(mat) {
    // Outer perimeter cylinder wall with warm carved stone
    const wallGeo = new THREE.CylinderGeometry(17, 17, 24, 48, 1, true);
    const wall = new THREE.Mesh(wallGeo, mat.stone);
    wall.position.y = 12;
    wall.receiveShadow = true;
    scene.add(wall);

    // Six Curated Wing Portals leading to future collections
    const wingNames = [
      'Lost Civilizations',
      'Impossible Inventions',
      'Creatures That Never Were',
      'Objects From Other Realities',
      'Unexplained Objects',
      'Future Archives',
    ];

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6 + Math.PI / 6;
      const x = Math.sin(angle) * 16.5;
      const z = Math.cos(angle) * 16.5;

      const portalGroup = new THREE.Group();
      portalGroup.position.set(x, 0, z);
      portalGroup.lookAt(0, 0, 0);

      // Grand Portal Archway Frame
      const frameGeo = new THREE.BoxGeometry(4.2, 7.2, 0.6);
      const frame = new THREE.Mesh(frameGeo, mat.ivoryMarble);
      frame.position.y = 3.6;
      portalGroup.add(frame);

      // Deep dark corridor recess
      const recessGeo = new THREE.BoxGeometry(3.2, 6.2, 1.4);
      const recess = new THREE.Mesh(recessGeo, mat.darkWood);
      recess.position.set(0, 3.1, 0.5);
      portalGroup.add(recess);

      // Luminous cyan portal trim
      const borderGeo = new THREE.BoxGeometry(3.4, 0.1, 0.1);
      const border = new THREE.Mesh(borderGeo, mat.cyanGlow);
      border.position.set(0, 6.2, -0.28);
      portalGroup.add(border);

      // Wing Name Banner Plaque
      const plaqueCanvas = document.createElement('canvas');
      plaqueCanvas.width = 512;
      plaqueCanvas.height = 100;
      const pCtx = plaqueCanvas.getContext('2d');
      pCtx.fillStyle = '#10151f';
      pCtx.fillRect(0, 0, 512, 100);
      pCtx.strokeStyle = '#d4b477';
      pCtx.lineWidth = 4;
      pCtx.strokeRect(4, 4, 504, 92);
      pCtx.font = 'bold 28px serif';
      pCtx.fillStyle = '#e9e2d2';
      pCtx.textAlign = 'center';
      pCtx.fillText(wingNames[i].toUpperCase(), 256, 58);

      const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
      const plaqueMat = new THREE.MeshBasicMaterial({ map: plaqueTex });
      const plaqueGeo = new THREE.PlaneGeometry(2.8, 0.55);
      const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
      plaque.position.set(0, 6.6, -0.32);
      plaque.rotation.y = Math.PI;
      portalGroup.add(plaque);

      scene.add(portalGroup);
    }
  }

  return {
    build,
    getColliders: () => colliders,
  };
})();
