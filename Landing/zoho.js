/* ============================================================
   VOLTVAVE SOLUTIONS — Zoho Partner Website
   Vanilla JavaScript interactions
   ------------------------------------------------------------
   01. Helpers
   02. Sticky header state
   03. Mobile navigation
   04. Desktop dropdown hover
   05. Smooth scrolling (header offset)
   06. Scroll reveal (IntersectionObserver)
   07. Animated counters
   08. Product category filtering
   09. Testimonial carousel
   10. Active nav state (scrollspy)
   11. Contact form validation
   12. Back-to-top
   13. Chat widget
   14. Cookie notice
   15. Footer year
   16. Lead capture modal
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 01. Helpers ---------- */
  const q = (sel, ctx = document) => ctx.querySelector(sel);
  const qa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const HEADER_OFFSET = 88;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    stickyHeader();
    mobileNav();
    dropdownHover();
    smoothScroll();
    scrollReveal();
    counters();
    productFilter();
    testimonials();
    scrollSpy();
    contactForm();
    backToTop();
    chatWidget();
    cookieNotice();
    setYear();
    leadModal();
  }

  /* ---------- 02. Sticky header ---------- */
  function stickyHeader() {
    const header = q("#siteHeader");
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 03. Mobile navigation ---------- */
  function mobileNav() {
    const burger = q("#navBurger");
    const panel = q("#mobileNav");
    const backdrop = q("#mnavBackdrop");
    const closeBtn = q("#mnavClose");
    if (!burger || !panel) return;

    const open = () => {
      panel.classList.add("open");
      backdrop.hidden = false;
      requestAnimationFrame(() => backdrop.classList.add("show"));
      burger.classList.add("open");
      burger.setAttribute("aria-expanded", "true");
      panel.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };
    const close = () => {
      panel.classList.remove("open");
      backdrop.classList.remove("show");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      panel.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      setTimeout(() => { backdrop.hidden = true; }, 300);
    };

    burger.addEventListener("click", () => panel.classList.contains("open") ? close() : open());
    closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    // Close when any link inside the panel is clicked
    qa("a", panel).forEach(a => a.addEventListener("click", close));
  }

  /* ---------- 04. Desktop dropdown hover ---------- */
  function dropdownHover() {
    if (typeof bootstrap === "undefined") return;
    const mq = window.matchMedia("(min-width: 992px)");
    qa(".nav-item.dropdown").forEach(item => {
      const toggle = q(".dropdown-toggle", item);
      if (!toggle) return;
      const instance = () => bootstrap.Dropdown.getOrCreateInstance(toggle, { autoClose: "outside" });
      item.addEventListener("mouseenter", () => { if (mq.matches) instance().show(); });
      item.addEventListener("mouseleave", () => { if (mq.matches) instance().hide(); });
      // Prevent the toggle link from jumping when it opens the menu
      toggle.addEventListener("click", e => { if (mq.matches) e.preventDefault(); });
      // Close an open menu after choosing an item
      qa(".menu-link, .menu-cta", item).forEach(l =>
        l.addEventListener("click", () => instance().hide()));
    });
  }

  /* ---------- 05. Smooth scrolling with header offset ---------- */
  function smoothScroll() {
    qa('a[href^="#"]').forEach(link => {
      link.addEventListener("click", e => {
        const id = link.getAttribute("href");
        if (!id || id.length < 2) { e.preventDefault(); return; }
        const target = q(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
        history.replaceState(null, "", id);
      });
    });
  }

  /* ---------- 06. Scroll reveal ---------- */
  function scrollReveal() {
    const items = qa(".rv");
    if (!("IntersectionObserver" in window) || reducedMotion) {
      items.forEach(el => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(el => io.observe(el));
  }

  /* ---------- 07. Animated counters ---------- */
  function counters() {
    const nums = qa("[data-count]");
    if (!nums.length) return;
    const animate = el => {
      const target = parseInt(el.dataset.count, 10);
      if (reducedMotion) { el.textContent = target; return; }
      const duration = 1600;
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(n => io.observe(n));
  }

  /* ---------- 08. Product category filtering ---------- */
  function productFilter() {
    const buttons = qa(".filter-btn");
    const items = qa(".prod-item");
    const empty = q("#emptyFilter");
    if (!buttons.length) return;

    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.dataset.filter;
        let visible = 0;
        items.forEach(item => {
          const match = cat === "all" || item.dataset.cat === cat;
          if (match) {
            visible++;
            item.classList.remove("filter-hide");
            // restart the small pop animation
            item.style.animation = "none";
            void item.offsetWidth;
            item.style.animation = "";
          } else {
            item.classList.add("filter-hide");
          }
        });
        if (empty) empty.hidden = visible !== 0;
      });
    });
  }

  /* ---------- 09. Testimonial carousel ---------- */
  function testimonials() {
    const track = q("#tstTrack");
    const shell = q("#tstShell");
    if (!track || !shell) return;
    const slides = qa(".tst-slide", track);
    const prev = q("#tstPrev");
    const next = q("#tstNext");
    const dotsWrap = q("#tstDots");
    let index = 0, timer = null;

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "tst-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Testimonial " + (i + 1));
      dot.addEventListener("click", () => go(i, true));
      dotsWrap.appendChild(dot);
    });
    const dots = qa(".tst-dot", dotsWrap);

    const go = (i, user) => {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      dots.forEach((d, di) => d.classList.toggle("active", di === index));
      if (user) restart();
    };
    const restart = () => {
      if (timer) clearInterval(timer);
      if (!reducedMotion) timer = setInterval(() => go(index + 1), 6000);
    };

    prev.addEventListener("click", () => go(index - 1, true));
    next.addEventListener("click", () => go(index + 1, true));
    shell.addEventListener("mouseenter", () => timer && clearInterval(timer));
    shell.addEventListener("mouseleave", restart);

    // Basic touch swipe
    let startX = null;
    track.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", e => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1), true);
      startX = null;
    }, { passive: true });

    restart();
  }

  /* ---------- 10. Active nav state (scrollspy) ---------- */
  function scrollSpy() {
    const links = qa("[data-spy]");
    if (!links.length) return;
    const map = new Map(links.map(l => [l.dataset.spy, l]));
    const sections = Array.from(map.keys()).map(id => q("#" + id)).filter(Boolean);
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.remove("active"));
          const link = map.get(entry.target.id);
          if (link) link.classList.add("active");
        }
      });
    }, { rootMargin: "-38% 0px -55% 0px" });
    sections.forEach(s => io.observe(s));
  }

  /* ---------- 11. Contact form validation ---------- */
  function contactForm() {
    enquiryForm(q("#contactForm"), q("#formSuccess"), q("#formAgain"), () => {
      q("#contact").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
    enquiryForm(q("#modalContactForm"), q("#modalFormSuccess"), q("#modalFormAgain"), () => {
      const body = q(".lead-modal-body");
      if (body) body.scrollTop = 0;
      leadModalDone();
    });
  }

  // Shared by the page form and its duplicate inside the lead modal.
  function enquiryForm(form, success, again, onSent) {
    if (!form) return;

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phoneRe = /^[+()\-.\s\d]{7,20}$/;
    const btn = q('button[type="submit"]', form);
    const btnLabel = btn ? btn.innerHTML : "";

    const setState = (field, ok, showErr = true) => {
      if (!field) return ok;
      field.classList.toggle("is-invalid", !ok);
      if (ok && field.value.trim() !== "") field.classList.add("is-valid");
      else if (!ok) field.classList.remove("is-valid");
      const err = q('[data-err="' + field.id + '"]', form);
      if (err) err.classList.toggle("show", !ok && showErr);
      return ok;
    };

    const validators = [
      ['[name="name"]', v => v.trim().length >= 2],
      ['[name="email"]', v => emailRe.test(v.trim())],
      ['[name="phone"]', v => v.trim() === "" || phoneRe.test(v.trim())],
      ['[name="services"]', v => v !== ""],
      ['[name="details"]', v => v.trim().length >= 10]
    ];

    // Live validation after first blur
    validators.forEach(([sel, test]) => {
      const field = q(sel, form);
      if (!field) return;
      field.addEventListener("blur", () => { if (field.value !== "") setState(field, test(field.value)); });
      field.addEventListener("input", () => {
        if (field.classList.contains("is-invalid")) setState(field, test(field.value));
      });
    });

    form.addEventListener("submit", e => {
      e.preventDefault();
      let allOk = true;
      validators.forEach(([sel, test]) => {
        const field = q(sel, form);
        if (!setState(field, test(field ? field.value : ""))) allOk = false;
      });
      if (!allOk) {
        const firstBad = q(".is-invalid", form);
        if (firstBad) firstBad.focus();
        return;
      }
      // Placeholder submission — replace with real endpoint / Zoho CRM Web-to-Lead.
      btn.disabled = true;
      btn.innerHTML = "Sending…";
      setTimeout(() => {
        form.hidden = true;
        if (success) success.hidden = false;
        if (onSent) onSent();
      }, 700);
    });

    if (again) again.addEventListener("click", () => {
      success.hidden = true;
      form.hidden = false;
      form.reset();
      qa(".form-control-z", form).forEach(f => f.classList.remove("is-valid", "is-invalid"));
      qa(".field-err", form).forEach(el => el.classList.remove("show"));
      btn.disabled = false;
      btn.innerHTML = btnLabel;
    });
  }

  /* ---------- 12. Back-to-top ---------- */
  function backToTop() {
    const btn = q("#backTop");
    if (!btn) return;
    window.addEventListener("scroll", () => {
      btn.classList.toggle("show", window.scrollY > 650);
    }, { passive: true });
    btn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));
  }

  /* ---------- 13. Chat widget ---------- */
  function chatWidget() {
    const fab = q("#fabChat");
    const pop = q("#chatPop");
    const close = q("#chatClose");
    const toForm = q("#chatToForm");
    if (!fab || !pop) return;
    const toggle = state => {
      pop.hidden = state !== undefined ? !state : !pop.hidden;
      fab.setAttribute("aria-expanded", String(!pop.hidden));
      // keep the back-to-top button clear of the open chat card
      const bt = q("#backTop");
      if (bt) bt.classList.toggle("d-none", !pop.hidden);
    };
    fab.addEventListener("click", () => toggle());
    close.addEventListener("click", () => toggle(false));
    if (toForm) toForm.addEventListener("click", () => toggle(false));
    document.addEventListener("keydown", e => { if (e.key === "Escape") toggle(false); });
    document.addEventListener("click", e => {
      if (!pop.hidden && !pop.contains(e.target) && !fab.contains(e.target)) toggle(false);
    });
  }

  /* ---------- 14. Cookie notice ---------- */
  function cookieNotice() {
    const box = q("#cookieBox");
    if (!box) return;
    let stored = null;
    try { stored = localStorage.getItem("voltvave_cookie"); } catch (err) { /* private mode */ }
    if (!stored) setTimeout(() => { box.hidden = false; }, 1400);
    const save = val => {
      try { localStorage.setItem("voltvave_cookie", val); } catch (err) { /* ignore */ }
      box.hidden = true;
    };
    q("#cookieAccept").addEventListener("click", () => save("accepted"));
    q("#cookieDecline").addEventListener("click", () => save("declined"));
  }

  /* ---------- 15. Footer year ---------- */
  function setYear() {
    const y = q("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- 16. Lead capture modal ---------- */
  const LEAD_MODAL_KEY = "voltvave_lead_modal";

  // Shown once per browsing session so it never nags on every page view.
  function leadModalDone() {
    try { sessionStorage.setItem(LEAD_MODAL_KEY, "1"); } catch (err) { /* private mode */ }
  }

  function leadModal() {
    const modal = q("#leadModal");
    if (!modal) return;
    const dialog = q(".lead-modal-dialog", modal);
    const closeBtn = q("#leadModalClose", modal);
    let lastFocus = null;

    let seen = false;
    try { seen = sessionStorage.getItem(LEAD_MODAL_KEY) === "1"; } catch (err) { /* private mode */ }

    const open = () => {
      if (!modal.hidden) return;
      lastFocus = document.activeElement;
      modal.hidden = false;
      const gap = window.innerWidth - document.documentElement.clientWidth;
      if (gap > 0) document.body.style.paddingRight = gap + "px";
      document.body.classList.add("lead-modal-open");
      dialog.focus({ preventScroll: true });
    };

    const close = () => {
      if (modal.hidden) return;
      modal.hidden = true;
      document.body.classList.remove("lead-modal-open");
      document.body.style.paddingRight = "";
      leadModalDone();
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    };

    if (!seen) setTimeout(open, 3000);

    closeBtn.addEventListener("click", close);
    modal.addEventListener("click", e => { if (e.target.closest("[data-lead-close]")) close(); });

    document.addEventListener("keydown", e => {
      if (modal.hidden) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab") return;
      const focusable = qa('button, [href], input, select, textarea', dialog)
        .filter(el => !el.disabled && el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
})();
