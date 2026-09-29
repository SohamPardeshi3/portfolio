# Portfolio

Personal portfolio site for Soham Pardeshi — Senior Full Stack & Distributed
Systems Engineer. Single-page site, no build step, deployed via GitHub Pages.

## Design

Built to look and feel like a well-crafted terminal/dev-tool session,
matching the visual language of the [GitHub project repos](https://github.com/SohamPardeshi3)
it links to - graphite-navy palette, amber signal color, monospace data,
terminal-window chrome - rather than a generic resume-site template.

- **Hero**: a real typing boot sequence on page load
- **Scroll**: one consistent reveal mechanic throughout (staggered
  fade + translate, triggered once), plus animated count-up on the
  resume's headline metrics (5,000+ TPS, $50M+ daily volume, etc.)
- **Projects**: live-fetches star count, primary language, and last-updated
  time for each repo directly from the GitHub API at page load

## Stack

Plain HTML/CSS/JS, GSAP + ScrollTrigger (via CDN) for scroll animation.
No build step, no framework, no dependencies to install.

## Running locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
