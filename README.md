# Soham Pardeshi — Portfolio

A static, single-page portfolio for Soham Pardeshi, Senior Software Engineer. Built with plain HTML, CSS and JavaScript for GitHub Pages; no build step or runtime framework is required.

## Design

The portfolio is framed around **systems in motion**: editorial typography, a graphite-and-amber palette, precise technical labels and diagrams that make engineering work legible.

- A responsive fixed navigation with active section and scroll progress.
- A motion-led hero with a lightweight SVG signal network.
- Production scale metrics drawn from the résumé.
- A pinned, scroll-driven architecture story for the monolith-to-microservices migration.
- An always-readable experience timeline, AI/ML case studies and grouped technical toolbox.
- Five statically rendered GitHub projects. Repository stars, language and last update are progressively enhanced from the GitHub API; the links and descriptions remain available if the request fails.
- Reduced-motion preferences are respected. No animation or UI library is required.

## Run locally

Open index.html directly, or serve the folder:

~~~sh
python3 -m http.server 8000
~~~

Then visit http://localhost:8000.

