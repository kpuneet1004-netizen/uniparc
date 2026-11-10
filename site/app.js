import { startIntro } from './intro.js';
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const intro=$('#intro');
let introDone=false;
function finishIntro(){if(introDone)return;introDone=true;intro?.classList.add('is-finished');try{sessionStorage.setItem('up-intro-seen','1')}catch{}}
const skip=$('#skip-intro');skip?.addEventListener('click',()=>{finishIntro();});
let seen=false;try{seen=sessionStorage.getItem('up-intro-seen')==='1'}catch{}
if(seen||matchMedia('(prefers-reduced-motion: reduce)').matches){finishIntro()}else{startIntro($('#intro-canvas'),()=>{setTimeout(finishIntro,450)})}
const menu=$('#menu-button'),nav=$('#nav');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');nav.classList.toggle('is-open',open)});
$$('.nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');menu?.setAttribute('aria-expanded','false')}));
const worldNames=['01 — ANIME / MANGA','02 — GAMES / PLAY','03 — FILM / SCREEN','04 — MUSIC / SOUND'];
$$('.world').forEach((button,index)=>{button.addEventListener('click',()=>{$$('.world').forEach(item=>item.classList.remove('is-active'));button.classList.add('is-active');$('#world-current').textContent=worldNames[index]})});
if($$('.world').length){$$('.world')[0].classList.add('is-active')}
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target)}})},{threshold:.14});
$$('.section-head,.manifesto-grid,.world,.object,.about-grid,.closing h2').forEach(el=>{el.classList.add('reveal');observer.observe(el)});
window.addEventListener('pageshow',()=>{if(introDone)finishIntro()});
