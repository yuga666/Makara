/* =========================================================== THAMBAPANNI
   Vanilla JS: title fitting, scroll assembly, petals, reveals, booking.
   =========================================================== */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const win = (p, a, b) => clamp((p - a) / (b - a));
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const easeInOutCubic = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const hero = $('[data-hero]');
  const heroTop = $('#heroTop');
  const heroSub = $('#heroSub');
  const dancer = $('#dancer');
  const haloWrap = $('#haloWrap');
  const scene = $('#scene');
  const stageline = $('#stageline');
  const pillarL = $('#pillarL');
  const pillarR = $('#pillarR');
  const heroBg = $('#heroBg');
  const glows = $$('.glow');

  // Shared image references: one embedded copy per photograph.
  const ASSET_TROPHY = '{{IMG:trophy}}';
  const assets = {
    stage: heroBg ? heroBg.src : '',
    dancer: dancer ? dancer.src : '',
    trophy: ASSET_TROPHY
  };
  $$('[data-src-key]').forEach(el => {
    const src = assets[el.dataset.srcKey];
    if (src) el.src = src;
  });

  /* ------------------------------------------------------------- title fit */
  function setTitle() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = '400px Anton';
    const m = ctx.measureText('H');
    const ratio = (m.actualBoundingBoxAscent || 292) / 400;

    const lines = [
      { el: $('#t1'), cap: 200, top: 30 },
      { el: $('#t2'), cap: 210, top: 260 }
    ];
    lines.forEach(({ el, cap, top }) => {
      if (!el) return;
      const size = cap / ratio;
      el.setAttribute('font-size', size.toFixed(2));
      el.setAttribute('y', (top + cap).toFixed(2));
    });
  }

  function revealHero() {
    heroTop.classList.add('is-ready');
    if (reduce) {
      heroTop.style.opacity = 1;
      return;
    }
    const ease = 'cubic-bezier(.2,.8,.2,1)';
    const t1 = $('#t1').parentNode;
    const t2 = $('#t2').parentNode;
    t1.animate(
      [{ transform: 'translateY(240px)' }, { transform: 'translateY(0px)' }],
      { duration: 1100, delay: 150, easing: ease, fill: 'both' }
    );
    t2.animate(
      [{ transform: 'translateY(240px)' }, { transform: 'translateY(0px)' }],
      { duration: 1100, delay: 300, easing: ease, fill: 'both' }
    );
    const fade = (el, delay, y = 18, dur = 900) => {
      if (!el) return;
      el.animate(
        [{ opacity: 0, transform: `translateY(${y}px)` }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: dur, delay, easing: ease, fill: 'both' }
      );
    };
    fade($('#sinhala'), 60, 26);
    fade(heroSub, 420, 16);
    $$('[data-reveal]').forEach((el, i) => fade(el, 140 + i * 55, 10, 800));
    dancer.animate(
      [{ opacity: 0, transform: 'translateX(-50%) translateY(56px) scale(.96)' },
       { opacity: 1, transform: 'translateX(-50%) translateY(0) scale(1)' }],
      { duration: 1600, delay: 120, easing: ease, fill: 'both' }
    );
  }

  /* --------------------------------------------------------------- scroll */
  let target = 0;
  let p = 0;
  let lastP = -1;

  function readScroll() {
    const vh = window.innerHeight || 800;
    target = clamp((window.scrollY - vh * .06) / (vh * .62));
  }

  function applyHero() {
    const e = easeInOutCubic(p);
    const w1 = win(p, .02, .42);
    const w2 = win(p, .10, .52);
    const w3 = win(p, .18, .62);
    const w4 = win(p, .28, .80);

    if (scene) scene.style.transform = `translateX(-50%) scale(${(1 + .16 * e).toFixed(4)}) translateY(${(-2 * e).toFixed(2)}%)`;
    if (heroBg) heroBg.style.transform = `scale(${(1.06 + .07 * e).toFixed(4)})`;
    if (heroTop) {
      heroTop.style.transform = reduce ? 'none' : `translateY(${(-46 * e).toFixed(1)}px)`;
      heroTop.style.opacity = reduce ? '1' : (1 - .62 * e).toFixed(3);
    }
    if (haloWrap) {
      const h = easeOutCubic(w1);
      haloWrap.style.transform = `translateX(-50%) scale(${(.9 + .1 * h).toFixed(3)}) rotate(${(-3 + 3 * h).toFixed(2)}deg)`;
      haloWrap.style.opacity = (.10 + .5 * h).toFixed(3);
    }
    if (pillarL && pillarR) {
      const q = easeOutCubic(w2);
      const ty = (-14 * (1 - q)).toFixed(2);
      pillarL.style.transform = `translateY(${ty}%)`;
      pillarR.style.transform = `translateY(${ty}%)`;
      pillarL.style.opacity = (.10 + .3 * q).toFixed(3);
      pillarR.style.opacity = (.10 + .3 * q).toFixed(3);
    }
    if (stageline) {
      const q = easeOutCubic(w3);
      stageline.style.transform = `scaleX(${(.74 + .26 * q).toFixed(3)})`;
      stageline.style.opacity = (.22 + .38 * q).toFixed(3);
    }
    glows.forEach((g, i) => {
      const q = easeOutCubic(win(p, .26 + i * .03, .82 + i * .02));
      g.style.opacity = (q * (i === 4 ? .34 : .8)).toFixed(3);
      g.style.transform = `${i === 4 ? 'translateX(-50%) ' : ''}scale(${(.78 + .3 * q).toFixed(3)})`;
    });
    lastP = p;
  }

  /* --------------------------------------------------------------- petals */
  const canvas = $('#petals');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let W = 0, H = 0, DPR = 1;
  let petals = [];
  const PALETTE = [
    [247, 238, 224], [232, 201, 141], [243, 227, 200], [245, 234, 217],
    [214, 160, 96], [168, 58, 46]
  ];

  function sizeCanvas() {
    if (!canvas) return;
    const rect = hero.getBoundingClientRect();
    W = Math.round(rect.width);
    H = Math.round(hero.offsetHeight);
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function makePetal(anywhere) {
    const c = PALETTE[(Math.random() * PALETTE.length) | 0];
    return {
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : -40 - Math.random() * 120,
      size: 3.2 + Math.random() * 6.4,
      vy: 16 + Math.random() * 46,
      sway: 14 + Math.random() * 44,
      phase: Math.random() * Math.PI * 2,
      spin: (Math.random() - .5) * 1.4,
      angle: Math.random() * Math.PI * 2,
      color: c,
      alpha: .22 + Math.random() * .5
    };
  }

  function resetPetals() {
    if (!canvas) return;
    const count = Math.round(clamp(W / 42, 14, 42));
    petals = Array.from({ length: count }, () => makePetal(true));
  }

  function drawPetals(t) {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    const dt = 1 / 60;
    for (const pt of petals) {
      pt.y += pt.vy * dt;
      pt.angle += pt.spin * dt;
      const x = pt.x + Math.sin(t * .00055 + pt.phase) * pt.sway;
      if (pt.y > H + 30) {
        pt.y = -30 - Math.random() * 80;
        pt.x = Math.random() * W;
      }
      ctx.save();
      ctx.translate(x, pt.y);
      ctx.rotate(pt.angle + Math.sin(t * .0008 + pt.phase) * .35);
      ctx.scale(1, .5 + .5 * Math.abs(Math.cos(t * .0012 + pt.phase)));
      ctx.beginPath();
      ctx.moveTo(0, -pt.size * 1.7);
      ctx.bezierCurveTo(pt.size * 1.15, -pt.size * .7, pt.size * .7, pt.size * 1.1, 0, pt.size * 1.75);
      ctx.bezierCurveTo(-pt.size * .7, pt.size * 1.1, -pt.size * 1.15, -pt.size * .7, 0, -pt.size * 1.7);
      ctx.fillStyle = `rgba(${pt.color[0]},${pt.color[1]},${pt.color[2]},${pt.alpha})`;
      ctx.fill();
      ctx.restore();
    }
  }

  /* ------------------------------------------------------------- parallax */
  const parEls = $$('[data-parallax]').map(el => ({ el, speed: parseFloat(el.dataset.parallax) || .05 }));
  function applyParallax() {
    const vh = window.innerHeight;
    // Read every rect first, then write — avoids layout thrash in the RAF loop.
    const rects = parEls.map(({ el }) => el.getBoundingClientRect());
    parEls.forEach(({ el, speed }, i) => {
      const r = rects[i];
      if (r.bottom < -100 || r.top > vh + 100) return;
      const t = (vh / 2 - (r.top + r.height / 2)) / vh;
      el.style.setProperty('--shift', (clamp(t, -1.2, 1.2) * speed * 900).toFixed(1) + 'px');
    });
  }

  /* ---------------------------------------------------------------- cursor */
  const cursor = $('#cursor');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;
  if (cursor && fine) {
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.classList.add('is-on');
    }, { passive: true });
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-on'));
    $$('a, button, .prow, .bento figure, .tier').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-big'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-big'));
    });
  }

  /* ------------------------------------------------------------------ peek */
  const peek = $('#peek');
  const peekImg = $('#peekImg');
  let px = 0, py = 0, tx = 0, ty = 0, peekOn = false;
  if (peek && fine) {
    $$('.prow').forEach(row => {
      row.addEventListener('mouseenter', () => {
        const src = assets[row.dataset.peek];
        if (src && peekImg.getAttribute('src') !== src) peekImg.src = src;
        peekOn = true;
        peek.classList.add('is-on');
      });
      row.addEventListener('mouseleave', () => {
        peekOn = false;
        peek.classList.remove('is-on');
      });
    });
  }

  /* ---------------------------------------------------------------- reveals */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------------------------------------------------------------- topbar */
  const topbar = $('#topbar');
  const progressBar = $('#progressBar');
  const navLinks = $$('.topbar__nav a');
  const sections = $$('main section[id]');

  function updateChrome() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    if (topbar) topbar.classList.toggle('is-on', y > vh * .72);
    if (progressBar) {
      const max = document.documentElement.scrollHeight - vh;
      progressBar.style.width = (max > 0 ? clamp(y / max) * 100 : 0) + '%';
    }
    let current = '';
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= vh * .4) current = s.id;
    }
    navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + current));
  }

  /* --------------------------------------------------------------- booking */
  const book = $('#book');
  const tierSelect = $('#tier');
  const bookDone = $('#bookDone');
  const bookDoneText = $('#bookDoneText');
  const bookForm = $('#bookForm');

  $$('.tier__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tier = btn.dataset.tier || '';
      if (tierSelect) {
        const opt = Array.from(tierSelect.options).find(o => o.textContent.startsWith(tier));
        if (opt) tierSelect.value = opt.value;
      }
      if (book) {
        book.classList.remove('is-done');
        book.showModal();
      }
    });
  });
  if (book) {
    const close = () => book.close();
    $('#bookClose').addEventListener('click', close);
    $('#bookDoneClose').addEventListener('click', close);
    book.addEventListener('click', e => {
      if (e.target === book) book.close();
    });
  }
  if (bookForm) {
    bookForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#name').value.trim().split(' ')[0] || 'friend';
      const seats = $('#seats').value;
      const tier = tierSelect.options[tierSelect.selectedIndex].textContent.split(' — ')[0];
      bookDoneText.textContent = `${name}, we have your request for ${seats} ${seats === '1' ? 'seat' : 'seats'} on the ${tier} tier. We'll write to you within a day with seat numbers and payment details.`;
      book.classList.add('is-done');
    });
  }

  /* -------------------------------------------------------------- signup */
  const signupForm = $('#signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = $('#signupEmail').value.trim();
      signupForm.innerHTML = `<p class="ok">You're on the list${email ? ' — ' + email : ''}. One letter a month, nothing else.</p>`;
    });
  }

  /* --------------------------------------------------------------- marquee */
  const track = $('#marquee');
  if (track) track.innerHTML += track.innerHTML;

  /* ---------------------------------------------------------------- raf loop */
  let raf = null;
  let last = 0;
  let lastScrollY = -1;

  function frame(t) {
    const dt = last ? Math.min(48, t - last) : 16;
    last = t;

    if (reduce) {
      p = 1;
    } else {
      p += (target - p) * (dt / 16) * .14;
      if (Math.abs(target - p) < .0008) p = target;
    }

    if (Math.abs(p - lastP) > .0004) applyHero();

    if (fine) {
      cx += (mx - cx) * .2;
      cy += (my - cy) * .2;
      if (cursor) cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      if (peek) {
        tx += (mx - tx) * .16;
        ty += (my - ty) * .16;
        peek.style.left = tx + 'px';
        peek.style.top = ty + 'px';
      }
    }

    const inHero = window.scrollY < hero.offsetHeight + 200;
    if (!reduce && canvas && inHero) drawPetals(t);
    if (!reduce && Math.abs(window.scrollY - lastScrollY) > .5) {
      lastScrollY = window.scrollY;
      applyParallax();
    }

    raf = requestAnimationFrame(frame);
  }

  /* -------------------------------------------------------------- lifecycle */
  function boot() {
    sizeCanvas();
    resetPetals();
    readScroll();
    if (reduce) {
      p = 1;
      $$('.reveal').forEach(el => el.classList.add('is-in'));
      heroTop.classList.add('is-ready');
      heroTop.style.opacity = 1;
      if (dancer) {
        dancer.style.opacity = '1';
        dancer.style.transform = 'translateX(-50%)';
      }
      applyHero();
    } else {
      applyHero();
    }
    updateChrome();
    requestAnimationFrame(frame);
  }

  let started = false;
  function start() {
    if (started) return;
    started = true;
    document.documentElement.classList.remove('no-js');
    setTitle();
    if (!reduce) revealHero();
    else {
      heroTop.classList.add('is-ready');
      heroTop.style.opacity = 1;
    }
    boot();
  }

  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1400))]).then(start);
  } else {
    window.addEventListener('load', start);
    setTimeout(start, 600);
  }

  window.addEventListener('scroll', () => { readScroll(); updateChrome(); }, { passive: true });
  window.addEventListener('resize', () => {
    sizeCanvas();
    resetPetals();
    readScroll();
    applyHero();
  });
  window.addEventListener('load', () => {
    readScroll();
    applyHero();
  });

  // keep the browser from restoring a mid-hero scroll on refresh
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
})();
