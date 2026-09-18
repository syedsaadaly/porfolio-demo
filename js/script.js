/* =====================================================
   Hamza Akhtar Portfolio — Interactions & Animations
   ===================================================== */
(function () {
  'use strict';

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  /* ---------- Preloader ---------- */
  let preloaderDone = false;
  function finishPreloader() {
    if (preloaderDone) return; preloaderDone = true;
    $('#preloader').classList.add('done');
    document.body.classList.add('loaded');
    // kick the hero reveals right away
    $$('.hero .reveal, .hero .reveal-left, .hero .reveal-right, .hero .reveal-up').forEach((el, i) => {
      setTimeout(() => el.classList.add('in-view'), 120 * i);
    });
  }
  window.addEventListener('load', () => setTimeout(finishPreloader, 1400));
  setTimeout(finishPreloader, 3500); // safety net if fonts/icons load slowly

  /* ---------- Photo fallback (shows initials if assets/hamza.png is missing) ---------- */
  function bindFallback(imgId, avatarId) {
    const img = $('#' + imgId), avatar = $('#' + avatarId);
    if (!img || !avatar) return;
    const fail = () => { img.style.display = 'none'; avatar.classList.add('show'); };
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
  }
  bindFallback('heroImg', 'heroAvatar');
  bindFallback('aboutImg', 'aboutAvatar');

  /* ---------- Custom cursor ---------- */
  const cursor = $('#cursor'), dot = $('#cursorDot');
  let mx = 0, my = 0, cx = 0, cy = 0;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`; });
  (function animateCursor() {
    cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(animateCursor);
  })();
  $$('a, button, .chip, .skill-card, .project, .acc-item__head').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  /* ---------- Typed text ---------- */
  const roles = ['PHP / Laravel Developer', 'Full-Stack Web Developer', 'RESTful API Builder', 'NestJS + React Developer'];
  const typedEl = $('#typed');
  let rIdx = 0, chIdx = 0, deleting = false;
  function type() {
    const word = roles[rIdx];
    typedEl.textContent = word.slice(0, chIdx);
    if (!deleting && chIdx < word.length) { chIdx++; setTimeout(type, 70); }
    else if (!deleting) { deleting = true; setTimeout(type, 1800); }
    else if (chIdx > 0) { chIdx--; setTimeout(type, 40); }
    else { deleting = false; rIdx = (rIdx + 1) % roles.length; setTimeout(type, 300); }
  }
  setTimeout(type, 1600);

  /* ---------- Header: sticky / hide on scroll down / active link ---------- */
  const header = $('#header'), navLinks = $$('.nav__link'), sections = $$('section[id]'), toTop = $('#toTop');
  let lastY = 0;
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    header.classList.toggle('hide', y > lastY && y > 400 && !$('#nav').classList.contains('open'));
    lastY = y;
    toTop.classList.toggle('show', y > 600);

    let current = 'home';
    sections.forEach(sec => { if (y >= sec.offsetTop - 220) current = sec.id; });
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Mobile menu ---------- */
  const hamburger = $('#hamburger'), nav = $('#nav');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open'); nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });
  navLinks.forEach(l => l.addEventListener('click', () => {
    hamburger.classList.remove('open'); nav.classList.remove('open'); document.body.style.overflow = '';
  }));

  /* ---------- Scroll reveal + counters + skill bars ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseInt(el.dataset.delay || 0, 10);
      setTimeout(() => el.classList.add('in-view'), delay);

      // counters inside
      $$('[data-count]', el).forEach(runCounter);
      if (el.hasAttribute('data-count')) runCounter(el);
      // skill bars inside
      $$('.bar span', el).forEach(b => { b.style.width = b.dataset.w + '%'; });
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal, .reveal-left, .reveal-right, .reveal-up, .about__exp').forEach(el => io.observe(el));

  function runCounter(el) {
    if (el.dataset.done) return; el.dataset.done = '1';
    const target = +el.dataset.count, dur = 1400, start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  /* ---------- Services accordion ---------- */
  const items = $$('.acc-item');
  function openItem(item) {
    items.forEach(i => { i.classList.remove('active'); $('.acc-item__body', i).style.maxHeight = null; });
    item.classList.add('active');
    const body = $('.acc-item__body', item);
    body.style.maxHeight = body.scrollHeight + 'px';
  }
  items.forEach(item => {
    $('.acc-item__head', item).addEventListener('click', () => {
      if (item.classList.contains('active')) { item.classList.remove('active'); $('.acc-item__body', item).style.maxHeight = null; }
      else openItem(item);
    });
  });
  const initial = $('.acc-item.active'); if (initial) openItem(initial);
  window.addEventListener('resize', () => { const a = $('.acc-item.active'); if (a) $('.acc-item__body', a).style.maxHeight = $('.acc-item__body', a).scrollHeight + 'px'; });

  /* ---------- Project filters ---------- */
  const filters = $$('.filter'), projects = $$('.project');
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(f => f.classList.remove('active')); btn.classList.add('active');
    const f = btn.dataset.filter;
    projects.forEach(p => p.classList.add('fade'));
    setTimeout(() => {
      projects.forEach((p, i) => {
        const show = f === 'all' || p.dataset.cat === f;
        p.classList.toggle('hidden', !show);
        if (show) setTimeout(() => p.classList.remove('fade'), 40 * i);
      });
    }, 320);
  }));

  /* ---------- Hero parallax on mouse move ---------- */
  const heroCenter = $('.hero__center'), tags = $$('.float-tag'), stamp = $('#stamp');
  if (window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth - 0.5), y = (e.clientY / window.innerHeight - 0.5);
      tags.forEach((t, i) => { const d = (i + 1) * 8; t.style.transform = `translate(${x * d}px, ${y * d}px)`; });
      stamp.style.transform = `translate(${x * -14}px, ${y * -14}px)`;
      heroCenter.style.setProperty('--tilt', `${x * 6}deg`);
    });
  }

  /* ---------- Contact form (front-end only) ---------- */
  const form = $('#contactForm'), note = $('#formNote');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#name').value.trim(), email = $('#email').value.trim(), subject = $('#subject').value.trim(), msg = $('#message').value.trim();
    const btn = $('button[type="submit"]', form);
    btn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
    setTimeout(() => {
      // Opens the user's mail client with the message pre-filled
      const body = encodeURIComponent(`Hi Hamza,\n\n${msg}\n\n— ${name} (${email})`);
      window.location.href = `mailto:hamzabaig620@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
      note.textContent = 'Thanks ' + name + '! Your mail client should open now.';
      btn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';
      form.reset();
      setTimeout(() => note.textContent = '', 6000);
    }, 900);
  });

  /* ---------- Footer year ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Smooth anchor offset for fixed header ---------- */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const target = $(id); if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
  }));
})();
