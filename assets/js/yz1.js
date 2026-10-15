/* Yapay Zeka Temelleri · Bölüm 1 için etkileşimli araçlar:
   dört tanım matrisi, tarih çizgisi, iç içe alan diyagramı, tek nöron, sonraki kelime,
   PEAS sekmeleri, ortam sınıflandırma oyunu, ters çevrilen kartlar. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function svgEl(name, attrs, parent) { var e = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (parent) parent.appendChild(e); return e; }
  function pressGroup(btns, i) { btns.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); }); }

  /* ---------- 1) Dört tanım matrisi ---------- */
  (function () {
    var box = $('quad'); if (!box) return;
    var Q = [
      { t: 'İnsanca düşünme', c: 'Düşünme · İnsan gibi', goal: 'İnsan zihninin nasıl çalıştığını anlayıp bilgisayarda canlandırmak.', ex: 'Hafıza süreçlerini modelleyen bilişsel mimariler.', pro: 'İnsana yakın davranış modelleri verir.', con: 'Zihnin tam olarak nasıl işlediğini hâlâ bilmiyoruz; model eksik kalabilir.', life: 'Bir satranç ustasının hamleyi nasıl seçtiğini adım adım bilgisayarda canlandırmaya çalışmak.' },
      { t: 'Rasyonel düşünme', c: 'Düşünme · Rasyonel', goal: 'Mantıksal olarak geçerli, çürütülemez akıl yürütmeyi modellemek.', ex: 'Teoremleri kanıtlayan otomatik ispatlayıcılar.', pro: 'Matematiksel kesinlik sağlar.', con: 'Gerçek dünya belirsizdir ve bilgi eksiktir; saf mantık çoğu zaman yetmez.', life: '“Tüm kediler hayvandır, Pamuk bir kedidir, o hâlde Pamuk bir hayvandır.” Bu türden çıkarımları makineye yaptırmak.' },
      { t: 'İnsanca davranma', c: 'Davranma · İnsan gibi', goal: 'Dışarıdan bakıldığında insandan ayırt edilemeyen davranış sergilemek.', ex: 'Turing Testi.', pro: 'Ölçülebilir, somut bir hedef verir.', con: 'Zekâ yalnızca insanı taklit etmek midir? Birçok eleştirmen bunu yetersiz buluyor.', life: 'Bir müşteri hizmetleri sohbet botunun, karşısındaki kişi tarafından insan sanılması.' },
      { t: 'Rasyonel davranma', c: 'Davranma · Rasyonel', goal: 'Her durumda beklenen en iyi sonucu veren eylemi seçmek (ajan yaklaşımı).', ex: 'Robotik kontrol, otonom araçlar, optimizasyon problemleri.', pro: 'En genel çerçeve: mantığı da olasılığı da kapsar, belirsizlikte çalışır.', con: '“En iyi”nin ne olduğunu doğru tanımlamak zordur (performans ölçütü).', life: 'Navigasyon uygulamasının trafik belirsizliğine rağmen beklenen en kısa süreli rotayı seçmesi.' }
    ];
    var grid = el('div', 'quad-grid');
    var corner = el('div', 'quad-axis', ''); grid.appendChild(corner);
    grid.appendChild(el('div', 'quad-axis', 'Düşünme'));
    grid.appendChild(el('div', 'quad-axis', 'Davranma'));
    grid.appendChild(el('div', 'quad-axis side', 'İnsan gibi'));
    var btns = [];
    function mk(i) { var b = el('button', 'quad-cell', '<b>' + Q[i].t + '</b>'); b.type = 'button'; b._i = i; b.addEventListener('click', function () { show(i); }); btns.push(b); return b; }
    grid.appendChild(mk(0)); grid.appendChild(mk(2));
    grid.appendChild(el('div', 'quad-axis side', 'Rasyonel'));
    grid.appendChild(mk(1)); grid.appendChild(mk(3));
    box.appendChild(grid);
    var info = el('div', 'quad-info'); box.appendChild(info);
    function show(i) {
      var q = Q[i]; btns.forEach(function (x) { x.setAttribute('aria-pressed', x._i === i ? 'true' : 'false'); });
      info.innerHTML = '<div class="kicker">' + q.c + '</div><h3>' + q.t + '</h3>' +
        '<p><b>Amaç:</b> ' + q.goal + '</p><p><b>Örnek:</b> ' + q.ex + '</p>' +
        '<p><span class="yes">Güçlü yan:</span> ' + q.pro + '</p><p><span class="no">Sınır:</span> ' + q.con + '</p>' +
        '<div class="callout real"><b>Günlük hayat</b>' + q.life + '</div>';
    }
    show(3);
  })();

  /* ---------- 2) Tarih çizgisi ---------- */
  (function () {
    var box = $('timeline'); if (!box) return;
    var E = [
      { n: 'Tohumlar', a: 1943, b: 1955, t: 'Yapay nöron fikri ortaya atıldı (1943). İlk sinir ağı makinesi kuruldu (1950). Alan Turing “Makineler düşünebilir mi?” sorusunu ve Turing Testi’ni yazdı (1950).', y: 0.30 },
      { n: 'Doğuş', a: 1956, b: 1956, t: 'Dartmouth’ta toplanan bir atölyede “yapay zekâ” adı ilk kez resmen kullanıldı. İlk akıl yürüten programlardan Logic Theorist bu döneme ait.', y: 0.45 },
      { n: 'Büyük vaatler', a: 1952, b: 1969, t: 'Araştırmacılar çok iddialıydı: bilgisayarların kısa sürede satranç şampiyonu olacağı, önemli teoremleri kanıtlayacağı söyleniyordu.', y: 0.85 },
      { n: 'Gerçeklik dozu', a: 1966, b: 1973, t: 'Küçük örneklerde çalışan programlar büyük problemlerde tökezledi. Makine çevirisi, dilin arka plan bilgisi istediğini gösterdi; birçok problemin hesaplamak için fazla pahalı olduğu anlaşıldı.', y: 0.25 },
      { n: 'Bilgi tabanlı sistemler', a: 1969, b: 1986, t: 'Dar ve sınırlı alanlara odaklanıldı. Uzman sistemler yazıldı: bir alanın kurallarını bilgisayara öğretme dönemi.', y: 0.62 },
      { n: 'Bilimsel yöntem', a: 1987, b: 2000, t: 'Fikirlerin sezgiyle değil, titiz teoremler ve deneylerle desteklendiği bir döneme geçildi. İstatistik ve kontrol teorisiyle birleşme arttı.', y: 0.50 },
      { n: 'Akıllı ajanlar', a: 1995, b: 2025, t: 'Tek tek yeteneklerden “bütün ajan” fikrine dönüldü. İnternet, arama motorları ve öneri sistemlerini her yere taşıdı.', y: 0.72 },
      { n: 'Büyük veri çağı', a: 2001, b: 2025, t: 'Çok büyük veri kümeleri, algoritmadan çok veriye odaklanmayı getirdi. Derin öğrenme (2012’de görüntü tanımada büyük sıçrama) ve Transformer (2017) bu dönemin ürünü.', y: 0.95 }
    ];
    var X0 = 1940, X1 = 2030, W = 760, H = 230, L = 40, R = 20, T = 20, B = 40;
    function x(yr) { return L + (yr - X0) / (X1 - X0) * (W - L - R); }
    function y(v) { return T + (1 - v) * (H - T - B); }
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'diagram', role: 'img', 'aria-label': 'Yapay zekâ tarihinde heyecan düzeyinin kabaca iniş çıkışları' }, null);
    box.appendChild(svg);
    svgEl('line', { x1: L, y1: H - B, x2: W - R, y2: H - B, 'class': 'd-line' }, svg);
    for (var yr = 1950; yr <= 2020; yr += 10) { svgEl('line', { x1: x(yr), y1: H - B, x2: x(yr), y2: H - B + 6, 'class': 'd-line' }, svg); var tt = svgEl('text', { x: x(yr), y: H - B + 22, 'class': 'd-sm d-c' }, svg); tt.textContent = yr; }
    var hi = svgEl('rect', { x: 0, y: T, width: 0, height: H - T - B, 'class': 'tl-hi' }, svg);
    var pts = [[1943, .12], [1956, .38], [1966, .85], [1973, .22], [1986, .66], [1992, .40], [2000, .46], [2012, .78], [2025, .97]];
    svgEl('polyline', { points: pts.map(function (p) { return x(p[0]) + ',' + y(p[1]); }).join(' '), 'class': 'd-line-brand', fill: 'none' }, svg);
    var lab = svgEl('text', { x: L + 4, y: T + 10, 'class': 'd-sm' }, svg); lab.textContent = 'kabaca heyecan düzeyi (çizim, ölçüm değil)';
    var chips = el('div', 'chips'); box.appendChild(chips);
    var info = el('div', 'quad-info'); box.appendChild(info);
    var btns = [];
    E.forEach(function (e, i) {
      var b = el('button', 'chip', e.n + ' <small>' + (e.a === e.b ? e.a : e.a + '–' + (e.b >= 2025 ? 'bugün' : e.b)) + '</small>'); b.type = 'button';
      b.addEventListener('click', function () { pick(i); }); chips.appendChild(b); btns.push(b);
    });
    function pick(i) {
      var e = E[i]; pressGroup(btns, i);
      var a = x(e.a), b2 = x(Math.max(e.b, e.a + 1.5));
      hi.setAttribute('x', a); hi.setAttribute('width', Math.max(6, b2 - a));
      info.innerHTML = '<div class="kicker">' + (e.a === e.b ? e.a : e.a + '–' + (e.b >= 2025 ? 'bugün' : e.b)) + '</div><h3>' + e.n + '</h3><p>' + e.t + '</p>';
    }
    pick(1);
  })();

  /* ---------- 3) İç içe alan diyagramı ---------- */
  (function () {
    var box = $('nest'); if (!box) return;
    var N = [
      { n: 'Yapay zekâ', r: 150, d: 'Akıllı davranış sergileyen sistemleri kuran geniş alan. Kural tabanlı sistemler, arama, planlama de burada.', ex: 'Satranç motoru, rota planlayıcı, uzman sistem' },
      { n: 'Makine öğrenmesi', r: 112, d: 'Kuralları elle yazmak yerine örnek verilerden öğrenen yöntemler.', ex: 'Öneri sistemi, spam filtresi, kredi skoru' },
      { n: 'Derin öğrenme', r: 76, d: 'Çok katmanlı sinir ağlarıyla öğrenme. Özellikleri kendisi çıkarır.', ex: 'Yüz tanıma, konuşma tanıma, otonom sürüşte algı' },
      { n: 'Üretken YZ ve LLM', r: 40, d: 'Yeni içerik (metin, görsel, ses, kod) üreten derin modeller.', ex: 'Sohbet asistanları, görsel üreticiler' }
    ];
    var svg = svgEl('svg', { viewBox: '0 0 340 320', 'class': 'nest-svg', role: 'img', 'aria-label': 'İç içe daireler: yapay zekâ, makine öğrenmesi, derin öğrenme, üretken yapay zekâ' });
    var cls = ['d-box', 'd-brand', 'd-warn', 'd-ok'], circles = [];
    N.forEach(function (n, i) {
      var c = svgEl('circle', { cx: 170, cy: 305 - n.r, r: n.r, 'class': cls[i] + ' nest-c', tabindex: 0, role: 'button', 'aria-label': n.n }, svg);
      c.addEventListener('click', function () { pick(i); }); c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); } });
      var t = svgEl('text', { x: 170, y: 305 - 2 * n.r + 16 + (i === 3 ? 20 : 0), 'class': 'd-txt d-c', 'pointer-events': 'none' }, svg); t.textContent = i === 3 ? 'Üretken' : n.n;
      circles.push(c);
    });
    var wrap = el('div', 'nest-wrap'); wrap.appendChild(svg); box.appendChild(wrap);
    var info = el('div', 'quad-info'); wrap.appendChild(info);
    function pick(i) {
      circles.forEach(function (c, k) { c.style.strokeWidth = k === i ? '5' : ''; });
      info.innerHTML = '<div class="kicker">Dairelere tıkla</div><h3>' + N[i].n + '</h3><p>' + N[i].d + '</p><p><b>Örnekler:</b> ' + N[i].ex + '</p>';
    }
    pick(0);
  })();

  /* ---------- 4) Tek yapay nöron ---------- */
  (function () {
    var box = $('neuron'); if (!box) return;
    var X = [['Hava güzel', 1], ['Arkadaşım çağırdı', 1], ['Yarın sınavım var', 0]];
    var W = [1, 2, -2], bias = -1.5, ws = [], xs = [];
    var rows = el('div', 'neu-rows'); box.appendChild(rows);
    X.forEach(function (x, i) {
      var r = el('div', 'neu-row');
      var tg = el('button', 'chip', x[0]); tg.type = 'button'; tg.setAttribute('aria-pressed', x[1] ? 'true' : 'false');
      tg.addEventListener('click', function () { X[i][1] = X[i][1] ? 0 : 1; tg.setAttribute('aria-pressed', X[i][1] ? 'true' : 'false'); calc(); });
      var sl = el('input'); sl.type = 'range'; sl.min = -3; sl.max = 3; sl.step = 0.5; sl.value = W[i]; sl.setAttribute('aria-label', x[0] + ' ağırlığı');
      var out = el('output'); sl.addEventListener('input', function () { W[i] = +sl.value; out.textContent = (W[i] > 0 ? '+' : '') + W[i]; calc(); }); out.textContent = (W[i] > 0 ? '+' : '') + W[i];
      r.appendChild(tg); r.appendChild(el('span', 'mm-note', 'önem (ağırlık):')); r.appendChild(sl); r.appendChild(out); rows.appendChild(r);
    });
    var rb = el('div', 'neu-row'); rb.appendChild(el('span', '', '<b>Tembellik payı</b> (bias)')); rb.appendChild(el('span', 'mm-note', ''));
    var sb = el('input'); sb.type = 'range'; sb.min = -4; sb.max = 2; sb.step = 0.5; sb.value = bias; sb.setAttribute('aria-label', 'Eşik değeri');
    var ob = el('output'); ob.textContent = bias; sb.addEventListener('input', function () { bias = +sb.value; ob.textContent = bias; calc(); });
    rb.appendChild(sb); rb.appendChild(ob); rows.appendChild(rb);
    var res = el('div', 'neu-res'); box.appendChild(res);
    function calc() {
      var s = bias, parts = [];
      X.forEach(function (x, i) { s += x[1] * W[i]; if (x[1]) parts.push((W[i] > 0 ? '+' : '') + W[i]); });
      var go = s > 0;
      res.className = 'neu-res ' + (go ? 'go' : 'stay');
      res.innerHTML = '<div><span class="mm-note">toplam = tembellik payı ' + (bias > 0 ? '+' : '') + bias + (parts.length ? ' ' + parts.join(' ') : '') + ' =</span> <b>' + (Math.round(s * 10) / 10) + '</b></div>' +
        '<div class="neu-out">' + (go ? '✅ Karar: Dışarı çık' : '🛋 Karar: Evde kal') + '</div><div class="mm-note">Toplam 0’dan büyükse nöron “ateşler”.</div>';
    }
    calc();
  })();

  /* ---------- 5) Sonraki kelime tahmini ---------- */
  (function () {
    var box = $('nextword'); if (!box) return;
    var words = ['uykuluydum', 'yorgundum', 'soğuktu', 'açtım', 'sıkılmıştım'], base = [0.46, 0.31, 0.11, 0.07, 0.05];
    var row = el('div', 'slider-row'); row.innerHTML = '<label for="nwt">Sıcaklık (rastgelelik)</label><input id="nwt" type="range" min="0.2" max="2.5" step="0.1" value="1"><output id="nwo">1.0</output>';
    box.appendChild(row);
    box.insertBefore(el('p', 'big-quote', '“Kahveyi içtim, çünkü çok <b>…</b>”'), row);
    var bars = el('div', 'bars'); box.appendChild(bars);
    box.appendChild(el('p', 'mm-note', 'Sayılar anlatım için uydurulmuş örnek değerlerdir; gerçek bir modelin çıktısı değildir.'));
    var t = $('nwt'), o = $('nwo');
    function draw() {
      var T = +t.value, p = base.map(function (v) { return Math.pow(v, 1 / T); }), s = p.reduce(function (a, b) { return a + b; }, 0);
      o.textContent = T.toFixed(1); bars.innerHTML = '';
      p.forEach(function (v, i) {
        var pr = v / s * 100, r = el('div', 'barrow');
        r.innerHTML = '<span>' + words[i] + '</span><span class="track"><span class="fill" style="width:' + pr + '%;display:block"></span><span class="val">%' + pr.toFixed(0) + '</span></span>';
        bars.appendChild(r);
      });
    }
    t.addEventListener('input', draw); draw();
  })();

  /* ---------- 6) PEAS sekmeleri ---------- */
  (function () {
    var box = $('peas'); if (!box) return;
    var P = [
      { n: 'Otonom araç', p: 'Güvenli sürüş, yasalara uyum, hızlı varış, düşük yakıt', e: 'Şehir yolları, otoyollar, trafik ışıkları, yayalar, diğer araçlar', a: 'Direksiyon, gaz, fren, sinyal, korna', s: 'Kamera, radar, lidar, GPS, hız ölçer' },
      { n: 'Tıbbi teşhis', p: 'Doğru tanı, hızlı sonuç, düşük maliyet', e: 'Hasta, hastane, tahlil sonuçları, görüntüleme cihazları', a: 'Rapor yazma, test isteme, tedavi önerme', s: 'Laboratuvar sonuçları, tıbbi görüntüler, hasta öyküsü' },
      { n: 'Akıllı ev', p: 'Düşük enerji tüketimi, kullanıcı konforu', e: 'Ev, elektrik şebekesi, hava durumu, ev halkı', a: 'Akıllı prizler, ısıtma-soğutma, aydınlatma', s: 'Akıllı sayaç, sıcaklık, nem, hareket algılayıcı' },
      { n: 'Alım-satım botu', p: 'Kâr, düşük risk, düşük işlem maliyeti', e: 'Piyasa verileri, ekonomik göstergeler, haber akışı', a: 'Alış ve satış emirleri, portföy dengeleme', s: 'Fiyat akışı, borsa API’si, haber analizi' },
      { n: 'Sınav çalışma asistanı', p: 'Öğrencinin gerçekten öğrenmesi, doğru bilgi, zamanında hatırlatma', e: 'Öğrenci, ders notları, sınav takvimi, uygulama', a: 'Soru sorma, ipucu verme, tekrar planlama, bildirim', s: 'Verilen cevaplar, çalışma süresi, takvim, yazılı sorular' }
    ];
    var chips = el('div', 'chips'), info = el('div', 'peas-grid'); box.appendChild(chips); box.appendChild(info);
    var btns = [];
    P.forEach(function (x, i) { var b = el('button', 'chip', x.n); b.type = 'button'; b.addEventListener('click', function () { pick(i); }); chips.appendChild(b); btns.push(b); });
    function pick(i) {
      var x = P[i]; pressGroup(btns, i);
      info.innerHTML = '<div class="peas-c p"><b>P · Performans</b>' + x.p + '</div><div class="peas-c e"><b>E · Çevre</b>' + x.e + '</div><div class="peas-c a"><b>A · Aktüatör</b>' + x.a + '</div><div class="peas-c s"><b>S · Sensör</b>' + x.s + '</div>';
    }
    pick(0);
  })();

  /* ---------- 7) Ortam sınıflandırma oyunu ---------- */
  (function () {
    var box = $('envgame'); if (!box) return;
    var DIM = [
      ['obs', 'Gözlem', ['Tam', 'Kısmi']], ['ag', 'Ajan', ['Tek', 'Çok']], ['det', 'Sonuç', ['Belirli', 'Rastlantılı']],
      ['epi', 'Bölümler', ['Bağımsız', 'Ardışık']], ['dyn', 'Dünya', ['Durağan', 'Değişken']], ['dis', 'Değerler', ['Ayrık', 'Sürekli']]
    ];
    var ENV = [
      { n: 'Satranç', a: [0, 1, 0, 1, 0, 0], why: 'Tüm taşlar görünür, iki oyuncu var, hamlenin sonucu kesin, hamleler birbirini etkiler, sırayı beklerken tahta değişmez, kareler ve hamleler sayılabilir.' },
      { n: 'Poker', a: [1, 1, 1, 1, 0, 0], why: 'Rakibin kartları gizli (kısmi), çok oyuncu, kartların dağılması şansa bağlı, eller birbirini etkiler.' },
      { n: 'Otonom sürüş', a: [1, 1, 1, 1, 1, 1], why: 'Sensörler her şeyi görmez, trafikte başka sürücüler var, olaylar tahmin edilemez, dünya sürekli değişir, direksiyon açısı ve hız sürekli değerlerdir.' },
      { n: 'Tetris', a: [0, 0, 1, 1, 1, 0], why: 'Ekran tamamen görünür ve tek oyuncu var; gelecek parçalar rastgele; her yerleştirme sonrakini etkiler; parça sen karar verirken düşmeye devam eder; hücreler sayılabilir.' },
      { n: 'Sudoku çözmek', a: [0, 0, 0, 1, 0, 0], why: 'Tahta tamamen görünür, tek çözücü var, hamlelerin sonucu kesin, bir rakam sonrakileri kısıtlar, tahta kendiliğinden değişmez, rakamlar sayılabilir.' }
    ];
    var state = ENV.map(function () { return [null, null, null, null, null, null]; });
    var wrap = el('div', 'scroll-x'), tbl = el('table', 'cmp env-tbl');
    var head = '<thead><tr><th>Ortam</th>' + DIM.map(function (d) { return '<th>' + d[1] + '</th>'; }).join('') + '</tr></thead>';
    tbl.innerHTML = head + '<tbody></tbody>'; wrap.appendChild(tbl); box.appendChild(wrap);
    var body = tbl.querySelector('tbody'), cells = [];
    ENV.forEach(function (e, i) {
      var tr = el('tr'); tr.appendChild(el('th', '', e.n)); cells.push([]);
      DIM.forEach(function (d, j) {
        var td = el('td'); var b = el('button', 'tog', '·'); b.type = 'button'; b.setAttribute('aria-label', e.n + ' · ' + d[1]);
        b.addEventListener('click', function () { state[i][j] = state[i][j] === null ? 0 : state[i][j] === 0 ? 1 : null; paint(i, j); });
        td.appendChild(b); tr.appendChild(td); cells[i].push(b);
      });
      body.appendChild(tr);
    });
    function paint(i, j, mark) {
      var b = cells[i][j], v = state[i][j];
      b.textContent = v === null ? '·' : DIM[j][2][v]; b.className = 'tog' + (v === null ? '' : ' set') + (mark || '');
    }
    var bar = el('div', 'bar'); box.appendChild(bar);
    var chk = el('button', 'btn primary', 'Kontrol et'); chk.type = 'button';
    var rst = el('button', 'btn', 'Sıfırla'); rst.type = 'button';
    bar.appendChild(chk); bar.appendChild(rst);
    var out = el('div', 'status'); box.appendChild(out);
    box.insertBefore(el('p', 'mm-note', 'Her kutuya tıkla: ilk tık soldaki seçeneği, ikinci tık sağdakini seçer, üçüncü tık temizler.'), wrap);
    chk.addEventListener('click', function () {
      var ok = 0, tot = 0, empty = 0, why = '';
      ENV.forEach(function (e, i) { DIM.forEach(function (d, j) {
        tot++; var v = state[i][j];
        if (v === null) { empty++; paint(i, j); return; }
        if (v === e.a[j]) { ok++; paint(i, j, ' right'); } else paint(i, j, ' wrong');
      }); });
      ENV.forEach(function (e, i) { var bad = DIM.some(function (d, j) { return state[i][j] !== null && state[i][j] !== e.a[j]; }); if (bad) why += '<li><b>' + e.n + ':</b> ' + e.why + '</li>'; });
      out.innerHTML = '<b>' + ok + ' / ' + tot + ' doğru</b>' + (empty ? ' (' + empty + ' kutu boş)' : '') + (why ? '<p class="mm-note">Yanlış yaptığın satırların gerekçesi:</p><ul>' + why + '</ul>' : (empty ? '' : '<p>Hepsi doğru!</p>'));
    });
    rst.addEventListener('click', function () { state = ENV.map(function () { return [null, null, null, null, null, null]; }); ENV.forEach(function (e, i) { DIM.forEach(function (d, j) { paint(i, j); }); }); out.innerHTML = ''; });
  })();

  /* ---------- 8) Ters çevrilen kartlar ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.flip'), function (f) {
    f.addEventListener('click', function () { f.classList.toggle('on'); f.setAttribute('aria-pressed', f.classList.contains('on') ? 'true' : 'false'); });
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f.click(); } });
  });

  /* ---------- 9) Disiplin kutuları ---------- */
  (function () {
    var box = $('disc'); if (!box) return;
    var D = [
      ['Felsefe', 'Akıl yürütmenin kurallara dökülebileceği fikri. “Zihin nedir, bilgi nereden gelir?” soruları.', 'Etik tartışmaları, “güçlü/zayıf yapay zekâ” ayrımı.'],
      ['Matematik', 'Mantık, hesaplanabilirlik ve olasılık. Neyin hesaplanabileceğinin sınırları.', 'Bayes kuralı, optimizasyon, her sinir ağının altındaki doğrusal cebir.'],
      ['Ekonomi', 'Fayda ve karar kuramı: belirsizlikte en iyi seçim nasıl yapılır?', 'Oyun kuramı, takviyeli öğrenme, algoritmik ticaret.'],
      ['Nörobilim', 'Beynin nöronlarla bilgi işlediğini gösterdi.', 'Yapay sinir ağları, derin öğrenme.'],
      ['Psikoloji', 'İnsanın nasıl öğrendiği ve problem çözdüğü üzerine modeller.', 'Bellek yapılarına ilham, planlama algoritmaları.'],
      ['Bilgisayar müh.', 'Yeterince hızlı donanım: yapay zekâyı mümkün kılan makineler.', 'GPU ve TPU’lar, bulut bilişim.'],
      ['Kontrol kuramı', 'Geri bildirimle bir sistemi hedefte tutmak.', 'Robot kolları, dronlar, otonom araçlar.'],
      ['Dilbilim', 'Dilin yapısı ve yaratıcılığı üzerine kuramlar.', 'Doğal dil işleme, büyük dil modelleri.']
    ];
    var g = el('div', 'tilegrid'), info = el('div', 'quad-info'), btns = [];
    D.forEach(function (d, i) { var b = el('button', 'tile', d[0]); b.type = 'button'; b.addEventListener('click', function () { pick(i); }); g.appendChild(b); btns.push(b); });
    box.appendChild(g); box.appendChild(info);
    function pick(i) { pressGroup(btns, i); info.innerHTML = '<h3>' + D[i][0] + '</h3><p><b>Yapay zekâya katkısı:</b> ' + D[i][1] + '</p><p><b>Bugün nerede görürsün:</b> ' + D[i][2] + '</p>'; }
    pick(0);
  })();
})();
