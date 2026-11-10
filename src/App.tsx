import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const CinematicIntroScene = lazy(() => import('./components/CinematicIntroScene'));
gsap.registerPlugin(ScrollTrigger);

const worlds = [
  { id: 'anime', no: '01', title: 'ANIME / MANGA', line: 'Drawn worlds. Real feelings.', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1400&q=85' },
  { id: 'games', no: '02', title: 'GAMES / PLAY', line: 'Lives beyond this one.', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=85' },
  { id: 'film', no: '03', title: 'FILM / SCREEN', line: 'Stories that never leave.', image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1400&q=85' },
  { id: 'sound', no: '04', title: 'MUSIC / SOUND', line: 'Feel it before you say it.', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=85' },
];

const objects = [
  { no: '001', name: 'GORGON', descriptor: 'BEAUTY WITH A BITE', image: '/images/objects/gorgon-001.webp', note: 'A little myth. A lot of attitude.' },
  { no: '002', name: 'HELLBOY', descriptor: 'RESEARCH. CONTAIN. DEFEND.', image: '/images/objects/hellboy-002.webp', note: 'For the strange things we protect.' },
  { no: '003', name: 'SERIOUS', descriptor: 'NOT EVERYTHING IS THAT DEEP', image: '/images/objects/serious-003.webp', note: 'A straight face. A sideways thought.' },
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d={diagonal ? 'M6 18 18 6M7 6h11v11' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function markIntroSeen() {
  try { window.localStorage.setItem('uniparc-intro-seen', '1'); } catch { /* Storage is optional. */ }
}

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<gsap.core.Timeline | null>(null);
  const [introSeen, setIntroSeen] = useState(() => {
    try { return window.localStorage.getItem('uniparc-intro-seen') === '1'; } catch { return false; }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeWorld, setActiveWorld] = useState(worlds[0]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = reduced ? null : new Lenis({ lerp: 0.12, smoothWheel: true, anchors: { offset: -72 } });
    let tick: ((time: number) => void) | undefined;
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      tick = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }
    const context = gsap.context(() => {
      const finish = () => { markIntroSeen(); setIntroSeen(true); };
      const timeline = gsap.timeline({ defaults: { ease: 'power3.inOut' }, onComplete: finish });
      introRef.current = timeline;
      if (introSeen || reduced) {
        timeline.set('.intro-screen', { autoAlpha: 0 });
        finish();
      } else {
        timeline.set('.intro-screen', { autoAlpha: 1 })
          .to({}, { duration: 0.65 })
          .fromTo('.intro-lockup', { autoAlpha: 0, scale: 0.9, y: 18, filter: 'blur(12px)' }, { autoAlpha: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'expo.out' })
          .to('.intro-lockup', { autoAlpha: 0, y: -14, duration: 0.35, delay: 0.35 })
          .to('.intro-screen', { yPercent: -100, duration: 0.9, ease: 'power4.inOut' })
          .fromTo('.masthead, .hero-visual, .hero-copy > *', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.65, stagger: 0.07, ease: 'power3.out' }, '-=0.35');
      }
      if (!reduced) {
        gsap.to('.hero-image', { yPercent: 10, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => gsap.fromTo(el, { y: 34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));
        gsap.utils.toArray<HTMLElement>('.world-row').forEach((el, i) => gsap.fromTo(el, { x: i % 2 ? 24 : -24, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
        gsap.utils.toArray<HTMLElement>('.object-card').forEach((el, i) => gsap.fromTo(el, { y: 45, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, delay: i * 0.08, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));
      }
    }, rootRef);
    const closeMenu = () => setMenuOpen(false);
    window.addEventListener('hashchange', closeMenu);
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      context.revert();
      window.removeEventListener('hashchange', closeMenu);
      if (lenis) { if (tick) gsap.ticker.remove(tick); lenis.destroy(); }
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
        <div className="intro-lockup"><img src="/Uniparc.svg" alt="UNIPARC" /><span>ONE UNIVERSE. NO SINGLE STORY.</span></div>
        <span className="intro-foot intro-foot-left">CULTURE IS PERSONAL</span>
        <span className="intro-foot intro-foot-right">UNIPARC® / 001</span>
        <button className="intro-skip" type="button" onClick={skipIntro}>SKIP INTRO <Arrow diagonal /></button>
      </div>

      <header className="masthead">
        <a className="brand" href="#top" aria-label="UNIPARC home"><img src="/Uniparc.svg" alt="UNIPARC" /></a>
        <span className="masthead-edition">INDEPENDENT CULTURE LABEL <i>✳</i> VOL. 001</span>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          <a href="#manifesto" onClick={() => setMenuOpen(false)}>THE IDEA</a>
          <a href="#worlds" onClick={() => setMenuOpen(false)}>CULTURE INDEX</a>
          <a href="#objects" onClick={() => setMenuOpen(false)}>OBJECTS</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>ABOUT</a>
        </nav>
        <a className="masthead-cta" href="#objects">THE FIRST EDIT <Arrow diagonal /></a>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="hero-topline"><span><b className="live-dot" /> AN INDEPENDENT CULTURE LABEL</span><span>INDIA / ONLINE EVERYWHERE</span><span>ISSUE 001 — 2026</span></div>
          <div className="hero-layout">
            <div className="hero-copy">
              <p className="hero-kicker reveal"><span>01</span> YOUR INTERESTS ARE YOUR IDENTITY</p>
              <h1>NOT<br />JUST <em>ONE</em><br />THING<span className="title-period">.</span></h1>
              <div className="hero-description"><p>A label for all the worlds you carry. The stories, sounds, characters and obsessions that make you <strong>you.</strong></p><a className="circle-link" href="#manifesto" aria-label="Discover the UNIPARC idea"><span>DISCOVER<br />THE IDEA</span><b><Arrow /></b></a></div>
              <div className="hero-side-note">CULTURE<br />ISN'T A CATEGORY.<br /><strong>IT'S EVERYTHING.</strong></div>
            </div>
            <figure className="hero-visual">
              <img className="hero-image" src="/images/hero/uniparc-hero.webp" alt="UNIPARC apparel campaign artwork" fetchPriority="high" decoding="async" />
              <div className="hero-image-overlay" />
              <span className="image-stamp">UP®<br /><small>OBJECT<br />STUDY / 001</small></span>
              <span className="hero-image-caption">FIG. 001 <i>—</i> WEAR YOUR UNIVERSE</span>
              <span className="hero-vertical-label">A UNIVERSE OF YOUR OWN</span>
            </figure>
          </div>
          <div className="hero-bottomline"><span>01 / A NEW CULTURE LANGUAGE</span><span>NOT A FANDOM. A FRAME OF MIND.</span><a href="#worlds">SCROLL TO EXPLORE ↓</a></div>
        </section>

        <div className="ticker" aria-label="Culture is everywhere"><div>ANIME IS CULTURE <b>✳</b> GAMES ARE CULTURE <b>✳</b> MUSIC IS CULTURE <b>✳</b> FILM IS CULTURE <b>✳</b> INTERNET IS CULTURE <b>✳</b> ANIME IS CULTURE <b>✳</b> GAMES ARE CULTURE <b>✳</b> MUSIC IS CULTURE <b>✳</b> FILM IS CULTURE <b>✳</b> INTERNET IS CULTURE <b>✳</b></div></div>

        <section className="manifesto section-pad" id="manifesto">
          <div className="section-label reveal"><span>02 / THE MANIFESTO</span><span>IDENTITY, WITHOUT THE BOX</span></div>
          <div className="manifesto-grid">
            <div className="manifesto-heading reveal"><p className="overline">A NOTE TO THE MULTITUDES</p><h2>YOU CAN<br />LIKE <em>MORE.</em></h2><span className="manifesto-symbol">✳</span></div>
            <div className="manifesto-body reveal"><span className="manifesto-index">A / 001</span><p className="manifesto-lead">You were never meant to fit inside one interest. Why should your wardrobe?</p><p>One day it's a panel from a manga. The next, a soundtrack on repeat, a game you can't put down, or a film that rearranges your brain. None of it is a phase if it helped make you who you are.</p><p>UNIPARC is a place for those overlapping worlds. Not a ranking of what's cool. Not a gate with someone guarding it. Just culture, worn your way.</p><a className="underlined-link" href="#worlds">FIND YOUR WORLD <Arrow diagonal /></a></div>
          </div>
          <div className="manifesto-foot"><span>NO BOXES. NO GATEKEEPING.</span><span>BE MORE THAN ONE THING.®</span></div>
        </section>

        <section className="worlds-section section-pad" id="worlds">
          <div className="section-label reveal"><span>03 / THE CULTURE INDEX</span><span>SELECT A FREQUENCY ↘</span></div>
          <div className="worlds-intro reveal"><div><p className="overline">START WHERE YOU ARE</p><h2>WHAT'S<br />YOUR <em>WORLD?</em></h2></div><p>Every interest opens a door.<br />Pick one. Fall down a rabbit hole.</p></div>
          <div className="world-index">
            {worlds.map((world) => <button type="button" key={world.id} className={'world-row' + (activeWorld.id === world.id ? ' is-active' : '')} onClick={() => setActiveWorld(world)} aria-pressed={activeWorld.id === world.id}>
              <span className="world-no">{world.no}</span><span className="world-title">{world.title}<small>{world.line}</small></span><span className="world-image-wrap"><img src={world.image} alt="" loading="lazy" decoding="async" /></span><span className="world-row-arrow"><Arrow diagonal /></span>
            </button>)}
          </div>
          <div className="worlds-foot reveal"><span>NOW TUNED TO / {activeWorld.no}</span><strong>{activeWorld.title}</strong><span>THERE'S ALWAYS ANOTHER WORLD.</span></div>
        </section>

        <section className="objects-section section-pad" id="objects">
          <div className="section-label reveal"><span>04 / THE FIRST EDIT</span><span>OBJECTS WITH A POINT OF VIEW</span></div>
          <div className="objects-intro reveal"><div><p className="overline">COLLECTION 001 / CONCEPT ARCHIVE</p><h2>THINGS<br />THAT <em>MEAN.</em></h2></div><p>Graphic objects for the things that stay with you. A first glimpse at the UNIPARC universe.</p></div>
          <div className="objects-grid">
            {objects.map((object, index) => <article className={'object-card object-card-' + (index + 1)} key={object.no}>
              <a className="object-image" href="#about" aria-label={'Discover the story behind ' + object.name}>
                <img src={object.image} alt={object.name + ' graphic apparel concept'} loading="lazy" decoding="async" />
                <span className="object-tag">UP® / {object.no}</span><span className="object-arrow"><Arrow diagonal /></span><span className="object-descriptor">{object.descriptor}</span>
              </a>
              <div className="object-meta"><span>{object.no} / OBJECT STUDY</span><h3>{object.name}</h3><p>{object.note}</p></div>
            </article>)}
          </div>
          <div className="objects-disclaimer"><span>THE FIRST THREE OBJECTS</span><span>CONCEPT PREVIEW — RELEASE DETAILS TO FOLLOW</span></div>
        </section>

        <section className="about-section section-pad" id="about">
          <div className="section-label reveal"><span>05 / WHY UNIPARC</span><span>MORE THAN WHAT YOU WEAR</span></div>
          <div className="about-layout">
            <div className="about-visual reveal"><img src="/Uniparc.svg" alt="UNIPARC" /><span>UNIPARC®<br />INDEPENDENT CULTURE LABEL<br />INDIA / VOL. 001</span><b>U✳</b></div>
            <div className="about-copy reveal"><p className="overline">A HOME FOR EVERY SIDE</p><h2>WEAR<br />WHAT <em>MAKES</em><br />YOU.</h2><p className="about-lead">A culture-first lifestyle label for people who were never just one thing.</p><p>We bring fandoms, niche interests and everyday inspirations into one shared space for self-expression. The first pieces are graphic T-shirts — understated from a distance, full of meaning up close. This is the beginning of a wider world built around what you love.</p><strong>NO GATEKEEPING. NO BOXES TO FIT. JUST ROOM TO BE YOU.</strong></div>
          </div>
        </section>

        <section className="closing-section">
          <div className="closing-topline"><span>END OF ISSUE 001</span><span>THE STORY KEEPS GOING ↘</span></div>
          <p className="overline">FOR EVERY SIDE OF YOU</p><h2>STAY<br />UN<span>BOXED.</span></h2>
          <div className="closing-bottom"><p>Your world is bigger than one label.<br />Wear it that way.</p><a href="#top" className="closing-link">BACK TO THE TOP <Arrow diagonal /></a></div>
          <span className="closing-watermark" aria-hidden="true">UP®</span>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main"><a href="#top" className="footer-brand"><img src="/Uniparc.svg" alt="UNIPARC" /></a><p>A culture-first label<br />for every side of you.</p><nav aria-label="Footer navigation"><a href="#manifesto">THE IDEA</a><a href="#worlds">CULTURE INDEX</a><a href="#objects">THE EDIT</a><a href="#about">ABOUT</a></nav><a className="footer-up" href="#top">BACK TO TOP ↑</a></div>
        <div className="footer-bottom"><span>© UNIPARC 2026. ALL RIGHTS RESERVED.</span><span>INDEPENDENT CULTURE / EST. INDIA</span><span>WEAR YOUR UNIVERSE.®</span></div>
      </footer>
      <a className="mobile-cta" href="#objects">EXPLORE THE FIRST EDIT <Arrow diagonal /></a>
    </div>
  );
}
