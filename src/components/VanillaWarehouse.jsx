import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useSimulationStore } from '../store';

export default function VanillaWarehouse() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (mountRef.current) mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    // Industrial dark blue atmosphere
    scene.background = new THREE.Color('#0b0f19');
    scene.fog = new THREE.FogExp2('#0b0f19', 0.015); // Adds industrial depth scale

    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(22, 18, 22);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent clipping below ground
    controls.target.set(2, 0, 2); // Center camera focus around core operational area

    // --- ENHANCED INDUSTRIAL LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    
    // High overhead warehouse bay lighting
    const overheadLight = new THREE.DirectionalLight(0xffffff, 1.5);
    overheadLight.position.set(15, 35, 15);
    overheadLight.castShadow = true;
    overheadLight.shadow.mapSize.width = 4096; // Ultra-crisp shadows
    overheadLight.shadow.mapSize.height = 4096;
    overheadLight.shadow.camera.near = 0.5;
    overheadLight.shadow.camera.far = 60;
    const d = 25;
    overheadLight.shadow.camera.left = -d;
    overheadLight.shadow.camera.right = d;
    overheadLight.shadow.camera.top = d;
    overheadLight.shadow.camera.bottom = -d;
    overheadLight.shadow.bias = -0.0005;
    scene.add(overheadLight);

    // Subdued blue accent floor reflection
    const floorLight = new THREE.DirectionalLight(0x1e40af, 0.4);
    floorLight.position.set(-10, -5, -10);
    scene.add(floorLight);

    // --- STRUCTURAL INFRASTRUCTURE ---
    // Massive Concrete Foundation
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: '#111827', 
      roughness: 0.5,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Expanded Navigational Grid
    const gridHelper = new THREE.GridHelper(60, 30, 0x1e293b, 0x0f172a);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Perimeter Security Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: '#1f2937', roughness: 0.9 });
    const createWall = (w, h, d, x, y, z, rotY = 0) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
      wall.position.set(x, y, z);
      wall.rotation.y = rotY;
      wall.receiveShadow = true;
      scene.add(wall);
    };
    createWall(60, 6, 0.5, 0, 3, -30); // Back Wall
    createWall(60, 6, 0.5, -30, 3, 0, Math.PI / 2); // Left Wall

    // Support Columns
    const columnGeo = new THREE.BoxGeometry(0.8, 6, 0.8);
    const columnMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.7 });
    const colPositions = [[-15, -15], [-15, 15], [15, -15], [15, 15], [0, -15], [0, 15]];
    colPositions.forEach(([cx, cz]) => {
      const col = new THREE.Mesh(columnGeo, columnMat);
      col.position.set(cx, 3, cz);
      col.castShadow = true;
      col.receiveShadow = true;
      scene.add(col);
    });

    // --- ZONING & LOGISTICS AREAS ---
    // Multi-tier Storage Rack System Factory
    const createIndustrialRack = () => {
      const group = new THREE.Group();
      const shelfGeo = new THREE.BoxGeometry(4, 0.1, 1.2);
      const shelfMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 }); // Industrial Orange
      const postGeo = new THREE.BoxGeometry(0.12, 5, 0.12);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, metalness: 0.6 }); // Steel Posts

      // 4 Heavy Posts
      const posts = [[-1.9, 2.5, -0.55], [1.9, 2.5, -0.55], [-1.9, 2.5, 0.55], [1.9, 2.5, 0.55]];
      posts.forEach(p => {
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(...p);
        post.castShadow = true;
        group.add(post);
      });

      // 4 Storage Tiers
      [0.6, 1.8, 3.0, 4.2].forEach(y => {
        const shelf = new THREE.Mesh(shelfGeo, shelfMat);
        shelf.position.set(0, y, 0);
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        group.add(shelf);

        // Populate shelves with procedural cargo pallets/boxes
        for(let i = -1.3; i <= 1.3; i += 1.3) {
          if(Math.random() > 0.2) { // Random occupancy mapping
            const box = new THREE.Mesh(
              new THREE.BoxGeometry(0.9, 0.7, 0.9),
              new THREE.MeshStandardMaterial({ color: Math.random() > 0.5 ? 0x78350f : 0xa16207, roughness: 0.9 })
            );
            box.position.set(i, y + 0.4, 0);
            box.castShadow = true;
            group.add(box);
          }
        }
      });
      return group;
    };

    // Spawn organized aisles of inventory racks
    const rackLocations = [
      [-10, -10], [-10, -4], [-10, 2], [-10, 8],
      [-4, -10], [-4, -4], [-4, 2], [-4, 8],
      [2, -10], [2, -4], [2, 2], [2, 8]
    ];
    rackLocations.forEach(([rx, rz]) => {
      const rack = createIndustrialRack();
      rack.position.set(rx, 0, rz);
      scene.add(rack);
    });

    // Holographic Outbound Delivery Bay
    const outboundGeo = new THREE.BoxGeometry(8, 0.05, 12);
    const outboundMat = new THREE.MeshStandardMaterial({ 
      color: 0x10b981, transparent: true, opacity: 0.25,
      emissive: 0x10b981, emissiveIntensity: 0.3
    });
    const outboundZone = new THREE.Mesh(outboundGeo, outboundMat);
    outboundZone.position.set(16, 0.02, 14);
    scene.add(outboundZone);

    // Dedicated Fleet Charging Station Pads (Bases)
    const chargePadGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.04, 32);
    const chargePadMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 0.2 });
    
    const buildChargingStation = (x, z) => {
      const pad = new THREE.Mesh(chargePadGeo, chargePadMat);
      pad.position.set(x, 0.02, z);
      scene.add(pad);
    };
    buildChargingStation(14, -12);
    buildChargingStation(14, -14);
    buildChargingStation(14, -16);

    // --- FLEET MANIFEST ---
    const robotSpecs = [
      { id: 'R-01', color: 0x06b6d4, baseX: 14, baseZ: -12, dropX: 14, dropZ: 12 },
      { id: 'R-02', color: 0xa855f7, baseX: 14, baseZ: -14, dropX: 16, dropZ: 14 },
      { id: 'R-03', color: 0xf43f5e, baseX: 14, baseZ: -16, dropX: 18, dropZ: 16 }
    ];
// ... (keep all your imports and scene setup the same until the createAGV function) ...

    const createAGV = (colorHex) => {
      const group = new THREE.Group();
      
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.3, 1.3),
        new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5, metalness: 0.5 })
      );
      body.position.y = 0.2;
      body.castShadow = true;
      group.add(body);

      const lightTrim = new THREE.Mesh(
        new THREE.BoxGeometry(1.12, 0.06, 1.32),
        new THREE.MeshStandardMaterial({ color: colorHex, emissive: colorHex, emissiveIntensity: 1.2 })
      );
      lightTrim.position.y = 0.22;
      group.add(lightTrim);

      const topDeck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: 0x4b5563, metalness: 0.8 })
      );
      topDeck.position.y = 0.4;
      topDeck.castShadow = true;
      group.add(topDeck);

      // NEW: The Cargo Payload (Initially hidden)
      const payload = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.6, 0.7),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 })
      );
      payload.position.y = 0.8; 
      payload.castShadow = true;
      payload.visible = false; // Hide until it picks it up
      group.add(payload);

      return { group, payload };
    };

    const robotData = robotSpecs.map(spec => {
      const { group: mesh, payload } = createAGV(spec.color);
      mesh.position.set(spec.baseX, 0, spec.baseZ);
      scene.add(mesh);
      
      return { 
        ...spec, mesh, payload, 
        targetX: spec.baseX, targetZ: spec.baseZ, 
        activeTaskId: null, taskPhase: null
      };
    });

    // --- DYNAMIC DATA SUBSCRIPTION ---
    const unsubscribe = useSimulationStore.subscribe((state) => {
      robotData.forEach(robot => {
        const storeRobot = state.robots.find(r => r.id === robot.id);
        if (storeRobot && storeRobot.status === 'Active') {
          const assignedTask = state.tasks.find(t => t.robotId === robot.id && (t.status === 'Retrieving' || t.status === 'Delivering'));
          
          if (assignedTask) {
            robot.activeTaskId = assignedTask.id;
            robot.taskPhase = assignedTask.status;
            
            // Route dynamically based on phase
            if (assignedTask.status === 'Retrieving') {
              robot.targetX = assignedTask.rackX;
              robot.targetZ = assignedTask.rackZ;
            } else if (assignedTask.status === 'Delivering') {
              robot.targetX = robot.dropX;
              robot.targetZ = robot.dropZ;
            }
          }
        } else {
          robot.targetX = robot.baseX;
          robot.targetZ = robot.baseZ;
          robot.activeTaskId = null;
          robot.taskPhase = null;
        }
      });
    });

    // --- REAL-TIME CINEMATIC ENGINE ---
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      
      const speed = 0.06; // Sped them up slightly so the longer trip feels responsive
      
      robotData.forEach((robot) => {
        const dx = robot.targetX - robot.mesh.position.x;
        const dz = robot.targetZ - robot.mesh.position.z;

        if (Math.abs(dx) > 0.01) robot.mesh.position.x += dx * speed;
        if (Math.abs(dz) > 0.01) robot.mesh.position.z += dz * speed;

        if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
          const targetAngle = Math.atan2(dx, dz);
          let diff = targetAngle - robot.mesh.rotation.y;
          diff = Math.atan2(Math.sin(diff), Math.cos(diff));
          robot.mesh.rotation.y += diff * 0.15;
        }

        // Toggle Payload Visibility visually based on phase
        robot.payload.visible = (robot.taskPhase === 'Delivering');

        // Multi-Step Arrival Logic
        if (robot.activeTaskId) {
          const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dz, 2));
          if (distance < 0.15) {
            if (robot.taskPhase === 'Retrieving') {
              useSimulationStore.getState().advanceTask(robot.activeTaskId);
              robot.taskPhase = 'Delivering'; // Prevent double-firing
            } else if (robot.taskPhase === 'Delivering') {
              useSimulationStore.getState().completeTask(robot.activeTaskId);
              robot.activeTaskId = null;
              robot.taskPhase = null;
            }
          }
        }
      });

      renderer.render(scene, camera);
    };
    animate();

// ... (keep the rest of the file cleanup and return the same) ...

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      unsubscribe();
      controls.dispose();
      if (mountRef.current) mountRef.current.innerHTML = ''; 
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-move" />;
}