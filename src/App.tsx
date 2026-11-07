import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const worlds = [
  { id: 'anime', no: '01', title: 'ANIME / MANGA', line: 'Stories that stay with you.', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1500&q=88', mark: 'FRAME 001' },
  { id: 'gaming', no: '02', title: 'GAMES / PLAY', line: 'Your next life starts here.', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1500&q=88', mark: 'PLAYER 002' },
  { id: 'screen', no: '03', title: 'FILM / SCREEN', line: 'For the ones who know the lore.', image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1500&q=88', mark: 'SCENE 003' },
  { id: 'sound', no: '04', title: 'MUSIC / SOUND', line: 'Wear your soundtrack.', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1500&q=88', mark: 'FREQ 004' },
];

const pieces = [
  { id: '001', name: 'SIGNAL', category: 'APPAREL', descriptor: 'THE FIRST FREQUENCY', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1100&q=88', index: 'OBJECT 001' },
  { id: '002', name: 'AFTERIMAGE', category: 'APPAREL', descriptor: 'A MEMORY IN MOTION', image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1100&q=88', index: 'OBJECT 002' },
  { id: '003', name: 'SIDE QUEST', category: 'CULTURE', descriptor: 'TAKE THE LONG WAY', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd5?auto=format&fit=crop&w=1100&q=88', index: 'OBJECT 003' },
];

const nav = [{ id: 'idea', label: 'THE IDEA' }, { id: 'worlds', label: 'CULTURE' }, { id: 'edit', label: 'THE EDIT' }, { id: 'about', label: 'ABOUT' }];

function Arrow({ diagonal = true }: { diagonal?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="arrow"><path d={diagonal ? 'M6 18 18 6M7 6h11v11' : 'M4 12h15m-6-6 6 6-6 6'} /></svg>;
}

export default function App() {
  const root = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState<(typeof pieces)[number] | null>(null);
  const filtered = filter === 'ALL' ? pieces : pieces.filter((piece) => piece.category === filter);

  const goTo = (id: string) => {
    setMenuOpen(false);
    const target = document.getElementById(id);
    if (!target) return;
    if (lenisRef.current) lenisRef.current.scrollTo(target, { offset: -24, duration: 1.15 });
    else target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = reduced ? null : new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
    lenisRef.current = lenis;
    let tick: ((time: number) => void) | undefined;
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      tick = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }
    const ctx = gsap.context(() => {
      if (!reduced) {
        const heroIntro = gsap.timeline({ defaults: { ease: 'power4.out' } });
        heroIntro
          .fromTo('.hero-topline', { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.65 })
          .fromTo('.hero-copy .eyebrow', { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55 }, '-=0.2')
          .fromTo('.hero h1', { y: 42, autoAlpha: 0, clipPath: 'inset(0 0 18% 0)' }, { y: 0, autoAlpha: 1, clipPath: 'inset(0 0 0% 0)', duration: 1.05 }, '-=0.12')
          .fromTo('.hero-bottom', { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, '-=0.35')
          .fromTo('.hero-image', { clipPath: 'inset(10% 0 10% 0)', autoAlpha: 0.6 }, { clipPath: 'inset(0% 0 0% 0)', autoAlpha: 1, duration: 1.1 }, '-=0.2');
        gsap.to('.hero-image img', { yPercent: 12, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.hero-image', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('.hero-outline', { xPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.7 } });
        gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => gsap.fromTo(el, { y: 52, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));
        gsap.utils.toArray<HTMLElement>('.world-card').forEach((el, i) => {
          const image = el.querySelector('img');
          gsap.fromTo(el, { y: 65, rotate: i % 2 ? 1.5 : -1.5, autoAlpha: 0 }, { y: 0, rotate: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
          if (image) gsap.fromTo(image, { scale: 1.12, clipPath: 'inset(8% 0 8% 0)' }, { scale: 1, clipPath: 'inset(0% 0 0% 0)', duration: 1.25, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        });
        gsap.utils.toArray<HTMLElement>('.piece-card').forEach((el) => gsap.fromTo(el, { y: 45, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
        gsap.fromTo('.manifesto-word', { xPercent: 9 }, { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'top bottom', end: 'bottom top', scrub: 1 } });
        gsap.to('.campaign-image', { yPercent: 9, ease: 'none', scrollTrigger: { trigger: '.campaign', start: 'top bottom', end: 'bottom top', scrub: true } });
      }
    }, root);
    return () => {
      ctx.revert();
      if (lenis && tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', key);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', key); };
  }, [selected]);

  return <div className="site-shell" ref={root}>
    <div className="grain" aria-hidden="true" />
    <header className="site-header">
      <a href="#top" className="brand" aria-label="UNIPARC home" onClick={(e) => { e.preventDefault(); goTo('top'); }}><img src="/Uniparc.svg" alt="UNIPARC" /></a>
      <span className="header-note">A HOME FOR WHAT YOU LOVE</span>
      <button className={menuOpen ? 'menu-toggle is-open' : 'menu-toggle'} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}><span /><span /></button>
      <nav className={menuOpen ? 'header-nav nav-open' : 'header-nav'} aria-label="Main navigation">
        {nav.map((item, i) => <button key={item.id} onClick={() => goTo(item.id)}><sup>0{i + 1}</sup>{item.label}</button>)}
        <button className="nav-cta" onClick={() => goTo('first-drop')}>THE FIRST DROP <Arrow /></button>
      </nav>
    </header>

    <main>
      <section className="hero" id="top">
        <div className="hero-topline"><span><i className="live-dot" /> INDEPENDENT CULTURE LABEL</span><span>IND / EST. 2026</span></div>
        <div className="hero-copy">
          <p className="eyebrow">ALL THE THINGS THAT MAKE YOU, YOU.</p>
          <h1>WEAR WHAT<br /><span className="hero-outline">DEFINES</span> YOU<span className="acid">.</span></h1>
          <div className="hero-bottom"><p>The stories you follow. The games you play. The music you live by. Bring every side of yourself into the picture.</p><button className="round-link" onClick={() => goTo('idea')} aria-label="Explore the UNIPARC idea"><span>SCROLL TO<br />EXPLORE</span><b>↓</b></button></div>
        </div>
        <div className="hero-image"><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=2200&q=90" alt="Streetwear editorial campaign" fetchPriority="high" /><div className="hero-image-shade" /><span className="image-index">UNIPARC / CULTURE STUDY 001</span><span className="image-caption">MADE TO FEEL LIKE YOU.</span><div className="hero-stamp"><span>NO BOXES. NO LIMITS. NO GATEKEEPING. ✳</span><b>U✳</b></div></div>
        <div className="ticker" aria-label="Anime, gaming, music, film and internet culture"><div>ANIME IS CULTURE <b>✳</b> GAMING IS CULTURE <b>✳</b> MUSIC IS CULTURE <b>✳</b> FILM IS CULTURE <b>✳</b> INTERNET IS CULTURE <b>✳</b> ANIME IS CULTURE <b>✳</b> GAMING IS CULTURE <b>✳</b> MUSIC IS CULTURE <b>✳</b></div></div>
      </section>

      <section className="manifesto" id="idea">
        <div className="section-meta"><span>01 / THE IDEA</span><span>A PLACE WHERE CULTURE BELONGS</span></div>
        <div className="manifesto-word" aria-hidden="true">MULTIDIMENSIONAL</div>
        <div className="manifesto-layout">
          <div className="manifesto-title reveal"><p className="eyebrow dark">YOU DON'T HAVE TO PICK JUST ONE.</p><h2>YOU ARE<br />NOT JUST<br /><em>ONE THING.</em></h2></div>
          <div className="manifesto-copy reveal"><span className="signal-line" /><h3>Your style can hold every side of you.</h3><p>Maybe it's a manga you grew up with. A game you lose hours to. A lyric that says what you couldn't. A film you return to.</p><p>The things you love are part of your story — and they deserve a place in it. UNIPARC brings those worlds together in one place. No gatekeeping. No need to choose just one.</p><button className="text-link dark-link" onClick={() => goTo('about')}>GET TO KNOW THE IDEA <Arrow /></button></div>
        </div>
        <div className="manifesto-foot"><span>ONE PERSON. MANY UNIVERSES.</span><span>WEAR WHAT DEFINES YOU.®</span><span>SCROLL / 001</span></div>
      </section>

      <section className="worlds" id="worlds">
        <div className="section-meta"><span>02 / FIND YOUR FREQUENCY</span><span>THE CULTURE INDEX</span></div>
        <div className="section-heading reveal"><div><p className="eyebrow">YOUR INTERESTS. YOUR UNIVERSE.</p><h2>WHAT ARE<br /><em>YOU INTO?</em></h2></div><p>Different interests. One place to explore.<br />Find your world — or discover a new one.</p></div>
        <div className="world-grid">{worlds.map((world) => <button className={'world-card world-' + world.id} key={world.id} onClick={() => goTo('edit')}><img src={world.image} alt="" loading="lazy" /><span className="world-overlay" /><span className="world-top"><small>{world.no} / CULTURE INDEX</small><small>{world.mark}</small></span><span className="world-bottom"><span><b>{world.title}</b><small>{world.line}</small></span><i><Arrow /></i></span><span className="world-ghost">{world.no}</span></button>)}</div>
        <div className="worlds-foot"><span>THAT'S ONLY THE START.</span><span>THERE'S ALWAYS MORE TO DISCOVER <b>↘</b></span></div>
      </section>

      <section className="edit" id="edit">
        <div className="section-meta"><span>03 / THE UNIPARC EDIT</span><span>OBJECTS WITH A POINT OF VIEW</span></div>
        <div className="section-heading edit-heading reveal"><div><p className="eyebrow dark">FIRST LOOK. FRESH SIGNAL.</p><h2>THE FIRST<br /><em>FREQUENCY.</em></h2></div><p>A preview of the ideas and pieces<br />shaping the UNIPARC universe.</p></div>
        <div className="filter-row"><div className="filters" role="group" aria-label="Filter objects">{['ALL', 'APPAREL', 'CULTURE'].map((item) => <button key={item} className={filter === item ? 'filter-active' : ''} onClick={() => setFilter(item)}>{item}<sup>{item === 'ALL' ? '03' : item === 'APPAREL' ? '02' : '01'}</sup></button>)}</div><span>CONCEPT PREVIEW / 2026</span></div>
        <div className="piece-grid">{filtered.map((piece) => <article className="piece-card" key={piece.id}><button className="piece-visual" onClick={() => setSelected(piece)} aria-label={'View ' + piece.name + ' concept'}><img src={piece.image} alt="Editorial apparel concept preview" loading="lazy" /><span className="piece-number">{piece.index}</span><span className="piece-open">VIEW OBJECT <Arrow /></span><span className="piece-caption">{piece.descriptor}</span></button><div className="piece-meta"><b>{piece.name} / {piece.id}</b><span>{piece.category}</span></div></article>)}</div>
        <p className="edit-note"><span>IMPORTANT NOTE</span> These are concept previews, not purchasable products. Final product details and release information will be announced at launch.</p>
      </section>

      <section className="campaign">
        <img className="campaign-image" src="https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=2200&q=90" alt="Crowd at a live music event" loading="lazy" />
        <div className="campaign-shade" /><div className="campaign-content reveal"><p className="eyebrow">04 / CULTURE IS A WAY OF LIFE</p><h2>NEVER JUST<br /><em>A PHASE.</em></h2><p>The stories that shape you. The people who get your references. The interests that never really leave. That's culture — and it's part of everyday life.</p><button className="light-link" onClick={() => goTo('about')}>OUR POINT OF VIEW <Arrow /></button></div><span className="campaign-side">CULTURE LIVES HERE®</span><span className="campaign-index">CULTURE STUDY / 004</span>
      </section>

      <section className="about" id="about">
        <div className="section-meta"><span>05 / OUR POINT OF VIEW</span><span>MORE THAN WHAT YOU WEAR</span></div>
        <div className="about-layout"><div className="about-mark reveal"><img src="/Uniparc.svg" alt="UNIPARC" /><p>A PLACE WHERE<br />CULTURE BELONGS.</p></div><div className="about-copy reveal"><p className="eyebrow dark">BUILT FOR EVERY SIDE OF YOU.</p><h2>MORE THAN<br />WHAT YOU <em>WEAR.</em></h2><h3>A place for every interest, influence and side of you.</h3><p>UNIPARC is a culture-first lifestyle label for people who don't fit into just one category. We bring fandoms, niche interests and everyday inspirations into a shared space for self-expression and belonging.</p><p>Our first pieces are graphic T-shirts — understated from a distance, full of meaning up close. It's the beginning of a wider world built around the things you love.</p><strong>NO GATEKEEPING. NO BOXES TO FIT. JUST ROOM TO BE YOU.</strong></div></div>
      </section>

      <section className="first-drop" id="first-drop">
        <div className="first-drop-orbit" aria-hidden="true">U✳</div><p className="eyebrow">THERE'S ROOM FOR YOU HERE.</p><h2>FIND YOUR<br /><em>PEOPLE.</em></h2><div className="first-drop-bottom"><p>The first UNIPARC drop is in the works.<br />The next chapter starts here.</p><button onClick={() => goTo('top')}>BACK TO THE TOP <Arrow /></button></div>
      </section>
    </main>

    <footer className="site-footer" id="footer">
      <div className="footer-main"><div className="footer-brand"><a href="#top" onClick={(e) => { e.preventDefault(); goTo('top'); }}><img src="/Uniparc.svg" alt="UNIPARC" /></a><p>A culture-first label<br />for every side of you.</p><span>WEAR WHAT DEFINES YOU.®</span></div><div className="footer-column"><b>EXPLORE</b><button onClick={() => goTo('idea')}>THE IDEA <span>01</span></button><button onClick={() => goTo('worlds')}>CULTURE INDEX <span>02</span></button><button onClick={() => goTo('edit')}>THE UNIPARC EDIT <span>03</span></button><button onClick={() => goTo('about')}>OUR STORY <span>05</span></button></div><div className="footer-column"><b>THE UNIVERSE</b><button onClick={() => goTo('worlds')}>ANIME & MANGA</button><button onClick={() => goTo('worlds')}>GAMING</button><button onClick={() => goTo('worlds')}>FILM & SCREEN</button><button onClick={() => goTo('worlds')}>MUSIC & MORE</button></div><div className="footer-note"><b>A PLACE WHERE CULTURE BELONGS.</b><p>From the stories you follow to the worlds you explore, there's room for every side of you here.</p><button onClick={() => goTo('edit')}>DISCOVER THE EDIT ↗</button></div></div>
      <div className="footer-bottom"><span>© UNIPARC 2026. ALL RIGHTS RESERVED.</span><span>INDEPENDENT CULTURE / EST. 2026</span><button onClick={() => goTo('top')}>BACK TO TOP ↑</button></div>
    </footer>

    {selected && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}><section className="object-modal" role="dialog" aria-modal="true" aria-labelledby="object-title"><div className="modal-image"><img src={selected.image} alt="Concept preview" /><span>UNIPARC® / OBJECT STUDY {selected.id}</span></div><div className="modal-copy"><div className="modal-top"><span>OBJECT FILE / {selected.id}</span><button onClick={() => setSelected(null)} aria-label="Close object details">CLOSE ×</button></div><p className="eyebrow dark">{selected.category} — {selected.descriptor}</p><h2 id="object-title">{selected.name}<span className="acid">.</span></h2><p>A wearable expression of the worlds, stories and details that stay with you. This concept is part of the evolving UNIPARC universe — made for every side of you.</p><div className="modal-detail"><span>COLLECTION</span><b>THE UNIPARC EDIT</b><span>STATUS</span><b>CONCEPT PREVIEW</b><span>RELEASE</span><b>TO BE ANNOUNCED</b></div><small>Preview only. This object is not currently available to purchase.</small></div></section></div>}
  </div>;
}
