(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.getElementById("siteHeader");
  const progressBar = document.getElementById("progressBar");
  const navLinks = Array.from(document.querySelectorAll(".main-nav a[data-section]"));
  const architecture = document.querySelector("[data-architecture]");
  let scrollQueued = false;

  function setScrollState() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) {
      progressBar.style.width = (scrollable > 0 ? Math.min(100, scrollTop / scrollable * 100) : 0) + "%";
    }
    if (header) header.classList.toggle("is-scrolled", scrollTop > 12);
    updateArchitecture();
    scrollQueued = false;
  }

  function requestScrollState() {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(setScrollState);
  }

  function setupActiveNavigation() {
    if (!("IntersectionObserver" in window)) return;
    const sections = navLinks
      .map((link) => document.getElementById(link.dataset.section))
      .filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      const candidates = entries.filter((entry) => entry.isIntersecting);
      if (!candidates.length) return;
      candidates.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      const activeId = candidates[0].target.id;
      navLinks.forEach((link) => {
        const active = link.dataset.section === activeId;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-34% 0px -54% 0px", threshold: [0, 0.08, 0.25, 0.5] });
    sections.forEach((section) => observer.observe(section));
  }

  function setupSelectiveReveals() {
    const headings = Array.from(document.querySelectorAll(".reveal-x"));
    if (!("IntersectionObserver" in window)) {
      headings.forEach((heading) => heading.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
    headings.forEach((heading) => observer.observe(heading));
  }

  const architectureCopy = [
    { state: "CORE", caption: "TIGHTLY COUPLED / ONE RELEASE PATH" },
    { state: "STRANGLER PATTERN", caption: "ROUTING / EXTRACTION / EVENT BRIDGES" },
    { state: "DISTRIBUTED", caption: "SERVICES / EVENTS / INDEPENDENT RELEASES" }
  ];

  function updateArchitecture() {
    if (!architecture) return;
    const chapters = Array.from(architecture.querySelectorAll("[data-arch-chapter]"));
    if (!chapters.length) return;
    const targetY = window.innerHeight * 0.52;
    let activeIndex = 0;
    let containedIndex = -1;
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    chapters.forEach((chapter, index) => {
      const rect = chapter.getBoundingClientRect();
      if (rect.top <= targetY && rect.bottom >= targetY) containedIndex = index;
      const distance = Math.abs((rect.top + rect.bottom) / 2 - targetY);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    activeIndex = containedIndex >= 0 ? containedIndex : nearestIndex;

    const frame = document.getElementById("architectureFrame");
    const state = document.getElementById("archState");
    const caption = document.getElementById("archCaption");
    if (frame && frame.dataset.step !== String(activeIndex)) {
      frame.dataset.step = String(activeIndex);
      if (state) state.textContent = architectureCopy[activeIndex].state;
      if (caption) caption.textContent = architectureCopy[activeIndex].caption;
    }
    chapters.forEach((chapter, index) => {
      chapter.classList.toggle("is-active", index === activeIndex);
      if (index === activeIndex) chapter.setAttribute("aria-current", "step");
      else chapter.removeAttribute("aria-current");
    });
  }

  function setupJobTimeline() {
    const jobs = document.querySelectorAll("[data-job]");
    if (!("IntersectionObserver" in window)) {
      jobs.forEach((job) => job.classList.add("is-active"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle("is-active", entry.isIntersecting));
    }, { rootMargin: "-28% 0px -36% 0px", threshold: 0 });
    jobs.forEach((job) => observer.observe(job));
  }

  function setupMetricCounters() {
    const metrics = Array.from(document.querySelectorAll(".metric-value[data-count]"));
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        currentObserver.unobserve(entry.target);
        const element = entry.target;
        const target = Number(element.dataset.count);
        if (!Number.isFinite(target)) return;
        const prefix = element.dataset.prefix || "";
        const suffix = element.dataset.suffix || "";
        const start = performance.now();
        const duration = 1350;
        function tick(now) {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          element.textContent = prefix + Math.round(target * eased).toLocaleString("en-US") + suffix;
          if (t < 1) window.requestAnimationFrame(tick);
        }
        window.requestAnimationFrame(tick);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    metrics.forEach((metric) => observer.observe(metric));
  }

  function ago(dateString) {
    const timestamp = Date.parse(dateString);
    if (!Number.isFinite(timestamp)) return "";
    const days = Math.max(0, Math.floor((Date.now() - timestamp) / 86400000));
    if (days === 0) return "today";
    if (days === 1) return "1 day ago";
    if (days < 30) return days + " days ago";
    const months = Math.floor(days / 30);
    if (months < 12) return months + (months === 1 ? " mo ago" : " mos ago");
    const years = Math.floor(months / 12);
    return years + (years === 1 ? " yr ago" : " yrs ago");
  }

  async function fetchProject(repo) {
    const response = await fetch("https://api.github.com/repos/SohamPardeshi3/" + encodeURIComponent(repo), {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-cache"
    });
    if (!response.ok) throw new Error("GitHub repository metadata unavailable");
    return response.json();
  }

  function setupProjectMetadata() {
    document.querySelectorAll(".project-row[data-repo]").forEach(async (row) => {
      const meta = row.querySelector("[data-meta]");
      if (!meta) return;
      const repo = row.dataset.repo;
      const name = row.querySelector(".project-name");
      try {
        const data = await fetchProject(repo);
        const parts = [];
        if (Number.isFinite(data.stargazers_count)) parts.push("★ " + data.stargazers_count);
        if (data.language) parts.push(data.language);
        const updated = ago(data.updated_at);
        if (updated) parts.push("updated " + updated);
        if (!parts.length) return;
        const arrow = document.createElement("i");
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "↗";
        meta.replaceChildren(document.createTextNode(parts.join(" · ")), arrow);
        meta.setAttribute("aria-label", (name ? name.textContent : repo) + ": " + parts.join(", "));
      } catch (_error) {
        // Keep the static GitHub label and working repository link.
      }
    });
  }

  function setupHeroParallax() {
    const orbit = document.querySelector(".hero-orbit");
    if (!orbit || reduceMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let pointerQueued = false;
    let x = 0;
    let y = 0;
    window.addEventListener("pointermove", (event) => {
      x = (event.clientX / window.innerWidth - 0.5) * 13;
      y = (event.clientY / window.innerHeight - 0.5) * 10;
      if (pointerQueued) return;
      pointerQueued = true;
      window.requestAnimationFrame(() => {
        orbit.style.setProperty("--pointer-x", x.toFixed(1) + "px");
        orbit.style.setProperty("--pointer-y", y.toFixed(1) + "px");
        pointerQueued = false;
      });
    }, { passive: true });
  }

  function setupProjectHighlights() {
    const projects = document.querySelectorAll(".project-row");
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    projects.forEach((project) => {
      let queued = false;
      let x = "50%";
      let y = "50%";
      project.addEventListener("pointermove", (event) => {
        const rect = project.getBoundingClientRect();
        x = ((event.clientX - rect.left) / rect.width * 100).toFixed(1) + "%";
        y = ((event.clientY - rect.top) / rect.height * 100).toFixed(1) + "%";
        if (queued) return;
        queued = true;
        window.requestAnimationFrame(() => {
          project.style.setProperty("--pointer-x", x);
          project.style.setProperty("--pointer-y", y);
          queued = false;
        });
      }, { passive: true });
    });
  }

  function setupToolbox() {
    document.querySelectorAll("[data-tool-group]").forEach((group) => {
      group.tabIndex = 0;
      group.addEventListener("focus", () => group.classList.add("is-lit"));
      group.addEventListener("blur", () => group.classList.remove("is-lit"));
      group.addEventListener("pointerenter", () => group.classList.add("is-lit"));
      group.addEventListener("pointerleave", () => group.classList.remove("is-lit"));
    });
  }

  setupActiveNavigation();
  setupSelectiveReveals();
  setupJobTimeline();
  setupMetricCounters();
  setupProjectMetadata();
  setupHeroParallax();
  setupProjectHighlights();
  setupToolbox();
  window.addEventListener("scroll", requestScrollState, { passive: true });
  window.addEventListener("resize", requestScrollState, { passive: true });
  setScrollState();
})();

