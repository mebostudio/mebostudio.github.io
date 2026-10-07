/* MEBO DESIGN STUDIO — motion & interaction (port of the design's componentDidMount). */
(function () {
  var root = document.documentElement;
  var body = document.body;

  /* ---------- Language: Chinese by default, English for non-Chinese browsers ---------- */
  (function () {
    var saved = null;
    try { saved = localStorage.getItem('mebo-lang'); } catch (e) {}
    var langs = navigator.languages || [navigator.language || ''];
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    var auto = (langs.some(function (l) { return /^zh/i.test(l || ''); }) || /^Asia\/(Taipei|Hong_Kong|Macau|Shanghai)$/.test(tz)) ? 'zh' : 'en';
    var set = function (l) { root.dataset.lang = l; };
    set(saved || auto);
    document.querySelectorAll('[data-setlang]').forEach(function (b) {
      b.addEventListener('click', function () {
        var l = b.getAttribute('data-setlang'); set(l);
        try { localStorage.setItem('mebo-lang', l); } catch (e) {}
      });
    });
  })();

  /* ---------- Category filters (projects grid, journal list) ---------- */
  document.querySelectorAll('.m-filters').forEach(function (nav) {
    var scope = document.querySelector(nav.getAttribute('data-grid') || '.m-pgrid');
    if (!scope) return;
    var buttons = nav.querySelectorAll('.m-filter');
    var cards = scope.querySelectorAll('[data-cats]');
    var feat = scope.querySelector('.m-feat');
    function apply(slug) {
      var shown = 0;
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filter') === slug ? 'true' : 'false'); });
      cards.forEach(function (c) {
        var on = !slug || (c.getAttribute('data-cats') || '').split(' ').indexOf(slug) !== -1;
        c.hidden = !on;
        if (on) {
          c.style.animation = 'none';
          void c.offsetWidth;
          c.style.animation = '';
          c.style.animationDelay = ((shown % 3) * 0.08) + 's';
          c.classList.add('in');
          shown++;
        }
      });
      if (feat) feat.hidden = !!slug && feat.querySelector('[data-cats]').hidden;
    }
    buttons.forEach(function (b) { b.addEventListener('click', function () { apply(b.getAttribute('data-filter')); }); });
  });

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  root.classList.add('m-on');

  /* ---------- Scroll reveal ---------- */
  var SEL = body.getAttribute('data-reveal') || '.rv, .m-ln, .wd';
  function reveal() {
    var vh = window.innerHeight;
    document.querySelectorAll(SEL).forEach(function (el) {
      if (!el.classList.contains('in') && el.getBoundingClientRect().top < vh * 0.92) el.classList.add('in');
    });
  }
  [80, 400, 1200, 2500].forEach(function (t) { setTimeout(reveal, t); });

  /* ---------- Scroll state: progress bar, header hide/show, KV parallax ---------- */
  var last = window.scrollY, ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      reveal();
      var y = window.scrollY;
      var max = root.scrollHeight - window.innerHeight;
      root.style.setProperty('--sy', String(y));
      root.style.setProperty('--p', String(max > 0 ? Math.min(1, y / max) : 0));
      root.dataset.dir = (y > last && y > 160) ? 'down' : 'up';
      root.dataset.top = y < 40 ? '1' : '0';
      last = y;
      ticking = false;
    });
  }

  /* ---------- Custom cursor ("VIEW" / "READ" over cards) ---------- */
  function onMove(e) {
    root.style.setProperty('--mx', e.clientX + 'px');
    root.style.setProperty('--my', e.clientY + 'px');
    var t = e.target && e.target.closest ? e.target.closest('[data-cur]') : null;
    root.dataset.cur = t ? t.getAttribute('data-cur') : '';
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('load', reveal);
  onScroll();
})();
