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
  const close = () => { if (!modal) return; modal.classList.remove('open', 'gallery-mode'); box.classList.remove('is-img'); box.innerHTML = ''; lenis && lenis.start(); window.__mosaicSync && window.__mosaicSync(); };
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

  /* ---------- On-set mosaic: one featured photo, the rest reshuffle around it ---------- */
  const mosaic = document.querySelector('.mosaic');
  if (mosaic) {
    const tiles = [...mosaic.querySelectorAll('.m-tile')];
    const pad = n => String(n).padStart(2, '0');
    const INTERVAL = 3.6;                         // seconds each photo stays featured
    const small = matchMedia('(max-width:760px)');
    // where the featured tile sits: desktop slides left → right → centre; phones top → middle → bottom
    const SLOTS = { wide: [[1, 1], [3, 1], [2, 1]], narrow: [[1, 1], [1, 2], [1, 3]] };
    const SPAN = { wide: [4, 4], narrow: [4, 2] };
    const cap = { proj: document.querySelector('.m-proj'), kind: document.querySelector('.m-kind'), count: document.querySelector('.m-count') };
    const timerBar = document.querySelector('.m-timer i');
    const playBtn = document.querySelector('.m-play');
    let feat = 0, slot = 0, userPaused = reduce, hoverPaused = false, visible = false, timer = null;

    const place = () => {
      const mode = small.matches ? 'narrow' : 'wide', [c, r] = SLOTS[mode][slot % 3], [w, h] = SPAN[mode];
      tiles.forEach((t, i) => {
        const on = i === feat;
        t.classList.toggle('is-feat', on);
        t.style.gridColumn = on ? `${c} / span ${w}` : '';
        t.style.gridRow = on ? `${r} / span ${h}` : '';
        t.setAttribute('aria-current', on ? 'true' : 'false');
      });
      const t = tiles[feat];
      cap.proj.textContent = t.dataset.project; cap.kind.textContent = t.dataset.kind;
      cap.count.textContent = `${pad(feat + 1)} / ${pad(tiles.length)}`;
    };

    const feature = (i, animate = true) => {
      feat = (i + tiles.length) % tiles.length; slot++;
      if (animate && window.Flip && !reduce) {
        const state = Flip.getState(tiles);
        place();
        Flip.from(state, { duration: 1.1, ease: 'power3.inOut', absolute: true, zIndex: 2,
          onEnter: el => gsap.fromTo(el, { opacity: 0 }, { opacity: 1 }) });
        gsap.fromTo('.m-cap', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .6, delay: .35, ease: 'power2.out' });
      } else place();
      restart();
    };

    // timer: a thin accent line fills up, then the next photo takes the stage
    const running = () => !userPaused && !hoverPaused && visible && !modal.classList.contains('open') && !document.hidden;
    const restart = () => {
      if (window.gsap) {
        timer && timer.kill();
        timer = gsap.fromTo(timerBar, { scaleX: 0 }, { scaleX: 1, duration: INTERVAL, ease: 'none', paused: !running(),
          onComplete: () => feature(feat + 1) });
      } else {
        clearTimeout(timer); if (running()) timer = setTimeout(() => feature(feat + 1), INTERVAL * 1000);
      }
    };
    const sync = () => { if (window.gsap && timer) running() ? timer.play() : timer.pause(); else restart(); };

    tiles.forEach((t, i) => t.addEventListener('click', () => (i === feat ? openLightbox(i) : feature(i))));
    document.querySelector('.m-open').addEventListener('click', () => openLightbox(feat));
    playBtn.addEventListener('click', () => { userPaused = !userPaused; playBtn.textContent = userPaused ? 'Play' : 'Pause'; playBtn.setAttribute('aria-pressed', userPaused); sync(); });
    if (reduce) { playBtn.textContent = 'Play'; playBtn.setAttribute('aria-pressed', 'true'); }
    mosaic.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hoverPaused = true; sync(); } });
    mosaic.addEventListener('pointerleave', () => { hoverPaused = false; sync(); });
    document.addEventListener('visibilitychange', sync);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: 0.35 }).observe(mosaic);
    small.addEventListener('change', () => place());
    window.__mosaicSync = sync;                    // lightbox close resumes it

    // lightbox with prev/next
    let lbIndex = 0;
    const lbCount = document.querySelector('.lb-count');
    const show = i => {
      lbIndex = (i + tiles.length) % tiles.length;
      const img = tiles[lbIndex].querySelector('img'), t = tiles[lbIndex];
      box.classList.add('is-img');
      box.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
      lbCount.innerHTML = `<em style="text-transform:none;letter-spacing:0;font-size:15px">${t.dataset.project}</em> · ${pad(lbIndex + 1)} / ${pad(tiles.length)}`;
    };
    function openLightbox(i) { show(i); modal.classList.add('open', 'gallery-mode'); lenis && lenis.stop(); sync(); }
    document.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); show(lbIndex - 1); });
    document.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); show(lbIndex + 1); });
    addEventListener('keydown', e => {
      if (!modal.classList.contains('gallery-mode')) return;
      if (e.key === 'ArrowRight') show(lbIndex + 1);
      if (e.key === 'ArrowLeft') show(lbIndex - 1);
    });

    place(); restart();
  }

  /* ---------- Work page: floating bookmarks (show after the title, highlight current section) ---------- */
  const marks = document.querySelector('.bookmarks');
  if (marks) {
    const links = [...marks.querySelectorAll('a')];
    const secs = links.map(a => document.querySelector(a.getAttribute('href')));
    const top = document.querySelector('.page-top');
    const onScroll = () => {
      marks.classList.toggle('show', top.getBoundingClientRect().bottom < 120);
      const mid = innerHeight * 0.35;
      let cur = 0; secs.forEach((s, i) => { if (s.getBoundingClientRect().top < mid) cur = i; });
      links.forEach((a, i) => a.classList.toggle('active', i === cur));
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  if (!(window.gsap && window.ScrollTrigger) || reduce) {
    document.documentElement.classList.remove('js');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  if (window.Flip) gsap.registerPlugin(Flip);

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
    e.preventDefault();
    const off = document.querySelector('header').offsetHeight + (marks && matchMedia('(max-width:820px)').matches ? marks.offsetHeight : 0) + 16;
    lenis ? lenis.scrollTo(el, { offset: -off, duration: 1.3 }) : el.scrollIntoView({ behavior: 'smooth' });
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
