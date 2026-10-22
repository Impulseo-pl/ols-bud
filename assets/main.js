/* OLS-BUD - menu, wejścia sekcji, karuzele, odliczanie dema */
(function () {
  var body = document.body, btn = document.querySelector('.menu-btn');
  if (btn) {
    btn.addEventListener('click', function () {
      var on = body.classList.toggle('menu-open');
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    document.querySelectorAll('.menu a').forEach(function (a) {
      a.addEventListener('click', function () { body.classList.remove('menu-open'); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') body.classList.remove('menu-open'); });
  }
  var nav = document.querySelector('.nav'), tick = false;
  function upd() { nav && nav.classList.toggle('is-stuck', window.scrollY > 24); tick = false; }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  upd();
})();

(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  els.forEach(function (el) { io.observe(el); });
  // bezpiecznik: nic nie zostaje niewidoczne, gdyby obserwator nie zadziałał
  setTimeout(function () { els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in'); }); }, 1200);
})();

/* karuzela usług */
(function () {
  document.querySelectorAll('[data-slider]').forEach(function (s) {
    var track = s.querySelector('.track'), bar = s.parentNode.querySelector('.progress i');
    if (!track) return;
    function step() { var c = track.querySelector('.fig'); return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 60) : 400; }
    s.querySelector('[data-next]').addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    s.querySelector('[data-prev]').addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    function prog() {
      if (!bar) return;
      var max = track.scrollWidth - track.clientWidth, vis = track.clientWidth / track.scrollWidth;
      var w = Math.max(vis, 0.15) * 100;
      bar.style.width = w + '%';
      bar.style.left = (max > 0 ? track.scrollLeft / max : 0) * (100 - w) + '%';
    }
    track.addEventListener('scroll', prog, { passive: true }); window.addEventListener('resize', prog); prog();
  });
})();

/* opinie - przełączanie cytatów */
(function () {
  var box = document.querySelector('[data-quotes]');
  if (!box) return;
  var qs = box.querySelectorAll('.q'), i = 0;
  function show(n) { qs[i].classList.remove('on'); i = (n + qs.length) % qs.length; qs[i].classList.add('on'); }
  var nx = box.querySelector('[data-next]'), pv = box.querySelector('[data-prev]');
  nx && nx.addEventListener('click', function () { show(i + 1); });
  pv && pv.addEventListener('click', function () { show(i - 1); });
})();

/* === ODLICZANIE WERSJI POKAZOWEJ (z silnika dem) ===
   Nie wita klienta przy wejściu - wjeżdża po zejściu z pierwszego ekranu. */
(function () {
  var el = document.querySelector('.demo-wazne');
  if (!el || !el.getAttribute('data-do')) return;
  var koniec = new Date(el.getAttribute('data-do') + 'T23:59:59');
  if (isNaN(koniec)) return;
  var txt = el.querySelector('.dw-txt') || el;
  var dwa = function (n) { return (n < 10 ? '0' : '') + n; };
  var cykl = parseInt(el.getAttribute('data-cykl') || '0', 10);
  function tyka() {
    var teraz = new Date(), ms = koniec - teraz;
    while (ms <= 0 && cykl > 0) { koniec = new Date(koniec.getTime() + cykl * 86400000); ms = koniec - teraz; }
    if (ms <= 0) { txt.innerHTML = 'Wersja pokazowa wygasła'; el.classList.add('is-koniec'); return false; }
    var s = Math.floor(ms / 1000), d = Math.floor(s / 86400);
    var g = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sek = s % 60;
    var zegar = dwa(g) + ':' + dwa(m) + ':' + dwa(sek);
    txt.innerHTML = d > 0
      ? 'Wersja pokazowa · <b>' + d + ' dni</b> <span class="dw-zeg">' + zegar + '</span>'
      : 'Wersja pokazowa · <b class="dw-pilne">' + zegar + '</b>';
    el.classList.toggle('is-pilne', d === 0);
    return true;
  }
  if (tyka() !== false) setInterval(tyka, 1000);
  el.hidden = false;
  var t = false;
  function stan() { el.classList.toggle('is-on', (window.scrollY || 0) > window.innerHeight * 0.55); t = false; }
  window.addEventListener('scroll', function () { if (t) return; t = true; requestAnimationFrame(stan); }, { passive: true });
  stan();
})();

/* dolny pasek mobilny chowa się, gdy widać stopkę albo sekcję z telefonem */
(function () {
  var pasek = document.querySelector('.sticky-call');
  if (!pasek || !('IntersectionObserver' in window)) return;
  var widoczne = 0;
  var io = new IntersectionObserver(function (w) {
    w.forEach(function (x) { widoczne += x.isIntersecting ? 1 : -1; });
    pasek.classList.toggle('is-off', widoczne > 0);
  });
  document.querySelectorAll('footer, .cta-big').forEach(function (el) { io.observe(el); });
})();
