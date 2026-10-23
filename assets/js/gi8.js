/* Görüntü İşleme · Bölüm 8: tek boyutlu DFT, konvolüsyon teoremi ve frekans uzayı filtrelerinin halka (ringing) etkisi.
   Sinyaller bu site için üretilmiştir; işlemler tek boyutta yapılır (görüntüdeki satır gibi düşünülebilir). */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function svgEl(name, attrs, parent) { var e = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (parent) parent.appendChild(e); return e; }
  function fx(x, d) { var k = Math.pow(10, d == null ? 1 : d); return (Math.round(x * k) / k).toString().replace('.', ','); }
  function sl(root, id, label, min, max, step, val, cb) { var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>'; root.appendChild(r); var i = r.querySelector('input'); i.addEventListener('input', cb); return i; }
  function dft(x) { var N = x.length, re = [], im = [], k, n; for (k = 0; k < N; k++) { var a = 0, b = 0; for (n = 0; n < N; n++) { var t = -2 * Math.PI * k * n / N; a += x[n] * Math.cos(t); b += x[n] * Math.sin(t); } re.push(a); im.push(b); } return { re: re, im: im }; }
  function idft(re, im) { var N = re.length, out = [], k, n; for (n = 0; n < N; n++) { var a = 0; for (k = 0; k < N; k++) { var t = 2 * Math.PI * k * n / N; a += re[k] * Math.cos(t) - im[k] * Math.sin(t); } out.push(a / N); } return out; }
  function plot(box, W, H, series, opts) {
    box.innerHTML = '';
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': opts.label }, box), L = 34, B = 18, T = 8, R = 8, lo = opts.lo, hi = opts.hi;
    function Y(v) { return H - B - (v - lo) / (hi - lo) * (H - B - T); }
    (opts.grid || []).forEach(function (g) { svgEl('line', { x1: L, x2: W - R, y1: Y(g), y2: Y(g), stroke: 'var(--line)' }, svg); var t = svgEl('text', { x: L - 4, y: Y(g) + 4, 'text-anchor': 'end', 'font-size': 10, fill: 'var(--muted)' }, svg); t.textContent = Math.round(g); });
    series.forEach(function (s) {
      var n = s.v.length, pts = s.v.map(function (v, i) { return [L + i / (n - 1) * (W - L - R), Y(v)]; });
      if (s.stem) pts.forEach(function (p) { svgEl('line', { x1: p[0], x2: p[0], y1: Y(0), y2: p[1], stroke: s.c, 'stroke-width': 3 }, svg); });
      else svgEl('path', { d: pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join(' '), fill: 'none', stroke: s.c, 'stroke-width': s.w || 2, 'stroke-dasharray': s.d || '' }, svg);
    });
    if (opts.xl) { var t = svgEl('text', { x: L, y: H - 4, 'font-size': 10, fill: 'var(--muted)' }, svg); t.textContent = opts.xl; }
  }

  /* ---------- 1) Tek boyutlu DFT ---------- */
  (function dftLab() {
    var root = document.getElementById('dftlab');
    if (!root) return;
    var N = 64;
    var i0 = sl(root, 'dd', 'Ortalama (DC) düzeyi', 0, 100, 5, 50, draw), i1 = sl(root, 'df1', 'Bileşen 1: frekans k', 1, 20, 1, 3, draw), a1 = sl(root, 'da1', 'Bileşen 1: genlik', 0, 50, 5, 30, draw), i2 = sl(root, 'df2', 'Bileşen 2: frekans k', 1, 30, 1, 12, draw), a2 = sl(root, 'da2', 'Bileşen 2: genlik', 0, 50, 5, 15, draw);
    var s1 = el('div'), s2 = el('div'); root.appendChild(s1); root.appendChild(s2);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function draw() {
      var d = +i0.value, f1 = +i1.value, g1 = +a1.value, f2 = +i2.value, g2 = +a2.value;
      ['dd', 'df1', 'da1', 'df2', 'da2'].forEach(function (id, j) { document.getElementById(id + 'o').textContent = [d, f1, g1, f2, g2][j]; });
      var x = [], n; for (n = 0; n < N; n++) x.push(d + g1 * Math.sin(2 * Math.PI * f1 * n / N) + g2 * Math.sin(2 * Math.PI * f2 * n / N));
      var F = dft(x), mag = [], k; for (k = 0; k <= N / 2; k++) mag.push(Math.sqrt(F.re[k] * F.re[k] + F.im[k] * F.im[k]) / (k === 0 || k === N / 2 ? N : N / 2));
      plot(s1, 340, 130, [{ v: x, c: 'var(--brand)' }], { lo: -10, hi: 160, grid: [0, 50, 100, 150], label: 'Sinyal', xl: 'Uzamsal alan: 64 örnekli bir satır' });
      plot(s2, 340, 130, [{ v: mag, c: 'var(--warn)', stem: true }], { lo: 0, hi: 100, grid: [0, 25, 50, 75, 100], label: 'Genlik spektrumu', xl: 'Frekans uzayı: k = 0 … 32 (k = 0 doğru akım bileşeni)' });
      var peaks = []; mag.forEach(function (m, kk) { if (m > 2) peaks.push('k=' + kk + ' (' + fx(m, 0) + ')'); });
      info.innerHTML = '<div class="metric"><b>' + peaks.join(', ') + '</b>genliği 2’yi aşan bileşenler</div><div class="metric"><b>' + (N * N).toLocaleString('tr-TR') + ' → ' + Math.round(N * Math.log2(N)).toLocaleString('tr-TR') + '</b>işlem: O(N²) → O(N log N), N = 64</div>';
      note.innerHTML = 'Spektrumda her bileşen kendi frekansında bir çubuk bırakır: <b>k = 0</b> ortalama parlaklığı (doğru akım bileşeni), diğerleri sinüs bileşenlerini gösterir. Genliği 0 yaparsan çubuk kaybolur. Çubuğun yeri değişimin <i>ne kadar hızlı</i> olduğunu, boyu ise <i>ne kadar güçlü</i> olduğunu söyler.';
    }
    draw();
  })();

  /* ---------- 2) Konvolüsyon teoremi ---------- */
  (function convLab() {
    var root = document.getElementById('convlab');
    if (!root) return;
    var N = 32, x = []; for (var n0 = 0; n0 < N; n0++) x.push(n0 >= 10 && n0 < 18 ? 100 : (n0 >= 24 && n0 < 26 ? 60 : 0));
    var iW = sl(root, 'cw', 'Çekirdek genişliği (nokta)', 3, 11, 2, 5, draw);
    var box = el('div'); root.appendChild(box);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function draw() {
      var w = +iW.value; document.getElementById('cwo').textContent = w;
      var h = []; for (var n = 0; n < N; n++) h.push(n < w ? 1 / w : 0);
      // uzamsal: dairesel konvolüsyon
      var y1 = [], m; for (n = 0; n < N; n++) { var s = 0; for (m = 0; m < N; m++) s += h[m] * x[((n - m) % N + N) % N]; y1.push(s); }
      // frekans: Y = X * H
      var X = dft(x), H = dft(h), re = [], im = [], k; for (k = 0; k < N; k++) { re.push(X.re[k] * H.re[k] - X.im[k] * H.im[k]); im.push(X.re[k] * H.im[k] + X.im[k] * H.re[k]); }
      var y2 = idft(re, im), diff = 0; for (n = 0; n < N; n++) diff = Math.max(diff, Math.abs(y1[n] - y2[n]));
      plot(box, 340, 150, [{ v: x, c: 'var(--muted)', w: 1.5, d: '4 3' }, { v: y1, c: 'var(--brand)', w: 3 }, { v: y2, c: 'var(--bad)', w: 1.5, d: '2 2' }], { lo: -10, hi: 110, grid: [0, 50, 100], label: 'Uzamsal konvolüsyon ve frekans çarpımı aynı sonucu verir', xl: 'gri kesik: girdi · mavi: uzamsal konvolüsyon · kırmızı noktalı: frekans uzayında çarpım' });
      info.innerHTML = '<div class="metric"><b>' + diff.toExponential(1).replace('.', ',') + '</b>iki yolun en büyük farkı (sayısal hata)</div><div class="metric"><b>' + (N * w) + '</b>uzamsal yol: yaklaşık N·k çarpma</div><div class="metric"><b>' + Math.round(3 * N * Math.log2(N)) + '</b>frekans yolu: üç FFT ≈ 3·N·log₂N (kabaca)</div>';
      note.innerHTML = 'Konvolüsyon teoremine göre <b>uzamsal alandaki konvolüsyon = frekans alanındaki çarpım</b>. Mavi eğri ile kırmızı noktalı eğri üst üste biner; fark yalnızca sayısal yuvarlama hatasıdır. Çekirdek büyüdükçe uzamsal yolun işlemi artar, FFT yolunun işlemi çekirdek boyutundan bağımsız kalır. İşlem dairesel olduğu için sağ uçtan çıkan değer sol uca sarılır (“sarma”).';
    }
    draw();
  })();

  /* ---------- 3) Halka artefaktı ---------- */
  (function ringLab() {
    var root = document.getElementById('ringlab');
    if (!root) return;
    var N = 128, x = []; for (var n0 = 0; n0 < N; n0++) x.push(n0 < 40 ? 20 : n0 < 88 ? 120 : 20);
    var type = 'ideal', pass = 'lp';
    var bar = el('div', 'chips'); root.appendChild(bar);
    var bar2 = el('div', 'chips'); bar2.style.marginTop = '8px'; root.appendChild(bar2);
    [['ideal', 'İdeal'], ['gauss', 'Gauss'], ['butter', 'Butterworth']].forEach(function (a) { var b = el('button', 'chip', a[1]); b.type = 'button'; b.dataset.g = 'type'; b.dataset.k = a[0]; b.addEventListener('click', function () { type = a[0]; draw(); }); bar.appendChild(b); });
    [['lp', 'Alçak geçiren'], ['hp', 'Yüksek geçiren']].forEach(function (a) { var b = el('button', 'chip', a[1]); b.type = 'button'; b.dataset.g = 'pass'; b.dataset.k = a[0]; b.addEventListener('click', function () { pass = a[0]; draw(); }); bar2.appendChild(b); });
    var iD = sl(root, 'rd', 'Kesim frekansı D₀', 2, 30, 1, 8, draw), iN = sl(root, 'rn', 'Butterworth mertebesi n', 1, 6, 1, 2, draw);
    var s1 = el('div'), s2 = el('div'); root.appendChild(s1); root.appendChild(s2);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    var X = dft(x);
    function H(D, D0, nn) {
      var h;
      if (type === 'ideal') h = D <= D0 ? 1 : 0;
      else if (type === 'gauss') h = Math.exp(-D * D / (2 * D0 * D0));
      else h = 1 / (1 + Math.pow(D / D0, 2 * nn));
      if (pass === 'hp') {
        if (type === 'ideal') h = D <= D0 ? 0 : 1;
        else if (type === 'gauss') h = 1 - Math.exp(-D * D / (2 * D0 * D0));
        else h = D === 0 ? 0 : 1 / (1 + Math.pow(D0 / D, 2 * nn));
      }
      return h;
    }
    function draw() {
      Array.prototype.forEach.call(root.querySelectorAll('.chip'), function (b) { b.setAttribute('aria-pressed', String((b.dataset.g === 'type' ? type : pass) === b.dataset.k)); });
      var D0 = +iD.value, nn = +iN.value; document.getElementById('rdo').textContent = D0; document.getElementById('rno').textContent = nn;
      var re = [], im = [], k, hs = []; for (k = 0; k < N; k++) { var D = Math.min(k, N - k), h = H(D, D0, nn); re.push(X.re[k] * h); im.push(X.im[k] * h); if (k <= 40) hs.push(h); }
      var y = idft(re, im), mn = Math.min.apply(null, y), mx = Math.max.apply(null, y), mean = y.reduce(function (s, v) { return s + v; }, 0) / N;
      plot(s1, 340, 90, [{ v: hs, c: 'var(--warn)', w: 2.5 }], { lo: -0.1, hi: 1.1, grid: [0, 1], label: 'Filtre H(D)', xl: 'Filtre H(D), D = 0 … 40 (1: geçir, 0: bastır)' });
      plot(s2, 340, 160, [{ v: x, c: 'var(--muted)', w: 1.5, d: '4 3' }, { v: y, c: 'var(--brand)', w: 2.5 }], { lo: -60, hi: 180, grid: [0, 50, 100, 150], label: 'Filtre sonucu', xl: 'gri kesik: girdi (20 / 120 basamaklı) · mavi: filtre çıktısı' });
      var overs = Math.max(0, mx - 120) + Math.max(0, 20 - mn);
      info.innerHTML = pass === 'lp' ? '<div class="metric"><b>' + fx(mx, 1) + '</b>çıktının en büyüğü (girdide 120)</div><div class="metric"><b>' + fx(mn, 1) + '</b>çıktının en küçüğü (girdide 20)</div><div class="metric"><b>' + fx(overs, 1) + '</b>aşma: dalgalanma (halka) miktarı</div>' : '<div class="metric"><b>' + fx(mean, 1) + '</b>çıktının ortalaması (girdide ' + fx(x.reduce(function (s, v) { return s + v; }, 0) / N, 1) + ')</div><div class="metric"><b>' + fx(mn, 1) + ' … ' + fx(mx, 1) + '</b>çıktı aralığı</div>';
      note.innerHTML = pass === 'lp' ? (type === 'ideal' ? '<b>İdeal filtrenin keskin kesimi halka (ringing) üretir.</b> Basamağın iki yanında dalgalanmalar görürsün: ideal filtre uzamsal uzayda sinc fonksiyonuna karşılık gelir.' : type === 'gauss' ? '<b>Gauss filtresi yumuşak geçiş verir:</b> basamak yumuşar ama dalgalanma yoktur ya da çok azdır.' : '<b>Butterworth, ideal ile Gauss arasında bir uzlaşmadır.</b> Mertebe n büyüdükçe geçiş dikleşir ve halka geri gelir; n küçükken Gauss’a benzer.') : '<b>Yüksek geçiren filtre doğru akım bileşenini (k = 0) bastırır.</b> Çıktının ortalaması sıfıra kayar; bu yüzden gösterim için normalizasyon gerekir. Düz bölgeler silinir, yalnızca basamağın olduğu yerde değişim kalır.';
    }
    draw();
  })();
})();
