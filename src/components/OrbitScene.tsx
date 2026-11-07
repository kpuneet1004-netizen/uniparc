import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function OrbitScene() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, el.clientWidth / Math.max(el.clientHeight, 1), .1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const core = new THREE.Group();
    scene.add(core);

    const neon = new THREE.MeshBasicMaterial({ color: 0xd7ff00 });
    const white = new THREE.MeshBasicMaterial({ color: 0xf5f7ed, transparent: true, opacity: .75 });
    const dim = new THREE.MeshBasicMaterial({ color: 0xd7ff00, transparent: true, opacity: .24, wireframe: true });

    const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(.62, 3), dim);
    core.add(sphere);
    const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(.34, 2), neon);
    core.add(inner);

    const rings: THREE.Mesh[] = [];
    [1.18, 1.52, 1.86].forEach((radius, index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, index === 1 ? .012 : .008, 8, 160),
        index === 1 ? neon : white,
      );
      ring.rotation.set(index * .42, index * .56, index * .32);
      core.add(ring);
      rings.push(ring);
    });

    const starGeometry = new THREE.BufferGeometry();
    const count = 850;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const radius = 2.6 + Math.random() * 7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      sizes[i] = Math.random();
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xe7edcf, size: .018, transparent: true, opacity: .75, sizeAttenuation: true });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    const onPointer = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - .5) * .32;
      targetY = ((event.clientY - rect.top) / rect.height - .5) * .26;
    };
    el.addEventListener('pointermove', onPointer);

    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (!reduced) {
        pointerX += (targetX - pointerX) * .025;
        pointerY += (targetY - pointerY) * .025;
        core.rotation.y += .0018;
        core.rotation.x += (pointerY - core.rotation.x) * .025;
        core.rotation.z += (pointerX - core.rotation.z) * .025;
        rings[0].rotation.x += .001;
        rings[1].rotation.y -= .0015;
        rings[2].rotation.z += .0012;
        stars.rotation.y += .00012;
        const pulse = 1 + Math.sin(performance.now() * .0015) * .035;
        inner.scale.setScalar(pulse);
      }
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      const width = Math.max(el.clientWidth, 1);
      const height = Math.max(el.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      el.removeEventListener('pointermove', onPointer);
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
      [sphere, inner, ...rings].forEach((mesh) => mesh.geometry.dispose());
      [neon, white, dim].forEach((material) => material.dispose());
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, []);

  return <div className="orbit-scene" ref={host} aria-hidden="true" />;
}
