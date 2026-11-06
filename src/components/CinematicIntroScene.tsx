import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * UNIPARC origin sequence.
 * All visual material is procedural: geometry, typography, linework and canvas
 * animation. No stock stills or pre-rendered video are used.
 */
export default function CinematicIntroScene() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = host.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 120);
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

    const isSmall = window.innerWidth < 700;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.15 : 1.4));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    root.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xb8c0a6, 0.32);
    scene.add(ambient);
    const starLight = new THREE.PointLight(0xe8f1cb, 0, 26);
    scene.add(starLight);

    // Deep space: a restrained, fixed point field rather than a noisy particle cloud.
    const starCount = isSmall ? 520 : 1050;
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 54;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 32;
      starPositions[i * 3 + 2] = -28 + Math.random() * 34;
      starSizes[i] = 0.35 + Math.random() * 0.65;
    }
    const starFieldGeo = new THREE.BufferGeometry();
    starFieldGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starFieldMat = new THREE.PointsMaterial({
      color: 0xdce3d0,
      size: 0.032,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const starField = new THREE.Points(starFieldGeo, starFieldMat);
    scene.add(starField);

    // The ignition point: a hot white core with a soft, physical falloff.
    const starGroup = new THREE.Group();
    scene.add(starGroup);
    const starCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 32, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    starGroup.add(starCore);
    const starHalo = new THREE.Mesh(
      new THREE.SphereGeometry(0.58, 32, 24),
      new THREE.MeshBasicMaterial({
        color: 0xe5f5c0,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    starGroup.add(starHalo);
    const starOuter = new THREE.Mesh(
      new THREE.SphereGeometry(1.15, 32, 24),
      new THREE.MeshBasicMaterial({
        color: 0xb4d879,
        transparent: true,
        opacity: 0.045,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    starGroup.add(starOuter);

    // Soft radial glow texture, generated once and reused.
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128;
    glowCanvas.height = 128;
    const glowCtx = glowCanvas.getContext('2d')!;
    const glowGradient = glowCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    glowGradient.addColorStop(0, 'rgba(255,255,244,0.92)');
    glowGradient.addColorStop(0.08, 'rgba(235,248,202,0.56)');
    glowGradient.addColorStop(0.28, 'rgba(190,220,133,0.16)');
    glowGradient.addColorStop(1, 'rgba(170,205,120,0)');
    glowCtx.fillStyle = glowGradient;
    glowCtx.fillRect(0, 0, 128, 128);
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const starGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xe8f3ce,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    starGlow.scale.set(8.5, 8.5, 1);
    starGroup.add(starGlow);

    // Big-bang shock rings.
    const shockRings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.009, 6, 128),
        new THREE.MeshBasicMaterial({
          color: i === 1 ? 0xf5f4e8 : 0xd7e9b0,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      ring.rotation.set(i * 0.54, i * 0.71, i * 0.32);
      scene.add(ring);
      shockRings.push(ring);
    }

    // Short, directional energy burst. It decays quickly and never becomes confetti.
    const burstCount = isSmall ? 520 : 980;
    const burstGeo = new THREE.BufferGeometry();
    const burstPositions = new Float32Array(burstCount * 3);
    const burstVelocity = new Float32Array(burstCount * 3);
    const burstColors = new Float32Array(burstCount * 3);
    for (let i = 0; i < burstCount; i++) {
      const v = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        (Math.random() * 2 - 1) * 0.55
      ).normalize();
      const speed = 3.5 + Math.random() * 7.5;
      burstVelocity.set([v.x * speed, v.y * speed, v.z * speed], i * 3);
      burstColors.set([0.86 + Math.random() * 0.14, 0.9 + Math.random() * 0.1, 0.72 + Math.random() * 0.2], i * 3);
    }
    burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));
    burstGeo.setAttribute('color', new THREE.BufferAttribute(burstColors, 3));
    const burstMat = new THREE.PointsMaterial({
      size: isSmall ? 0.038 : 0.046,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const burst = new THREE.Points(burstGeo, burstMat);
    scene.add(burst);

    // Each rectangle is a miniature motion-design shot, not a still image.
    // Artwork is drawn into a canvas texture: anime energy, cinema, meme type,
    // game HUD, sound and comic-book halftone language.
    type Panel = {
      group: THREE.Group;
      texture: THREE.CanvasTexture;
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D;
      material: THREE.MeshBasicMaterial;
      frameMaterial: THREE.MeshBasicMaterial;
      index: number;
    };

    const themes = [
      { name: 'anime', base: '#17131c', accent: '#f0d9c9', hot: '#dc654c' },
      { name: 'cinema', base: '#101619', accent: '#e7e2d3', hot: '#d1a96e' },
      { name: 'meme', base: '#1a1721', accent: '#f4efff', hot: '#b7a0ee' },
      { name: 'game', base: '#0b1a1a', accent: '#d9f36a', hot: '#74c9b0' },
      { name: 'music', base: '#171316', accent: '#f2d7c2', hot: '#d47b63' },
      { name: 'comic', base: '#191710', accent: '#f4e9c8', hot: '#e0b34e' },
    ];
    const panelLayout = [
      [-4.7, 2.05, -1.5],
      [-1.55, 2.72, -0.6],
      [2.0, 2.0, -1.4],
      [4.85, 0.35, -2.1],
      [-3.8, -2.0, -1.25],
      [0.0, -2.55, -0.7],
    ];

    const panels: Panel[] = [];
    themes.forEach((theme, i) => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d')!;
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const frameMaterial = new THREE.MeshBasicMaterial({
        color: 0xdfe4d6,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const frame = new THREE.Mesh(new THREE.PlaneGeometry(3.35, 1.91), frameMaterial);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        toneMapped: false,
        depthWrite: false,
      });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.29, 1.85), material);
      screen.position.z = 0.012;
      const group = new THREE.Group();
      group.add(frame, screen);
      group.scale.setScalar(0.001);
      scene.add(group);
      panels.push({ group, texture, canvas, ctx, material, frameMaterial, index: i });
    });

    const drawPanel = (panel: Panel, time: number) => {
      const { ctx, canvas, index } = panel;
      const theme = themes[index];
      const w = canvas.width;
      const h = canvas.height;
      const pulse = 0.5 + Math.sin(time * 2.2 + index) * 0.5;

      ctx.globalAlpha = 1;
      ctx.fillStyle = theme.base;
      ctx.fillRect(0, 0, w, h);

      if (index === 0) {
        // Anime-inspired impact shot: speed lines, eclipse and a single energy slash.
        const cx = 420 + Math.sin(time * 0.7) * 28;
        const cy = 170 + Math.cos(time * 0.9) * 15;
        ctx.strokeStyle = theme.accent;
        ctx.globalAlpha = 0.22;
        ctx.lineWidth = 2;
        for (let n = 0; n < 38; n++) {
          const a = (n / 38) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * 95, cy + Math.sin(a) * 65);
          ctx.lineTo(cx + Math.cos(a) * (260 + pulse * 40), cy + Math.sin(a) * (190 + pulse * 30));
          ctx.stroke();
        }
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = theme.hot;
        ctx.beginPath();
        ctx.arc(cx, cy, 72 + pulse * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#17131c';
        ctx.beginPath();
        ctx.arc(cx - 25, cy - 15, 64, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.translate(260, 175);
        ctx.rotate(-0.48 + Math.sin(time * 1.1) * 0.025);
        const slash = ctx.createLinearGradient(-220, 0, 220, 0);
        slash.addColorStop(0, 'rgba(255,255,255,0)');
        slash.addColorStop(0.48, '#fff6e8');
        slash.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = slash;
        ctx.fillRect(-240, -3, 480, 6);
        ctx.restore();
      } else if (index === 1) {
        // Abstract cinema frame with moving practical light and film-gate marks.
        const glow = ctx.createRadialGradient(380 + Math.sin(time) * 80, 145, 2, 380, 145, 250);
        glow.addColorStop(0, 'rgba(237,214,168,0.65)');
        glow.addColorStop(1, 'rgba(237,214,168,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#080b0c';
        ctx.fillRect(0, 0, w, 36);
        ctx.fillRect(0, h - 36, w, 36);
        ctx.fillStyle = theme.accent;
        for (let x = 14; x < w; x += 34) {
          ctx.fillRect(x, 10, 16, 7);
          ctx.fillRect(x, h - 17, 16, 7);
        }
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = theme.hot;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, 280);
        ctx.lineTo(245, 112);
        ctx.lineTo(340, 280);
        ctx.stroke();
      } else if (index === 2) {
        // Kinetic meme / internet typography. Large, legible and deliberately simple.
        ctx.fillStyle = theme.hot;
        ctx.fillRect(0, 0, 14, h);
        ctx.fillStyle = theme.accent;
        ctx.font = '900 64px Arial, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText('POV:', 48, 105);
        ctx.font = '900 54px Arial, sans-serif';
        ctx.fillText('YOU FOUND', 48, 178);
        ctx.fillText('YOUR PEOPLE.', 48, 242 + Math.sin(time * 2) * 5);
        ctx.globalAlpha = 0.62;
        ctx.font = '18px monospace';
        ctx.fillText('NO CONTEXT REQUIRED  /  001', 50, 315);
      } else if (index === 3) {
        // Arcade / game HUD with a moving reticle and perspective grid.
        ctx.strokeStyle = theme.hot;
        ctx.globalAlpha = 0.34;
        ctx.lineWidth = 2;
        for (let x = -200; x < 900; x += 54) {
          ctx.beginPath();
          ctx.moveTo(320 + (x - 320) * 0.12, 100);
          ctx.lineTo(x + Math.sin(time + x) * 8, 360);
          ctx.stroke();
        }
        for (let y = 110; y < 390; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
        const x = 320 + Math.sin(time * 1.4) * 100;
        const y = 178 + Math.cos(time * 1.1) * 42;
        ctx.globalAlpha = 0.95;
        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 48 + pulse * 5, 0, Math.PI * 2);
        ctx.moveTo(x - 72, y); ctx.lineTo(x + 72, y);
        ctx.moveTo(x, y - 72); ctx.lineTo(x, y + 72);
        ctx.stroke();
        ctx.fillStyle = theme.accent;
        ctx.font = '16px monospace';
        ctx.fillText('PLAYER 01', 30, 42);
        ctx.fillText('LEVEL ∞', 500, 42);
      } else if (index === 4) {
        // Music visualizer: a moving waveform and a rotating record.
        ctx.strokeStyle = theme.hot;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        for (let x = 0; x < w; x += 4) {
          const y = 180 + Math.sin(x * 0.025 + time * 2.8) * (20 + 58 * Math.sin(x * 0.008 + time));
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = theme.accent;
        for (let x = 28; x < w; x += 38) {
          const bar = 16 + Math.abs(Math.sin(x * 0.023 + time * 2)) * 76;
          ctx.fillRect(x, 300 - bar, 7, bar);
        }
        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(500, 105, 54, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(500, 105, 8, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Comic language: halftone field, panel gutters and a kinetic impact word.
        ctx.fillStyle = '#d7b66e';
        for (let y = 12; y < h; y += 12) {
          for (let x = 12; x < w; x += 12) {
            const d = Math.hypot(x - 320, y - 180);
            if (d > 95 + pulse * 10) ctx.fillRect(x, y, 2, 2);
          }
        }
        ctx.save();
        ctx.translate(320, 180);
        ctx.rotate(-0.08 + Math.sin(time * 1.5) * 0.025);
        ctx.fillStyle = theme.hot;
        ctx.font = '900 112px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('BAM!', 0, 0);
        ctx.restore();
      }

      // A restrained film-gate edge gives every panel a cinematic frame.
      ctx.globalAlpha = 0.48;
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(5, 5, w - 10, h - 10);
      ctx.globalAlpha = 1;
      panel.texture.needsUpdate = true;
    };

    // An organic, continuous serpent. The head follows a designed flight path;
    // every body ring samples the same path at an earlier time, producing natural lag.
    const bodySegments = isSmall ? 104 : 148;
    const radialSegments = 12;
    const bodyPositions = new Float32Array((bodySegments + 1) * (radialSegments + 1) * 3);
    const bodyIndices: number[] = [];
    for (let i = 0; i < bodySegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const a = i * (radialSegments + 1) + j;
        const b = a + radialSegments + 1;
        bodyIndices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const bodyGeo = new THREE.BufferGeometry();
    bodyGeo.setAttribute('position', new THREE.BufferAttribute(bodyPositions, 3).setUsage(THREE.DynamicDrawUsage));
    bodyGeo.setIndex(bodyIndices);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x8f9a78,
      metalness: 0.68,
      roughness: 0.34,
      emissive: 0x151d10,
      emissiveIntensity: 0.16,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const serpent = new THREE.Mesh(bodyGeo, bodyMat);
    scene.add(serpent);

    const head = new THREE.Group();
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xaab394,
      metalness: 0.62,
      roughness: 0.3,
    });
    const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), headMat);
    skull.scale.set(0.43, 0.19, 0.235);
    head.add(skull);
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), headMat);
    muzzle.position.set(0.31, -0.035, 0);
    muzzle.scale.set(0.25, 0.125, 0.18);
    head.add(muzzle);
    const jaw = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 16),
      new THREE.MeshStandardMaterial({ color: 0x667453, metalness: 0.48, roughness: 0.4 })
    );
    jaw.position.set(0.19, -0.105, 0);
    jaw.scale.set(0.31, 0.055, 0.16);
    head.add(jaw);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x1d2517,
      metalness: 0.45,
      roughness: 0.2,
    });
    const eyeGlintMat = new THREE.MeshBasicMaterial({ color: 0xe4edc9 });
    [-1, 1].forEach((side) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), eyeMat);
      eye.position.set(0.015, 0.135, side * 0.155);
      head.add(eye);
      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), eyeGlintMat);
      glint.position.set(0.028, 0.153, side * 0.171);
      head.add(glint);
    });
    head.visible = false;
    scene.add(head);

    const startPoint = new THREE.Vector3(-7.4, 2.65, 2.0);
    const p0 = new THREE.Vector3(-7.4, 2.65, 2.0);
    const p1 = new THREE.Vector3(-4.0, 2.8, 2.4);
    const p2 = new THREE.Vector3(-0.2, -1.32, 0.18);
    const p3 = new THREE.Vector3(0, -1.32, 0.18);
    const headDirection = new THREE.Vector3();
    const vA = new THREE.Vector3();
    const vB = new THREE.Vector3();
    const vTangent = new THREE.Vector3();
    const vNormal = new THREE.Vector3();
    const vBinormal = new THREE.Vector3();
    const vUp = new THREE.Vector3(0, 1, 0);
    const axisX = new THREE.Vector3(1, 0, 0);
    const headPosition = (time: number, target: THREE.Vector3) => {
      const local = time - 12.25;
      if (local <= 0) return target.copy(startPoint);
      if (local < 2.35) {
        const u = THREE.MathUtils.smoothstep(local, 0, 2.35);
        const inv = 1 - u;
        return target.set(
          inv * inv * inv * p0.x + 3 * inv * inv * u * p1.x + 3 * inv * u * u * p2.x + u * u * u * p3.x,
          inv * inv * inv * p0.y + 3 * inv * inv * u * p1.y + 3 * inv * u * u * p2.y + u * u * u * p3.y,
          inv * inv * inv * p0.z + 3 * inv * inv * u * p1.z + 3 * inv * u * u * p2.z + u * u * u * p3.z
        );
      }
      if (local < 5.9) {
        const u = THREE.MathUtils.clamp((local - 2.35) / 3.55, 0, 1);
        const eased = u * u * (3 - 2 * u);
        const angle = -Math.PI * 0.5 + eased * Math.PI * 2.2;
        const radius = 1.62 - 0.55 * eased;
        return target.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.82,
          0.32 + Math.sin(angle * 1.5) * 0.2
        );
      }
      if (local < 6.55) {
        const u = THREE.MathUtils.smoothstep(local, 5.9, 6.55);
        const eased = u * u * (3 - 2 * u);
        return target.set(
          THREE.MathUtils.lerp(0.63, 0, eased),
          THREE.MathUtils.lerp(-0.71, 0, eased),
          THREE.MathUtils.lerp(0.52, 0.05, eased)
        );
      }
      // After the star is consumed, the serpent closes into a living ouroboros.
      // A full 3.1-second body delay lets the head meet the tail without a hard cut.
      const loopTime = local - 6.55;
      const radiusIn = THREE.MathUtils.smoothstep(loopTime, 0, 0.65);
      const angle = -Math.PI * 0.5 + loopTime * 2.03 + Math.max(0, loopTime - 3.0) * 0.22;
      const radius = 2.28 * radiusIn + Math.sin(loopTime * 0.65) * 0.045 * radiusIn;
      return target.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.86,
        Math.sin(angle * 2.0) * 0.22
      );
    };

    const resize = () => {
      const width = Math.max(1, root.clientWidth);
      const height = Math.max(1, root.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const aspect = width / height;
      const horizontalFit = THREE.MathUtils.clamp(aspect / 1.28, 0.43, 1);
      panels.forEach((panel, i) => {
        const [x, y, z] = panelLayout[i];
        panel.group.position.set(x * horizontalFit, y * (isSmall ? 0.88 : 1), z);
        panel.group.scale.setScalar(0.001);
      });
    };
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    resize();

    const clock = new THREE.Clock();
    let raf = 0;
    let lastPanelDraw = -1;

    const render = () => {
      raf = requestAnimationFrame(render);
      const time = clock.getElapsedTime();

      starField.rotation.y = time * 0.003;
      starField.rotation.x = Math.sin(time * 0.08) * 0.006;

      // A quiet ignition grows out of the void before the single bright detonation.
      const ignition = THREE.MathUtils.smoothstep(time, 1.35, 4.0);
      const afterglow = 1 - THREE.MathUtils.smoothstep(time, 18.15, 19.0);
      const starPulse = 1 + Math.sin(time * 2.8) * 0.035;
      starGroup.scale.setScalar(Math.max(0.001, ignition * starPulse * afterglow));
      starHalo.material.opacity = 0.07 + ignition * 0.11;
      starOuter.material.opacity = 0.02 + ignition * 0.045;
      starGlow.material.opacity = ignition * 0.8 * afterglow;
      starLight.intensity = ignition * 2.4 * afterglow;
      const flash = Math.max(0, 1 - Math.abs(time - 5.05) / 0.34);
      starCore.scale.setScalar(1 + flash * 5.5);
      starGlow.scale.setScalar(8.5 + ignition * 2.0 + flash * 13);

      const bang = THREE.MathUtils.smoothstep(time, 4.95, 5.18);
      shockRings.forEach((ring, i) => {
        const p = THREE.MathUtils.clamp((time - 5.0 - i * 0.13) / 1.25, 0, 1);
        ring.scale.setScalar(0.06 + p * 10.5);
        (ring.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.62 * bang;
      });
      const burstAge = Math.max(0, time - 5.02);
      for (let i = 0; i < burstCount; i++) {
        const k = i * 3;
        const age = Math.min(2.1, burstAge);
        burstPositions[k] = burstVelocity[k] * age;
        burstPositions[k + 1] = burstVelocity[k + 1] * age - age * age * 0.32;
        burstPositions[k + 2] = burstVelocity[k + 2] * age;
      }
      burstGeo.attributes.position.needsUpdate = true;
      burstMat.opacity = bang * (1 - THREE.MathUtils.smoothstep(time, 6.55, 7.6)) * 0.74;

      // Panels emerge from the detonation, resolve into a composed wall of frames,
      // then drift past camera as one continuous montage.
      const panelIn = THREE.MathUtils.smoothstep(time, 5.45, 7.05);
      const panelOut = 1 - THREE.MathUtils.smoothstep(time, 11.9, 13.2);
      const panelVisible = panelIn * panelOut;
      const redraw = lastPanelDraw < 0 || time - lastPanelDraw >= 1 / 24;
      if (redraw) lastPanelDraw = time;
      panels.forEach((panel, i) => {
        if (redraw) drawPanel(panel, time + i * 0.24);
        const [targetX, targetY, targetZ] = panelLayout[i];
        const stagger = i * 0.075;
        const appear = THREE.MathUtils.smoothstep(time, 5.5 + stagger, 7.0 + stagger);
        const vanish = THREE.MathUtils.smoothstep(time, 11.85 + stagger * 0.4, 13.25 + stagger * 0.4);
        const visibility = appear * (1 - vanish);
        const aspect = root.clientWidth / Math.max(1, root.clientHeight);
        const horizontalFit = THREE.MathUtils.clamp(aspect / 1.28, 0.43, 1);
        const targetXFit = targetX * horizontalFit;
        const fly = 1 - THREE.MathUtils.smoothstep(time, 9.6, 13.0);
        const drift = Math.sin(time * 0.38 + i * 1.7) * 0.08;
        panel.group.position.set(
          THREE.MathUtils.lerp(0, targetXFit, appear) * (1 + (1 - fly) * 0.08),
          THREE.MathUtils.lerp(0, targetY, appear) + drift,
          THREE.MathUtils.lerp(1.35, targetZ, appear) + Math.sin(time * 0.22 + i) * 0.12
        );
        panel.group.rotation.set(
          (i % 2 ? -1 : 1) * (0.025 + fromCenter * 0.06),
          (i % 2 ? -1 : 1) * (0.06 + fromCenter * 0.12),
          (i % 2 ? -1 : 1) * (0.025 + fromCenter * 0.08)
        );
        const size = (isSmall ? 0.72 : 0.92) * visibility;
        panel.group.scale.setScalar(Math.max(0.001, size));
        panel.material.opacity = visibility;
        panel.frameMaterial.opacity = visibility * 0.62;
      });

      // The serpent enters with intent, flies to the star, circles it, consumes it,
      // then keeps moving as its body catches up and forms a seamless living loop.
      const snakeIn = THREE.MathUtils.smoothstep(time, 11.95, 13.1);
      const snakeOut = 1 - THREE.MathUtils.smoothstep(time, 22.05, 22.55);
      const snakeOpacity = snakeIn * snakeOut;
      serpent.visible = snakeOpacity > 0.001;
      head.visible = serpent.visible;
      if (serpent.visible) {
        const current = headPosition(time, vA);
        const before = headPosition(time - 0.025, vB);
        const after = headPosition(time + 0.025, vTangent);
        headDirection.subVectors(after, before).normalize();
        if (headDirection.lengthSq() < 0.0001) headDirection.set(1, 0, 0);

        const position = bodyGeo.attributes.position as THREE.BufferAttribute;
        const bodyDelay = 3.1;
        for (let i = 0; i <= bodySegments; i++) {
          const u = i / bodySegments;
          const sampleTime = time - u * bodyDelay;
          const center = headPosition(sampleTime, vA);
          const prev = headPosition(sampleTime - 0.018, vB);
          const next = headPosition(sampleTime + 0.018, vTangent);
          const tangent = next.sub(prev).normalize();
          if (tangent.lengthSq() < 0.0001) tangent.set(1, 0, 0);
          vNormal.crossVectors(tangent, vUp).normalize();
          if (vNormal.lengthSq() < 0.0001) vNormal.set(0, 0, 1);
          vBinormal.crossVectors(tangent, vNormal).normalize();
          const radius = 0.155 * Math.pow(1 - u, 0.82) + 0.012;
          for (let j = 0; j <= radialSegments; j++) {
            const angle = (j / radialSegments) * Math.PI * 2;
            const cos = Math.cos(angle) * radius;
            const sin = Math.sin(angle) * radius;
            const x = center.x + vNormal.x * cos + vBinormal.x * sin;
            const y = center.y + vNormal.y * cos + vBinormal.y * sin;
            const z = center.z + vNormal.z * cos + vBinormal.z * sin;
            position.setXYZ(i * (radialSegments + 1) + j, x, y, z);
          }
        }
        position.needsUpdate = true;
        bodyGeo.computeVertexNormals();
        bodyMat.opacity = snakeOpacity * 0.96;

        head.position.copy(current);
        head.quaternion.setFromUnitVectors(axisX, headDirection);
        const headScale = snakeIn * snakeOut;
        head.scale.setScalar(headScale);
        // The coil gains a subtle rotational momentum after the star disappears.
        const coilSpin = Math.max(0, time - 19.0) * 0.16;
        serpent.rotation.set(0, 0, coilSpin);
        head.rotation.z = 0;
      }

      const consume = THREE.MathUtils.smoothstep(time, 18.0, 18.9);
      if (time < 19.0) {
        const keep = 1 - consume;
        starGroup.scale.multiplyScalar(keep);
        starGlow.material.opacity = ignition * 0.8 * afterglow * keep;
        starLight.intensity = ignition * 2.4 * afterglow * keep;
      }

      // Camera movement is nearly imperceptible: depth comes from the artwork,
      // not a restless camera or constant zoom.
      const cameraMove = THREE.MathUtils.smoothstep(time, 4.7, 8.5);
      camera.position.x = Math.sin(time * 0.12) * 0.08;
      camera.position.y = Math.cos(time * 0.1) * 0.055;
      camera.position.z = 18 - cameraMove * 0.28;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      if (time > 23.2) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      starFieldGeo.dispose();
      starFieldMat.dispose();
      burstGeo.dispose();
      burstMat.dispose();
      bodyGeo.dispose();
      bodyMat.dispose();
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
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material.dispose();
        }
      });
      renderer.dispose();
      if (root.contains(renderer.domElement)) root.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="cinematic-sequence" ref={host} aria-hidden="true" />;
}
