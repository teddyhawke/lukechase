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
  const close = () => { if (!modal) return; modal.classList.remove('open', 'gallery-mode'); box.classList.remove('is-img'); box.innerHTML = ''; lenis && lenis.start(); };
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

  /* ---------- On-set gallery: drag / swipe / wheel, buttons, progress, lightbox ---------- */
  const track = document.querySelector('.g-track');
  if (track) {
    const items = [...track.querySelectorAll('.g-item')];
    const bar = document.querySelector('.g-progress i'), count = document.querySelector('.g-count');
    const pad = n => String(n).padStart(2, '0');
    const max = () => track.scrollWidth - track.clientWidth;
    const current = () => {           // item whose left edge is nearest the track's left padding
      const left = track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).paddingLeft);
      let best = 0, d = Infinity;
      items.forEach((it, i) => { const dd = Math.abs(it.getBoundingClientRect().left - left); if (dd < d) { d = dd; best = i; } });
      return max() - track.scrollLeft < 4 ? items.length - 1 : best;
    };
    const update = () => {
      bar.style.width = (max() > 0 ? track.scrollLeft / max() * 100 : 0) + '%';
      count.textContent = `${pad(current() + 1)} / ${pad(items.length)}`;
    };
    track.addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update); addEventListener('load', update); update();

    // smooth programmatic scroll (eased), used by buttons + inertia
    let anim = null;
    const glideTo = x => {
      cancelAnimationFrame(anim);
      x = Math.max(0, Math.min(max(), x));
      const from = track.scrollLeft, t0 = performance.now(), dur = 700;
      const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        track.scrollLeft = from + (x - from) * e; if (k < 1) anim = requestAnimationFrame(step); };
      anim = requestAnimationFrame(step);
    };
    const goTo = i => {
      i = Math.max(0, Math.min(items.length - 1, i));
      const it = items[i];
      glideTo(it.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft));
    };
    document.querySelectorAll('.g-btn').forEach(b => b.addEventListener('click', () => goTo(current() + +b.dataset.dir)));
    track.addEventListener('keydown', e => { if (e.key === 'ArrowRight') goTo(current() + 1); if (e.key === 'ArrowLeft') goTo(current() - 1); });

    // mouse drag with momentum (touch uses native swipe)
    let down = false, moved = 0, lastX = 0, lastT = 0, v = 0;
    const onMove = e => {
      if (!down) return;
      const dx = e.clientX - lastX, now = performance.now();
      track.scrollLeft -= dx; moved += Math.abs(dx);
      v = dx / Math.max(1, now - lastT); lastX = e.clientX; lastT = now;
      if (moved > 6) track.classList.add('dragging');
    };
    const endDrag = () => {
      if (!down) return; down = false;
      removeEventListener('pointermove', onMove); removeEventListener('pointerup', endDrag);
      requestAnimationFrame(() => track.classList.remove('dragging'));
      if (moved > 6) glideTo(track.scrollLeft - v * 380);   // throw
    };
    track.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      e.preventDefault();                 // no text/image selection while dragging
      down = true; moved = 0; lastX = e.clientX; lastT = performance.now(); v = 0;
      cancelAnimationFrame(anim);
      addEventListener('pointermove', onMove); addEventListener('pointerup', endDrag);
    });

    // "drag" cursor bubble (desktop)
    const bubble = document.querySelector('.g-cursor');
    if (bubble && matchMedia('(hover:hover) and (pointer:fine)').matches) {
      let bx = 0, by = 0, tx = 0, ty = 0, on = false, raf = null;
      const loop = () => { bx += (tx - bx) * .2; by += (ty - by) * .2;
        bubble.style.transform = `translate(${bx}px,${by}px) scale(${on ? (down ? .8 : 1) : 0})`; raf = requestAnimationFrame(loop); };
      track.addEventListener('pointerenter', e => { on = true; bx = tx = e.clientX; by = ty = e.clientY; bubble.style.opacity = 1; bubble.style.transition = 'opacity .3s'; if (!raf) loop(); });
      track.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
      track.addEventListener('pointerleave', () => { on = false; setTimeout(() => { if (!on) { bubble.style.opacity = 0; cancelAnimationFrame(raf); raf = null; } }, 250); });
    }

    // lightbox with prev/next
    let lbIndex = 0;
    const lbCount = document.querySelector('.lb-count');
    const show = i => {
      lbIndex = (i + items.length) % items.length;
      const img = items[lbIndex].querySelector('img');
      box.classList.add('is-img');
      box.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
      lbCount.textContent = `${pad(lbIndex + 1)} / ${pad(items.length)}`;
    };
    items.forEach((it, i) => it.addEventListener('click', () => {
      if (moved > 6) return;          // it was a drag, not a click
      show(i); modal.classList.add('open', 'gallery-mode'); lenis && lenis.stop();
    }));
    document.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); show(lbIndex - 1); });
    document.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); show(lbIndex + 1); });
    addEventListener('keydown', e => {
      if (!modal.classList.contains('gallery-mode')) return;
      if (e.key === 'ArrowRight') show(lbIndex + 1);
      if (e.key === 'ArrowLeft') show(lbIndex - 1);
    });
  }

  if (!(window.gsap && window.ScrollTrigger) || reduce) {
    document.documentElement.classList.remove('js');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* Smooth scroll */
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, allowNestedScroll: true });
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

  /* Gallery entrance: frames slide in with a light stagger */
  if (document.querySelector('.g-item')) gsap.fromTo('.g-item', { x: 120, opacity: 0 }, { x: 0, opacity: 1, clearProps: 'opacity,transform', duration: 1.3, ease: 'expo.out', stagger: 0.07,
    scrollTrigger: { trigger: '.gallery', start: 'top 85%', once: true } });

  /* One gentle parallax on the main portrait */
  const portrait = document.querySelector('.hero-img img');
  // Starts at the photo's full frame (no crop) and only eases in slightly as you scroll away
  if (portrait) gsap.fromTo(portrait, { scale: 1 }, { scale: 1.04, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
