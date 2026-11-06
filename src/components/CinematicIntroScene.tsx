import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const panelFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uSeed;
  uniform float uStyle;
  uniform float uOpacity;
  uniform vec3 uAccent;
  uniform sampler2D uVideo;
  uniform float uHasVideo;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float line(float v, float width) { return 1.0 - smoothstep(width, width + 0.012, abs(v)); }
  void main() {
    vec2 uv = vUv;
    vec2 p = uv - 0.5;
    float t = uTime;
    vec3 base = mix(vec3(0.012, 0.016, 0.021), vec3(0.075, 0.085, 0.092), uv.y);
    float vignette = 1.0 - smoothstep(0.12, 0.82, length(p * vec2(0.9, 1.25)));
    float sweep = 0.0;
    if (uStyle < 0.5) {
      float a = atan(p.y, p.x);
      float r = length(p);
      sweep = line(sin(a * 17.0 + r * 18.0 - t * 2.8 + uSeed), 0.025) * (1.0 - smoothstep(0.08, 0.58, r));
      sweep += line(p.y - sin(p.x * 7.0 - t * 1.6) * 0.09, 0.018) * 0.8;
    } else if (uStyle < 1.5) {
      float r = length(p * vec2(0.9, 1.3));
      sweep = line(fract(r * 13.0 - t * 0.32 + uSeed) - 0.5, 0.035);
      sweep *= 0.45 + 0.55 * sin(t * 1.4 + uSeed);
      sweep += exp(-abs(p.x - sin(t * 0.4 + uSeed) * 0.25) * 16.0) * 0.35;
    } else if (uStyle < 2.5) {
      float bars = step(0.0, sin(uv.x * 110.0 + sin(uv.y * 13.0 + t) * 2.0));
      sweep = bars * (1.0 - smoothstep(0.0, 0.44, abs(uv.y - 0.5))) * 0.34;
      sweep += line(p.y - 0.22 * sin(p.x * 9.0 + t * 2.0), 0.014);
    } else if (uStyle < 3.5) {
      vec2 grid = abs(fract(uv * vec2(13.0, 7.0) - t * 0.06) - 0.5);
      sweep = (1.0 - smoothstep(0.47, 0.5, max(grid.x, grid.y))) * 0.28;
      sweep += exp(-length(p - vec2(sin(t * 0.8) * 0.22, cos(t * 0.6) * 0.18)) * 13.0) * 0.8;
    } else if (uStyle < 4.5) {
      float wave = sin(uv.x * 39.0 - t * 2.2 + sin(uv.x * 8.0) * 2.0);
      sweep = line(uv.y - 0.5 - wave * 0.12, 0.018) * 0.9;
      sweep += line(uv.y - 0.5 - sin(uv.x * 15.0 - t) * 0.2, 0.008) * 0.55;
    } else {
      float rays = line(sin(atan(p.y, p.x) * 23.0 + t * 0.7), 0.025);
      sweep = rays * (1.0 - smoothstep(0.05, 0.6, length(p))) * 0.5;
      sweep += exp(-abs(length(p) - (0.2 + 0.12 * sin(t * 0.7))) * 28.0) * 0.55;
    }
    float grain = hash(floor(uv * vec2(480.0, 270.0)) + floor(t * 12.0)) * 0.035;
    vec3 motionDesign = base + uAccent * sweep * 0.82 + vec3(grain);
    motionDesign += uAccent * exp(-abs(uv.x - fract(t * 0.055 + uSeed)) * 38.0) * 0.12;
    motionDesign *= vignette;
    vec3 footage = texture2D(uVideo, uv).rgb;
    vec3 color = mix(motionDesign, footage, uHasVideo);
    gl_FragColor = vec4(color, uOpacity);
  }
`;

type FilmPanel = {
  group: THREE.Group;
  material: THREE.ShaderMaterial;
  border: THREE.LineSegments;
  video: HTMLVideoElement;
  videoTexture: THREE.VideoTexture;
  index: number;
};

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
    renderer.toneMappingExposure = 1.05;
    root.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x9ca8b0, 0.28));
    const keyLight = new THREE.PointLight(0xe9f0e6, 0, 34);
    keyLight.position.set(0, 0, 4);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xb6d98a, 0, 24);
    rimLight.position.set(-5, 3, -1);
    scene.add(rimLight);

    // Quiet, deep star field. One draw call keeps the opening light on mobile GPUs.
    const starCount = small ? 360 : 760;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 48;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 28;
      starPositions[i * 3 + 2] = -26 + Math.random() * 32;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xdde4e8,
      size: 0.026,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // A single white star with a soft optical bloom, not a glowing cartoon orb.
    const star = new THREE.Group();
    scene.add(star);
    const starCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    star.add(starCore);
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 128;
    const glowContext = glowCanvas.getContext('2d')!;
    const glow = glowContext.createRadialGradient(64, 64, 0, 64, 64, 64);
    glow.addColorStop(0, 'rgba(255,255,255,0.95)');
    glow.addColorStop(0.08, 'rgba(245,250,239,0.42)');
    glow.addColorStop(0.28, 'rgba(210,231,190,0.12)');
    glow.addColorStop(1, 'rgba(190,220,170,0)');
    glowContext.fillStyle = glow;
    glowContext.fillRect(0, 0, 128, 128);
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const starHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    starHalo.scale.set(7.5, 7.5, 1);
    star.add(starHalo);

    // Controlled shockwave and fine energy filaments.
    const shockwaves: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const wave = new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.012, 5, 112),
        new THREE.MeshBasicMaterial({
          color: i === 1 ? 0xffffff : 0xdce8cf,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      wave.rotation.set(i * 0.46, i * 0.31, i * 0.58);
      scene.add(wave);
      shockwaves.push(wave);
    }

    const filamentCount = small ? 260 : 520;
    const filamentGeometry = new THREE.BufferGeometry();
    const filamentPositions = new Float32Array(filamentCount * 3);
    const filamentVelocity = new Float32Array(filamentCount * 3);
    for (let i = 0; i < filamentCount; i++) {
      const direction = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        (Math.random() * 2 - 1) * 0.42
      ).normalize();
      const speed = 2.8 + Math.random() * 6.2;
      filamentVelocity.set([direction.x * speed, direction.y * speed, direction.z * speed], i * 3);
    }
    filamentGeometry.setAttribute('position', new THREE.BufferAttribute(filamentPositions, 3));
    const filamentMaterial = new THREE.PointsMaterial({
      color: 0xe4ebdc,
      size: small ? 0.025 : 0.032,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const filaments = new THREE.Points(filamentGeometry, filamentMaterial);
    scene.add(filaments);

    // Six animated motion-design frames. Their content is shader-driven geometry/light,
    // never a stack of still images or illustrated cards.
    const panelPalettes = [
      new THREE.Color('#d8e7ef'),
      new THREE.Color('#c9d8c1'),
      new THREE.Color('#d6c7e8'),
      new THREE.Color('#d7e2c8'),
      new THREE.Color('#e7d4c4'),
      new THREE.Color('#c7d5df'),
    ];
    const panelTargets = [
      [-4.55, 2.0, -1.2],
      [-1.55, 2.7, -0.5],
      [2.0, 2.0, -1.3],
      [4.55, 0.0, -1.8],
      [-3.65, -2.05, -1.2],
      [0.0, -2.55, -0.4],
    ];
    const panels: FilmPanel[] = [];
    // Drop licensed, muted MP4 clips into public/media/pop-culture using these names.
    // Missing files gracefully retain the shader-driven motion-design placeholder.
    const footageSources = [
      '/media/pop-culture/anime-action.mp4',
      '/media/pop-culture/movie-moment.mp4',
      '/media/pop-culture/music-video.mp4',
      '/media/pop-culture/meme-reaction.mp4',
      '/media/pop-culture/anime-impact.mp4',
      '/media/pop-culture/cinema-trailer.mp4',
    ];
    const panelWidth = small ? 2.05 : 2.75;
    const panelHeight = panelWidth * 0.5625;
    panelTargets.forEach((_, index) => {
      const group = new THREE.Group();
      const video = document.createElement('video');
      video.src = footageSources[index];
      video.loop = true;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.crossOrigin = 'anonymous';
      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.colorSpace = THREE.SRGBColorSpace;
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: panelFragmentShader,
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uSeed: { value: index * 1.73 },
          uStyle: { value: index },
          uOpacity: { value: 0 },
          uAccent: { value: panelPalettes[index] },
          uVideo: { value: videoTexture },
          uHasVideo: { value: 0 },
        },
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      video.addEventListener('canplay', () => {
        material.uniforms.uHasVideo.value = 1;
        video.play().catch(() => { /* Muted playback may still be blocked by browser policy. */ });
      });
      video.addEventListener('error', () => {
        material.uniforms.uHasVideo.value = 0;
      });
      video.load();
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(panelWidth, panelHeight), material);
      group.add(screen);

      const borderGeometry = new THREE.EdgesGeometry(new THREE.PlaneGeometry(panelWidth + 0.045, panelHeight + 0.045));
      const borderMaterial = new THREE.LineBasicMaterial({
        color: 0xdce5df,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const border = new THREE.LineSegments(borderGeometry, borderMaterial);
      border.position.z = 0.012;
      group.add(border);
      group.position.set(0, 0, 1.2);
      group.scale.setScalar(0.001);
      scene.add(group);
      panels.push({ group, material, border, video, videoTexture, index });
    });

    // A continuous, tapered metallic body follows one smooth flight path.
    // No cartoon head, eyes, scales or segmented joints: the silhouette is the snake.
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
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xc2c9bd,
      metalness: 0.86,
      roughness: 0.23,
      emissive: 0x182018,
      emissiveIntensity: 0.12,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const serpent = new THREE.Mesh(bodyGeometry, bodyMaterial);
    scene.add(serpent);

    const start = new THREE.Vector3(-7.7, 2.65, 1.7);
    const c1 = new THREE.Vector3(-4.8, 3.15, 2.1);
    const c2 = new THREE.Vector3(-2.4, 2.0, 0.35);
    const arrival = new THREE.Vector3(0, 2.0, 0.15);
    const pointAt = (time: number, target: THREE.Vector3) => {
      const local = time - 9.65;
      if (local <= 0) return target.copy(start);
      if (local < 2.8) {
        const u = THREE.MathUtils.clamp(local / 2.8, 0, 1);
        const inv = 1 - u;
        return target.set(
          inv * inv * inv * start.x + 3 * inv * inv * u * c1.x + 3 * inv * u * u * c2.x + u * u * u * arrival.x,
          inv * inv * inv * start.y + 3 * inv * inv * u * c1.y + 3 * inv * u * u * c2.y + u * u * u * arrival.y,
          inv * inv * inv * start.z + 3 * inv * inv * u * c1.z + 3 * inv * u * u * c2.z + u * u * u * arrival.z
        );
      }
      const orbitTime = local - 2.8;
      const angle = Math.PI * 0.5 - orbitTime * (Math.PI * 2 / 4.8);
      const radius = orbitTime < 4.8
        ? THREE.MathUtils.lerp(2.0, 1.3, THREE.MathUtils.smoothstep(orbitTime, 0, 4.8))
        : orbitTime < 9.6
          ? THREE.MathUtils.lerp(1.3, 2.15, THREE.MathUtils.smoothstep(orbitTime, 4.8, 9.6))
          : 2.15 + Math.sin(orbitTime * 0.5) * 0.025;
      return target.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0.18 + Math.sin(angle * 2.0 + orbitTime * 0.22) * 0.2
      );
    };

    const tangent = new THREE.Vector3();
    const bodyCenter = new THREE.Vector3();
    const previous = new THREE.Vector3();
    const next = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const binormal = new THREE.Vector3();
    const up = new THREE.Vector3(0, 0, 1);
    const axisX = new THREE.Vector3(1, 0, 0);
    const resize = () => {
      const width = Math.max(1, root.clientWidth);
      const height = Math.max(1, root.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const aspect = width / height;
      const fitX = THREE.MathUtils.clamp(aspect / 1.3, 0.42, 1);
      panels.forEach((panel) => {
        const [x, y, z] = panelTargets[panel.index];
        panel.group.position.set(x * fitX, y * (small ? 0.86 : 1), z);
      });
    };
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    resize();

    const clock = new THREE.Clock();
    let raf = 0;
    let lastTime = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      const time = clock.getElapsedTime();
      const delta = Math.min(time - lastTime || 0.016, 0.04);
      lastTime = time;

      stars.rotation.y = time * 0.002;
      stars.rotation.x = Math.sin(time * 0.07) * 0.004;

      // 0–3.5s: a distant star quietly gathers light.
      const ignition = THREE.MathUtils.smoothstep(time, 0.85, 3.2);
      const fadeStar = 1 - THREE.MathUtils.smoothstep(time, 19.8, 21.0);
      star.scale.setScalar(Math.max(0.001, ignition * fadeStar * (1 + Math.sin(time * 2.1) * 0.025)));
      starHalo.material.opacity = ignition * 0.82 * fadeStar;
      keyLight.intensity = ignition * 2.2 * fadeStar;
      rimLight.intensity = ignition * 0.65 * fadeStar;

      // 3.45s: one white detonation, followed by a fast optical shockwave.
      const bang = THREE.MathUtils.smoothstep(time, 3.38, 3.58);
      const flash = Math.max(0, 1 - Math.abs(time - 3.52) / 0.27);
      starCore.scale.setScalar(1 + flash * 5.8);
      starHalo.scale.setScalar(7.5 + flash * 17);
      shockwaves.forEach((wave, index) => {
        const age = THREE.MathUtils.clamp((time - 3.48 - index * 0.12) / 1.45, 0, 1);
        wave.scale.setScalar(0.05 + age * 10.5);
        (wave.material as THREE.MeshBasicMaterial).opacity = bang * (1 - age) * 0.48;
      });
      const burstAge = Math.max(0, time - 3.48);
      for (let i = 0; i < filamentCount; i++) {
        const k = i * 3;
        const age = Math.min(1.9, burstAge);
        filamentPositions[k] = filamentVelocity[k] * age;
        filamentPositions[k + 1] = filamentVelocity[k + 1] * age;
        filamentPositions[k + 2] = filamentVelocity[k + 2] * age;
      }
      filamentGeometry.attributes.position.needsUpdate = true;
      filamentMaterial.opacity = bang * (1 - THREE.MathUtils.smoothstep(time, 5.35, 6.25)) * 0.58;

      // 4.1–9.4s: frames burst from the star, turn in depth, then sweep away.
      panels.forEach((panel, index) => {
        const stagger = index * 0.075;
        const appear = THREE.MathUtils.smoothstep(time, 4.05 + stagger, 5.35 + stagger);
        const clear = THREE.MathUtils.smoothstep(time, 8.0 + stagger * 0.2, 9.55 + stagger * 0.2);
        const visible = appear * (1 - clear);
        const [x, y, z] = panelTargets[index];
        const aspect = root.clientWidth / Math.max(1, root.clientHeight);
        const fitX = THREE.MathUtils.clamp(aspect / 1.3, 0.42, 1);
        const drift = Math.sin(time * 0.34 + index * 1.3) * 0.045;
        panel.group.position.set(
          THREE.MathUtils.lerp(0, x * fitX, appear),
          THREE.MathUtils.lerp(0, y, appear) + drift,
          THREE.MathUtils.lerp(1.5, z, appear) + Math.sin(time * 0.26 + index) * 0.08
        );
        panel.group.rotation.set(
          (index % 2 ? -1 : 1) * (0.035 + (1 - appear) * 0.15),
          (index % 2 ? 1 : -1) * (0.055 + (1 - appear) * 0.2),
          (index % 2 ? -1 : 1) * (0.018 + (1 - appear) * 0.11)
        );
        const scale = (small ? 0.72 : 0.9) * visible;
        panel.group.scale.setScalar(Math.max(0.001, scale));
        panel.material.uniforms.uTime.value = time;
        panel.material.uniforms.uOpacity.value = visible;
        if (panel.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          panel.material.uniforms.uHasVideo.value = 1;
        }
        (panel.border.material as THREE.LineBasicMaterial).opacity = visible * 0.72;
      });

      // 9.65s onward: the serpent accelerates in, circles the star and closes a
      // seamless orbit. The delayed body samples the same path, so its motion flows.
      const snakeIn = THREE.MathUtils.smoothstep(time, 9.35, 10.15);
      const snakeOut = 1 - THREE.MathUtils.smoothstep(time, 20.1, 21.25);
      const snakeOpacity = snakeIn * snakeOut;
      serpent.visible = snakeOpacity > 0.001;
      if (serpent.visible) {
        const position = bodyGeometry.attributes.position as THREE.BufferAttribute;
        const bodyDelay = 4.8;
        for (let i = 0; i <= bodySegments; i++) {
          const u = i / bodySegments;
          const sampleTime = time - u * bodyDelay;
          const center = pointAt(sampleTime, bodyCenter);
          pointAt(sampleTime - 0.012, previous);
          pointAt(sampleTime + 0.012, next);
          tangent.subVectors(next, previous).normalize();
          if (tangent.lengthSq() < 0.0001) tangent.set(1, 0, 0);
          normal.crossVectors(tangent, up).normalize();
          if (normal.lengthSq() < 0.0001) normal.set(0, 1, 0);
          binormal.crossVectors(tangent, normal).normalize();
          const taper = 0.012 + 0.112 * Math.sin(Math.PI * Math.pow(u, 0.72));
          const breathing = 1 + Math.sin(time * 1.15 - u * 5.5) * 0.018;
          const radius = taper * breathing;
          for (let j = 0; j <= radialSegments; j++) {
            const angle = (j / radialSegments) * Math.PI * 2;
            const cos = Math.cos(angle) * radius;
            const sin = Math.sin(angle) * radius;
            position.setXYZ(
              i * (radialSegments + 1) + j,
              center.x + normal.x * cos + binormal.x * sin,
              center.y + normal.y * cos + binormal.y * sin,
              center.z + normal.z * cos + binormal.z * sin
            );
          }
        }
        position.needsUpdate = true;
        bodyGeometry.computeVertexNormals();
        bodyMaterial.opacity = snakeOpacity * 0.98;
      }

      // The star is consumed into the orbit; the serpent and light resolve together.
      const consume = THREE.MathUtils.smoothstep(time, 18.7, 19.7);
      star.scale.multiplyScalar(1 - consume * delta * 2.2);
      starHalo.material.opacity = ignition * 0.82 * fadeStar * (1 - consume);
      keyLight.intensity = ignition * 2.2 * fadeStar * (1 - consume);

      // Keep the camera composed and steady; no perpetual zoom or noisy movement.
      camera.position.x = Math.sin(time * 0.09) * 0.035;
      camera.position.y = Math.cos(time * 0.08) * 0.025;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);

      if (time > 22.2) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      starGeometry.dispose();
      starMaterial.dispose();
      filamentGeometry.dispose();
      filamentMaterial.dispose();
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      glowTexture.dispose();
      panels.forEach((panel) => {
        panel.video.pause();
        panel.video.removeAttribute('src');
        panel.video.load();
        panel.videoTexture.dispose();
        panel.material.dispose();
        panel.border.geometry.dispose();
        (panel.border.material as THREE.Material).dispose();
        (panel.group.children[0] as THREE.Mesh).geometry.dispose();
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
