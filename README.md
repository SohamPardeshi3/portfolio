# Soham Pardeshi — Portfolio

A static single-page portfolio. Plain HTML, CSS and JavaScript — no build step, no libraries. Deploys as-is to GitHub Pages.

## Structure

Eight scroll chapters, each with one idea:

1. **Intro** — oversized name that scales away as you scroll.
2. **Story** — one sentence whose words light up with scroll.
3. **Scale** — four headline numbers that count up, one at a time.
4. **Migration** — a monolith splits into 12+ services around an event backbone.
5. **Work** — horizontal scroll of six results-first cards.
6. **Path** — Empower, FIS, education.
7. **Lab** — five open-source systems.
8. **Contact** — scroll-driven stack marquee and links.

## Motion

Scenes are tall sections with a sticky stage. One `requestAnimationFrame` loop reads each scene's scroll progress, eases it, and writes it to a CSS variable (`--p`) or to the DOM. `prefers-reduced-motion` is respected.

## Run locally

    python3 -m http.server 8000
