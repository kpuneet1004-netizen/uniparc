(() => {
  const menu = document.querySelector('.menu');
  const nav = document.querySelector('.nav');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false');
    }));
  }
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  const targets = document.querySelectorAll('.manifesto-grid,.beliefs article,.culture-card,.drop-head,.product,.approach-grid,.community-copy');
  targets.forEach(el => el.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), {threshold: .12});
    targets.forEach(el => observer.observe(el));
  } else targets.forEach(el => el.classList.add('visible'));
  // Prototype-only form feedback: no email is stored or transmitted.
  const form = document.getElementById('signup');
  const note = document.getElementById('form-note');
  if (form && note) form.addEventListener('submit', e => {
    e.preventDefault(); note.textContent = 'Thanks for your interest. Mailing-list signup will be enabled at launch.'; form.reset();
  });
})();