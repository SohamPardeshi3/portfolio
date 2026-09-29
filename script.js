// ---- hero terminal boot sequence (the one page-load moment) ----
const BOOT_LINES = [
  { text: '$ whoami', type: 'prompt' },
  { text: 'soham-pardeshi', type: 'highlight' },
  { text: '', type: 'blank' },
  { text: '$ cat role.txt', type: 'prompt' },
  { text: 'Senior Full Stack Engineer | AI/ML Engineer', type: 'normal' },
  { text: 'Backend & Distributed Systems', type: 'dim' },
  { text: '', type: 'blank' },
  { text: '$ uptime', type: 'prompt' },
  { text: '4+ years building fintech infrastructure at scale', type: 'normal' },
];

function typeBootSequence() {
  const container = document.getElementById('bootSequence');
  let lineIndex = 0;
  let charIndex = 0;
  let currentLineEl = null;

  function typeChar() {
    if (lineIndex >= BOOT_LINES.length) {
      const cursor = document.createElement('span');
      cursor.className = 'cursor';
      container.appendChild(cursor);
      return;
    }

    const line = BOOT_LINES[lineIndex];

    if (charIndex === 0) {
      currentLineEl = document.createElement('div');
      currentLineEl.className = `line ${line.type === 'prompt' ? 'prompt-char' : ''} ${line.type === 'highlight' ? 'highlight' : ''} ${line.type === 'dim' ? 'dim-line' : ''}`;
      container.appendChild(currentLineEl);
    }

    if (line.type === 'blank' || charIndex >= line.text.length) {
      lineIndex += 1;
      charIndex = 0;
      setTimeout(typeChar, line.type === 'blank' ? 120 : 80);
      return;
    }

    currentLineEl.textContent = line.text.slice(0, charIndex + 1);
    charIndex += 1;

    const speed = line.type === 'prompt' ? 45 : 18;
    setTimeout(typeChar, speed);
  }

  typeChar();
}

// ---- scroll progress bar ----
function updateProgressBar() {
  const bar = document.getElementById('progressBar');
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  bar.style.width = `${pct}%`;
}

// ---- active side-nav highlighting ----
function setupActiveNav() {
  const links = document.querySelectorAll('.side-nav__list a');
  const sections = Array.from(links)
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((link) => link.classList.remove('active'));
          const activeLink = document.querySelector(`.side-nav__list a[data-section="${entry.target.id}"]`);
          if (activeLink) activeLink.classList.add('active');
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}

// ---- scroll-triggered reveals (the signature scroll mechanic) ----
function setupScrollReveals() {
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('.reveal-group').forEach((group) => {
    const items = Array.from(group.children);
    items.forEach((item) => item.classList.add('reveal-item'));

    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
      stagger: 0.08,
      scrollTrigger: {
        trigger: group,
        start: 'top 85%',
        once: true,
      },
    });
  });
}

// ---- animated metric counters ----
function setupCounters() {
  document.querySelectorAll('.metric__number[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const proxy = { value: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(proxy, {
          value: target,
          duration: 1.4,
          ease: 'power1.out',
          onUpdate: () => {
            el.textContent = `${prefix}${Math.round(proxy.value).toLocaleString()}${suffix}`;
          },
        });
      },
    });
  });
}

// ---- live GitHub project data ----
const PROJECTS = [
  {
    repo: 'distributed-rate-limiter',
    title: 'Distributed Rate Limiter',
    description: 'Redis-backed token bucket rate limiter with atomic Lua-script refill/consume logic for correctness under concurrent multi-instance access.',
  },
  {
    repo: 'idempotent-request-handler',
    title: 'Idempotent Request Handler',
    description: 'Redis-backed idempotency guard for HTTP APIs — atomic SET NX claim pattern with body-hash scoping to reject key reuse with mismatched payloads.',
  },
  {
    repo: 'mcp-tool-guard',
    title: 'MCP Tool Guard',
    description: 'Per-tool cost-aware rate limiting and call deduplication for MCP servers — drop into your own server, no gateway required.',
  },
  {
    repo: 'txn-risk-console',
    title: 'Transaction Risk Console',
    description: 'Real-time transaction anomaly detection dashboard — rule-based fraud scoring with live WebSocket updates and haversine-distance impossible-travel detection.',
  },
  {
    repo: 'durable-kv',
    title: 'Durable Key-Value Store',
    description: 'Embedded key-value store in Rust with a checksummed write-ahead log, atomic segment compaction, and a real SIGKILL-based crash-recovery test.',
  },
];

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  const days = Math.floor(seconds / 86400);
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;
  return `${Math.floor(months / 12)} yr ago`;
}

async function renderProjects() {
  const container = document.getElementById('githubProjects');

  container.innerHTML = PROJECTS.map((p) => `
    <a class="project-card" href="https://github.com/SohamPardeshi3/${p.repo}" target="_blank" rel="noopener" data-repo="${p.repo}">
      <div class="project-card__bar">
        <span class="dot dot--red"></span><span class="dot dot--yellow"></span><span class="dot dot--green"></span>
        <span>${p.repo}</span>
      </div>
      <div class="project-card__body">
        <div class="project-card__title">${p.title}</div>
        <div class="project-card__desc">${p.description}</div>
        <div class="project-card__meta" data-meta>
          <span>loading…</span>
        </div>
      </div>
    </a>
  `).join('');

  PROJECTS.forEach(async (p) => {
    const metaEl = container.querySelector(`[data-repo="${p.repo}"] [data-meta]`);
    try {
      const res = await fetch(`https://api.github.com/repos/SohamPardeshi3/${p.repo}`);
      if (!res.ok) throw new Error('not ok');
      const data = await res.json();
      if (metaEl) {
        metaEl.innerHTML = `
          <span>★ ${data.stargazers_count}</span>
          <span>${data.language || ''}</span>
          <span>updated ${timeAgo(data.updated_at)}</span>
        `;
      }
    } catch (e) {
      // GitHub's public API is rate-limited per IP; if a visitor's
      // browser hits that limit, fall back to a plain static line
      // rather than leaving a "loading…" placeholder stuck forever.
      if (metaEl) metaEl.innerHTML = '<span>view on GitHub</span>';
    }
  });
}

// ---- init ----
window.addEventListener('DOMContentLoaded', () => {
  typeBootSequence();
  setupActiveNav();
  renderProjects().then(() => {
    setupScrollReveals();
    setupCounters();
  });
});

window.addEventListener('scroll', updateProgressBar);
