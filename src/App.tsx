import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
const CinematicIntroScene = lazy(() => import('./components/CinematicIntroScene'));

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

function persistIntroSeen() {
  try {
    window.localStorage.setItem('uniparc-intro-seen', '1');
  } catch {
    // The intro must still finish when storage is blocked.
  }
}

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const introTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const navDockRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const pieceTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(() => {
    try {
      return window.localStorage.getItem('uniparc-intro-seen') === '1';
    } catch {
      return false;
    }
  });
  const [activeDock, setActiveDock] = useState('home');
  const [activeWorld, setActiveWorld] = useState(worlds[0]);
  const [activeChapter, setActiveChapter] = useState('01 / THE IDEA');
  const [selectedPiece, setSelectedPiece] = useState<(typeof pieces)[number] | null>(null);
  const navigateToSection = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    // Keep section navigation shareable and preserve the current destination in the URL.
    window.history.pushState(null, '', `#${id}`);
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
    // Preserve incoming section links and restore the destination on browser Back/Forward.
    const scrollToHash = (behavior: ScrollBehavior = 'auto') => {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ''));
      if (!id) {
        if (lenisRef.current && behavior !== 'auto') lenisRef.current.scrollTo(0, { duration: 1, force: true });
        else if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true, force: true });
        else window.scrollTo({ top: 0, behavior });
        setActiveDock('home');
        return;
      }
      const target = document.getElementById(id);
      if (!target) return;
      const destination = Math.max(0, window.scrollY + target.getBoundingClientRect().top - 24);
      if (lenisRef.current && behavior !== 'auto') {
        lenisRef.current.scrollTo(destination, { duration: 1, force: true });
      } else if (lenisRef.current) {
        lenisRef.current.scrollTo(destination, { immediate: true, force: true });
      } else {
        window.scrollTo({ top: destination, behavior });
      }
      setActiveDock(id);
    };
    const onPopState = () => scrollToHash(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
    window.addEventListener('popstate', onPopState);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = reduceMotion ? null : new Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 0.95, anchors: { offset: -24 } });
    lenisRef.current = lenis;
    // Let React mount the target section before resolving an incoming hash URL.
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToHash('auto')));
    let lenisTick: ((time: number) => void) | undefined;
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      lenisTick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(lenisTick);
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      const finishIntro = () => {
        if (!window.location.hash) {
          window.scrollTo(0, 0);
          lenisRef.current?.scrollTo(0, { immediate: true, force: true });
        }
        setActiveDock(window.location.hash.slice(1) || 'home');
        persistIntroSeen();
        setIsLoaded(true);
      };
      const intro = gsap.timeline({ defaults: { ease: 'power3.inOut' }, onComplete: finishIntro });
      introTimelineRef.current = intro;
      if (isLoaded || reduceMotion) {
        intro.set('.preloader', { autoAlpha: 0 });
      } else {
        intro.set('.cosmic-stage', { autoAlpha: 1 })
          .to({}, { duration: 1.5, ease: 'none' })
          .fromTo('.cosmic-wordmark', { scale: .72, y: 20, autoAlpha: 0, filter: 'blur(18px)' }, { scale: 1, y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: .8, ease: 'expo.out' }, '-=.05')
          .to('.cosmic-wordmark', { autoAlpha: 0, y: -18, duration: .35, delay: .15 })
          .to('.preloader', { yPercent: -100, duration: .65, ease: 'power4.inOut' })
          .fromTo('.hero-kicker, .hero-line, .hero-foot, .hero-visual', { y: 36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .65, stagger: .06, ease: 'power3.out' }, '-=.3');
      }

      if (!reduceMotion) {
        gsap.to('.hero-visual img', { yPercent: 13, scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.hero-visual', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('.hero-title .hero-line-outline', { xPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 } });
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
        gsap.fromTo('.closing-title', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: '.closing', start: 'top 75%', once: true } });
        gsap.utils.toArray<HTMLElement>('.masked-reveal').forEach((el) => gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)', y: 34 }, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1.15, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 86%', once: true } }));
        const chapters = [{ selector: '.manifesto', label: '01 / THE IDEA' }, { selector: '.worlds', label: '02 / FIND YOUR FREQUENCY' }, { selector: '.drop', label: '03 / THE UNIPARC EDIT' }, { selector: '.about', label: '04 / OUR POINT OF VIEW' }];
        chapters.forEach(({ selector, label }) => ScrollTrigger.create({ trigger: selector, start: 'top 45%', end: 'bottom 45%', onEnter: () => setActiveChapter(label), onEnterBack: () => setActiveChapter(label) }));
        gsap.to('.manifesto-ghost', { yPercent: 16, ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
      }
    }, rootRef);

    return () => {
      ctx.revert();
      window.removeEventListener('popstate', onPopState);
      lenisRef.current = null;
      if (lenis) {
        if (lenisTick) gsap.ticker.remove(lenisTick);
        lenis.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const targets = ['home', 'manifesto', 'worlds', 'drop', 'about', 'closing', 'footer']
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
    const main = rootRef.current?.querySelector('main');
    const footer = rootRef.current?.querySelector('footer');
    const nav = navDockRef.current;
    const previousInert = [main, footer, nav].map((element) => element?.inert ?? false);
    [main, footer, nav].forEach((element) => { if (element) element.inert = true; });
    document.body.style.overflow = 'hidden';

    const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusFrame = requestAnimationFrame(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>(focusableSelector);
      (first || dialogRef.current)?.focus();
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setSelectedPiece(null);
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      [main, footer, nav].forEach((element, index) => { if (element) element.inert = previousInert[index]; });
      window.removeEventListener('keydown', onKeyDown);
      requestAnimationFrame(() => pieceTriggerRef.current?.focus());
    };
  }, [selectedPiece]);

  return (
    <div className="site editorial-site" ref={rootRef}>
      <div className={isLoaded ? 'preloader preloader-out' : 'preloader'} aria-hidden={isLoaded}>
        <div className="cosmic-stage">
          {!isLoaded && <Suspense fallback={null}><CinematicIntroScene /></Suspense>}
          <div className="cosmic-wordmark"><img className="brand-logo preloader-logo" src="/Uniparc.svg" alt="UNIPARC" /><span>WEAR WHAT DEFINES YOU.</span></div>
          <div className="cosmic-caption"><span>ONE UNIVERSE. INFINITE CULTURES.</span><span>UNIPARC® / 001</span></div>
          <button className="skip-intro" type="button" onClick={() => introTimelineRef.current?.progress(1)}>SKIP INTRO <span aria-hidden="true">↗</span></button>
        </div>
      </div>

      <div className="cursor-aura" ref={cursorRef} aria-hidden="true" />
      <div className="cursor-dot" ref={cursorDotRef} aria-hidden="true" />
      <div className="scroll-progress" aria-hidden="true"><span /></div>
      <aside className="chapter-index" aria-live="polite"><span className="chapter-index-dot" /><span>{activeChapter}</span><span className="chapter-index-rule" /></aside>

      <header className="topbar editorial-topbar">
        <a className="wordmark" href="#home" aria-label="UNIPARC home"><img className="brand-logo header-logo" src="/Uniparc.svg" alt="UNIPARC" /></a>
        <span className="topbar-edition">INDEPENDENT CULTURE LABEL <i>✳</i> ISSUE 001</span>
        <a className="topbar-cta" href="#drop">DISCOVER THE EDIT <Arrow diagonal /></a>
      </header>

      <main className="editorial-main">
        <section className="hero editorial-hero" id="home">
          <div className="hero-editorial-top"><span>01 — EVERYDAY UNIVERSE</span><span>MADE OF WHAT YOU LOVE.</span></div>
          <div className="hero-copy">
            <p className="hero-overline"><span>THE CULTURE YOU CARRY</span><span>EST. 2026 / INDIA</span></p>
            <h1 className="hero-title masked-reveal"><span className="hero-line">CULTURE</span><span className="hero-line hero-line-outline">IS YOURS</span><span className="hero-line">TO WEAR<span className="period">.</span></span></h1>
            <div className="hero-foot hero-kicker">
              <p>From the stories you follow to the worlds you escape into. The things you love are part of you. Wear them like it.</p>
              <a className="scroll-cue" href="#manifesto"><span>ENTER THE UNIVERSE</span><b aria-hidden="true">↓</b></a>
            </div>
          </div>
          <figure className="hero-visual">
            <img src="/images/hero/uniparc-hero.webp" alt="UNIPARC graphic T-shirt in an editorial campaign" fetchPriority="high" decoding="async" />
            <div className="hero-visual-wash" />
            <div className="orbit-stamp" aria-hidden="true"><svg viewBox="0 0 120 120"><defs><path id="stamp-circle" d="M60,60 m-43,0 a43,43 0 1,1 86,0 a43,43 0 1,1 -86,0" /></defs><text><textPath href="#stamp-circle">CULTURE LIVES HERE ✳ WEAR WHAT DEFINES YOU ✳ </textPath></text><circle cx="60" cy="60" r="25" /><path d="M47 69V50l13 10 13-10v19" /></svg></div>
            <figcaption className="hero-image-caption"><span>UNIPARC® / OBJECT STUDY 001</span><span>EVERY SIDE. ONE UNIVERSE.</span></figcaption>
            <span className="hero-image-index" aria-hidden="true">VOL. 001</span>
          </figure>
          <div className="hero-bottomline"><span>AN INDEPENDENT CULTURE LABEL</span><span>SCROLL TO EXPLORE <b>↓</b></span><span>13° 55' N / 75° 34' E</span></div>
          <div className="ticker"><div>ANIME IS CULTURE <b>✳</b> GAMING IS CULTURE <b>✳</b> MUSIC IS CULTURE <b>✳</b> FILM IS CULTURE <b>✳</b> INTERNET IS CULTURE <b>✳</b> ANIME IS CULTURE <b>✳</b> GAMING IS CULTURE <b>✳</b> MUSIC IS CULTURE <b>✳</b> FILM IS CULTURE <b>✳</b> INTERNET IS CULTURE <b>✳</b></div></div>
        </section>

        <section className="manifesto section editorial-manifesto" id="manifesto">
          <div className="section-label"><span>01 / THE IDEA</span><span>A PLACE WHERE CULTURE BELONGS</span></div>
          <div className="manifesto-ghost" aria-hidden="true">MULTIDIMENSIONAL</div>
          <div className="manifesto-grid">
            <div className="manifesto-copy reveal-up">
              <div className="manifesto-heading"><span className="eyebrow dark-eyebrow">YOU DON'T HAVE TO PICK JUST ONE</span><h2 className="masked-reveal">YOU ARE<br />MORE THAN<br /><em>ONE THING</em><span className="period">.</span></h2></div>
            </div>
            <div className="manifesto-text reveal-up"><p className="lead">Your identity was never one-dimensional. Your style shouldn't be either.</p><p>Maybe it's a manga you grew up with. A game you lose hours to. A lyric that says what you couldn't. A film you return to. The things you love are part of your story — and they deserve a place in it.</p><p>UNIPARC brings those worlds together in one place. No gatekeeping. No boxes. No need to choose just one.</p><a className="text-link" href="#about">THE THINKING BEHIND IT <Arrow diagonal /></a></div>
          </div>
          <div className="manifesto-visual reveal-up"><img src="/images/hero/uniparc-hero.webp" alt="Close detail of UNIPARC apparel artwork" loading="lazy" decoding="async" /><div><span>FIG. 001</span><strong>ONE PERSON.<br />MANY UNIVERSES.</strong></div></div>
          <div className="manifesto-foot"><span>IDENTITY IS NOT A CATEGORY.</span><span>WEAR WHAT DEFINES YOU.®</span><span>UNIPARC / 001</span></div>
        </section>

        <section className="worlds section editorial-worlds" id="worlds" style={{ "--ambient-tint": activeWorld.id === "anime" ? "#b8a2ff" : activeWorld.id === "gaming" ? "#d9f36a" : activeWorld.id === "screen" ? "#ff8a68" : "#8dbdff" } as React.CSSProperties & { "--ambient-tint": string }}>
          <div className="section-label"><span>02 / CULTURE INDEX</span><span>FIND YOUR FREQUENCY</span></div>
          <div className="section-heading reveal-up"><div><span className="eyebrow">A UNIVERSE OF INTERESTS</span><h2 className="masked-reveal">WHAT MOVES<br /><em>YOU?</em></h2></div><p>Four starting points. Infinite rabbit holes.<br />Explore the things that make you, you.</p></div>
          <div className="world-atmosphere-label"><span>NOW TUNED TO</span><strong>{activeWorld.name}</strong><small>{activeWorld.note}</small></div>
          <div className="world-grid">
            {worlds.map((world, index) => <a className={'world-card world-' + world.id + (index === 0 ? ' world-featured' : '')} href="#worlds" key={world.id} aria-label={'Select ' + world.name + ' culture'} aria-current={activeWorld.id === world.id ? 'true' : undefined} data-cursor-label="SELECT WORLD" onClick={(event) => { event.preventDefault(); setActiveWorld(world); }} onMouseEnter={() => setActiveWorld(world)} onFocus={() => setActiveWorld(world)}>
              <img src={world.image} alt="" loading="lazy" decoding="async" /><span className="world-shade" /><span className="world-number">{world.number} / CULTURE INDEX</span><span className="world-tag">{world.tag}</span><span className="world-outline" aria-hidden="true">{world.number}</span><span className="world-info"><span><strong>{world.name}</strong><small>{world.note}</small></span><b><Arrow diagonal /></b></span>
            </a>)}
          </div>
          <div className="world-explore-panel" aria-live="polite"><span className="world-explore-index">CURRENT FREQUENCY / {activeWorld.number}</span><p><strong>{activeWorld.name}</strong> — {activeWorld.note}. Explore the current UNIPARC edit and discover the pieces taking shape.</p><a href="#drop">EXPLORE THE EDIT <Arrow diagonal /></a></div>
          <p className="worlds-note">THAT'S ONLY THE START. THERE'S ALWAYS MORE TO DISCOVER. <span>↘</span></p>
        </section>

        <section className="drop section editorial-drop" id="drop">
          <div className="section-label"><span>03 / THE UNIPARC EDIT</span><span>OBJECTS WITH A POINT OF VIEW</span></div>
          <div className="section-heading drop-heading reveal-up"><div><span className="eyebrow">FIRST LOOK / CONCEPT ARCHIVE</span><h2 className="masked-reveal">NOT JUST<br /><em>ANOTHER TEE.</em></h2></div><p>Graphic pieces shaped by the references,<br />stories and details we keep close.</p></div>
          <div className="drop-intro-line"><span>THE FIRST THREE OBJECTS</span><span>COLLECTION 001 <i>—</i> 2026</span></div>
          <div className="piece-grid">{pieces.map((piece, index) => <article className={'piece-card piece-card-' + (index + 1)} key={piece.id} data-cursor-label="VIEW OBJECT">
            <div className={'piece-image ' + piece.color}><img src={piece.image} alt={piece.name + ' — ' + piece.label} loading="lazy" decoding="async" /><span className="piece-index">OBJECT / {piece.id}</span><span className="piece-arrow"><Arrow diagonal /></span><span className="piece-caption">{piece.label}</span><span className="piece-hover-label">DISCOVER THE PIECE ↗</span><button className="piece-open" onClick={(event) => { pieceTriggerRef.current = event.currentTarget; setSelectedPiece(piece); }} aria-label={"Discover " + piece.name}>OPEN OBJECT</button></div>
            <div className="piece-meta"><span>{piece.name}</span><span>{piece.category}</span></div>
          </article>)}</div>
          <p className="drop-disclaimer">CONCEPT PREVIEW ONLY. FINAL PRODUCT DETAILS AND RELEASE INFORMATION WILL BE SHARED AT LAUNCH.</p>
        </section>

        <section className="about section editorial-about" id="about">
          <div className="section-label"><span>04 / OUR POINT OF VIEW</span><span>THE REASON WE EXIST</span></div>
          <div className="about-layout">
            <div className="about-side"><span className="eyebrow dark-eyebrow">A PLACE WHERE CULTURE BELONGS</span><img className="about-logo" src="/Uniparc.svg" alt="UNIPARC emblem and wordmark" /><span className="about-side-note">INDEPENDENT CULTURE LABEL<br />EST. 2026</span></div>
            <div className="about-main reveal-up"><h2>MORE THAN<br />WHAT YOU <em>WEAR.</em></h2><p className="lead">A place for every interest, influence and side of you.</p><p>UNIPARC is a culture-first lifestyle label for people who don't fit into just one category. We bring fandoms, niche interests and everyday inspirations into a shared space for self-expression and belonging.</p><p>Our first pieces are graphic T-shirts — understated from a distance, full of meaning up close. It's the beginning of a wider world built around the things you love.</p><strong>NO GATEKEEPING. NO BOXES TO FIT. JUST ROOM TO BE YOU.</strong></div>
          </div>
        </section>

        <section className="closing section editorial-closing" id="closing">
          <span className="eyebrow">THERE'S ROOM FOR YOU HERE</span><h2 className="closing-title">FIND YOUR<br /><em>UNIVERSE.</em></h2><div className="closing-bottom"><p>The first UNIPARC drop is in the works. Check back soon for the first release details.</p><div><a className="closing-link" href="#home">RETURN TO THE TOP ↑</a><a className="closing-primary-link" href="#drop">EXPLORE THE FIRST EDIT <Arrow diagonal /></a></div></div><span className="closing-orbit" aria-hidden="true">U✳</span>
        </section>
      </main>

      {selectedPiece && <div className="object-modal" ref={dialogRef} data-lenis-prevent role="dialog" aria-modal="true" aria-labelledby="object-title" tabIndex={-1} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedPiece(null); }}><article className="object-modal-panel">
        <div className="object-modal-visual"><img src={selectedPiece.image} alt={"Editorial preview for " + selectedPiece.name} /><span className="object-visual-index">UNIPARC® <i> / </i> OBJECT STUDY {selectedPiece.id}</span><span className="object-visual-note">THE UNIPARC EDIT <b>2026</b></span></div>
        <div className="object-modal-content" data-lenis-prevent>
          <div className="object-modal-topline"><span>OBJECT FILE <b>{selectedPiece.id} / 03</b></span><button className="object-close" onClick={() => setSelectedPiece(null)} aria-label="Close object preview">CLOSE <span>×</span></button></div>
          <div className="object-modal-intro"><span className="object-modal-kicker">{selectedPiece.category} <i>—</i> {selectedPiece.label}</span><h2 id="object-title">{selectedPiece.name}</h2><p>A wearable expression of the worlds, stories and details that stay with you. This concept is part of the evolving UNIPARC universe — made for every side of you.</p></div>
          <div className="object-detail-block"><div className="object-detail-heading"><span>01</span><b>THE DETAILS</b><i>CONCEPT PREVIEW</i></div><dl className="object-detail-list"><div><dt>DESIGN INTENT</dt><dd>IDENTITY / EXPRESSION</dd></div><div><dt>COLLECTION</dt><dd>THE UNIPARC EDIT</dd></div><div><dt>MATERIAL & FIT</dt><dd>TO BE ANNOUNCED</dd></div><div><dt>RELEASE WINDOW</dt><dd>FIRST DROP / 2026</dd></div></dl></div>
          <div className="object-modal-release"><span className="object-modal-kicker">THE FIRST UNIPARC DROP</span><h3>More to come.</h3><p>This is an early concept preview. Final product details, availability and release information will be published when the collection is ready.</p><button className="object-modal-discover" type="button" onClick={() => setSelectedPiece(null)}>BACK TO THE EDIT <Arrow diagonal /></button></div>
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
        <a href="#about" className={activeDock === 'about' ? 'dock-link dock-active' : 'dock-link'} onClick={(event) => navigateToSection(event, 'about')} aria-current={activeDock === 'about' ? 'location' : undefined}><span className="dock-number">04</span><span className="dock-label">ABOUT</span></a>
        <a href="#closing" className={activeDock === 'closing' ? 'dock-link dock-active' : 'dock-link'} onClick={(event) => navigateToSection(event, 'closing')} aria-current={activeDock === 'closing' ? 'location' : undefined}><span className="dock-number">06</span><span className="dock-label">NEXT</span></a>
        <a href="#footer" className={activeDock === 'footer' ? 'dock-link dock-active' : 'dock-link'} onClick={(event) => navigateToSection(event, 'footer')} aria-current={activeDock === 'footer' ? 'location' : undefined}><span className="dock-number">07</span><span className="dock-label">INFO</span></a>
      </nav>

      <footer className="footer editorial-footer" id="footer">
        <div className="footer-main">
          <div className="footer-brand-column"><a className="footer-logo" href="#home" aria-label="UNIPARC home"><img className="brand-logo footer-brand-logo" src="/Uniparc.svg" alt="UNIPARC" /></a><p className="footer-manifesto">A culture-first label for every side of you.</p><span className="footer-signoff">WEAR WHAT DEFINES YOU.®</span></div>
          <div className="footer-column"><span className="footer-heading">EXPLORE</span><a href="#manifesto">THE IDEA <span>01</span></a><a href="#worlds">CULTURE INDEX <span>02</span></a><a href="#drop">THE UNIPARC EDIT <span>03</span></a><a href="#about">OUR STORY <span>04</span></a></div>
          <div className="footer-column"><span className="footer-heading">THE UNIVERSE</span><a href="#worlds">ANIME & MANGA</a><a href="#worlds">GAMING</a><a href="#worlds">FILM & SCREEN</a><a href="#worlds">MUSIC & MORE</a></div>
          <div className="footer-note-column"><span className="footer-heading">A PLACE WHERE CULTURE BELONGS.</span><p>From the stories you follow to the worlds you explore, there's room for every side of you here.</p><a href="#drop" className="footer-discover">DISCOVER THE EDIT ↗</a></div>
        </div>
        <div className="footer-bottom"><span>© UNIPARC 2026. ALL RIGHTS RESERVED.</span><span>INDEPENDENT CULTURE / EST. 2026</span><a href="#home" className="footer-top">BACK TO TOP ↑</a></div>
      </footer>
    </div>
  );
}
