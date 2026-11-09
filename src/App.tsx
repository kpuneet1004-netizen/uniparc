import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const worlds = [
  { id: 'anime', number: '01', name: 'ANIME / MANGA', note: 'Stories that stay with you', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1400&q=88', tag: 'THE ART OF OBSESSION' },
  { id: 'gaming', number: '02', name: 'GAMES / PLAY', note: 'Your next life starts here', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=88', tag: 'PRESS START / REPEAT' },
  { id: 'screen', number: '03', name: 'FILM / SCREEN', note: 'For the ones who know the lore', image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1400&q=88', tag: 'STAY FOR THE CREDITS' },
  { id: 'sound', number: '04', name: 'MUSIC / SOUND', note: 'Wear your soundtrack', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=88', tag: 'FEEL EVERY FREQUENCY' },
];

const pieces = [
  { id: '01', name: 'GORGON / 001', category: 'APPAREL', label: 'BEAUTY WITH A BITE', color: 'violet', image: '/images/objects/gorgon-001.webp' },
  { id: '02', name: 'HELLBOY / 002', category: 'APPAREL', label: 'RESEARCH. CONTAIN. DEFEND.', color: 'orange', image: '/images/objects/hellboy-002.webp' },
  { id: '03', name: 'SERIOUS / 003', category: 'APPAREL', label: 'NOT EVERYTHING IS THAT DEEP', color: 'lime', image: '/images/objects/serious-003.webp' },
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
  const lenisRef = useRef<Lenis | null>(null);
  const navDockRef = useRef<HTMLElement | null>(null);
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
      if (reduceMotion) {
        gsap.set('.hero-kicker, .hero-line, .hero-foot, .hero-visual', { y: 0, autoAlpha: 1 });
      } else {
        gsap.fromTo('.hero-kicker, .hero-line, .hero-foot, .hero-visual',
          { y: 28, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.85, stagger: 0.09, ease: 'power3.out' }
        );
      }

      if (!reduceMotion) {
        gsap.to('.hero-visual img', { xPercent: 2, yPercent: 3, scale: 1.07, duration: 18, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.to('.hero-title .outline-word', { xPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 } });
        gsap.to('.orbit-stamp', { rotate: 360, duration: 22, repeat: -1, ease: 'none' });
        gsap.to('.manifesto-ghost', { xPercent: -18, ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'top bottom', end: 'bottom top', scrub: 1 } });
        gsap.utils.toArray<HTMLElement>('.reveal-up').forEach((el) => {
          gsap.fromTo(el, { y: 72, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.05, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        });
        gsap.utils.toArray<HTMLElement>('.world-card').forEach((card) => {
          gsap.fromTo(card, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: '.worlds', start: 'top 65%', once: true } });
          const image = card.querySelector('img');
          if (image) gsap.to(image, { scale: 1.12, yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.worlds', start: 'top bottom', end: 'bottom top', scrub: 1 } });
        });
        gsap.utils.toArray<HTMLElement>('.section-label, .manifesto-grid, .filter-bar, .about-side, .about-main').forEach((el) => {
          gsap.fromTo(el, { y: 42, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        });
        gsap.utils.toArray<HTMLElement>('.piece-image').forEach((el) => {
          gsap.fromTo(el, { clipPath: 'inset(12% 0 12% 0)' }, { clipPath: 'inset(0% 0 0% 0)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 42%', scrub: 0.7 } });
        });
        gsap.utils.toArray<HTMLElement>('.piece-card').forEach((card, i) => {
          gsap.fromTo(card, { y: 90, autoAlpha: 0, rotate: i === 1 ? 2 : -1 }, { y: 0, autoAlpha: 1, rotate: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 88%', once: true } });
        });
        const cinematicScroll = gsap.matchMedia();
        cinematicScroll.add('(min-width: 1000px)', () => {
          const worldTrack = document.querySelector<HTMLElement>('.world-grid');
          const worldSection = document.querySelector<HTMLElement>('.worlds');
          let horizontalTween: gsap.core.Tween | undefined;
          if (worldTrack && worldSection) {
            horizontalTween = gsap.to(worldTrack, {
              x: () => -(worldTrack.scrollWidth - window.innerWidth + window.innerWidth * 0.08),
              ease: 'none',
              scrollTrigger: {
                trigger: worldSection,
                start: 'top top',
                end: () => '+=' + Math.max(900, worldTrack.scrollWidth - window.innerWidth + window.innerWidth * 0.08),
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            });
          }
          const chapter = gsap.timeline({
            scrollTrigger: { trigger: '.campaign', start: 'top top', end: '+=95%', pin: true, scrub: 1, anticipatePin: 1 },
          });
          chapter.fromTo('.campaign-image', { scale: 1.28 }, { scale: 1, ease: 'none' }, 0)
            .fromTo('.campaign-content', { y: 80, autoAlpha: 0.65 }, { y: -18, autoAlpha: 1, ease: 'none' }, 0)
            .fromTo('.campaign-mark', { y: 34, autoAlpha: 0.25 }, { y: -24, autoAlpha: 1, ease: 'none' }, 0);
          return () => { chapter.scrollTrigger?.kill(); horizontalTween?.scrollTrigger?.kill(); horizontalTween?.kill(); };
        });
        cinematicScroll.add('(max-width: 999px)', () => {
          gsap.fromTo('.campaign-image', { scale: 1.16 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.campaign', start: 'top bottom', end: 'bottom top', scrub: true } });
        });
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
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (reduceMotion || !finePointer) return;

    const heroVisual = rootRef.current?.querySelector<HTMLElement>('.hero-visual');
    const hero = rootRef.current?.querySelector<HTMLElement>('.hero');
    const cleanups: Array<() => void> = [];

    if (heroVisual && hero) {
      const rotateX = gsap.quickTo(heroVisual, 'rotationX', { duration: 0.7, ease: 'power3.out' });
      const rotateY = gsap.quickTo(heroVisual, 'rotationY', { duration: 0.7, ease: 'power3.out' });
      const moveX = gsap.quickTo(heroVisual, 'x', { duration: 0.7, ease: 'power3.out' });
      const moveY = gsap.quickTo(heroVisual, 'y', { duration: 0.7, ease: 'power3.out' });
      const onMove = (event: PointerEvent) => {
        const bounds = hero.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        rotateX(y * -3.5);
        rotateY(x * 4.5);
        moveX(x * 4);
        moveY(y * 4);
      };
      const onLeave = () => { rotateX(0); rotateY(0); moveX(0); moveY(0); };
      hero.addEventListener('pointermove', onMove);
      hero.addEventListener('pointerleave', onLeave);
      cleanups.push(() => { hero.removeEventListener('pointermove', onMove); hero.removeEventListener('pointerleave', onLeave); gsap.set(heroVisual, { clearProps: 'transform' }); });
    }

    const cards = rootRef.current?.querySelectorAll<HTMLElement>('.world-card, .piece-card');
    cards?.forEach((card) => {
      const surface = card.classList.contains('world-card') ? card : card.querySelector<HTMLElement>('.piece-image');
      if (!surface) return;
      const rotateX = gsap.quickTo(surface, 'rotationX', { duration: 0.45, ease: 'power3.out' });
      const rotateY = gsap.quickTo(surface, 'rotationY', { duration: 0.45, ease: 'power3.out' });
      const onMove = (event: PointerEvent) => {
        const bounds = surface.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        rotateX(y * -5);
        rotateY(x * 6);
      };
      const onLeave = () => { rotateX(0); rotateY(0); };
      surface.addEventListener('pointermove', onMove);
      surface.addEventListener('pointerleave', onLeave);
      cleanups.push(() => { surface.removeEventListener('pointermove', onMove); surface.removeEventListener('pointerleave', onLeave); gsap.set(surface, { clearProps: 'transform' }); });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
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
          <div className="hero-layout">
          <div className="hero-copy">
            <p className="eyebrow hero-kicker">ALL THE THINGS THAT MAKE YOU, YOU.</p>
            <h1 className="hero-title masked-reveal"><span className="hero-line">WEAR WHAT</span><span className="hero-line"><em className="outline-word">DEFINES</em> YOU<span className="period">.</span></span></h1>
            <div className="hero-foot hero-kicker"><p>The stories you follow. The games you play. The music you live by. UNIPARC brings the worlds you love into what you wear.</p><a className="scroll-cue" href="#manifesto" data-cursor-label="SCROLL TO EXPLORE"><span>EXPLORE THE UNIVERSE</span><b>↓</b></a></div>
          </div>
          <div className="hero-visual">
            <img src="/images/hero/uniparc-hero.webp" alt="UNIPARC black graphic T-shirt editorial campaign" fetchPriority="high" decoding="async" />
            <div className="hero-visual-wash" /><span className="visual-coordinate">FIG. 001 — THE EVERYDAY UNIVERSE</span>
            <div className="hero-image-caption"><span>UNIPARC / CULTURE STUDY 001</span><span>MADE TO FEEL LIKE YOU.</span></div>
            <div className="orbit-stamp"><svg viewBox="0 0 120 120" role="img" aria-label="Wear what defines you"><defs><path id="stamp-circle" d="M60,60 m-43,0 a43,43 0 1,1 86,0 a43,43 0 1,1 -86,0" /></defs><text><textPath href="#stamp-circle">CULTURE LIVES HERE ✳ WEAR WHAT DEFINES YOU ✳ </textPath></text><circle cx="60" cy="60" r="25" /><path d="M47 69V50l13 10 13-10v19" /></svg></div>
          </div>
          </div>
          <div className="ticker"><div>ANIME IS CULTURE <b>✳</b> GAMING IS CULTURE <b>✳</b> MUSIC IS CULTURE <b>✳</b> FILM IS CULTURE <b>✳</b> INTERNET IS CULTURE <b>✳</b> ANIME IS CULTURE <b>✳</b> GAMING IS CULTURE <b>✳</b> MUSIC IS CULTURE <b>✳</b> FILM IS CULTURE <b>✳</b> INTERNET IS CULTURE <b>✳</b></div></div>
        </section>

        <section className="manifesto section" id="manifesto">
          <div className="section-label"><span>01 / THE IDEA</span><span>A PLACE WHERE CULTURE BELONGS</span></div>
          <div className="manifesto-ghost" aria-hidden="true">MULTIDIMENSIONAL</div>
          <div className="manifesto-grid">
            <div className="manifesto-heading reveal-up">
              <span className="eyebrow dark-eyebrow manifesto-kicker"><i aria-hidden="true" />YOU DON'T HAVE TO PICK JUST ONE</span>
              <h2 className="masked-reveal">YOU ARE<br />NOT JUST<br /><em>ONE THING</em><span className="period">.</span></h2>
            </div>
            <div className="manifesto-side">
              <figure className="manifesto-image reveal-up">
                <img src={worlds[3].image} alt="A live music crowd, one of the many cultural worlds that shape identity" loading="lazy" decoding="async" />
                <figcaption><span>FIG. 01 — CULTURE IN EVERY DIRECTION</span><span>IND / 2026</span></figcaption>
              </figure>
              <div className="manifesto-text reveal-up">
                <p className="lead">Your style can hold every side of you.</p>
                <p>Maybe it's a manga you grew up with. A game you lose hours to. A lyric that says what you couldn't. A film you return to. The things you love are part of your story — and they deserve a place in it.</p>
                <p>UNIPARC brings those worlds together in one place. Explore what you love, find familiar energy and make room for something new. No gatekeeping. No need to choose just one.</p>
                <a className="text-link" href="#about">WHY UNIPARC EXISTS <Arrow diagonal /></a>
              </div>
            </div>
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
          <div className="filter-bar" role="group" aria-label="Filter collection">{['ALL', 'APPAREL'].map((filter) => <button key={filter} type="button" className={activeFilter === filter ? 'selected' : ''} aria-pressed={activeFilter === filter} onClick={() => setActiveFilter(filter)}>{filter}<sup>03</sup></button>)}<span>CONCEPT PREVIEW / 2026</span></div>
          <div className="piece-grid">{filtered.map((piece) => <article className="piece-card" key={piece.id} data-cursor-label="VIEW OBJECT"><div className={'piece-image ' + piece.color}><img src={piece.image} alt={"UNIPARC " + piece.name + " graphic T-shirt concept"} loading="lazy" decoding="async" /><span className="piece-index">OBJECT / {piece.id}</span><span className="piece-arrow"><Arrow diagonal /></span><span className="piece-caption">{piece.label}</span><span className="piece-hover-label">DISCOVER THE PIECE ↗</span><button className="piece-open" onClick={() => { setSelectedPiece(piece); setWaitlistNotice(""); }} aria-label={"Discover " + piece.name}>OPEN OBJECT</button></div><div className="piece-meta"><span>{piece.name}</span><span>{piece.category}</span></div></article>)}</div>
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
          <img src={selectedPiece.image} alt={"UNIPARC " + selectedPiece.name + " graphic T-shirt preview"} />
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
