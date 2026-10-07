/* MEBO MADE — Palette & Type (色彩與字體搭配). Runs entirely in the browser. */
(function () {
  var ROLES = [
    { k: 'bg', name: '背景色', hint: '大面積的底色' },
    { k: 'text', name: '文字色', hint: '標題與內文' },
    { k: 'main', name: '主色', hint: '品牌最常出現的顏色' },
    { k: 'sub', name: '輔色', hint: '搭配主色的區塊' },
    { k: 'acc', name: '強調色', hint: '按鈕、重點、小面積' }
  ];
  var PRESETS = [
    { n: '海霧', c: { bg: '#FFFFFF', text: '#12303F', main: '#7CC5E6', sub: '#E3F1F8', acc: '#2A7698' } },
    { n: '暖砂', c: { bg: '#F6F1EA', text: '#3A2E26', main: '#C9A27E', sub: '#E9DCCB', acc: '#9C4A2F' } },
    { n: '森林', c: { bg: '#F4F5EF', text: '#1F2B22', main: '#3F5E45', sub: '#C9D3BE', acc: '#D9A441' } },
    { n: '夜色', c: { bg: '#14171F', text: '#F2F0EA', main: '#3B4A6B', sub: '#262C3A', acc: '#E8B4A0' } },
    { n: '果實', c: { bg: '#FFF8F3', text: '#2B1B1F', main: '#E2574C', sub: '#FBD8C8', acc: '#2F6F5E' } },
    { n: '墨與紙', c: { bg: '#F7F6F2', text: '#111111', main: '#111111', sub: '#E4E1D8', acc: '#B23A2B' } }
  ];
  var FONTS = [
    { f: 'Noto Serif TC', n: '思源宋體 Noto Serif TC', g: 'Noto+Serif+TC:wght@400;600', s: 'serif' },
    { f: 'Noto Sans TC', n: '思源黑體 Noto Sans TC', g: 'Noto+Sans+TC:wght@300;400;500', s: 'sans-serif' },
    { f: 'LXGW WenKai TC', n: '霞鶩文楷 LXGW WenKai TC', g: 'LXGW+WenKai+TC', s: 'serif' },
    { f: 'Chiron Sung HK', n: '昭源宋體 Chiron Sung HK', g: 'Chiron+Sung+HK:wght@400;600', s: 'serif' },
    { f: 'Chiron GoRound TC', n: '昭源甜圓 Chiron GoRound TC', g: 'Chiron+GoRound+TC:wght@400;600', s: 'sans-serif' },
    { f: 'Huninn', n: '粉圓 Huninn', g: 'Huninn', s: 'sans-serif' },
    { f: 'Iansui', n: '芫荽 Iansui', g: 'Iansui', s: 'sans-serif' }
  ];
  var DEF = { c: PRESETS[0].c, r: { bg: 50, text: 15, main: 20, sub: 10, acc: 5 }, hf: 0, bf: 1 };

  var $ = function (id) { return document.getElementById(id); };
  if (!$('pl')) return;
  var st = JSON.parse(JSON.stringify(DEF));

  // restore from share link
  try {
    var h = decodeURIComponent(location.hash.slice(1));
    if (h) {
      var p = new URLSearchParams(h);
      ROLES.forEach(function (r, i) { var v = p.get(r.k); if (/^[0-9a-f]{6}$/i.test(v || '')) st.c[r.k] = '#' + v.toUpperCase(); var w = +p.get('w' + i); if (w >= 0 && w <= 100 && p.has('w' + i)) st.r[r.k] = w; });
      if (p.has('hf')) st.hf = Math.min(FONTS.length - 1, +p.get('hf') || 0);
      if (p.has('bf')) st.bf = Math.min(FONTS.length - 1, +p.get('bf') || 0);
      if (p.get('ht')) $('pl-ht').value = p.get('ht');
      if (p.get('bt')) $('pl-bt').value = p.get('bt');
    }
  } catch (e) {}

  // ---------- color math ----------
  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function lum(hex) { return rgb(hex).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }).reduce(function (a, v, i) { return a + v * [0.2126, 0.7152, 0.0722][i]; }, 0); }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function onColor(hex) { return contrast(hex, '#FFFFFF') >= contrast(hex, '#111111') ? '#FFFFFF' : '#111111'; }
  function norm(v) { v = (v || '').trim().replace(/^#?/, '#'); if (/^#[0-9a-f]{3}$/i.test(v)) v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]; return /^#[0-9a-f]{6}$/i.test(v) ? v.toUpperCase() : null; }

  // ---------- fonts ----------
  var loaded = {};
  function loadFont(i) {
    var F = FONTS[i]; if (loaded[F.f]) return;
    loaded[F.f] = 1;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + F.g + '&display=swap';
    document.head.appendChild(l);
  }
  function stack(i) { return "'" + FONTS[i].f + "', " + FONTS[i].s; }

  // ---------- build controls ----------
  $('pl-presets').innerHTML = PRESETS.map(function (p, i) {
    return '<button type="button" class="pl-preset" data-p="' + i + '"><i>' + ROLES.map(function (r) { return '<b style="background:' + p.c[r.k] + '"></b>'; }).join('') + '</i>' + p.n + '</button>';
  }).join('');
  $('pl-colors').innerHTML = ROLES.map(function (r) {
    return '<div class="pl-row"><input type="color" id="c-' + r.k + '" aria-label="' + r.name + '"><label for="h-' + r.k + '">' + r.name + '<small>' + r.hint + '</small></label><input class="mk-in" id="h-' + r.k + '" maxlength="7" spellcheck="false" aria-label="' + r.name + ' 色碼"></div>';
  }).join('');
  $('pl-ratios').innerHTML = ROLES.map(function (r) {
    return '<label class="mk-field" style="margin-bottom:10px"><span style="display:flex;justify-content:space-between">' + r.name + '<b id="rv-' + r.k + '" style="font-weight:400"></b></span><input class="pl-range" type="range" min="0" max="100" id="r-' + r.k + '"></label>';
  }).join('');
  ['pl-hf', 'pl-bf'].forEach(function (id) { $(id).innerHTML = FONTS.map(function (f, i) { return '<option value="' + i + '">' + f.n + '</option>'; }).join(''); });

  function syncInputs() {
    ROLES.forEach(function (r) { $('c-' + r.k).value = st.c[r.k].toLowerCase(); $('h-' + r.k).value = st.c[r.k]; $('r-' + r.k).value = st.r[r.k]; });
    $('pl-hf').value = st.hf; $('pl-bf').value = st.bf;
  }

  // ---------- render ----------
  function paint() {
    var c = st.c, hf = stack(st.hf), bf = stack(st.bf);
    loadFont(st.hf); loadFont(st.bf);
    var tot = ROLES.reduce(function (a, r) { return a + st.r[r.k]; }, 0) || 1;
    $('pl-ratio').innerHTML = ROLES.map(function (r) {
      var pct = Math.round(st.r[r.k] / tot * 100);
      $('rv-' + r.k).textContent = pct + '%';
      return '<div style="flex:' + (st.r[r.k] || 0.0001) + ';background:' + c[r.k] + ';color:' + onColor(c[r.k]) + ';' + (c[r.k] === '#FFFFFF' ? 'box-shadow:inset 0 0 0 1px #CFE2EA;' : '') + '"><span>' + r.name + ' ' + pct + '%</span></div>';
    }).join('');

    var ht = $('pl-ht').value || '標題', bt = $('pl-bt').value || '內文';
    var po = $('pl-poster');
    po.style.background = c.bg; po.style.color = c.text;
    po.querySelector('.dot').style.background = c.main;
    po.querySelector('.t').textContent = ht; po.querySelector('.t').style.fontFamily = hf;
    po.querySelector('.b').textContent = bt; po.querySelector('.b').style.fontFamily = bf;
    po.querySelector('.k').style.color = c.acc; po.querySelector('.k').style.fontFamily = bf;
    po.querySelector('.ft').style.fontFamily = bf;

    var ps = $('pl-post');
    ps.style.background = c.main; ps.style.color = contrast(c.main, c.bg) > contrast(c.main, c.text) ? c.bg : c.text;
    ps.querySelector('.t').textContent = ht; ps.querySelector('.t').style.fontFamily = hf;
    ps.querySelector('.b').textContent = bt; ps.querySelector('.b').style.fontFamily = bf;

    var wb = $('pl-web'), pg = wb.querySelector('.pg');
    wb.style.background = c.sub; pg.style.color = c.text;
    pg.querySelector('.t').textContent = ht; pg.querySelector('.t').style.fontFamily = hf;
    pg.querySelector('.b').textContent = bt; pg.querySelector('.b').style.fontFamily = bf;
    var btn = pg.querySelector('.btn'); btn.style.background = c.acc; btn.style.color = onColor(c.acc); btn.style.fontFamily = bf;

    var ty = $('pl-type');
    ty.querySelector('.big').textContent = ht; ty.querySelector('.big').style.fontFamily = hf;
    ty.querySelector('.para').textContent = bt; ty.querySelector('.para').style.fontFamily = bf;
    $('pl-hname').textContent = '標題　' + FONTS[st.hf].n; $('pl-bname').textContent = '內文　' + FONTS[st.bf].n;

    var pairs = [
      ['文字色 × 背景色', c.text, c.bg],
      ['文字色 × 輔色', c.text, c.sub],
      ['背景色 × 主色', c.bg, c.main],
      ['文字色 × 主色', c.text, c.main],
      ['強調色 × 背景色', c.acc, c.bg],
      ['按鈕文字 × 強調色', onColor(c.acc), c.acc]
    ];
    $('pl-cx').innerHTML = pairs.map(function (p) {
      var r = contrast(p[1], p[2]), cls, txt;
      if (r >= 7) { cls = 'ok'; txt = '很好讀'; } else if (r >= 4.5) { cls = 'ok'; txt = '適合內文'; } else if (r >= 3) { cls = 'mid'; txt = '只適合大字'; } else { cls = 'low'; txt = '不建議放文字'; }
      return '<tr><td>' + p[0] + '</td><td><span class="smp" style="color:' + p[1] + ';background:' + p[2] + ';font-family:' + bf + (p[2].toUpperCase() === '#FFFFFF' ? ';box-shadow:inset 0 0 0 1px #CFE2EA' : '') + '">文字 Aa</span></td><td>' + r.toFixed(2) + '</td><td><span class="badge ' + cls + '">' + txt + '</span></td></tr>';
    }).join('');
  }

  function shareURL() {
    var p = new URLSearchParams();
    ROLES.forEach(function (r, i) { p.set(r.k, st.c[r.k].slice(1)); p.set('w' + i, st.r[r.k]); });
    p.set('hf', st.hf); p.set('bf', st.bf); p.set('ht', $('pl-ht').value); p.set('bt', $('pl-bt').value);
    return location.origin + location.pathname + '#' + p.toString();
  }

  function toast(m) { var t = $('mk-toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('on'); }, 2200); }
  function copy(txt, msg) {
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { toast(msg); }, function () {
      var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast(msg); } catch (e) { toast('複製失敗，請手動複製。'); } ta.remove();
    });
  }

  function png() {
    var W = 1600, H = 1000, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var g = cv.getContext('2d');
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H);
    var tot = ROLES.reduce(function (a, r) { return a + st.r[r.k]; }, 0) || 1, x = 80, bw = W - 160;
    ROLES.forEach(function (r) {
      var w = bw * st.r[r.k] / tot;
      g.fillStyle = st.c[r.k]; g.fillRect(x, 80, w, 120); x += w;
    });
    g.strokeStyle = '#CFE2EA'; g.strokeRect(80, 80, bw, 120);
    var cw = (bw - 4 * 32) / 5;
    var hfam = FONTS[st.hf].f, bfam = FONTS[st.bf].f;
    ROLES.forEach(function (r, i) {
      var cx = 80 + i * (cw + 32);
      g.fillStyle = st.c[r.k]; g.fillRect(cx, 260, cw, 380);
      g.strokeStyle = '#CFE2EA'; g.strokeRect(cx + 0.5, 260.5, cw - 1, 379);
      g.fillStyle = '#12303F'; g.font = "500 26px '" + bfam + "', sans-serif"; g.fillText(r.name, cx, 690);
      g.fillStyle = '#4E6B78'; g.font = "24px 'Hanken Grotesk', sans-serif"; g.fillText(st.c[r.k], cx, 730);
      var rr = rgb(st.c[r.k]); g.font = "20px 'Hanken Grotesk', sans-serif"; g.fillText('RGB ' + rr.join(' '), cx, 762);
    });
    g.fillStyle = '#12303F'; g.font = "56px '" + hfam + "', serif"; g.fillText(($('pl-ht').value || '').slice(0, 24), 80, 870);
    g.fillStyle = '#4E6B78'; g.font = "22px '" + bfam + "', sans-serif"; g.fillText('標題 ' + FONTS[st.hf].n + '　｜　內文 ' + FONTS[st.bf].n, 80, 920);
    g.font = "18px 'Hanken Grotesk', sans-serif"; g.textAlign = 'right'; g.fillText('MADE BY MEBO DESIGN STUDIO · mebostudio.github.io/made', W - 80, 920);
    var a = document.createElement('a'); a.download = 'palette.png'; a.href = cv.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove();
    toast('色票圖已下載。');
  }

  // ---------- events ----------
  document.addEventListener('input', function (e) {
    var id = e.target.id || '';
    if (id.indexOf('c-') === 0) { st.c[id.slice(2)] = e.target.value.toUpperCase(); $('h-' + id.slice(2)).value = st.c[id.slice(2)]; paint(); }
    else if (id.indexOf('h-') === 0) { var v = norm(e.target.value); if (v) { st.c[id.slice(2)] = v; $('c-' + id.slice(2)).value = v.toLowerCase(); paint(); } }
    else if (id.indexOf('r-') === 0) { st.r[id.slice(2)] = +e.target.value; paint(); }
    else if (id === 'pl-ht' || id === 'pl-bt') paint();
  });
  document.addEventListener('change', function (e) {
    if (e.target.id === 'pl-hf') { st.hf = +e.target.value; paint(); }
    if (e.target.id === 'pl-bf') { st.bf = +e.target.value; paint(); }
    if ((e.target.id || '').indexOf('h-') === 0) e.target.value = st.c[e.target.id.slice(2)];
  });
  document.addEventListener('click', function (e) {
    var p = e.target.closest('[data-p]');
    if (p) { st.c = JSON.parse(JSON.stringify(PRESETS[+p.dataset.p].c)); syncInputs(); paint(); return; }
    if (e.target.id === 'pl-hex') copy(ROLES.map(function (r) { return r.name + ' ' + st.c[r.k]; }).join('\n'), '已複製色碼。');
    if (e.target.id === 'pl-css') copy(':root {\n' + ROLES.map(function (r) { return '  --color-' + r.k + ': ' + st.c[r.k] + ';'; }).join('\n') + "\n  --font-heading: " + stack(st.hf) + ";\n  --font-body: " + stack(st.bf) + ';\n}', '已複製 CSS 變數。');
    if (e.target.id === 'pl-link') copy(shareURL(), '已複製分享連結。');
    if (e.target.id === 'pl-png') { if (document.fonts && document.fonts.ready) document.fonts.ready.then(png); else png(); }
  });

  syncInputs(); paint();
})();
