import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useSimulationStore } from '../store';

export default function VanillaWarehouse() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (mountRef.current) mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');

    const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 12, 12);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    scene.add(new THREE.GridHelper(20, 20, 0x888888, 0x444444));

    // Racks
    const rackGeo = new THREE.BoxGeometry(2, 3, 1);
    const rackMat = new THREE.MeshStandardMaterial({ color: 0xeab308 });
    const r1 = new THREE.Mesh(rackGeo, rackMat); r1.position.set(-4, 1.5, -4); scene.add(r1);
    const r2 = new THREE.Mesh(rackGeo, rackMat); r2.position.set(-4, 1.5, 0); scene.add(r2);
    const r3 = new THREE.Mesh(rackGeo, rackMat); r3.position.set(-4, 1.5, 4); scene.add(r3);

    // Expanded Delivery Zone
    const zoneGeo = new THREE.BoxGeometry(4, 0.1, 8); // Made it longer to fit 3 robots
    const zoneMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, transparent: true, opacity: 0.5 });
    const deliveryZone = new THREE.Mesh(zoneGeo, zoneMat);
    deliveryZone.position.set(6, 0.05, 6);
    scene.add(deliveryZone);

    // --- FLEET SETUP ---
    const robotSpecs = [
      { id: 'R-01', color: 0x06b6d4, baseX: 0, baseZ: 0, dropX: 6, dropZ: 6 },     // Cyan
      { id: 'R-02', color: 0xa855f7, baseX: 0, baseZ: -2, dropX: 6, dropZ: 4.5 },  // Purple
      { id: 'R-03', color: 0xf43f5e, baseX: 0, baseZ: 2, dropX: 6, dropZ: 7.5 }    // Rose
    ];

    const robotData = robotSpecs.map(spec => {
      const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      const material = new THREE.MeshStandardMaterial({ color: spec.color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(spec.baseX, 0.5, spec.baseZ);
      scene.add(mesh);
      
      return { 
        ...spec, 
        mesh, 
        targetX: spec.baseX, 
        targetZ: spec.baseZ, 
        activeTaskId: null 
      };
    });

    // --- THE BRAIN CONNECTION ---
    const unsubscribe = useSimulationStore.subscribe((state) => {
      robotData.forEach(robot => {
        const storeRobot = state.robots.find(r => r.id === robot.id);
        if (storeRobot && storeRobot.status === 'Active') {
          // Find the specific task assigned to THIS robot
          const assignedTask = state.tasks.find(t => t.robotId === robot.id && t.status === 'In Transit');
          if (assignedTask) {
            robot.targetX = robot.dropX;
            robot.targetZ = robot.dropZ;
            robot.activeTaskId = assignedTask.id;
          }
        } else {
          // Send back to base
          robot.targetX = robot.baseX;
          robot.targetZ = robot.baseZ;
          robot.activeTaskId = null;
        }
      });
    });

    // --- ANIMATION LOOP ---
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      
      const speed = 0.05; 
      
      robotData.forEach((robot, index) => {
        // Move
        if (Math.abs(robot.targetX - robot.mesh.position.x) > 0.01) {
          robot.mesh.position.x += (robot.targetX - robot.mesh.position.x) * speed;
        }
        if (Math.abs(robot.targetZ - robot.mesh.position.z) > 0.01) {
          robot.mesh.position.z += (robot.targetZ - robot.mesh.position.z) * speed;
        }

        // Hover offset so they don't bob exactly in sync
        robot.mesh.position.y = 0.5 + Math.sin(Date.now() * 0.005 + index) * 0.1;

        // Check Arrival
        if (robot.activeTaskId) {
          const distance = Math.sqrt(
            Math.pow(robot.targetX - robot.mesh.position.x, 2) + Math.pow(robot.targetZ - robot.mesh.position.z, 2)
          );
          if (distance < 0.1) {
            useSimulationStore.getState().completeTask(robot.activeTaskId);
            robot.activeTaskId = null; 
          }
        }
      });

      renderer.render(scene, camera);
    };
    animate();

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