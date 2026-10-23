/* Görüntü İşleme · Bölüm 14: darbe sinir hücresi (SNN), genetik algoritmayla eşik arama ve farklılaştırılmış gizlilik (gürültüyle sayı koruma).
   Sayılar ve görüntüler bu site için üretilmiştir; sadeleştirilmiş modellerdir. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function fx(x, d) { var k = Math.pow(10, d == null ? 0 : d); return (Math.round(x * k) / k).toString().replace('.', ','); }
  function sl(root, id, label, min, max, step, val, cb) { var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>'; root.appendChild(r); var i = r.querySelector('input'); i.addEventListener('input', cb); return i; }
  function canv(parent, w, h) { var c = el('canvas'); c.width = w; c.height = h; c.style.cssText = 'border:1px solid var(--line);border-radius:6px;max-width:100%;height:auto'; parent.appendChild(c); return c; }
  function lcg(seed) { return function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; }
  function btn(bar, text, fn) { var b = el('button', 'btn', text); b.type = 'button'; b.addEventListener('click', fn); bar.appendChild(b); return b; }

  /* ---------- 1) Darbe (spiking) sinir hücresi ---------- */
  (function snnLab() {
    var root = document.getElementById('snnlab');
    if (!root) return;
    var bar = el('div', 'chips'); root.appendChild(bar);
    var iB = sl(root, 'sb', 'Girdi: piksel parlaklığı (%)', 0, 100, 1, 60, draw), iL = sl(root, 'sk', 'Sızıntı (zamanla sönme)', 0, 30, 1, 10, draw), iT = sl(root, 'st', 'Ateşleme eşiği', 5, 20, 1, 10, draw);
    [['Koyu piksel', 20], ['Orta piksel', 50], ['Parlak piksel', 90]].forEach(function (a) { var b = el('button', 'chip', a[0]); b.type = 'button'; b.addEventListener('click', function () { iB.value = a[1]; draw(); }); bar.appendChild(b); });
    var cv = canv(root, 480, 170), info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    var STEPS = 80;
    function draw() {
      var b = +iB.value / 100, leak = +iL.value / 100, th = +iT.value / 10, I = b * 0.3;
      document.getElementById('sbo').textContent = '%' + Math.round(b * 100); document.getElementById('sko').textContent = fx(leak, 2); document.getElementById('sto').textContent = fx(th, 1);
      var v = 0, trace = [], spikes = [], t;
      for (t = 0; t < STEPS; t++) { v = v * (1 - leak) + I; if (v >= th) { spikes.push(t); trace.push(th); v = 0; } else trace.push(v); }
      var c = cv.getContext('2d'), W = 480, H = 170, yMax = 2.1; c.fillStyle = '#12161c'; c.fillRect(0, 0, W, H);
      function X(t) { return 10 + t * (W - 20) / (STEPS - 1); } function Y(v) { return H - 14 - v / yMax * (H - 30); }
      c.strokeStyle = '#f59e0b'; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(10, Y(th)); c.lineTo(W - 10, Y(th)); c.stroke(); c.setLineDash([]);
      c.strokeStyle = '#60a5fa'; c.lineWidth = 2; c.beginPath(); trace.forEach(function (y, i) { if (i) c.lineTo(X(i), Y(y)); else c.moveTo(X(i), Y(y)); }); c.stroke();
      c.strokeStyle = '#ef4444'; spikes.forEach(function (s) { c.beginPath(); c.moveTo(X(s), Y(th) - 2); c.lineTo(X(s), 8); c.stroke(); });
      c.fillStyle = '#ddd'; c.font = '11px sans-serif'; c.fillText('zar potansiyeli (mavi), eşik (turuncu kesikli), darbe (kırmızı çizgi)', 12, H - 2);
      info.innerHTML = '<div class="metric"><b>' + spikes.length + '</b>' + STEPS + ' adımda darbe sayısı</div><div class="metric"><b>' + (spikes.length ? spikes[0] + 1 : '—') + '</b>ilk darbenin adımı</div><div class="metric"><b>' + fx(I, 3) + '</b>her adımda gelen girdi</div>';
      note.innerHTML = spikes.length === 0 ? '<b>Hiç darbe yok.</b> Sızıntı yüzünden potansiyel, girdi ÷ sızıntı değerine yaklaşıp orada kalıyor ve eşiğe ulaşamıyor. Zayıf girdi bu hücreyi susturur.' : '<b>Parlaklık arttıkça darbeler sıklaşır ve ilk darbe öne gelir.</b> Darbe sinir ağlarında bilgi yalnızca “ne kadar” değil, “ne zaman” ile de taşınır; notta SNN’lerin bu zamansal dinamikleri değerlendirebildiği için video analizinde ve gerçek zamanlı algıda dikkat çektiği söylenir.';
    }
    draw();
  })();

  /* ---------- 2) Genetik algoritma: eşik arama ---------- */
  (function gaLab() {
    var root = document.getElementById('galab');
    if (!root) return;
    var hist = [], i;
    for (i = 0; i < 256; i++) hist.push(5500 * Math.exp(-Math.pow(i - 70, 2) / (2 * 18 * 18)) + 4500 * Math.exp(-Math.pow(i - 180, 2) / (2 * 22 * 22)));
    var tot = hist.reduce(function (a, b) { return a + b; }, 0);
    function fit(t) { var w0 = 0, s0 = 0, s = 0, k; for (k = 0; k < 256; k++) s += k * hist[k]; for (k = 0; k <= t; k++) { w0 += hist[k]; s0 += k * hist[k]; } var w1 = tot - w0; if (w0 <= 0 || w1 <= 0) return 0; var m0 = s0 / w0, m1 = (s - s0) / w1; return (w0 / tot) * (w1 / tot) * (m0 - m1) * (m0 - m1); }
    var opt = 0, optF = -1; for (i = 0; i < 256; i++) { var f = fit(i); if (f > optF) { optF = f; opt = i; } }
    var pop, gen, evals, rnd;
    var iP = sl(root, 'gp', 'Popülasyon büyüklüğü', 4, 30, 1, 4, reset), iM = sl(root, 'gm', 'Mutasyon büyüklüğü (gri seviye)', 1, 40, 1, 12, function () { document.getElementById('gmo').textContent = iM.value; });
    var bar = el('div', 'chips'); root.appendChild(bar);
    btn(bar, 'Bir nesil ilerlet', function () { step(1); }); btn(bar, '10 nesil ilerlet', function () { step(10); }); btn(bar, 'Baştan başla', reset);
    var cv = canv(root, 480, 160), info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function reset() { rnd = lcg(17); var n = +iP.value; pop = []; for (var k = 0; k < n; k++) pop.push(Math.floor(rnd() * 256)); gen = 0; evals = n; document.getElementById('gpo').textContent = n; document.getElementById('gmo').textContent = iM.value; draw(); }
    function pick() { var a = pop[Math.floor(rnd() * pop.length)], b = pop[Math.floor(rnd() * pop.length)]; return fit(a) >= fit(b) ? a : b; }
    function step(n) {
      for (var g = 0; g < n; g++) {
        var best = pop.reduce(function (a, b) { return fit(a) >= fit(b) ? a : b; }), next = [best], mut = +iM.value;
        while (next.length < pop.length) { var c = (pick() + pick()) / 2 + (rnd() - 0.5) * 2 * mut; next.push(Math.max(0, Math.min(255, Math.round(c)))); }
        pop = next; gen++; evals += pop.length;
      }
      draw();
    }
    function draw() {
      var c = cv.getContext('2d'), W = 480, H = 160, mx = Math.max.apply(null, hist), best = pop.reduce(function (a, b) { return fit(a) >= fit(b) ? a : b; });
      c.fillStyle = '#12161c'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#475569'; hist.forEach(function (h, k) { var x = 10 + k * (W - 20) / 256, bh = h / mx * (H - 40); c.fillRect(x, H - 20 - bh, (W - 20) / 256 + 0.5, bh); });
      c.strokeStyle = '#fff'; c.setLineDash([4, 3]); c.beginPath(); var xo = 10 + opt * (W - 20) / 256; c.moveTo(xo, 8); c.lineTo(xo, H - 20); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#f59e0b'; pop.forEach(function (p) { var x = 10 + p * (W - 20) / 256; c.beginPath(); c.arc(x, H - 10, 4, 0, 6.3); c.fill(); });
      c.strokeStyle = '#22c55e'; c.lineWidth = 2; var xb = 10 + best * (W - 20) / 256; c.beginPath(); c.moveTo(xb, 8); c.lineTo(xb, H - 20); c.stroke(); c.lineWidth = 1;
      c.fillStyle = '#ddd'; c.font = '11px sans-serif'; c.fillText('0', 10, H - 22 + 0); c.fillText('histogram; turuncu: bireyler, yeşil: en iyi, beyaz kesikli: en uygun eşik', 12, 14);
      var pct = fit(best) / optF * 100;
      info.innerHTML = '<div class="metric"><b>' + gen + '</b>nesil</div><div class="metric"><b>' + best + '</b>en iyi birey (eşik)</div><div class="metric"><b>' + opt + '</b>tüm eşikler denenince en uygun eşik</div><div class="metric"><b>%' + fx(pct, 1) + '</b>en iyi bireyin uygunluğu / en uygun</div><div class="metric"><b>' + evals + '</b>uygunluk hesabı sayısı (256 eşik var)</div>';
      note.innerHTML = pct > 99.5 ? '<b>Birey en uygun eşiğe çok yaklaştı.</b> Çaprazlama (iki ebeveynin ortalaması), mutasyon (rastgele sapma) ve seçilimle nesilden nesile ilerledi. Burada tek bir eşik aradığımız için 256 değeri tek tek denemek de mümkündür; genetik algoritmanın esnekliği çok parametreli aramalarda anlam kazanır.' : '<b>Bireyler tarama yapıyor.</b> Her nesilde iyi bireyler korunur, çaprazlanır ve mutasyonla biraz oynatılır. “Bir nesil ilerlet”e basıp turuncu noktaların beyaz çizgiye doğru toplandığını izle. Mutasyon çok küçükse arama yavaş, çok büyükse dağınık olur.';
    }
    reset();
  })();

  /* ---------- 3) Farklılaştırılmış gizlilik ---------- */
  (function dpLab() {
    var root = document.getElementById('dplab');
    if (!root) return;
    var TRUE = 60;
    var iE = sl(root, 'de', 'Gizlilik katsayısı ε (küçük = daha çok koruma)', 1, 50, 1, 10, draw);
    var bar = el('div', 'chips'); root.appendChild(bar);
    btn(bar, 'Yeni 20 yanıt çek', draw);
    var cv = canv(root, 480, 110), info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function laplace(b) { var u = Math.random() - 0.5; return -b * (u < 0 ? -1 : 1) * Math.log(1 - 2 * Math.abs(u)); }
    function draw() {
      var eps = +iE.value / 10, b = 1 / eps; document.getElementById('deo').textContent = fx(eps, 1);
      var ans = [], k, err = 0, lo = 1e9, hi = -1e9;
      for (k = 0; k < 20; k++) { var a = TRUE + laplace(b); ans.push(a); err += Math.abs(a - TRUE); if (a < lo) lo = a; if (a > hi) hi = a; }
      var c = cv.getContext('2d'), W = 480, H = 110, R = 30; c.fillStyle = '#12161c'; c.fillRect(0, 0, W, H);
      function X(v) { return 10 + (v - (TRUE - R)) / (2 * R) * (W - 20); }
      c.strokeStyle = '#475569'; c.beginPath(); c.moveTo(10, 70); c.lineTo(W - 10, 70); c.stroke();
      c.fillStyle = '#ddd'; c.font = '11px sans-serif'; [TRUE - 30, TRUE - 15, TRUE, TRUE + 15, TRUE + 30].forEach(function (v) { c.fillText(v, X(v) - 8, 88); });
      c.strokeStyle = '#22c55e'; c.lineWidth = 2; c.beginPath(); c.moveTo(X(TRUE), 20); c.lineTo(X(TRUE), 74); c.stroke(); c.lineWidth = 1;
      c.fillStyle = '#f59e0b'; ans.forEach(function (a, i) { var x = Math.max(10, Math.min(W - 10, X(a))); c.beginPath(); c.arc(x, 70 - 8 - (i % 5) * 7, 4, 0, 6.3); c.fill(); });
      c.fillStyle = '#ddd'; c.fillText('yeşil: gerçek sayı (' + TRUE + '), turuncu: gürültülü yanıtlar', 12, 14);
      info.innerHTML = '<div class="metric"><b>' + fx(err / 20, 1) + '</b>ortalama sapma (20 yanıt)</div><div class="metric"><b>' + fx(lo, 1) + ' – ' + fx(hi, 1) + '</b>yanıt aralığı</div><div class="metric"><b>' + fx(b, 1) + '</b>gürültü ölçeği (1 ÷ ε)</div>';
      note.innerHTML = eps <= 1 ? '<b>Güçlü koruma, kaba sayı.</b> Gürültü büyük olduğu için tek bir kişinin eklenmesi ya da çıkması yanıtlardan anlaşılmaz; ama yanıt da gerçek sayıdan epey sapar.' : eps >= 4 ? '<b>Az koruma, kesin sayı.</b> Gürültü küçük; yanıt gerçeğe çok yakın ama bir kişinin varlığı daha kolay sezilir.' : '<b>Denge:</b> sayı yine analize elverişli, tek bir kişinin katkısı gürültünün içinde kaybolur.';
    }
    draw();
  })();
})();
