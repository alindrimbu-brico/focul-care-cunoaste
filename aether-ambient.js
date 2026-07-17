/* Aether Ambient — dronă meditativă la frecvențe „divine" (solfeggio), continuă,
   cu inflexiuni blânde când cursorul trece peste secțiuni.
   - Pornește la primul gest al utilizatorului (browserele nu permit autoplay înainte).
   - Buton plutitor ♪ (dreapta-jos) pentru oprit/pornit; preferința se ține minte.
   - Secțiunile pot cere o notă anume prin atributul data-freq="528"; altfel primesc
     automat, pe rând, frecvențele din scara solfeggio.
   Fără dependențe. Se include cu: <script src="aether-ambient.js" defer></script> */
(function () {
  'use strict';

  var SOLFEGGIO = [396, 417, 528, 639, 741, 852, 432];
  var STORE_KEY = 'aether.ambient';
  var MASTER_LEVEL = 0.045;

  var ctx = null, master = null, lfo = null;
  var voiceOsc = null, voiceGain = null; // vocea care „cântă" secțiunea curentă
  var running = false;
  var wanted = localStorage.getItem(STORE_KEY) !== 'off'; // implicit pornit, la primul gest

  function buildGraph() {
    var AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = 0.0001;
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1200;
    lp.Q.value = 0.5;
    master.connect(lp);
    lp.connect(ctx.destination);

    // respirația dronei: LFO lent pe volumul master (±20%)
    lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07; // o „respirație" la ~14s
    var lfoGain = ctx.createGain();
    lfoGain.gain.value = MASTER_LEVEL * 0.2;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    lfo.start();

    // temelia: 108 Hz (om) + cvinta + octava, ușor dezacordate pentru viață
    [[108, 0.5, -3], [108, 0.5, 3], [162, 0.28, 0], [216, 0.2, 2]].forEach(function (p) {
      var o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = p[0];
      o.detune.value = p[2];
      var g = ctx.createGain();
      g.gain.value = p[1];
      o.connect(g);
      g.connect(master);
      o.start();
    });

    // vocea secțiunilor: sinus moale care alunecă spre frecvența secțiunii
    voiceOsc = ctx.createOscillator();
    voiceOsc.type = 'sine';
    voiceOsc.frequency.value = 432;
    voiceGain = ctx.createGain();
    voiceGain.gain.value = 0.12;
    voiceOsc.connect(voiceGain);
    voiceGain.connect(master);
    voiceOsc.start();
  }

  function fadeTo(level, secs) {
    var now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
    master.gain.exponentialRampToValueAtTime(Math.max(level, 0.0001), now + secs);
  }

  function start() {
    if (running) return;
    if (!ctx) buildGraph();
    if (ctx.state === 'suspended') ctx.resume();
    fadeTo(MASTER_LEVEL, 2.5);
    running = true;
    updateBtn();
  }

  function stop() {
    if (!running || !ctx) return;
    fadeTo(0.0001, 0.8);
    running = false;
    updateBtn();
  }

  // ——— inflexiuni pe secțiuni ———
  function glideVoice(freq) {
    if (!ctx || !running) return;
    var now = ctx.currentTime;
    voiceOsc.frequency.cancelScheduledValues(now);
    voiceOsc.frequency.setValueAtTime(voiceOsc.frequency.value, now);
    voiceOsc.frequency.exponentialRampToValueAtTime(freq, now + 1.8);
    // un mic „înflorit" de volum la schimbare
    voiceGain.gain.cancelScheduledValues(now);
    voiceGain.gain.setValueAtTime(voiceGain.gain.value, now);
    voiceGain.gain.linearRampToValueAtTime(0.2, now + 0.9);
    voiceGain.gain.linearRampToValueAtTime(0.12, now + 3.2);
  }

  function annotateSections() {
    var els = document.querySelectorAll('[data-freq]');
    if (!els.length) {
      // auto: secțiunile mari ale paginii primesc pe rând notele scării
      els = document.querySelectorAll('header, section, main, article, footer');
      var i = 0;
      els.forEach ? els.forEach(assign) : Array.prototype.forEach.call(els, assign);
      function assign(el) {
        if (!el.hasAttribute('data-freq')) el.setAttribute('data-freq', SOLFEGGIO[i++ % SOLFEGGIO.length]);
      }
    }
  }

  var lastFreq = 0;
  document.addEventListener('pointerover', function (e) {
    var host = e.target && e.target.closest ? e.target.closest('[data-freq]') : null;
    if (!host) return;
    var f = parseFloat(host.getAttribute('data-freq'));
    if (f && f !== lastFreq) { lastFreq = f; glideVoice(f); }
  });

  // ——— pornire la primul gest + buton ———
  function firstGesture() {
    document.removeEventListener('pointerdown', firstGesture);
    document.removeEventListener('keydown', firstGesture);
    if (wanted) start();
  }
  document.addEventListener('pointerdown', firstGesture);
  document.addEventListener('keydown', firstGesture);

  document.addEventListener('visibilitychange', function () {
    if (!ctx) return;
    if (document.hidden) { if (running) fadeTo(0.0001, 0.4); }
    else if (running) fadeTo(MASTER_LEVEL, 1.5);
  });

  var btn;
  function updateBtn() {
    if (!btn) return;
    btn.textContent = running ? '♪' : '♪̶';
    btn.setAttribute('aria-pressed', String(running));
    btn.title = running ? 'Oprește ambianța' : 'Pornește ambianța';
    btn.style.opacity = running ? '1' : '.55';
  }

  function makeButton() {
    btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Sunet ambiental');
    btn.style.cssText =
      'position:fixed;right:16px;bottom:16px;z-index:80;width:46px;height:46px;border-radius:50%;' +
      'background:rgba(20,14,38,.78);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);' +
      'border:1px solid rgba(245,184,71,.5);color:#F5B847;font-size:19px;line-height:1;cursor:pointer;' +
      'box-shadow:0 10px 30px -12px rgba(0,0,0,.8);transition:transform .2s,opacity .3s';
    btn.onmouseenter = function () { btn.style.transform = 'scale(1.08)'; };
    btn.onmouseleave = function () { btn.style.transform = ''; };
    btn.addEventListener('click', function () {
      if (running) { stop(); wanted = false; localStorage.setItem(STORE_KEY, 'off'); }
      else { wanted = true; localStorage.setItem(STORE_KEY, 'on'); start(); }
    });
    document.body.appendChild(btn);
    updateBtn();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { annotateSections(); makeButton(); });
  } else {
    annotateSections();
    makeButton();
  }
})();
