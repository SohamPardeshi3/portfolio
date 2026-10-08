(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const lerp = (a, b, t) => a + (b - a) * t;

  /* intro */
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("ready")));

  /* scenes + smoothed progress */
  const scenes = $$(".scene").map((el) => ({ el, cur: 0, target: 0 }));
  const header = $("#siteHeader"), bar = $("#progressBar"), chapterLabel = $("#chapterLabel");
  const chapters = $$("[data-chapter]");

  /* horizontal scene sizing */
  const hScene = $("#work"), hTrack = $("#hTrack"), hBar = $("#hBar");
  let hMax = 0;
  function sizeHorizontal() {
    hMax = Math.max(0, hTrack.scrollWidth - innerWidth);
    hScene.style.height = (innerHeight + hMax * 1.05) + "px";
  }

  /* story words */
  const story = $("#storyText");
  const storyWords = [];
  (function splitStory() {
    const walk = (node, em) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((t) => {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(" ")); return; }
            const s = document.createElement("span");
            s.className = "w" + (em ? " em" : "");
            s.textContent = t;
            storyWords.push(s);
            frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n, em || n.tagName === "EM");
      });
    };
    walk(story, false);
    $$("em", story).forEach((e) => e.replaceWith(...e.childNodes));
  })();
  function updateStory(p) {
    const n = storyWords.length;
    const prog = clamp((p - 0.06) / 0.78) * n;
    storyWords.forEach((w, i) => {
      const v = clamp(prog - i);
      w.style.opacity = (0.14 + 0.86 * v).toFixed(3);
      w.classList.toggle("lit", v > 0.6);
    });
  }

  /* numbers */
  const stats = $$(".stat");
  const dots = $$("#statDots li");
  const fmt = (el, v) => (el.dataset.prefix || "") + Math.round(v).toLocaleString("en-US") + (el.dataset.suffix || "");
  function updateStats(p) {
    const n = stats.length;
    const seg = clamp(p, 0, 0.9999) * n;
    const idx = Math.floor(seg), local = seg - idx;
    stats.forEach((s, i) => {
      const num = $(".stat-num", s);
      const target = Number(s.dataset.count);
      let op = 0, y = 0, val = i < idx ? target : 0;
      if (i === idx) {
        const inn = i === 0 ? 1 : smooth(0, 0.18, local);
        const out = i < n - 1 ? 1 - smooth(0.84, 1, local) : 1;
        op = inn * out; y = (1 - inn) * 46 - (1 - out) * 46;
        val = target * easeOut(clamp(local / 0.5));
      }
      s.style.opacity = op.toFixed(3);
      s.style.transform = `translateY(${y.toFixed(1)}px)`;
      s.style.visibility = op > 0.001 ? "visible" : "hidden";
      num.textContent = fmt(s, reduce ? target : val);
    });
    dots.forEach((d, i) => d.classList.toggle("on", i === idx));
  }

  /* migration */
  const svg = $("#migSvg"), NS = "http://www.w3.org/2000/svg";
  const mk = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const N = 12, CX = 500, CY = 270;
  const nodes = [], edges = [], packets = [];
  const rect = mk("rect", { class: "mono-box", x: CX - 118, y: CY - 96, width: 236, height: 192, rx: 16 });
  const rectLabel = mk("text", { x: CX, y: CY - 112, "text-anchor": "middle" }); rectLabel.textContent = "MONOLITH";
  const hub = mk("circle", { class: "hub", cx: CX, cy: CY, r: 20 });
  const hubLabel = mk("text", { x: CX, y: CY + 4, "text-anchor": "middle" }); hubLabel.textContent = "KAFKA"; hubLabel.style.fontSize = "8px";
  const gEdges = mk("g", {}), gNodes = mk("g", {}), gPk = mk("g", {});
  svg.append(rect, rectLabel, gEdges, hub, hubLabel, gNodes, gPk);
  const start = [], end = [];
  for (let i = 0; i < N; i++) {
    start.push([CX + ((i % 4) - 1.5) * 52, CY + (Math.floor(i / 4) - 1) * 56]);
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    end.push([CX + Math.cos(a) * 360, CY + Math.sin(a) * 180]);
    const c = mk("circle", { class: "node", r: 9 }); gNodes.appendChild(c); nodes.push(c);
    const e = mk("line", { class: "edge" }); gEdges.appendChild(e); edges.push(e);
  }
  const ring = [];
  for (let i = 0; i < N; i++) { const l = mk("line", { class: "edge" }); gEdges.appendChild(l); ring.push(l); }
  for (let i = 0; i < N; i++) { const c = mk("circle", { class: "pkt", r: 3.2 }); gPk.appendChild(c); packets.push(c); }
  const pos = start.map((s) => s.slice());
  let migP = 0;
  const caps = $$(".mig-captions .cap");
  function updateMigration(p) {
    migP = p;
    const phase = p < 0.3 ? 0 : p < 0.66 ? 1 : 2;
    caps.forEach((c, i) => c.classList.toggle("is-on", i === phase));
    rect.style.opacity = (1 - smooth(0.08, 0.4, p)).toFixed(3);
    rectLabel.style.opacity = rect.style.opacity;
    const hubO = smooth(0.35, 0.6, p);
    hub.style.opacity = hubO; hubLabel.style.opacity = hubO;
    for (let i = 0; i < N; i++) {
      const t = easeOut(smooth(0.1 + i * 0.012, 0.52 + i * 0.012, p));
      const x = lerp(start[i][0], end[i][0], t), y = lerp(start[i][1], end[i][1], t);
      pos[i][0] = x; pos[i][1] = y;
      nodes[i].setAttribute("cx", x.toFixed(1)); nodes[i].setAttribute("cy", y.toFixed(1));
      nodes[i].setAttribute("r", (7 + 3 * t).toFixed(1));
      const eo = smooth(0.42, 0.72, p);
      edges[i].setAttribute("x1", x); edges[i].setAttribute("y1", y); edges[i].setAttribute("x2", CX); edges[i].setAttribute("y2", CY);
      edges[i].style.opacity = (0.35 * eo).toFixed(3);
      const j = (i + 1) % N;
      ring[i].setAttribute("x1", x); ring[i].setAttribute("y1", y);
      ring[i].setAttribute("x2", lerp(start[j][0], end[j][0], t)); ring[i].setAttribute("y2", lerp(start[j][1], end[j][1], t));
      ring[i].style.opacity = (0.12 * eo).toFixed(3);
    }
  }
  let migVisible = false;
  function packetLoop(now) {
    if (!migVisible || reduce) return;
    const on = smooth(0.66, 0.85, migP);
    packets.forEach((pk, i) => {
      const t = ((now / 1700) + i * 0.173) % 1;
      const fwd = i % 2 === 0;
      const k = fwd ? t : 1 - t;
      pk.setAttribute("cx", (lerp(pos[i][0], CX, k)).toFixed(1));
      pk.setAttribute("cy", (lerp(pos[i][1], CY, k)).toFixed(1));
      pk.style.opacity = (on * Math.sin(t * Math.PI)).toFixed(3);
    });
    requestAnimationFrame(packetLoop);
  }
  new IntersectionObserver((es) => {
    const v = es[0].isIntersecting;
    if (v && !migVisible) { migVisible = true; requestAnimationFrame(packetLoop); }
    migVisible = v;
  }, { threshold: 0 }).observe($("#migration"));

  /* marquee */
  const mrows = $$(".mrow");
  function updateMarquee() {
    const c = $("#contact"), r = c.getBoundingClientRect();
    const off = (innerHeight - r.top);
    mrows.forEach((row) => {
      const w = row.firstElementChild.offsetWidth || 1;
      const dir = Number(row.dataset.speed);
      const x = ((off * 0.35 * dir) % w);
      row.style.transform = `translateX(${(dir < 0 ? x : x - w).toFixed(1)}px)`;
    });
  }

  /* chapter label + header */
  let lastChapter = "";
  function updateChrome() {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    header.classList.toggle("is-scrolled", y > 20);
    let name = chapters[0].dataset.chapter;
    for (const c of chapters) if (c.getBoundingClientRect().top <= innerHeight * 0.5) name = c.dataset.chapter;
    if (name !== lastChapter) { chapterLabel.textContent = name; lastChapter = name; }
  }

  /* main loop */
  let running = false;
  function frame() {
    let moving = false;
    scenes.forEach((s) => {
      const r = s.el.getBoundingClientRect();
      const span = r.height - innerHeight;
      s.target = span > 0 ? clamp(-r.top / span) : 0;
      const d = s.target - s.cur;
      s.cur = reduce || Math.abs(d) < 0.0004 ? s.target : s.cur + d * 0.16;
      if (Math.abs(s.target - s.cur) > 0.0004) moving = true;
      s.el.style.setProperty("--p", s.cur.toFixed(4));
      const id = s.el.id;
      if (id === "story") updateStory(s.cur);
      else if (id === "scale") updateStats(s.cur);
      else if (id === "migration") updateMigration(s.cur);
      else if (id === "work") {
        hTrack.style.transform = `translate3d(${(-s.cur * hMax).toFixed(1)}px,0,0)`;
        hBar.style.transform = `scaleX(${s.cur.toFixed(4)})`;
      }
    });
    updateMarquee(); updateChrome();
    if (moving) requestAnimationFrame(frame); else running = false;
  }
  function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }

  /* reveals */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
    $$(".reveal").forEach((el, i) => { el.style.transitionDelay = ((i % 3) * 90) + "ms"; io.observe(el); });
  } else $$(".reveal").forEach((el) => el.classList.add("in"));

  addEventListener("scroll", kick, { passive: true });
  addEventListener("resize", () => { sizeHorizontal(); kick(); }, { passive: true });
  addEventListener("load", () => { sizeHorizontal(); kick(); });
  sizeHorizontal(); kick();
})();
