(function () {
  // ---------------------------------------------------------------------
  // EmailJS config — sign up free at https://www.emailjs.com, then:
  //  1. Add an Email Service (e.g. Gmail) -> copy its Service ID below.
  //  2. Create an Email Template with variables {{user_name}}, {{user_email}},
  //     {{message}} -> copy its Template ID below.
  //  3. Account > General > copy your Public Key below.
  // Until these three are filled in, the contact form will show an error
  // instead of silently pretending to send.
  // ---------------------------------------------------------------------
  var EMAILJS_PUBLIC_KEY = 'kzi7ZmQeoMg1QpYUt';
  var EMAILJS_SERVICE_ID = 'service_akdk8s7';
  var EMAILJS_TEMPLATE_ID = 'template_txe863c';

  document.addEventListener('DOMContentLoaded', function () {
    // Footer year
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    // Theme toggle (dark/light), persisted to localStorage
    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      var root = document.documentElement;
      var syncToggleA11y = function () {
        var isLight = root.getAttribute('data-theme') === 'light';
        themeToggle.setAttribute('aria-pressed', String(isLight));
        themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
      };
      syncToggleA11y();
      themeToggle.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
        syncToggleA11y();
      });
    }

    // Mobile nav toggle
    var toggle = document.querySelector('.nav-toggle');
    var navList = document.getElementById('nav-list');
    var closeMobileNav = function () {
      if (navList) navList.classList.remove('open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    };
    if (toggle && navList) {
      toggle.addEventListener('click', function () {
        var open = navList.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      // Close on outside click
      document.addEventListener('click', function (e) {
        if (!navList.classList.contains('open')) return;
        if (navList.contains(e.target) || toggle.contains(e.target)) return;
        closeMobileNav();
      });
      // Close on Escape, return focus to the toggle button
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navList.classList.contains('open')) {
          closeMobileNav();
          toggle.focus();
        }
      });
    }

    // Smooth scroll + close mobile nav on link click
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href === '#') return;
        var el = document.querySelector(href);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMobileNav();
      });
    });

    // Scroll-spy: highlight active nav link
    var navLinks = document.querySelectorAll('[data-nav]');
    var sections = Array.prototype.map.call(navLinks, function (link) {
      return document.querySelector(link.getAttribute('href'));
    }).filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            var isActive = link.getAttribute('href') === '#' + entry.target.id;
            link.classList.toggle('active', isActive);
            if (isActive) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(function (s) { spy.observe(s); });
    }

    // Reveal-on-scroll
    var revealEls = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window && revealEls.length) {
      var reveal = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            reveal.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(function (el) { reveal.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }

    // Back-to-top visibility + scroll progress bar (single scroll listener)
    var backToTop = document.querySelector('.back-to-top');
    var progressBar = document.getElementById('scroll-progress-bar');
    window.addEventListener('scroll', function () {
      if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
      if (progressBar) {
        var doc = document.documentElement;
        var max = doc.scrollHeight - doc.clientHeight;
        var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
        progressBar.style.width = pct + '%';
      }
    }, { passive: true });

    // Project screenshot loading: fade in when ready, fall back to a
    // "drop your image here" caption if the file is missing (404).
    document.querySelectorAll('.project-media img, .project-compact-media img').forEach(function (img) {
      var markLoaded = function () { img.classList.add('is-loaded'); };
      if (img.complete && img.naturalWidth > 0) {
        markLoaded();
      } else {
        img.addEventListener('load', markLoaded);
      }
      img.addEventListener('error', function () {
        var media = img.closest('.project-media');
        if (media) media.classList.add('is-missing');
      });
    });

    // Subtle 3D tilt on project cards, following the cursor
    var supportsHover = window.matchMedia('(hover: hover)').matches;
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (supportsHover && !prefersReducedMotion) {
      document.querySelectorAll('.project').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
          var rect = card.getBoundingClientRect();
          var px = (e.clientX - rect.left) / rect.width - 0.5;
          var py = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.setProperty('--ry', (px * 6).toFixed(2) + 'deg');
          card.style.setProperty('--rx', (py * -6).toFixed(2) + 'deg');
        });
        card.addEventListener('mouseleave', function () {
          card.style.setProperty('--rx', '0deg');
          card.style.setProperty('--ry', '0deg');
        });
      });
    }

    // Contact form — real delivery via EmailJS
    var form = document.getElementById('contact-form');
    var statusEl = document.getElementById('form-status');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        var notConfigured = [EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID]
          .some(function (v) { return !v || v.indexOf('YOUR_') === 0; });

        if (notConfigured || typeof emailjs === 'undefined') {
          setStatus('error', 'Email sending isn\'t configured yet — set your EmailJS Service/Template/Public keys in portfolio.js.');
          return;
        }

        form.classList.add('is-sending');
        setStatus('', '');

        emailjs.init(EMAILJS_PUBLIC_KEY);
        emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
          .then(function () {
            setStatus('success', 'Message sent — thanks for reaching out! I\'ll reply soon.');
            form.reset();
          })
          .catch(function () {
            setStatus('error', 'Something went wrong sending your message. Please email me directly instead.');
          })
          .finally(function () {
            form.classList.remove('is-sending');
          });
      });
    }

    function setStatus(type, message) {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.classList.remove('success', 'error');
      if (type) statusEl.classList.add(type);
    }
  });
})();
