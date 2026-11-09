(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 70}ms`;
      io.observe(el);
    });
  }

  /* ---------- Card spotlight ---------- */
  document.querySelectorAll(".spot").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Show more on jobs ---------- */
  document.querySelectorAll(".job .toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const job = btn.closest(".job");
      const open = job.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Show less" : "Show more";
    });
  });

  /* ---------- Count-up stats ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
    const start = performance.now();
    const dur = 1400;
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); }
    }), { threshold: 0.6 });
    counters.forEach((c) => co.observe(c));
  } else counters.forEach(runCount);

  /* ---------- Active nav link ---------- */
  const links = [...document.querySelectorAll(".nav-links a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const so = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`));
      }
    }), { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => so.observe(s));
  }

  /* ---------- Terminal typing ---------- */
  const term = document.getElementById("terminal");
  const script = [
    { cmd: "whoami" },
    { out: '<span class="hl">Charnchon Subsiri</span> — Full Stack Developer' },
    { cmd: "cat stack.txt" },
    { out: "React · Vue · Next · Node.js · Python · C# · AWS" },
    { cmd: "claude mcp add atiom-hub" },
    { out: '<span class="ok">✓</span> connected · Modules, Quizzes, QA Pools, Surveys' },
    { cmd: "git log --oneline --since=2021 | wc -l" },
    { out: '<span class="c"># 5+ years across 5 companies</span>' },
    { cmd: "open ./resume.pdf" },
  ];
  const prompt = '<span class="p">➜</span> <span class="hl">~</span> ';

  if (reduceMotion) {
    term.innerHTML = script.map((l) => (l.cmd ? prompt + l.cmd : l.out)).join("\n") + '\n<span class="caret"></span>';
  } else {
    let html = "";
    let i = 0;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const render = (extra = "") => { term.innerHTML = html + extra + '<span class="caret"></span>'; };
    (async () => {
      await sleep(500);
      for (const line of script) {
        if (line.cmd) {
          html += prompt;
          for (const ch of line.cmd) { html += ch; render(); await sleep(38 + Math.random() * 50); }
          await sleep(260);
        } else {
          html += line.out;
          render();
          await sleep(420);
        }
        if (i++ < script.length - 1) html += "\n";
      }
      render();
    })();
  }

  /* ---------- Resume viewer ---------- */
  const dialog = document.getElementById("resume-dialog");
  const frame = dialog.querySelector("iframe");
  const pdfUrl = "assets/Charnchon-Subsiri-Resume.pdf";
  // Small screens / browsers without inline PDF support: open the PDF directly.
  const canInline = () => window.innerWidth > 720 && (navigator.pdfViewerEnabled !== false);

  document.querySelectorAll("[data-open-resume]").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (!canInline() || typeof dialog.showModal !== "function") {
        window.open(pdfUrl, "_blank", "noopener");
        return;
      }
      if (!frame.src) frame.src = frame.dataset.src;
      dialog.showModal();
      document.body.style.overflow = "hidden";
    })
  );
  const close = () => dialog.close();
  dialog.querySelector("[data-close-resume]").addEventListener("click", close);
  dialog.addEventListener("click", (e) => { if (e.target === dialog) close(); });
  dialog.addEventListener("close", () => { document.body.style.overflow = ""; });
})();
