import { useState } from 'react';

const culture = [
  { title: 'ANIME & MANGA', line: 'Stories that become part of you.', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=88', span: 'wide' },
  { title: 'GAMES & PLAY', line: 'Worlds you never really leave.', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=88', span: 'tall' },
  { title: 'FILM & SOUND', line: 'Frames, lyrics and feelings on repeat.', image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1000&q=88', span: '' },
  { title: 'ART, SPORT & INTERNET', line: 'The culture happening right now.', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1200&q=88', span: 'wide' },
];

const pieces = [
  { code: '001', name: 'GORGON', note: 'BEAUTY WITH A BITE', image: '/images/objects/gorgon-001.webp' },
  { code: '003', name: 'SERIOUS', note: 'NOT EVERYTHING IS THAT DEEP', image: '/images/objects/serious-003.webp' },
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="up-site">
      <header className="up-header">
        <a className="up-brand" href="#top" aria-label="UNIPARC home"><img src="/Uniparc.svg" alt="UNIPARC" /></a>
        <button className="up-menu-toggle" type="button" aria-expanded={menuOpen} aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}><span /> <span /></button>
        <nav className={menuOpen ? 'up-nav is-open' : 'up-nav'} aria-label="Main navigation">
          <a href="#culture" onClick={() => setMenuOpen(false)}>CULTURE</a>
          <a href="#edit" onClick={() => setMenuOpen(false)}>THE EDIT</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>ABOUT</a>
          <a className="up-nav-cta" href="https://www.instagram.com/uniparc.in/" target="_blank" rel="noreferrer">FOLLOW THE SIGNAL ↗</a>
        </nav>
      </header>

      <main id="top">
        <section className="up-hero">
          <div className="up-hero-copy">
            <p className="up-eyebrow"><span className="up-dot" /> AN INDEPENDENT CULTURE LABEL</p>
            <h1>WEAR WHAT<br /><em>DEFINES</em> YOU<span>.</span></h1>
            <div className="up-hero-bottom">
              <p>The worlds you love. The stories that stay. The things that make you, you. This is where they belong.</p>
              <a className="up-link-light" href="#culture">STEP INTO OUR WORLD <span>↓</span></a>
            </div>
          </div>
          <div className="up-hero-image">
            <img src="/images/hero/uniparc-hero.webp" alt="UNIPARC graphic apparel campaign" fetchPriority="high" />
            <span className="up-image-caption">CULTURE IS PERSONAL. EXPRESSION SHOULD BE TOO.</span>
            <span className="up-image-index">UNIPARC / 001</span>
          </div>
          <div className="up-hero-foot"><span>BUILT AROUND WHAT YOU LOVE</span><span>EST. 2026 · INDIA</span></div>
        </section>

        <section className="up-culture" id="culture">
          <div className="up-section-head">
            <div><p className="up-eyebrow">A UNIVERSE OF INFLUENCES</p><h2>YOU ARE<br /><em>MORE THAN ONE THING.</em></h2></div>
            <p className="up-section-intro">Anime. Games. Film. Music. Art. Sport. Internet culture. Your interests don't live in separate boxes — and neither do you.</p>
          </div>
          <div className="up-culture-grid">
            {culture.map((item, index) => <article className={'up-culture-card ' + item.span} key={item.title}>
              <img src={item.image} alt="" loading="lazy" />
              <div className="up-card-shade" />
              <span className="up-card-number">0{index + 1} / CULTURE</span>
              <div className="up-card-copy"><h3>{item.title}</h3><p>{item.line}</p></div>
            </article>)}
          </div>
          <p className="up-culture-foot">NO SINGLE LANE. NO GATEKEEPING. <b>ROOM FOR EVERY SIDE OF YOU.</b></p>
        </section>

        <section className="up-manifesto" id="about">
          <div className="up-manifesto-mark">U<span>✳</span></div>
          <div className="up-manifesto-copy">
            <p className="up-eyebrow">WHAT WE BELIEVE</p>
            <h2>CULTURE ISN'T<br />WHAT YOU FOLLOW.<br /><em>IT'S WHO YOU ARE.</em></h2>
            <p className="up-manifesto-body">We’re building a place for people shaped by more than one world. A culture-led label that turns the references, memories and obsessions that make us who we are into a shared language for self-expression.</p>
            <span className="up-manifesto-signoff">ONE IDENTITY. INFINITE INFLUENCES.</span>
          </div>
        </section>

        <section className="up-edit" id="edit">
          <div className="up-section-head up-edit-head">
            <div><p className="up-eyebrow">THE FIRST CHAPTER</p><h2>THE<br /><em>UNIPARC EDIT.</em></h2></div>
            <p className="up-section-intro">Original ideas, cultural references and considered design. A first look at what we're creating.</p>
          </div>
          <div className="up-piece-grid">
            {pieces.map(piece => <article className="up-piece" key={piece.code}>
              <div className="up-piece-image"><img src={piece.image} alt={`UNIPARC ${piece.name} graphic apparel design`} loading="lazy" /><span>OBJECT / {piece.code}</span></div>
              <div className="up-piece-meta"><h3>{piece.name}</h3><p>{piece.note}</p></div>
            </article>)}
          </div>
          <div className="up-edit-note"><span>EARLY DESIGN PREVIEW</span><p>Product details and marketplace availability will be announced with the first drop.</p></div>
        </section>

        <section className="up-community">
          <img src="https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=2200&q=88" alt="A crowd sharing a live music moment" loading="lazy" />
          <div className="up-community-overlay" />
          <div className="up-community-copy"><p className="up-eyebrow">THIS IS BIGGER THAN APPAREL</p><h2>CULTURE<br /><em>LIVES HERE.</em></h2><p>For the deep-divers, the day-ones, the collectors, the creators and everyone who just gets it.</p><a href="https://www.instagram.com/uniparc.in/" target="_blank" rel="noreferrer">FIND YOUR PEOPLE ON INSTAGRAM ↗</a></div>
        </section>
      </main>

      <footer className="up-footer">
        <div className="up-footer-top"><img src="/Uniparc.svg" alt="UNIPARC" /><p>A place where every side of you belongs.</p></div>
        <div className="up-footer-bottom"><span>© UNIPARC 2026. ALL RIGHTS RESERVED.</span><div><a href="mailto:hello@uniparc.in">HELLO@UNIPARC.IN</a><a href="https://www.instagram.com/uniparc.in/" target="_blank" rel="noreferrer">INSTAGRAM ↗</a></div><a href="#top">BACK TO TOP ↑</a></div>
      </footer>
    </div>
  );
}
