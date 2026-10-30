/**
 * NULLEVIA Player Controller & 3D Hands System
 * 
 * Features:
 * - Fluid PointerLock mouse look with pitch/yaw clamping
 * - Smooth WASD movement + Shift sprint
 * - Collision detection with walls, pillars, and vitrines
 * - 3D Articulated Robotic Hands matching reference image
 *   (white chassis, dark joints, glowing cyan power conduits)
 * - Walking sway and reach/inspect gestures
 */

window.MuseumPlayer = (function () {
  let camera, scene;
  let isLocked = false;
  let isInspecting = false;

  // Movement physics
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const moveState = { forward: false, backward: false, left: false, right: false, sprint: false };
  const WALK_SPEED = 4.2;
  const RUN_SPEED = 7.5;
  const PLAYER_RADIUS = 0.55;
  const EYE_HEIGHT = 1.7;

  // Camera orientation
  let pitch = 0;
  let yaw = 0;
  const PITCH_LIMIT = Math.PI / 2.15;

  // Colliders array provided by world & exhibits
  let colliders = [];

  // Hands 3D Rig
  let handsContainer;
  let leftArm, rightArm;
  let leftHandGroup, rightHandGroup;
  let walkCycle = 0;
  let inspectGestureProgress = 0;

  function init(engineCamera, engineScene, canvasElement) {
    camera = engineCamera;
    scene = engineScene;

    // Reset camera orientation
    camera.rotation.set(0, 0, 0, 'YXZ');

    // 1. Setup Input Listeners
    setupInput(canvasElement);

    // 2. Build 3D Articulated Robotic Hands (Reference image)
    buildRoboticHands();

    console.log('[MuseumPlayer] First-person controller & 3D hands ready.');
  }

  function setupInput(canvas) {
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    document.addEventListener('mousemove', onMouseMove, false);

    // Pointer lock change listeners
    document.addEventListener('pointerlockchange', onPointerLockChange, false);
    document.addEventListener('mozpointerlockchange', onPointerLockChange, false);
  }

  function requestLock() {
    if (isInspecting) return;
    const canvas = document.getElementById('webgl-canvas') || document.body;
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
    if (canvas.requestPointerLock) {
      canvas.requestPointerLock();
    }
  }

  function unlock() {
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
    if (document.exitPointerLock) {
      document.exitPointerLock();
    }
  }

  function onPointerLockChange() {
    isLocked = document.pointerLockElement === (document.getElementById('webgl-canvas') || document.body);
    const overlay = document.getElementById('pause-menu-overlay');
    if (overlay) {
      if (isLocked) {
        overlay.classList.add('hidden');
      } else if (!isInspecting) {
        overlay.classList.remove('hidden');
      }
    }
  }

  function onMouseMove(event) {
    if (!isLocked || isInspecting) return;

    const movementX = event.movementX || event.mozMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || 0;
    const sensitivity = 0.0022;

    yaw -= movementX * sensitivity;
    pitch -= movementY * sensitivity;
    pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch));

    camera.rotation.set(pitch, yaw, 0, 'YXZ');
  }

  function onKeyDown(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        moveState.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        moveState.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        moveState.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        moveState.right = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        moveState.sprint = true;
        break;
    }
  }

  function onKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        moveState.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        moveState.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        moveState.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        moveState.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        moveState.sprint = false;
        break;
    }
  }

  /**
   * Constructs the 3D Cybernetic Robotic Hands matching the reference image:
   * Metallic silver chassis plates, dark graphite carbon joints,
   * antique bronze wrist details, and glowing cyan circuitry.
   */
  function buildRoboticHands() {
    handsContainer = new THREE.Group();
    camera.add(handsContainer); // Attach directly to camera

    // High-performance PBR materials matching reference_hands.jpg
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0xdce5ed,
      roughness: 0.22,
      metalness: 0.75,
    });

    const darkJointMat = new THREE.MeshStandardMaterial({
      color: 0x12151b,
      roughness: 0.45,
      metalness: 0.85,
    });

    const bronzeMat = new THREE.MeshStandardMaterial({
      color: 0xd4b477,
      roughness: 0.3,
      metalness: 0.85,
    });

    const cyanConduitMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
    });

    // Create Right Hand & Arm (positioned in lower right view)
    rightArm = createArmModel(armorMat, darkJointMat, bronzeMat, cyanConduitMat, false);
    rightArm.position.set(0.24, -0.22, -0.42);
    rightArm.rotation.set(-0.28, -0.18, 0.12);
    handsContainer.add(rightArm);

    // Create Left Hand & Arm (positioned in lower left view)
    leftArm = createArmModel(armorMat, darkJointMat, bronzeMat, cyanConduitMat, true);
    leftArm.position.set(-0.24, -0.22, -0.42);
    leftArm.rotation.set(-0.28, 0.18, -0.12);
    handsContainer.add(leftArm);
  }

  function createArmModel(armorMat, jointMat, bronzeMat, glowMat, isLeft) {
    const armGroup = new THREE.Group();
    const sign = isLeft ? -1 : 1;

    // 1. Forearm Sleeve / Shell
    const forearmGeo = new THREE.CylinderGeometry(0.062, 0.076, 0.38, 12);
    forearmGeo.rotateX(Math.PI / 2);
    const forearm = new THREE.Mesh(forearmGeo, armorMat);
    forearm.position.set(0, 0, 0.18);
    armGroup.add(forearm);

    // Forearm Bronze Trim Ring
    const trimGeo = new THREE.TorusGeometry(0.065, 0.009, 8, 16);
    const trim = new THREE.Mesh(trimGeo, bronzeMat);
    trim.position.set(0, 0, 0.16);
    armGroup.add(trim);

    // Forearm Longitudinal Glowing Cyan Circuit Line
    const circuitGeo = new THREE.BoxGeometry(0.008, 0.012, 0.28);
    const circuit = new THREE.Mesh(circuitGeo, glowMat);
    circuit.position.set(0, 0.062, 0.18);
    armGroup.add(circuit);

    // Wrist Ring / Pivot
    const wristGeo = new THREE.TorusGeometry(0.066, 0.012, 8, 16);
    const wrist = new THREE.Mesh(wristGeo, jointMat);
    wrist.position.set(0, 0, 0.01);
    armGroup.add(wrist);

    // 2. Hand Palm
    const palmGroup = new THREE.Group();
    const palmGeo = new THREE.BoxGeometry(0.092, 0.034, 0.115);
    const palm = new THREE.Mesh(palmGeo, armorMat);
    palmGroup.add(palm);

    // Glowing Palm Center Core Conduit
    const conduitGeo = new THREE.BoxGeometry(0.032, 0.016, 0.045);
    const conduit = new THREE.Mesh(conduitGeo, glowMat);
    conduit.position.set(0, 0.016, -0.01);
    palmGroup.add(conduit);

    // 3. Five Articulated Fingers
    const fingerPositions = [
      { x: -0.034 * sign, z: -0.062, len: 0.052, rotZ: 0.08 * sign }, // Index
      { x: -0.011 * sign, z: -0.068, len: 0.056, rotZ: 0.02 * sign }, // Middle
      { x: 0.012 * sign, z: -0.065, len: 0.052, rotZ: -0.04 * sign }, // Ring
      { x: 0.033 * sign, z: -0.058, len: 0.044, rotZ: -0.1 * sign }, // Pinky
      { x: -0.048 * sign, z: -0.01, len: 0.038, rotZ: 0.45 * sign }, // Thumb
    ];

    fingerPositions.forEach((pos) => {
      const finger = new THREE.Group();
      finger.position.set(pos.x, 0, pos.z);
      finger.rotation.z = pos.rotZ;

      // Knuckle joint (Dark Graphite)
      const knuckleGeo = new THREE.SphereGeometry(0.012, 8, 8);
      const knuckle = new THREE.Mesh(knuckleGeo, jointMat);
      finger.add(knuckle);

      // Phalanx segment (Silver Armor)
      const phalanxGeo = new THREE.CylinderGeometry(0.009, 0.011, pos.len, 8);
      phalanxGeo.rotateX(Math.PI / 2);
      const phalanx = new THREE.Mesh(phalanxGeo, armorMat);
      phalanx.position.set(0, 0, -pos.len / 2);
      finger.add(phalanx);

      // Glowing finger tip/accent
      const tipGeo = new THREE.BoxGeometry(0.006, 0.008, 0.014);
      const tip = new THREE.Mesh(tipGeo, glowMat);
      tip.position.set(0, 0.006, -pos.len);
      finger.add(tip);

      palmGroup.add(finger);
    });

    palmGroup.position.set(0, 0, -0.04);
    armGroup.add(palmGroup);

    return armGroup;
  }

  function setColliders(obstacleList) {
    colliders = obstacleList;
  }

  /**
   * Updates player position, collisions, and hand animation
   */
  function update(delta) {
    if (!isLocked && !isInspecting) return;

    // 1. Process movement inputs
    const isMoving =
      moveState.forward || moveState.backward || moveState.left || moveState.right;
    const speed = moveState.sprint ? RUN_SPEED : WALK_SPEED;

    direction.set(0, 0, 0);

    if (moveState.forward) direction.z -= 1;
    if (moveState.backward) direction.z += 1;
    if (moveState.left) direction.x -= 1;
    if (moveState.right) direction.x += 1;

    if (isMoving && !isInspecting) {
      direction.normalize();

      // Transform direction based on camera yaw
      const moveVec = new THREE.Vector3(direction.x, 0, direction.z);
      moveVec.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

      // Desired velocity
      velocity.x = moveVec.x * speed;
      velocity.z = moveVec.z * speed;

      // Apply movement with collision checks
      applyMovementWithCollision(delta);

      // Advance walk cycle
      walkCycle += delta * (moveState.sprint ? 14 : 9.5);
    } else {
      // Decelerate
      velocity.x *= 0.1;
      velocity.z *= 0.1;
    }

    // Always keep player grounded at eye height
    camera.position.y = EYE_HEIGHT;

    // 2. Animate 3D Hands
    animateHands(delta, isMoving);
  }

  function applyMovementWithCollision(delta) {
    const nextX = camera.position.x + velocity.x * delta;
    const nextZ = camera.position.z + velocity.z * delta;

    // Check collision on X-axis
    if (!checkCollision(nextX, camera.position.z)) {
      camera.position.x = nextX;
    }

    // Check collision on Z-axis
    if (!checkCollision(camera.position.x, nextZ)) {
      camera.position.z = nextZ;
    }
  }

  function checkCollision(px, pz) {
    // 1. Boundary circle of the central hall rotunda (radius 14m)
    const distFromCenter = Math.sqrt(px * px + pz * pz);
    
    // Entrance corridor allows z up to 13m when |x| < 3m
    if (pz > 7 && Math.abs(px) < 3.2 && pz < 12.8) {
      return false; // Inside entrance corridor
    }

    if (distFromCenter > 13.5) {
      return true; // Hit outer rotunda wall
    }

    // 2. Obstacle Colliders (vitrines, pillars, center pedestal)
    for (let i = 0; i < colliders.length; i++) {
      const col = colliders[i];
      if (col.type === 'cylinder') {
        const dx = px - col.x;
        const dz = pz - col.z;
        const distSq = dx * dx + dz * dz;
        const minDist = col.radius + PLAYER_RADIUS;
        if (distSq < minDist * minDist) {
          return true;
        }
      } else if (col.type === 'box') {
        if (
          px >= col.minX - PLAYER_RADIUS &&
          px <= col.maxX + PLAYER_RADIUS &&
          pz >= col.minZ - PLAYER_RADIUS &&
          pz <= col.maxZ + PLAYER_RADIUS
        ) {
          return true;
        }
      }
    }

    return false;
  }

  function animateHands(delta, isMoving) {
    if (!leftArm || !rightArm) return;

    if (isInspecting) {
      // Reach gesture towards exhibit
      inspectGestureProgress = Math.min(1, inspectGestureProgress + delta * 3.5);
    } else {
      inspectGestureProgress = Math.max(0, inspectGestureProgress - delta * 4);
    }

    const inspectOffset = inspectGestureProgress * 0.15;

    if (isMoving && !isInspecting) {
      // Walking harmonic bobbing
      const bobY = Math.sin(walkCycle) * 0.018;
      const swayX = Math.cos(walkCycle * 0.5) * 0.015;

      rightArm.position.y = -0.28 + bobY;
      rightArm.position.x = 0.32 + swayX;
      rightArm.position.z = -0.55 + Math.sin(walkCycle) * 0.02;

      leftArm.position.y = -0.28 - bobY;
      leftArm.position.x = -0.32 + swayX;
      leftArm.position.z = -0.55 - Math.sin(walkCycle) * 0.02;
    } else {
      // Gentle idle breathing sway
      const idleTime = performance.now() * 0.0018;
      const idleY = Math.sin(idleTime) * 0.006;
      const idleZ = Math.cos(idleTime * 0.8) * 0.004;

      rightArm.position.set(0.32, -0.28 + idleY, -0.55 + idleZ - inspectOffset);
      rightArm.rotation.set(-0.25 - inspectGestureProgress * 0.2, -0.15, 0.1);

      leftArm.position.set(-0.32, -0.28 + idleY, -0.55 + idleZ - inspectOffset);
      leftArm.rotation.set(-0.25 - inspectGestureProgress * 0.2, 0.15, -0.1);
    }
  }

  function setInspecting(inspecting) {
    isInspecting = inspecting;
  }

  return {
    init,
    update,
    requestLock,
    unlock,
    isLocked: () => isLocked,
    setColliders,
    setInspecting,
    getPosition: () => camera.position,
    getYaw: () => yaw,
    getPitch: () => pitch,
  };
})();
