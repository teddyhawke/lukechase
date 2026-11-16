# Luke Chase — Official Site

Static site: plain HTML/CSS with GSAP + Lenis from a CDN. No build step. Served by GitHub Pages from `main` (root).

## Files
- `index.html` — opening page: mission line, photo, contact, reel, upcoming project
- `work.html` — credits grouped by Film / Stage / Writing, plus Upcoming
- `about.html` — bio, stats, training, skills
- `style.css` — all styling (change `--accent` at the top to recolor the site)
- `main.js` — reel player + scroll animations
- `assets/` — photos

## Common updates
- **Photos:** replace `assets/headshot-home.jpg` and `assets/headshot-about.jpg` (2:3 portrait, ~1200px wide). `assets/reel-poster.jpg` is 16:9.
- **Reel:** set `CLIP_EMBED_URL` at the top of `main.js` (YouTube `https://www.youtube.com/embed/ID` or Vimeo `https://player.vimeo.com/video/ID`). The "Reel coming soon" placeholder turns into a play button automatically.
- **Credits:** in `work.html`, copy an `<article class="credit">` block. Fields: title, year, role, director/production, one-line context.
