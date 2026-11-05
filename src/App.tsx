import { useState } from 'react';

const worlds = [
  { id: 'anime', number: '01', name: 'ANIME / MANGA', note: 'Stories that stay with you', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=85' },
  { id: 'gaming', number: '02', name: 'GAMES / PLAY', note: 'Your next life starts here', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85' },
  { id: 'screen', number: '03', name: 'FILM / SCREEN', note: 'For the ones who know the lore', image: 'https://images.unsplash.com/photo-1489599849927-2ee91 bipolar?auto=format&fit=crop&w=1200&q=85' },
  { id: 'sound', number: '04', name: 'MUSIC / SOUND', note: 'Wear your soundtrack', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=85' },
];

const pieces = [
  { id: '01', name: 'SIGNAL / 001', category: 'APPAREL', label: 'THE FIRST FREQUENCY', color: 'lime', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85' },
  { id: '02', name: 'AFTERIMAGE / 002', category: 'APPAREL', label: 'A MEMORY IN MOTION', color: 'violet', image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1000&q=85' },
  { id: '03', name: 'SIDE QUEST / 003', category: 'CULTURE', label: 'TAKE THE LONG WAY', color: 'orange', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd5?auto=format&fit=crop&w=1000&q=85' },
];

function Arrow() { return <span aria-hidden="true" className="arrow">↗</span>; }

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const filtered = activeFilter === 'ALL' ? pieces : pieces.filter((piece) => piece.category === activeFilter);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site">
      <header className="topbar">
        <a className="wordmark" href="#home" aria-label="UNIPARC home">UNI<span>PARC</span><sup>®</sup></a>
        <nav className={menuOpen ? 'nav nav-open' : 'nav'} aria-label="Main navigation">
          <a href="#worlds" onClick={closeMenu}>THE WORLDS</a>
          <a href="#drop" onClick={closeMenu}>THE DROP</a>
          <a href="#about" onClick={closeMenu}>OUR POINT OF VIEW</a>
        </nav>
        <a className="nav-cta" href="#drop">EXPLORE THE EDIT <Arrow /></a>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? 'CLOSE −' : 'MENU +'}</button>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-topline"><span><i className="status-dot" /> AN INDEPENDENT CULTURE LABEL</span><span>MADE FOR THE MANY WORLDS IN YOU</span></div>
          <div className="hero-copy">
            <p className="eyebrow">YOUR INTERESTS. YOUR IDENTITIES. YOUR UNIVERSE.</p>
            <h1>WEAR WHAT<br /><em>DEFINES</em> YOU<span className="period">.</span></h1>
            <div className="hero-bottom">
              <p>Pop culture is personal. UNIPARC is a home for the stories, sounds and subcultures that make you, unmistakably you.</p>
              <a className="circle-link" href="#manifesto" aria-label="Discover UNIPARC">↓</a>
            </div>
          </div>
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=2000&q=90" alt="Streetwear editorial campaign" />
            <div className="hero-image-caption"><span>UNIPARC / CULTURE STUDY 001</span><span>NOT MADE TO BLEND IN.</span></div>
            <span className="image-index">FIG. 001 — THE EVERYDAY UNIVERSE</span>
          </div>
          <div className="ticker" aria-label="Anime, gaming, music, film, internet culture"><div>ANIME IS CULTURE ✳ GAMING IS CULTURE ✳ MUSIC IS CULTURE ✳ FILM IS CULTURE ✳ INTERNET IS CULTURE ✳&nbsp;</div></div>
        </section>

        <section className="manifesto section" id="manifesto">
          <div className="section-label"><span>01 / THE IDEA</span><span>A PLACE WHERE CULTURE BELONGS</span></div>
          <div className="manifesto-grid">
            <h2>YOU ARE<br />NOT <em>ONE</em><br />THING.</h2>
            <div className="manifesto-text">
              <p className="lead">And your style shouldn't have to be either.</p>
              <p>One day it's a manga panel. The next, a late-night game, a lyric that hits too close, or a film you quote by heart. The things you love become part of how you see the world.</p>
              <p>UNIPARC brings those worlds together. No labels to fit into. No gatekeeping at the door.</p>
              <a className="text-link" href="#about">GET TO KNOW UNIPARC <Arrow /></a>
            </div>
          </div>
          <div className="manifesto-foot"><span>ONE PERSON. MANY UNIVERSES.</span><span>WEAR WHAT DEFINES YOU.®</span></div>
        </section>

        <section className="worlds section" id="worlds">
          <div className="section-heading">
            <div><span className="eyebrow">02 / FIND YOUR FREQUENCY</span><h2>WHAT ARE<br /><em>YOU INTO?</em></h2></div>
            <p>Different worlds. Shared energy.<br />There's room for all of it here.</p>
          </div>
          <div className="world-grid">
            {worlds.map((world) => <a className={'world-card world-' + world.id} href="#drop" key={world.id}>
              <img src={world.image} alt="" loading="lazy" />
              <span className="world-shade" />
              <span className="world-number">{world.number} / CULTURE INDEX</span>
              <span className="world-info"><span><strong>{world.name}</strong><small>{world.note}</small></span><b><Arrow /></b></span>
            </a>)}
          </div>
          <p className="worlds-note">AND THAT'S JUST THE BEGINNING. CULTURE NEVER STANDS STILL.</p>
        </section>

        <section className="drop section" id="drop">
          <div className="section-heading drop-heading">
            <div><span className="eyebrow">03 / THE UNIPARC EDIT</span><h2>FIRST LOOK.<br /><em>FRESH SIGNAL.</em></h2></div>
            <p>A considered selection of ideas, objects<br />and things worth wearing.</p>
          </div>
          <div className="filter-bar" role="group" aria-label="Filter collection">
            {['ALL', 'APPAREL', 'CULTURE'].map((filter) => <button key={filter} className={activeFilter === filter ? 'selected' : ''} onClick={() => setActiveFilter(filter)}>{filter}<sup>{filter === 'ALL' ? '03' : '02'}</sup></button>)}
            <span>EDITORIAL PREVIEW / 2026</span>
          </div>
          <div className="piece-grid">
            {filtered.map((piece) => <article className="piece-card" key={piece.id}>
              <div className={'piece-image ' + piece.color}><img src={piece.image} alt="Editorial apparel inspiration" loading="lazy" /><span className="piece-index">OBJECT / {piece.id}</span><span className="piece-arrow"><Arrow /></span><span className="piece-caption">{piece.label}</span></div>
              <div className="piece-meta"><span>{piece.name}</span><span>{piece.category}</span></div>
            </article>)}
          </div>
          <p className="drop-disclaimer">A CREATIVE PREVIEW — PRODUCT DETAILS AND OFFICIAL DROP INFORMATION WILL BE ADDED BEFORE LAUNCH.</p>
        </section>

        <section className="campaign">
          <img src="https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=2000&q=90" alt="Crowd at a live music event" loading="lazy" />
          <div className="campaign-overlay" />
          <div className="campaign-content"><span className="eyebrow">04 / CULTURE IS A WAY OF LIFE</span><h2>NEVER JUST<br /><em>A PHASE.</em></h2><p>The references you carry. The communities you find. The things that stay with you long after the screen fades to black.</p><a href="#about" className="light-link">THAT'S THE UNIPARC SPIRIT <Arrow /></a></div>
          <span className="campaign-mark">CULTURE<br />LIVES HERE®</span>
        </section>

        <section className="about section" id="about">
          <div className="about-side"><span className="eyebrow">05 / OUR POINT OF VIEW</span><div className="about-symbol">U<span>✳</span></div><span className="about-side-note">A PLACE WHERE<br />CULTURE BELONGS.</span></div>
          <div className="about-main"><h2>MORE THAN<br />WHAT YOU <em>WEAR.</em></h2><p className="lead">A little bit of everything that makes you, you.</p><p>UNIPARC is a culture-first lifestyle label built around identity, self-expression and belonging. We make space for fandoms, niche interests, shared obsessions and the unexpected things that bring people together.</p><p>We start with graphic T-shirts: a quiet mark on the front, a world of meaning on the back. And we keep building from there.</p><strong>NO GATEKEEPING. NO SINGLE BOX. JUST YOU.</strong></div>
        </section>

        <section className="closing section">
          <span className="eyebrow">THE UNIVERSE IS BIGGER TOGETHER</span>
          <h2>FIND YOUR<br /><em>PEOPLE.</em></h2>
          <p>Stay close. The first drop is taking shape.</p>
          <a className="closing-link" href="#home">BACK TO THE TOP ↑</a>
        </section>
      </main>

      <footer className="footer">
        <a className="footer-logo" href="#home">UNIPARC<sup>®</sup></a>
        <span>WEAR WHAT DEFINES YOU.</span>
        <span>© UNIPARC 2026</span>
      </footer>
    </div>
  );
}
