/* ------------------------------------------------------------------
   REEL — paste the embed URL here when Luke has one.
   YouTube: https://www.youtube.com/embed/VIDEO_ID
   Vimeo:   https://player.vimeo.com/video/VIDEO_ID
------------------------------------------------------------------- */
const CLIP_EMBED_URL = '';

(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hdr = document.querySelector('header');
  addEventListener('scroll', () => hdr.classList.toggle('scrolled', scrollY > 10), { passive: true });
  const yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* Clip modal */
  const modal = document.getElementById('modal'), box = document.getElementById('modal-box');
  let lenis = null;
  const close = () => { if (!modal) return; modal.classList.remove('open'); box.innerHTML = ''; lenis && lenis.start(); };
  const openClip = () => {
    box.innerHTML = CLIP_EMBED_URL
      ? `<iframe src="${CLIP_EMBED_URL}?autoplay=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Luke Chase reel"></iframe>`
      : '<div class="ph"><span class="sc mute">Reel coming soon</span><span style="font-size:28px;font-style:italic">YouTube / Vimeo player</span></div>';
    modal.classList.add('open'); lenis && lenis.stop();
  };
  document.querySelectorAll('.reel').forEach(r => {
    if (!CLIP_EMBED_URL) { r.classList.add('soon'); return; }   // placeholder until the reel exists
    r.setAttribute('role', 'button'); r.tabIndex = 0; r.setAttribute('aria-label', 'Play reel');
    r.querySelector('.play i')?.removeAttribute('hidden');
    const lbl = r.querySelector('.play-label'); if (lbl) lbl.textContent = 'Play reel';
    r.addEventListener('click', openClip);
    r.addEventListener('keydown', e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), openClip()));
  });
  if (modal) modal.addEventListener('click', e => (e.target === modal || e.target.closest('.modal-close')) && close());
  addEventListener('keydown', e => e.key === 'Escape' && close());

  if (!(window.gsap && window.ScrollTrigger) || reduce) {
    document.documentElement.classList.remove('js');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* Smooth scroll */
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return e.preventDefault();
    const el = document.querySelector(id); if (!el) return;
    e.preventDefault(); lenis ? lenis.scrollTo(el, { offset: -80, duration: 1.3 }) : el.scrollIntoView({ behavior: 'smooth' });
  }));

  /* Quiet fade-ups */
  ScrollTrigger.batch('.fade', { start: 'top 92%', once: true,
    onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out', stagger: 0.08 }) });

  /* One gentle parallax on the main portrait */
  const portrait = document.querySelector('.hero-img img');
  // Starts at the photo's full frame (no crop) and only eases in slightly as you scroll away
  if (portrait) gsap.fromTo(portrait, { scale: 1 }, { scale: 1.04, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
