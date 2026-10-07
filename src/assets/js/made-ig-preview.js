/* MEBO MADE — 社群視覺預覽. Media stays in the browser. Safe zones are approximate and may change with the app. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  if (!$('ig')) return;

  // crop = what the 3:4 profile grid cuts off, as fractions [top,right,bottom,left] of the asset
  var MODES = [
    { k: 'f11', n: '貼文 1:1', r: 1, size: '1080 × 1080', kind: 'feed', crop: [0, .125, 0, .125] },
    { k: 'f45', n: '貼文 4:5', r: .8, size: '1080 × 1350', kind: 'feed', crop: [0, .03125, 0, .03125] },
    { k: 'f34', n: '貼文 3:4', r: .75, size: '1080 × 1440', kind: 'feed', crop: [0, 0, 0, 0] },
    { k: 'f191', n: '貼文 1.91:1', r: 1.91, size: '1080 × 566', kind: 'feed', crop: [0, .304, 0, .304] },
    { k: 'reels', n: 'Reels', r: 9 / 16, size: '1080 × 1920', kind: 'reels', crop: [.125, 0, .125, 0], safe: { t: .115, b: .219, r: .13, l: 0 } },
    { k: 'story', n: '限時動態', r: 9 / 16, size: '1080 × 1920', kind: 'story', crop: null, safe: { t: .13, b: .177, r: 0, l: 0 } }
  ];
  var TIPS = {
    feed: ['個人頁的格狀縮圖現在是 3:4，正方形和 4:5 貼文的左右兩側會被切掉一些，文字不要太貼邊。', '1.91:1 橫式貼文在個人頁會被切掉一大半，重點放在正中間。', '多張輪播時，下方會出現小圓點，最底部不要放太小的字。'],
    reels: ['右側的按鈕和下方的帳號、說明文字，是最容易擋住內容的地方。', '封面在個人頁顯示成 3:4，上下各會切掉約 12.5%。', '在動態消息裡 Reels 可能以 4:5 顯示，上下也會被切掉一部分。'],
    story: ['上方有進度條和帳號名稱，下方有回覆列，重要文字和按鈕放在中間比較安全。', '限時動態不會出現在個人頁格狀，但可以存成精選動態。', '連結貼紙、投票等互動元件也盡量避開上下的紅色區域。']
  };
  var ICON = {
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M20 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.2A8 8 0 1 1 20 11.5z"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M21 4 10 14M21 4l-7 17-4-7-7-4z"/></svg>',
    mark: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>',
    music: '<svg viewBox="0 0 24 24"><path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/></svg>',
    cam: '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8 7l2-3h4l2 3"/></svg>',
    rep: '<svg viewBox="0 0 24 24"><path d="M4 9h13l-3-3M20 15H7l3 3"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    grid: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16"/><path d="M9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16"/></svg>',
    reel: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M4 9h16M9 4l2 5M14 4l2 5M10.5 12.5v4l3.5-2z"/></svg>',
    tag: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="12" cy="10.5" r="2.5"/><path d="M7.5 18c1-2.3 2.6-3.4 4.5-3.4s3.5 1.1 4.5 3.4"/></svg>'
  };

  var mode = MODES[1], media = null; // {type:'image'|'video', url, w, h, dur}
  var px = 50, py = 50;

  $('ig-tabs').innerHTML = MODES.map(function (m) { return '<button type="button" role="tab" data-m="' + m.k + '"' + (m === mode ? ' aria-selected="true" class="on"' : '') + '><b>' + m.n + '</b><small>' + m.size + '</small></button>'; }).join('');

  function mediaEl(cls, forGrid) {
    if (!media) return '<div class="ig-empty ' + (cls || '') + '"><span>' + (forGrid ? '' : '上傳後會顯示在這裡') + '</span></div>';
    var st = 'object-position:' + px + '% ' + py + '%';
    if (media.type === 'video') return '<video class="ig-m ' + (cls || '') + '" src="' + media.url + '" muted playsinline loop ' + (forGrid ? 'preload="auto"' : 'autoplay') + ' style="' + st + '"></video>';
    return '<img class="ig-m ' + (cls || '') + '" src="' + media.url + '" alt="" style="' + st + '">';
  }
  function overlays() {
    var o = '';
    var showSafe = $('ig-safe').checked && mode.safe, showCrop = $('ig-crop').checked && mode.crop;
    if (showSafe) {
      var s = mode.safe;
      if (s.t) o += '<i class="ig-z" style="top:0;left:0;right:0;height:' + s.t * 100 + '%"></i>';
      if (s.b) o += '<i class="ig-z" style="bottom:0;left:0;right:0;height:' + s.b * 100 + '%"></i>';
      if (s.r) o += '<i class="ig-z" style="top:' + s.t * 100 + '%;bottom:' + s.b * 100 + '%;right:0;width:' + s.r * 100 + '%"></i>';
    }
    if (showCrop) {
      var c = mode.crop;
      if (c[0]) o += '<i class="ig-c" style="top:0;left:0;right:0;height:' + c[0] * 100 + '%"><em>個人頁裁切</em></i><i class="ig-c" style="bottom:0;left:0;right:0;height:' + c[2] * 100 + '%"></i>';
      if (c[1]) o += '<i class="ig-c" style="top:0;bottom:0;left:0;width:' + c[3] * 100 + '%"><em>裁切</em></i><i class="ig-c" style="top:0;bottom:0;right:0;width:' + c[1] * 100 + '%"></i>';
    }
    return o;
  }
  function user() { return ($('ig-user').value || 'your.brand').replace(/[<>&"]/g, ''); }

  function render() {
    var ui = $('ig-ui').checked, u = user(), scr = $('ig-screen'), ph = $('ig-phone');
    ph.className = 'ig-phone ' + mode.kind;
    if (mode.kind === 'feed') {
      scr.innerHTML = (ui ? '<div class="ig-top"><b>' + u + '</b><span>' + ICON.heart + ICON.send + '</span></div>' : '') +
        '<div class="ig-post-hd"' + (ui ? '' : ' style="visibility:hidden"') + '><i class="ig-av"></i><b>' + u + '</b>' + ICON.more + '</div>' +
        '<div class="ig-frame" style="aspect-ratio:' + mode.r + '">' + mediaEl() + overlays() + '</div>' +
        (ui ? '<div class="ig-act"><span>' + ICON.heart + ICON.chat + ICON.send + '</span>' + ICON.mark + '</div><div class="ig-cap"><b>' + u + '</b> 貼文說明文字會出現在這裡⋯<span>更多</span><i></i><i style="width:40%"></i></div>' : '');
    } else if (mode.kind === 'reels') {
      scr.innerHTML = '<div class="ig-frame full">' + mediaEl() + overlays() +
        (ui ? '<div class="ig-rl-top"><b>Reels</b>' + ICON.cam + '</div><div class="ig-rl-side"><span>' + ICON.heart + '<small>1.2K</small></span><span>' + ICON.chat + '<small>48</small></span><span>' + ICON.rep + '<small>12</small></span><span>' + ICON.send + '</span><span>' + ICON.more + '</span></div>' +
          '<div class="ig-rl-btm"><div><i class="ig-av"></i><b>' + u + '</b><em>追蹤</em></div><p>Reels 說明文字會出現在這裡，太長會被折疊⋯</p><small>' + ICON.music + ' 原創音訊</small></div>' : '') + '</div>';
    } else {
      scr.innerHTML = '<div class="ig-frame full">' + mediaEl() + overlays() +
        (ui ? '<div class="ig-st-top"><div class="ig-prog"><i></i><i></i></div><div><i class="ig-av"></i><b>' + u + '</b><small>2 小時</small>' + ICON.more + '</div></div><div class="ig-st-btm"><span>傳送訊息</span>' + ICON.heart + ICON.send + '</div>' : '') + '</div>';
    }
    // profile view
    var TONES = ['#12303F', '#7CC5E6', '#E3F1F8', '#2A7698', '#CFE2EA', '#F1F8FB', '#4E6B78', '#A4D8F1'];
    var tiles = '';
    for (var i = 0; i < 9; i++) {
      if (i === 0 && mode.crop) { tiles += '<div class="ig-tile me">' + mediaEl('', true) + (mode.kind === 'reels' ? '<span class="ig-tile-ic">' + ICON.reel + '</span>' : '') + '</div>'; continue; }
      var t = TONES[(i * 3) % TONES.length], t2 = TONES[(i * 5 + 2) % TONES.length];
      tiles += '<div class="ig-tile ph" style="background:linear-gradient(' + (120 + i * 25) + 'deg,' + t + ',' + t2 + ')"><i style="' + ['left:18%;top:22%;width:38%;height:30%', 'left:50%;top:50%;width:30%;height:30%;border-radius:50%', 'left:14%;bottom:16%;width:72%;height:8%'][i % 3] + '"></i></div>';
    }
    var isStory = mode.kind === 'story';
    $('ig-prof').innerHTML = '<div class="ig-top"><b>' + u + '</b><span>' + ICON.plus + ICON.menu + '</span></div>' +
      '<div class="ig-ph-hd"><div class="ig-ph-av' + (isStory ? ' ring' : '') + '">' + (isStory && media ? mediaEl('ig-ring-m', true) : '') + '</div><dl><div><dt>128</dt><dd>貼文</dd></div><div><dt>2.4K</dt><dd>粉絲</dd></div><div><dt>186</dt><dd>追蹤中</dd></div></dl></div>' +
      '<div class="ig-ph-bio"><b>' + u + '</b><i></i><i style="width:55%"></i></div>' +
      '<div class="ig-ph-btn"><span>編輯個人檔案</span><span>分享個人檔案</span></div>' +
      '<div class="ig-ph-hl">' + ['', '', '', ''].map(function (_, k) { return '<span><i style="background:' + TONES[k + 1] + '"></i><small></small></span>'; }).join('') + '</div>' +
      '<div class="ig-ph-tabs"><span class="on">' + ICON.grid + '</span><span>' + ICON.reel + '</span><span>' + ICON.tag + '</span></div>' +
      '<div class="ig-grid">' + tiles + '</div>' +
      (isStory ? '<p class="ig-ph-note">限時動態會出現在大頭貼外圈，不會放進格狀。</p>' : '');
    var tile = $('ig-prof').querySelector('.me video'); if (tile) tile.currentTime = coverTime();
    // info
    var info = '<div class="ig-spec"><div><dt>建議尺寸</dt><dd>' + mode.size + ' px</dd></div>';
    if (media) {
      var r = media.w / media.h, diff = Math.abs(r - mode.r) / mode.r;
      info += '<div><dt>你的素材</dt><dd>' + media.w + ' × ' + media.h + ' px' + (media.dur ? '　·　' + media.dur.toFixed(1) + ' 秒' : '') + '</dd></div>';
      var msg;
      if (diff < 0.02) msg = '<span class="badge ok">比例剛好</span>';
      else { var cut = r > mode.r ? (1 - mode.r / r) : (1 - r / mode.r); msg = '<span class="badge mid">比例不同，' + (r > mode.r ? '左右' : '上下') + '共會裁掉約 ' + Math.round(cut * 100) + '%</span>'; }
      info += '<div><dt>比例</dt><dd>' + msg + '</dd></div>';
    }
    info += '</div><ul class="ig-tips">' + TIPS[mode.kind].map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul><p class="bf-save">紅色區域是依目前 IG 介面整理的大約位置，App 更新後可能略有不同，重要內容建議再往中間留一點空間。</p>';
    $('ig-info').innerHTML = info;
  }
  function coverTime() { return media && media.dur ? media.dur * (+$('ig-cover').value / 1000) : 0; }

  function load(file) {
    if (!file) return;
    var isV = /^video\//.test(file.type), isI = /^image\//.test(file.type);
    if (!isV && !isI) { toast('請上傳圖片或影片。'); return; }
    if (media) URL.revokeObjectURL(media.url);
    var url = URL.createObjectURL(file);
    if (isI) {
      var im = new Image(); im.onload = function () { media = { type: 'image', url: url, w: im.naturalWidth, h: im.naturalHeight }; after(file); }; im.src = url;
    } else {
      var v = document.createElement('video'); v.preload = 'metadata'; v.muted = true;
      v.onloadedmetadata = function () { media = { type: 'video', url: url, w: v.videoWidth, h: v.videoHeight, dur: v.duration }; after(file); };
      v.onerror = function () { toast('這個影片格式瀏覽器無法播放，試試 MP4。'); };
      v.src = url;
    }
  }
  function after(file) {
    $('ig-drop-t').textContent = '已載入：' + file.name;
    $('ig-drop-s').textContent = '點這裡或拖進新的檔案即可替換。';
    $('ig-cover-wrap').hidden = media.type !== 'video';
    // pick the placement that matches the file best
    var r = media.w / media.h, best = MODES.filter(function (m) { return m.kind !== 'story'; }).sort(function (a, b) { return Math.abs(a.r - r) - Math.abs(b.r - r); })[0];
    setMode(best.k);
  }
  function setMode(k) {
    mode = MODES.filter(function (m) { return m.k === k; })[0];
    [].forEach.call(document.querySelectorAll('#ig-tabs button'), function (b) { var on = b.dataset.m === k; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    render();
  }
  function toast(m) { var t = $('mk-toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('on'); }, 2200); }

  $('ig-file').addEventListener('change', function (e) { load(e.target.files[0]); e.target.value = ''; });
  var drop = $('ig-drop');
  ['dragenter', 'dragover'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('hover'); }); });
  ['dragleave', 'drop'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove('hover'); }); });
  drop.addEventListener('drop', function (e) { load(e.dataTransfer.files[0]); });
  $('ig-tabs').addEventListener('click', function (e) { var b = e.target.closest('[data-m]'); if (b) setMode(b.dataset.m); });
  ['ig-ui', 'ig-safe', 'ig-crop'].forEach(function (id) { $(id).addEventListener('change', render); });
  $('ig-user').addEventListener('input', render);
  ['ig-px', 'ig-py'].forEach(function (id) {
    $(id).addEventListener('input', function () {
      px = +$('ig-px').value; py = +$('ig-py').value;
      [].forEach.call(document.querySelectorAll('.ig-m'), function (m) { m.style.objectPosition = px + '% ' + py + '%'; });
    });
  });
  $('ig-cover').addEventListener('input', function () { var t = $('ig-prof').querySelector('.me video'); if (t) t.currentTime = coverTime(); });
  render();
})();
