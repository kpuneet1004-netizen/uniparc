import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { SiteHeader, HeroSection, ManifestoSection, CultureSection, ExperiencesSection, EditSection, DesignStorySection, CommunitySection, NewsletterSection, SiteFooter } from './components/site-sections';

gsap.registerPlugin(ScrollTrigger);

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

  return <div className="site-shell"><a className="skip-link" href="#main-content">SKIP TO CONTENT</a><SiteHeader /><main id="main-content"><HeroSection /><ManifestoSection /><CultureSection /><ExperiencesSection /><EditSection /><DesignStorySection /><CommunitySection /><NewsletterSection /></main><SiteFooter /></div>;
}
