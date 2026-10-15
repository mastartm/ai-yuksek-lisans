/* Araştırma Yöntemleri · Bölüm 1-3 araçları: senaryo seçiciler, değişken rolleri, korelasyon + karıştırıcı,
   seçkisiz atama simülasyonu. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function svgEl(name, attrs, parent) { var e = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (parent) parent.appendChild(e); return e; }
  function lcg(seed) { var s = seed; return function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }

  /* Ortak: senaryo → seçenek kartları */
  function scenarioQuiz(root, S, OPT) {
    var i = 0, score = 0, box = el('div', 'quad-info'); root.appendChild(box);
    function rend() {
      if (i >= S.length) { box.innerHTML = '<h3>Bitti: ' + score + ' / ' + S.length + '</h3><button class="btn primary" type="button">Baştan</button>'; box.querySelector('button').addEventListener('click', function () { i = 0; score = 0; rend(); }); return; }
      var s = S[i]; box.innerHTML = '<div class="kicker">Senaryo ' + (i + 1) + ' / ' + S.length + '</div><p><b>' + s.q + '</b></p>';
      var row = el('div', 'chips'); OPT.forEach(function (o) { var b = el('button', 'chip', o); b.type = 'button'; b.addEventListener('click', function () { var ok = o === s.a; if (ok) score++; row.querySelectorAll('.chip').forEach(function (x) { x.disabled = true; if (x.textContent === s.a) x.style.borderColor = 'var(--ok)'; }); box.appendChild(el('div', 'callout ' + (ok ? 'ok' : 'bad'), '<b>' + (ok ? 'Doğru!' : 'Doğrusu: ' + s.a) + '</b>' + s.why)); var nb = el('button', 'btn primary', 'Sonraki'); nb.type = 'button'; nb.addEventListener('click', function () { i++; rend(); }); box.appendChild(nb); }); row.appendChild(b); }); box.appendChild(row);
    }
    rend();
  }

  /* ---------- AR-1: araştırma türü seçici ---------- */
  var rt = $('rtype');
  if (rt) scenarioQuiz(rt, [
    { q: 'Üniversite öğrencilerinin dönem başında ve dönem sonunda aynı gruptan uyku saatleri ölçülüyor.', a: 'Boylamsal', why: 'Aynı gruptan farklı zamanlarda birkaç kez veri toplanıyor: boylamsal araştırma. Tek bir zamanda toplansaydı anlık (kesitsel) olurdu.' },
    { q: 'Bir ilçedeki 1.000 öğrenciye tek seferlik bir anket yapılıp bugünkü ders çalışma saatleri betimleniyor.', a: 'Betimsel', why: 'Amaç var olan durumu olduğu gibi tanımlamak (“nedir?”): betimsel (tarama) araştırma.' },
    { q: 'Yeni bir öğretim yönteminin başarıya etkisini görmek için öğrenciler seçkisiz iki gruba ayrılıp biri bu yöntemle okutuluyor.', a: 'Müdahale', why: 'Araştırmacı bağımsız değişkene müdahale ediyor (deneysel işlem): müdahale araştırması.' },
    { q: 'Öğrencilerin ders çalışma süresi ile sınav puanı arasındaki ilişki, müdahale edilmeden inceleniyor.', a: 'İlişkisel', why: 'Değişkenler arası ilişki, müdahale olmadan inceleniyor: ilişkisel (korelasyonel) araştırma.' }
  ], ['Betimsel', 'İlişkisel', 'Müdahale', 'Boylamsal']);

  /* ---------- AR-1: etik ihlal eşleştirme ---------- */
  var eh = $('ethics');
  if (eh) scenarioQuiz(eh, [
    { q: 'Bir araştırmacı, başkasının yazdığı bir bölümü kaynak göstermeden kendi makalesine koyuyor.', a: 'Aşırmacılık', why: 'Başkasının ürettiği bilgiyi kendisininmiş gibi kaynak bildirmeden kullanmaktır (intihal, bilimsel hırsızlık).' },
    { q: 'Bir araştırmacı, hiç anket yapmadan 200 kişilik sahte bir veri seti oluşturup sonuçları yayımlıyor.', a: 'Uydurmacılık', why: 'Hiç araştırma yapmadan yapılmış gibi veri seti üretmektir.' },
    { q: 'Bir araştırmacı, hipotezine uymayan 15 gözlemi veri setinden çıkarıyor.', a: 'Sahtecilik', why: 'Bilimsel veriler üzerinde kasıtlı değişiklik (manipülasyon); istenmeyen verilerin çıkarılması da buna girer.' },
    { q: 'Aynı bulgular, hafif değişiklikle iki farklı dergide ayrı makaleler olarak yayımlanıyor.', a: 'Yinelenen yayın', why: 'Bir araştırmanın birden çok dergide yayınlanması ya da gereksiz parçalanarak yayınlanmasıdır.' },
    { q: 'Dikkatsiz bir planlama yüzünden ölçek yanlış uygulanıyor; kimse kasıtlı bir şey yapmıyor, ama sonuçlar bozuluyor.', a: 'Disiplinsiz araştırma', why: 'Dikkatsiz ve özensiz planlama ve uygulama sonucu kasıtsız hatalar; çoğunlukla düzeltilebilir.' }
  ], ['Disiplinsiz araştırma', 'Yinelenen yayın', 'Sahtecilik', 'Uydurmacılık', 'Aşırmacılık']);

  /* ---------- AR-2: değişken rolleri ---------- */
  var vr = $('varroles');
  if (vr) {
    var QS = [
      { q: '“Bilgisayar destekli öğretim gören öğrencilerin matematik başarısı, geleneksel öğretim görenlerinkinden yüksek müdür?”', items: [['Öğretim yöntemi', 'Bağımsız (değiştirilebilen)'], ['Matematik başarısı', 'Bağımlı'], ['Sınıfın gürültü düzeyi', 'Dışsal (kontrol)']], note: 'Öğretim yöntemini araştırmacı değiştirir; başarı sonuçtur; gürültü bağımlı değişkenle ilişkili ama etkisi test edilmeyen kontrol değişkenidir.' },
      { q: '“Sınav kaygısı, üniversite giriş sınavı performansını etkiliyor mu; bu etki daha önce sınava girmiş olmaya göre değişiyor mu?”', items: [['Sınav kaygısı', 'Bağımsız (seçilmiş)'], ['Giriş sınavı performansı', 'Bağımlı'], ['Daha önce sınava girmiş olmak', 'Düzenleyici']], note: 'Kaygı araştırmacının müdahale etmediği, ortamda var olan, seçilmiş bir bağımsız değişkendir; sınava girme deneyimi ilişkiyi düzenleyen değişkendir.' }
    ];
    var qi = 0, box = el('div', 'quad-info'); vr.appendChild(box);
    var OPT = ['Bağımsız (değiştirilebilen)', 'Bağımsız (seçilmiş)', 'Bağımlı', 'Düzenleyici', 'Dışsal (kontrol)'];
    function rend() {
      var q = QS[qi]; box.innerHTML = '<div class="kicker">Soru ' + (qi + 1) + ' / ' + QS.length + '</div><p><b>' + q.q + '</b></p>';
      var tbl = '<table class="cmp"><thead><tr><th>Değişken</th><th>Rolü</th><th></th></tr></thead><tbody>';
      q.items.forEach(function (it, k) { tbl += '<tr><td><b>' + it[0] + '</b></td><td><select data-k="' + k + '"><option value="">seç…</option>' + OPT.map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select></td><td class="vr-m"></td></tr>'; });
      box.insertAdjacentHTML('beforeend', tbl + '</tbody></table>');
      var bt = el('button', 'btn primary', 'Kontrol et'); bt.type = 'button'; var ou = el('div', 'status'); box.appendChild(bt); box.appendChild(ou);
      bt.addEventListener('click', function () { var ok = 0; box.querySelectorAll('select').forEach(function (s) { var k = +s.getAttribute('data-k'), right = s.value === q.items[k][1]; if (right) ok++; s.parentNode.nextSibling.innerHTML = s.value === '' ? '' : right ? '<span class="yes">✓</span>' : '<span class="no">✗ ' + q.items[k][1] + '</span>'; }); ou.innerHTML = '<b>' + ok + ' / ' + q.items.length + '</b> · ' + q.note; if (qi < QS.length - 1 && !box.querySelector('.nx')) { var nb = el('button', 'btn nx', 'Sonraki soru'); nb.type = 'button'; nb.addEventListener('click', function () { qi++; rend(); }); box.appendChild(nb); } });
    }
    rend();
  }

  /* ---------- AR-2: iyi araştırma sorusu ---------- */
  var gq = $('goodq');
  if (gq) (function () {
    var C = [
      { t: 'Lise öğrencilerinin günlük ekran süresi ile uyku süresi arasında ilişki var mıdır?', ok: true, why: 'Açık, ölçülebilir, sınanabilir, makul kapsamlı; değişkenleri net.' },
      { t: 'Hayatın anlamı nedir?', ok: false, why: 'Cevabı kişiye göre değişir; sınanabilir ve ölçülebilir değil.' },
      { t: 'Gençler telefon kullanmalı mıdır?', ok: false, why: '“Olmalı mıdır” gibi emir/olasılık kipleri uygun değil ve soru tartışmalı bir değer yargısı.' },
      { t: 'Dünyadaki tüm çocukların tüm alışkanlıkları nelerdir?', ok: false, why: 'Aşırı geniş kapsamlı; makul sürede, bütçede araştırılamaz.' }
    ];
    gq.appendChild(el('p', 'mm-note', 'Bir araştırma sorusu akla yatkın, anlamlı, açık, sınanabilir, orta kapsamlı, özgün ve etik olmalıdır. Hangisi iyi bir araştırma sorusu?'));
    var list = el('div', 'quad-info'); gq.appendChild(list);
    C.forEach(function (c) { var b = el('button', 'chip', c.t); b.type = 'button'; b.style.display = 'block'; b.style.margin = '6px 0'; b.addEventListener('click', function () { list.querySelectorAll('.callout').forEach(function (x) { x.remove(); }); list.appendChild(el('div', 'callout ' + (c.ok ? 'ok' : 'bad'), '<b>' + (c.ok ? 'İyi soru ✓' : 'Sorunlu ✗') + '</b>' + c.why)); }); list.appendChild(b); });
  })();

  /* ---------- AR-3: korelasyon + karıştırıcı ---------- */
  var cf = $('confound');
  if (cf) {
    var r = lcg(7), N = 36, D = [];
    for (var i = 0; i < N; i++) { var temp = 12 + r() * 24; var ice = 20 + temp * 4 + (r() - 0.5) * 50; var dr = 1 + temp * 0.18 + (r() - 0.5) * 2.4; D.push({ t: temp, a: ice, b: dr }); }
    function corr(x, y) { var n = x.length, mx = x.reduce(function (a, b) { return a + b; }, 0) / n, my = y.reduce(function (a, b) { return a + b; }, 0) / n, sxy = 0, sxx = 0, syy = 0; for (var i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) * (x[i] - mx); syy += (y[i] - my) * (y[i] - my); } return sxy / Math.sqrt(sxx * syy); }
    var A = D.map(function (d) { return d.a; }), B = D.map(function (d) { return d.b; }), T = D.map(function (d) { return d.t; });
    var rab = corr(A, B), rat = corr(A, T), rbt = corr(B, T), part = (rab - rat * rbt) / Math.sqrt((1 - rat * rat) * (1 - rbt * rbt));
    var show = { color: false };
    cf.appendChild(el('p', 'mm-note', 'Otuz altı yaz günü için örnek (uydurma) veri: günlük dondurma satışı ve havuzdaki küçük kaza sayısı. Noktalar ilişki gösteriyor; sence dondurma kazalara mı yol açıyor?'));
    var svg = svgEl('svg', { viewBox: '0 0 520 300', 'class': 'diagram', role: 'img', 'aria-label': 'Dondurma satışı ile kaza sayısı serpilme grafiği' }); cf.appendChild(svg);
    var bar = el('div', 'bar'), bt = el('button', 'btn primary', '🌡 Sıcaklığı da göster (karıştırıcı değişken)'); bt.type = 'button'; bar.appendChild(bt); cf.appendChild(bar);
    var out = el('div', 'quad-info'); cf.appendChild(out);
    var minA = Math.min.apply(null, A), maxA = Math.max.apply(null, A), minB = Math.min.apply(null, B), maxB = Math.max.apply(null, B);
    function X(v) { return 50 + (v - minA) / (maxA - minA) * 440; } function Y(v) { return 260 - (v - minB) / (maxB - minB) * 230; }
    function draw() {
      svg.innerHTML = ''; svgEl('line', { x1: 50, y1: 260, x2: 500, y2: 260, 'class': 'd-line' }, svg); svgEl('line', { x1: 50, y1: 20, x2: 50, y2: 260, 'class': 'd-line' }, svg);
      var tx = svgEl('text', { x: 275, y: 290, 'class': 'd-sm d-c' }, svg); tx.textContent = 'dondurma satışı →'; var ty = svgEl('text', { x: 8, y: 16, 'class': 'd-sm' }, svg); ty.textContent = 'kaza sayısı';
      D.forEach(function (d) { var hot = d.t > 24, c = show.color ? (hot ? 'var(--bad)' : (d.t < 18 ? 'var(--brand)' : 'var(--warn)')) : 'var(--brand)'; svgEl('circle', { cx: X(d.a), cy: Y(d.b), r: 6, style: 'fill:' + c + ';opacity:.8' }, svg); });
      var f = function (x) { return x.toFixed(2).replace('.', ','); };
      out.innerHTML = '<p>Dondurma ↔ kaza korelasyonu: <b>r = ' + f(rab) + '</b> (güçlü pozitif).</p>' + (show.color ? '<p><b>Sıcaklık</b> hem dondurma satışıyla (r = ' + f(rat) + ') hem kaza sayısıyla (r = ' + f(rbt) + ') ilişkili. Sıcaklığın etkisi ayıklandığında (kısmi korelasyon) dondurma ↔ kaza ilişkisi <b>r = ' + f(part) + '</b>’e iner. Üçüncü bir değişken ilişkiyi yaratmıştı: sıcak havada hem dondurma satılır hem daha çok kişi havuza girer.</p>' : '<p class="mm-note">Düğmeye bas ve gizli üçüncü değişkeni gör.</p>') + '<div class="callout idea"><b>Korelasyon nedensellik değildir</b>İki değişken birlikte değişiyor diye biri diğerinin nedeni olmak zorunda değildir. Neden-sonuç iddiası için deneysel desenler ya da bozucu değişkenlerin kontrolü gerekir.</div>';
    }
    bt.addEventListener('click', function () { show.color = !show.color; bt.textContent = show.color ? '🌡 Sıcaklığı gizle' : '🌡 Sıcaklığı da göster (karıştırıcı değişken)'; draw(); }); draw();
  }

  /* ---------- AR-3: seçkisiz atama simülasyonu ---------- */
  var ra = $('randsim');
  if (ra) {
    ra.appendChild(el('p', 'mm-note', 'Yeni bir ders programının gerçekte HİÇ etkisi yok (gerçek etki = 0). 40 öğrenciyi iki gruba ayırıyoruz. Öğrencilerin gizli bir özelliği var: motivasyon (puanı etkiler). İki yöntemi 300 kez dene ve “deney − kontrol” puan farkının dağılımına bak.'));
    var bar2 = el('div', 'bar'), b1 = el('button', 'btn primary', '▶ 300 deneme yap'); b1.type = 'button'; bar2.appendChild(b1); ra.appendChild(bar2);
    var svg2 = svgEl('svg', { viewBox: '0 0 560 250', 'class': 'diagram', role: 'img', 'aria-label': 'Seçkisiz ve gönüllü atamada ortalama fark dağılımı' }); ra.appendChild(svg2);
    var tx2 = el('div', 'quad-info'); ra.appendChild(tx2);
    function gauss(r) { var u = r() || 1e-6, v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
    function trial(r, mode) {
      var S = []; for (var i = 0; i < 40; i++) { var m = gauss(r); S.push({ m: m, y: 60 + 8 * m + gauss(r) * 5 }); }
      var tr = [], ct = [];
      if (mode === 'rand') { var idx = S.map(function (_, i) { return i; }).sort(function () { return r() - 0.5; }); idx.forEach(function (k, p) { (p < 20 ? tr : ct).push(S[k].y); }); }
      else { S.forEach(function (s) { var p = 1 / (1 + Math.exp(-2.2 * s.m)); (r() < p ? tr : ct).push(s.y); }); }
      if (!tr.length || !ct.length) return 0;
      var mean = function (a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; }; return mean(tr) - mean(ct);
    }
    function run() {
      var r = lcg(2026), res = { rand: [], self: [] };
      for (var i = 0; i < 300; i++) { res.rand.push(trial(r, 'rand')); res.self.push(trial(r, 'self')); }
      svg2.innerHTML = ''; var lo = -14, hi = 14, bins = 28, W = 500;
      function hist(arr) { var h = new Array(bins).fill(0); arr.forEach(function (v) { var k = Math.floor((Math.max(lo, Math.min(hi - 0.001, v)) - lo) / (hi - lo) * bins); h[k]++; }); return h; }
      var hr = hist(res.rand), hs = hist(res.self), mx = Math.max.apply(null, hr.concat(hs));
      svgEl('line', { x1: 40, y1: 220, x2: 40 + W, y2: 220, 'class': 'd-line' }, svg2);
      var zx = 40 + (0 - lo) / (hi - lo) * W; svgEl('line', { x1: zx, y1: 10, x2: zx, y2: 220, 'class': 'd-dash' }, svg2);
      var zt = svgEl('text', { x: zx, y: 238, 'class': 'd-sm d-c' }, svg2); zt.textContent = '0 (gerçek etki)';
      hr.forEach(function (c, k) { var w = W / bins; svgEl('rect', { x: 40 + k * w + 1, y: 220 - c / mx * 200, width: w / 2 - 1, height: c / mx * 200, 'class': 'd-ok' }, svg2); });
      hs.forEach(function (c, k) { var w = W / bins; svgEl('rect', { x: 40 + k * w + w / 2, y: 220 - c / mx * 200, width: w / 2 - 1, height: c / mx * 200, 'class': 'd-bad' }, svg2); });
      var l1 = svgEl('text', { x: 46, y: 24, 'class': 'd-txt', style: 'fill:var(--ok)' }, svg2); l1.textContent = '■ Seçkisiz atama';
      var l2 = svgEl('text', { x: 190, y: 24, 'class': 'd-txt', style: 'fill:var(--bad)' }, svg2); l2.textContent = '■ Gönüllüler deney grubunda';
      var mean = function (a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; };
      var sd = function (a) { var m = mean(a); return Math.sqrt(a.reduce(function (x, y) { return x + (y - m) * (y - m); }, 0) / a.length); };
      var f = function (x) { return x.toFixed(1).replace('.', ','); };
      tx2.innerHTML = '<p><b>Seçkisiz atama:</b> ortalama fark <b>' + f(mean(res.rand)) + '</b> puan (dağılım ±' + f(sd(res.rand)) + '): 0 çevresinde simetrik, çünkü rastgelelik grupları motivasyon bakımından denk yapar.</p><p><b>Gönüllüler deney grubunda:</b> ortalama fark <b>' + f(mean(res.self)) + '</b> puan: programın hiç etkisi yokken bile deney grubu “daha başarılı” görünür; çünkü daha motive olanlar kendiliğinden deney grubuna yazılmıştır (deneklerin seçimi tehdidi).</p>';
    }
    b1.addEventListener('click', run); run();
  }
})();
