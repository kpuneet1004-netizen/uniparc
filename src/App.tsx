import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const CinematicIntroScene = lazy(() => import('./components/CinematicIntroScene'));
gsap.registerPlugin(ScrollTrigger);

const worlds = [
  { id: 'anime', no: '01', title: 'ANIME & MANGA', sub: 'Stories that stay with you', tag: 'DRAWN WORLDS', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1400&q=88' },
  { id: 'play', no: '02', title: 'GAMES & PLAY', sub: 'Your next life starts here', tag: 'PRESS START', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=88' },
  { id: 'screen', no: '03', title: 'FILM & SCREEN', sub: 'For the ones who know the lore', tag: 'STAY FOR THE CREDITS', image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1400&q=88' },
  { id: 'sound', no: '04', title: 'MUSIC & SOUND', sub: 'Wear your soundtrack', tag: 'FEEL THE FREQUENCY', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=88' },
];

const objects = [
  { no: '001', name: 'GORGON', descriptor: 'BEAUTY WITH A BITE', image: '/images/objects/gorgon-001.webp', tone: 'lilac' },
  { no: '002', name: 'HELLBOY', descriptor: 'RESEARCH. CONTAIN. DEFEND.', image: '/images/objects/hellboy-002.webp', tone: 'ember' },
  { no: '003', name: 'SERIOUS', descriptor: 'NOT EVERYTHING IS THAT DEEP', image: '/images/objects/serious-003.webp', tone: 'acid' },
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d={diagonal ? 'M5 15 15 5M6 5h9v9' : 'M3 10h13m-5-5 5 5-5 5'} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function markIntroSeen() {
  try { window.localStorage.setItem('uniparc-intro-seen', '1'); } catch { /* Storage is optional. */ }
}

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<gsap.core.Timeline | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [introSeen, setIntroSeen] = useState(() => {
    try { return window.localStorage.getItem('uniparc-intro-seen') === '1'; } catch { return false; }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState('THE UNIVERSE');
  const [activeWorld, setActiveWorld] = useState(worlds[0]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = reduceMotion ? null : new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 0.9, anchors: { offset: -80 } });
    lenisRef.current = lenis;
    let tick: ((time: number) => void) | undefined;
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      tick = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    const context = gsap.context(() => {
      const finishIntro = () => {
        markIntroSeen();
        setIntroSeen(true);
      };
      const timeline = gsap.timeline({ defaults: { ease: 'power3.inOut' }, onComplete: finishIntro });
      introRef.current = timeline;
      if (introSeen || reduceMotion) {
        timeline.set('.intro-screen', { autoAlpha: 0 });
        finishIntro();
      } else {
        timeline.set('.intro-screen', { autoAlpha: 1 })
          .to({}, { duration: 1.1 })
          .fromTo('.intro-lockup', { autoAlpha: 0, scale: 0.82, y: 24, filter: 'blur(16px)' }, { autoAlpha: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out' })
          .to('.intro-lockup', { autoAlpha: 0, y: -20, duration: 0.35, delay: 0.2 })
          .to('.intro-screen', { yPercent: -100, duration: 0.8, ease: 'power4.inOut' })
          .fromTo('.hero-copy, .hero-art, .hero-index', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, '-=0.35');
      }

      if (!reduceMotion) {
        gsap.to('.hero-art img', { yPercent: 12, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('.hero-ghost', { xPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
        gsap.utils.toArray<HTMLElement>('.reveal').forEach((element) => {
          gsap.fromTo(element, { y: 52, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } });
        });
        gsap.utils.toArray<HTMLElement>('.world-tile').forEach((element, index) => {
          gsap.fromTo(element, { y: 70, rotate: index % 2 ? 2 : -2, autoAlpha: 0 }, { y: 0, rotate: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 90%', once: true } });
          const image = element.querySelector('img');
          if (image) gsap.to(image, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
        gsap.utils.toArray<HTMLElement>('.object-card').forEach((element, index) => {
          gsap.fromTo(element, { y: 65, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, delay: index * 0.06, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 90%', once: true } });
        });
        gsap.utils.toArray<HTMLElement>('.clip-reveal').forEach((element) => {
          gsap.fromTo(element, { clipPath: 'inset(0 0 100% 0)', y: 24 }, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1.15, ease: 'power4.out', scrollTrigger: { trigger: element, start: 'top 86%', once: true } });
        });
        const chapters = [
          { selector: '#signal', label: 'THE IDEA' },
          { selector: '#worlds', label: 'CULTURE INDEX' },
          { selector: '#objects', label: 'THE FIRST EDIT' },
          { selector: '#about', label: 'OUR POINT OF VIEW' },
        ];
        chapters.forEach(({ selector, label }) => ScrollTrigger.create({
          trigger: selector, start: 'top 45%', end: 'bottom 45%',
          onEnter: () => setActiveChapter(label), onEnterBack: () => setActiveChapter(label),
        }));
      }
    }, rootRef);

    const onHash = () => setMenuOpen(false);
    window.addEventListener('hashchange', onHash);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      context.revert();
      window.removeEventListener('hashchange', onHash);
      lenisRef.current = null;
      if (lenis) {
        if (tick) gsap.ticker.remove(tick);
        lenis.destroy();
      }
    };
  }, []);

  const skipIntro = () => {
    if (introRef.current) introRef.current.progress(1);
    else { markIntroSeen(); setIntroSeen(true); }
  };

  return (
    <div className="site-shell" ref={rootRef}>
      <div className={introSeen ? 'intro-screen intro-screen-hidden' : 'intro-screen'} aria-hidden={introSeen}>
        {!introSeen && <Suspense fallback={null}><CinematicIntroScene /></Suspense>}
        <div className="intro-lockup"><img src="/Uniparc.svg" alt="UNIPARC" /><span>ONE UNIVERSE. INFINITE CULTURES.</span></div>
        <span className="intro-foot intro-foot-left">CULTURE IS A WAY OF LIFE</span>
        <span className="intro-foot intro-foot-right">UNIPARC® / 001</span>
        <button className="intro-skip" type="button" onClick={skipIntro}>SKIP INTRO <Arrow diagonal /></button>
      </div>

      <div className="chapter-rail" aria-live="polite"><span className="chapter-rail-dot" /><span>{activeChapter}</span><i /></div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="UNIPARC home"><img src="/Uniparc.svg" alt="UNIPARC" /></a>
        <span className="header-note">INDEPENDENT CULTURE LABEL <b>✳</b> ISSUE 001</span>
        <nav className={menuOpen ? 'primary-nav nav-open' : 'primary-nav'} aria-label="Main navigation">
          <a href="#worlds" onClick={() => setMenuOpen(false)}>THE WORLDS</a>
          <a href="#objects" onClick={() => setMenuOpen(false)}>THE EDIT</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>ABOUT</a>
        </nav>
        <a className="header-link" href="#objects">EXPLORE THE EDIT <Arrow diagonal /></a>
        <button className="menu-button" type="button" aria-expanded={menuOpen} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="hero-index"><span>01 — A DIFFERENT KIND OF LABEL</span><span>EST. 2026 / INDIA</span></div>
          <div className="hero-stage">
            <div className="hero-copy">
              <p className="eyebrow"><span className="eyebrow-dot" /> FOR THE CULTURE IN ALL OF US</p>
              <h1 className="clip-reveal">WEAR YOUR<br /><em>UNIVERSE.</em></h1>
              <div className="hero-bottom">
                <p>Not one thing. Not one fandom. Just everything that makes you, <strong>you.</strong></p>
                <a className="round-link" href="#signal" aria-label="Discover the UNIPARC idea"><span>SCROLL TO<br />DISCOVER</span><b>↓</b></a>
              </div>
            </div>
            <figure className="hero-art">
              <img src="/images/hero/uniparc-hero.webp" alt="UNIPARC apparel campaign artwork" fetchPriority="high" decoding="async" />
              <div className="hero-art-shade" />
              <span className="hero-art-label">UNIPARC® / OBJECT STUDY 001</span>
              <span className="hero-art-count">FIG. 001 — 026</span>
              <span className="hero-art-cross" aria-hidden="true">✳</span>
            </figure>
            <span className="hero-ghost" aria-hidden="true">YOUR WORLD</span>
          </div>
          <div className="hero-footerline"><span>AN INDEPENDENT CULTURE LABEL</span><span>13° 55' N / 75° 34' E</span><span>SCROLL TO EXPLORE ↘</span></div>
        </section>

        <div className="signal-strip" aria-label="Culture is everywhere"><div>ANIME IS CULTURE <b>✳</b> GAMES ARE CULTURE <b>✳</b> MUSIC IS CULTURE <b>✳</b> FILM IS CULTURE <b>✳</b> INTERNET IS CULTURE <b>✳</b> ANIME IS CULTURE <b>✳</b> GAMES ARE CULTURE <b>✳</b> MUSIC IS CULTURE <b>✳</b> FILM IS CULTURE <b>✳</b> INTERNET IS CULTURE <b>✳</b></div></div>

        <section className="signal-section" id="signal">
          <div className="section-meta reveal"><span>01 / THE IDEA</span><span>NO BOXES. NO SINGLE STORY.</span></div>
          <div className="signal-layout">
            <div className="signal-title reveal"><p className="eyebrow">A PLACE WHERE CULTURE BELONGS</p><h2 className="clip-reveal">YOU ARE<br />MORE THAN<br /><em>ONE THING.</em></h2></div>
            <div className="signal-copy reveal"><span className="signal-mark">U✳</span><p className="signal-lead">Your identity was never one-dimensional. Your style shouldn't be either.</p><p>Maybe it's the manga you grew up with. The game you lose hours to. A lyric that says what you couldn't. A film you return to. The things you love are part of your story — and they deserve a place in it.</p><p>UNIPARC brings those worlds together in one place. No gatekeeping. No need to choose just one.</p><a className="text-link" href="#worlds">FIND YOUR FREQUENCY <Arrow diagonal /></a></div>
          </div>
          <div className="signal-bottom"><span>IDENTITY IS NOT A CATEGORY.</span><span>WEAR WHAT DEFINES YOU.®</span></div>
        </section>

        <section className="worlds-section" id="worlds">
          <div className="section-meta reveal"><span>02 / CULTURE INDEX</span><span>FIND YOUR FREQUENCY</span></div>
          <div className="worlds-heading reveal"><div><p className="eyebrow">A UNIVERSE OF INTERESTS</p><h2 className="clip-reveal">WHAT MOVES<br /><em>YOU?</em></h2></div><p>Four starting points.<br />Infinite rabbit holes.</p></div>
          <div className="worlds-layout">
            <div className="worlds-grid">
              {worlds.map((world, index) => <button type="button" key={world.id} className={'world-tile world-tile-' + (index + 1) + (activeWorld.id === world.id ? ' world-selected' : '')} onClick={() => setActiveWorld(world)} aria-pressed={activeWorld.id === world.id}>
                <img src={world.image} alt="" loading="lazy" decoding="async" />
                <span className="world-overlay" />
                <span className="world-tile-top"><span>{world.no} / CULTURE INDEX</span><span>{world.tag}</span></span>
                <span className="world-tile-bottom"><span><strong>{world.title}</strong><small>{world.sub}</small></span><i><Arrow diagonal /></i></span>
              </button>)}
            </div>
            <aside className="world-feature reveal" aria-live="polite">
              <span className="world-feature-kicker">CURRENT FREQUENCY / {activeWorld.no}</span>
              <div className="world-feature-number">{activeWorld.no}</div>
              <p className="eyebrow">SELECTED WORLD</p>
              <h3>{activeWorld.title}</h3>
              <p>{activeWorld.sub}. A different universe, another way to see yourself.</p>
              <a href="#objects" className="text-link">EXPLORE THE FIRST EDIT <Arrow diagonal /></a>
            </aside>
          </div>
          <p className="worlds-foot">AND THAT'S ONLY THE BEGINNING. <span>THERE'S ALWAYS MORE TO DISCOVER ↘</span></p>
        </section>

        <section className="objects-section" id="objects">
          <div className="section-meta reveal"><span>03 / THE FIRST EDIT</span><span>OBJECTS WITH A POINT OF VIEW</span></div>
          <div className="objects-heading reveal"><div><p className="eyebrow">COLLECTION 001 / CONCEPT ARCHIVE</p><h2 className="clip-reveal">MADE TO<br /><em>MEAN MORE.</em></h2></div><p>Graphic pieces shaped by the references,<br />stories and details we keep close.</p></div>
          <div className="objects-grid">
            {objects.map((object) => <article className="object-card" key={object.no}>
              <a className={'object-image object-' + object.tone} href="#about" aria-label={'Read about the UNIPARC collection: ' + object.name}>
                <img src={object.image} alt={object.name + ' graphic apparel concept'} loading="lazy" decoding="async" />
                <span className="object-number">OBJECT / {object.no}</span><span className="object-open"><Arrow diagonal /></span><span className="object-descriptor">{object.descriptor}</span>
              </a>
              <div className="object-caption"><strong>{object.name}</strong><span>UNIPARC / 001</span></div>
            </article>)}
          </div>
          <div className="objects-note"><span>THE FIRST THREE OBJECTS</span><span>CONCEPT PREVIEW — RELEASE DETAILS TO FOLLOW</span></div>
        </section>

        <section className="about-section" id="about">
          <div className="section-meta reveal"><span>04 / OUR POINT OF VIEW</span><span>THE REASON WE EXIST</span></div>
          <div className="about-layout">
            <div className="about-brand reveal"><img src="/Uniparc.svg" alt="UNIPARC" /><span>INDEPENDENT CULTURE LABEL<br />EST. 2026 / INDIA</span></div>
            <div className="about-copy reveal"><p className="eyebrow">MORE THAN WHAT YOU WEAR</p><h2 className="clip-reveal">A HOME FOR<br /><em>EVERY SIDE.</em></h2><p className="about-lead">A culture-first lifestyle label for people who don't fit into just one category.</p><p>We bring fandoms, niche interests and everyday inspirations into a shared space for self-expression and belonging. Our first pieces are graphic T-shirts — understated from a distance, full of meaning up close. It's the beginning of a wider world built around the things you love.</p><strong>NO GATEKEEPING. NO BOXES TO FIT. JUST ROOM TO BE YOU.</strong></div>
          </div>
        </section>

        <section className="closing-section" id="next">
          <div className="closing-orbit" aria-hidden="true">U✳</div>
          <p className="eyebrow">THERE'S ROOM FOR YOU HERE</p>
          <h2 className="clip-reveal">FIND YOUR<br /><em>UNIVERSE.</em></h2>
          <div className="closing-bottom"><p>The first UNIPARC drop is in the works.<br />The next chapter starts here.</p><a href="#top" className="closing-link">BACK TO THE BEGINNING <Arrow diagonal /></a></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top"><a href="#top" className="footer-brand"><img src="/Uniparc.svg" alt="UNIPARC" /></a><p>A culture-first label for every side of you.<br />Wear what defines you.®</p><a className="footer-up" href="#top">BACK TO TOP ↑</a></div>
        <div className="footer-bottom"><span>© UNIPARC 2026. ALL RIGHTS RESERVED.</span><span>INDEPENDENT CULTURE / EST. 2026</span><span>MADE OF WHAT YOU LOVE.</span></div>
      </footer>
      <a className="mobile-edit-link" href="#objects">EXPLORE THE EDIT <Arrow diagonal /></a>
    </div>
  );
}
