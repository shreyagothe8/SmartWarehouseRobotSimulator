import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSimulationStore } from '../store';

export default function VanillaWarehouse() {
  const mountRef = useRef(null);

  useEffect(() => {
    // 1. THE STRICT MODE KILLER
    // This ensures no invisible "ghost" canvases are blocking your view
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
    }

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');

    const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 12, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
    scene.add(gridHelper);

    // Racks
    const rackGeometry = new THREE.BoxGeometry(2, 3, 1);
    const rackMaterial = new THREE.MeshStandardMaterial({ color: 0xeab308 });
    const rack1 = new THREE.Mesh(rackGeometry, rackMaterial); rack1.position.set(-4, 1.5, -4); scene.add(rack1);
    const rack2 = new THREE.Mesh(rackGeometry, rackMaterial); rack2.position.set(-4, 1.5, 0); scene.add(rack2);
    const rack3 = new THREE.Mesh(rackGeometry, rackMaterial); rack3.position.set(-4, 1.5, 4); scene.add(rack3);

    // Delivery Zone
    const zoneGeometry = new THREE.BoxGeometry(4, 0.1, 4);
    const zoneMaterial = new THREE.MeshStandardMaterial({ color: 0x22c55e, transparent: true, opacity: 0.5 });
    const deliveryZone = new THREE.Mesh(zoneGeometry, zoneMaterial);
    deliveryZone.position.set(6, 0.05, 6);
    scene.add(deliveryZone);

    // Robot
    const robotGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const robotMaterial = new THREE.MeshStandardMaterial({ color: 0x06b6d4 });
    const robot = new THREE.Mesh(robotGeometry, robotMaterial);
    robot.position.set(0, 0.5, 0);
    scene.add(robot);

    // 2. THE DIRECT BRAIN CONNECTION (Bypassing React)
    let targetX = 0;
    let targetZ = 0;

    const unsubscribe = useSimulationStore.subscribe((state) => {
      const hasActiveTasks = state.tasks.length > 0;
      targetX = hasActiveTasks ? 6 : 0;
      targetZ = hasActiveTasks ? 6 : 0;
      
      // If this prints in your browser console, the 3D engine DEFINITELY heard the click
      console.log(`[3D Engine] New target locked: X:${targetX}, Z:${targetZ}`);
    });

    // 3. THE ANIMATION LOOP
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const speed = 0.05; 
      
      if (Math.abs(targetX - robot.position.x) > 0.01) {
        robot.position.x += (targetX - robot.position.x) * speed;
      }
      if (Math.abs(targetZ - robot.position.z) > 0.01) {
        robot.position.z += (targetZ - robot.position.z) * speed;
      }

      robot.position.y = 0.5 + Math.sin(Date.now() * 0.005) * 0.1;
      
      renderer.render(scene, camera);
    };
    animate();

    // 4. CLEANUP
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
      unsubscribe(); // Disconnect the brain when the canvas closes
      if (mountRef.current) {
        mountRef.current.innerHTML = ''; 
      }
      robotGeometry.dispose();
      robotMaterial.dispose();
      zoneGeometry.dispose();
      zoneMaterial.dispose();
      rackGeometry.dispose();
      rackMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full absolute inset-0" />;
}