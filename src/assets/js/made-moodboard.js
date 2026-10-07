/* MEBO MADE — Moodboard 整理器: Reference → Pattern → Direction → Board. Runs entirely in the browser. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  if (!$('mb')) return;
  var MAX = 10;

  var DIMS = {
    type: { label: 'TYPE', zh: '字體', opts: ['Serif', 'Grotesk', 'Display', 'Script', 'Mono', 'No Type'] },
    image: { label: 'IMAGE', zh: '影像', opts: ['Documentary', 'Flash', 'Still Life', 'Graphic', 'Illustration', 'Landscape'] },
    layout: { label: 'LAYOUT', zh: '版面', opts: ['Editorial', 'Dense', 'Minimal', 'Grid', 'Collage'] }
  };
  var ZH = {
    Warm: '暖色', Cool: '冷色', Neutral: '中性', 'High Contrast': '高對比', Soft: '低對比', Vivid: '鮮豔', Muted: '低飽和',
    Serif: '襯線', Grotesk: '無襯線', Display: '標題字', Script: '手寫', Mono: '等寬', 'No Type': '無文字',
    Documentary: '紀實', Flash: '直閃', 'Still Life': '靜物', Graphic: '圖形', Illustration: '插畫', Landscape: '空間風景',
    Editorial: '編輯感', Dense: '密集', Minimal: '極簡', Grid: '網格', Collage: '拼貼'
  };
  var MOOD = {
    Warm: 'Warm', Cool: 'Calm', Neutral: 'Quiet', 'High Contrast': 'Bold', Soft: 'Soft', Vivid: 'Playful', Muted: 'Muted',
    Serif: 'Classic', Grotesk: 'Modern', Display: 'Graphic', Script: 'Personal', Mono: 'Precise', 'No Type': 'Pure',
    Documentary: 'Human', Flash: 'Raw', 'Still Life': 'Crafted', Graphic: 'Graphic', Illustration: 'Playful', Landscape: 'Open',
    Editorial: 'Editorial', Dense: 'Energetic', Minimal: 'Quiet', Grid: 'Structured', Collage: 'Playful'
  };
  var SENT = {
    type: { Serif: '字體偏向襯線，帶一點書卷與編輯感。', Grotesk: '無襯線黑體為主，乾淨、現代。', Display: '標題字很有個性，字本身就是畫面。', Script: '手寫或書寫感的字，比較私人、有溫度。', Mono: '等寬字帶出理性與技術感。', 'No Type': '畫面幾乎不靠文字說話。' },
    image: { Documentary: '影像像紀錄，真實的人和日常。', Flash: '直閃攝影，生猛、有現場感。', 'Still Life': '靜物與物件，光線和質感是重點。', Graphic: '以圖形和色塊構成畫面。', Illustration: '插畫帶出想像和個性。', Landscape: '空間與風景，讓畫面有呼吸的地方。' },
    layout: { Editorial: '版面像雜誌，圖文有節奏地配置。', Dense: '資訊密集、層次多，很熱鬧。', Minimal: '大量留白，元素很少。', Grid: '有清楚的網格秩序。', Collage: '拼貼、自由、不規則。' }
  };
  // type specimen per TYPE tag
  var SPEC = {
    Serif: { f: "'Noto Serif TC', serif", w: 400, n: 'Serif　襯線' },
    Grotesk: { f: "'Hanken Grotesk', 'Noto Sans TC', sans-serif", w: 400, n: 'Grotesk　無襯線' },
    Display: { f: "'Hanken Grotesk', 'Noto Sans TC', sans-serif", w: 600, n: 'Display　標題字' },
    Script: { f: "'Noto Serif TC', serif", w: 400, it: true, n: 'Script　書寫感' },
    Mono: { f: "ui-monospace, 'SFMono-Regular', Menlo, monospace", w: 400, n: 'Mono　等寬' },
    'No Type': { f: "'Noto Sans TC', sans-serif", w: 300, n: '幾乎不用字' }
  };

  var refs = [], uid = 0, dirs = null;

  // ---------- analysis ----------
  function analyze(img) {
    var S = 72, cv = document.createElement('canvas'), w, h;
    if (img.naturalWidth > img.naturalHeight) { w = S; h = Math.max(1, Math.round(S * img.naturalHeight / img.naturalWidth)); } else { h = S; w = Math.max(1, Math.round(S * img.naturalWidth / img.naturalHeight)); }
    cv.width = w; cv.height = h; var g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, w, h);
    var d = g.getImageData(0, 0, w, h).data, px = [], lum = [], tempSum = 0, satSum = 0, n = 0;
    for (var i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 128) continue;
      var r = d[i], gg = d[i + 1], b = d[i + 2], mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), s = mx ? (mx - mn) / mx : 0;
      px.push([r, gg, b]); lum.push((0.2126 * r + 0.7152 * gg + 0.0722 * b) / 255);
      tempSum += (r - b) / 255 * (0.3 + s); satSum += s; n++;
    }
    lum.sort(function (a, b) { return a - b; });
    var gray = function (x, y) { var k = (y * w + x) * 4; return (0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2]) / 255; };
    var edge = 0, cnt = 0;
    for (var y = 1; y < h - 1; y++) for (var x = 1; x < w - 1; x++) { edge += Math.abs(gray(x + 1, y) - gray(x - 1, y)) + Math.abs(gray(x, y + 1) - gray(x, y - 1)); cnt++; }
    var T = 6, empty = 0, tw = Math.floor(w / T), th = Math.floor(h / T);
    for (var ty = 0; ty < T; ty++) for (var tx = 0; tx < T; tx++) {
      var vals = []; for (var yy = ty * th; yy < (ty + 1) * th; yy++) for (var xx = tx * tw; xx < (tx + 1) * tw; xx++) vals.push(gray(xx, yy));
      var m = vals.reduce(function (a, v) { return a + v; }, 0) / (vals.length || 1), v2 = vals.reduce(function (a, v) { return a + (v - m) * (v - m); }, 0) / (vals.length || 1);
      if (Math.sqrt(v2) < 0.035) empty++;
    }
    return { pal: kmeans(px, 5), temp: tempSum / n, sat: satSum / n, contrast: lum[Math.floor(n * 0.95)] - lum[Math.floor(n * 0.05)], edge: edge / (cnt || 1), empty: empty / (T * T) };
  }
  function kmeans(px, k) {
    if (!px.length) return [];
    var c = [], step = Math.max(1, Math.floor(px.length / k));
    px.slice().sort(function (a, b) { return (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]); }).forEach(function (p, i) { if (i % step === Math.floor(step / 2) && c.length < k) c.push(p.slice()); });
    var asg = new Array(px.length);
    for (var it = 0; it < 8; it++) {
      var sums = c.map(function () { return [0, 0, 0, 0]; });
      px.forEach(function (p, i) { var bi = 0, bd = 1e9; c.forEach(function (cc, j) { var dd = (p[0] - cc[0]) * (p[0] - cc[0]) + (p[1] - cc[1]) * (p[1] - cc[1]) + (p[2] - cc[2]) * (p[2] - cc[2]); if (dd < bd) { bd = dd; bi = j; } }); asg[i] = bi; var s = sums[bi]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3]++; });
      c = c.map(function (cc, j) { var s = sums[j]; return s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : cc; });
    }
    var counts = c.map(function () { return 0; }); asg.forEach(function (a) { counts[a]++; });
    return c.map(function (cc, j) { return [Math.round(cc[0]), Math.round(cc[1]), Math.round(cc[2]), counts[j] / px.length]; }).filter(function (x) { return x[3] > 0.02; }).sort(function (a, b) { return b[3] - a[3]; });
  }
  function colorTags(a) { return { temp: a.temp > 0.05 ? 'Warm' : a.temp < -0.05 ? 'Cool' : 'Neutral', contrast: a.contrast > 0.62 ? 'High Contrast' : 'Soft', sat: a.sat > 0.38 ? 'Vivid' : 'Muted' }; }
  function layoutGuess(a) { if (a.empty > 0.5 && a.edge < 0.08) return 'Minimal'; if (a.edge > 0.16 && a.empty < 0.15) return 'Dense'; return null; }
  var hex = function (p) { return '#' + p.slice(0, 3).map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join('').toUpperCase(); };
  function lumi(p) { return (0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]) / 255; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tally(list, key) {
    var c = {}; list.forEach(function (r) { var v = r.tags[key]; if (v) c[v] = (c[v] || 0) + 1; });
    return Object.keys(c).map(function (k) { return [k, c[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
  }
  function mergedPalette(list, k) {
    var pts = []; list.forEach(function (r) { r.a.pal.forEach(function (p) { var m = Math.round(p[3] * 40); for (var i = 0; i < m; i++) pts.push(p.slice(0, 3)); }); });
    return kmeans(pts, k || 6);
  }

  // ---------- step 1: references ----------
  function addFiles(files) {
    var list = [].slice.call(files).filter(function (f) { return /^image\//.test(f.type); });
    var room = MAX - refs.length;
    if (list.length > room) toast('最多 10 張，多的先不放入。');
    list.slice(0, room).forEach(function (f) {
      var url = URL.createObjectURL(f), img = new Image();
      img.onload = function () {
        var a = analyze(img), ct = colorTags(a), lg = layoutGuess(a);
        refs.push({ id: ++uid, img: img, url: url, a: a, tags: { temp: ct.temp, contrast: ct.contrast, sat: ct.sat, type: null, image: null, layout: lg }, sugg: { layout: lg } });
        dirs = null; renderRefs();
      };
      img.onerror = function () { toast('有一張圖片無法讀取。'); };
      img.src = url;
    });
  }
  function chip(id, group, val, on) { return '<button type="button" class="mb-chip' + (on ? ' on' : '') + '" data-ref="' + id + '" data-g="' + group + '" data-v="' + val + '">' + val + '<small>' + (ZH[val] || '') + '</small></button>'; }
  function renderRefs() {
    $('mb-refs').innerHTML = refs.map(function (r, i) {
      var t = r.tags;
      return '<article class="mb-ref"><div class="mb-thumb"><img src="' + r.url + '" alt="參考圖 ' + (i + 1) + '"><button type="button" class="mb-x" data-del="' + r.id + '" aria-label="移除這張">×</button><span class="mb-idx">REF ' + String(i + 1).padStart(2, '0') + '</span></div>' +
        '<div class="mb-pal">' + r.a.pal.map(function (p) { return '<i style="flex:' + p[3] + ';background:' + hex(p) + '" title="' + hex(p) + '"></i>'; }).join('') + '</div>' +
        '<div class="mb-tags"><div class="mb-tg"><em>COLOR<small>自動分析，可點選修改</small></em><div>' +
        ['Warm', 'Neutral', 'Cool'].map(function (v) { return chip(r.id, 'temp', v, t.temp === v); }).join('') +
        chip(r.id, 'contrast', 'High Contrast', t.contrast === 'High Contrast') + chip(r.id, 'sat', 'Vivid', t.sat === 'Vivid') + '</div></div>' +
        Object.keys(DIMS).map(function (k) {
          var D = DIMS[k];
          return '<div class="mb-tg"><em>' + D.label + '<small>' + D.zh + (k === 'layout' && r.sugg.layout ? '・已預選建議' : '') + '</small></em><div>' + D.opts.map(function (v) { return chip(r.id, k, v, t[k] === v); }).join('') + '</div></div>';
        }).join('') + '</div></article>';
    }).join('');
    $('mb-count').textContent = refs.length + ' / ' + MAX;
    $('mb-drop').style.display = refs.length >= MAX ? 'none' : '';
    var untagged = refs.filter(function (r) { return !r.tags.type || !r.tags.image || !r.tags.layout; }).length;
    $('mb-next1').disabled = refs.length < 3;
    $('mb-hint').textContent = refs.length < 3 ? '放入至少 3 張參考圖，再替每張選擇類型。' : (untagged ? '還有 ' + untagged + ' 張沒有選完類型，沒選的會略過那一項。' : '都標好了，可以進下一步。');
  }

  // ---------- step 2: pattern ----------
  function bars(title, zh, rows, total) {
    return '<div class="mb-dim"><h3>' + title + '<small>' + zh + '</small></h3>' + (rows.length ? rows.map(function (r) {
      return '<div class="mb-bar"><span>' + r[0] + '<small>' + (ZH[r[0]] || '') + '</small></span><i><b style="width:' + Math.round(r[1] / total * 100) + '%"></b></i><em>' + r[1] + '</em></div>';
    }).join('') : '<p class="bf-save">還沒有標記。</p>') + '</div>';
  }
  function renderPattern() {
    var n = refs.length, P = mergedPalette(refs, 6);
    var colorRows = tally(refs, 'temp').concat([['High Contrast', refs.filter(function (r) { return r.tags.contrast === 'High Contrast'; }).length], ['Vivid', refs.filter(function (r) { return r.tags.sat === 'Vivid'; }).length]].filter(function (x) { return x[1]; }));
    var top = function (k) { var t = tally(refs, k); return t.length ? t[0][0] : null; };
    var summary = [top('temp'), top('type'), top('image'), top('layout')].filter(Boolean);
    $('mb-pattern').innerHTML =
      '<div class="mb-sum"><span class="mk-kicker">PATTERN</span><p>這 ' + n + ' 張參考最常出現的是 ' + summary.map(function (s) { return '<b>' + s + '</b>（' + ZH[s] + '）'; }).join('、') + '。</p></div>' +
      '<div class="mb-palette">' + P.map(function (p) { return '<div style="flex:' + (p[3] + 0.08) + ';background:' + hex(p) + ';color:' + (lumi(p) > 0.55 ? '#12303F' : '#FFFFFF') + '"><span>' + hex(p) + '</span></div>'; }).join('') + '</div>' +
      '<div class="mb-dims">' + bars('COLOR', '色彩', colorRows, n) + bars('TYPE', '字體', tally(refs, 'type'), n) + bars('IMAGE', '影像', tally(refs, 'image'), n) + bars('LAYOUT', '版面', tally(refs, 'layout'), n) + '</div>';
  }

  // ---------- step 3: direction ----------
  function vec(r) {
    var v = [r.a.temp * 4, (r.tags.contrast === 'High Contrast' ? 1 : 0), (r.tags.sat === 'Vivid' ? 1 : 0)];
    Object.keys(DIMS).forEach(function (k) { DIMS[k].opts.forEach(function (o) { v.push(r.tags[k] === o ? 1.2 : 0); }); });
    return v;
  }
  function dist(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - b[i]) * (a[i] - b[i]); return s; }
  function cluster(list) {
    if (list.length < 4) return [list.slice()];
    var V = list.map(vec), n = V.length, best = null;
    var mean = function (idx) { return V[idx[0]].map(function (_, d) { return idx.reduce(function (a, i) { return a + V[i][d]; }, 0) / idx.length; }); };
    for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) {
      var c = [V[i].slice(), V[j].slice()], asg = [];
      for (var it = 0; it < 10; it++) {
        asg = V.map(function (v) { return dist(v, c[0]) <= dist(v, c[1]) ? 0 : 1; });
        [0, 1].forEach(function (k) { var idx = []; asg.forEach(function (a, q) { if (a === k) idx.push(q); }); if (idx.length) c[k] = mean(idx); });
      }
      var s0 = asg.filter(function (a) { return a === 0; }).length;
      if (Math.min(s0, n - s0) < 2) continue;
      var sse = V.reduce(function (a, v, q) { return a + dist(v, c[asg[q]]); }, 0);
      if (!best || sse < best.sse) best = { sse: sse, asg: asg };
    }
    if (!best) return [list.slice()];
    var g = [[], []]; list.forEach(function (r, q) { g[best.asg[q]].push(r); });
    return g.sort(function (a, b) { return b.length - a.length; });
  }
  function directionOf(group) {
    var score = {};
    var add = function (tag, w) { if (!tag) return; var m = MOOD[tag]; score[m] = (score[m] || 0) + w; };
    group.forEach(function (r) { add(r.tags.temp, 1); if (r.tags.contrast === 'High Contrast') add('High Contrast', 1.1); else add('Soft', 0.6); if (r.tags.sat === 'Vivid') add('Vivid', 1); add(r.tags.type, 1); add(r.tags.image, 1.2); add(r.tags.layout, 1.2); });
    var ranked = Object.keys(score).sort(function (a, b) { return score[b] - score[a]; });
    var top = function (k) { var t = tally(group, k); return t.length ? t[0][0] : null; };
    var tp = top('temp'), hc = group.filter(function (r) { return r.tags.contrast === 'High Contrast'; }).length > group.length / 2, vv = group.filter(function (r) { return r.tags.sat === 'Vivid'; }).length > group.length / 2;
    var lines = ['色彩以' + ({ Warm: '溫暖', Cool: '冷調', Neutral: '中性' }[tp] || '中性') + '為主，' + (hc ? '對比強烈' : '對比柔和') + '，' + (vv ? '飽和鮮明。' : '飽和度偏低。')];
    ['type', 'image', 'layout'].forEach(function (k) { var t = top(k); if (t) lines.push(SENT[k][t]); });
    return { name: ranked.slice(0, 3).join(' / '), ranked: ranked, refs: group, pal: mergedPalette(group, 5), type: top('type') || 'Grotesk',
      keys: { COLOR: [tp, hc ? 'High Contrast' : 'Soft', vv ? 'Vivid' : 'Muted'].filter(Boolean), TYPE: tally(group, 'type').slice(0, 2).map(function (x) { return x[0]; }), IMAGE: tally(group, 'image').slice(0, 2).map(function (x) { return x[0]; }), LAYOUT: tally(group, 'layout').slice(0, 2).map(function (x) { return x[0]; }) }, text: lines.join('') };
  }
  function makeDirs(list) {
    var ds = cluster(list).map(directionOf);
    if (ds.length > 1) {
      var used = ds[0].name.split(' / '), alt = ds[1].ranked.filter(function (w) { return used.indexOf(w) < 0; });
      if (alt.length >= 2) ds[1].name = alt.concat(ds[1].ranked.filter(function (w) { return alt.indexOf(w) < 0; })).slice(0, 3).join(' / ');
    }
    return ds;
  }

  // ---------- board layout (shared by page and PNG) ----------
  var BW = 1600, BH = 1000, M = 56, GAP = 12;
  function boardSpec(d, i, project) {
    var imgs = d.refs.slice(0, 7), n = imgs.length, cx = M, cy = 128, cw = 1040, ch = BH - cy - M, rects = [];
    var heroW = n === 1 ? cw : Math.round(cw * (n === 2 ? 0.6 : n <= 4 ? 0.56 : 0.5));
    if (n) rects.push({ r: imgs[0], x: cx, y: cy, w: heroW, h: ch });
    var rest = imgs.slice(1), rx = cx + heroW + GAP, rw = cw - heroW - GAP;
    if (rest.length) {
      var rows = [], k = 0;
      if (rest.length === 1) rows = [[rest[0]]];
      else if (rest.length === 3) rows = [[rest[0]], [rest[1], rest[2]]];
      else { while (k < rest.length) { rows.push(rest.slice(k, k + 2)); k += 2; } }
      var rh = (ch - GAP * (rows.length - 1)) / rows.length;
      rows.forEach(function (row, ri) {
        var cwi = (rw - GAP * (row.length - 1)) / row.length;
        row.forEach(function (r, ci) { rects.push({ r: r, x: rx + ci * (cwi + GAP), y: cy + ri * (rh + GAP), w: cwi, h: rh }); });
      });
    }
    return { d: d, i: i, project: project || 'Moodboard', rects: rects, px: cx + cw + 48, pw: BW - (cx + cw + 48) - M };
  }
  function boardHTML(S) {
    var d = S.d, sp = SPEC[d.type] || SPEC.Grotesk, P = d.pal.length ? d.pal : [[230, 230, 230, 1]];
    var pct = function (v, t) { return (v / t * 100).toFixed(3) + '%'; };
    var box = function (x, y, w, h) { return 'left:' + pct(x, BW) + ';top:' + pct(y, BH) + ';width:' + pct(w, BW) + ';height:' + pct(h, BH); };
    var h = '<div class="mbb" role="img" aria-label="Creative direction ' + (S.i + 1) + ' moodboard">';
    h += '<div class="mbb-hd" style="' + box(M, 40, BW - 2 * M, 40) + '"><span>MOODBOARD　/　' + esc(S.project) + '</span><span>CREATIVE DIRECTION ' + String(S.i + 1).padStart(2, '0') + '</span></div>';
    h += '<i class="mbb-rule" style="' + box(M, 96, BW - 2 * M, 1) + '"></i>';
    S.rects.forEach(function (q) { h += '<div class="mbb-img" style="' + box(q.x, q.y, q.w, q.h) + '"><img src="' + q.r.url + '" alt=""></div>'; });
    var x = S.px, w = S.pw;
    h += '<div class="mbb-panel" style="' + box(x, 128, w, BH - 128 - M) + '">' +
      '<p class="mbb-k">DIRECTION ' + String(S.i + 1).padStart(2, '0') + '</p><h4 class="mbb-t">' + esc(d.name) + '</h4>' +
      '<div class="mbb-pal">' + P.slice(0, 5).map(function (p) { return '<div><i style="background:' + hex(p) + '"></i><span>' + hex(p) + '</span></div>'; }).join('') + '</div>' +
      '<div class="mbb-type"><b style="font-family:' + sp.f + ';font-weight:' + sp.w + (sp.it ? ';font-style:italic' : '') + '">Aa 字</b><span>' + sp.n + '</span></div>' +
      '<dl class="mbb-keys">' + Object.keys(d.keys).map(function (k) { return '<div><dt>' + k + '</dt><dd>' + (d.keys[k].join(' · ') || '—') + '</dd></div>'; }).join('') + '</dl>' +
      '<p class="mbb-p">' + esc(d.text) + '</p><p class="mbb-f">MADE WITH MEBO MOODBOARD</p></div>';
    return h + '</div>';
  }
  function cover(g, img, x, y, w, h) {
    var iw = img.naturalWidth, ih = img.naturalHeight, r = Math.max(w / iw, h / ih), sw = w / r, sh = h / r;
    g.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
  }
  function wrap(g, text, x, y, maxW, lh, maxLines) {
    var toks = String(text).match(/[\u2E80-\u9FFF\uFF00-\uFFEF\u3000-\u303F]|[^\s\u2E80-\u9FFF\uFF00-\uFFEF\u3000-\u303F]+|\s+/g) || [], line = '', n = 0;
    for (var i = 0; i < toks.length; i++) {
      var t = line + toks[i];
      if (g.measureText(t.trim()).width > maxW && line.trim()) { g.fillText(line.trim(), x, y); line = toks[i].trim() ? toks[i] : ''; y += lh; if (++n >= (maxLines || 99)) return y; }
      else line = t;
    }
    if (line.trim()) g.fillText(line.trim(), x, y);
    return y + lh;
  }
  function drawBoard(g, S, oy) {
    var d = S.d, sp = SPEC[d.type] || SPEC.Grotesk, SANS = "'Noto Sans TC', 'Hanken Grotesk', sans-serif", SERIF = "'Noto Serif TC', serif", P = d.pal.length ? d.pal : [[230, 230, 230, 1]];
    g.save(); g.translate(0, oy || 0);
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, BW, BH);
    g.fillStyle = '#12303F'; g.font = '500 15px ' + SANS; g.textBaseline = 'alphabetic';
    g.fillText('MOODBOARD　/　' + S.project, M, 70);
    g.textAlign = 'right'; g.fillText('CREATIVE DIRECTION ' + String(S.i + 1).padStart(2, '0'), BW - M, 70); g.textAlign = 'left';
    g.fillRect(M, 96, BW - 2 * M, 1);
    S.rects.forEach(function (q) { cover(g, q.r.img, q.x, q.y, q.w, q.h); });
    var x = S.px, w = S.pw, y = 150;
    g.fillStyle = '#2A7698'; g.font = '500 14px ' + SANS; g.fillText('DIRECTION ' + String(S.i + 1).padStart(2, '0'), x, y); y += 52;
    g.fillStyle = '#12303F'; g.font = '40px ' + SERIF; y = wrap(g, d.name, x, y, w, 52, 3) + 8;
    var sw = (w - 4 * 8) / 5; P.slice(0, 5).forEach(function (p, k) { g.fillStyle = hex(p); g.fillRect(x + k * (sw + 8), y, sw, 72); g.strokeStyle = '#CFE2EA'; g.lineWidth = 1; g.strokeRect(x + k * (sw + 8) + .5, y + .5, sw - 1, 71); g.fillStyle = '#4E6B78'; g.font = '12px ' + SANS; g.fillText(hex(p), x + k * (sw + 8), y + 94); });
    y += 140;
    g.fillStyle = '#12303F'; g.font = (sp.it ? 'italic ' : '') + sp.w + ' 76px ' + sp.f; g.fillText('Aa 字', x, y + 50);
    g.fillStyle = '#4E6B78'; g.font = '13px ' + SANS; g.fillText(sp.n, x, y + 84); y += 120;
    Object.keys(d.keys).forEach(function (k) { g.fillStyle = '#CFE2EA'; g.fillRect(x, y + 12, w, 1); g.fillStyle = '#4E6B78'; g.font = '500 12px ' + SANS; g.fillText(k, x, y); g.fillStyle = '#12303F'; g.font = '15px ' + SANS; g.fillText(d.keys[k].join(' · ') || '—', x + 90, y); y += 38; });
    y += 14; g.fillStyle = '#2F4B58'; g.font = '15px ' + SANS; wrap(g, d.text, x, y, w, 26, 6);
    g.fillStyle = '#4E6B78'; g.font = '500 11px ' + SANS; g.fillText('MADE WITH MEBO MOODBOARD · mebostudio.github.io/made', x, BH - M);
    g.restore();
  }
  function downloadBoards(list, project, name) {
    var specs = list.map(function (d, i) { return boardSpec(d, i, project); });
    var cv = document.createElement('canvas'); cv.width = BW; cv.height = BH * specs.length + 24 * (specs.length - 1);
    var g = cv.getContext('2d'); g.fillStyle = '#E3F1F8'; g.fillRect(0, 0, cv.width, cv.height);
    specs.forEach(function (S, k) { drawBoard(g, S, k * (BH + 24)); });
    var a = document.createElement('a'); a.download = name || 'moodboard.png'; a.href = cv.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove();
  }

  function renderDirs() {
    if (!dirs) dirs = makeDirs(refs);
    var project = $('mb-name').value || 'Moodboard';
    $('mb-dirs').innerHTML = dirs.map(function (d, i) {
      return '<article class="mb-dir2"><div class="mbb-wrap" id="mbb-' + i + '">' + boardHTML(boardSpec(d, i, project)) + '</div>' +
        '<div class="mb-edit"><label class="mk-field"><span>方向名稱</span><input class="mk-in" data-dn="' + i + '" value="' + esc(d.name) + '"></label>' +
        '<label class="mk-field"><span>方向說明</span><textarea class="mk-ta" data-dt="' + i + '" style="min-height:72px">' + esc(d.text) + '</textarea></label>' +
        '<button type="button" class="mk-btn ghost" data-dl="' + i + '">下載這張 PNG</button></div></article>';
    }).join('');
  }
  function refreshBoard(i) { $('mbb-' + i).innerHTML = boardHTML(boardSpec(dirs[i], i, $('mb-name').value || 'Moodboard')); }
  function asText() {
    if (!dirs) dirs = makeDirs(refs);
    return ($('mb-name').value || 'Moodboard') + '\nReference → Pattern → Direction\n\n' + dirs.map(function (d, i) {
      return 'CREATIVE DIRECTION ' + String(i + 1).padStart(2, '0') + '\n' + d.name + '\n' + Object.keys(d.keys).map(function (k) { return k + '：' + (d.keys[k].join(' / ') || '—'); }).join('\n') + '\n色票：' + d.pal.map(hex).join(' ') + '\n' + d.text;
    }).join('\n\n');
  }

  // ---------- example board at the top ----------
  var EX = [
    ['aim-then-move', 'Still Life', 'Serif', 'Editorial'], ['new-balance-bloom-into-lightness', 'Documentary', 'Grotesk', 'Minimal'],
    ['ponytail', 'Documentary', 'Serif', 'Editorial'], ['feng-ze-lines', 'Landscape', 'Grotesk', 'Minimal'],
    ['the-aveum', 'Graphic', 'Serif', 'Minimal'], ['yuanba', 'Still Life', 'Serif', 'Minimal']
  ];
  function loadExample() {
    var host = $('mb-example'); if (!host) return;
    var list = [], left = EX.length;
    EX.forEach(function (e, k) {
      var img = new Image();
      img.onload = function () {
        var a = analyze(img), ct = colorTags(a);
        list[k] = { img: img, url: img.src, a: a, tags: { temp: ct.temp, contrast: ct.contrast, sat: ct.sat, image: e[1], type: e[2], layout: e[3] } };
        if (--left === 0) {
          var d = directionOf(list.filter(Boolean)); d.name = 'Quiet / Editorial / Human';
          host.innerHTML = boardHTML(boardSpec(d, 0, 'MEBO 範例'));
        }
      };
      img.onerror = function () { left--; };
      img.src = '/assets/images/projects/' + e[0] + '.jpg';
    });
  }

  // ---------- UI ----------
  function toast(m) { var t = $('mk-toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('on'); }, 2200); }
  function go(s) {
    if (s > 0 && refs.length < 3) { toast('先放入至少 3 張參考圖。'); s = 0; }
    if (s === 1) renderPattern();
    if (s === 2) renderDirs();
    [].forEach.call(document.querySelectorAll('.mb-step'), function (el) { el.classList.toggle('on', +el.dataset.s === s); });
    [].forEach.call(document.querySelectorAll('.mb-flow button'), function (b) { b.classList.toggle('on', +b.dataset.step === s); });
    var top = $('mb-flow').getBoundingClientRect().top + window.scrollY - 70; if (Math.abs(window.scrollY - top) > 40) window.scrollTo({ top: top, behavior: 'smooth' });
  }
  $('mb-file').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });
  var drop = $('mb-drop');
  ['dragenter', 'dragover'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('hover'); }); });
  ['dragleave', 'drop'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove('hover'); }); });
  drop.addEventListener('drop', function (e) { addFiles(e.dataTransfer.files); });
  document.addEventListener('click', function (e) {
    var s = e.target.closest('[data-step]'); if (s && !s.disabled) { go(+s.dataset.step); return; }
    var c = e.target.closest('.mb-chip');
    if (c) {
      var r = refs.find(function (x) { return x.id === +c.dataset.ref; }), gk = c.dataset.g, v = c.dataset.v;
      if (gk === 'contrast') r.tags.contrast = r.tags.contrast === 'High Contrast' ? 'Soft' : 'High Contrast';
      else if (gk === 'sat') r.tags.sat = r.tags.sat === 'Vivid' ? 'Muted' : 'Vivid';
      else r.tags[gk] = r.tags[gk] === v ? null : v;
      dirs = null; renderRefs(); return;
    }
    var del = e.target.closest('[data-del]');
    if (del) { refs = refs.filter(function (x) { if (x.id === +del.dataset.del) { URL.revokeObjectURL(x.url); return false; } return true; }); dirs = null; renderRefs(); return; }
    var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var dl = e.target.closest('[data-dl]');
    if (dl) { var i = +dl.dataset.dl; ready.then(function () { downloadBoards([dirs[i]], $('mb-name').value || 'Moodboard', 'moodboard-direction-' + (i + 1) + '.png'); toast('已下載。'); }); }
    if (e.target.id === 'mb-png') ready.then(function () { downloadBoards(dirs, $('mb-name').value || 'Moodboard', 'moodboard.png'); toast('Moodboard 已下載。'); });
    if (e.target.id === 'mb-copy') { var txt = asText(); (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { toast('已複製。'); }, function () { toast('複製失敗，請手動選取文字。'); }); }
  });
  document.addEventListener('input', function (e) {
    if (!dirs) return;
    if (e.target.dataset.dn != null) { dirs[+e.target.dataset.dn].name = e.target.value; refreshBoard(+e.target.dataset.dn); }
    if (e.target.dataset.dt != null) { dirs[+e.target.dataset.dt].text = e.target.value; refreshBoard(+e.target.dataset.dt); }
    if (e.target.id === 'mb-name') dirs.forEach(function (_, i) { refreshBoard(i); });
  });
  renderRefs();
  loadExample();
})();
