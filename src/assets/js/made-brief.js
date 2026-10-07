/* MEBO MADE — Brief Note (需求整理表). Everything stays in the browser. */
(function () {
  var EMAIL = 'mebo.works@gmail.com';
  var KEY = 'mebo-brief-v1';

  var STEPS = [
    { id: 'who', nav: '你是誰', q: '先簡單介紹一下你們吧。', tip: '品牌或公司名稱，加上一兩句「現在在做什麼」就很夠了。',
      fields: [
        { k: 'name', type: 'text', label: '品牌／公司名稱', ph: '例如：美泊咖啡' },
        { k: 'intro', type: 'textarea', label: '一句話介紹', ph: '在做什麼、賣什麼、想帶給誰什麼感覺' },
        { k: 'links', type: 'text', label: '網站或社群（選填）', ph: 'https://' }
      ] },
    { id: 'why', nav: '為什麼是現在', q: '為什麼現在想做這件事？', tip: '最近發生了什麼，或一直遇到什麼問題。這部分常常比「要做幾張圖」更重要。',
      fields: [
        { k: 'whyTags', type: 'chips', label: '比較接近哪一種？（可複選）', options: ['品牌剛成立', '視覺已經不像現在的自己', '準備推出新產品／新服務', '有活動或檔期要上', '不同地方做出來的東西不一致', '使用上一直遇到問題', '其他'] },
        { k: 'why', type: 'textarea', label: '想多說一點的話', ph: '例如：品牌用了五年，客群變了，但視覺還停在剛開始的樣子。' }
      ] },
    { id: 'what', nav: '想做什麼', q: '目前大概想做什麼？', tip: '不用非常精準，知道多少就說多少。還不確定也完全沒關係。',
      fields: [
        { k: 'scope', type: 'chips', label: '可能需要的項目（可複選）', options: ['品牌識別／Logo', '品牌視覺整理', '活動主視覺', '包裝設計', '社群視覺', '網站視覺', '簡報／提案設計', '藝術指導', '課程／講座', '還不確定，想先聊聊'] },
        { k: 'scopeNote', type: 'textarea', label: '補充說明', ph: '例如：Logo 想保留原本的感覺，但希望更好用在社群和包裝上。' }
      ] },
    { id: 'have', nav: '現有資料', q: '有沒有可以先看的資料？', tip: '不需要重新做一份漂亮的簡報。有什麼就先列出來，整理得不完整也沒關係。',
      fields: [
        { k: 'assets', type: 'chips', label: '目前手上有的', options: ['Logo', '以前做過的設計', '品牌介紹', '產品照片', '社群帳號', '網站', '內部簡報', '目前都還沒有'] },
        { k: 'assetLinks', type: 'textarea', label: '連結或說明（選填）', ph: '雲端資料夾、IG、網站連結都可以' }
      ] },
    { id: 'ref', nav: '喜歡與不喜歡', q: '有沒有喜歡的參考？喜歡它的哪裡？', tip: '同一張參考，每個人注意到的地方都不一樣。比起丟很多圖片，「為什麼喜歡」更能幫助我們找到方向。',
      fields: [
        { k: 'refs', type: 'textarea', label: '參考（品牌、海報、網站、一間店、一部電影都可以）', ph: '貼上連結或簡單描述' },
        { k: 'like', type: 'textarea', label: '喜歡它的哪裡？', ph: '例如：很乾淨、照片的光線很舒服、整體讓人覺得很自在' },
        { k: 'dislike', type: 'textarea', label: '不喜歡、不想要的方向（選填）', ph: '例如：不要太可愛、不希望太商業' }
      ] },
    { id: 'time', nav: '時間與預算', q: '時間和預算大概在哪裡？', tip: '不同的預算和時間，本來就會有不同的做法。有範圍就可以，不一定要很精確。',
      fields: [
        { k: 'deadline', type: 'text', label: '希望什麼時候完成？', ph: '例如：12 月中，或「沒有特別急」' },
        { k: 'fixed', type: 'radio', label: '有沒有一定要上線的日期？', options: ['有，日期不能改', '有大概的時間', '沒有'] },
        { k: 'budget', type: 'radio', label: '預算範圍（新台幣）', options: ['5 萬以下', '5–10 萬', '10–20 萬', '20–50 萬', '50 萬以上', '還不確定，想先聊聊'] },
        { k: 'limits', type: 'textarea', label: '其他限制（選填）', ph: '尺寸、印刷方式、上架平台，或已經確定不能改的東西' }
      ] },
    { id: 'contact', nav: '聯絡方式', q: '最後，怎麼稱呼你？', tip: '只會出現在你自己的需求單上。要不要寄出，由你決定。',
      fields: [
        { k: 'person', type: 'text', label: '你的名字', ph: '' },
        { k: 'role', type: 'text', label: '職稱（選填）', ph: '例如：品牌經理' },
        { k: 'email', type: 'text', label: 'Email', ph: 'name@example.com' },
        { k: 'pref', type: 'radio', label: '比較方便的聯絡方式', options: ['Email', '電話', 'LINE', '先約線上聊聊'] }
      ] }
  ];

  var form = document.getElementById('bf-form');
  var stepsEl = document.getElementById('bf-steps');
  var bar = document.getElementById('bf-bar');
  var saveEl = document.getElementById('bf-save');
  var toastEl = document.getElementById('mk-toast');
  if (!form) return;

  var data = {};
  try { data = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { data = {}; }
  var cur = 0;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function fieldHTML(f) {
    var id = 'f-' + f.k, v = data[f.k];
    if (f.type === 'text') return '<label class="mk-field" for="' + id + '"><span>' + f.label + '</span><input class="mk-in" id="' + id + '" name="' + f.k + '" type="text" placeholder="' + esc(f.ph) + '" value="' + esc(v || '') + '"></label>';
    if (f.type === 'textarea') return '<label class="mk-field" for="' + id + '"><span>' + f.label + '</span><textarea class="mk-ta" id="' + id + '" name="' + f.k + '" placeholder="' + esc(f.ph) + '">' + esc(v || '') + '</textarea></label>';
    var multi = f.type === 'chips', arr = multi ? (v || []) : [v];
    return '<fieldset class="mk-field" style="border:0;padding:0;margin:0"><legend style="padding:0;margin-bottom:12px;font-size:12px;letter-spacing:.08em;color:#4E6B78">' + f.label + '</legend><div class="mk-chips">' +
      f.options.map(function (o, i) {
        return '<label class="mk-chip"><input type="' + (multi ? 'checkbox' : 'radio') + '" name="' + f.k + '" value="' + esc(o) + '"' + (arr.indexOf(o) > -1 ? ' checked' : '') + '><span>' + esc(o) + '</span></label>';
      }).join('') + '</div></fieldset>';
  }

  function render() {
    var html = STEPS.map(function (s, i) {
      return '<div class="bf-panel" data-i="' + i + '"><h2 class="bf-q">' + s.q + '</h2><p class="bf-tip">' + s.tip + '</p><div class="bf-body">' +
        s.fields.map(fieldHTML).join('') + '</div><div class="bf-nav">' +
        (i > 0 ? '<button type="button" class="mk-btn ghost" data-go="' + (i - 1) + '">← 上一題</button>' : '<span></span>') +
        '<button type="button" class="mk-btn" data-go="' + (i + 1) + '">' + (i === STEPS.length - 1 ? '整理成需求單 →' : '下一題 →') + '</button></div></div>';
    }).join('');
    html += '<div class="bf-panel bf-result" data-i="' + STEPS.length + '"><div id="bf-doc"></div><div class="bf-actions">' +
      '<button type="button" class="mk-btn" id="bf-mail">寄給 MEBO</button>' +
      '<button type="button" class="mk-btn ghost" id="bf-print">下載 PDF</button>' +
      '<button type="button" class="mk-btn ghost" id="bf-copy">複製文字</button>' +
      '<button type="button" class="mk-btn ghost" data-go="0">修改內容</button>' +
      '<button type="button" class="mk-btn ghost" id="bf-reset">清空重填</button></div>' +
      '<p class="bf-save">「下載 PDF」會打開列印視窗，目的地選「另存為 PDF」即可。寄給其他設計師也可以，複製文字貼到 Email 就好。</p></div>';
    form.innerHTML = html;
    stepsEl.innerHTML = STEPS.map(function (s, i) { return '<li><button type="button" data-go="' + i + '">' + s.nav + '</button></li>'; }).join('') +
      '<li><button type="button" data-go="' + STEPS.length + '">需求單</button></li>';
  }

  function collect() {
    STEPS.forEach(function (s) {
      s.fields.forEach(function (f) {
        if (f.type === 'chips') data[f.k] = [].slice.call(form.querySelectorAll('input[name="' + f.k + '"]:checked')).map(function (x) { return x.value; });
        else if (f.type === 'radio') { var r = form.querySelector('input[name="' + f.k + '"]:checked'); data[f.k] = r ? r.value : ''; }
        else { var el = form.querySelector('[name="' + f.k + '"]'); data[f.k] = el ? el.value.trim() : ''; }
      });
    });
    try { localStorage.setItem(KEY, JSON.stringify(data)); saveEl.textContent = '已自動儲存在這台裝置的瀏覽器。'; } catch (e) { saveEl.textContent = ''; }
  }

  function filled(i) {
    return STEPS[i].fields.some(function (f) { var v = data[f.k]; return Array.isArray(v) ? v.length : !!v; });
  }

  function show(i) {
    collect();
    cur = Math.max(0, Math.min(STEPS.length, i));
    [].forEach.call(form.querySelectorAll('.bf-panel'), function (p) { p.classList.toggle('on', +p.dataset.i === cur); });
    [].forEach.call(stepsEl.querySelectorAll('button'), function (b) {
      var n = +b.dataset.go;
      b.classList.toggle('is-cur', n === cur);
      b.classList.toggle('done', n < STEPS.length && filled(n));
      if (n === cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    bar.style.width = (cur / STEPS.length * 100) + '%';
    if (cur === STEPS.length) buildDoc();
    var top = document.getElementById('bf').getBoundingClientRect().top + window.scrollY - 90;
    if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
    var first = form.querySelector('.bf-panel.on input, .bf-panel.on textarea');
    if (first && cur < STEPS.length && i !== 0) first.focus({ preventScroll: true });
  }

  function val(k) { var v = data[k]; return Array.isArray(v) ? v.join('、') : (v || ''); }
  function sections() {
    return [
      ['品牌／公司', [val('name'), val('intro'), val('links')].filter(Boolean).join('\n')],
      ['為什麼是現在', [val('whyTags'), val('why')].filter(Boolean).join('\n')],
      ['想做的項目', [val('scope'), val('scopeNote')].filter(Boolean).join('\n')],
      ['現有資料', [val('assets'), val('assetLinks')].filter(Boolean).join('\n')],
      ['參考', val('refs')],
      ['喜歡的地方', val('like')],
      ['不想要的方向', val('dislike')],
      ['希望完成時間', [val('deadline'), val('fixed') ? '上線日期：' + val('fixed') : ''].filter(Boolean).join('\n')],
      ['預算範圍', val('budget')],
      ['其他限制', val('limits')],
      ['聯絡人', [[val('person'), val('role')].filter(Boolean).join('／'), val('email'), val('pref') ? '偏好：' + val('pref') : ''].filter(Boolean).join('\n')]
    ];
  }
  function today() { var d = new Date(); return d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0'); }

  function buildDoc() {
    var title = (val('name') || '我的品牌') + '｜設計需求整理';
    document.getElementById('bf-doc').innerHTML = '<article class="bf-doc"><div class="bf-doc-hd"><b>BRIEF NOTE</b><span>' + today() + '　·　MADE BY MEBO DESIGN STUDIO</span></div><h2>' + esc(title) + '</h2><dl>' +
      sections().map(function (s) { return '<div class="bf-sec"><dt>' + s[0] + '</dt><dd' + (s[1] ? '' : ' class="empty"') + '>' + esc(s[1] || '尚未填寫') + '</dd></div>'; }).join('') + '</dl></article>';
  }

  function asText() {
    return (val('name') || '我的品牌') + '｜設計需求整理（' + today() + '）\n\n' +
      sections().filter(function (s) { return s[1]; }).map(function (s) { return '【' + s[0] + '】\n' + s[1]; }).join('\n\n');
  }

  function toast(m) { toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.classList.remove('on'); }, 2200); }

  render();
  form.addEventListener('input', function () { collect(); });
  form.addEventListener('change', function () { collect(); });
  document.addEventListener('click', function (e) {
    var g = e.target.closest('[data-go]');
    if (g && (form.contains(g) || stepsEl.contains(g))) { e.preventDefault(); show(+g.dataset.go); return; }
    if (e.target.id === 'bf-print') { collect(); buildDoc(); window.print(); }
    if (e.target.id === 'bf-copy') {
      var txt = asText();
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { toast('已複製，可以貼到 Email 或訊息裡。'); }, function () {
        var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('已複製。'); } catch (er) { toast('複製失敗，請手動選取文字。'); } ta.remove();
      });
    }
    if (e.target.id === 'bf-mail') {
      var body = asText() + '\n\n—\n這份需求單由 MEBO 需求整理表產生 https://mebostudio.github.io/made/brief/';
      if (body.length > 1800) { body = body.slice(0, 1700) + '\n…（內容較長，完整需求單請見附件 PDF）'; toast('內容較長，建議另外附上 PDF。'); }
      location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('合作詢問｜' + (val('name') || '設計需求')) + '&body=' + encodeURIComponent(body);
    }
    if (e.target.id === 'bf-reset') {
      if (!e.target.dataset.confirm) { e.target.dataset.confirm = '1'; e.target.textContent = '再按一次確認清空'; return; }
      data = {}; try { localStorage.removeItem(KEY); } catch (er) {}
      render(); show(0); toast('已清空。');
    }
  });
  show(0);
})();
