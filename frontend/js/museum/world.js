/**
 * NULLEVIA Central Grand Hall World Architecture
 * 
 * Faithfully constructs the 3D museum rotunda matching the reference image:
 * - Soaring intersecting cathedral arches with embedded glowing cyan light channels
 * - Monumental circular skylight dome with radial iron tracery
 * - Tall carved stone pillars engraved with glowing cyan glyphs
 * - Polished concentric stone floor with radial inlay patterns
 * - Curved balustrades and portals to the six exhibition wings
 */

window.MuseumWorld = (function () {
  let scene;
  const colliders = [];

  function build(targetScene) {
    scene = targetScene;

    // 1. Procedural Textures & Materials
    const materials = createMaterials();

    // 2. Polished Rotunda Floor
    buildFloor(materials);

    // 3. Monumental Rotunda Wall & Arched Wing Portals
    buildRotundaWalls(materials);

    // 4. Cathedral Intersecting Arches with Cyan Light Channels
    buildCathedralArches(materials);

    // 5. Grand Circular Skylight Dome
    buildSkylightDome(materials);

    // 6. Monolithic Pillars with Glowing Runes
    buildPillars(materials);

    // 7. Balustrades & Elevated Entrance Area
    buildEntranceTerrace(materials);

    console.log(`[MuseumWorld] Central Hall constructed with ${colliders.length} collision zones.`);
    return colliders;
  }

  function createMaterials() {
    // 1. Procedural Rune Canvas Texture for Pillars
    const runeCanvas = document.createElement('canvas');
    runeCanvas.width = 512;
    runeCanvas.height = 1024;
    const ctx = runeCanvas.getContext('2d');

    // Stone background
    ctx.fillStyle = '#1e1c19';
    ctx.fillRect(0, 0, 512, 1024);

    // Stone grain noise
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#282522' : '#141210';
      ctx.fillRect(Math.random() * 512, Math.random() * 1024, 2, 2);
    }

    // Vertical glowing cyan runes
    ctx.strokeStyle = '#69c7d5';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#69c7d5';
    ctx.shadowBlur = 12;

    const glyphs = ['ᚦ', 'ᛃ', 'ᛈ', 'ᛉ', 'ᛋ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ', '⟁', '⏣', '⎔', '◈', '✦', '✧', '⌖'];
    ctx.font = '38px serif';
    ctx.fillStyle = '#a6f3ff';
    ctx.textAlign = 'center';

    for (let col = 1; col <= 2; col++) {
      const x = col === 1 ? 180 : 332;
      for (let y = 140; y < 920; y += 75) {
        const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
        ctx.fillText(glyph, x, y);
      }
    }

    const runeTexture = new THREE.CanvasTexture(runeCanvas);
    runeTexture.wrapS = THREE.RepeatWrapping;
    runeTexture.wrapT = THREE.RepeatWrapping;

    // Floor Canvas Texture (Concentric Rings & Polished Marble Tiles)
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 1024;
    floorCanvas.height = 1024;
    const fCtx = floorCanvas.getContext('2d');

    fCtx.fillStyle = '#161920';
    fCtx.fillRect(0, 0, 1024, 1024);

    // Circular marble inlays
    fCtx.lineWidth = 14;
    fCtx.strokeStyle = '#273142';
    fCtx.beginPath();
    fCtx.arc(512, 512, 420, 0, Math.PI * 2);
    fCtx.stroke();

    fCtx.lineWidth = 8;
    fCtx.strokeStyle = '#d4b477';
    fCtx.beginPath();
    fCtx.arc(512, 512, 340, 0, Math.PI * 2);
    fCtx.stroke();

    fCtx.strokeStyle = '#1d2533';
    fCtx.lineWidth = 12;
    fCtx.beginPath();
    fCtx.arc(512, 512, 220, 0, Math.PI * 2);
    fCtx.stroke();

    const floorTexture = new THREE.CanvasTexture(floorCanvas);

    return {
      stone: new THREE.MeshStandardMaterial({
        color: 0x363028,
        roughness: 0.75,
        metalness: 0.1,
      }),
      stoneIvory: new THREE.MeshStandardMaterial({
        color: 0x8a8275,
        roughness: 0.65,
        metalness: 0.15,
      }),
      woodDark: new THREE.MeshStandardMaterial({
        color: 0x1c140d,
        roughness: 0.8,
        metalness: 0.05,
      }),
      bronze: new THREE.MeshStandardMaterial({
        color: 0xd4b477,
        roughness: 0.35,
        metalness: 0.75,
      }),
      runeStone: new THREE.MeshStandardMaterial({
        map: runeTexture,
        roughness: 0.6,
        metalness: 0.2,
      }),
      floor: new THREE.MeshStandardMaterial({
        map: floorTexture,
        roughness: 0.25, // Sleek polished reflection
        metalness: 0.15,
      }),
      cyanGlow: new THREE.MeshBasicMaterial({
        color: 0x69c7d5,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.9,
        ior: 1.5,
      }),
    };
  }

  function buildFloor(mat) {
    const floorGeo = new THREE.CylinderGeometry(15, 15, 0.4, 48);
    const floor = new THREE.Mesh(floorGeo, mat.floor);
    floor.position.y = -0.2;
    floor.receiveShadow = true;
    scene.add(floor);
  }

  function buildRotundaWalls(mat) {
    // Outer perimeter cylinder with wall thickness
    const wallGeo = new THREE.CylinderGeometry(15, 15, 14, 48, 1, true);
    const wall = new THREE.Mesh(wallGeo, mat.stone);
    wall.position.y = 7;
    wall.receiveShadow = true;
    scene.add(wall);

    // Decorative upper cornice ring
    const corniceGeo = new THREE.TorusGeometry(14.8, 0.35, 12, 48);
    corniceGeo.rotateX(Math.PI / 2);
    const cornice = new THREE.Mesh(corniceGeo, mat.bronze);
    cornice.position.y = 13.8;
    scene.add(cornice);

    // Six Arched Portals leading to future exhibition wings
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
      const x = Math.sin(angle) * 14.5;
      const z = Math.cos(angle) * 14.5;

      const portalGroup = new THREE.Group();
      portalGroup.position.set(x, 0, z);
      portalGroup.lookAt(0, 0, 0);

      // Portal arch frame
      const frameGeo = new THREE.BoxGeometry(3.6, 6.2, 0.5);
      const frame = new THREE.Mesh(frameGeo, mat.stoneIvory);
      frame.position.y = 3.1;
      portalGroup.add(frame);

      // Inner dark hallway recess
      const recessGeo = new THREE.BoxGeometry(2.6, 5.2, 1.2);
      const recess = new THREE.Mesh(recessGeo, mat.woodDark);
      recess.position.set(0, 2.6, 0.4);
      portalGroup.add(recess);

      // Glowing portal cyan arch border
      const archBorderGeo = new THREE.BoxGeometry(2.8, 0.08, 0.08);
      const archBorder = new THREE.Mesh(archBorderGeo, mat.cyanGlow);
      archBorder.position.set(0, 5.2, -0.22);
      portalGroup.add(archBorder);

      // Wing Name Plaque
      const plaqueCanvas = document.createElement('canvas');
      plaqueCanvas.width = 512;
      plaqueCanvas.height = 96;
      const pCtx = plaqueCanvas.getContext('2d');
      pCtx.fillStyle = '#10151f';
      pCtx.fillRect(0, 0, 512, 96);
      pCtx.strokeStyle = '#d4b477';
      pCtx.lineWidth = 4;
      pCtx.strokeRect(4, 4, 504, 88);
      pCtx.font = 'bold 28px serif';
      pCtx.fillStyle = '#e9e2d2';
      pCtx.textAlign = 'center';
      pCtx.fillText(wingNames[i].toUpperCase(), 256, 56);

      const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
      const plaqueMat = new THREE.MeshBasicMaterial({ map: plaqueTex });
      const plaqueGeo = new THREE.PlaneGeometry(2.4, 0.45);
      const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
      plaque.position.set(0, 5.65, -0.26);
      plaque.rotation.y = Math.PI;
      portalGroup.add(plaque);

      scene.add(portalGroup);
    }
  }

  /**
   * Monumental Cathedral Intersecting Arches
   * Directly inspired by the reference image with stone ribs and embedded cyan glow channels
   */
  function buildCathedralArches(mat) {
    const archCount = 8;
    const radius = 14;

    for (let i = 0; i < archCount; i++) {
      const angle = (i * Math.PI * 2) / archCount;
      const nextAngle = ((i + 2) * Math.PI * 2) / archCount;

      const archCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(Math.sin(angle) * radius, 0, Math.cos(angle) * radius),
        new THREE.Vector3(0, 22, 0), // Soaring apex near dome
        new THREE.Vector3(Math.sin(nextAngle) * radius, 0, Math.cos(nextAngle) * radius)
      );

      // 1. Carved Outer Stone Arch Rib
      const ribGeo = new THREE.TubeGeometry(archCurve, 32, 0.32, 8, false);
      const rib = new THREE.Mesh(ribGeo, mat.stoneIvory);
      rib.castShadow = true;
      scene.add(rib);

      // 2. Embedded Glowing Cyan Light Channel (Inner neon strip from reference image)
      const glowGeo = new THREE.TubeGeometry(archCurve, 32, 0.08, 6, false);
      const glowRib = new THREE.Mesh(glowGeo, mat.cyanGlow);
      glowRib.position.y -= 0.15; // Slightly recessed under the arch
      scene.add(glowRib);
    }
  }

  /**
   * Monumental Circular Skylight Dome
   * Diffuses sunlight through radial iron tracery into the rotunda
   */
  function buildSkylightDome(mat) {
    const domeGroup = new THREE.Group();
    domeGroup.position.set(0, 16.5, 0);

    // 1. Dome Glass Shell
    const domeGeo = new THREE.SphereGeometry(6.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeGlass = new THREE.Mesh(domeGeo, mat.glass);
    domeGroup.add(domeGlass);

    // 2. Radial Iron / Bronze Tracery Ribs
    const ribs = 12;
    for (let i = 0; i < ribs; i++) {
      const ang = (i * Math.PI * 2) / ribs;
      const ribCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(Math.sin(ang) * 6.5, 0, Math.cos(ang) * 6.5),
        new THREE.Vector3(Math.sin(ang) * 3.5, 4.2, Math.cos(ang) * 3.5),
        new THREE.Vector3(0, 5.5, 0)
      );
      const ribGeo = new THREE.TubeGeometry(ribCurve, 16, 0.08, 6, false);
      const rib = new THREE.Mesh(ribGeo, mat.bronze);
      domeGroup.add(rib);
    }

    // Central Oculus Ring
    const oculusGeo = new THREE.TorusGeometry(1.2, 0.1, 8, 24);
    oculusGeo.rotateX(Math.PI / 2);
    const oculus = new THREE.Mesh(oculusGeo, mat.bronze);
    oculus.position.y = 5.3;
    domeGroup.add(oculus);

    scene.add(domeGroup);
  }

  /**
   * Tall Carved Stone Pillars with Glowing Vertical Runes
   */
  function buildPillars(mat) {
    const pillarPositions = [
      { x: -9.5, z: -3.5 },
      { x: -9.5, z: 3.5 },
      { x: 9.5, z: -3.5 },
      { x: 9.5, z: 3.5 },
      { x: -3.5, z: -9.5 },
      { x: 3.5, z: -9.5 },
    ];

    pillarPositions.forEach((pos) => {
      const pillarGroup = new THREE.Group();
      pillarGroup.position.set(pos.x, 0, pos.z);

      // Pillar base plinth
      const baseGeo = new THREE.BoxGeometry(1.6, 1.2, 1.6);
      const base = new THREE.Mesh(baseGeo, mat.stone);
      base.position.y = 0.6;
      base.castShadow = true;
      base.receiveShadow = true;
      pillarGroup.add(base);

      // Main pillar shaft with glowing rune texture
      const shaftGeo = new THREE.CylinderGeometry(0.65, 0.72, 11, 16);
      const shaft = new THREE.Mesh(shaftGeo, mat.runeStone);
      shaft.position.y = 6.6;
      shaft.castShadow = true;
      shaft.receiveShadow = true;
      pillarGroup.add(shaft);

      // Pillar Capital
      const capGeo = new THREE.BoxGeometry(1.5, 0.8, 1.5);
      const cap = new THREE.Mesh(capGeo, mat.stoneIvory);
      cap.position.y = 12.4;
      pillarGroup.add(cap);

      scene.add(pillarGroup);

      // Add cylinder collider
      colliders.push({
        type: 'cylinder',
        x: pos.x,
        z: pos.z,
        radius: 0.9,
      });
    });
  }

  /**
   * Entrance Terrace, Balustrades & Steps
   */
  function buildEntranceTerrace(mat) {
    // Entrance vestibule floor (elevated by 0.35m at z = 10m)
    const vestibuleGeo = new THREE.BoxGeometry(7, 0.4, 4.5);
    const vestibule = new THREE.Mesh(vestibuleGeo, mat.stoneIvory);
    vestibule.position.set(0, 0.2, 10.5);
    vestibule.receiveShadow = true;
    scene.add(vestibule);

    // Curved steps down to main rotunda floor
    const step1Geo = new THREE.CylinderGeometry(4.2, 4.2, 0.15, 32, 1, false, Math.PI, Math.PI);
    const step1 = new THREE.Mesh(step1Geo, mat.stone);
    step1.position.set(0, 0.15, 8.5);
    scene.add(step1);

    // Curved balustrade railing (Reference image foreground)
    const railRadius = 5.2;
    const railCurve = new THREE.EllipseCurve(
      0, 0,
      railRadius, railRadius,
      Math.PI * 0.15, Math.PI * 0.85,
      false, 0
    );
    const railPoints = railCurve.getPoints(24).map(p => new THREE.Vector3(p.x, 0.9, p.y + 3.2));
    const railCatmull = new THREE.CatmullRomCurve3(railPoints);
    const railGeo = new THREE.TubeGeometry(railCatmull, 24, 0.08, 8, false);
    const railing = new THREE.Mesh(railGeo, mat.bronze);
    scene.add(railing);

    // Balustrade balusters/posts
    for (let i = 0; i < railPoints.length; i += 3) {
      const pt = railPoints[i];
      const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.85, 8);
      const post = new THREE.Mesh(postGeo, mat.bronze);
      post.position.set(pt.x, 0.45, pt.z);
      scene.add(post);
    }
  }

  return {
    build,
    getColliders: () => colliders,
  };
})();
