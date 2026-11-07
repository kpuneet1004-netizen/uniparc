import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import OrbitScene from './components/OrbitScene';

gsap.registerPlugin(ScrollTrigger);

type World = { id: string; number: string; name: string; sub: string; glyph: string; className: string; copy: string };
const worlds: World[] = [
  { id: 'anime', number: '01', name: 'ANIME', sub: 'DRAWN WORLDS. REAL FEELINGS.', glyph: '漫', className: 'world-anime', copy: 'For the stories that stay with you long after the credits.' },
  { id: 'gaming', number: '02', name: 'GAMING', sub: 'PRESS START. BE YOURSELF.', glyph: '↗', className: 'world-gaming', copy: 'For the quests, the lore and the worlds you call home.' },
  { id: 'screen', number: '03', name: 'SCREEN', sub: 'EVERY FRAME HAS A WORLD.', glyph: '▣', className: 'world-screen', copy: 'For the films, series and scenes that become part of you.' },
  { id: 'sound', number: '04', name: 'SOUND', sub: 'FEEL IT. REPEAT IT.', glyph: '♫', className: 'world-sound', copy: 'For the tracks, artists and frequencies that define a moment.' },
  { id: 'culture', number: '05', name: 'CULTURE', sub: 'THE INTERNET NEVER SLEEPS.', glyph: '✳', className: 'world-culture', copy: 'For the niche interests, deep cuts and unexpected obsessions.' },
];

function Arrow({ diagonal = true }: { diagonal?: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={diagonal ? 'M5 19 19 5M7 5h12v12' : 'M4 12h15m-6-6 6 6-6 6'} /></svg>;
}

function WorldArtwork({ world }: { world: World }) {
  return <div className={'world-art ' + world.className} aria-hidden="true">
    <div className="art-grid" />
    <div className="art-orbit art-orbit-a" />
    <div className="art-orbit art-orbit-b" />
    <span className="art-glyph">{world.glyph}</span>
    <span className="art-cross">✳</span>
    <span className="art-coordinate">UP / {world.number}</span>
  </div>;
}

export default function App() {
  const root = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [activeWorld, setActiveWorld] = useState<World | null>(null);

  const navigate = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (reduced) { setIntroDone(true); return; }
      const intro = gsap.timeline({ onComplete: () => setIntroDone(true) });
      intro.set('.intro-mark', { scale: .2, rotation: -40, autoAlpha: 0 })
        .set('.intro-word', { y: 24, autoAlpha: 0 })
        .to('.intro-mark', { scale: 1, rotation: 0, autoAlpha: 1, duration: 1.05, ease: 'expo.out' })
        .to('.intro-ring', { scale: 1.8, autoAlpha: 0, duration: .9, ease: 'power2.out' }, '-=.65')
        .to('.intro-word', { y: 0, autoAlpha: 1, duration: .65, ease: 'power3.out' }, '-=.55')
        .to('.intro-screen', { autoAlpha: 0, duration: .7, ease: 'power2.inOut', delay: .25, onComplete: () => setIntroDone(true) });
      gsap.fromTo('.hero-copy > *', { y: 34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .9, stagger: .12, delay: .45, ease: 'power3.out' });
      gsap.fromTo('.hero-orbit-ui', { scale: .84, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.2, delay: .5, ease: 'expo.out' });
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.fromTo(el, { y: 42, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: .85, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        });
      });
      gsap.to('.signal-beam', { rotate: 360, duration: 22, repeat: -1, ease: 'none' });
      gsap.to('.ticker-track', { xPercent: -25, ease: 'none', scrollTrigger: { trigger: '.ticker', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!activeWorld) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setActiveWorld(null); };
    window.addEventListener('keydown', close);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', close); };
  }, [activeWorld]);

  return <div className="uniparc-site" ref={root}>
    <div className="grain" aria-hidden="true" />
    <div className="starfield starfield-one" aria-hidden="true" />
    <div className="starfield starfield-two" aria-hidden="true" />

    {!introDone && <div className="intro-screen" aria-label="UNIPARC opening sequence">
      <div className="intro-ring" />
      <div className="intro-mark">U<span>✳</span></div>
      <p className="intro-word">A UNIVERSE FOR EVERY SIDE OF YOU.</p>
      <button className="intro-skip" onClick={() => setIntroDone(true)}>SKIP INTRO ↗</button>
    </div>}

    <header className="topbar">
      <a href="#home" className="wordmark" onClick={(e) => { e.preventDefault(); navigate('home'); }} aria-label="UNIPARC home"><img src="/Uniparc.svg" alt="UNIPARC" /></a>
      <div className="topbar-center"><span className="pulse" /> CULTURE WITHOUT CATEGORY</div>
      <button className="menu-trigger" aria-expanded={menuOpen} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
      <nav className={menuOpen ? 'top-nav is-open' : 'top-nav'} aria-label="Main navigation">
        <button onClick={() => navigate('universes')}>THE UNIVERSES</button>
        <button onClick={() => navigate('manifesto')}>THE IDEA</button>
        <button onClick={() => navigate('signal')}>THE SIGNAL</button>
        <button className="nav-enter" onClick={() => navigate('universes')}>EXPLORE <Arrow /></button>
      </nav>
    </header>

    <main>
      <section className="hero" id="home">
        <div className="hero-topline"><span>INDEPENDENT CULTURE LABEL <i> / </i> EST. 2026</span><span>NO. 001 — THE BEGINNING</span></div>
        <div className="hero-main">
          <div className="hero-copy">
            <p className="eyebrow"><span className="pulse" /> THIS IS YOUR UNIVERSE.</p>
            <h1><span>YOUR WORLD.</span><span className="hollow">YOUR RULES<span className="neon">.</span></span></h1>
            <p className="hero-description">Anime. Games. Music. Movies. All the worlds you love, colliding in one place. This is UNIPARC — made for every side of you.</p>
            <div className="hero-actions"><button className="button-neon" onClick={() => navigate('universes')}>ENTER THE UNIVERSE <Arrow /></button><span className="hero-side-note">NO BOXES. NO GATEKEEPING.<br />JUST PURE YOU.</span></div>
          </div>
          <div className="hero-orbit-ui">
            <div className="orbit-halo orbit-halo-one" /><div className="orbit-halo orbit-halo-two" />
            <div className="signal-beam"><i /><i /><i /></div>
            <div className="orbit-core"><OrbitScene /><span className="core-label">U✳</span></div>
            <span className="orbit-tag orbit-tag-top">YOUR INTERESTS / YOUR IDENTITY</span>
            <span className="orbit-tag orbit-tag-left">ANIME ↗</span>
            <span className="orbit-tag orbit-tag-right">GAMING ↗</span>
            <span className="orbit-tag orbit-tag-bottom">MUSIC / FILM / EVERYTHING</span>
            <span className="orbit-coord">35° 41' 22.2" N<br />139° 41' 30.1" E</span>
          </div>
        </div>
        <div className="hero-bottomline"><span>SCROLL TO EXPLORE <b>↓</b></span><span>ONE PERSON. INFINITE WORLDS.</span><span>UNIPARC®</span></div>
      </section>

      <div className="ticker"><div className="ticker-track">ANIME <b>✳</b> GAMING <b>✳</b> MUSIC <b>✳</b> FILM <b>✳</b> ART <b>✳</b> INTERNET CULTURE <b>✳</b> ANIME <b>✳</b> GAMING <b>✳</b> MUSIC <b>✳</b> FILM <b>✳</b> ART <b>✳</b></div></div>

      <section className="manifesto" id="manifesto">
        <div className="section-meta reveal"><span>01 / THE IDEA</span><span>WHY UNIPARC EXISTS</span></div>
        <div className="manifesto-grid">
          <div className="manifesto-title reveal"><p className="eyebrow">YOU WERE NEVER ONE THING.</p><h2>TOO MANY<br />WORLDS<span className="neon">.</span><br /><em>ONE YOU.</em></h2></div>
          <div className="manifesto-copy reveal"><div className="mini-orbit">✳</div><p className="manifesto-lead">You don't have to pick a side to belong.</p><p>One day it's a late-night anime binge. The next, you're deep into a game universe. A film quote lives rent-free in your head. A song becomes your whole personality.</p><p>We get it. Your interests aren't separate boxes. They're different dimensions of the same person. UNIPARC brings them together — a home for what you love, and a space to wear it your way.</p><button className="text-link" onClick={() => navigate('universes')}>FIND YOUR WORLD <Arrow /></button></div>
        </div>
        <div className="manifesto-foot"><span>NO GATEKEEPING</span><span>NO LABELS</span><span>NO LIMITS</span><span>JUST YOU <b>✳</b></span></div>
      </section>

      <section className="universes" id="universes">
        <div className="section-meta reveal"><span>02 / PICK YOUR PORTAL</span><span>THE MULTIVERSE STARTS HERE</span></div>
        <div className="universe-heading reveal"><div><p className="eyebrow">WHAT ARE YOU INTO?</p><h2>CHOOSE A<br /><em>UNIVERSE.</em></h2></div><p>Every fandom has a frequency.<br />Every interest opens a new world.<br />Where are we going first?</p></div>
        <div className="universe-grid">{worlds.map((world) => <button className="universe-card" key={world.id} onClick={() => setActiveWorld(world)}><WorldArtwork world={world} /><span className="universe-card-top"><small>{world.number} / PORTAL</small><small>OPEN ↗</small></span><span className="universe-card-bottom"><span><b>{world.name}</b><small>{world.sub}</small></span><i><Arrow /></i></span></button>)}</div>
        <div className="universe-foot"><span>AND THE MULTIVERSE KEEPS EXPANDING.</span><span>MORE WORLDS. MORE STORIES. <b>✳</b></span></div>
      </section>

      <section className="signal" id="signal">
        <div className="signal-bg-orbit" aria-hidden="true"><span /><span /><span /></div>
        <div className="section-meta reveal"><span>03 / THE SIGNAL</span><span>THE UNIPARC STATE OF MIND</span></div>
        <div className="signal-content reveal"><p className="eyebrow">THIS ISN'T JUST MERCH.</p><h2>IT'S A<br /><span>UNIVERSE</span><br />YOU CAN WEAR<span className="neon">.</span></h2><p>We turn the things you love into a language of your own. Starting with graphic streetwear, built around the worlds, details and references that make you feel something.</p><div className="signal-stats"><div><b>01</b><span>YOUR FANDOM</span></div><div><b>∞</b><span>WAYS TO EXPRESS IT</span></div><div><b>U✳</b><span>YOUR UNIVERSE</span></div></div><button className="button-neon" onClick={() => navigate('manifesto')}>GET THE IDEA <Arrow /></button></div>
      </section>

      <section className="final-portal">
        <div className="portal-rings" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="final-copy reveal"><p className="eyebrow"><span className="pulse" /> TRANSMISSION RECEIVED?</p><h2>WELCOME<br />TO YOUR<br /><em>UNIVERSE.</em></h2><p>We're just getting started. Stay curious. Stay weird. Stay you.</p><button onClick={() => navigate('home')}>BACK TO THE BEGINNING ↑</button></div>
        <div className="portal-coordinate">UNIPARC / SIGNAL 001<br />ENDLESS WORLDS DETECTED</div>
      </section>
    </main>

    <footer className="footer">
      <div className="footer-top"><a href="#home" onClick={(e) => { e.preventDefault(); navigate('home'); }}><img src="/Uniparc.svg" alt="UNIPARC" /></a><p>A home for what you love.<br />A universe for every side of you.</p><button onClick={() => navigate('home')}>BACK TO TOP ↑</button></div>
      <div className="footer-bottom"><span>© UNIPARC 2026. ALL WORLDS RESERVED.</span><span>BUILT FOR THE CULTURE.</span><span>WEAR WHAT DEFINES YOU.®</span></div>
    </footer>

    {activeWorld && <div className="world-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setActiveWorld(null); }}><section className="world-modal" role="dialog" aria-modal="true" aria-labelledby="world-modal-title"><button className="modal-close" onClick={() => setActiveWorld(null)} aria-label="Close portal">CLOSE ×</button><WorldArtwork world={activeWorld} /><div className="world-modal-copy"><span className="eyebrow">PORTAL {activeWorld.number} / UNIPARC MULTIVERSE</span><h2 id="world-modal-title">{activeWorld.name}<span className="neon">.</span></h2><p>{activeWorld.copy}</p><span className="modal-status">SIGNAL LOCKED IN <i className="pulse" /></span><small>Explore the world. Find your people. Express your side of it.</small></div></section></div>}
  </div>;
}
