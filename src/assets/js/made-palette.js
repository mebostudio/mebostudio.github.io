/* MEBO MADE — Palette & Type: start from your own colors. Runs entirely in the browser. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  if (!$('pc')) return;
  var MAXC = 6;
  var ROLES = [
    { k: 'bg', n: '背景色', h: '大面積的底色' },
    { k: 'text', n: '文字色', h: '標題與內文' },
    { k: 'main', n: '主色', h: '品牌最常出現的顏色' },
    { k: 'sub', n: '輔色', h: '搭配主色的區塊' },
    { k: 'acc', n: '強調色', h: '按鈕、重點、小面積' }
  ];
  var WEIGHT = { bg: 50, text: 15, main: 20, sub: 10, acc: 5 };
  var FONTS = [
    { f: 'Noto Serif TC', n: '思源宋體 Noto Serif TC', g: 'Noto+Serif+TC:wght@400;600', s: 'serif' },
    { f: 'Noto Sans TC', n: '思源黑體 Noto Sans TC', g: 'Noto+Sans+TC:wght@300;400;500', s: 'sans-serif' },
    { f: 'LXGW WenKai TC', n: '霞鶩文楷 LXGW WenKai TC', g: 'LXGW+WenKai+TC', s: 'serif' },
    { f: 'Chiron Sung HK', n: '昭源宋體 Chiron Sung HK', g: 'Chiron+Sung+HK:wght@400;600', s: 'serif' },
    { f: 'Chiron GoRound TC', n: '昭源甜圓 Chiron GoRound TC', g: 'Chiron+GoRound+TC:wght@400;600', s: 'sans-serif' },
    { f: 'Huninn', n: '粉圓 Huninn', g: 'Huninn', s: 'sans-serif' },
    { f: 'Iansui', n: '芫荽 Iansui', g: 'Iansui', s: 'sans-serif' }
  ];
  var st = { colors: ['#12303F', '#7CC5E6'], over: {}, hf: 0, bf: 1 };

  // ---------- color math (sRGB ⇄ OKLab/OKLCH) ----------
  function hexRgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function rgbHex(r) { return '#' + r.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return ('0' + v.toString(16)).slice(-2); }).join('').toUpperCase(); }
  function lin(v) { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
  function delin(v) { return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055); }
  function toOklch(hex) {
    var c = hexRgb(hex).map(lin), r = c[0], g = c[1], b = c[2];
    var l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    var L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
    return { L: L, C: Math.sqrt(A * A + B * B), H: (Math.atan2(B, A) * 180 / Math.PI + 360) % 360 };
  }
  function fromOklchRaw(L, C, H) {
    var a = C * Math.cos(H * Math.PI / 180), b = C * Math.sin(H * Math.PI / 180);
    var l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3), m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3), s = Math.pow(L - 0.0894841775 * a - 1.2914855480 * b, 3);
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s];
  }
  function fromOklch(L, C, H) {
    L = Math.max(0, Math.min(1, L));
    for (var i = 0; i < 40; i++) { var r = fromOklchRaw(L, C, H); if (r.every(function (v) { return v >= -0.0005 && v <= 1.0005; })) return rgbHex(r.map(delin)); C *= 0.92; }
    return rgbHex(fromOklchRaw(L, 0, H).map(delin));
  }
  function relLum(hex) { var c = hexRgb(hex).map(lin); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  function contrast(a, b) { var x = relLum(a), y = relLum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function onColor(hex) { return contrast(hex, '#FFFFFF') >= contrast(hex, '#111111') ? '#FFFFFF' : '#111111'; }
  function norm(v) { v = (v || '').trim().replace(/^#?/, '#'); if (/^#[0-9a-f]{3}$/i.test(v)) v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]; return /^#[0-9a-f]{6}$/i.test(v) ? v.toUpperCase() : null; }
  function hueDist(a, b) { var d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; }

  // ---------- roles ----------
  function auto() {
    var cs = st.colors.map(function (h, i) { var o = toOklch(h); return { hex: h, i: i, L: o.L, C: o.C, H: o.H }; });
    var used = {}, R = {};
    var pick = function (list) { return list.filter(function (c) { return !used[c.i]; }); };
    var main = cs.slice().sort(function (a, b) { return (b.C + (b.i === 0 ? 0.03 : 0)) - (a.C + (a.i === 0 ? 0.03 : 0)); }).filter(function (c) { return c.L > 0.2 && c.L < 0.92; })[0] || cs[0];
    R.main = { hex: main.hex, src: main.i }; used[main.i] = 1;
    var m = toOklch(main.hex);
    var bgC = pick(cs).filter(function (c) { return c.L > 0.9 && c.C < 0.06; }).sort(function (a, b) { return b.L - a.L; })[0];
    R.bg = bgC ? { hex: bgC.hex, src: bgC.i } : { hex: fromOklch(0.985, Math.min(0.012, m.C), m.H), gen: 1 }; if (bgC) used[bgC.i] = 1;
    var txC = pick(cs).filter(function (c) { return c.L < 0.38; }).sort(function (a, b) { return a.L - b.L; })[0];
    if (!txC && main.L < 0.38) R.text = { hex: main.hex, src: main.i };
    else R.text = txC ? { hex: txC.hex, src: txC.i } : { hex: fromOklch(0.24, Math.min(0.045, m.C), m.H), gen: 1 };
    if (txC) used[txC.i] = 1;
    var rest = pick(cs);
    var acc = rest.slice().sort(function (a, b) { return (hueDist(b.H, m.H) * Math.min(1, b.C * 8)) - (hueDist(a.H, m.H) * Math.min(1, a.C * 8)); })[0];
    if (acc && hueDist(acc.H, m.H) > 40 && acc.C > 0.05) { R.acc = { hex: acc.hex, src: acc.i }; used[acc.i] = 1; }
    else R.acc = { hex: fromOklch(Math.min(0.7, Math.max(0.55, m.L)), Math.max(0.12, m.C), (m.H + 180) % 360), gen: 1 };
    var sub = pick(cs)[0];
    R.sub = sub ? { hex: sub.hex, src: sub.i } : { hex: fromOklch(m.L > 0.75 ? 0.93 : Math.min(0.9, m.L + 0.28), Math.min(0.05, m.C * 0.45), m.H), gen: 1 };
    return R;
  }
  function roles() {
    var R = auto();
    Object.keys(st.over).forEach(function (k) { var i = st.over[k]; if (i != null && st.colors[i]) R[k] = { hex: st.colors[i], src: i }; });
    return R;
  }

  // ---------- suggestions & scales ----------
  function suggestions(main) {
    var m = toOklch(main), C = Math.max(0.06, m.C), L = m.L;
    var mk = function (dh, l, c) { return fromOklch(l == null ? L : l, c == null ? C : c, (m.H + dh + 360) % 360); };
    return [
      { n: '類似色', d: '色相相鄰，安靜、和諧', c: [mk(-30), mk(30)] },
      { n: '互補色', d: '色相相對，最有張力', c: [mk(180)] },
      { n: '分裂互補', d: '比互補柔和，仍有對比', c: [mk(150), mk(210)] },
      { n: '三角配色', d: '三等分色相，活潑', c: [mk(120), mk(240)] },
      { n: '同色深淺', d: '同一色相不同明度', c: [mk(0, Math.min(0.95, L + 0.25), C * 0.5), mk(0, Math.max(0.2, L - 0.25), C * 0.8)] },
      { n: '帶色中性', d: '帶一點主色的灰與米白', c: [mk(0, 0.97, 0.01), mk(0, 0.78, 0.02), mk(0, 0.32, 0.025)] }
    ];
  }
  var STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900], LS = [0.975, 0.94, 0.87, 0.79, 0.7, 0.6, 0.51, 0.42, 0.33, 0.25];
  function scale(hex) { var o = toOklch(hex); return LS.map(function (l, i) { var f = 0.35 + 0.65 * Math.sin(Math.PI * (i + 0.6) / (LS.length + 0.2)); return fromOklch(l, o.C * f, o.H); }); }

  // ---------- fonts ----------
  var loaded = {};
  function loadFont(i) { var F = FONTS[i]; if (loaded[F.f]) return; loaded[F.f] = 1; var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + F.g + '&display=swap'; document.head.appendChild(l); }
  function stack(i) { return "'" + FONTS[i].f + "', " + FONTS[i].s; }
  ['pc-hf', 'pc-bf'].forEach(function (id) { $(id).innerHTML = FONTS.map(function (f, i) { return '<option value="' + i + '">' + f.n + '</option>'; }).join(''); });

  // ---------- render ----------
  function badge(r, big) {
    if (r >= 7) return '<span class="badge ok">很清楚</span>';
    if (r >= 4.5) return '<span class="badge ok">內文可以</span>';
    if (r >= 3) return '<span class="badge mid">' + (big ? '大字可以' : '只適合大字') + '</span>';
    return '<span class="badge low">不清楚</span>';
  }
  function paint() {
    loadFont(st.hf); loadFont(st.bf);
    var R = roles(), hf = stack(st.hf), bf = stack(st.bf);
    // chips
    $('pc-chips').innerHTML = st.colors.map(function (h, i) {
      return '<span class="pc-chip"><label style="background:' + h + ';color:' + onColor(h) + '"><input type="color" value="' + h.toLowerCase() + '" data-ci="' + i + '" aria-label="調整 ' + h + '">' + h + '</label><button type="button" data-rm="' + i + '" aria-label="移除 ' + h + '">×</button></span>';
    }).join('') + (st.colors.length ? '' : '<span class="bf-save">還沒有顏色，先貼上一個色號。</span>');
    // roles
    $('pc-roles').innerHTML = ROLES.map(function (r) {
      var c = R[r.k], opts = '<option value="">自動' + (c.gen ? '（延伸）' : '') + '</option>' + st.colors.map(function (h, i) { return '<option value="' + i + '"' + (st.over[r.k] === i ? ' selected' : '') + '>' + h + '</option>'; }).join('');
      return '<div class="pc-role"><div class="pc-sw" style="background:' + c.hex + ';color:' + onColor(c.hex) + '">' + (c.gen ? '<em>延伸</em>' : '') + '<b>' + c.hex + '</b></div><p>' + r.n + '<small>' + r.h + '</small></p><select class="mk-sel" data-role="' + r.k + '" aria-label="' + r.n + ' 使用哪個顏色">' + opts + '</select></div>';
    }).join('');
    $('pc-ratio').innerHTML = ROLES.map(function (r) { return '<div style="flex:' + WEIGHT[r.k] + ';background:' + R[r.k].hex + ';color:' + onColor(R[r.k].hex) + ';' + (relLum(R[r.k].hex) > 0.9 ? 'box-shadow:inset 0 0 0 1px #CFE2EA;' : '') + '"><span>' + r.n + ' ' + WEIGHT[r.k] + '%</span></div>'; }).join('');
    // suggestions
    $('pc-sugs').innerHTML = suggestions(R.main.hex).map(function (s) {
      return '<div class="pc-sug"><div class="pc-sug-c"><i style="background:' + R.main.hex + '" title="主色"></i>' + s.c.map(function (h) { return '<button type="button" style="background:' + h + ';color:' + onColor(h) + '" data-addc="' + h + '" title="加入 ' + h + '"><span>' + h + '</span></button>'; }).join('') + '</div><p><b>' + s.n + '</b>' + s.d + '</p></div>';
    }).join('');
    // scales
    $('pc-scales').innerHTML = st.colors.map(function (h) {
      return '<div class="pc-scale"><span class="pc-scale-n" style="background:' + h + '"></span>' + scale(h).map(function (x, i) { return '<button type="button" data-copy="' + x + '" style="background:' + x + ';color:' + onColor(x) + '"><b>' + STEPS[i] + '</b><span>' + x + '</span></button>'; }).join('') + '</div>';
    }).join('');
    // readability
    var ht = $('pc-ht').value || '標題';
    $('pc-read').innerHTML = ROLES.filter(function (r) { return r.k !== 'text'; }).map(function (r) {
      var bg = R[r.k].hex, tc = r.k === 'bg' ? R.text.hex : (contrast(bg, R.text.hex) >= contrast(bg, R.bg.hex) ? R.text.hex : R.bg.hex), cr = contrast(bg, tc);
      var alt = onColor(bg), ar = contrast(bg, alt), better = cr < 4.5 && ar > cr + 0.5;
      return '<div class="pc-rd"><div class="pc-rd-s" style="background:' + bg + ';color:' + tc + ';' + (relLum(bg) > 0.9 ? 'box-shadow:inset 0 0 0 1px #CFE2EA;' : '') + '"><p class="t" style="font-family:' + hf + '">' + escH(ht) + '</p><p class="b" style="font-family:' + bf + '">內文 14px 的段落文字，放在這個顏色上的樣子。</p><small style="font-family:' + bf + '">說明文字 12px</small></div>' +
        '<dl><div><dt>' + r.n + ' × ' + (tc === R.text.hex ? '文字色' : '背景色') + '</dt><dd>' + cr.toFixed(2) + '</dd></div><div><dt>大標題</dt><dd>' + badge(cr, true) + '</dd></div><div><dt>內文</dt><dd>' + badge(cr) + '</dd></div></dl>' +
        (better ? '<p class="pc-tip">改用 ' + (alt === '#FFFFFF' ? '白色' : '近黑色') + ' 文字，對比可以到 ' + ar.toFixed(1) + '。</p>' : '') + '</div>';
    }).join('');
    // mockups
    var c = { bg: R.bg.hex, text: R.text.hex, main: R.main.hex, sub: R.sub.hex, acc: R.acc.hex };
    var po = $('pl-poster');
    po.style.background = c.bg; po.style.color = c.text; po.querySelector('.dot').style.background = c.main;
    setTxt(po, ht, hf, bf); po.querySelector('.k').style.color = c.acc;
    var ps = $('pl-post'); ps.style.background = c.main; ps.style.color = contrast(c.main, c.bg) > contrast(c.main, c.text) ? c.bg : c.text; setTxt(ps, ht, hf, bf);
    var wb = $('pl-web'), pg = wb.querySelector('.pg'); wb.style.background = c.sub; pg.style.color = c.text; setTxt(pg, ht, hf, bf);
    var btn = pg.querySelector('.btn'); btn.style.background = c.acc; btn.style.color = onColor(c.acc); btn.style.fontFamily = bf;
  }
  function setTxt(el, ht, hf, bf) { var t = el.querySelector('.t'), b = el.querySelector('.b'); t.textContent = ht; t.style.fontFamily = hf; b.textContent = '先把事情想清楚，再一起看看它最後會長成什麼樣子。'; b.style.fontFamily = bf; [].forEach.call(el.querySelectorAll('.k,.ft'), function (x) { x.style.fontFamily = bf; }); }
  function escH(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---------- state helpers ----------
  function addColors(list) {
    var added = 0;
    list.forEach(function (h) { if (st.colors.length >= MAXC) return; if (st.colors.indexOf(h) < 0) { st.colors.push(h); added++; } });
    if (st.colors.length >= MAXC && added < list.length) toast('最多 6 個顏色。');
    paint();
  }
  function parse(text) { return (text.match(/#?\b[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) || []).map(norm).filter(Boolean); }
  function shareURL() {
    var p = new URLSearchParams(); p.set('c', st.colors.map(function (h) { return h.slice(1); }).join('-'));
    Object.keys(st.over).forEach(function (k) { if (st.over[k] != null) p.set('r_' + k, st.over[k]); });
    p.set('hf', st.hf); p.set('bf', st.bf); p.set('ht', $('pc-ht').value);
    return location.origin + location.pathname + '#' + p.toString();
  }
  try {
    var hs = location.hash.slice(1);
    if (hs) {
      var p = new URLSearchParams(hs), cl = (p.get('c') || '').split('-').map(norm).filter(Boolean);
      if (cl.length) st.colors = cl.slice(0, MAXC);
      ROLES.forEach(function (r) { if (p.has('r_' + r.k)) st.over[r.k] = +p.get('r_' + r.k); });
      if (p.has('hf')) st.hf = Math.min(FONTS.length - 1, +p.get('hf') || 0);
      if (p.has('bf')) st.bf = Math.min(FONTS.length - 1, +p.get('bf') || 0);
      if (p.get('ht')) $('pc-ht').value = p.get('ht');
    }
  } catch (e) {}
  $('pc-hf').value = st.hf; $('pc-bf').value = st.bf;

  function toast(m) { var t = $('mk-toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('on'); }, 2200); }
  function copy(txt, msg) {
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { toast(msg); }, function () {
      var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast(msg); } catch (e) { toast('複製失敗，請手動複製。'); } ta.remove();
    });
  }
  function png() {
    var R = roles(), W = 1600, H = 420 + st.colors.length * 92 + 140, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var g = cv.getContext('2d'), SANS = "'Noto Sans TC', 'Hanken Grotesk', sans-serif";
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#12303F'; g.font = '500 18px ' + SANS; g.fillText('PALETTE & TYPE', 80, 80);
    var cw = (W - 160 - 4 * 24) / 5;
    ROLES.forEach(function (r, i) {
      var x = 80 + i * (cw + 24), h = R[r.k].hex;
      g.fillStyle = h; g.fillRect(x, 110, cw, 180); g.strokeStyle = '#CFE2EA'; g.strokeRect(x + .5, 110.5, cw - 1, 179);
      g.fillStyle = '#12303F'; g.font = '500 22px ' + SANS; g.fillText(r.n + (R[r.k].gen ? '（延伸）' : ''), x, 330);
      g.fillStyle = '#4E6B78'; g.font = "20px 'Hanken Grotesk', sans-serif"; g.fillText(h, x, 362);
    });
    var y = 420, sw = (W - 160) / 10;
    st.colors.forEach(function (h) { scale(h).forEach(function (x, i) { g.fillStyle = x; g.fillRect(80 + i * sw, y, sw, 64); g.fillStyle = onColor(x); g.font = "13px 'Hanken Grotesk', sans-serif"; g.fillText(STEPS[i] + '  ' + x, 80 + i * sw + 10, y + 40); }); y += 92; });
    g.fillStyle = '#4E6B78'; g.font = '20px ' + SANS; g.fillText('標題 ' + FONTS[st.hf].n + '　｜　內文 ' + FONTS[st.bf].n, 80, H - 70);
    g.font = '16px ' + SANS; g.textAlign = 'right'; g.fillText('MADE BY MEBO DESIGN STUDIO · mebostudio.github.io/made', W - 80, H - 70);
    var a = document.createElement('a'); a.download = 'palette.png'; a.href = cv.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove(); toast('色票圖已下載。');
  }

  // ---------- events ----------
  $('pc-add').addEventListener('click', function () { var l = parse($('pc-text').value); if (!l.length) { toast('沒有讀到色號，格式像 #12303F。'); return; } $('pc-text').value = ''; addColors(l); });
  $('pc-text').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('pc-add').click(); } });
  $('pc-text').addEventListener('paste', function () { setTimeout(function () { var l = parse($('pc-text').value); if (l.length > 1) { $('pc-text').value = ''; addColors(l); } }, 0); });
  $('pc-pick').addEventListener('change', function (e) { addColors([norm(e.target.value)]); });
  document.addEventListener('input', function (e) {
    if (e.target.dataset.ci != null) { st.colors[+e.target.dataset.ci] = norm(e.target.value); paint(); }
    if (e.target.id === 'pc-ht') paint();
  });
  document.addEventListener('change', function (e) {
    if (e.target.dataset.role) { var v = e.target.value; if (v === '') delete st.over[e.target.dataset.role]; else st.over[e.target.dataset.role] = +v; paint(); }
    if (e.target.id === 'pc-hf') { st.hf = +e.target.value; paint(); }
    if (e.target.id === 'pc-bf') { st.bf = +e.target.value; paint(); }
  });
  document.addEventListener('click', function (e) {
    var rm = e.target.closest('[data-rm]');
    if (rm) { if (st.colors.length <= 1) { toast('至少保留一個顏色。'); return; } var i = +rm.dataset.rm; st.colors.splice(i, 1); Object.keys(st.over).forEach(function (k) { if (st.over[k] === i) delete st.over[k]; else if (st.over[k] > i) st.over[k]--; }); paint(); return; }
    var ad = e.target.closest('[data-addc]'); if (ad) { if (st.colors.length >= MAXC) { toast('最多 6 個顏色，先移除一個。'); return; } addColors([ad.dataset.addc]); toast('已加入 ' + ad.dataset.addc); return; }
    var cp = e.target.closest('[data-copy]'); if (cp) { copy(cp.dataset.copy, '已複製 ' + cp.dataset.copy); return; }
    var R;
    if (e.target.id === 'pc-hex') { R = roles(); copy(ROLES.map(function (r) { return r.n + ' ' + R[r.k].hex; }).join('\n') + '\n\n你的顏色：' + st.colors.join(' '), '已複製色號。'); }
    if (e.target.id === 'pc-css') { R = roles(); copy(':root {\n' + ROLES.map(function (r) { return '  --color-' + r.k + ': ' + R[r.k].hex + ';'; }).join('\n') + '\n' + st.colors.map(function (h, ci) { return scale(h).map(function (x, i) { return '  --c' + (ci + 1) + '-' + STEPS[i] + ': ' + x + ';'; }).join('\n'); }).join('\n') + "\n  --font-heading: " + stack(st.hf) + ";\n  --font-body: " + stack(st.bf) + ';\n}', '已複製 CSS 變數。'); }
    if (e.target.id === 'pc-link') copy(shareURL(), '已複製分享連結。');
    if (e.target.id === 'pc-png') { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(png); }
  });
  paint();
})();
