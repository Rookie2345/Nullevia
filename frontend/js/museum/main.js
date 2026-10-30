/**
 * NULLEVIA 3D Museum Master Orchestrator
 * 
 * Coordinates the 3D Engine, Architecture World, Player Rig,
 * Interactive Exhibits, and Curatorial HUD.
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) {
    console.error('[Nullevia 3D] WebGL canvas not found.');
    return;
  }

  // 1. Initialize Engine
  const { scene, camera } = window.MuseumEngine.init(canvas);

  // 2. Build World Architecture
  const worldColliders = window.MuseumWorld.build(scene);

  // 3. Build Interactive Exhibits
  const { colliders: exhibitColliders } = window.MuseumExhibits.build(scene);

  // 4. Initialize Player & Colliders
  const allColliders = [...worldColliders, ...exhibitColliders];
  window.MuseumPlayer.init(camera, scene, canvas);
  window.MuseumPlayer.setColliders(allColliders);

  // 5. Initialize Curatorial UI & HUD
  window.MuseumUI.init();

  // 6. Connect Engine Update Loop
  window.MuseumEngine.onUpdate((delta) => {
    // Update player movement, camera, and hands
    window.MuseumPlayer.update(delta);

    // Update exhibit animations & proximity
    const playerPos = window.MuseumPlayer.getPosition();
    const activeExhibit = window.MuseumExhibits.update(delta, playerPos);

    // Update interaction prompt in HUD
    window.MuseumUI.updatePrompt(activeExhibit);
  });

  console.log('[Nullevia 3D] Immersive Museum initialized successfully.');
});
