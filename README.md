# Luke Chase — Official Site

Static site (HTML + GSAP + Lenis via CDN). No build step.

## Updating content
- **Photos:** replace files in `assets/` keeping the same names (`headshot-1.jpg` … `headshot-4.jpg`, `reel-poster.jpg`). Headshots are 4:5, the reel poster is 16:9.
- **Text, credits, reps:** edit `index.html` directly — every section is plain HTML.
- **Accent color:** change `--accent` at the top of the `<style>` block.
- **Reel:** paste the YouTube/Vimeo embed into the reel modal in the script at the bottom of `index.html`.

## Hosting
Served by GitHub Pages from the `main` branch root.
