/* Veri Bilimi · Bölüm 1-3 araçları: 5V radarı, veri kalitesi avı, etiket kuralı, disiplin kesişimi,
   veri inşası (özet seçimi), etken madde eşleştirme, eksik veri simülatörü, Bayes güncelleme, yöntem seçici. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function svgEl(name, attrs, parent) { var e = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (parent) parent.appendChild(e); return e; }
  function pg(btns, i) { btns.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); }); }
  function fmt(n) { return Math.round(n).toLocaleString('tr-TR'); }

  /* ---------- 1) Beş V radarı ---------- */
  var rv = $('fivev');
  if (rv) {
    var AX = ['Hacim', 'Hız', 'Çeşitlilik', 'Doğruluk', 'Değer'];
    var PR = [
      ['Sosyal medya akışı', [5, 5, 4, 2, 3]], ['Hastane kayıtları', [3, 2, 5, 4, 5]], ['Borsa fiyat akışı', [4, 5, 2, 4, 5]], ['Uydu görüntüleri', [5, 3, 3, 3, 4]], ['Akıllı sayaç', [4, 4, 1, 3, 3]]
    ];
    var cur = PR[0][1].slice();
    var chips = el('div', 'chips'), bt = [];
    PR.forEach(function (p, i) { var b = el('button', 'chip', p[0]); b.type = 'button'; b.addEventListener('click', function () { cur = p[1].slice(); pg(bt, i); sync(); }); chips.appendChild(b); bt.push(b); });
    rv.appendChild(chips); pg(bt, 0);
    var wrap = el('div', 'v5-wrap'); rv.appendChild(wrap);
    var left = el('div'), right = el('div'); wrap.appendChild(left); wrap.appendChild(right);
    var svg = svgEl('svg', { viewBox: '0 0 300 280', 'class': 'v5-svg', role: 'img', 'aria-label': 'Beş V radar grafiği' }); left.appendChild(svg);
    var cx = 150, cy = 140, R = 100;
    function pt(i, v) { var a = -Math.PI / 2 + i * 2 * Math.PI / 5; return [cx + Math.cos(a) * R * v / 5, cy + Math.sin(a) * R * v / 5]; }
    for (var lv = 1; lv <= 5; lv++) { svgEl('polygon', { points: AX.map(function (_, i) { return pt(i, lv).join(','); }).join(' '), 'class': 'd-line', style: 'stroke-width:1;opacity:.5' }, svg); }
    AX.forEach(function (n, i) { var p = pt(i, 5.9); svgEl('line', { x1: cx, y1: cy, x2: pt(i, 5)[0], y2: pt(i, 5)[1], 'class': 'd-line', style: 'stroke-width:1;opacity:.5' }, svg); var t = svgEl('text', { x: p[0], y: p[1] + 4, 'class': 'd-txt d-c' }, svg); t.textContent = n; });
    var poly = svgEl('polygon', { 'class': 'd-brand', 'fill-opacity': '.45' }, svg);
    var sl = []; AX.forEach(function (n, i) {
      var r = el('div', 'slider-row'); r.innerHTML = '<label>' + n + '</label><input type="range" min="1" max="5" step="1" value="' + cur[i] + '"><output>' + cur[i] + '</output>';
      var inp = r.querySelector('input'); inp.addEventListener('input', function () { cur[i] = +inp.value; pg(bt, -1); draw(); }); right.appendChild(r); sl.push(inp);
    });
    var hint = el('div', 'quad-info'); rv.appendChild(hint);
    function sync() { sl.forEach(function (s, i) { s.value = cur[i]; }); draw(); }
    function draw() {
      poly.setAttribute('points', cur.map(function (v, i) { return pt(i, v).join(','); }).join(' '));
      right.querySelectorAll('output').forEach(function (o, i) { o.textContent = cur[i]; });
      var h = [];
      if (cur[0] >= 4) h.push('<b>Hacim yüksek:</b> dağıtık depolama ve dağıtık hesaplama gerekir.');
      if (cur[1] >= 4) h.push('<b>Hız yüksek:</b> veri geldiği anda işlenmeli; akış işleme platformları (ör. Kafka, Flink) devreye girer, çünkü değer zamanla düşer.');
      if (cur[2] >= 4) h.push('<b>Çeşitlilik yüksek:</b> yapılandırılmış, yarı yapılandırılmış ve yapılandırılmamış veriyi (metin, görüntü, kayıt) birleştirecek esnek bir veri entegrasyonu gerekir.');
      if (cur[3] <= 2) h.push('<b>Doğruluk düşük:</b> veri güvenilir değil; temizleme, doğrulama ve kalite kontrolü olmadan sonuçlara güvenme.');
      if (cur[4] >= 4) h.push('<b>Değer yüksek:</b> bu veriden elde edilecek içgörü kararları iyileştirebilir; yatırımı hak eder.');
      if (!h.length) h.push('Bu profilde belirgin bir uç yok; maliyet ve değer dengesini ayrıca değerlendir.');
      hint.innerHTML = '<div class="kicker">Bu profil ne gerektirir?</div><ul>' + h.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>';
    }
    draw();
  }

  /* ---------- 2) Veri kalitesi avı ---------- */
  var dq = $('dqgame');
  if (dq) {
    var cols = ['Ad', 'Yaş', 'Şehir', 'Kayıt tarihi', 'Aylık gelir (TL)'];
    var rows = [
      ['Ayşe', '21', 'İstanbul', '2024-03-05', '18.500'],
      ['Mehmet', '217', 'Ankara', '2024-03-06', '22.000'],
      ['Zeynep', '', 'İzmir', '2024-03-07', '19.000'],
      ['Can', '24', 'istanbul', '2024-03-07', '17.000'],
      ['Elif', '23', 'Ankara', '2024-03-08', '-500'],
      ['Burak', '30', 'İzmir', '09.03.2024', '24.000'],
      ['Deniz', '27', 'İstanbul', '2024-03-10', '21.000']
    ];
    var ISS = { '1,1': ['doğruluk', 'Yaş 217 olamaz: değer gerçek dünyayı yansıtmıyor (doğruluk hatası).'], '2,1': ['eksiksizlik', 'Yaş hücresi boş: eksik veri (eksiksizlik sorunu).'], '3,2': ['tutarlılık', '“istanbul” ile “İstanbul” aynı şehir ama farklı yazılmış; gruplamada ayrı sayılır (tutarlılık sorunu).'], '4,4': ['doğruluk', 'Negatif gelir (−500) olağan değil: büyük olasılıkla giriş hatası (doğruluk).'], '5,3': ['tutarlılık', 'Tarih biçimi diğerlerinden (YYYY-AA-GG) farklı: GG.AA.YYYY. Sistemler arası uyumsuzluk (tutarlılık).'] };
    var flagged = {};
    dq.appendChild(el('p', 'mm-note', 'Sorunlu olduğunu düşündüğün hücrelere tıkla, sonra “Kontrol et” de. Toplam 5 sorun var: doğruluk, eksiksizlik ve tutarlılık türlerinde.'));
    var tw = el('div', 'scroll-x'), tb = '<table class="cmp dq-tbl"><thead><tr>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (r, i) { tb += '<tr>' + r.map(function (v, j) { return '<td><button type="button" class="dq-c" data-k="' + i + ',' + j + '">' + (v === '' ? '∅' : v) + '</button></td>'; }).join('') + '</tr>'; });
    tw.innerHTML = tb + '</tbody></table>'; dq.appendChild(tw);
    var bar = el('div', 'bar'), chk = el('button', 'btn primary', 'Kontrol et'), rs = el('button', 'btn', 'Sıfırla'); chk.type = rs.type = 'button'; bar.appendChild(chk); bar.appendChild(rs); dq.appendChild(bar);
    var out = el('div', 'status'); dq.appendChild(out);
    tw.addEventListener('click', function (e) { var b = e.target.closest('.dq-c'); if (!b) return; var k = b.getAttribute('data-k'); flagged[k] = !flagged[k]; b.classList.toggle('flag', !!flagged[k]); });
    chk.addEventListener('click', function () {
      var found = 0, wrong = 0, miss = [];
      dq.querySelectorAll('.dq-c').forEach(function (b) { var k = b.getAttribute('data-k'); b.classList.remove('right', 'wrong'); if (flagged[k] && ISS[k]) { found++; b.classList.add('right'); } else if (flagged[k]) { wrong++; b.classList.add('wrong'); } else if (ISS[k]) miss.push(k); });
      var html = '<b>' + found + ' / 5 sorunu buldun</b>' + (wrong ? ' · ' + wrong + ' temiz hücreyi yanlışlıkla işaretledin' : '') + '.';
      if (miss.length) { html += '<p class="mm-note">Kaçırdıkların:</p><ul>' + miss.map(function (k) { return '<li><b>' + ISS[k][0] + ':</b> ' + ISS[k][1] + '</li>'; }).join('') + '</ul>'; }
      else if (found === 5) html += '<p>Tüm sorunları buldun. Bulduklarının türleri: ' + Object.keys(ISS).map(function (k) { return ISS[k][0]; }).join(', ') + '.</p>';
      out.innerHTML = html;
    });
    rs.addEventListener('click', function () { flagged = {}; dq.querySelectorAll('.dq-c').forEach(function (b) { b.classList.remove('flag', 'right', 'wrong'); }); out.innerHTML = ''; });
  }

  /* ---------- 3) Etiket kuralı: gözlem teori yüklüdür ---------- */
  var lr = $('labelrule');
  if (lr) {
    var C = [[5, 1, 0, '“Çok hızlı geldi, teşekkürler.”'], [4, 0, 0, '“Fena değil.”'], [5, 1, 0, '“Harika!”'], [4, 1, 1, '“Güzel ama paket ezikti.”'], [3, 1, 0, '“İdare eder.”'], [5, 0, 0, '“Mükemmel, bir daha almam gerek.”'], [2, 0, 1, '“Geç geldi.”'], [4, 1, 0, '“İyi ürün.”']];
    var rules = [['A: puan ≥ 4', function (c) { return c[0] >= 4; }], ['B: puan ≥ 4 ve tekrar sipariş verdi', function (c) { return c[0] >= 4 && c[1]; }], ['C: yorumda şikâyet yok', function (c) { return !c[2]; }]];
    var chips2 = el('div', 'chips'), b2 = []; var tbl = el('div', 'scroll-x'), res = el('div', 'quad-info');
    rules.forEach(function (r, i) { var b = el('button', 'chip', r[0]); b.type = 'button'; b.addEventListener('click', function () { pg(b2, i); draw(i); }); chips2.appendChild(b); b2.push(b); });
    lr.appendChild(el('p', 'mm-note', 'Aynı sekiz müşteri yorumu. “Mutlu müşteri”yi nasıl tanımlarsan sonuç değişir. Kuralı seç:')); lr.appendChild(chips2); lr.appendChild(tbl); lr.appendChild(res);
    function draw(i) {
      var n = 0, h = '<table class="cmp"><thead><tr><th>Yorum</th><th>Puan</th><th>Tekrar sipariş</th><th>Şikâyet</th><th>Mutlu?</th></tr></thead><tbody>';
      C.forEach(function (c) { var ok = rules[i][1](c); if (ok) n++; h += '<tr class="' + (ok ? 'cur-row' : '') + '"><td>' + c[3] + '</td><td>' + c[0] + '</td><td>' + (c[1] ? 'evet' : 'hayır') + '</td><td>' + (c[2] ? 'var' : 'yok') + '</td><td><b>' + (ok ? 'evet' : 'hayır') + '</b></td></tr>'; });
      tbl.innerHTML = h + '</tbody></table>';
      res.innerHTML = '<b>' + rules[i][0] + '</b> kuralına göre mutlu müşteri: <b>' + n + ' / ' + C.length + '</b> (%' + Math.round(n / C.length * 100) + '). Aynı veri, farklı tanım, farklı sonuç: gözlemler daima önceden seçilmiş kategorilere göre toplanır ve etiketlenir.';
    }
    b2[0].click();
  }

  /* ---------- 4) Disiplin kesişimi ---------- */
  var vn = $('venn');
  if (vn) {
    var D = [
      { n: 'İstatistik', x: 130, y: 120, d: 'Örneklemden popülasyona genelleme, hipotez testi, güven aralığı, regresyon. Veri biliminin “çıkarım” refleksi buradan gelir.' },
      { n: 'Bilgisayar bilimi', x: 250, y: 120, d: 'Algoritmalar, veri yapıları, karmaşıklık, dağıtık hesaplama ve ölçeklenebilirlik. Büyük veriyi işlenebilir kılan altyapı.' },
      { n: 'Alan uzmanlığı', x: 190, y: 215, d: 'Verinin neyi temsil ettiğini, hangi sorunun sorulması gerektiğini ve sonucun sahada anlamını bilmek. Doğru özellikler ve yorum buradan gelir.' }
    ];
    var s2 = svgEl('svg', { viewBox: '0 0 380 310', 'class': 'v5-svg', role: 'img', 'aria-label': 'Veri biliminin üç disiplinin kesişimi' }); var cs = ['d-brand', 'd-warn', 'd-ok'], cl = [];
    D.forEach(function (d, i) { var c = svgEl('circle', { cx: d.x, cy: d.y, r: 85, 'class': cs[i] + ' nest-c', 'fill-opacity': '.45', tabindex: 0, role: 'button', 'aria-label': d.n }, s2); c.addEventListener('click', function () { show(i); }); c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); } }); cl.push(c); });
    [[95, 95, 'İstatistik'], [285, 95, 'Bilgisayar b.'], [190, 270, 'Alan uzmanlığı']].forEach(function (t) { var x = svgEl('text', { x: t[0], y: t[1], 'class': 'd-txt d-c', 'pointer-events': 'none' }, s2); x.textContent = t[2]; });
    var vs = svgEl('text', { x: 190, y: 160, 'class': 'd-txt d-c', 'pointer-events': 'none', style: 'font-weight:800' }, s2); vs.textContent = 'VERİ BİLİMİ';
    var wr = el('div', 'nest-wrap'); wr.appendChild(s2); var inf = el('div', 'quad-info'); wr.appendChild(inf); vn.appendChild(wr);
    function show(i) { cl.forEach(function (c, k) { c.style.strokeWidth = k === i ? '5' : ''; }); inf.innerHTML = '<div class="kicker">Dairelere tıkla</div><h3>' + D[i].n + '</h3><p>' + D[i].d + '</p><p class="mm-note">Ortadaki kesişim bölgesi veri bilimidir: üçü birlikte olmadan ya yanlış soru sorulur, ya yanlış çıkarım yapılır ya da çözüm ölçeklenmez.</p>'; }
    show(0);
  }

  /* ---------- 5) Veri nasıl inşa edilir (hava kalitesi) ---------- */
  var hv = $('hamveri');
  if (hv) {
    var SN = [['Merkez-1', [62, 70, 81, 75, 68, 59], 1], ['Merkez-2', [58, 66, 77, 72, 64, 55], 1], ['Park', [22, 25, 30, 28, 24, 20], 0], ['Sahil', [18, 20, 26, 24, 19, 16], 0], ['Sanayi', [45, 52, 64, 60, 50, 42], 0]];
    var st = { scope: 'all', agg: 'mean' };
    function row(label, opts, key) { var r = el('div', 'chips'); r.appendChild(el('span', 'il-lbl', label)); var bs = []; opts.forEach(function (o) { var b = el('button', 'chip', o[1]); b.type = 'button'; b.setAttribute('aria-pressed', st[key] === o[0] ? 'true' : 'false'); b.addEventListener('click', function () { st[key] = o[0]; bs.forEach(function (x, k) { x.setAttribute('aria-pressed', opts[k][0] === st[key] ? 'true' : 'false'); }); draw(); }); r.appendChild(b); bs.push(b); }); hv.appendChild(r); }
    hv.appendChild(el('p', 'mm-note', 'Bir şehrin hava kalitesi örnek verisi (kirlilik endeksi, 6 saatlik ölçüm). Kabul sınırı: 50. İki kararını değiştir ve sonucu izle.'));
    var tw2 = el('div', 'scroll-x'); var t = '<table class="cmp"><thead><tr><th>Sensör</th><th>Konum</th><th>Ölçümler</th></tr></thead><tbody>'; SN.forEach(function (s) { t += '<tr><td>' + s[0] + '</td><td>' + (s[2] ? 'şehir merkezi' : 'merkez dışı') + '</td><td>' + s[1].join(' · ') + '</td></tr>'; }); tw2.innerHTML = t + '</tbody></table>'; hv.appendChild(tw2);
    row('Hangi sensörler?', [['all', 'Tüm şehir (5 sensör)'], ['center', 'Yalnızca merkez (2 sensör)']], 'scope');
    row('Nasıl özetlenir?', [['mean', 'Ortalama'], ['max', 'En yüksek değer']], 'agg');
    var vd = el('div', 'quad-info'); hv.appendChild(vd);
    function draw() {
      var use = SN.filter(function (s) { return st.scope === 'all' || s[2]; }), vals = [].concat.apply([], use.map(function (s) { return s[1]; }));
      var v = st.agg === 'mean' ? vals.reduce(function (a, b) { return a + b; }, 0) / vals.length : Math.max.apply(null, vals), bad = v > 50;
      vd.innerHTML = '<p>Sonuç: <b>' + (Math.round(v * 10) / 10).toString().replace('.', ',') + '</b> → <b class="' + (bad ? 'no' : 'yes') + '">' + (bad ? 'hava kötü' : 'hava iyi') + '</b></p><p class="mm-note">Aynı ham ölçümlerden dört farklı karar çıkarabilirsin. Hangi sensörlerin seçileceği, nasıl özetleneceği, hangi eşiğin kullanılacağı insan kararıdır; bu yüzden “ham veri” aslında inşa edilmiş bir üründür.</p>';
    }
    draw();
  }

  /* ---------- 6) Etken madde eşleştirme (alan uzmanlığı) ---------- */
  var dm = $('drugmatch');
  if (dm) {
    var OPT = ['parasetamol', 'ibuprofen', 'asetilsalisilik asit', 'flurbiprofen'];
    var E = [['parol 500 mg', 0], ['Parasetamol', 0], ['Nurofen', 1], ['ibuprofen 400', 1], ['ASPİRİN 100', 2], ['asetilsalisilik asit', 2], ['Majezik', 3], ['PAROL', 0]];
    dm.appendChild(el('p', 'mm-note', 'Bir hastanın kayıtlarında ilaç adları farklı yazılmış. Hangi etken maddeye karşılık geldiklerini seç. Teknik beceri yetmez: ilaçları bilmek gerekir.'));
    var table = '<div class="scroll-x"><table class="cmp"><thead><tr><th>Kayıtlı ad</th><th>Etken madde</th><th></th></tr></thead><tbody>';
    E.forEach(function (e, i) { table += '<tr><td><b>' + e[0] + '</b></td><td><select data-i="' + i + '"><option value="">seç…</option>' + OPT.map(function (o, k) { return '<option value="' + k + '">' + o + '</option>'; }).join('') + '</select></td><td class="dm-m"></td></tr>'; });
    dm.insertAdjacentHTML('beforeend', table + '</tbody></table></div>');
    var bd = el('button', 'btn primary', 'Kontrol et'); bd.type = 'button'; var od = el('div', 'status'); dm.appendChild(bd); dm.appendChild(od);
    bd.addEventListener('click', function () { var ok = 0; dm.querySelectorAll('select').forEach(function (s) { var i = +s.getAttribute('data-i'), m = s.parentNode.nextSibling; var right = s.value !== '' && +s.value === E[i][1]; if (right) ok++; m.innerHTML = s.value === '' ? '' : right ? '<span class="yes">✓</span>' : '<span class="no">✗ doğrusu ' + OPT[E[i][1]] + '</span>'; }); od.innerHTML = '<b>' + ok + ' / ' + E.length + '</b> doğru. Aynı ilacın birçok yazımı vardır (marka adı, jenerik ad, büyük/küçük harf). Bunları birleştirmek alan bilgisi ister.'; });
  }

  /* ---------- 7) Eksik veri simülatörü ---------- */
  var ms = $('missim');
  if (ms) {
    function lcg(seed) { var s = seed; return function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
    var r = lcg(42), N = 60, P = [];
    for (var i = 0; i < N; i++) { var age = 20 + Math.floor(r() * 41); var inc = Math.round((8000 + 300 * (age - 20) + (r() - 0.5) * 8000) / 100) * 100; P.push({ age: age, inc: inc, u: r() }); }
    var mean = function (a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; };
    var sorted = P.map(function (p) { return p.inc; }).sort(function (a, b) { return a - b; }), med = sorted[N / 2];
    var tM = mean(P.map(function (p) { return p.inc; }));
    var MECH = { mcar: ['MCAR: tamamen rastgele eksik', function () { return 0.3; }, 'Eksiklik hiçbir şeye bağlı değil; yaklaşık %30 kişi rastgele yanıt vermemiş.'], mar: ['MAR: gözlenen değişkene bağlı eksik', function (p) { return p.age < 35 ? 0.6 : 0.1; }, 'Gelir sorusunu genç katılımcılar daha sık boş bırakmış (eksiklik yaşa bağlı, gelire doğrudan değil).'], mnar: ['MNAR: değerin kendisine bağlı eksik', function (p) { return p.inc >= med ? 0.6 : 0.1; }, 'Geliri yüksek olanlar bu soruyu daha sık boş bırakmış (eksiklik, eksik olan değerin kendisine bağlı).'] };
    var mech = 'mcar';
    var chips3 = el('div', 'chips'), b3 = [];
    Object.keys(MECH).forEach(function (k, i) { var b = el('button', 'chip', MECH[k][0]); b.type = 'button'; b.addEventListener('click', function () { mech = k; pg(b3, i); draw(); }); chips3.appendChild(b); b3.push(b); });
    ms.appendChild(el('p', 'mm-note', '60 kişilik örnek veri (yaş ve aylık gelir). Gerçek ortalama gelir sabittir; sen eksikliğin nasıl oluştuğunu seç ve üç yöntemin tahminine bak.')); ms.appendChild(chips3); pg(b3, 0);
    var desc = el('p', 'mm-note'), svg2 = svgEl('svg', { viewBox: '0 0 560 190', 'class': 'diagram', role: 'img', 'aria-label': 'Gerçek ortalama ile yöntemlerin tahminleri' }), tx = el('div', 'quad-info');
    ms.appendChild(desc); ms.appendChild(svg2); ms.appendChild(tx);
    function draw() {
      var f = MECH[mech][1], obs = P.filter(function (p) { return p.u >= f(p); }), miss = N - obs.length;
      var om = mean(obs.map(function (p) { return p.inc; })), ma = mean(obs.map(function (p) { return p.age; })), sxy = 0, sxx = 0;
      obs.forEach(function (p) { sxy += (p.age - ma) * (p.inc - om); sxx += (p.age - ma) * (p.age - ma); });
      var b = sxy / sxx, a0 = om - b * ma, imp = P.map(function (p) { return p.u >= f(p) ? p.inc : a0 + b * p.age; }), rm = mean(imp);
      desc.innerHTML = MECH[mech][2] + ' <b>' + miss + ' / ' + N + '</b> kişinin geliri eksik.';
      svg2.innerHTML = '';
      var items = [['Gerçek ortalama', tM, 'd-ok'], ['Silme (listwise)', om, 'd-warn'], ['Ortalama ile doldurma', om, 'd-box'], ['Regresyonla doldurma (yaşa göre)', rm, 'd-brand']];
      var lo = 11000, hi = 17000; function X(v) { return 190 + (v - lo) / (hi - lo) * 360; }
      items.forEach(function (it, i) { var y = 14 + i * 42; var t = svgEl('text', { x: 4, y: y + 18, 'class': 'd-sm' }, svg2); t.textContent = it[0]; svgEl('rect', { x: 190, y: y, width: Math.max(2, X(it[1]) - 190), height: 28, rx: 6, 'class': it[2] }, svg2); var v = svgEl('text', { x: X(it[1]) + 6, y: y + 19, 'class': 'd-txt' }, svg2); v.textContent = fmt(it[1]) + ' TL'; });
      svgEl('line', { x1: X(tM), y1: 4, x2: X(tM), y2: 180, 'class': 'd-dash' }, svg2);
      var bias = function (v) { var d = v - tM; return (d >= 0 ? '+' : '−') + fmt(Math.abs(d)) + ' TL'; };
      var msg = { mcar: '<b>MCAR:</b> eksiklik rastgele olduğu için silme, tahmini neredeyse bozmaz (sapma ' + bias(om) + '); ama örnek küçülür ve belirsizlik artar.', mar: '<b>MAR:</b> eksiklik yaşa bağlıyken silme tahmini saptırır (genç, düşük gelirliler eksik olduğundan ' + bias(om) + '). Yaşı kullanan koşullu yöntem (regresyonla doldurma) sapmayı büyük ölçüde giderir (' + bias(rm) + ').', mnar: '<b>MNAR:</b> eksiklik gelirin kendisine bağlı. Silme, yüksek gelirleri kaybettiği için aşağı sapar (' + bias(om) + '). Yaşa göre doldurma da tam düzeltemez (' + bias(rm) + '). Bu durumda imputasyon yerine <b>sınırlılığı açıkça beyan etmek</b> daha dürüsttür.' };
      tx.innerHTML = '<div class="kicker">Ne görüyoruz?</div><p>' + msg[mech] + '</p><p class="mm-note">Ortalama ile doldurma tahmini değiştirmez (silmeyle aynı ortalama), ama dağılımın yayılımını yapay biçimde küçültür.</p>';
    }
    draw();
  }

  /* ---------- 8) Bayes güncelleme ---------- */
  var by = $('bayes');
  if (by) {
    var PRI = [['Bilgisiz (Beta 1,1)', 1, 1], ['İyimser (Beta 8,2)', 8, 2], ['Karamsar (Beta 2,8)', 2, 8]];
    var pri = 0;
    var chips4 = el('div', 'chips'), b4 = [];
    PRI.forEach(function (p, i) { var b = el('button', 'chip', p[0]); b.type = 'button'; b.addEventListener('click', function () { pri = i; pg(b4, i); draw(); }); chips4.appendChild(b); b4.push(b); });
    by.appendChild(el('p', 'mm-note', 'Bir testin doğru çıkma olasılığı θ bilinmiyor. Önsel inancını seç, sonra veri ekle: n denemede k doğru.')); by.appendChild(chips4); pg(b4, 0);
    var r1 = el('div', 'slider-row'); r1.innerHTML = '<label>Deneme sayısı (n)</label><input id="bn" type="range" min="0" max="60" value="10"><output id="bno">10</output>';
    var r2 = el('div', 'slider-row'); r2.innerHTML = '<label>Doğru sayısı (k)</label><input id="bk" type="range" min="0" max="10" value="7"><output id="bko">7</output>';
    by.appendChild(r1); by.appendChild(r2);
    var sv = svgEl('svg', { viewBox: '0 0 560 220', 'class': 'diagram', role: 'img', 'aria-label': 'Önsel ve sonsal dağılım' }); by.appendChild(sv);
    var bi = el('div', 'quad-info'); by.appendChild(bi);
    function lbeta(a, b) { function lg(x) { var c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5], y = x, t = x + 5.5; t -= (x + 0.5) * Math.log(t); var s = 1.000000000190015; for (var j = 0; j < 6; j++) s += c[j] / ++y; return -t + Math.log(2.5066282746310005 * s / x); } return lg(a) + lg(b) - lg(a + b); }
    function pdf(a, b, x) { if (x <= 0 || x >= 1) return 0; return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - lbeta(a, b)); }
    function draw() {
      var n = +$('bn').value, kmax = n; var kin = $('bk'); kin.max = n; if (+kin.value > n) kin.value = n; var k = +kin.value;
      $('bno').textContent = n; $('bko').textContent = k;
      var a0 = PRI[pri][1], b0 = PRI[pri][2], a1 = a0 + k, b1 = b0 + (n - k);
      var xs = []; for (var i = 1; i < 200; i++) xs.push(i / 200);
      var p0 = xs.map(function (x) { return pdf(a0, b0, x); }), p1 = xs.map(function (x) { return pdf(a1, b1, x); }), mx = Math.max.apply(null, p0.concat(p1)) * 1.1;
      sv.innerHTML = '';
      svgEl('line', { x1: 40, y1: 190, x2: 540, y2: 190, 'class': 'd-line' }, sv);
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { var t = svgEl('text', { x: 40 + v * 500, y: 208, 'class': 'd-sm d-c' }, sv); t.textContent = v; });
      function line(arr, cls) { svgEl('polyline', { points: arr.map(function (v, i) { return (40 + xs[i] * 500) + ',' + (190 - v / mx * 170); }).join(' '), 'class': cls, fill: 'none' }, sv); }
      line(p0, 'd-dash'); line(p1, 'd-line-brand');
      var l1 = svgEl('text', { x: 46, y: 22, 'class': 'd-sm' }, sv); l1.textContent = '- - önsel inanç';
      var l2 = svgEl('text', { x: 150, y: 22, 'class': 'd-txt', style: 'fill:var(--brand)' }, sv); l2.textContent = '— sonsal (veriden sonra)';
      var cum = 0, lo = 0, hi = 1, tot = p1.reduce(function (a, b) { return a + b; }, 0), got = false; p1.forEach(function (v, i) { cum += v / tot; if (cum >= 0.05 && lo === 0) lo = xs[i]; if (cum >= 0.95 && !got) { hi = xs[i]; got = true; } });
      bi.innerHTML = '<p>Önsel ortalama: <b>' + (a0 / (a0 + b0)).toFixed(2).replace('.', ',') + '</b> → Sonsal ortalama: <b>' + (a1 / (a1 + b1)).toFixed(2).replace('.', ',') + '</b> · %90 aralığı: <b>' + lo.toFixed(2).replace('.', ',') + ' – ' + hi.toFixed(2).replace('.', ',') + '</b></p><p class="mm-note">Veri azken sonuç önsel inanca çok bağlıdır; n büyüdükçe farklı önseller aynı sonuca yaklaşır. İşte bu yüzden öncel seçimine duyarlılık analizi yapılır: önseli değiştir, sonuç ne kadar oynuyor?</p>';
    }
    $('bn').addEventListener('input', draw); $('bk').addEventListener('input', draw); draw();
  }

  /* ---------- 9) Yöntem seçici ---------- */
  var mp = $('methodpick');
  if (mp) {
    var S = [
      { q: 'Bir şehirde 5.000 kişinin ev sahibi olma oranını ve ortalama gelirini karşılaştırmak istiyorsun.', a: 'Nicel', why: 'Ölçülebilir değişkenler (oran, gelir), genelleme ve istatistiksel karşılaştırma isteniyor: anket gibi nicel yöntemler.' },
      { q: 'Evden çalışmaya geçen çalışanların “bunu nasıl deneyimledikleri”ni derinlemesine anlamak istiyorsun.', a: 'Nitel', why: 'Deneyim, algı ve anlam isteniyor; görüşme ve gözlem gibi esnek nitel yöntemler uygundur.' },
      { q: 'Bir uygulamada kullanım süresini (log) hem sayısal olarak hem de kullanıcıların nedenlerini sorarak incelemek istiyorsun.', a: 'Karma', why: 'Sayısal desen (ne oluyor) ve nedenler (neden oluyor) birleştiriliyor: karma yöntemler birbirini tamamlar ve “fazladan değer” üretir.' },
      { q: 'Bir ilçedeki yaşlıların dijital becerilerini ölçüp ayrıca onlarla birlikte çözüm tasarlamak istiyorsun; yaşlılar süreçte karar verici olacak.', a: 'Karma', why: 'Ölçüm (nicel) ve ortak üretim/deneyim (nitel) birlikte kullanılıyor; katılımcı yöntemler genellikle karma formatlara elverişlidir.' }
    ];
    var OP = ['Nicel', 'Nitel', 'Karma'], i2 = 0, score = 0, bx = el('div', 'quad-info'); mp.appendChild(bx);
    function rend() {
      if (i2 >= S.length) { bx.innerHTML = '<h3>Bitti: ' + score + ' / ' + S.length + '</h3><button class="btn primary" id="mpre" type="button">Baştan</button>'; $('mpre').addEventListener('click', function () { i2 = 0; score = 0; rend(); }); return; }
      var s = S[i2]; bx.innerHTML = '<div class="kicker">Senaryo ' + (i2 + 1) + ' / ' + S.length + '</div><p><b>' + s.q + '</b></p>';
      var row = el('div', 'chips'); OP.forEach(function (o) { var b = el('button', 'chip', o); b.type = 'button'; b.addEventListener('click', function () { var ok = o === s.a; if (ok) score++; row.querySelectorAll('.chip').forEach(function (x) { x.disabled = true; if (x.textContent === s.a) x.style.borderColor = 'var(--ok)'; }); bx.appendChild(el('div', 'callout ' + (ok ? 'ok' : 'bad'), '<b>' + (ok ? 'Doğru!' : 'Doğrusu: ' + s.a) + '</b>' + s.why)); var nb = el('button', 'btn primary', 'Sonraki'); nb.type = 'button'; nb.addEventListener('click', function () { i2++; rend(); }); bx.appendChild(nb); }); row.appendChild(b); }); bx.appendChild(row);
    }
    rend();
  }
})();
