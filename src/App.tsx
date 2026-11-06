import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

const worlds = [
  { id: 'anime', number: '01', name: 'ANIME / MANGA', note: 'Stories that stay with you', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1400&q=88', tag: 'THE ART OF OBSESSION' },
  { id: 'gaming', number: '02', name: 'GAMES / PLAY', note: 'Your next life starts here', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=88', tag: 'PRESS START / REPEAT' },
  { id: 'screen', number: '03', name: 'FILM / SCREEN', note: 'For the ones who know the lore', image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1400&q=88', tag: 'STAY FOR THE CREDITS' },
  { id: 'sound', number: '04', name: 'MUSIC / SOUND', note: 'Wear your soundtrack', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=88', tag: 'FEEL EVERY FREQUENCY' },
];

const introCulture = [
  { label: 'ANIME', glyph: 'ア' }, { label: 'MANGA', glyph: '漫' },
  { label: 'GAMING', glyph: '⌁' }, { label: 'CINEMA', glyph: '▶' },
  { label: 'MEMES', glyph: '404' }, { label: 'MUSIC', glyph: '♫' },
  { label: 'COMICS', glyph: '✳' }, { label: 'STREET', glyph: '✦' },
  { label: 'FANDOM', glyph: '✧' }, { label: 'ARCADE', glyph: '▣' },
  { label: 'ANIMATION', glyph: '◈' }, { label: 'INTERNET', glyph: '⌘' },
  { label: 'COLLECTIBLES', glyph: '◇' }, { label: 'SERIES', glyph: '▤' },
  { label: 'SOUND', glyph: '∿' }, { label: 'ART', glyph: '⌖' },
];
const introFragments = Array.from({ length: 220 }, (_, index) => {
  const angle = index * 2.399963229728653;
  const radius = .12 + ((index * 37) % 83) / 100;
  const category = introCulture[index % introCulture.length];
  return {
    index, ...category,
    dx: Math.cos(angle) * radius * .56,
    dy: Math.sin(angle) * radius * .48,
    rotation: ((index * 47) % 150) - 75,
    card: index < 16,
    scale: .55 + ((index * 13) % 65) / 100,
  };
});

const pieces = [
  { id: '01', name: 'SIGNAL / 001', category: 'APPAREL', label: 'THE FIRST FREQUENCY', color: 'lime', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1100&q=88' },
  { id: '02', name: 'AFTERIMAGE / 002', category: 'APPAREL', label: 'A MEMORY IN MOTION', color: 'violet', image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1100&q=88' },
  { id: '03', name: 'SIDE QUEST / 003', category: 'CULTURE', label: 'TAKE THE LONG WAY', color: 'orange', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd5?auto=format&fit=crop&w=1100&q=88' },
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg aria-hidden="true" className="arrow" viewBox="0 0 20 20" fill="none">
    <path d={diagonal ? 'M5 15 15 5M6 5h9v9' : 'M5 5 15 15M6 15h9V6'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cosmicCanvasRef = useRef<HTMLCanvasElement>(null);
  const introTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const navDockRef = useRef<HTMLElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [activeDock, setActiveDock] = useState('home');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [activeWorld, setActiveWorld] = useState(worlds[0]);
  const [activeChapter, setActiveChapter] = useState('01 / THE IDEA');
  const [selectedPiece, setSelectedPiece] = useState<(typeof pieces)[number] | null>(null);
  const [waitlistNotice, setWaitlistNotice] = useState('');
  const filtered = activeFilter === 'ALL' ? pieces : pieces.filter((piece) => piece.category === activeFilter);

  const navigateToSection = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const topOffset = 24;
    if (reduceMotion) {
      window.scrollTo({ top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - topOffset), behavior: 'auto' });
      return;
    }
    const destination = Math.max(0, window.scrollY + target.getBoundingClientRect().top - topOffset);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(destination, {
        duration: 1.2,
        easing: (time) => 1 - Math.pow(1 - time, 4),
        force: true,
      });
    } else {
      window.scrollTo({ top: destination, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const canvas = cosmicCanvasRef.current;
    if (!canvas || isLoaded || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.z = 24;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    const mobile = window.matchMedia('(max-width: 700px)').matches;
    const starCount = mobile ? 520 : 1250;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const n = i * 3;
      starPositions[n] = (Math.random() - .5) * 58;
      starPositions[n + 1] = (Math.random() - .5) * 36;
      starPositions[n + 2] = (Math.random() - .5) * 34;
      const tint = .72 + Math.random() * .28;
      starColors[n] = tint * .82; starColors[n + 1] = tint; starColors[n + 2] = tint * .58;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMaterial = new THREE.PointsMaterial({ size: .045, vertexColors: true, transparent: true, opacity: .48, sizeAttenuation: true, depthWrite: false });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    };
    let frame = 0;
    const render = () => {
      stars.rotation.y += .000035;
      stars.rotation.x = Math.sin(performance.now() * .00008) * .012;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(frame); window.removeEventListener('resize', resize);
      starGeometry.dispose(); starMaterial.dispose(); renderer.dispose();
    };
  }, [isLoaded]);

  useEffect(() => {
    setShowSkipIntro(window.localStorage.getItem('uniparc-intro-seen') === '1');
  }, []);

  useEffect(() => {
    const nav = navDockRef.current;
    if (!nav) return;
    let frame = 0;
    const updateIndicator = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const active = nav.querySelector<HTMLElement>('.dock-active');
        if (!active) return;
        nav.style.setProperty('--dock-indicator-x', active.offsetLeft + 'px');
        nav.style.setProperty('--dock-indicator-width', active.offsetWidth + 'px');
        if (window.matchMedia('(max-width: 760px)').matches) {
          const navBounds = nav.getBoundingClientRect();
          const itemBounds = active.getBoundingClientRect();
          if (itemBounds.left < navBounds.left + 10 || itemBounds.right > navBounds.right - 10) active.scrollIntoView({behavior:'smooth',block:'nearest',inline:'nearest'});
        }
      });
    };
    updateIndicator();
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(nav);
    window.addEventListener('resize', updateIndicator);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('resize', updateIndicator); };
  }, [activeDock]);

  useEffect(() => {
    // A fresh visit always starts at the hero, never at a browser-restored scroll position or old hash.
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    window.scrollTo(0, 0);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = reduceMotion ? null : new Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 0.95, anchors: { offset: -24 } });
    lenisRef.current = lenis;
    let lenisTick: ((time: number) => void) | undefined;
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      lenisTick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(lenisTick);
      gsap.ticker.lagSmoothing(0);
      const onRefresh = () => lenis.resize();
      ScrollTrigger.addEventListener('refresh', onRefresh);
    }

    const ctx = gsap.context(() => {
      const finishIntro = () => {
        window.scrollTo(0, 0);
        lenisRef.current?.scrollTo(0, { immediate: true, force: true });
        setActiveDock('home');
        window.localStorage.setItem('uniparc-intro-seen', '1');
        setIsLoaded(true);
      };
      const intro = gsap.timeline({ defaults: { ease: 'power3.inOut' }, onComplete: finishIntro });
      introTimelineRef.current = intro;
      if (reduceMotion) {
        intro.set('.preloader', { autoAlpha: 0 }).call(() => setIsLoaded(true));
      } else {
        intro.set('.cosmic-stage', { autoAlpha: 1 })
          .fromTo('.cosmic-starfield', { scale: 1.18, autoAlpha: .04 }, { scale: 1, autoAlpha: .8, duration: 2.1, ease: 'power2.out' })
          .fromTo('.cosmic-star', { scale: .015, autoAlpha: 0, rotation: -28 }, { scale: 1, autoAlpha: 1, rotation: 0, duration: 1.6, ease: 'expo.out' }, '<')
          .fromTo('.star-sphere', { filter: 'brightness(.55)' }, { filter: 'brightness(1.9)', duration: .72, repeat: 4, yoyo: true, ease: 'sine.inOut' }, '<')
          .to('.cosmic-star', { scale: 1.22, duration: .78, repeat: 3, yoyo: true, ease: 'sine.inOut' }, '+=.35')
          .to('.star-sphere', { filter: 'brightness(4)' , duration: .16, ease: 'power2.in' })
          .fromTo('.bigbang-flash', { autoAlpha: 0 }, { autoAlpha: 1, duration: .08, yoyo: true, repeat: 1 }, '<')
          .fromTo('.bigbang-ring', { scale: .02, autoAlpha: 1 }, { scale: 18, autoAlpha: 0, duration: 1.15, ease: 'expo.out' }, '<')
          .fromTo('.bigbang-rays', { scale: .05, rotation: -12, autoAlpha: 0 }, { scale: 1.7, rotation: 24, autoAlpha: .9, duration: 1.1, ease: 'power3.out' }, '<')
          .to('.cosmic-star', { scale: 2.6, autoAlpha: 0, duration: .28, ease: 'power4.in' }, '<')
          .fromTo('.culture-shard', { x: 0, y: 0, scale: .05, rotation: (i, el) => Number(el.dataset.rotation || 0), autoAlpha: 0 }, {
            x: (i, el) => Number(el.dataset.dx || 0) * window.innerWidth,
            y: (i, el) => Number(el.dataset.dy || 0) * window.innerHeight,
            scale: (i, el) => Number(el.dataset.scale || 1),
            rotation: (i, el) => Number(el.dataset.rotation || 0) * 1.8,
            autoAlpha: 1, duration: 1.65, stagger: { each: .009, from: 'random' }, ease: 'expo.out'
          }, '-=.78')
          .to('.culture-shard', { x: 0, y: 0, scale: .08, rotation: (i) => i % 2 ? 150 : -150, autoAlpha: 0, duration: 1.05, stagger: { each: .006, from: 'edges' }, ease: 'power3.in' }, '+=.65')
          .fromTo('.cosmic-core', { scale: .12, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .48, ease: 'back.out(1.7)' }, '-=.58')
          .fromTo('.ouroboros', { scale: 1.72, rotation: -92, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 1.55, ease: 'power3.out' }, '-=.08')
          .fromTo('.ouro-body', { strokeDashoffset: 1800 }, { strokeDashoffset: 0, duration: 1.65, ease: 'power2.inOut' }, '<')
          .to('.ouroboros', { rotation: 360, scale: .82, duration: 1.6, ease: 'power2.inOut' })
          .to('.cosmic-core', { scale: .015, autoAlpha: 0, duration: .7, ease: 'expo.in' }, '-=.55')
          .to('.ouroboros', { rotation: 690, scale: .055, autoAlpha: 0, duration: .85, ease: 'expo.in' }, '-=.58')
          .fromTo('.cosmic-wordmark', { scale: .62, y: 28, autoAlpha: 0, filter: 'blur(24px)' }, { scale: 1, y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out' }, '-=.1')
          .to('.cosmic-wordmark', { autoAlpha: 0, y: -24, duration: .52, delay: .8 })
          .to('.preloader', { yPercent: -100, duration: 1, ease: 'power4.inOut' })
          .fromTo('.hero-kicker, .hero-line, .hero-foot, .hero-visual', { y: 48, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .85, stagger: .09, ease: 'power3.out' }, '-=.45');
      }

      if (!reduceMotion) {
        gsap.to('.hero-visual img', { yPercent: 13, scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.hero-visual', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('.hero-title .outline-word', { xPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 } });
        gsap.to('.orbit-stamp', { rotate: 360, duration: 22, repeat: -1, ease: 'none' });
        gsap.to('.manifesto-ghost', { xPercent: -18, ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'top bottom', end: 'bottom top', scrub: 1 } });
        gsap.utils.toArray<HTMLElement>('.reveal-up').forEach((el) => {
          gsap.fromTo(el, { y: 72, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.05, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        });
        gsap.utils.toArray<HTMLElement>('.world-card').forEach((card, i) => {
          gsap.fromTo(card, { y: 100, rotate: i % 2 ? 3 : -3, autoAlpha: 0 }, { y: 0, rotate: 0, autoAlpha: 1, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 90%', once: true } });
          const image = card.querySelector('img');
          if (image) gsap.to(image, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
        gsap.utils.toArray<HTMLElement>('.piece-card').forEach((card, i) => {
          gsap.fromTo(card, { y: 90, autoAlpha: 0, rotate: i === 1 ? 2 : -1 }, { y: 0, autoAlpha: 1, rotate: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 88%', once: true } });
        });
        gsap.fromTo('.campaign-image', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.campaign', start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.fromTo('.closing-title', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: '.closing', start: 'top 75%', once: true } });
        gsap.utils.toArray<HTMLElement>('.masked-reveal').forEach((el) => gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)', y: 34 }, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1.15, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 86%', once: true } }));
        const chapters = [{ selector: '.manifesto', label: '01 / THE IDEA' }, { selector: '.worlds', label: '02 / FIND YOUR FREQUENCY' }, { selector: '.drop', label: '03 / THE UNIPARC EDIT' }, { selector: '.campaign', label: '04 / CULTURE IS A WAY OF LIFE' }, { selector: '.about', label: '05 / OUR POINT OF VIEW' }];
        chapters.forEach(({ selector, label }) => ScrollTrigger.create({ trigger: selector, start: 'top 45%', end: 'bottom 45%', onEnter: () => setActiveChapter(label), onEnterBack: () => setActiveChapter(label) }));
        gsap.to('.manifesto-ghost', { yPercent: 16, ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
      }
    }, rootRef);

    return () => {
      ctx.revert();
      lenisRef.current = null;
      if (lenis) {
        if (lenisTick) gsap.ticker.remove(lenisTick);
        lenis.destroy();
      }
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  useEffect(() => {
    const targets = ['home', 'manifesto', 'worlds', 'drop', 'campaign', 'about', 'closing', 'footer']
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!targets.length) return;

    let frame = 0;
    const updateActiveSection = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // The section crossing this fixed reading line is the section the user is in.
        const readingLine = Math.min(180, window.innerHeight * 0.28);
        let current = targets[0];
        for (const section of targets) {
          if (section.getBoundingClientRect().top <= readingLine) current = section;
          else break;
        }
        setActiveDock(current.id);
      });
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, []);

  useEffect(() => {
    const dock = navDockRef.current;
    if (!dock) return;
    const activeLink = dock.querySelector<HTMLAnchorElement>(`a[href="#${activeDock}"]`);
    if (!activeLink) return;
    const targetLeft = activeLink.offsetLeft - (dock.clientWidth - activeLink.clientWidth) / 2;
    const maxLeft = dock.scrollWidth - dock.clientWidth;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    dock.scrollTo({
      left: Math.max(0, Math.min(maxLeft, targetLeft)),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [activeDock]);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduceMotion || !cursorRef.current || !cursorDotRef.current) return;
    const moveX = gsap.quickTo(cursorRef.current, 'x', { duration: 0.42, ease: 'power3' });
    const moveY = gsap.quickTo(cursorRef.current, 'y', { duration: 0.42, ease: 'power3' });
    const dotX = gsap.quickTo(cursorDotRef.current, 'x', { duration: 0.12, ease: 'power2' });
    const dotY = gsap.quickTo(cursorDotRef.current, 'y', { duration: 0.12, ease: 'power2' });
    const onMove = (event: PointerEvent) => { moveX(event.clientX); moveY(event.clientY); dotX(event.clientX); dotY(event.clientY); };
    const onOver = (event: PointerEvent) => {
      const target = (event.target as HTMLElement).closest('a, button, .world-card, .piece-card');
      if (target) { cursorRef.current?.classList.add('cursor-active'); cursorRef.current?.setAttribute('data-label', target.getAttribute('data-cursor-label') || (target.closest('.piece-card') ? 'VIEW OBJECT' : 'EXPLORE')); }
      else { cursorRef.current?.classList.remove('cursor-active'); cursorRef.current?.removeAttribute('data-label'); }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerover', onOver);
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerover', onOver); };
  }, []);

  useEffect(() => {
    if (!selectedPiece) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelectedPiece(null); };
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown); };
  }, [selectedPiece]);

  return (
    <div className="site" ref={rootRef}>
      <div className={isLoaded ? 'preloader preloader-out' : 'preloader'} aria-hidden={isLoaded}>
        <div className="cosmic-stage">
          <canvas ref={cosmicCanvasRef} className="cosmic-webgl" aria-hidden="true" />
          <div className="cosmic-starfield" />
          <div className="cosmic-star" aria-hidden="true"><span className="star-corona" /><span className="star-sphere" /><span className="star-flare" /></div>
          <div className="bigbang-flash" aria-hidden="true" />
          <div className="bigbang-ring" aria-hidden="true" />
          <div className="bigbang-rays" aria-hidden="true" />
          <div className="culture-eruption" aria-hidden="true">
            {introFragments.map((fragment) => <span key={fragment.index} className={fragment.card ? 'culture-shard culture-shard-card' : 'culture-shard culture-shard-glyph'} data-dx={fragment.dx} data-dy={fragment.dy} data-rotation={fragment.rotation} data-scale={fragment.scale}>
              {fragment.card ? <><i>{fragment.glyph}</i><b>{fragment.label}</b><small>UNIPARC / CULTURE FILE</small></> : fragment.glyph}
            </span>)}
          </div>
          <div className="cosmic-core" aria-hidden="true"><span className="core-star">✳</span><i className="core-orbit" /><i className="core-orbit core-orbit-b" /></div>
          <svg className="ouroboros" viewBox="0 0 600 600" aria-hidden="true">
            <defs>
              <linearGradient id="ouro-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f5ffd0" /><stop offset=".22" stopColor="#b9d66a" /><stop offset=".48" stopColor="#52652b" /><stop offset=".7" stopColor="#d7e99a" /><stop offset="1" stopColor="#788d3d" /></linearGradient>
              <pattern id="ouro-scales" width="24" height="20" patternUnits="userSpaceOnUse"><path d="M0 10 Q12 -2 24 10 Q12 22 0 10Z" fill="none" stroke="#e5f5ae" strokeOpacity=".32" strokeWidth="1.2" /></pattern>
              <filter id="ouro-glow"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <path className="ouro-body" d="M300 74 C430 74 526 174 526 300 C526 426 426 526 300 526 C174 526 74 426 74 300 C74 174 174 74 300 74" />
            <path className="ouro-scale-overlay" d="M300 74 C430 74 526 174 526 300 C526 426 426 526 300 526 C174 526 74 426 74 300 C74 174 174 74 300 74" />
            <path className="ouro-head" d="M284 83 L263 55 L274 23 L300 44 L327 24 L340 55 L320 84 L303 100Z" />
            <path className="ouro-jaw" d="M276 67 Q301 82 329 64 L321 92 Q299 108 280 88Z" />
            <path className="ouro-eye" d="M279 54 l9 -4 2 8 -9 3Z M316 54 l9 -4 2 8 -9 3Z" />
            <path className="ouro-horn" d="M276 43 L260 13 L292 34 M325 42 L343 13 L309 34" />
            <path className="ouro-nostril" d="M296 73 l4 2 M307 73 l4 2" />
          </svg>
          <div className="cosmic-wordmark"><img className="brand-logo preloader-logo" src="/Uniparc.svg" alt="UNIPARC" /><span>WEAR WHAT DEFINES YOU.</span></div>
          <div className="cosmic-caption"><span>ONE UNIVERSE. INFINITE CULTURES.</span><span>UNIPARC® / 001</span></div>
          {showSkipIntro && <button className="skip-intro" type="button" onClick={() => introTimelineRef.current?.progress(1)}>SKIP INTRO <span aria-hidden="true">↗</span></button>}
        </div>
      </div>
      <div className="cursor-aura" ref={cursorRef} aria-hidden="true" /><div className="cursor-dot" ref={cursorDotRef} aria-hidden="true" />
      <div className="scroll-progress" aria-hidden="true"><span /></div>
      <aside className="chapter-index" aria-live="polite"><span className="chapter-index-dot" /><span>{activeChapter}</span><span className="chapter-index-rule" /></aside>

      <header className="topbar">
        <a className="wordmark" href="#home" aria-label="UNIPARC home"><img className="brand-logo header-logo" src="/Uniparc.svg" alt="UNIPARC" /></a>
        <span className="topbar-note">A HOME FOR WHAT YOU LOVE</span>
        <span className="topbar-edition">INDEPENDENT CULTURE LABEL / 2026</span>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-meta hero-kicker"><span><i className="status-dot" /> A CULTURE-FIRST LIFESTYLE LABEL</span><span>BUILT AROUND WHAT YOU LOVE <b>IND / 2026</b></span></div>
          <div className="hero-copy">
            <p className="eyebrow hero-kicker">ALL THE THINGS THAT MAKE YOU, YOU.</p>
            <h1 className="hero-title masked-reveal"><span className="hero-line">WEAR WHAT</span><span className="hero-line"><em className="outline-word">DEFINES</em> YOU<span className="period">.</span></span></h1>
            <div className="hero-foot hero-kicker"><p>The stories you follow. The games you play. The music you live by. UNIPARC brings the worlds you love into what you wear.</p><a className="scroll-cue" href="#manifesto"><span>EXPLORE THE UNIVERSE</span><b>↓</b></a></div>
          </div>
          <div className="hero-visual">
            <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=2200&q=90" alt="Streetwear editorial campaign" fetchPriority="high" decoding="async" />
            <div className="hero-visual-wash" /><span className="visual-coordinate">FIG. 001 — THE EVERYDAY UNIVERSE</span>
            <div className="hero-image-caption"><span>UNIPARC / CULTURE STUDY 001</span><span>MADE TO FEEL LIKE YOU.</span></div>
            <div className="orbit-stamp"><svg viewBox="0 0 120 120" role="img" aria-label="Wear what defines you"><defs><path id="stamp-circle" d="M60,60 m-43,0 a43,43 0 1,1 86,0 a43,43 0 1,1 -86,0" /></defs><text><textPath href="#stamp-circle">CULTURE LIVES HERE ✳ WEAR WHAT DEFINES YOU ✳ </textPath></text><circle cx="60" cy="60" r="25" /><path d="M47 69V50l13 10 13-10v19" /></svg></div>
          </div>
          <div className="ticker"><div>ANIME IS CULTURE <b>✳</b> GAMING IS CULTURE <b>✳</b> MUSIC IS CULTURE <b>✳</b> FILM IS CULTURE <b>✳</b> INTERNET IS CULTURE <b>✳</b> ANIME IS CULTURE <b>✳</b> GAMING IS CULTURE <b>✳</b> MUSIC IS CULTURE <b>✳</b> FILM IS CULTURE <b>✳</b> INTERNET IS CULTURE <b>✳</b></div></div>
        </section>

        <section className="manifesto section" id="manifesto">
          <div className="section-label"><span>01 / THE IDEA</span><span>A PLACE WHERE CULTURE BELONGS</span></div>
          <div className="manifesto-ghost" aria-hidden="true">MULTIDIMENSIONAL</div>
          <div className="manifesto-grid">
            <div className="manifesto-heading reveal-up"><span className="eyebrow dark-eyebrow">YOU DON'T HAVE TO PICK JUST ONE</span><h2 className="masked-reveal">YOU ARE<br />NOT <em>ONE</em><br />THING<span className="period">.</span></h2></div>
            <div className="manifesto-text reveal-up"><p className="lead">Your style can hold every side of you.</p><p>Maybe it's a manga you grew up with. A game you lose hours to. A lyric that says what you couldn't. A film you return to. The things you love are part of your story — and they deserve a place in it.</p><p>UNIPARC brings those worlds together in one place. Explore what you love, find familiar energy and make room for something new. No gatekeeping. No need to choose just one.</p><a className="text-link" href="#about">WHY UNIPARC EXISTS <Arrow diagonal /></a></div>
          </div>
          <div className="manifesto-foot"><span>ONE PERSON. MANY UNIVERSES.</span><span>WEAR WHAT DEFINES YOU.®</span><span>SCROLL / 001</span></div>
        </section>

        <section className="worlds section" id="worlds" style={{ "--ambient-tint": activeWorld.id === "anime" ? "#b8a2ff" : activeWorld.id === "gaming" ? "#d9f36a" : activeWorld.id === "screen" ? "#ff8a68" : "#8dbdff" } as React.CSSProperties & { "--ambient-tint": string }}>
          <div className="section-heading reveal-up"><div><span className="eyebrow">02 / FIND YOUR FREQUENCY</span><h2 className="masked-reveal">WHAT ARE<br /><em>YOU INTO?</em></h2></div><p>Different interests. One place to explore.<br />Find your world — or discover a new one.</p></div>
          <div className="world-atmosphere-label"><span>YOU'RE EXPLORING</span><strong>{activeWorld.name}</strong><small>{activeWorld.note}</small></div><div className="world-grid">
            {worlds.map((world) => <a className={'world-card world-' + world.id} href="#drop" key={world.id} data-cursor-label="ENTER WORLD" onMouseEnter={() => setActiveWorld(world)} onFocus={() => setActiveWorld(world)} onMouseLeave={() => setActiveWorld(worlds[0])}><img src={world.image} alt="" loading="lazy" decoding="async" /><span className="world-shade" /><span className="world-number">{world.number} / CULTURE INDEX</span><span className="world-tag">{world.tag}</span><span className="world-info"><span><strong>{world.name}</strong><small>{world.note}</small></span><b><Arrow diagonal /></b></span><span className="world-outline" aria-hidden="true">{world.number}</span></a>)}
          </div>
          <p className="worlds-note">THAT'S ONLY THE START. THERE'S ALWAYS MORE TO DISCOVER. <span>↘</span></p>
        </section>

        <section className="drop section" id="drop">
          <div className="section-heading drop-heading reveal-up"><div><span className="eyebrow">03 / THE UNIPARC EDIT</span><h2 className="masked-reveal">FIRST LOOK.<br /><em>FRESH SIGNAL.</em></h2></div><p>A first look at the ideas and pieces<br />shaping the UNIPARC universe.</p></div>
          <div className="filter-bar" role="group" aria-label="Filter collection">{['ALL', 'APPAREL', 'CULTURE'].map((filter) => <button key={filter} className={activeFilter === filter ? 'selected' : ''} onClick={() => setActiveFilter(filter)}>{filter}<sup>{filter === 'ALL' ? '03' : '02'}</sup></button>)}<span>CONCEPT PREVIEW / 2026</span></div>
          <div className="piece-grid">{filtered.map((piece) => <article className="piece-card" key={piece.id} data-cursor-label="VIEW OBJECT"><div className={'piece-image ' + piece.color}><img src={piece.image} alt="Editorial apparel inspiration" loading="lazy" decoding="async" /><span className="piece-index">OBJECT / {piece.id}</span><span className="piece-arrow"><Arrow diagonal /></span><span className="piece-caption">{piece.label}</span><span className="piece-hover-label">DISCOVER THE PIECE ↗</span><button className="piece-open" onClick={() => { setSelectedPiece(piece); setWaitlistNotice(""); }} aria-label={"Discover " + piece.name}>OPEN OBJECT</button></div><div className="piece-meta"><span>{piece.name}</span><span>{piece.category}</span></div></article>)}</div>
          <p className="drop-disclaimer">CONCEPT PREVIEW ONLY. FINAL PRODUCT DETAILS AND RELEASE INFORMATION WILL BE SHARED AT LAUNCH.</p>
        </section>

        <section className="campaign" id="campaign">
          <img className="campaign-image" src="https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=2200&q=90" alt="Crowd at a live music event" loading="lazy" decoding="async" />
          <div className="campaign-overlay" /><div className="campaign-content reveal-up"><span className="eyebrow">04 / CULTURE IS A WAY OF LIFE</span><h2>NEVER JUST<br /><em>A PHASE.</em></h2><p>The stories that shape you. The people who get your references. The interests that never really leave. That's culture — and it's part of everyday life.</p><a href="#about" className="light-link">GET TO KNOW THE IDEA <Arrow diagonal /></a></div><span className="campaign-mark">CULTURE<br />LIVES HERE®</span><span className="campaign-index">CULTURE STUDY / 004</span>
        </section>

        <section className="about section" id="about">
          <div className="about-side"><span className="eyebrow dark-eyebrow">05 / OUR POINT OF VIEW</span><img className="about-logo" src="/Uniparc.svg" alt="UNIPARC emblem and wordmark" /><span className="about-side-note">A PLACE WHERE<br />CULTURE BELONGS.</span></div>
          <div className="about-main reveal-up"><h2>MORE THAN<br />WHAT YOU <em>WEAR.</em></h2><p className="lead">A place for every interest, influence and side of you.</p><p>UNIPARC is a culture-first lifestyle label for people who don't fit into just one category. We bring fandoms, niche interests and everyday inspirations into a shared space for self-expression and belonging.</p><p>Our first pieces are graphic T-shirts — understated from a distance, full of meaning up close. It's the beginning of a wider world built around the things you love.</p><strong>NO GATEKEEPING. NO BOXES TO FIT. JUST ROOM TO BE YOU.</strong></div>
        </section>

        <section className="closing section" id="closing">
          <span className="eyebrow">THERE'S ROOM FOR YOU HERE</span><h2 className="closing-title">FIND YOUR<br /><em>PEOPLE.</em></h2><p>The first UNIPARC drop is in the works. Check back soon for the first release details.</p><a className="closing-link" href="#home">RETURN TO THE TOP ↑</a><span className="closing-orbit" aria-hidden="true">U✳</span>
        </section>
      </main>

      {selectedPiece && <div className="object-modal" data-lenis-prevent role="dialog" aria-modal="true" aria-labelledby="object-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedPiece(null); }}><article className="object-modal-panel">
        <div className="object-modal-visual">
          <img src={selectedPiece.image} alt={"Editorial preview for " + selectedPiece.name} />
          <span className="object-visual-index">UNIPARC® <i> / </i> OBJECT STUDY {selectedPiece.id}</span>
          <span className="object-visual-note">THE UNIPARC EDIT <b>2026</b></span>
        </div>
        <div className="object-modal-content" data-lenis-prevent>
          <div className="object-modal-topline"><span>OBJECT FILE <b>{selectedPiece.id} / 03</b></span><button className="object-close" onClick={() => setSelectedPiece(null)} aria-label="Close object preview">CLOSE <span>×</span></button></div>
          <div className="object-modal-intro">
            <span className="object-modal-kicker">{selectedPiece.category} <i>—</i> {selectedPiece.label}</span>
            <h2 id="object-title">{selectedPiece.name}</h2>
            <p>A wearable expression of the worlds, stories and details that stay with you. This concept is part of the evolving UNIPARC universe — made for every side of you.</p>
          </div>
          <div className="object-detail-block">
            <div className="object-detail-heading"><span>01</span><b>THE DETAILS</b><i>CONCEPT PREVIEW</i></div>
            <dl className="object-detail-list">
              <div><dt>DESIGN INTENT</dt><dd>IDENTITY / EXPRESSION</dd></div>
              <div><dt>COLLECTION</dt><dd>THE UNIPARC EDIT</dd></div>
              <div><dt>MATERIAL & FIT</dt><dd>TO BE ANNOUNCED</dd></div>
              <div><dt>RELEASE WINDOW</dt><dd>FIRST DROP / 2026</dd></div>
            </dl>
          </div>
          <div className="object-modal-signup">
            <span className="object-modal-kicker">BE THERE FROM THE FIRST DROP</span>
            <h3>Get the signal.</h3>
            <p>Release information will be shared here when the collection is ready.</p>
            <form onSubmit={(event) => { event.preventDefault(); setWaitlistNotice("Preview only — your email has not been saved or sent."); }}>
              <label htmlFor="object-email">EMAIL ADDRESS</label>
              <div className="object-email-row"><input id="object-email" type="email" placeholder="you@example.com" required /><button type="submit" aria-label="Preview signup response">NOTIFY ME <span>↗</span></button></div>
              <small>{waitlistNotice || "Preview form only. Email collection is not active and no details are stored."}</small>
            </form>
          </div>
          <div className="object-modal-foot"><span>WEAR WHAT DEFINES YOU.®</span><span>UNIPARC / 2026</span></div>
        </div>
      </article></div>}
      <nav ref={navDockRef} className={selectedPiece ? 'nav-dock nav-dock-hidden' : 'nav-dock'} aria-label="Section navigation">
        <span className="dock-indicator" aria-hidden="true" />
        <a className={activeDock === 'home' ? 'dock-home dock-active' : 'dock-home'} href="#home" onClick={(event) => navigateToSection(event, 'home')} aria-label="Home" aria-current={activeDock === 'home' ? 'location' : undefined}><span className="dock-home-mark">U<span>✳</span></span><span className="dock-label">HOME</span></a>
        <span className="dock-divider" aria-hidden="true" />
        <a href="#manifesto" className={activeDock === 'manifesto' ? 'dock-link dock-active' : 'dock-link'} onClick={(event) => navigateToSection(event, 'manifesto')} aria-current={activeDock === 'manifesto' ? 'location' : undefined}><span className="dock-number">01</span><span className="dock-label">IDEA</span></a>
        <a href="#worlds" className={activeDock === 'worlds' ? 'dock-link dock-active' : 'dock-link'} onClick={(event) => navigateToSection(event, 'worlds')} aria-current={activeDock === 'worlds' ? 'location' : undefined}><span className="dock-number">02</span><span className="dock-label">CULTURE</span></a>
        <a href="#drop" className={activeDock === 'drop' ? 'dock-link dock-active' : 'dock-link'} onClick={(event) => navigateToSection(event, 'drop')} aria-current={activeDock === 'drop' ? 'location' : undefined}><span className="dock-number">03</span><span className="dock-label">EDIT</span></a>
        <a href="#campaign" className={activeDock === 'campaign' ? 'dock-link dock-active' : 'dock-link'} onClick={(event) => navigateToSection(event, 'campaign')} aria-current={activeDock === 'campaign' ? 'location' : undefined}><span className="dock-number">04</span><span className="dock-label">LIFE</span></a>
        <a href="#about" className={activeDock === 'about' ? 'dock-link dock-active' : 'dock-link'} onClick={(event) => navigateToSection(event, 'about')} aria-current={activeDock === 'about' ? 'location' : undefined}><span className="dock-number">05</span><span className="dock-label">ABOUT</span></a>
        <a href="#closing" className={activeDock === 'closing' ? 'dock-link dock-active' : 'dock-link'} onClick={(event) => navigateToSection(event, 'closing')} aria-current={activeDock === 'closing' ? 'location' : undefined}><span className="dock-number">06</span><span className="dock-label">JOIN</span></a>
        <a href="#footer" className={activeDock === 'footer' ? 'dock-link dock-active' : 'dock-link'} onClick={(event) => navigateToSection(event, 'footer')} aria-current={activeDock === 'footer' ? 'location' : undefined}><span className="dock-number">07</span><span className="dock-label">INFO</span></a>
      </nav>
      <footer className="footer" id="footer">
        <div className="footer-main">
          <div className="footer-brand-column">
            <a className="footer-logo" href="#home" aria-label="UNIPARC home"><img className="brand-logo footer-brand-logo" src="/Uniparc.svg" alt="UNIPARC" /></a>
            <p className="footer-manifesto">A culture-first label for every side of you.</p>
            <span className="footer-signoff">WEAR WHAT DEFINES YOU.®</span>
          </div>
          <div className="footer-column"><span className="footer-heading">EXPLORE</span><a href="#manifesto">THE IDEA <span>01</span></a><a href="#worlds">CULTURE INDEX <span>02</span></a><a href="#drop">THE UNIPARC EDIT <span>03</span></a><a href="#about">OUR STORY <span>05</span></a></div>
          <div className="footer-column"><span className="footer-heading">THE UNIVERSE</span><a href="#worlds">ANIME & MANGA</a><a href="#worlds">GAMING</a><a href="#worlds">FILM & SCREEN</a><a href="#worlds">MUSIC & MORE</a></div>
          <div className="footer-note-column"><span className="footer-heading">A PLACE WHERE CULTURE BELONGS.</span><p>From the stories you follow to the worlds you explore, there's room for every side of you here.</p><a href="#drop" className="footer-discover">DISCOVER THE EDIT ↗</a></div>
        </div>
        <div className="footer-bottom"><span>© UNIPARC 2026. ALL RIGHTS RESERVED.</span><span>INDEPENDENT CULTURE / EST. 2026</span><a href="#home" className="footer-top">BACK TO TOP ↑</a></div>
      </footer>
    </div>
  );
}
