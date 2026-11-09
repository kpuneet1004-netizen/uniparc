import { FormEvent, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const cultureWorlds = [
  { number: '01', title: 'ANIME & MANGA', note: 'Stories that stay with you', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1100&q=85', className: 'culture-anime' },
  { number: '02', title: 'GAMING', note: 'Worlds beyond the screen', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1100&q=85', className: 'culture-gaming' },
  { number: '03', title: 'FILM & CINEMA', note: 'For the ones who know the lore', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1100&q=85', className: 'culture-film' },
  { number: '04', title: 'MUSIC', note: 'Feel every frequency', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1100&q=85', className: 'culture-music' },
  { number: '05', title: 'ART & DESIGN', note: 'Ideas made visible', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1100&q=85', className: 'culture-art' },
  { number: '06', title: 'INTERNET CULTURE', note: 'The references only you get', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1100&q=85', className: 'culture-internet' },
];

const experienceStories = [
  { number: '01', title: 'CHASE THE UNKNOWN', category: 'OUT THERE', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1100&q=85', alt: 'Mountain landscape under an open sky' },
  { number: '02', title: 'FIND YOUR FREQUENCY', category: 'IN THE CROWD', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1100&q=85', alt: 'Live music crowd at a concert' },
  { number: '03', title: 'TAKE THE LONG WAY', category: 'ON THE ROAD', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1100&q=85', alt: 'Open road through a dramatic landscape' },
];

const Arrow = ({ diagonal = false }: { diagonal?: boolean }) => (
  <svg aria-hidden="true" viewBox="0 0 20 20" className="arrow-icon" fill="none">
    <path d={diagonal ? 'M5 15 15 5M6 5h9v9' : 'M3 10h13m-5-5 5 5-5 5'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function SectionEyebrow({ number, label, right }: { number: string; label: string; right?: string }) {
  return <div className="section-eyebrow"><span>{number} / {label}</span>{right && <span>{right}</span>}</div>;
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [{ label: 'THE IDEA', href: '#manifesto' }, { label: 'CULTURE', href: '#culture' }, { label: 'EXPERIENCES', href: '#experiences' }, { label: 'THE EDIT', href: '#edit' }, { label: 'COMMUNITY', href: '#community' }];
  return (
    <header className="site-header">
      <a className="brand-lockup" href="#home" aria-label="UNIPARC home"><img src="/Uniparc.svg" alt="UNIPARC" /></a>
      <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}><span>{menuOpen ? 'CLOSE' : 'MENU'}</span><i className={menuOpen ? 'menu-icon is-open' : 'menu-icon'} /></button>
      <nav id="primary-navigation" className={menuOpen ? 'primary-nav is-open' : 'primary-nav'} aria-label="Primary navigation">
        {links.map((link) => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>)}
      </nav>
      <a className="header-cta" href="https://www.instagram.com/uniparc.in/" target="_blank" rel="noreferrer">FOLLOW THE SIGNAL <Arrow diagonal /></a>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="hero-section" id="home">
      <div className="hero-topline"><span><i className="live-dot" /> CULTURE-FIRST LIFESTYLE BRAND</span><span>INDEPENDENT CULTURE / INDIA</span></div>
      <div className="hero-copy">
        <p className="eyebrow hero-eyebrow">A PLACE WHERE CULTURE BELONGS.</p>
        <h1 className="hero-title"><span>ALL THE THINGS</span><span>THAT MAKE <em>YOU,</em></span><span className="hero-last-line">YOU<span className="lime-period">.</span></span></h1>
        <div className="hero-bottomline"><p>The stories you follow. The worlds you get lost in. The experiences that stay with you. It all makes you, you.</p><a className="round-link" href="#manifesto" aria-label="Explore the UNIPARC universe"><span>SCROLL TO EXPLORE</span><b><Arrow /></b></a></div>
      </div>
      <div className="hero-image-wrap">
        <img className="hero-image" src="/images/hero/uniparc-hero.webp" alt="UNIPARC apparel in a cinematic editorial setting" fetchPriority="high" />
        <div className="hero-image-shade" />
        <span className="image-index">UNIPARC® / CULTURE STUDY 001</span>
        <span className="image-caption">WEAR WHAT DEFINES YOU.</span>
        <span className="image-coordinate">15° 21' N / 75° 08' E</span>
      </div>
      <div className="hero-ticker" aria-label="Culture includes anime, gaming, music, film and more"><div>ANIME IS CULTURE <b>✳</b> GAMING IS CULTURE <b>✳</b> MUSIC IS CULTURE <b>✳</b> FILM IS CULTURE <b>✳</b> ART IS CULTURE <b>✳</b> INTERNET IS CULTURE <b>✳</b></div></div>
    </section>
  );
}

function ManifestoSection() {
  return (
    <section className="manifesto-section section-shell" id="manifesto">
      <SectionEyebrow number="01" label="THE IDEA" right="YOU WERE NEVER JUST ONE THING" />
      <div className="manifesto-layout">
        <div className="manifesto-heading"><p className="eyebrow">NO BOXES. NO LABELS.</p><h2>YOU ARE<br />MORE THAN<br /><em>ONE THING.</em></h2></div>
        <div className="manifesto-copy"><span className="manifesto-mark">✳</span><p className="copy-lead">You don't have to pick just one thing to be yourself.</p><p>The anime you grew up watching. The game you lose hours playing. The music that changes your mood. The film you keep coming back to. The things you love are part of your story.</p><p>And there's a whole world beyond them waiting to be experienced. UNIPARC brings those worlds together through culture, creativity, experiences, community and apparel.</p><a className="text-link" href="#culture">EXPLORE YOUR WORLD <Arrow diagonal /></a></div>
      </div>
      <div className="manifesto-foot"><span>CULTURE DEFINES US.</span><span>EXPERIENCES BRING US TOGETHER.</span><span>APPAREL LETS US EXPRESS OURSELVES.</span></div>
    </section>
  );
}

function CultureSection() {
  return (
    <section className="culture-section section-shell" id="culture">
      <SectionEyebrow number="02" label="CULTURE INDEX" right="FIND YOUR FREQUENCY" />
      <div className="section-intro"><div><p className="eyebrow">WHAT'S YOUR WORLD?</p><h2>THERE'S MORE<br />THAN <em>ONE.</em></h2></div><p>Different interests. Different obsessions. Different ways of seeing the world. Explore what you love — and find something new.</p></div>
      <div className="culture-grid">
        {cultureWorlds.map((world) => <a className={'culture-card ' + world.className} href="https://www.instagram.com/uniparc.in/" target="_blank" rel="noreferrer" key={world.number}>
          <img src={world.image} alt="" loading="lazy" decoding="async" />
          <span className="culture-overlay" />
          <span className="culture-number">{world.number} / CULTURE INDEX</span>
          <span className="culture-card-bottom"><span><strong>{world.title}</strong><small>{world.note}</small></span><b><Arrow diagonal /></b></span>
        </a>)}
      </div>
      <p className="section-footnote"><span>THE UNIVERSE DOESN'T STOP HERE.</span><span>AND NEITHER DO YOU. <b>↗</b></span></p>
    </section>
  );
}

function ExperiencesSection() {
  return (
    <section className="experiences-section section-shell" id="experiences">
      <SectionEyebrow number="03" label="EXPERIENCES" right="LIFE HAPPENS OUT THERE" />
      <div className="experiences-intro"><p className="eyebrow">MORE TO LIFE THAN THE FEED.</p><h2>MAKE IT A<br /><em>STORY.</em></h2><div><p className="copy-lead">Some things are better experienced than explained.</p><p>The first race. The unexpected trip. The concert you never want to end. The thing you were nervous to try — and glad you did.</p></div></div>
      <div className="experience-grid">
        {experienceStories.map((story) => <article className="experience-card" key={story.number}>
          <div className="experience-image"><img src={story.image} alt={story.alt} loading="lazy" decoding="async" /><span>{story.category}</span></div>
          <div className="experience-meta"><span>{story.number} / EXPERIENCE STUDY</span><span>DISCOVER MORE ↗</span></div>
          <h3>{story.title}</h3>
        </article>)}
      </div>
      <p className="experience-note">EXPERIENCES WORTH REMEMBERING. STORIES WORTH SHARING.</p>
    </section>
  );
}

function EditSection() {
  return (
    <section className="edit-section section-shell" id="edit">
      <SectionEyebrow number="04" label="THE UNIPARC EDIT" right="A TANGIBLE EXPRESSION OF IDENTITY" />
      <div className="edit-layout">
        <div className="edit-copy"><p className="eyebrow">MADE FOR THE THINGS THAT MAKE YOU, YOU.</p><h2>NOT JUST<br />WHAT YOU<br /><em>WEAR.</em></h2><p className="copy-lead">A little piece of the worlds you carry with you.</p><p>Our apparel is where culture becomes personal. Original creative expressions, thoughtful details and pieces designed to feel like you — not like everyone else.</p><a className="text-link" href="https://www.instagram.com/uniparc.in/" target="_blank" rel="noreferrer">DISCOVER UNIPARC <Arrow diagonal /></a></div>
        <div className="edit-visual"><img src="/images/hero/uniparc-hero.webp" alt="UNIPARC apparel editorial photograph" loading="lazy" /><span className="edit-visual-label">THE UNIPARC EDIT <b>001</b></span><span className="edit-visual-stamp">WEAR<br />WHAT<br />DEFINES<br />YOU.</span></div>
      </div>
      <p className="edit-disclaimer">COLLECTIONS AND PRODUCT AVAILABILITY ARE ANNOUNCED THROUGH OFFICIAL UNIPARC CHANNELS.</p>
    </section>
  );
}

function DesignStorySection() {
  return (
    <section className="design-story-section section-shell" id="design-story">
      <SectionEyebrow number="05" label="BEHIND THE DESIGN" right="REFERENCE → INSIGHT → TWIST" />
      <div className="design-story-heading"><p className="eyebrow">EVERY DESIGN HAS A STORY.</p><h2>LOOK CLOSER.<br /><em>THINK DIFFERENT.</em></h2></div>
      <div className="design-story-steps">
        <article><span>01</span><h3>REFERENCE</h3><p>Start with a cultural moment, a memory, an idea or a detail worth noticing.</p></article>
        <article><span>02</span><h3>INSIGHT</h3><p>Find the emotion, meaning or shared connection underneath the reference.</p></article>
        <article><span>03</span><h3>TWIST</h3><p>Reinterpret it through an original UNIPARC creative point of view.</p></article>
      </div>
      <div className="design-story-footer"><span>THE IDEA BEHIND THE IMAGE.</span><span>THE MEANING BEHIND THE DESIGN. <b>↗</b></span></div>
    </section>
  );
}

function CommunitySection() {
  return (
    <section className="community-section section-shell" id="community">
      <div className="community-image"><img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1800&q=85" alt="Friends spending time together outdoors" loading="lazy" /><span className="community-image-note">PEOPLE MAKE THE CULTURE.</span></div>
      <div className="community-copy"><SectionEyebrow number="06" label="UNIPARC IRL" right="CULTURE IS BETTER WHEN IT'S SHARED" /><p className="eyebrow">A PLACE FOR EVERY SIDE OF YOU.</p><h2>FIND YOUR<br /><em>PEOPLE.</em></h2><p className="copy-lead">Different worlds. Shared energy.</p><p>We're building a space for the people who make culture what it is. The ones who create, collect, explore, obsess and bring others along for the ride.</p><a className="text-link" href="https://www.instagram.com/uniparc.in/" target="_blank" rel="noreferrer">JOIN THE CONVERSATION <Arrow diagonal /></a></div>
    </section>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('Email signup is not connected yet. Follow UNIPARC for the next update.');
    setEmail('');
  };
  return (
    <section className="newsletter-section section-shell" id="newsletter">
      <SectionEyebrow number="07" label="STAY CONNECTED" right="NO NOISE. JUST THINGS WORTH YOUR ATTENTION." />
      <div className="newsletter-layout"><div><p className="eyebrow">STAY IN THE LOOP. STAY YOURSELF.</p><h2>GET THE<br /><em>SIGNAL.</em></h2></div><div className="newsletter-form-wrap"><p>New ideas. Fresh perspectives. Stories worth discovering. First looks at what's coming.</p><form onSubmit={onSubmit}><label htmlFor="newsletter-email">EMAIL ADDRESS</label><div className="newsletter-input-row"><input id="newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /><button type="submit" aria-label="Submit email address"><Arrow diagonal /></button></div><small aria-live="polite">{message || 'Email collection will be enabled when the signup service is connected.'}</small></form></div></div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer" id="footer">
      <div className="footer-main"><div className="footer-brand"><a href="#home" aria-label="UNIPARC home"><img src="/Uniparc.svg" alt="UNIPARC" /></a><p>A PLACE WHERE CULTURE BELONGS.</p></div>
        <div className="footer-column"><span>EXPLORE</span><a href="#manifesto">THE IDEA</a><a href="#culture">CULTURE INDEX</a><a href="#experiences">EXPERIENCES</a><a href="#edit">THE UNIPARC EDIT</a></div>
        <div className="footer-column"><span>THE BRAND</span><a href="#design-story">BEHIND THE DESIGN</a><a href="#community">UNIPARC IRL</a><a href="#newsletter">STAY CONNECTED</a></div>
        <div className="footer-social"><span>FOLLOW THE SIGNAL</span><a href="https://www.instagram.com/uniparc.in/" target="_blank" rel="noreferrer">INSTAGRAM <Arrow diagonal /></a></div>
      </div>
      <div className="footer-bottom"><span>© UNIPARC 2026. ALL RIGHTS RESERVED.</span><span>WEAR WHAT DEFINES YOU.</span><a href="#home">BACK TO TOP ↑</a></div>
    </footer>
  );
}

export default function App() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: { offset: -24 } });
    const tick = (time: number) => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const context = gsap.context(() => {
      gsap.from('.hero-eyebrow, .hero-title span, .hero-bottomline, .hero-image-wrap', { y: 32, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' });
      gsap.utils.toArray<HTMLElement>('.section-eyebrow, .manifesto-heading, .manifesto-copy, .section-intro, .culture-card, .experiences-intro, .experience-card, .edit-copy, .edit-visual, .design-story-heading, .design-story-steps article, .community-copy, .newsletter-layout').forEach((element) => {
        gsap.from(element, { y: 34, autoAlpha: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } });
      });
      gsap.to('.hero-image', { yPercent: 8, scale: 1.06, ease: 'none', scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 0.7 } });
      gsap.to('.manifesto-heading h2', { xPercent: -2, ease: 'none', scrollTrigger: { trigger: '.manifesto-section', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
      gsap.utils.toArray<HTMLElement>('.culture-card img, .experience-image img').forEach((image) => {
        gsap.to(image, { scale: 1.08, ease: 'none', scrollTrigger: { trigger: image, start: 'top bottom', end: 'bottom top', scrub: 0.7 } });
      });
    });
    return () => { context.revert(); ScrollTrigger.getAll().forEach((trigger) => trigger.kill()); gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);

  return <div className="site-shell"><SiteHeader /><main><HeroSection /><ManifestoSection /><CultureSection /><ExperiencesSection /><EditSection /><DesignStorySection /><CommunitySection /><NewsletterSection /></main><SiteFooter /></div>;
}
