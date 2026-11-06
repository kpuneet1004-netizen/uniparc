import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * UNIPARC cinematic origin sequence.
 * Procedural motion design only: no stock imagery, screenshots or video plates.
 */
export default function CinematicIntroScene() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = host.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 18);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      });
    } catch (error) {
      console.warn('UNIPARC intro: WebGL unavailable; continuing with the HTML intro.', error);
      return;
    }

    const small = window.innerWidth < 700;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.1 : 1.35));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    root.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xc4c9b7, 0.38);
    const keyLight = new THREE.DirectionalLight(0xe8e8d7, 2.2);
    keyLight.position.set(-4, 5, 8);
    const rimLight = new THREE.PointLight(0xb8d978, 3.5, 18);
    rimLight.position.set(3, -2, 3);
    const starLight = new THREE.PointLight(0xe8f4c9, 0, 24);
    scene.add(ambient, keyLight, rimLight, starLight);

    // Deep-space field: fixed points, sparse enough to preserve the black void.
    const starCount = small ? 420 : 760;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 54;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 32;
      starPositions[i * 3 + 2] = -28 + Math.random() * 34;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xdce4d2,
      size: 0.026,
      transparent: true,
      opacity: 0.44,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // A star that grows from a pinprick into a hot, layered light source.
    const starGroup = new THREE.Group();
    scene.add(starGroup);
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 32, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    const innerHalo = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 32, 24),
      new THREE.MeshBasicMaterial({
        color: 0xe8f4c9, transparent: true, opacity: 0.14,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    const outerHalo = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 32, 24),
      new THREE.MeshBasicMaterial({
        color: 0xb8d978, transparent: true, opacity: 0.05,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    starGroup.add(core, innerHalo, outerHalo);

    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 128;
    const glowContext = glowCanvas.getContext('2d')!;
    const glowGradient = glowContext.createRadialGradient(64, 64, 0, 64, 64, 64);
    glowGradient.addColorStop(0, 'rgba(255,255,245,1)');
    glowGradient.addColorStop(0.09, 'rgba(235,248,202,.7)');
    glowGradient.addColorStop(0.28, 'rgba(190,220,133,.2)');
    glowGradient.addColorStop(1, 'rgba(170,205,120,0)');
    glowContext.fillStyle = glowGradient;
    glowContext.fillRect(0, 0, 128, 128);
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture, color: 0xe8f3ce, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const glow = new THREE.Sprite(glowMaterial);
    glow.scale.set(8, 8, 1);
    starGroup.add(glow);

    // Expanding shockwave shells, staggered to create one deep, readable impact.
    const shockwaves: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.012, 6, 144),
        new THREE.MeshBasicMaterial({
          color: i === 1 ? 0xf8f7eb : 0xc9e6a1,
          transparent: true, opacity: 0,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
      );
      mesh.rotation.set(i * 0.55, i * 0.7, i * 0.3);
      scene.add(mesh);
      shockwaves.push(mesh);
    }

    // A directional burst with deterministic trajectories and a short lifetime.
    const burstCount = small ? 420 : 720;
    const burstPositions = new Float32Array(burstCount * 3);
    const burstVelocity = new Float32Array(burstCount * 3);
    for (let i = 0; i < burstCount; i++) {
      const direction = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        (Math.random() * 2 - 1) * 0.38
      ).normalize();
      const speed = 2.6 + Math.random() * 6.2;
      burstVelocity.set([direction.x * speed, direction.y * speed, direction.z * speed], i * 3);
    }
    const burstGeometry = new THREE.BufferGeometry();
    burstGeometry.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));
    const burstMaterial = new THREE.PointsMaterial({
      color: 0xd9edb6, size: small ? 0.032 : 0.04,
      transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const burst = new THREE.Points(burstGeometry, burstMaterial);
    scene.add(burst);

    // Culture is expressed as kinetic graphic language, not imported still images.
    type CulturePlate = {
      group: THREE.Group;
      texture: THREE.CanvasTexture;
      material: THREE.MeshBasicMaterial;
    };
    const culture = [
      { title: 'ANIME', sub: 'STORIES / WORLDS', color: '#e5b9a8', kind: 0 },
      { title: 'FILM', sub: 'FRAME / MOTION', color: '#e4d2a0', kind: 1 },
      { title: 'MEME', sub: 'INTERNET CULTURE', color: '#c4b4ef', kind: 2 },
      { title: 'GAMES', sub: 'PLAY / LEVEL UP', color: '#c8e78d', kind: 3 },
      { title: 'TECH', sub: 'FUTURE / SIGNAL', color: '#9dc9df', kind: 4 },
    ];
    const plateTargets = [
      [-4.65, 1.65, -1.2],
      [-2.35, -1.6, -0.2],
      [0.0, 2.05, -1.5],
      [2.45, -1.55, -0.4],
      [4.65, 1.0, -1.3],
    ];
    const plates: CulturePlate[] = culture.map((item, index) => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 320;
      const ctx = canvas.getContext('2d')!;
      const ink = item.color;

      // Transparent vector artwork: typography, linework, glyphs and animated accents.
      ctx.clearRect(0, 0, 640, 320);
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.globalAlpha = 0.88;
      ctx.lineWidth = 2;
      ctx.strokeRect(12, 12, 616, 296);
      ctx.globalAlpha = 0.22;
      for (let n = 0; n < 18; n++) {
        ctx.beginPath();
        ctx.moveTo(28 + n * 34, 18);
        ctx.lineTo(28 + n * 34, 302);
        ctx.stroke();
      }
      ctx.globalAlpha = 0.9;
      ctx.font = '600 22px Arial, sans-serif';
      ctx.fillText('UNIPARC / CULTURE INDEX', 34, 48);
      ctx.font = '900 94px Arial, sans-serif';
      ctx.fillText(item.title, 34, 180);
      ctx.font = '600 20px monospace';
      ctx.fillText(item.sub, 38, 232);
      ctx.globalAlpha = 0.8;
      if (item.kind === 0) {
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(430, 58); ctx.lineTo(550, 258);
        ctx.moveTo(472, 48); ctx.lineTo(590, 245);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(510, 154, 72, -1.1, 1.6); ctx.stroke();
      } else if (item.kind === 1) {
        ctx.lineWidth = 4;
        ctx.strokeRect(430, 76, 142, 150);
        ctx.beginPath(); ctx.moveTo(450, 205); ctx.lineTo(510, 106); ctx.lineTo(552, 205); ctx.stroke();
      } else if (item.kind === 2) {
        ctx.font = '900 70px Arial, sans-serif';
        ctx.fillText('?!', 470, 178);
        ctx.beginPath(); ctx.arc(520, 150, 76, 0, Math.PI * 2); ctx.stroke();
      } else if (item.kind === 3) {
        ctx.beginPath();
        ctx.arc(510, 150, 72, 0, Math.PI * 2);
        ctx.moveTo(510, 55); ctx.lineTo(510, 245);
        ctx.moveTo(415, 150); ctx.lineTo(605, 150);
        ctx.stroke();
        ctx.font = '600 18px monospace';
        ctx.fillText('PLAYER_01', 440, 278);
      } else {
        for (let n = 0; n < 7; n++) {
          ctx.beginPath();
          ctx.moveTo(430 + n * 22, 70);
          ctx.lineTo(430 + n * 22, 235 - n * 13);
          ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(520, 150, 68, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      const material = new THREE.MeshBasicMaterial({
        map: texture, transparent: true, opacity: 0,
        side: THREE.DoubleSide, depthWrite: false, toneMapped: false,
      });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.5), material);
      const group = new THREE.Group();
      group.add(plane);
      group.scale.setScalar(0.001);
      scene.add(group);
      return { group, texture, material };
    });

    // A continuous, tapered tube. Position and normal buffers are updated in-place;
    // no geometry rebuilds or per-frame normal recomputation.
    const bodySegments = small ? 76 : 104;
    const radialSegments = 8;
    const vertexCount = (bodySegments + 1) * (radialSegments + 1);
    const bodyPositions = new Float32Array(vertexCount * 3);
    const bodyNormals = new Float32Array(vertexCount * 3);
    const bodyIndices: number[] = [];
    for (let i = 0; i < bodySegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const a = i * (radialSegments + 1) + j;
        const b = a + radialSegments + 1;
        bodyIndices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const bodyGeometry = new THREE.BufferGeometry();
    bodyGeometry.setAttribute('position', new THREE.BufferAttribute(bodyPositions, 3).setUsage(THREE.DynamicDrawUsage));
    bodyGeometry.setAttribute('normal', new THREE.BufferAttribute(bodyNormals, 3).setUsage(THREE.DynamicDrawUsage));
    bodyGeometry.setIndex(bodyIndices);
    bodyGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 16);

    const serpentMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x9ba985,
      metalness: 0.72,
      roughness: 0.24,
      clearcoat: 0.9,
      clearcoatRoughness: 0.2,
      emissive: 0x17200f,
      emissiveIntensity: 0.24,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const serpent = new THREE.Mesh(bodyGeometry, serpentMaterial);
    scene.add(serpent);

    // Sculpted, low-profile head silhouette; deliberately no oversized eyes or cartoon features.
    const headShape = new THREE.Shape();
    headShape.moveTo(-0.48, 0);
    headShape.bezierCurveTo(-0.3, 0.16, -0.05, 0.19, 0.18, 0.13);
    headShape.bezierCurveTo(0.34, 0.09, 0.48, 0.025, 0.62, 0);
    headShape.bezierCurveTo(0.48, -0.025, 0.34, -0.09, 0.18, -0.13);
    headShape.bezierCurveTo(-0.05, -0.19, -0.3, -0.16, -0.48, 0);
    const headGeometry = new THREE.ExtrudeGeometry(headShape, {
      depth: 0.2, bevelEnabled: true, bevelSegments: 4,
      steps: 1, bevelSize: 0.045, bevelThickness: 0.045, curveSegments: 16,
    });
    headGeometry.translate(0, 0, -0.1);
    const headMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xb0bd98, metalness: 0.7, roughness: 0.22,
      clearcoat: 1, clearcoatRoughness: 0.18,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    scene.add(head);

    const axisX = new THREE.Vector3(1, 0, 0);
    const tangent = new THREE.Vector3();
    const headTangent = new THREE.Vector3();
    const headPosition = new THREE.Vector3();
    const before = new THREE.Vector3();
    const after = new THREE.Vector3();
    const center = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const binormal = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    const fallbackUp = new THREE.Vector3(0, 0, 1);
    const aspectFit = { value: 1 };

    const serpentPath = (time: number, target: THREE.Vector3) => {
      const t = time - 11.55;
      const fit = aspectFit.value;
      const startX = -8.2 * fit;
      if (t <= 0) return target.set(startX, 2.55, 1.8);
      if (t < 2.1) {
        const u = THREE.MathUtils.smoothstep(t, 0, 2.1);
        const inv = 1 - u;
        return target.set(
          inv ** 3 * startX + 3 * inv ** 2 * u * (-4.9 * fit) + 3 * inv * u ** 2 * (-2.1 * fit),
          inv ** 3 * 2.55 + 3 * inv ** 2 * u * 3.0 + 3 * inv * u ** 2 * -1.8 + u ** 3 * -1.8,
          inv ** 3 * 1.8 + 3 * inv ** 2 * u * 2.2 + 3 * inv * u ** 2 * 0.9 + u ** 3 * 0.2
        );
      }
      const orbitTime = Math.max(0, t - 2.1);
      const orbitEase = THREE.MathUtils.smoothstep(t, 2.1, 3.0);
      const angle = -2.25 + orbitTime * 1.34;
      const radius = THREE.MathUtils.lerp(1.72, 2.28, orbitEase) + Math.sin(orbitTime * 0.8) * 0.035;
      const organic = Math.sin(orbitTime * 1.25) * 0.045;
      return target.set(
        Math.cos(angle) * radius * Math.max(0.72, aspectFit.value),
        Math.sin(angle) * radius * 0.88 + organic,
        Math.sin(angle * 1.45) * 0.32
      );
    };

    const resize = () => {
      const width = Math.max(1, root.clientWidth);
      const height = Math.max(1, root.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      aspectFit.value = THREE.MathUtils.clamp((width / height) / 1.45, 0.42, 1);
      culture.forEach((_, i) => {
        const [x, y, z] = plateTargets[i];
        plates[i].group.position.set(x * aspectFit.value, y * (small ? 0.86 : 1), z);
      });
    };
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    resize();

    const clock = new THREE.Clock();
    let raf = 0;
    let stopped = false;

    const render = () => {
      if (stopped) return;
      raf = requestAnimationFrame(render);
      const time = clock.getElapsedTime();

      starField.rotation.y = time * 0.002;
      starField.rotation.x = Math.sin(time * 0.07) * 0.004;

      // 01 — ignition and gradual stellar birth.
      const ignition = THREE.MathUtils.smoothstep(time, 1.0, 4.1);
      const starFade = 1 - THREE.MathUtils.smoothstep(time, 20.1, 21.3);
      const pulse = 1 + Math.sin(time * 2.4) * 0.022;
      starGroup.scale.setScalar(Math.max(0.001, ignition * pulse * starFade));
      innerHalo.material.opacity = 0.08 + ignition * 0.12;
      outerHalo.material.opacity = 0.025 + ignition * 0.045;
      glowMaterial.opacity = ignition * 0.9 * starFade;
      glow.scale.setScalar(7.5 + ignition * 2.0);
      starLight.intensity = ignition * 3.0 * starFade;

      // 02 — one detonation, then expanding shells and a directional particle wake.
      const blast = THREE.MathUtils.smoothstep(time, 4.78, 5.05);
      const flash = Math.max(0, 1 - Math.abs(time - 4.98) / 0.3);
      core.scale.setScalar(1 + flash * 5.2);
      glow.scale.setScalar(7.5 + ignition * 2.0 + flash * 12);
      shockwaves.forEach((ring, i) => {
        const p = THREE.MathUtils.clamp((time - 4.92 - i * 0.14) / 1.55, 0, 1);
        ring.scale.setScalar(0.04 + p * 9.2);
        (ring.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.58 * blast;
      });
      const burstAge = Math.max(0, time - 4.98);
      const age = Math.min(2.25, burstAge);
      for (let i = 0; i < burstCount; i++) {
        const k = i * 3;
        burstPositions[k] = burstVelocity[k] * age;
        burstPositions[k + 1] = burstVelocity[k + 1] * age;
        burstPositions[k + 2] = burstVelocity[k + 2] * age;
      }
      (burstGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      burstMaterial.opacity = blast * (1 - THREE.MathUtils.smoothstep(time, 6.65, 7.5)) * 0.72;

      // 03 — vector culture fragments burst outward, cross camera and settle into depth.
      const plateReveal = THREE.MathUtils.smoothstep(time, 5.28, 6.35);
      const plateFade = 1 - THREE.MathUtils.smoothstep(time, 11.4, 12.85);
      plates.forEach((plate, i) => {
        const [targetX, targetY, targetZ] = plateTargets[i];
        const stagger = i * 0.09;
        const appear = THREE.MathUtils.smoothstep(time, 5.3 + stagger, 6.55 + stagger);
        const disappear = THREE.MathUtils.smoothstep(time, 11.25 + stagger * 0.4, 12.9 + stagger * 0.4);
        const visible = appear * (1 - disappear);
        const fromCenter = 1 - appear;
        const x = targetX * aspectFit.value;
        const flyPast = THREE.MathUtils.smoothstep(time, 9.1, 12.5);
        plate.group.position.set(
          THREE.MathUtils.lerp(0, x, appear) + Math.sin(time * 0.55 + i) * 0.035,
          THREE.MathUtils.lerp(0, targetY, appear) + Math.cos(time * 0.45 + i * 1.4) * 0.045,
          THREE.MathUtils.lerp(1.2, targetZ, appear) + flyPast * (i % 2 ? 1.4 : -1.0)
        );
        plate.group.rotation.set(
          (i % 2 ? -1 : 1) * (0.035 + fromCenter * 0.08),
          (i % 2 ? 1 : -1) * (0.045 + fromCenter * 0.11),
          Math.sin(time * 0.32 + i) * 0.025 + (i % 2 ? -1 : 1) * fromCenter * 0.035
        );
        const scale = (small ? 0.68 : 0.88) * visible * (1 + flyPast * 0.16);
        plate.group.scale.setScalar(Math.max(0.001, scale));
        plate.material.opacity = visible * 0.96;
      });

      // 04 — serpent enters with momentum, then revolves around the stellar core.
      const snakeIn = THREE.MathUtils.smoothstep(time, 11.55, 12.75);
      const snakeOut = 1 - THREE.MathUtils.smoothstep(time, 21.75, 22.55);
      const snakeOpacity = snakeIn * snakeOut;
      serpent.visible = snakeOpacity > 0.001;
      head.visible = serpent.visible;
      if (serpent.visible) {
        serpentPath(time, headPosition);
        serpentPath(time - 0.025, before);
        serpentPath(time + 0.025, after);
        headTangent.subVectors(after, before).normalize();
        if (headTangent.lengthSq() < 0.0001) headTangent.set(1, 0, 0);

        const positionAttribute = bodyGeometry.attributes.position as THREE.BufferAttribute;
        const normalAttribute = bodyGeometry.attributes.normal as THREE.BufferAttribute;
        const bodyLag = 2.55;
        for (let i = 0; i <= bodySegments; i++) {
          const u = i / bodySegments;
          const sampleTime = time - u * bodyLag;
          serpentPath(sampleTime, center);
          serpentPath(sampleTime - 0.016, before);
          serpentPath(sampleTime + 0.016, after);
          tangent.subVectors(after, before).normalize();
          const reference = Math.abs(tangent.dot(up)) > 0.92 ? fallbackUp : up;
          normal.crossVectors(tangent, reference).normalize();
          binormal.crossVectors(tangent, normal).normalize();
          const radius = (0.17 * Math.pow(1 - u, 0.72) + 0.012) * (0.98 + Math.sin(u * 22 - time * 1.8) * 0.025);
          for (let j = 0; j <= radialSegments; j++) {
            const angle = (j / radialSegments) * Math.PI * 2;
            const radialX = normal.x * Math.cos(angle) + binormal.x * Math.sin(angle);
            const radialY = normal.y * Math.cos(angle) + binormal.y * Math.sin(angle);
            const radialZ = normal.z * Math.cos(angle) + binormal.z * Math.sin(angle);
            const vertex = i * (radialSegments + 1) + j;
            positionAttribute.setXYZ(
              vertex,
              center.x + radialX * radius,
              center.y + radialY * radius,
              center.z + radialZ * radius
            );
            normalAttribute.setXYZ(vertex, radialX, radialY, radialZ);
          }
        }
        positionAttribute.needsUpdate = true;
        normalAttribute.needsUpdate = true;
        serpentMaterial.opacity = snakeOpacity * 0.98;

        head.position.copy(headPosition);
        head.quaternion.setFromUnitVectors(axisX, headTangent);
        head.scale.setScalar(snakeIn * snakeOut);
      }

      // 05 — the living loop resolves into the clean orbital mark under the wordmark.
      const markIn = THREE.MathUtils.smoothstep(time, 20.0, 22.25);
      shockwaves[0].scale.setScalar(2.28);
      (shockwaves[0].material as THREE.MeshBasicMaterial).opacity = markIn * 0.3;
      starGroup.scale.multiplyScalar(1 - markIn * 0.35);

      // Camera is almost locked: cinematic scale comes from the motion, not jitter.
      const cameraEase = THREE.MathUtils.smoothstep(time, 4.6, 8.2);
      camera.position.x = Math.sin(time * 0.08) * 0.035;
      camera.position.y = Math.cos(time * 0.07) * 0.025;
      camera.position.z = 18 - cameraEase * 0.18;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      if (time > 23.2) {
        stopped = true;
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    render();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      starGeometry.dispose();
      starMaterial.dispose();
      burstGeometry.dispose();
      burstMaterial.dispose();
      bodyGeometry.dispose();
      serpentMaterial.dispose();
      headGeometry.dispose();
      headMaterial.dispose();
      glowTexture.dispose();
      culture.forEach((_, i) => {
        plates[i].texture.dispose();
        plates[i].material.dispose();
      });
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
          else material.dispose();
        }
      });
      renderer.dispose();
      if (root.contains(renderer.domElement)) root.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="cinematic-sequence" ref={host} aria-hidden="true" />;
}
