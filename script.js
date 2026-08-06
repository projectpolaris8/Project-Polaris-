// ============================================================
// Project Polaris — main.js
// Theme toggle · starfield · scroll reveal · mobile nav ·
// animated counters · enquiry form
// ============================================================

(function () {
  "use strict";

  var root = document.documentElement;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Theme toggle ---------------- */
  var themeToggle = document.getElementById("themeToggle");
  var saved = localStorage.getItem("polaris-theme");
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  function currentTheme() { return root.getAttribute("data-theme") || "dark"; }
  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("polaris-theme", theme);
    if (themeToggle) themeToggle.setAttribute("aria-label", "Switch to " + (theme === "dark" ? "light" : "dark") + " theme");
  }
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  }

  /* ---------------- Mobile nav ---------------- */
  var menuBtn = document.getElementById("menuBtn");
  var header = document.getElementById("siteHeader");
  if (menuBtn && header) {
    menuBtn.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".primary-nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        header.classList.remove("nav-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () { entry.target.classList.add("in"); }, i * 70);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------------- Animated counters ---------------- */
  var counters = document.querySelectorAll(".stat-number[data-target]");
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-target"));
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1400;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.textContent = (target % 1 === 0 ? Math.round(value) : value.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    if (reducedMotion) {
      el.textContent = target + suffix;
    } else {
      requestAnimationFrame(step);
    }
  }
  if (counters.length && "IntersectionObserver" in window) {
    var cIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cIo.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute("data-target") + (el.getAttribute("data-suffix") || ""); });
  }

  /* ---------------- Footer year ---------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Enquiry / contact form (Netlify Forms) ---------------- */
  var form = document.getElementById("enquiryForm");
  var status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.textContent = "Sending…";
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body,
      })
        .then(function (res) {
          if (res.ok) {
            status.textContent = "Thanks — your message has been sent.";
            form.reset();
          } else {
            status.textContent = "Something went wrong. Please try again, or email us directly.";
          }
        })
        .catch(function () {
          status.textContent = "This form only submits once the site is deployed live (Netlify/Vercel) — it won't work when opened as a local file.";
        });
    });
  }

  /* ---------------- Starfield (canvas, used on every page) ---------------- */
  function initStarfield(canvasId, opts) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var stars = [];
    var northStar = null;
    var w, h, dpr;
    var density = (opts && opts.density) || 9000;
    var withNorthStar = !opts || opts.northStar !== false;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
    }

    function buildStars() {
      var count = Math.round((w * h) / density);
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.1 + 0.3,
          baseAlpha: Math.random() * 0.5 + 0.25,
          twinkleSpeed: Math.random() * 0.015 + 0.004,
          phase: Math.random() * Math.PI * 2,
        });
      }
      if (withNorthStar) northStar = { x: w * 0.5, y: h * 0.28, r: 2.6 };
    }

    function drawSpike(x, y, len, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      var grad = ctx.createRadialGradient(x, y, 0, x, y, len);
      grad.addColorStop(0, "rgba(212,175,55,0.9)");
      grad.addColorStop(1, "rgba(212,175,55,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - len, y); ctx.lineTo(x + len, y);
      ctx.moveTo(x, y - len); ctx.lineTo(x, y + len);
      ctx.stroke();
      ctx.restore();
    }

    var t = 0;
    var starRgb = "255,255,255";
    function frame() {
      t += 1;
      ctx.clearRect(0, 0, w, h);
      if (t % 30 === 0) starRgb = getComputedStyle(root).getPropertyValue("--star-color").trim() || "255,255,255";

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var alpha = s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.phase) * 0.2;
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + starRgb + ", " + Math.max(alpha, 0.08) + ")";
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (northStar) {
        var pulse = 0.75 + Math.sin(t * 0.02) * 0.2;
        drawSpike(northStar.x, northStar.y, 16 * pulse, 0.55 * pulse);
        ctx.beginPath();
        ctx.fillStyle = "#FFFFFF";
        ctx.globalAlpha = 0.95;
        ctx.arc(northStar.x, northStar.y, northStar.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (!reducedMotion) requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize);
    resize();
    frame();
  }

  initStarfield("starfield", { density: 9000, northStar: true });
  initStarfield("starfield-small", { density: 12000, northStar: false });
})();
