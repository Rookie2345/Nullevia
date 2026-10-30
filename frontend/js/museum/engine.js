/**
 * NULLEVIA 3D Engine Core
 * 
 * Manages Three.js scene, camera, optimized renderer,
 * and graphics presets for Intel HD Graphics 520.
 */

window.MuseumEngine = (function () {
  let scene, camera, renderer;
  let canvas;
  let currentPreset = 'medium'; // Default as requested
  let dirLight, hemiLight;
  const updateCallbacks = [];

  function init(canvasElement) {
    canvas = canvasElement;

    // 1. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0d14);
    scene.fog = new THREE.FogExp2(0x0a0d14, 0.015);

    // 2. Camera (First-person, 65 deg FOV, near plane 0.05 to prevent hand clipping)
    camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.05,
      140
    );
    camera.position.set(0, 1.7, 10); // Start at entrance threshold facing the rotunda
    scene.add(camera); // CRITICAL: Ensures children attached to camera (3D hands) are rendered

    // 3. WebGL Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });

    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;

    // 4. Set Initial Graphics Preset (Medium)
    applyPreset('medium');

    // 5. Environmental Lighting (Inspired by reference image)
    setupLighting();

    // 6. Window Resize Handler
    window.addEventListener('resize', onWindowResize, false);

    // 7. Start Loop
    startAnimationLoop();

    console.log('[MuseumEngine] Initialized with Medium preset for Intel HD 520.');
    return { scene, camera, renderer };
  }

  function setupLighting() {
    // Soft skylight ambient illumination
    hemiLight = new THREE.HemisphereLight(0x9bd8e8, 0x1b2635, 0.55);
    scene.add(hemiLight);

    // Central skylight directional sunlight streaming down through the dome
    dirLight = new THREE.DirectionalLight(0xfff6df, 1.35);
    dirLight.position.set(2, 28, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 40;
    dirLight.shadow.camera.left = -16;
    dirLight.shadow.camera.right = 16;
    dirLight.shadow.camera.top = 16;
    dirLight.shadow.camera.bottom = -16;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Subtle warm ambient bounce
    const ambient = new THREE.AmbientLight(0x221c16, 0.45);
    scene.add(ambient);
  }

  function applyPreset(presetName) {
    currentPreset = presetName;
    const width = window.innerWidth;
    const height = window.innerHeight;

    switch (presetName) {
      case 'low':
        renderer.setPixelRatio(0.85);
        renderer.shadowMap.enabled = false;
        if (dirLight) dirLight.castShadow = false;
        break;
      case 'medium': // Default
        renderer.setPixelRatio(1.0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        if (dirLight) {
          dirLight.castShadow = true;
          dirLight.shadow.mapSize.width = 1024;
          dirLight.shadow.mapSize.height = 1024;
        }
        break;
      case 'high':
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        if (dirLight) {
          dirLight.castShadow = true;
          dirLight.shadow.mapSize.width = 2048;
          dirLight.shadow.mapSize.height = 2048;
        }
        break;
    }

    renderer.setSize(width, height);
    console.log(`[MuseumEngine] Preset switched to: ${presetName}`);
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  let clock = new THREE.Clock();

  function startAnimationLoop() {
    function animate() {
      requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);

      // Execute update callbacks (player controller, artifacts rotation, animations)
      for (let i = 0; i < updateCallbacks.length; i++) {
        updateCallbacks[i](delta);
      }

      renderer.render(scene, camera);
    }
    animate();
  }

  function onUpdate(callback) {
    updateCallbacks.push(callback);
  }

  return {
    init,
    getScene: () => scene,
    getCamera: () => camera,
    getRenderer: () => renderer,
    applyPreset,
    getPreset: () => currentPreset,
    onUpdate,
  };
})();
