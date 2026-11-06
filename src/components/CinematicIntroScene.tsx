import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * UNIPARC cinematic origin sequence.
 * Procedural motion design only: no stock footage, screenshots or image montage.
 * The culture panels are animated canvas artwork; the serpent is a continuous,
 * dynamically skinned metallic mesh with a spline-driven flight path.
 */
export default function CinematicIntroScene() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = host.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const small = window.matchMedia('(max-width: 700px)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 18);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !small,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      });
    } catch (error) {
      console.warn('UNIPARC intro: WebGL unavailable; continuing with the HTML intro.', error);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1 : 1.25));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    root.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x87909a, 0.48));
    const keyLight = new THREE.DirectionalLight(0xe9edf1, 1.8);
    keyLight.position.set(-4, 5, 8);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xc6d9e8, 0, 18);
    rimLight.position.set(0, 0, 2);
    scene.add(rimLight);
    const starLight = new THREE.PointLight(0xfff5d9, 0, 24);
    scene.add(starLight);

    // A quiet, fixed starfield. No per-frame particle simulation is needed here.
    const starCount = small ? 300 : 620;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 52;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      starPositions[i * 3 + 2] = -26 + Math.random() * 30;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xdce2e8,
      size: small ? 0.035 : 0.042,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // A single star grows from a pin of light into a controlled, high-energy source.
    const star = new THREE.Group();
    scene.add(star);
    const starCoreMaterial = new THREE.MeshBasicMaterial({ color: 0xfffdf2 });
    const starCore = new THREE.Mesh(new THREE.SphereGeometry(0.105, 24, 18), starCoreMaterial);
    star.add(starCore);
    const starHalo = new THREE.Mesh(
      new THREE.SphereGeometry(0.52, 24, 18),
      new THREE.MeshBasicMaterial({
        color: 0xf4e8c8,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    star.add(starHalo);
    const starOuter = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 24, 18),
      new THREE.MeshBasicMaterial({
        color: 0xc8d9e6,
        transparent: true,
        opacity: 0.035,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    star.add(starOuter);

    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128;
    glowCanvas.height = 128;
    const glowContext = glowCanvas.getContext('2d');
    if (!glowContext) {
      renderer.dispose();
      root.removeChild(renderer.domElement);
      return;
    }
    const glowGradient = glowContext.createRadialGradient(64, 64, 0, 64, 64, 64);
    glowGradient.addColorStop(0, 'rgba(255,255,250,0.96)');
    glowGradient.addColorStop(0.07, 'rgba(255,246,220,0.58)');
    glowGradient.addColorStop(0.24, 'rgba(222,226,210,0.16)');
    glowGradient.addColorStop(1, 'rgba(205,218,232,0)');
    glowContext.fillStyle = glowGradient;
    glowContext.fillRect(0, 0, 128, 128);
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const starGlowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xf4edda,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starGlow = new THREE.Sprite(starGlowMaterial);
    starGlow.scale.set(8, 8, 1);
    star.add(starGlow);

    // Radial shockwave rings and a short, directional burst.
    const shockRings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.008, 5, 112),
        new THREE.MeshBasicMaterial({
          color: i === 1 ? 0xffffff : 0xd8e0e8,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      ring.rotation.set(i * 0.46, i * 0.62, i * 0.28);
      scene.add(ring);
      shockRings.push(ring);
    }

    const burstCount = small ? 300 : 560;
    const burstPositions = new Float32Array(burstCount * 3);
    const burstVelocity = new Float32Array(burstCount * 3);
    for (let i = 0; i < burstCount; i++) {
      const direction = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        (Math.random() * 2 - 1) * 0.38
      ).normalize();
      const speed = 3.2 + Math.random() * 6.2;
      burstVelocity.set([direction.x * speed, direction.y * speed, direction.z * speed], i * 3);
    }
    const burstGeometry = new THREE.BufferGeometry();
    burstGeometry.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));
    const burstMaterial = new THREE.PointsMaterial({
      color: 0xe6e9e5,
      size: small ? 0.025 : 0.032,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const burst = new THREE.Points(burstGeometry, burstMaterial);
    scene.add(burst);

    // Culture is expressed as animated typography, graphic shapes and kinetic linework.
    // Every frame is drawn procedurally into a canvas texture; there are no source images.
    type CulturePanel = {
      group: THREE.Group;
      texture: THREE.CanvasTexture;
      context: CanvasRenderingContext2D;
      material: THREE.MeshBasicMaterial;
      frameMaterial: THREE.MeshBasicMaterial;
    };
    const culture = [
      { title: 'ANIME / MANGA', code: '01', accent: '#e9c8ad', hot: '#b95e4e', kind: 0 },
      { title: 'FILM / SCREEN', code: '02', accent: '#e8e2d4', hot: '#b49a72', kind: 1 },
      { title: 'MEME CULTURE', code: '03', accent: '#eee9df', hot: '#a99acb', kind: 2 },
      { title: 'GAMES / PLAY', code: '04', accent: '#d9e4d4', hot: '#719a91', kind: 3 },
      { title: 'MUSIC / SOUND', code: '05', accent: '#eee0d2', hot: '#bd7869', kind: 4 },
      { title: 'COMIC / ART', code: '06', accent: '#eee1bd', hot: '#bd984b', kind: 5 },
    ];
    const panelPositions = [
      [-4.55, 1.75, -1.25], [-1.5, 2.45, -0.85], [1.75, 1.9, -1.3],
      [4.55, 0.2, -2.0], [-3.65, -1.9, -1.45], [0.0, -2.4, -0.9],
    ];
    const panels: CulturePanel[] = [];

    culture.forEach((item, index) => {
      const canvas = document.createElement('canvas');
      canvas.width = small ? 400 : 560;
      canvas.height = small ? 225 : 315;
      const context = canvas.getContext('2d');
      if (!context) return;
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      const frameMaterial = new THREE.MeshBasicMaterial({
        color: 0xbec8cf,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const faceMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        toneMapped: false,
        depthWrite: false,
      });
      const group = new THREE.Group();
      group.add(new THREE.Mesh(new THREE.PlaneGeometry(3.32, 1.88), frameMaterial));
      const face = new THREE.Mesh(new THREE.PlaneGeometry(3.29, 1.85), faceMaterial);
      face.position.z = 0.012;
      group.add(face);
      group.scale.setScalar(0.001);
      scene.add(group);
      panels.push({ group, texture, context, material: faceMaterial, frameMaterial });
    });

    const drawCulturePanel = (panel: CulturePanel, item: (typeof culture)[number], time: number) => {
      const ctx = panel.context;
      const w = panel.texture.image.width as number;
      const h = panel.texture.image.height as number;
      const pulse = 0.5 + Math.sin(time * 1.6 + item.kind) * 0.5;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#080a0b';
      ctx.fillRect(0, 0, w, h);
      const atmosphere = ctx.createRadialGradient(w * (0.72 + Math.sin(time * 0.22) * 0.05), h * 0.42, 2, w * 0.68, h * 0.5, w * 0.7);
      atmosphere.addColorStop(0, item.hot + '8a');
      atmosphere.addColorStop(0.46, item.hot + '25');
      atmosphere.addColorStop(1, '#080a0b00');
      ctx.fillStyle = atmosphere;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.strokeStyle = item.accent;
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const x = w * 0.72 + Math.cos(i * Math.PI / 6 + time * 0.16) * w * 0.38;
        const y = h * 0.48 + Math.sin(i * Math.PI / 6 + time * 0.16) * h * 0.58;
        ctx.beginPath();
        ctx.moveTo(w * 0.5, h * 0.5);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      ctx.restore();

      if (item.kind === 0) {
        // Manga impact language: sweeping speed lines and a moving eclipse.
        const x = w * (0.73 + Math.sin(time * 0.55) * 0.035);
        const y = h * 0.48;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.42);
        ctx.strokeStyle = item.accent;
        ctx.globalAlpha = 0.42;
        for (let i = -8; i <= 8; i++) {
          ctx.beginPath();
          ctx.moveTo(-w * 0.7, i * 15);
          ctx.lineTo(w * 0.25, i * 7);
          ctx.stroke();
        }
        ctx.restore();
        ctx.fillStyle = item.hot;
        ctx.beginPath();
        ctx.arc(x, y, h * (0.2 + pulse * 0.018), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#080a0b';
        ctx.beginPath();
        ctx.arc(x - h * 0.075, y - h * 0.04, h * 0.18, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.kind === 1) {
        // Cinema: an anamorphic beam travels across a deep, minimal frame.
        const beamX = w * (0.25 + ((time * 0.08) % 0.55));
        const beam = ctx.createLinearGradient(beamX - 70, 0, beamX + 70, 0);
        beam.addColorStop(0, '#ffffff00');
        beam.addColorStop(0.5, item.accent + 'a0');
        beam.addColorStop(1, '#ffffff00');
        ctx.fillStyle = beam;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#050607';
        ctx.fillRect(0, h * 0.77, w, h * 0.23);
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = item.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.12, h * 0.72);
        ctx.lineTo(w * 0.5, h * 0.28);
        ctx.lineTo(w * 0.86, h * 0.72);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (item.kind === 2) {
        // Internet culture: oversized kinetic type, treated as a graphic title card.
        ctx.fillStyle = item.accent;
        ctx.font = '900 ' + Math.round(h * 0.24) + 'px Arial, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText('NO CONTEXT', w * 0.075, h * 0.43);
        ctx.fillStyle = item.hot;
        ctx.font = '900 ' + Math.round(h * 0.2) + 'px Arial, sans-serif';
        ctx.fillText('NEEDED.', w * 0.075, h * 0.69 + Math.sin(time * 2) * 2);
        ctx.globalAlpha = 0.55;
        ctx.font = '12px monospace';
        ctx.fillText('INTERNET / CULTURE / 001', w * 0.08, h * 0.88);
        ctx.globalAlpha = 1;
      } else if (item.kind === 3) {
        // Gaming: a parallax grid and a reticle that locks onto the centre.
        ctx.strokeStyle = item.hot;
        ctx.globalAlpha = 0.32;
        for (let i = -8; i <= 8; i++) {
          ctx.beginPath();
          ctx.moveTo(w * 0.5 + i * 2, h * 0.22);
          ctx.lineTo(w * 0.5 + i * 36 + Math.sin(time + i) * 8, h);
          ctx.stroke();
        }
        const cx = w * 0.65 + Math.sin(time * 0.8) * 12;
        const cy = h * 0.48 + Math.cos(time * 0.7) * 8;
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = item.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, h * (0.16 + pulse * 0.012), 0, Math.PI * 2);
        ctx.moveTo(cx - 52, cy); ctx.lineTo(cx + 52, cy);
        ctx.moveTo(cx, cy - 52); ctx.lineTo(cx, cy + 52);
        ctx.stroke();
      } else if (item.kind === 4) {
        // Sound: a continuous waveform and a subtle rotating record groove.
        ctx.strokeStyle = item.hot;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const y = h * 0.5 + Math.sin(x * 0.025 + time * 2.1) * (h * 0.13 + Math.sin(x * 0.009 + time) * h * 0.12);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.strokeStyle = item.accent;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(w * 0.79, h * 0.42, h * 0.19, 0, Math.PI * 2);
        ctx.arc(w * 0.79, h * 0.42, h * 0.08, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Comic art: restrained halftone, panel geometry and a sharp impact slash.
        ctx.fillStyle = item.hot;
        for (let y = 8; y < h; y += 10) {
          for (let x = 8; x < w; x += 10) {
            const distance = Math.hypot(x - w * 0.68, y - h * 0.5);
            if (distance > h * 0.28) ctx.fillRect(x, y, 1.5, 1.5);
          }
        }
        ctx.save();
        ctx.translate(w * 0.65, h * 0.5);
        ctx.rotate(-0.12 + Math.sin(time * 0.7) * 0.015);
        ctx.strokeStyle = item.accent;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-h * 0.45, h * 0.16);
        ctx.lineTo(h * 0.44, -h * 0.16);
        ctx.stroke();
        ctx.restore();
      }

      // Editorial metadata and a fine frame keep the graphic language cohesive.
      ctx.globalAlpha = 0.68;
      ctx.fillStyle = item.accent;
      ctx.font = '10px monospace';
      ctx.textBaseline = 'top';
      ctx.fillText('UNIPARC  /  ' + item.code, 18, 14);
      ctx.textAlign = 'right';
      ctx.fillText('CULTURE INDEX', w - 18, 14);
      ctx.textAlign = 'left';
      ctx.strokeStyle = item.accent;
      ctx.lineWidth = 1;
      ctx.strokeRect(6, 6, w - 12, h - 12);
      ctx.globalAlpha = 1;
      ctx.fillStyle = item.accent;
      ctx.font = '700 ' + Math.round(h * 0.09) + 'px Arial, sans-serif';
      ctx.textBaseline = 'bottom';
      ctx.fillText(item.title, 18, h - 18);
      panel.texture.needsUpdate = true;
    };

    // A sculptural, tapered head: no eyes, jaw, horns or cartoon facial features.
    // Its silhouette is integrated with the body rather than reading as a character.
    const makeHeadGeometry = () => {
      const rings = [
        { x: -0.27, r: 0.065 },
        { x: -0.16, r: 0.125 },
        { x: 0.02, r: 0.145 },
        { x: 0.2, r: 0.105 },
        { x: 0.34, r: 0.018 },
      ];
      const radial = 20;
      const positions: number[] = [];
      const indices: number[] = [];
      rings.forEach((ring) => {
        for (let j = 0; j <= radial; j++) {
          const angle = (j / radial) * Math.PI * 2;
          positions.push(ring.x, Math.cos(angle) * ring.r, Math.sin(angle) * ring.r * 0.84);
        }
      });
      for (let i = 0; i < rings.length - 1; i++) {
        for (let j = 0; j < radial; j++) {
          const a = i * (radial + 1) + j;
          const b = a + radial + 1;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      return geometry;
    };

    const bodySegments = small ? 92 : 132;
    const radialSegments = 10;
    const bodyPositions = new Float32Array((bodySegments + 1) * (radialSegments + 1) * 3);
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
    bodyGeometry.setIndex(bodyIndices);
    const serpentMaterial = new THREE.MeshStandardMaterial({
      color: 0x9ca8b0,
      metalness: 0.86,
      roughness: 0.23,
      emissive: 0x11171b,
      emissiveIntensity: 0.18,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const serpent = new THREE.Mesh(bodyGeometry, serpentMaterial);
    scene.add(serpent);

    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xb9c3c8,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x11181d,
      emissiveIntensity: 0.12,
    });
    const head = new THREE.Mesh(makeHeadGeometry(), headMaterial);
    scene.add(head);

    const approachDuration = 1.55;
    const orbitDuration = 4.75;
    const trailDuration = orbitDuration;
    const serpentStart = 8.15;
    let horizontalFit = 1;
    const p0 = new THREE.Vector3(-8.2, -2.35, 1.2);
    const p1 = new THREE.Vector3(-5.5, -2.65, 0.85);
    const p2 = new THREE.Vector3(-2.0, -1.2, 0.2);
    const p3 = new THREE.Vector3(-2.0, 0, 0.2);

    // The flight curve and orbital path share the same tangent at their join.
    // One complete orbit brings the head back to the tail, closing the Ouroboros.
    const serpentPosition = (elapsed: number, target: THREE.Vector3) => {
      if (elapsed <= 0) return target.copy(p0);
      if (elapsed < approachDuration) {
        const u = elapsed / approachDuration;
        const inv = 1 - u;
        return target.set(
          inv * inv * inv * p0.x + 3 * inv * inv * u * p1.x + 3 * inv * u * u * p2.x + u * u * u * p3.x,
          inv * inv * inv * p0.y + 3 * inv * inv * u * p1.y + 3 * inv * u * u * p2.y + u * u * u * p3.y,
          inv * inv * inv * p0.z + 3 * inv * inv * u * p1.z + 3 * inv * u * u * p2.z + u * u * u * p3.z
        );
      }
      const u = THREE.MathUtils.clamp((elapsed - approachDuration) / orbitDuration, 0, 1);
      const angle = Math.PI - u * Math.PI * 2;
      const radius = 2.0 + Math.sin(u * Math.PI * 2) * 0.025;
      return target.set(
        Math.cos(angle) * radius * horizontalFit,
        Math.sin(angle) * radius * 0.84,
        0.18 + Math.sin(angle * 2) * 0.12
      );
    };

    const tempCenter = new THREE.Vector3();
    const headCenter = new THREE.Vector3();
    const tempPrev = new THREE.Vector3();
    const tempNext = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    const headTangent = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const binormal = new THREE.Vector3();
    const worldUp = new THREE.Vector3(0, 0, 1);
    const axisX = new THREE.Vector3(1, 0, 0);

    const resize = () => {
      const width = Math.max(1, root.clientWidth);
      const height = Math.max(1, root.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      horizontalFit = THREE.MathUtils.clamp((width / height) / 1.28, 0.42, 1);
      p0.x = -8.2 * horizontalFit;
      p1.x = -5.5 * horizontalFit;
      p2.x = -2.0 * horizontalFit;
      p3.x = -2.0 * horizontalFit;
      const compactScale = small ? 0.68 : 0.92;
      panels.forEach((panel, index) => {
        const [x, y, z] = panelPositions[index];
        panel.group.position.set(x * horizontalFit, y * (small ? 0.88 : 1), z);
        panel.group.scale.setScalar(compactScale * 0.001);
      });
    };
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    resize();

    const clock = new THREE.Clock();
    let raf = 0;
    let lastPanelDraw = -1;
    let disposed = false;

    const render = () => {
      if (disposed) return;
      raf = requestAnimationFrame(render);
      const time = clock.getElapsedTime();

      stars.rotation.y = time * 0.002;
      stars.rotation.x = Math.sin(time * 0.06) * 0.004;

      const ignition = THREE.MathUtils.smoothstep(time, 1.0, 3.15);
      const starPulse = 1 + Math.sin(time * 2.2) * 0.018;
      const starFade = 1 - THREE.MathUtils.smoothstep(time, 14.0, 14.85);
      star.scale.setScalar(Math.max(0.001, ignition * starPulse * starFade));
      starHalo.material.opacity = 0.08 + ignition * 0.12;
      starOuter.material.opacity = 0.02 + ignition * 0.045;
      starGlowMaterial.opacity = ignition * 0.84 * starFade;
      starLight.intensity = ignition * 3.2 * starFade;
      rimLight.intensity = ignition * 0.42;

      const flash = Math.max(0, 1 - Math.abs(time - 4.05) / 0.24);
      starCore.scale.setScalar(1 + flash * 5.2);
      starGlow.scale.setScalar(8 + ignition * 2 + flash * 15);

      const bang = THREE.MathUtils.smoothstep(time, 3.95, 4.18);
      shockRings.forEach((ring, index) => {
        const age = THREE.MathUtils.clamp((time - 4.0 - index * 0.12) / 1.15, 0, 1);
        ring.scale.setScalar(0.04 + age * 11.5);
        (ring.material as THREE.MeshBasicMaterial).opacity = (1 - age) * 0.64 * bang;
      });

      const burstAge = Math.max(0, time - 4.02);
      const particleAge = Math.min(1.85, burstAge);
      for (let i = 0; i < burstCount; i++) {
        const k = i * 3;
        burstPositions[k] = burstVelocity[k] * particleAge;
        burstPositions[k + 1] = burstVelocity[k + 1] * particleAge;
        burstPositions[k + 2] = burstVelocity[k + 2] * particleAge;
      }
      burstGeometry.attributes.position.needsUpdate = true;
      burstMaterial.opacity = bang * (1 - THREE.MathUtils.smoothstep(time, 5.95, 6.8)) * 0.7;

      const shouldRedraw = lastPanelDraw < 0 || time - lastPanelDraw >= 1 / 24;
      if (shouldRedraw) lastPanelDraw = time;
      panels.forEach((panel, index) => {
        const item = culture[index];
        if (shouldRedraw) drawCulturePanel(panel, item, time + index * 0.19);
        const [targetX, targetY, targetZ] = panelPositions[index];
        const stagger = index * 0.085;
        const appear = THREE.MathUtils.smoothstep(time, 4.2 + stagger, 5.75 + stagger);
        const vanish = THREE.MathUtils.smoothstep(time, 8.85 + stagger * 0.4, 10.0 + stagger * 0.4);
        const visible = appear * (1 - vanish);
        const spread = THREE.MathUtils.smoothstep(time, 4.3 + stagger, 5.8 + stagger);
        const flyThrough = THREE.MathUtils.smoothstep(time, 7.35, 9.8);
        const drift = Math.sin(time * 0.28 + index * 1.4) * 0.035;
        panel.group.position.set(
          THREE.MathUtils.lerp(0, targetX * horizontalFit, spread) + (index % 2 ? 1 : -1) * flyThrough * (0.8 + index * 0.12),
          THREE.MathUtils.lerp(0, targetY, spread) + drift,
          THREE.MathUtils.lerp(1.1, targetZ, spread) + flyThrough * 2.4
        );
        panel.group.rotation.set(
          (index % 2 ? -1 : 1) * (0.018 + (1 - spread) * 0.055),
          (index % 2 ? -1 : 1) * (0.035 + (1 - spread) * 0.11),
          (index % 2 ? -1 : 1) * (0.018 + (1 - spread) * 0.065)
        );
        panel.group.scale.setScalar(Math.max(0.001, (small ? 0.68 : 0.92) * visible));
        panel.material.opacity = visible;
        panel.frameMaterial.opacity = visible * 0.48;
      });

      // Smooth charge, one continuous orbit, then a clean closed ring.
      const serpentElapsed = time - serpentStart;
      const serpentIn = THREE.MathUtils.smoothstep(time, serpentStart, serpentStart + 0.42);
      const serpentOut = 1 - THREE.MathUtils.smoothstep(time, 14.35, 15.05);
      const serpentOpacity = serpentIn * serpentOut;
      serpent.visible = serpentOpacity > 0.001;
      head.visible = serpent.visible;
      if (serpent.visible) {
        const elapsed = Math.max(0, Math.min(approachDuration + orbitDuration, serpentElapsed));
        const current = serpentPosition(elapsed, tempCenter);
        headCenter.copy(current);
        const before = serpentPosition(Math.max(0, elapsed - 0.012), tempPrev);
        const after = serpentPosition(Math.min(approachDuration + orbitDuration, elapsed + 0.012), tempNext);
        headTangent.subVectors(after, before).normalize();
        if (headTangent.lengthSq() < 0.0001) headTangent.set(1, 0, 0);

        const position = bodyGeometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i <= bodySegments; i++) {
          const u = i / bodySegments;
          const sampleTime = Math.max(0, elapsed - u * trailDuration);
          const center = serpentPosition(sampleTime, tempCenter);
          const prev = serpentPosition(Math.max(0, sampleTime - 0.012), tempPrev);
          const next = serpentPosition(Math.min(approachDuration + orbitDuration, sampleTime + 0.012), tempNext);
          tangent.subVectors(next, prev).normalize();
          if (tangent.lengthSq() < 0.0001) tangent.set(1, 0, 0);
          normal.crossVectors(tangent, worldUp).normalize();
          if (normal.lengthSq() < 0.0001) normal.set(0, 1, 0);
          binormal.crossVectors(tangent, normal).normalize();
          const radius = 0.132 * Math.pow(1 - u, 0.72) + 0.008;
          for (let j = 0; j <= radialSegments; j++) {
            const angle = (j / radialSegments) * Math.PI * 2;
            const offsetA = Math.cos(angle) * radius;
            const offsetB = Math.sin(angle) * radius;
            const vertex = i * (radialSegments + 1) + j;
            position.setXYZ(
              vertex,
              center.x + normal.x * offsetA + binormal.x * offsetB,
              center.y + normal.y * offsetA + binormal.y * offsetB,
              center.z + normal.z * offsetA + binormal.z * offsetB
            );
          }
        }
        position.needsUpdate = true;
        bodyGeometry.computeVertexNormals();
        serpentMaterial.opacity = serpentOpacity * 0.98;
        head.position.copy(headCenter);
        head.quaternion.setFromUnitVectors(axisX, headTangent);
        head.scale.setScalar(serpentOpacity);
      }

      // At the end of the orbit the serpent holds a clean metallic ring.
      // The star then collapses into the light used by the wordmark transition.
      const consume = THREE.MathUtils.smoothstep(time, 14.0, 14.8);
      star.scale.multiplyScalar(1 - consume * 0.78);

      camera.position.x = Math.sin(time * 0.08) * 0.035;
      camera.position.y = Math.cos(time * 0.075) * 0.025;
      camera.position.z = 18 - THREE.MathUtils.smoothstep(time, 3.5, 8.2) * 0.16;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);

      if (time > 15.35) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    render();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      starGeometry.dispose();
      starMaterial.dispose();
      burstGeometry.dispose();
      burstMaterial.dispose();
      bodyGeometry.dispose();
      serpentMaterial.dispose();
      head.geometry.dispose();
      headMaterial.dispose();
      glowTexture.dispose();
      panels.forEach((panel) => {
        panel.texture.dispose();
        panel.material.dispose();
        panel.frameMaterial.dispose();
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
