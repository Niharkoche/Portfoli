/* ===== RETRO PORTFOLIO SCRIPT ===== */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- SCORE ---------- */
  let score = 0;
  const scoreEl = $('#score');
  const addScore = (n) => {
    score += n;
    scoreEl.textContent = String(score).padStart(6, '0');
  };

  /* ---------- TOAST ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  };

  /* ---------- 8-BIT SOUND (WebAudio) ---------- */
  let soundOn = false;
  let audioCtx;
  const beep = (freq = 660, dur = 0.08, type = 'square') => {
    if (!soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = 0.05;
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      osc.stop(audioCtx.currentTime + dur);
    } catch (e) { /* audio not available */ }
  };
  const coinSound = () => { beep(988, 0.07); setTimeout(() => beep(1319, 0.14), 70); };

  const soundBtn = $('#soundBtn');
  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundBtn.textContent = soundOn ? 'SFX: ON' : 'SFX: OFF';
    beep(880, 0.1);
  });
  $$('[data-sfx], nav a').forEach((el) => el.addEventListener('click', () => beep(520, 0.07)));

  /* ---------- MOBILE MENU ---------- */
  const nav = $('#nav');
  $('#menuBtn').addEventListener('click', () => nav.classList.toggle('open'));
  $$('#nav a').forEach((a) => a.addEventListener('click', () => nav.classList.remove('open')));

  /* ---------- TYPING EFFECT ---------- */
  const roles = [
    'AI & ML ENGINEER IN THE MAKING',
    'DEEP LEARNING EXPLORER',
    'COMPUTER VISION BUILDER',
    'TEAM LEAD / PROBLEM SOLVER',
  ];
  const typed = $('#typed');
  let rIdx = 0, cIdx = 0, deleting = false;
  const type = () => {
    const word = roles[rIdx];
    typed.textContent = word.slice(0, cIdx);
    if (!deleting && cIdx < word.length) { cIdx++; setTimeout(type, 70); }
    else if (!deleting) { deleting = true; setTimeout(type, 1400); }
    else if (cIdx > 0) { cIdx--; setTimeout(type, 35); }
    else { deleting = false; rIdx = (rIdx + 1) % roles.length; setTimeout(type, 300); }
  };
  type();

  /* ---------- FLOATING COINS ---------- */
  const coinField = $('#coinField');
  const spawnCoins = (n = 8) => {
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div');
      c.className = 'coin';
      c.style.left = 5 + Math.random() * 88 + '%';
      c.style.top = 12 + Math.random() * 70 + '%';
      c.style.animationDelay = Math.random() * 2 + 's';
      c.title = '+50';
      c.addEventListener('click', () => {
        if (c.classList.contains('taken')) return;
        c.classList.add('taken');
        addScore(50);
        coinSound();
        setTimeout(() => c.remove(), 500);
        if (!$('.coin:not(.taken)', coinField)) {
          toast('ALL COINS COLLECTED! BONUS +500');
          addScore(500);
          setTimeout(() => spawnCoins(8), 2500);
        }
      });
      coinField.appendChild(c);
    }
  };
  spawnCoins();

  /* ---------- REVEAL ON SCROLL + SKILL BARS + COUNTERS ---------- */
  $$('.panel, .title').forEach((el) => el.classList.add('reveal'));

  const countUp = (el) => {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const start = performance.now();
    const dur = 1200;
    const step = (t) => {
      const p = Math.min((t - start) / dur, 1);
      el.textContent = (target * p).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const seen = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('show');
      $$('.bar i', el).forEach((b) => (b.style.width = b.dataset.level + '%'));
      $$('[data-count]', el).forEach(countUp);
      const section = el.closest('section');
      if (section && !seen.has(section.id)) {
        seen.add(section.id);
        addScore(100);
        beep(700, 0.06);
      }
      io.unobserve(el);
    });
  }, { threshold: 0.2 });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ---------- ACTIVE NAV LINK ---------- */
  const sections = $$('main section[id]');
  const links = $$('#nav a');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));

  /* ---------- KONAMI CODE ---------- */
  const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let pos = 0;
  window.addEventListener('keydown', (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = k === code[pos] ? pos + 1 : (k === code[0] ? 1 : 0);
    if (pos === code.length) {
      pos = 0;
      document.body.classList.toggle('rainbow');
      addScore(1000);
      toast('CHEAT CODE ACTIVATED! +1000');
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.12), i * 110));
    }
  });

  /* ---------- FOOTER YEAR ---------- */
  $('#year').textContent = new Date().getFullYear();
})();
