import {useEffect,useState} from 'react';
import {ArrowDown,ArrowLeft,ArrowRight,ArrowUpRight,Menu,X,Plus,MoveUpRight} from 'lucide-react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const categories=[
 {id:'anime',index:'01',name:'ANIME',sub:'Worlds worth getting lost in.',image:'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1400&q=90'},
 {id:'gaming',index:'02',name:'GAMING',sub:'Continue? Always.',image:'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1400&q=90'},
 {id:'music',index:'03',name:'MUSIC',sub:'For the ones on repeat.',image:'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1400&q=90'},
 {id:'street',index:'04',name:'STREET CULTURE',sub:'Wear your point of view.',image:'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1400&q=90'}
];
const edits=[
 {number:'001',name:'THE AFTER HOURS EDIT',type:'STYLE / CULTURE',image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1000&q=90',note:'OFF-DUTY UNIFORM'},
 {number:'002',name:'PLAYER ONE',type:'GAMING / STREETWEAR',image:'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1000&q=90',note:'READY WHEN YOU ARE'},
 {number:'003',name:'LORE DEPT.',type:'ANIME / EVERYDAY',image:'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=1000&q=90',note:'FOR THE DEEP DIVERS'}
];
const faqs=[
 ['Where can I shop UNIPARC?','Each live product will take you directly to its verified marketplace listing. Product destinations will appear here as drops go live.'],
 ['What is UNIPARC?','UNIPARC is a pop-culture label for the things you love, the worlds you escape into and the references only your people understand.'],
 ['Will new drops be added?','This is where new collections, collaborations and limited edits will be announced.']
];
export default function App(){
 const [menuOpen,setMenuOpen]=useState(false),[activeFaq,setActiveFaq]=useState<number|null>(null),[activeCategory,setActiveCategory]=useState('ALL');
 useEffect(()=>{
  const ctx=gsap.context(()=>{
   gsap.fromTo('.hero-copy > *',{y:36,opacity:0},{y:0,opacity:1,duration:.85,stagger:.1,ease:'power3.out',delay:.15});
   gsap.fromTo('.hero-artwork',{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:1.15,ease:'power4.inOut',delay:.2});
   gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el=>gsap.fromTo(el,{y:34,opacity:0},{y:0,opacity:1,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}}));
  });
  return()=>ctx.revert();
 },[]);
 const go=(id:string)=>{setMenuOpen(false);document.getElementById(id)?.scrollIntoView({behavior:'smooth'});};
 const filtered=activeCategory==='ALL'?edits:edits.filter((_,i)=>activeCategory==='APPAREL'||(activeCategory==='CULTURE'&&i!==1));
 return <div className="site-shell">
  <header className="site-header">
   <button className="nav-menu" onClick={()=>setMenuOpen(v=>!v)} aria-label={menuOpen?'Close navigation':'Open navigation'}>{menuOpen?<X/>:<Menu/>}<span>{menuOpen?'CLOSE':'MENU'}</span></button>
   <a className="brand-lockup" href="#top" aria-label="UNIPARC home"><img src="/assets/uniparc-logo.webp" alt="UNIPARC"/></a>
   <nav className="desktop-nav"><button onClick={()=>go('universe')}>THE UNIVERSE</button><button onClick={()=>go('edits')}>LATEST EDITS</button><button onClick={()=>go('about')}>ABOUT</button></nav>
   <button className="nav-shop" onClick={()=>go('edits')}>EXPLORE <ArrowUpRight size={15}/></button>
  </header>
  <main id="top">
   <section className="hero">
    <div className="hero-topline"><span><i/> INDEPENDENT POP-CULTURE LABEL</span><span>EST. MMXXIV&nbsp; / &nbsp;INDIA</span></div>
    <div className="hero-layout">
     <div className="hero-copy">
      <p className="hero-kicker">YOUR INTERESTS. NO EXPLANATION NEEDED.</p>
      <h1>MADE OF<br/><span>WHAT</span><br/>YOU <b>LOVE.</b></h1>
      <div className="hero-foot"><p>For the fandoms, the soundtracks, the late-night rabbit holes and the things that make you unmistakably you.</p><button className="circle-link" onClick={()=>go('universe')} aria-label="Discover the UNIPARC universe"><ArrowDown/></button></div>
     </div>
     <div className="hero-artwork">
      <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1600&q=90" alt="Editorial streetwear campaign" />
      <div className="artwork-frame"><span>UNIPARC®</span><span>FIG. 001 — THE CULTURE UNIFORM</span></div>
      <div className="artwork-stamp">CULTURE<br/>IS PERSONAL<span>UP / 001</span></div>
      <div className="artwork-index">01—04</div>
     </div>
    </div>
    <div className="hero-bottomline"><span>SCROLL TO ENTER</span><div className="ticker"><div>ANIME IS CULTURE ✳ MUSIC IS CULTURE ✳ GAMES ARE CULTURE ✳ STYLE IS CULTURE ✳&nbsp;</div></div><span>THE UNIVERSE IS YOURS ↘</span></div>
   </section>
   <section className="belief section-pad" data-reveal>
    <p className="eyebrow">A NOTE FROM THE UNIVERSE <span>— 001</span></p>
    <div className="belief-content"><h2>YOUR WORLD.<br/><em>YOUR RULES.</em></h2><div><p>Some people call it an obsession. We call it having a point of view.</p><p>UNIPARC lives at the intersection of pop culture and personal style. A place for the references, characters, sounds and stories that become part of who you are.</p><button className="underlined-link" onClick={()=>go('about')}>GET TO KNOW UNIPARC <ArrowUpRight size={16}/></button></div></div>
   </section>
   <section className="universe section-pad" id="universe">
    <div className="section-intro" data-reveal><div><p className="eyebrow">01 / FIND YOUR PEOPLE</p><h2>CHOOSE YOUR<br/><em>UNIVERSE.</em></h2></div><span className="section-aside">FOUR WORLDS.<br/>INFINITE WAYS TO BE YOU.</span></div>
    <div className="universe-grid">{categories.map((c,i)=><button className={'universe-card universe-'+c.id} key={c.id} onClick={()=>{setActiveCategory(i===1?'CULTURE':'ALL');go('edits')}}><img src={c.image} alt="" loading="lazy"/><span className="card-wash"/><span className="universe-number">{c.index} / UNIVERSE</span><span className="universe-title">{c.name}<MoveUpRight/></span><span className="universe-sub">{c.sub}</span></button>)}</div>
    <div className="universe-endline"><span>THERE'S NO WRONG WAY TO BE A FAN.</span><span>EXPLORE WITHOUT LIMITS ↗</span></div>
   </section>
   <section className="edits section-pad" id="edits">
    <div className="section-intro" data-reveal><div><p className="eyebrow">02 / CURRENTLY IN OUR ORBIT</p><h2>THE CULTURE<br/><em>EDIT.</em></h2></div><p className="section-aside">A ROTATING SELECTION OF<br/>THINGS WE CAN'T STOP THINKING ABOUT.</p></div>
    <div className="edit-filters" role="group" aria-label="Filter edits">{['ALL','APPAREL','CULTURE'].map(f=><button key={f} className={activeCategory===f?'selected':''} onClick={()=>setActiveCategory(f)}>{f}<span>{f==='ALL'?'03':f==='APPAREL'?'03':'02'}</span></button>)}</div>
    <div className="edit-grid">{filtered.map((p,i)=><article className="edit-card" key={p.number}><div className="edit-image"><img src={p.image} alt="Editorial apparel preview" loading="lazy"/><span className="edit-index">EDIT / {p.number}</span><span className="edit-note">{p.note}</span><span className="edit-arrow"><ArrowUpRight/></span></div><div className="edit-meta"><div><p>{p.type}</p><h3>{p.name}</h3></div><span>VISUAL STUDY<br/>NOT A LIVE LISTING</span></div></article>)}</div>
    <p className="catalogue-note">EDITORIAL PREVIEW — LIVE PRODUCT LISTINGS WILL APPEAR HERE.</p>
   </section>
   <section className="campaign">
    <div className="campaign-image"><img src="https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1800&q=90" alt="Live music crowd" loading="lazy"/><div className="campaign-overlay"/></div>
    <div className="campaign-content"><p className="eyebrow">03 / CULTURE DOESN'T STAY STILL</p><h2>NEVER JUST<br/><em>BACKGROUND.</em></h2><p>The things you love deserve more than a passing mention. They deserve a place in your everyday.</p><button onClick={()=>go('about')}>THIS IS UNIPARC <ArrowUpRight/></button></div>
    <span className="campaign-caption">A LIFE IN REFERENCES — UNIPARC®</span>
   </section>
   <section className="about section-pad" id="about">
    <div className="about-mark" data-reveal><img src="/assets/uniparc-logo.webp" alt="UNIPARC"/><span>THE CULTURE UNIFORM.</span></div>
    <div className="about-copy" data-reveal><p className="eyebrow">04 / WHAT WE STAND FOR</p><h2>DON'T FIT IN.<br/><em>FIND YOUR FREQUENCY.</em></h2><p>We believe what you're into says something about who you are. The anime you grew up with. The game you keep coming back to. The song you play until it stops sounding real.</p><p>UNIPARC is for all of it. No gatekeeping. No guilty pleasures. Just your world, worn your way.</p><span className="about-signoff">WEAR WHAT REPRESENTS YOU.®</span></div>
   </section>
   <section className="faq section-pad" id="faq"><div className="section-intro" data-reveal><div><p className="eyebrow">05 / GOOD TO KNOW</p><h2>THE QUICK<br/><em>DOWNLOAD.</em></h2></div><span className="section-aside">A FEW THINGS<br/>YOU MIGHT BE WONDERING.</span></div><div className="faq-list">{faqs.map(([q,a],i)=><div className={'faq-row '+(activeFaq===i?'is-open':'')} key={q}><button onClick={()=>setActiveFaq(activeFaq===i?null:i)}><span>0{i+1}</span><strong>{q}</strong><Plus/></button>{activeFaq===i&&<p>{a}</p>}</div>)}</div></section>
   <footer className="footer section-pad"><div className="footer-hero"><p className="eyebrow">THE UNIVERSE IS YOURS</p><h2>STAY<br/><em>OBSESSED.</em></h2><button onClick={()=>go('top')} className="back-top">BACK TO TOP <ArrowUpRight/></button></div><div className="footer-brand"><img src="/assets/uniparc-logo.webp" alt="UNIPARC"/><span>WEAR WHAT REPRESENTS YOU.</span></div><div className="footer-bottom"><span>© UNIPARC 2026</span><span>INDEPENDENT POP-CULTURE LABEL</span><a href="#top">TOP ↑</a></div></footer>
  </main>
  <div className={'menu-overlay '+(menuOpen?'is-open':'')} aria-hidden={!menuOpen}><div className="menu-inner"><p className="eyebrow">MOVE THROUGH THE UNIVERSE</p>{[['01','THE UNIVERSE','universe'],['02','LATEST EDITS','edits'],['03','OUR WORLD','about'],['04','QUESTIONS','faq']].map(([n,label,id])=><button key={id} onClick={()=>go(id)}><span>{n}</span>{label}<ArrowUpRight/></button>)}</div><span className="menu-foot">UNIPARC® — WEAR WHAT REPRESENTS YOU.</span></div>
 </div>;
}
