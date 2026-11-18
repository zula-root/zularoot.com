/* Zula Root — script
   Five small jobs: theme, nav state, section reveal, the light at the
   top of the page, and the picture strip on project pages. Everything
   degrades to a plain readable page without it. */

(() => {
  const doc = document;
  const root = doc.documentElement;
  root.classList.add("js");

  /* Theme: follows the system until the reader chooses. */
  const toggle = doc.querySelector(".theme-toggle");
  const dark = matchMedia("(prefers-color-scheme: dark)");
  const current = () => root.dataset.theme || (dark.matches ? "dark" : "light");
  toggle?.addEventListener("click", () => {
    const next = current() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  });

  /* Live clocks: each frame shows a clock's stand face in the page's own
     light or dark, and the Transit and Docket buttons swap which clock. */
  const lives = [...doc.querySelectorAll(".live")];
  const liveSrc = (clock) => `https://zula-root.github.io/${clock}/?face=stand&theme=${current()}`;
  const setLive = (live, clock) => {
    live.dataset.clock = clock;
    const frame = live.querySelector(".live-frame");
    const src = liveSrc(clock);
    if (frame.src !== src) frame.src = src;
    frame.title = `The ${clock.replace("-", " ")}, live`;
    for (const b of live.querySelectorAll(".live-tabs button")) b.setAttribute("aria-pressed", String(b.dataset.clock === clock));
  };
  const refreshLives = () => lives.forEach((live) => setLive(live, live.dataset.clock));
  for (const live of lives) {
    for (const b of live.querySelectorAll(".live-tabs button")) b.addEventListener("click", () => setLive(live, b.dataset.clock));
  }
  refreshLives();
  toggle?.addEventListener("click", refreshLives);
  dark.addEventListener("change", refreshLives);

  /* Nav: a hairline appears once the page has scrolled under it,
     and the link for the section in view is darkened. */
  const nav = doc.querySelector(".nav");
  const onScroll = () => nav?.classList.toggle("is-stuck", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const links = [...doc.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = links
    .map((a) => doc.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  const spy = () => {
    const probe = scrollY + innerHeight * 0.4;
    const atEnd = innerHeight + scrollY >= doc.body.scrollHeight - 2;
    let active = null;
    for (const s of sections) if (s.offsetTop <= probe) active = s;
    if (atEnd) active = sections[sections.length - 1];
    for (const a of links) {
      const on = active && a.getAttribute("href") === "#" + active.id;
      if (on) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    }
  };
  addEventListener("scroll", spy, { passive: true });
  addEventListener("resize", spy);
  spy();

  /* Reveal: each section fades up once, when it first comes into view.
     Checked on scroll rather than with an observer, so it also runs in
     throttled background tabs and when the page opens at a hash. */
  const reveals = [...doc.querySelectorAll(".reveal")];
  const reveal = () => {
    const limit = innerHeight * 0.92;
    for (const el of reveals) {
      if (el.classList.contains("is-in")) continue;
      if (el.getBoundingClientRect().top < limit) el.classList.add("is-in");
    }
  };
  addEventListener("scroll", reveal, { passive: true });
  addEventListener("resize", reveal);
  addEventListener("load", reveal);
  reveal();

  /* Daylight: the faint colour at the top of the page follows the reader's
     own time of day. The day is a short list of moments, each with the
     two colours of its light, and the hour now is mixed from the two
     moments either side of it. ?hour=6.5 shows another time of day. */
  const LIGHT = [
    // hour, the glow on the right, the glow on the left
    [0, [150, 170, 225], [185, 165, 225]],
    [5, [165, 180, 230], [205, 170, 215]],
    [7, [255, 178, 132], [246, 160, 190]],
    [10, [160, 215, 180], [150, 195, 240]],
    [15, [165, 215, 185], [160, 200, 240]],
    [18, [255, 186, 110], [236, 150, 185]],
    [20.5, [190, 160, 225], [150, 170, 230]],
    [24, [150, 170, 225], [185, 165, 225]],
  ];
  const light = () => {
    const now = new Date();
    const asked = parseFloat(new URLSearchParams(location.search).get("hour"));
    const h = asked >= 0 && asked < 24 ? asked : now.getHours() + now.getMinutes() / 60;
    let i = 0;
    while (LIGHT[i + 1][0] <= h) i++;
    const [h0, a0, b0] = LIGHT[i];
    const [h1, a1, b1] = LIGHT[i + 1];
    const mix = (x, y) => x.map((v, k) => Math.round(v + ((y[k] - v) * (h - h0)) / (h1 - h0))).join(" ");
    root.style.setProperty("--glow-a", mix(a0, a1));
    root.style.setProperty("--glow-b", mix(b0, b1));
  };
  light();
  setInterval(light, 5 * 60 * 1000);

  /* Pictures: on a project page the pictures sit in a row that scrolls
     sideways and snaps. That already works by swipe. Here it gains two
     chevrons, a counter and one caption that follows the picture in view. */
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  for (const shots of doc.querySelectorAll(".shots")) {
    const track = shots.querySelector(".shots-track");
    const slides = [...track.children];
    if (slides.length < 2) continue;
    shots.classList.add("js-shots");

    const bar = doc.createElement("div");
    bar.className = "shots-bar";
    bar.innerHTML =
      '<p class="shots-caption" aria-live="polite"></p>' +
      '<div class="stepper" role="group" aria-label="Pictures">' +
      '<button type="button" aria-label="Previous picture"><svg viewBox="0 0 7 11" aria-hidden="true"><path d="M6 1 1.5 5.5 6 10"/></svg></button>' +
      '<span class="stepper-count"><b>1</b> / ' + slides.length + "</span>" +
      '<button type="button" aria-label="Next picture"><svg viewBox="0 0 7 11" aria-hidden="true"><path d="M1 1l4.5 4.5L1 10"/></svg></button>' +
      "</div>";
    shots.append(bar);

    const caption = bar.querySelector(".shots-caption");
    const count = bar.querySelector("b");
    const [prev, next] = bar.querySelectorAll("button");
    const left = (i) => slides[i].offsetLeft - slides[0].offsetLeft;
    let at = -1;

    const draw = () => {
      // The picture in view is the one whose left edge is nearest the strip's.
      let i = 0;
      for (let k = 1; k < slides.length; k++)
        if (Math.abs(left(k) - track.scrollLeft) < Math.abs(left(i) - track.scrollLeft)) i = k;
      if (i === at) return;
      at = i;
      count.textContent = i + 1;
      caption.textContent = slides[i].querySelector("figcaption")?.textContent.trim() || "";
    };
    // Past the last picture it turns back to the first, and the other way round.
    // That turn is a jump: sliding back through every picture would only be in the way.
    const go = (i) => {
      const wraps = i < 0 || i >= slides.length;
      track.scrollTo({ left: left((i + slides.length) % slides.length), behavior: wraps || still.matches ? "auto" : "smooth" });
    };

    prev.addEventListener("click", () => go(at - 1));
    next.addEventListener("click", () => go(at + 1));
    track.addEventListener("scroll", () => requestAnimationFrame(draw), { passive: true });
    track.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      go(at + (e.key === "ArrowRight" ? 1 : -1));
    });
    addEventListener("resize", draw);
    draw();
  }
})();
