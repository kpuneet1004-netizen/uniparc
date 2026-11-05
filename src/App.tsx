import {useEffect,useRef,useState} from 'react';
import {ArrowDown,ArrowRight,ArrowUpRight,Menu,X,Plus,MoveUpRight,Volume2,VolumeX} from 'lucide-react';
import {gsap} from 'gsap';
import Lenis from 'lenis';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const worlds=[
 {n:'01',id:'anime',title:'ANIME',line:'FICTION BECOMES IDENTITY',image:'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1500&q=90'},
 {n:'02',id:'gaming',title:'GAMING',line:'PRESS START. STAY YOURSELF.',image:'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1500&q=90'},
 {n:'03',id:'music',title:'MUSIC',line:'SOUNDTRACK YOUR OWN STORY',image:'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1500&q=90'},
 {n:'04',id:'street',title:'STREET CULTURE',line:'NO UNIFORM. YOUR UNIVERSE.',image:'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1500&q=90'}
];
const drops=[
 {n:'001',name:'AFTER HOURS',tag:'STYLE / CULTURE',note:'OFF-DUTY UNIFORM',image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1100&q=90'},
 {n:'002',name:'PLAYER ONE',tag:'GAMING / STREETWEAR',note:'READY WHEN YOU ARE',image:'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1100&q=90'},
 {n:'003',name:'LORE DEPT.',tag:'ANIME / EVERYDAY',note:'FOR THE DEEP DIVERS',image:'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=1100&q=90'}
];
const questions=[['What is UNIPARC?','A pop-culture label built around the worlds, stories, sounds and communities that become part of who you are.'],['Where can I shop?','Verified marketplace destinations will be linked here when official product drops are ready.'],['What is coming next?','New edits, collaborations and culture-led drops. Stay close to the orbit.']];
export default function App(){
 const [menu,setMenu]=useState(false),[faq,setFaq]=useState(-1),[filter,setFilter]=useState('ALL'),[sound,setSound]=useState(false);
 const cursor=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lenis=reduced?null:new Lenis({lerp:.075,smoothWheel:true,autoRaf:false});
  let raf:(t:number)=>void;
  if(lenis){lenis.on('scroll',ScrollTrigger.update);raf=(t)=>lenis.raf(t*1000);gsap.ticker.add(raf);gsap.ticker.lagSmoothing(0);}
  const ctx=gsap.context(()=>{
   if(!reduced){
    const intro=gsap.timeline({defaults:{ease:'power4.out'}});
    intro.from('.hero-kicker',{y:25,opacity:0,duration:.7,delay:.15})
      .from('.hero-title .line > span',{yPercent:120,rotate:3,duration:1.15,stagger:.12},'-=.35')
      .from('.hero-visual',{clipPath:'inset(0 0 100% 0)',scale:1.08,duration:1.4},'-=1')
      .from('.hero-rail > *',{y:20,opacity:0,stagger:.1,duration:.6},'-=.55');
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el)=>gsap.fromTo(el,{y:75,opacity:0},{y:0,opacity:1,duration:1.1,ease:'power4.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}}));
    gsap.utils.toArray<HTMLElement>('.world-card').forEach((el,i)=>gsap.fromTo(el,{y:100,rotate:i%2?2:-2,opacity:0},{y:0,rotate:0,opacity:1,duration:1.1,ease:'power4.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}}));
    gsap.to('.hero-visual img',{yPercent:16,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
    gsap.to('.orbit-word',{xPercent:-18,ease:'none',scrollTrigger:{trigger:'.manifesto',start:'top bottom',end:'bottom top',scrub:1}});
    gsap.to('.campaign-photo img',{yPercent:13,ease:'none',scrollTrigger:{trigger:'.campaign',start:'top bottom',end:'bottom top',scrub:1}});
    gsap.utils.toArray<HTMLElement>('.section-number').forEach(el=>gsap.fromTo(el,{scale:0.5,opacity:0},{scale:1,opacity:1,duration:.8,scrollTrigger:{trigger:el,start:'top 90%',once:true}}));
   }
   const move=(e:MouseEvent)=>{if(cursor.current)gsap.to(cursor.current,{x:e.clientX,y:e.clientY,duration:.22,ease:'power3.out'});};
   if(window.matchMedia('(pointer:fine)').matches&&!reduced){window.addEventListener('mousemove',move);document.body.classList.add('has-cursor');}
   return()=>window.removeEventListener('mousemove',move);
  });
  return()=>{ctx.revert();if(lenis){gsap.ticker.remove(raf!);lenis.destroy();}document.body.classList.remove('has-cursor');};
 },[]);
 const go=(id:string)=>{setMenu(false);document.getElementById(id)?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};
 const visible=filter==='ALL'?drops:drops.filter((d)=>filter==='APPAREL'?d.n!=='003':d.n!=='002');
 return <div className="site-shell">
  <div className="custom-cursor" ref={cursor}><span>VIEW</span></div>
  <header className="header"><button className="menu-trigger" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}<span>{menu?'CLOSE':'MENU'}</span></button><a className="logo" href="#top"><img src="/assets/uniparc-logo.svg" alt="UNIPARC"/></a><nav><button onClick={()=>go('worlds')}>WORLDS</button><button onClick={()=>go('edits')}>THE EDIT</button><button onClick={()=>go('about')}>ABOUT</button></nav><button className="header-cta" onClick={()=>go('edits')}>ENTER THE ORBIT <ArrowUpRight size={15}/></button></header>
  <main id="top">
   <section className="hero">
    <div className="hero-meta"><span><i/> INDEPENDENT POP-CULTURE LABEL</span><span>EST. MMXXIV — INDIA</span></div>
    <div className="hero-grid">
     <div className="hero-copy"><p className="hero-kicker">NOT A PHASE. NOT AN APOLOGY.</p><h1 className="hero-title"><span className="line"><span>MADE OF</span></span><span className="line outline"><span>WHAT</span></span><span className="line"><span>YOU <em>LOVE.</em></span></span></h1><div className="hero-bottom"><p>Your fandoms. Your soundtracks. Your rabbit holes. Wear every part of what makes you, you.</p><button className="round-arrow" onClick={()=>go('manifesto')} aria-label="Scroll to discover"><ArrowDown/></button></div></div>
     <div className="hero-visual"><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1800&q=95" alt="Monochrome streetwear campaign"/><div className="visual-shade"/><span className="visual-top">UNIPARC® / CULTURE STUDY 001</span><span className="visual-side">CULTURE IS PERSONAL</span><span className="visual-index">01—04</span></div>
    </div>
    <div className="hero-rail"><span>SCROLL TO EXPLORE <ArrowDown size={12}/></span><div className="rail-track"><div>ANIME IS CULTURE ✳ GAMES ARE CULTURE ✳ MUSIC IS CULTURE ✳ STYLE IS CULTURE ✳&nbsp;</div></div><span>THE UNIVERSE IS YOURS ↘</span></div>
   </section>
   <section className="manifesto" id="manifesto"><div className="manifesto-top"><span className="eyebrow">A NOTE FROM THE UNIVERSE / 001</span><span className="eyebrow">NO GATEKEEPING. EVER.</span></div><div className="manifesto-main" data-reveal><h2>YOUR WORLD.<br/><i>YOUR RULES.</i></h2><div><p className="manifesto-lead">Some people call it an obsession.<br/>We call it having a point of view.</p><p>UNIPARC lives where pop culture meets personal style. A place for the references, characters, sounds and stories that become part of who you are.</p><button className="text-link" onClick={()=>go('about')}>GET TO KNOW US <ArrowUpRight/></button></div></div><div className="orbit-word" aria-hidden="true">BE UNAPOLOGETICALLY YOU — </div></section>
   <section className="worlds" id="worlds"><div className="section-head" data-reveal><div><span className="eyebrow">01 / FIND YOUR PEOPLE</span><h2>CHOOSE YOUR<br/><i>UNIVERSE.</i></h2></div><span className="section-note">FOUR WORLDS.<br/>INFINITE WAYS TO BE YOU.</span></div><div className="world-grid">{worlds.map((w,i)=><button className={'world-card world-'+w.id} key={w.id} onClick={()=>{setFilter(i===1?'CULTURE':'ALL');go('edits')}}><img src={w.image} alt="" loading="lazy"/><span className="world-overlay"/><span className="world-count">{w.n} / UNIVERSE</span><span className="world-title">{w.title}<MoveUpRight/></span><span className="world-line">{w.line}</span><span className="world-hover">EXPLORE WORLD <ArrowUpRight/></span></button>)}</div><div className="worlds-foot"><span>THERE'S NO WRONG WAY TO BE A FAN.</span><span>EXPLORE WITHOUT LIMITS ↗</span></div></section>
   <section className="edits" id="edits"><div className="section-head" data-reveal><div><span className="eyebrow">02 / CURRENTLY IN OUR ORBIT</span><h2>THE CULTURE<br/><i>EDIT.</i></h2></div><span className="section-note">A ROTATING SELECTION OF<br/>THINGS WE CAN'T STOP THINKING ABOUT.</span></div><div className="filter-row">{['ALL','APPAREL','CULTURE'].map(x=><button key={x} className={filter===x?'active':''} onClick={()=>setFilter(x)}>{x}<sup>{x==='ALL'?'03':x==='APPAREL'?'02':'02'}</sup></button>)}</div><div className="drop-grid">{visible.map((d,i)=><article className="drop-card" key={d.n}><div className="drop-photo"><img src={d.image} alt="Editorial apparel visual study" loading="lazy"/><span className="drop-no">EDIT / {d.n}</span><span className="drop-note">{d.note}</span><span className="drop-open"><ArrowUpRight/></span><div className="drop-vertical">UNIPARC — CULTURE STUDY</div></div><div className="drop-info"><div><span>{d.tag}</span><h3>{d.name}</h3></div><small>VISUAL STUDY<br/>NOT A LIVE LISTING</small></div></article>)}</div><p className="catalogue-disclaimer">EDITORIAL PREVIEW — OFFICIAL PRODUCT DESTINATIONS WILL APPEAR WITH LIVE DROPS.</p></section>
   <section className="campaign"><div className="campaign-photo"><img src="https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1900&q=95" alt="Live music crowd" loading="lazy"/></div><div className="campaign-copy" data-reveal><span className="eyebrow">03 / CULTURE DOESN'T STAY STILL</span><h2>NEVER JUST<br/><i>BACKGROUND.</i></h2><p>The things you love deserve more than a passing mention. They deserve a place in your everyday.</p><button className="light-link" onClick={()=>go('about')}>THIS IS UNIPARC <ArrowUpRight/></button></div><span className="campaign-stamp">A LIFE IN<br/>REFERENCES®</span></section>
   <section className="about" id="about"><div className="about-mark" data-reveal><img src="/assets/uniparc-logo.svg" alt="UNIPARC"/><span>THE CULTURE UNIFORM.</span></div><div className="about-copy" data-reveal><span className="eyebrow">04 / WHAT WE STAND FOR</span><h2>DON'T FIT IN.<br/><i>FIND YOUR FREQUENCY.</i></h2><p>We believe what you're into says something about who you are. The anime you grew up with. The game you keep coming back to. The song you play until it stops sounding real.</p><p>UNIPARC is for all of it. No guilty pleasures. No gatekeeping. Just your world, worn your way.</p><strong>WEAR WHAT REPRESENTS YOU.®</strong></div></section>
   <section className="faq"><div className="section-head" data-reveal><div><span className="eyebrow">05 / GOOD TO KNOW</span><h2>THE QUICK<br/><i>DOWNLOAD.</i></h2></div><span className="section-note">A FEW THINGS<br/>YOU MIGHT BE WONDERING.</span></div><div className="faq-list">{questions.map(([q,a],i)=><div className={'faq-item '+(faq===i?'open':'')} key={q}><button onClick={()=>setFaq(faq===i?-1:i)}><span>0{i+1}</span><strong>{q}</strong><Plus/></button>{faq===i&&<p>{a}</p>}</div>)}</div></section>
   <footer className="footer"><div className="footer-main"><span className="eyebrow">THE UNIVERSE IS YOURS</span><h2>STAY<br/><i>OBSESSED.</i></h2><button onClick={()=>go('top')}>BACK TO TOP <ArrowUpRight/></button></div><div className="footer-brand"><img src="/assets/uniparc-logo.svg" alt="UNIPARC"/><span>WEAR WHAT REPRESENTS YOU.</span></div><div className="footer-bottom"><span>© UNIPARC 2026</span><span>INDEPENDENT POP-CULTURE LABEL</span><a href="#top">TOP ↑</a></div></footer>
  </main>
  <div className={'menu-overlay '+(menu?'show':'')}><div className="menu-content"><span className="eyebrow">MOVE THROUGH THE UNIVERSE</span>{[['01','THE UNIVERSE','worlds'],['02','LATEST EDITS','edits'],['03','OUR WORLD','about'],['04','QUESTIONS','faq']].map(([n,t,id])=><button key={id} onClick={()=>go(id)}><small>{n}</small>{t}<ArrowUpRight/></button>)}</div><span className="menu-sign">UNIPARC® — WEAR WHAT REPRESENTS YOU.</span></div>
 </div>;
}
