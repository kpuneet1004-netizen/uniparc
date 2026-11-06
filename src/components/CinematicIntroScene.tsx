import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * UNIPARC — cinematic origin sequence.
 * One continuous event: stellar ignition, radial detonation, kinetic culture
 * typography, then a restrained metallic Ouroboros orbit.
 */
export default function CinematicIntroScene() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = host.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 19);

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
      console.warn('UNIPARC intro: WebGL unavailable; HTML wordmark fallback will continue.', error);
      return;
    }

    const small = window.matchMedia('(max-width: 700px)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.15 : 1.45));
    renderer.setSize(root.clientWidth, root.clientHeight, false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    root.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0x8792a0, 0.22);
    scene.add(ambient);
    const keyLight = new THREE.PointLight(0xe5edcf, 0, 34, 1.7);
    keyLight.position.set(0, 0, 1);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x9ba9bc, 2.2, 22, 2);
    rimLight.position.set(-5, 3, 5);
    scene.add(rimLight);

    // Deep, sparse starfield. Points are static; only a subtle camera drift is used.
    const starCount = small ? 460 : 920;
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 52;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 31;
      starPositions[i * 3 + 2] = -30 + Math.random() * 25;
      starSizes[i] = 0.3 + Math.random() * 0.7;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xc8d0d8, size: 0.025, transparent: true, opacity: 0.34,
      sizeAttenuation: true, depthWrite: false,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // Stellar core and layered, physically restrained bloom.
    const star = new THREE.Group();
    scene.add(star);
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.105, 40, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    star.add(core);
    const corona = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 40, 32),
      new THREE.MeshBasicMaterial({
        color: 0xdce9bd, transparent: true, opacity: 0.11,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    star.add(corona);
    const outerCorona = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 40, 32),
      new THREE.MeshBasicMaterial({
        color: 0xb6d18a, transparent: true, opacity: 0.035,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    star.add(outerCorona);

    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 256;
    const glowCtx = glowCanvas.getContext('2d')!;
    const glowGradient = glowCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
    glowGradient.addColorStop(0, 'rgba(255,255,246,0.96)');
    glowGradient.addColorStop(0.045, 'rgba(240,249,218,0.68)');
    glowGradient.addColorStop(0.18, 'rgba(205,226,160,0.22)');
    glowGradient.addColorStop(0.52, 'rgba(150,181,113,0.055)');
    glowGradient.addColorStop(1, 'rgba(120,150,90,0)');
    glowCtx.fillStyle = glowGradient;
    glowCtx.fillRect(0, 0, 256, 256);
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture, color: 0xf0f5df, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glow.scale.set(9.5, 9.5, 1);
    star.add(glow);

    // A single shock front, not a stack of decorative rings.
    const shock = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.012, 8, 220),
      new THREE.MeshBasicMaterial({
        color: 0xe8efdc, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    shock.rotation.set(0.22, -0.18, 0);
    scene.add(shock);

    // Directional energy filaments use a preallocated point buffer.
    const burstCount = small ? 420 : 780;
    const burstGeo = new THREE.BufferGeometry();
    const burstPositions = new Float32Array(burstCount * 3);
    const burstVelocity = new Float32Array(burstCount * 3);
    for (let i = 0; i < burstCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 0.6;
      const r = Math.sqrt(1 - z * z);
      const speed = 2.4 + Math.random() * 7.4;
      burstVelocity.set([Math.cos(theta) * r * speed, Math.sin(theta) * r * speed, z * speed], i * 3);
    }
    burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3).setUsage(THREE.DynamicDrawUsage));
    const burstMat = new THREE.PointsMaterial({
      color: 0xdde8c7, size: small ? 0.027 : 0.034, transparent: true,
      opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    scene.add(new THREE.Points(burstGeo, burstMat));

    // Culture is expressed as kinetic editorial typography and abstract marks,
    // not framed cards, illustrations or comic sound effects.
    type Fragment = { group: THREE.Group; material: THREE.MeshBasicMaterial; texture: THREE.CanvasTexture; index: number };
    const labels = ['ANIME', 'CINEMA', 'MEME CULTURE', 'GAMES', 'TECH'];
    const accents = ['#d6b7a6', '#d9c9a5', '#c5b6df', '#c8dc83', '#a8c2d1'];
    const fragments: Fragment[] = [];
    const positions = [
      [-5.0, 2.0, -1.4], [-2.45, -1.9, -0.4], [0.3, 2.45, -1.8],
      [3.0, -1.65, -0.9], [5.0, 1.15, -2.0],
    ];
    labels.forEach((label, index) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '500 112px Arial, Helvetica, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = accents[index];
      ctx.globalAlpha = 0.96;
      ctx.fillText(label, 38, 122);
      ctx.globalAlpha = 0.48;
      ctx.fillRect(38, 207, Math.min(420, label.length * 36), 2);
      ctx.globalAlpha = 0.72;
      ctx.font = '24px monospace';
      ctx.fillText('UNIPARC  /  CULTURE SIGNAL  00' + (index + 1), 40, 238);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      const material = new THREE.MeshBasicMaterial({
        map: texture, transparent: true, opacity: 0,
        depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
      });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(4.3, 1.075), material);
      const group = new THREE.Group();
      group.add(plane);
      group.scale.setScalar(0.001);
      scene.add(group);
      fragments.push({ group, material, texture, index });
    });

    // Ouroboros body: a continuous tube evaluated on the GPU. The head's
    // trajectory drives every downstream body section with temporal lag.
    const longitudinal = small ? 128 : 176;
    const radial = 20;
    const vertices: number[] = [];
    const along: number[] = [];
    const around: number[] = [];
    const indices: number[] = [];
    for (let i = 0; i <= longitudinal; i++) {
      for (let j = 0; j <= radial; j++) {
        vertices.push(0, 0, 0);
        along.push(i / longitudinal);
        around.push((j / radial) * Math.PI * 2);
        if (i < longitudinal && j < radial) {
          const a = i * (radial + 1) + j;
          const b = a + radial + 1;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
    }
    const serpentGeo = new THREE.BufferGeometry();
    serpentGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    serpentGeo.setAttribute('aAlong', new THREE.Float32BufferAttribute(along, 1));
    serpentGeo.setAttribute('aAround', new THREE.Float32BufferAttribute(around, 1));
    serpentGeo.setIndex(indices);

    const serpentMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: true,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uAspect: { value: 1 },
      },
      vertexShader: `
        attribute float aAlong;
        attribute float aAround;
        uniform float uTime;
        uniform float uAspect;
        varying vec3 vNormal;
        varying vec3 vView;
        varying float vAlong;
        vec3 pathAt(float t) {
          float local = t - 12.35;
          if (local < 0.0) return vec3(mix(-8.2, -6.6, clamp(t / 12.35, 0.0, 1.0)), 2.9, 1.2);
          if (local < 2.7) {
            float q = clamp(local / 2.7, 0.0, 1.0);
            float e = q * q * (3.0 - 2.0 * q);
            float angle = mix(3.05, 4.72, e);
            float radius = mix(5.1, 2.35, e);
            return vec3(cos(angle) * radius * min(1.0, uAspect / 1.25), sin(angle) * radius * 0.82, 0.35 + sin(angle * 1.4) * 0.18);
          }
          float q = local - 2.7;
          float angle = -1.56 + q * 1.34;
          float radius = 2.35 + sin(q * 0.52) * 0.06;
          return vec3(cos(angle) * radius * min(1.0, uAspect / 1.25), sin(angle) * radius * 0.82, sin(angle * 1.7) * 0.18);
        }
        void main() {
          float t = uTime - aAlong * 3.6;
          vec3 p = pathAt(t);
          vec3 before = pathAt(t - 0.012);
          vec3 after = pathAt(t + 0.012);
          vec3 tangent = normalize(after - before);
          vec3 reference = abs(tangent.y) > 0.92 ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0);
          vec3 side = normalize(cross(tangent, reference));
          vec3 up = normalize(cross(side, tangent));
          float taper = pow(max(0.0, 1.0 - aAlong), 0.76);
          float headBulge = 0.15 + 0.035 * exp(-aAlong * 90.0);
          float radius = 0.025 + 0.19 * taper + headBulge * exp(-aAlong * 28.0);
          float wave = sin(aAlong * 24.0 - uTime * 1.5) * 0.018 * (1.0 - aAlong);
          vec3 radialNormal = normalize(side * cos(aAround) + up * sin(aAround));
          vec3 pos = p + radialNormal * (radius + wave);
          vNormal = radialNormal;
          vView = normalize(-pos);
          vAlong = aAlong;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }`,
      fragmentShader: `
        uniform float uOpacity;
        varying vec3 vNormal;
        varying vec3 vView;
        varying float vAlong;
        void main() {
          vec3 n = normalize(vNormal);
          vec3 lightA = normalize(vec3(-0.45, 0.7, 0.8));
          vec3 lightB = normalize(vec3(0.75, -0.2, 0.55));
          float diffuse = max(dot(n, lightA), 0.0) * 0.72 + max(dot(n, lightB), 0.0) * 0.28;
          float fresnel = pow(1.0 - max(dot(n, normalize(vView)), 0.0), 2.4);
          float spec = pow(max(dot(reflect(-lightA, n), normalize(vView)), 0.0), 44.0);
          vec3 base = vec3(0.24, 0.27, 0.22);
          vec3 metal = mix(base * 0.45, vec3(0.76, 0.81, 0.69), diffuse * 0.76 + spec * 0.85);
          metal += vec3(0.34, 0.4, 0.27) * fresnel * 0.52;
          float tailFade = smoothstep(1.0, 0.86, vAlong);
          gl_FragColor = vec4(metal, uOpacity * tailFade);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    const serpent = new THREE.Mesh(serpentGeo, serpentMat);
    serpent.frustumCulled = false;
    scene.add(serpent);

    // Head is a restrained, sculptural extension of the same metal body:
    // no cartoon eyes, mouth, separate jaw or toy-like facial pieces.
    const headGroup = new THREE.Group();
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0x9ba58a, metalness: 0.82, roughness: 0.23,
      emissive: 0x151a11, emissiveIntensity: 0.12,
    });
    const headForm = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), headMaterial);
    headForm.scale.set(0.34, 0.14, 0.19);
    headGroup.add(headForm);
    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.115, 0.35, 32), headMaterial);
    snout.rotation.z = -Math.PI / 2;
    snout.position.x = 0.28;
    snout.scale.set(0.72, 1.2, 0.72);
    headGroup.add(snout);
    headGroup.visible = false;
    scene.add(headGroup);

    const resize = () => {
      const width = Math.max(1, root.clientWidth);
      const height = Math.max(1, root.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      serpentMat.uniforms.uAspect.value = width / height;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    resize();

    const clock = new THREE.Clock();
    let raf = 0;
    const tempA = new THREE.Vector3();
    const tempB = new THREE.Vector3();
    const tempC = new THREE.Vector3();
    const axis = new THREE.Vector3(1, 0, 0);

    const pathPoint = (t: number, target: THREE.Vector3) => {
      const local = t - 12.35;
      if (local < 0) return target.set(-8.2 + Math.max(0, t / 12.35) * 1.6, 2.9, 1.2);
      if (local < 2.7) {
        const q = THREE.MathUtils.clamp(local / 2.7, 0, 1);
        const e = q * q * (3 - 2 * q);
        const angle = THREE.MathUtils.lerp(3.05, 4.72, e);
        const radius = THREE.MathUtils.lerp(5.1, 2.35, e);
        return target.set(Math.cos(angle) * radius * Math.min(1, (root.clientWidth / Math.max(1, root.clientHeight)) / 1.25), Math.sin(angle) * radius * 0.82, 0.35 + Math.sin(angle * 1.4) * 0.18);
      }
      const q = local - 2.7;
      const angle = -1.56 + q * 1.34;
      const radius = 2.35 + Math.sin(q * 0.52) * 0.06;
      return target.set(Math.cos(angle) * radius * Math.min(1, (root.clientWidth / Math.max(1, root.clientHeight)) / 1.25), Math.sin(angle) * radius * 0.82, Math.sin(angle * 1.7) * 0.18);
    };

    const render = () => {
      raf = requestAnimationFrame(render);
      const time = clock.getElapsedTime();

      // The ignition is a slow build, with one deliberate peak and no strobing.
      const ignition = THREE.MathUtils.smoothstep(time, 1.2, 4.25);
      const afterglow = 1 - THREE.MathUtils.smoothstep(time, 19.2, 20.4);
      const pulse = 1 + Math.sin(time * 1.65) * 0.018;
      star.scale.setScalar(Math.max(0.001, ignition * pulse * afterglow));
      corona.material.opacity = 0.08 + ignition * 0.1;
      outerCorona.material.opacity = 0.025 + ignition * 0.035;
      glow.material.opacity = ignition * 0.74 * afterglow;
      glow.scale.setScalar(8.5 + ignition * 2.5);
      keyLight.intensity = ignition * 2.7 * afterglow;

      const flash = Math.max(0, 1 - Math.abs(time - 5.0) / 0.42);
      core.scale.setScalar(1 + flash * 7.0);
      glow.scale.multiplyScalar(1 + flash * 1.35);

      const bang = THREE.MathUtils.smoothstep(time, 4.94, 5.14);
      const shockProgress = THREE.MathUtils.clamp((time - 5.0) / 2.2, 0, 1);
      shock.scale.setScalar(0.001 + shockProgress * 12.5);
      (shock.material as THREE.MeshBasicMaterial).opacity = bang * (1 - shockProgress) * 0.54;

      const burstAge = Math.max(0, Math.min(2.5, time - 5.0));
      const burstPosition = burstGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < burstCount; i++) {
        const k = i * 3;
        const drag = 1 - Math.exp(-burstAge * 0.48);
        burstPosition.array[k] = burstVelocity[k] * drag * 1.18;
        burstPosition.array[k + 1] = burstVelocity[k + 1] * drag * 1.18;
        burstPosition.array[k + 2] = burstVelocity[k + 2] * drag * 1.18;
      }
      burstPosition.needsUpdate = true;
      burstMat.opacity = bang * (1 - THREE.MathUtils.smoothstep(time, 6.9, 8.1)) * 0.58;

      // Typography fragments travel through depth and clear before the serpent arrives.
      fragments.forEach((fragment, i) => {
        const delay = i * 0.16;
        const enter = THREE.MathUtils.smoothstep(time, 5.35 + delay, 7.2 + delay);
        const leave = THREE.MathUtils.smoothstep(time, 10.9 + delay * 0.4, 12.7 + delay * 0.4);
        const opacity = enter * (1 - leave);
        const [x, y, z] = positions[i];
        fragment.group.position.set(
          THREE.MathUtils.lerp(0, x, enter) + Math.sin(time * 0.22 + i) * 0.06,
          THREE.MathUtils.lerp(0, y, enter) + Math.cos(time * 0.24 + i) * 0.045,
          THREE.MathUtils.lerp(1.4, z, enter) + Math.sin(time * 0.18 + i) * 0.08
        );
        fragment.group.rotation.set((i % 2 ? -1 : 1) * 0.035, (i % 2 ? 1 : -1) * 0.12, (i - 2) * 0.018);
        fragment.group.scale.setScalar(Math.max(0.001, (small ? 0.68 : 0.86) * opacity));
        fragment.material.opacity = opacity * 0.94;
      });

      // Head follows the same smooth orbital spline as the GPU body.
      const snakeIn = THREE.MathUtils.smoothstep(time, 12.15, 13.2);
      const snakeOut = 1 - THREE.MathUtils.smoothstep(time, 21.8, 22.55);
      const snakeOpacity = snakeIn * snakeOut;
      serpentMat.uniforms.uTime.value = time;
      serpentMat.uniforms.uOpacity.value = snakeOpacity;
      headGroup.visible = snakeOpacity > 0.01;
      if (headGroup.visible) {
        pathPoint(time, tempA);
        pathPoint(time - 0.025, tempB);
        pathPoint(time + 0.025, tempC);
        const direction = tempC.sub(tempB).normalize();
        headGroup.position.copy(tempA);
        headGroup.quaternion.setFromUnitVectors(axis, direction);
        headGroup.scale.setScalar(snakeIn * snakeOut);
      }

      const consume = THREE.MathUtils.smoothstep(time, 18.8, 19.8);
      const remaining = 1 - consume;
      if (time > 18.8) {
        star.scale.multiplyScalar(remaining);
        glow.material.opacity = ignition * 0.74 * afterglow * remaining;
        keyLight.intensity = ignition * 2.7 * afterglow * remaining;
      }

      camera.position.x = Math.sin(time * 0.09) * 0.045;
      camera.position.y = Math.cos(time * 0.08) * 0.035;
      camera.position.z = 19 - THREE.MathUtils.smoothstep(time, 4.8, 8.4) * 0.18;
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
      glowTexture.dispose();
      starGeo.dispose();
      starMat.dispose();
      burstGeo.dispose();
      burstMat.dispose();
      serpentGeo.dispose();
      serpentMat.dispose();
      fragments.forEach((fragment) => {
        fragment.texture.dispose();
        fragment.material.dispose();
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
