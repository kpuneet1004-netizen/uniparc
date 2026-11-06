import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Entirely procedural intro artwork: no stock frames, video stills or image textures.
 * A time-based sequence keeps the render deterministic and lets the parent intro
 * timeline own the overall page transition.
 */
export default function CinematicIntroScene() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = host.current;
    if (!root) return;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020303, 0.018);
    const camera = new THREE.PerspectiveCamera(42, 1, .1, 180);
    camera.position.set(0, 0, 18);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    root.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0x87927b, .65);
    scene.add(ambient);
    const key = new THREE.PointLight(0xe8f5c4, 0, 32);
    key.position.set(0, 0, 2);
    scene.add(key);
    const rim = new THREE.PointLight(0x9fbf70, 0, 24);
    rim.position.set(-5, 3, -2);
    scene.add(rim);

    // Deep-field stars.
    const starCount = window.innerWidth < 700 ? 900 : 1800;
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - .5) * 54;
      starPositions[i * 3 + 1] = (Math.random() - .5) * 34;
      starPositions[i * 3 + 2] = -24 + Math.random() * 34;
      starSizes[i] = .35 + Math.random() * 1.5;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));
    const starMat = new THREE.PointsMaterial({ color: 0xe8efd9, size: .045, transparent: true, opacity: .45, depthWrite: false, sizeAttenuation: true });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // A single star, built from emissive geometry and layered corona shells.
    const starGroup = new THREE.Group();
    scene.add(starGroup);
    const starCore = new THREE.Mesh(new THREE.IcosahedronGeometry(.42, 5), new THREE.MeshBasicMaterial({ color: 0xf5ffd9 }));
    starGroup.add(starCore);
    const corona = new THREE.Mesh(new THREE.SphereGeometry(.78, 48, 32), new THREE.MeshBasicMaterial({ color: 0xd9f36a, transparent: true, opacity: .12, blending: THREE.AdditiveBlending, depthWrite: false }));
    starGroup.add(corona);
    const coronaOuter = new THREE.Mesh(new THREE.SphereGeometry(1.5, 48, 32), new THREE.MeshBasicMaterial({ color: 0x9ebd55, transparent: true, opacity: .055, blending: THREE.AdditiveBlending, depthWrite: false }));
    starGroup.add(coronaOuter);
    const starLight = new THREE.PointLight(0xeaffb6, 0, 18);
    starGroup.add(starLight);

    // Shockwave rings and a true 3D particle burst.
    const shockRings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1, .012, 8, 160), new THREE.MeshBasicMaterial({ color: i === 1 ? 0xf4f4df : 0xd9f36a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
      ring.rotation.set(i * .55, i * .7, i * .3);
      scene.add(ring); shockRings.push(ring);
    }
    const burstCount = window.innerWidth < 700 ? 1100 : 2100;
    const burstGeo = new THREE.BufferGeometry();
    const burstPositions = new Float32Array(burstCount * 3);
    const burstVelocity = new Float32Array(burstCount * 3);
    const burstColor = new Float32Array(burstCount * 3);
    for (let i = 0; i < burstCount; i++) {
      const v = new THREE.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize();
      const speed = 2 + Math.random() * 10;
      burstVelocity.set([v.x * speed, v.y * speed, v.z * speed], i * 3);
      burstPositions.set([0, 0, 0], i * 3);
      const tint = .65 + Math.random() * .35;
      burstColor.set([tint, tint, tint * (.65 + Math.random() * .3)], i * 3);
    }
    burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));
    burstGeo.setAttribute('color', new THREE.BufferAttribute(burstColor, 3));
    const burstMat = new THREE.PointsMaterial({ size: .055, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
    const burst = new THREE.Points(burstGeo, burstMat);
    scene.add(burst);

    // Animated procedural culture panels. Each panel carries generated linework,
    // scan patterns, typographic marks and moving graphic motifs — never photos.
    const panels: { group: THREE.Group; texture: THREE.CanvasTexture; canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; material: THREE.MeshBasicMaterial; phase: number }[] = [];
    const themes = [
      { label: 'ANIME / MANGA', accent: '#e8f2ce', bg: '#182018', glyph: '影' },
      { label: 'CINEMA / FRAME', accent: '#e9e4d2', bg: '#17191a', glyph: '01' },
      { label: 'GAMES / ARCADE', accent: '#d9f36a', bg: '#111b19', glyph: '▶' },
      { label: 'INTERNET / MEMES', accent: '#e4d8ff', bg: '#1a1722', glyph: '404' },
      { label: 'MUSIC / SOUND', accent: '#f2c9aa', bg: '#211914', glyph: '∿' },
      { label: 'STREET / CULTURE', accent: '#d9f36a', bg: '#1b1d16', glyph: 'UP' },
      { label: 'FANDOM / WORLDS', accent: '#c5d6f2', bg: '#151a23', glyph: '∞' },
      { label: 'ANIMATION / MOTION', accent: '#f1e8d2', bg: '#211b20', glyph: '✳' },
    ];
    const panelLayout = [
      [-5.1, 2.1, -1.5], [-1.8, 3.0, -.2], [2.1, 2.1, -1.1], [5.0, .9, -2.1],
      [-4.5, -1.5, -1], [-1.4, -2.5, -.6], [2.0, -1.8, -1.5], [4.7, -2.4, -2.5],
    ];
    themes.forEach((theme, i) => {
      const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 400;
      const ctx = canvas.getContext('2d')!;
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true, opacity: 0, toneMapped: false });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(3.15, 1.97), material);
      const frame = new THREE.Mesh(new THREE.PlaneGeometry(3.27, 2.09), new THREE.MeshBasicMaterial({ color: 0xe9ebdf, transparent: true, opacity: .7, side: THREE.DoubleSide }));
      frame.position.z = -.025;
      const group = new THREE.Group(); group.add(frame, plane);
      const [x, y, z] = panelLayout[i]; group.position.set(x, y, z);
      group.rotation.set((i % 3 - 1) * .13, (i % 2 ? -.18 : .18), (i % 2 ? -.09 : .08));
      group.scale.setScalar(.001);
      scene.add(group);
      panels.push({ group, texture, canvas, ctx, material, phase: i * 1.7 });
    });

    // A custom, tapered, animated 3D serpent. Cross-sections follow a smooth
    // spline; travelling waves move through the spine with delayed body response.
    const bodySegments = 220, radialSegments = 16;
    const bodyPositions = new Float32Array((bodySegments + 1) * (radialSegments + 1) * 3);
    const bodyIndices: number[] = [];
    for (let i = 0; i < bodySegments; i++) for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j, b = a + radialSegments + 1;
      bodyIndices.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const bodyGeo = new THREE.BufferGeometry();
    bodyGeo.setAttribute('position', new THREE.BufferAttribute(bodyPositions, 3).setUsage(THREE.DynamicDrawUsage));
    bodyGeo.setIndex(bodyIndices);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x9aa987, metalness: .72, roughness: .28, emissive: 0x26351b, emissiveIntensity: .34, side: THREE.DoubleSide });
    const serpent = new THREE.Mesh(bodyGeo, bodyMat);
    serpent.visible = false; scene.add(serpent);
    const head = new THREE.Group();
    const skull = new THREE.Mesh(new THREE.SphereGeometry(.24, 32, 24), new THREE.MeshStandardMaterial({ color: 0xc2cbb0, metalness: .58, roughness: .3 }));
    skull.scale.set(1.35, .82, 1.05); head.add(skull);
    const snout = new THREE.Mesh(new THREE.SphereGeometry(.15, 24, 16), new THREE.MeshStandardMaterial({ color: 0x7e8c6c, metalness: .5, roughness: .34 }));
    snout.position.set(.27, -.035, .015); snout.scale.set(1.1, .65, .7); head.add(snout);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xd9f36a });
    [-1, 1].forEach(side => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(.035, 12, 10), eyeMat);
      eye.position.set(.03, .115, side * .18); head.add(eye);
    });
    head.visible = false; scene.add(head);

    const resize = () => {
      const w = Math.max(1, root.clientWidth), h = Math.max(1, root.clientHeight);
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize); observer.observe(root); resize();

    const clock = new THREE.Clock();
    const drawPanel = (p: typeof panels[number], t: number) => {
      const { ctx, canvas } = p; const theme = themes[panels.indexOf(p)];
      ctx.fillStyle = theme.bg; ctx.fillRect(0, 0, 640, 400);
      const drift = t * (18 + panels.indexOf(p) * 2) + p.phase * 40;
      ctx.strokeStyle = theme.accent; ctx.globalAlpha = .42; ctx.lineWidth = 2;
      for (let y = 20; y < 400; y += 16) { ctx.beginPath(); ctx.moveTo(0, y + Math.sin(drift * .02 + y) * 5); ctx.lineTo(640, y); ctx.stroke(); }
      ctx.globalAlpha = .9; ctx.fillStyle = theme.accent;
      ctx.font = 'bold 86px Arial'; ctx.fillText(theme.glyph, 38 + Math.sin(drift * .012) * 12, 220);
      ctx.font = 'bold 19px Arial'; ctx.fillText(theme.label, 38, 330);
      ctx.font = '12px monospace'; ctx.fillText('UNIPARC CULTURE INDEX  /  00' + (panels.indexOf(p) + 1), 38, 365);
      ctx.globalAlpha = .65; ctx.lineWidth = 5;
      const x = 390 + Math.sin(drift * .01) * 80, y = 175 + Math.cos(drift * .018) * 55;
      ctx.beginPath(); ctx.arc(x, y, 66 + Math.sin(drift * .03) * 12, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 120, y); ctx.lineTo(x + 120, y); ctx.stroke();
      ctx.globalAlpha = 1; p.texture.needsUpdate = true;
    };

    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      const t = clock.getElapsedTime();
      stars.rotation.y = t * .008; stars.rotation.x = Math.sin(t * .12) * .012;
      const starIn = THREE.MathUtils.smoothstep(t, 1.0, 3.2) * (1 - THREE.MathUtils.smoothstep(t, 5.0, 5.8));
      starGroup.scale.setScalar(.01 + starIn * (.9 + Math.sin(t * 3) * .035));
      starGroup.position.z = 0;
      starLight.intensity = starIn * (2 + Math.max(0, Math.sin(t * 4)) * 5);
      key.intensity = starIn * 1.2;
      const bang = THREE.MathUtils.clamp((t - 5.15) / 1.4, 0, 1);
      shockRings.forEach((ring, i) => {
        const p = THREE.MathUtils.clamp((t - 5.1 - i * .16) / 1.4, 0, 1);
        ring.scale.setScalar(.05 + p * 10); (ring.material as THREE.MeshBasicMaterial).opacity = (1 - p) * .8;
      });
      const bp = Math.max(0, t - 5.15);
      for (let i = 0; i < burstCount; i++) {
        const k = i * 3, age = Math.min(2.8, bp);
        burstPositions[k] = burstVelocity[k] * age;
        burstPositions[k + 1] = burstVelocity[k + 1] * age - age * age * .22;
        burstPositions[k + 2] = burstVelocity[k + 2] * age;
      }
      burstGeo.attributes.position.needsUpdate = true;
      burstMat.opacity = Math.min(1, bang * 2.2) * (1 - THREE.MathUtils.smoothstep(t, 8.4, 9.6)) * .9;
      const montage = THREE.MathUtils.smoothstep(t, 6.0, 7.3) * (1 - THREE.MathUtils.smoothstep(t, 10.9, 12.1));
      panels.forEach((p, i) => {
        drawPanel(p, t);
        const target = panelLayout[i];
        const appear = THREE.MathUtils.smoothstep(t, 6.0 + i * .07, 7.2 + i * .07);
        const vanish = THREE.MathUtils.smoothstep(t, 10.6 + i * .045, 11.8 + i * .045);
        const visibility = appear * (1 - vanish);
        p.group.scale.setScalar(.001 + visibility * .94);
        p.group.position.x = target[0] + Math.sin(t * .55 + p.phase) * .16;
        p.group.position.y = target[1] + Math.cos(t * .48 + p.phase) * .12;
        p.group.position.z = target[2] + Math.sin(t * .7 + p.phase) * .18;
        p.group.rotation.y += (Math.sin(t * .3 + p.phase) * .045 - p.group.rotation.y) * .025;
        p.material.opacity = visibility * .96;
      });
      const snakeIn = THREE.MathUtils.smoothstep(t, 11.4, 13.2);
      const snakeOut = 1 - THREE.MathUtils.smoothstep(t, 20.4, 21.5);
      serpent.visible = snakeIn > .001 && snakeOut > .001;
      head.visible = serpent.visible;
      if (serpent.visible) {
        const phase = (t - 11.4) * .72;
        const cx = Math.sin(phase) * .22, cy = Math.cos(phase) * .14;
        const points: THREE.Vector3[] = [];
        for (let i = 0; i <= 80; i++) {
          const a = (i / 80) * Math.PI * 2 + phase;
          const wobble = Math.sin(a * 2 - phase * 1.4) * .13 + Math.sin(a * 3 + phase) * .045;
          points.push(new THREE.Vector3(cx + Math.cos(a) * (3.35 + wobble), cy + Math.sin(a) * (2.45 + wobble), Math.sin(a * 2 + phase) * .22));
        }
        const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal');
        const pos = bodyGeo.attributes.position as THREE.BufferAttribute;
        const frames = curve.computeFrenetFrames(bodySegments, true);
        for (let i = 0; i <= bodySegments; i++) {
          const u = i / bodySegments, center = curve.getPointAt(u), tangent = curve.getTangentAt(u);
          const radius = .19 * (1 - Math.pow(u, 2.5)) + .025;
          for (let j = 0; j <= radialSegments; j++) {
            const v = (j / radialSegments) * Math.PI * 2;
            const normal = frames.normals[i], binormal = frames.binormals[i];
            const p = center.clone().addScaledVector(normal, Math.cos(v) * radius).addScaledVector(binormal, Math.sin(v) * radius);
            pos.setXYZ(i * (radialSegments + 1) + j, p.x, p.y, p.z);
          }
          if (i === 0) {
            head.position.copy(center);
            head.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent);
          }
        }
        pos.needsUpdate = true; bodyGeo.computeVertexNormals();
        serpent.scale.setScalar(snakeIn * snakeOut);
        head.scale.setScalar(snakeIn * snakeOut);
        serpent.rotation.z = Math.sin(t * .35) * .025;
        starGroup.scale.multiplyScalar(1 - THREE.MathUtils.smoothstep(t, 19.8, 20.8) * .98);
      }
      camera.position.x = Math.sin(t * .16) * .18;
      camera.position.y = Math.cos(t * .13) * .12;
      camera.lookAt(0, 0, 0);
      rim.intensity = snakeIn * snakeOut * 1.1;
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(raf); observer.disconnect();
      starGeo.dispose(); starMat.dispose(); burstGeo.dispose(); burstMat.dispose();
      bodyGeo.dispose(); bodyMat.dispose();
      panels.forEach(p => { p.texture.dispose(); p.material.dispose(); });
      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) { obj.geometry.dispose(); const m = obj.material; if (Array.isArray(m)) m.forEach(x => x.dispose()); else m.dispose(); }
      });
      renderer.dispose(); if (root.contains(renderer.domElement)) root.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="cinematic-sequence" ref={host} aria-hidden="true" />;
}
