import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type World = { id: string; number: string; name: string; descriptor: string; image: string; tag: string };
type Piece = { id: string; name: string; type: string; note: string; image: string };

const worlds: World[] = [
  { id: 'anime', number: '01', name: 'ANIME', descriptor: 'Worlds worth getting lost in.', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=88', tag: 'FRAME 001' },
  { id: 'play', number: '02', name: 'GAMING', descriptor: 'Side quests. Main character energy.', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=88', tag: 'PLAYER 002' },
  { id: 'screen', number: '03', name: 'SCREEN', descriptor: 'For the ones who know the lore.', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=88', tag: 'SCENE 003' },
  { id: 'sound', number: '04', name: 'SOUND', descriptor: 'Every feeling has a frequency.', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=88', tag: 'FREQ 004' },
];

const pieces: Piece[] = [
  { id: '001', name: 'SIGNAL', type: 'APPAREL', note: 'THE FIRST FREQUENCY', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1100&q=88' },
  { id: '002', name: 'AFTERIMAGE', type: 'APPAREL', note: 'A MEMORY IN MOTION', image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1100&q=88' },
  { id: '003', name: 'SIDE QUEST', type: 'CULTURE', note: 'TAKE THE LONG WAY', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd5?auto=format&fit=crop&w=1100&q=88' },
];

const links = [{ id: 'worlds', label: 'THE WORLDS' }, { id: 'edit', label: 'THE EDIT' }, { id: 'story', label: 'OUR STORY' }];

function Arrow({ diagonal = true }: { diagonal?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="arrow"><path d={diagonal ? 'M5 19 19 5M7 5h12v12' : 'M4 12h15m-6-6 6 6-6 6'} /></svg>;
}

function Mark() {
  return <span className="brand-mark" aria-hidden="true">U<span>✳</span></span>;
}

export default function App() {
  const page = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [activePiece, setActivePiece] = useState<Piece | null>(null);
  const filteredPieces = useMemo(() => filter === 'ALL' ? pieces : pieces.filter((piece) => piece.type === filter), [filter]);

  const goTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (reduced) return;
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro.fromTo('.hero-kicker, .hero-index', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .7, stagger: .1 })
        .fromTo('.hero-title .line-inner', { yPercent: 110, rotate: 2 }, { yPercent: 0, rotate: 0, duration: 1, stagger: .12 }, '-=.25')
        .fromTo('.hero-visual', { clipPath: 'inset(12% 0 12% 0)', scale: .96 }, { clipPath: 'inset(0% 0 0% 0)', scale: 1, duration: 1.1 }, '-=.55')
        .fromTo('.hero-bottom', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .65 }, '-=.45');
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.fromTo(el, { y: 36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      });
      gsap.to('.orbit-stamp', { rotate: 360, duration: 28, ease: 'none', repeat: -1 });
      gsap.to('.marquee-track', { xPercent: -24, ease: 'none', scrollTrigger: { trigger: '.marquee-band', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.utils.toArray<HTMLElement>('.world-card').forEach((card, i) => {
        gsap.fromTo(card, { y: 50, rotate: i % 2 ? 1.5 : -1.5, autoAlpha: 0 }, { y: 0, rotate: 0, autoAlpha: 1, duration: .85, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 90%', once: true } });
      });
    }, page);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!activePiece) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setActivePiece(null); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKey); };
  }, [activePiece]);

  return <div className="site-shell" ref={page}>
    <div className="noise-layer" aria-hidden="true" />
    <header className="site-header">
      <a className="brand" href="#top" onClick={(event) => { event.preventDefault(); goTo('top'); }} aria-label="UNIPARC home">
        <img src="/Uniparc.svg" alt="UNIPARC" />
      </a>
      <span className="header-signal"><i /> CULTURE WITHOUT CATEGORY</span>
      <button className={menuOpen ? 'menu-toggle open' : 'menu-toggle'} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
      <nav className={menuOpen ? 'main-nav nav-open' : 'main-nav'} aria-label="Main navigation">
        {links.map((link, index) => <button key={link.id} onClick={() => goTo(link.id)}><sup>0{index + 1}</sup>{link.label}</button>)}
        <button className="nav-cta" onClick={() => goTo('drop')}>ENTER THE UNIVERSE <Arrow /></button>
      </nav>
    </header>

    <main>
      <section className="hero" id="top">
        <div className="hero-meta"><span className="hero-kicker"><i className="live-dot" /> AN INDEPENDENT CULTURE LABEL</span><span className="hero-index">IND / EST. 2026 — 001</span></div>
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow hero-kicker">YOU WERE NEVER JUST ONE THING.</p>
            <h1 className="hero-title"><span className="line-mask"><span className="line-inner">MORE THAN</span></span><span className="line-mask"><span className="line-inner outline-word">ONE WORLD<span className="neon-dot">.</span></span></span><span className="line-mask"><span className="line-inner">THAT'S YOU<span className="neon-dot">.</span></span></span></h1>
            <div className="hero-bottom"><p>The anime you love. The games you play. The soundtracks you live by. All the things that make you, you — in one place.</p><button className="circle-cta" onClick={() => goTo('worlds')} aria-label="Explore the UNIPARC worlds"><span>SCROLL<br />TO EXPLORE</span><b>↓</b></button></div>
          </div>
          <div className="hero-visual">
            <div className="hero-photo hero-photo-main"><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1500&q=90" alt="Streetwear editorial campaign" fetchPriority="high" /></div>
            <div className="hero-photo hero-photo-detail"><img src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=88" alt="Close-up of contemporary streetwear" /></div>
            <div className="hero-graphic" aria-hidden="true"><span>NO BOXES<br />NO LIMITS<br />NO GATEKEEPING</span><b>U✳</b></div>
            <span className="visual-caption">UNIPARC / CULTURE STUDY 001</span>
            <span className="visual-coordinate">15°29' N — 73°49' E</span>
          </div>
        </div>
        <div className="hero-footer"><span>WEAR WHAT DEFINES YOU.®</span><span>SCROLL TO FIND YOUR FREQUENCY <b>↓</b></span><span>01 / 06</span></div>
      </section>

      <div className="ticker" aria-label="Anime, gaming, music, film and internet culture"><div>ANIME IS CULTURE <b>✳</b> GAMING IS CULTURE <b>✳</b> MUSIC IS CULTURE <b>✳</b> FILM IS CULTURE <b>✳</b> INTERNET IS CULTURE <b>✳</b> ANIME IS CULTURE <b>✳</b> GAMING IS CULTURE <b>✳</b></div></div>

      <section className="manifesto section-light" id="story">
        <div className="section-label"><span>01 / THE BIG IDEA</span><span>A PLACE WHERE CULTURE BELONGS</span></div>
        <div className="manifesto-layout">
          <div className="manifesto-heading reveal"><p className="eyebrow">YOU DON'T HAVE TO PICK JUST ONE.</p><h2>YOUR TASTE<br />HAS <em>NO</em><br /><span>SIDELINES.</span></h2></div>
          <div className="manifesto-copy reveal"><div className="signal-rule"><i /></div><span className="manifesto-index">A NOTE FROM THE UNIVERSE / 001</span><h3>Every interest is a part of your identity. Not a phase. Not a footnote.</h3><p>Maybe it's a manga you grew up with. A game you lose hours to. A lyric that says what you couldn't. A film you return to.</p><p>The things you love are part of your story — and they deserve a place in it. UNIPARC brings those worlds together in one place. No gatekeeping. No need to choose just one.</p><button className="underlined-link" onClick={() => goTo('worlds')}>FIND YOUR WORLD <Arrow /></button></div>
        </div>
        <div className="manifesto-bottom"><span>ONE PERSON. MANY UNIVERSES.</span><span>ROOM FOR EVERY SIDE OF YOU.</span><span>END OF TRANSMISSION — 001</span></div>
      </section>

      <section className="worlds section-dark" id="worlds">
        <div className="section-label"><span>02 / THE CULTURE INDEX</span><span>FIND YOUR FREQUENCY</span></div>
        <div className="section-heading reveal"><div><p className="eyebrow">WHAT ARE YOU INTO?</p><h2>CHOOSE YOUR<br /><em>UNIVERSE.</em></h2></div><p>Different interests. One place to explore.<br />Find your world — or discover a new one.</p></div>
        <div className="world-grid">{worlds.map((world) => <button className={'world-card world-' + world.id} key={world.id} onClick={() => goTo('edit')}><img src={world.image} alt="" loading="lazy" /><span className="world-wash" /><span className="world-top"><small>{world.number} / CULTURE INDEX</small><small>{world.tag}</small></span><span className="world-bottom"><span><b>{world.name}</b><small>{world.descriptor}</small></span><i><Arrow /></i></span><span className="world-number">{world.number}</span></button>)}</div>
        <div className="worlds-foot"><span>THAT'S ONLY THE START.</span><span>THERE'S ALWAYS MORE TO DISCOVER <b>↘</b></span></div>
      </section>

      <section className="edit section-light" id="edit">
        <div className="section-label"><span>03 / THE UNIPARC EDIT</span><span>OBJECTS WITH A POINT OF VIEW</span></div>
        <div className="section-heading edit-heading reveal"><div><p className="eyebrow">FIRST LOOK. FRESH SIGNAL.</p><h2>THE FIRST<br /><em>FREQUENCY.</em></h2></div><p>A preview of the ideas and pieces<br />shaping the UNIPARC universe.</p></div>
        <div className="edit-toolbar"><div className="filter-tabs" role="group" aria-label="Filter concept previews">{['ALL', 'APPAREL', 'CULTURE'].map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}<sup>{item === 'ALL' ? '03' : item === 'APPAREL' ? '02' : '01'}</sup></button>)}</div><span>CONCEPT PREVIEW / 2026</span></div>
        <div className="piece-grid">{filteredPieces.map((piece) => <article className="piece-card" key={piece.id}><button className="piece-image" onClick={() => setActivePiece(piece)} aria-label={'View ' + piece.name + ' concept preview'}><img src={piece.image} alt="Editorial apparel concept preview" loading="lazy" /><span className="piece-id">OBJECT / {piece.id}</span><span className="piece-view">OPEN FILE <Arrow /></span><span className="piece-note">{piece.note}</span></button><div className="piece-details"><b>{piece.name} <span>/{piece.id}</span></b><small>{piece.type}</small></div></article>)}</div>
        <p className="concept-disclaimer"><b>FIELD NOTE</b> These are concept previews, not purchasable products. Final product details and release information will be announced at launch.</p>
      </section>

      <section className="marquee-band" aria-label="Wear what defines you"><div className="marquee-track">WEAR WHAT DEFINES YOU <span>✳</span> CULTURE HAS NO CATEGORY <span>✳</span> WEAR WHAT DEFINES YOU <span>✳</span> CULTURE HAS NO CATEGORY <span>✳</span></div></section>

      <section className="about section-dark">
        <div className="section-label"><span>04 / OUR POINT OF VIEW</span><span>MORE THAN WHAT YOU WEAR</span></div>
        <div className="about-layout"><div className="about-brand reveal"><img src="/Uniparc.svg" alt="UNIPARC" /><div className="about-stamp"><Mark /><span>INDEPENDENT<br />CULTURE LABEL</span></div></div><div className="about-copy reveal"><p className="eyebrow">BUILT FOR EVERY SIDE OF YOU.</p><h2>NOT A NICHE.<br /><em>A WHOLE</em><br />UNIVERSE.</h2><h3>A culture-first lifestyle label for people who don't fit into just one category.</h3><p>We bring fandoms, niche interests and everyday inspirations into a shared space for self-expression and belonging.</p><p>Our first pieces are graphic T-shirts — understated from a distance, full of meaning up close. It's the beginning of a wider world built around the things you love.</p><strong>NO GATEKEEPING. NO BOXES TO FIT. JUST ROOM TO BE YOU.</strong></div></div>
      </section>

      <section className="drop-section" id="drop">
        <div className="drop-orbit orbit-stamp" aria-hidden="true">U✳ UNIPARC ✳ U✳ UNIPARC ✳</div><div className="drop-content reveal"><p className="eyebrow">THE NEXT CHAPTER STARTS HERE.</p><h2>FIND YOUR<br /><em>PEOPLE.</em></h2><div className="drop-bottom"><p>The first UNIPARC drop is in the works.<br />Stay close. The signal is just getting started.</p><button onClick={() => goTo('top')}>BACK TO THE TOP <Arrow /></button></div></div>
        <span className="drop-coordinate">TRANSMISSION 005 / ENDLESS POSSIBILITIES</span>
      </section>
    </main>

    <footer className="site-footer">
      <div className="footer-main"><div className="footer-brand"><a href="#top" onClick={(event) => { event.preventDefault(); goTo('top'); }}><img src="/Uniparc.svg" alt="UNIPARC" /></a><p>A home for what you love.<br />A place where culture belongs.</p><span>WEAR WHAT DEFINES YOU.®</span></div><div className="footer-column"><b>EXPLORE</b><button onClick={() => goTo('story')}>THE IDEA <span>01</span></button><button onClick={() => goTo('worlds')}>CULTURE INDEX <span>02</span></button><button onClick={() => goTo('edit')}>THE UNIPARC EDIT <span>03</span></button><button onClick={() => goTo('drop')}>THE NEXT CHAPTER <span>04</span></button></div><div className="footer-column"><b>THE UNIVERSE</b><button onClick={() => goTo('worlds')}>ANIME & MANGA</button><button onClick={() => goTo('worlds')}>GAMING</button><button onClick={() => goTo('worlds')}>FILM & SCREEN</button><button onClick={() => goTo('worlds')}>MUSIC & MORE</button></div><div className="footer-note"><b>NO BOXES. NO LIMITS.</b><p>From the stories you follow to the worlds you explore, there's room for every side of you here.</p><button onClick={() => goTo('edit')}>DISCOVER THE EDIT ↗</button></div></div>
      <div className="footer-bottom"><span>© UNIPARC 2026. ALL RIGHTS RESERVED.</span><span>INDEPENDENT CULTURE / EST. 2026</span><button onClick={() => goTo('top')}>BACK TO TOP ↑</button></div>
    </footer>

    {activePiece && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActivePiece(null); }}><section className="piece-modal" role="dialog" aria-modal="true" aria-labelledby="piece-title"><div className="modal-visual"><img src={activePiece.image} alt="Editorial concept preview" /><span>UNIPARC® / OBJECT STUDY {activePiece.id}</span></div><div className="modal-copy"><div className="modal-top"><span>OBJECT FILE / {activePiece.id}</span><button onClick={() => setActivePiece(null)} aria-label="Close object details">CLOSE ×</button></div><p className="eyebrow">{activePiece.type} — {activePiece.note}</p><h2 id="piece-title">{activePiece.name}<span>.</span></h2><p>A wearable expression of the worlds, stories and details that stay with you. This concept is part of the evolving UNIPARC universe — made for every side of you.</p><div className="modal-data"><span>COLLECTION</span><b>THE UNIPARC EDIT</b><span>STATUS</span><b>CONCEPT PREVIEW</b><span>RELEASE</span><b>TO BE ANNOUNCED</b></div><small>Preview only. This object is not currently available to purchase.</small></div></section></div>}
  </div>;
}
