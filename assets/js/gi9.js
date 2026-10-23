/* Görüntü İşleme · Bölüm 9: gürültü türleri (dağılım ve görüntü), filtre karşılaştırması (ortalama, medyan, alfa-kırpmalı, adaptif)
   ve ters filtre ile Wiener filtresi (tek boyutlu bulanıklık). Görüntüler ve sinyaller bu site için üretilmiştir. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function svgEl(name, attrs, parent) { var e = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (parent) parent.appendChild(e); return e; }
  function fx(x, d) { var k = Math.pow(10, d == null ? 1 : d); return (Math.round(x * k) / k).toString().replace('.', ','); }
  function clamp(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }
  function sl(root, id, label, min, max, step, val, cb) { var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>'; root.appendChild(r); var i = r.querySelector('input'); i.addEventListener('input', cb); return i; }
  var S = 32, SC = 4;
  function scene(edgeOnly) {
    var g = [], y, x;
    for (y = 0; y < S; y++) { g.push([]); for (x = 0; x < S; x++) { var v = x < 16 ? 70 : 170; if (!edgeOnly) { if (x >= 5 && x < 11 && y >= 5 && y < 11) v = 230; if (x >= 21 && x < 27 && y >= 20 && y < 26) v = 25; } g[y].push(v); } }
    return g;
  }
  var seed = 11;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function gauss() { var u1 = Math.max(rnd(), 1e-9), u2 = rnd(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); }
  function expo(m) { return -m * Math.log(Math.max(rnd(), 1e-9)); }
  function poisson(l) { var L = Math.exp(-l), k = 0, p = 1; do { k++; p *= rnd(); } while (p > L); return k - 1; }
  function draw(cv, g) { var c = cv.getContext('2d'), y, x; for (y = 0; y < S; y++) for (x = 0; x < S; x++) { var v = Math.round(clamp(g[y][x])); c.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; c.fillRect(x * SC, y * SC, SC, SC); } }
  function canv(parent) { var c = el('canvas'); c.width = S * SC; c.height = S * SC; c.style.cssText = 'border:1px solid var(--line);border-radius:6px;max-width:100%;height:auto;image-rendering:pixelated'; parent.appendChild(c); return c; }
  function psnr(a, b) { var s = 0, y, x; for (y = 0; y < S; y++) for (x = 0; x < S; x++) { var d = a[y][x] - b[y][x]; s += d * d; } s /= S * S; return s === 0 ? 99 : 10 * Math.log10(255 * 255 / s); }

  /* ---------- 1) Gürültü türleri ---------- */
  (function noiseLab() {
    var root = document.getElementById('noiselab');
    if (!root) return;
    var T = [['gauss', 'Gauss'], ['sp', 'Tuz-karabiber'], ['speckle', 'Benek (speckle)'], ['poisson', 'Poisson'], ['uni', 'Düzgün'], ['exp', 'Üstel'], ['ray', 'Rayleigh'], ['gam', 'Gamma']];
    var cur = 'gauss', clean = scene(), noisy, eta;
    var bar = el('div', 'chips'); root.appendChild(bar);
    T.forEach(function (t) { var b = el('button', 'chip', t[1]); b.type = 'button'; b.dataset.k = t[0]; b.addEventListener('click', function () { cur = t[0]; make(); }); bar.appendChild(b); });
    var iS = sl(root, 'ns', 'Gürültü şiddeti', 1, 10, 1, 4, make);
    var imgs = el('div'); imgs.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;margin:10px 0'; root.appendChild(imgs);
    var cA = canv(imgs), cB = canv(imgs);
    var hist = el('div'); root.appendChild(hist);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function sample(f, s) {
      switch (cur) {
        case 'gauss': return f + 5 * s * gauss();
        case 'sp': { var p = rnd(); return p < 0.0075 * s ? 0 : p < 0.015 * s ? 255 : f; }
        case 'speckle': { var L = Math.max(1, 12 - s), a = 0, i; for (i = 0; i < L; i++) a += expo(1); return f * a / L; }
        case 'poisson': { var k = 2 * s; return k * poisson(f / k); }
        case 'uni': return f + (rnd() * 2 - 1) * 6 * s;
        case 'exp': return f + expo(5 * s);
        case 'ray': { var b = 4 * s; return f + b * Math.sqrt(-2 * Math.log(Math.max(rnd(), 1e-9))); }
        case 'gam': { var sh = 2, sc = 3 * s, g2 = 0; for (i = 0; i < sh; i++) g2 += expo(sc); return f + g2; }
      }
    }
    function make() {
      Array.prototype.forEach.call(bar.children, function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === cur)); });
      var s = +iS.value; document.getElementById('nso').textContent = s; seed = 11 + s * 7;
      noisy = clean.map(function (r) { return r.map(function (v) { return clamp(Math.round(sample(v, s))); }); });
      eta = []; var y, x, sum = 0, sq = 0, bins = []; for (var i = 0; i < 22; i++) bins.push(0);
      for (y = 0; y < S; y++) for (x = 0; x < S; x++) { var d = noisy[y][x] - clean[y][x]; sum += d; sq += d * d; var bi = Math.floor((d + 110) / 10); bi = Math.max(0, Math.min(21, bi)); bins[bi]++; }
      var n = S * S, mean = sum / n, sd = Math.sqrt(Math.max(0, sq / n - mean * mean));
      draw(cA, clean); draw(cB, noisy);
      hist.innerHTML = ''; var W = 340, H = 110, svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Gürültü değerlerinin dağılımı' }, hist), mx = Math.max.apply(null, bins);
      bins.forEach(function (b, i) { var h = b / mx * (H - 26); svgEl('rect', { x: 10 + i * (W - 20) / 22, y: H - 16 - h, width: (W - 20) / 22 - 2, height: h, fill: 'var(--brand)' }, svg); });
      svgEl('line', { x1: 10 + 11 * (W - 20) / 22 - 1, x2: 10 + 11 * (W - 20) / 22 - 1, y1: 6, y2: H - 16, stroke: 'var(--bad)', 'stroke-dasharray': '3 3' }, svg);
      var t = svgEl('text', { x: 10, y: H - 3, 'font-size': 10, fill: 'var(--muted)' }, svg); t.textContent = 'gürültü değeri (g − f): −110 … +110 (kırmızı kesik çizgi: 0)';
      info.innerHTML = '<div class="metric"><b>' + fx(mean, 1) + '</b>gürültünün ortalaması</div><div class="metric"><b>' + fx(sd, 1) + '</b>standart sapması</div><div class="metric"><b>' + fx(psnr(clean, noisy), 1) + ' dB</b>PSNR (temiz ile gürültülü)</div>';
      var msg = { gauss: '<b>Gauss:</b> sıfır ortalamalı çan eğrisi; toplayıcı (additive); her piksel için bağımsız.', sp: '<b>Tuz-karabiber:</b> rastgele pikseller 0 ya da 255 ile <b>değiştirilir</b>; histogramda iki uçta tepe (ve ortada büyük sütun: gürültüsüz pikseller). Seyrek bir gürültüdür.', speckle: '<b>Benek:</b> çarpımsal (g = f × η); gürültü parlak bölgede daha büyüktür. Burada parlaklığa bağlı olarak değişen sapmaya dikkat et.', poisson: '<b>Poisson:</b> sinyale bağımlı; varyans ortalamaya eşit, parlak pikselde gürültü daha büyük.', uni: '<b>Düzgün:</b> aralık içinde her değer eşit olasılıkta: dikdörtgen biçimli dağılım.', exp: '<b>Üstel:</b> yalnızca pozitif (tek taraflı); histogram sağa doğru azalır.', ray: '<b>Rayleigh:</b> yalnızca pozitif, sağa çarpık, sıfırdan biraz uzakta tepe.', gam: '<b>Gamma:</b> yalnızca pozitif, sağa çarpık, şekil ve ölçek parametrelerine göre esnek.' };
      note.innerHTML = msg[cur] + ' Şiddeti artırınca PSNR düşer.';
    }
    make();
  })();

  /* ---------- 2) Filtre karşılaştırması ---------- */
  (function filterLab() {
    var root = document.getElementById('filtlab9');
    if (!root) return;
    var clean = scene(), noise = 'gauss', filt = 'mean', noisy, sigma = 20;
    var bar = el('div', 'chips'), bar2 = el('div', 'chips'); bar2.style.marginTop = '8px'; root.appendChild(bar); root.appendChild(bar2);
    [['gauss', 'Gauss gürültüsü'], ['sp', 'Tuz-karabiber']].forEach(function (a) { var b = el('button', 'chip', a[1]); b.type = 'button'; b.dataset.g = 'n'; b.dataset.k = a[0]; b.addEventListener('click', function () { noise = a[0]; addNoise(); render(); }); bar.appendChild(b); });
    [['none', 'Filtre yok'], ['mean', 'Ortalama 3×3'], ['median', 'Medyan 3×3'], ['trim', 'Alfa-kırpmalı ortalama 3×3'], ['adapt', 'Adaptif (yerel varyans) 5×5']].forEach(function (a) { var b = el('button', 'chip', a[1]); b.type = 'button'; b.dataset.g = 'f'; b.dataset.k = a[0]; b.addEventListener('click', function () { filt = a[0]; render(); }); bar2.appendChild(b); });
    var iS = sl(root, 'fs', 'Gauss gürültü σ (ya da tuz-karabiber yoğunluğu)', 5, 40, 5, 20, function () { sigma = +iS.value; addNoise(); render(); });
    var imgs = el('div'); imgs.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;margin:10px 0'; root.appendChild(imgs);
    var cA = canv(imgs), cB = canv(imgs);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function addNoise() { seed = 5 + sigma; noisy = clean.map(function (r) { return r.map(function (v) { if (noise === 'gauss') return clamp(v + sigma * gauss()); var p = rnd(), d = sigma / 400; return p < d ? 0 : p < 2 * d ? 255 : v; }); }); }
    function px(a, y, x) { y = y < 0 ? 0 : y >= S ? S - 1 : y; x = x < 0 ? 0 : x >= S ? S - 1 : x; return a[y][x]; }
    function win(a, y, x, r) { var o = [], i, j; for (i = -r; i <= r; i++) for (j = -r; j <= r; j++) o.push(px(a, y + i, x + j)); return o; }
    function apply() {
      if (filt === 'none') return noisy;
      var nv = noise === 'gauss' ? sigma * sigma : 0;
      return noisy.map(function (row, y) { return row.map(function (v, x) {
        if (filt === 'mean') { var w = win(noisy, y, x, 1); return w.reduce(function (s, t) { return s + t; }, 0) / 9; }
        if (filt === 'median') { var m = win(noisy, y, x, 1).sort(function (p, q) { return p - q; }); return m[4]; }
        if (filt === 'trim') { var t = win(noisy, y, x, 1).sort(function (p, q) { return p - q; }).slice(2, 7); return t.reduce(function (s, u) { return s + u; }, 0) / 5; }
        var a = win(noisy, y, x, 2), mu = a.reduce(function (s, u) { return s + u; }, 0) / a.length, va = a.reduce(function (s, u) { return s + (u - mu) * (u - mu); }, 0) / a.length;
        var k = va > 0 ? Math.min(1, Math.max(nv, 1) / va) : 1; return v + k * (mu - v);
      }); });
    }
    function edge(a) { var s = 0, y; for (y = 6; y < 20; y++) s += Math.abs(a[y][16] - a[y][15]); return s / 14; }
    function render() {
      Array.prototype.forEach.call(root.querySelectorAll('.chip'), function (b) { b.setAttribute('aria-pressed', String((b.dataset.g === 'n' ? noise : filt) === b.dataset.k)); });
      document.getElementById('fso').textContent = sigma;
      var out = apply(); draw(cA, noisy); draw(cB, out);
      info.innerHTML = '<div class="metric"><b>' + fx(psnr(clean, noisy), 1) + ' dB</b>gürültülü görüntünün PSNR’si</div><div class="metric"><b>' + fx(psnr(clean, out), 1) + ' dB</b>süzülmüş görüntünün PSNR’si</div><div class="metric"><b>' + fx(edge(out), 0) + '</b>kenarın iki yanındaki fark (temizde 100)</div>';
      var msg = { none: 'Soldaki gürültülü görüntü; sağdaki aynısıdır.', mean: 'Ortalama filtresi gürültüyü azaltır ama kenarı da yumuşatır (kenar farkı 100’ün altına iner). Tuz-karabiberde aykırı değerleri yayar.', median: 'Medyan, tuz-karabiber için en etkili yöntemdir: aykırı değerler sıralamada uçlara gider ve ortadan seçilmez. Kenarı da ortalamadan iyi korur.', trim: 'Alfa-kırpmalı ortalama sıralı değerlerin iki ucunu atıp kalanın ortalamasını alır: hem darbe gürültüsüne hem Gauss gürültüsüne dayanır; kırpma arttıkça medyana, azaldıkça ortalamaya yaklaşır.', adapt: 'Adaptif filtre yerel varyansa bakar: düz bölgede varyans gürültü varyansına yakınsa güçlü süzer, kenarın yanında varyans büyük olduğu için az süzer. Bu yüzden kenar farkı korunur. (Gauss gürültüsü için gürültü varyansı biliniyormuş gibi alınır.)' };
      note.innerHTML = (filt === 'adapt' && noise === 'sp') ? 'Bu basit adaptif filtre Gauss türü bir gürültü varyansı varsayar. Tuz-karabiber darbe gürültüsünde bu varsayım yoktur, bu yüzden filtre neredeyse hiç süzmez; darbe gürültüsü için medyan ya da uyarlanabilir medyan kullanılır.' : msg[filt];
    }
    addNoise(); render();
  })();

  /* ---------- 3) Ters filtre ve Wiener ---------- */
  (function wienerLab() {
    var root = document.getElementById('wienerlab');
    if (!root) return;
    var N = 128, x = []; for (var n0 = 0; n0 < N; n0++) x.push(n0 >= 30 && n0 < 50 ? 100 : (n0 >= 70 && n0 < 74 ? 130 : (n0 >= 90 && n0 < 110 ? 60 : 10)));
    var mode = 'wiener';
    var bar = el('div', 'chips'); root.appendChild(bar);
    [['inv', 'Ters filtreleme  G / H'], ['wiener', 'Wiener  H* / (|H|² + K)']].forEach(function (a) { var b = el('button', 'chip', a[1]); b.type = 'button'; b.dataset.k = a[0]; b.addEventListener('click', function () { mode = a[0]; draw(); }); bar.appendChild(b); });
    var iN = sl(root, 'wn', 'Gürültü σ', 0, 5, 0.5, 1, draw), iK = sl(root, 'wk', 'K (Wiener): sinyal-gürültü oranının tersi', 0.0001, 0.1, 0.0001, 0.01, draw);
    var box = el('div'); root.appendChild(box);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function dft(a) { var re = [], im = [], k, n, len = a.length; for (k = 0; k < len; k++) { var r = 0, i = 0; for (n = 0; n < len; n++) { var t = -2 * Math.PI * k * n / len; r += a[n] * Math.cos(t); i += a[n] * Math.sin(t); } re.push(r); im.push(i); } return [re, im]; }
    function idft(re, im) { var out = [], k, n, len = re.length; for (n = 0; n < len; n++) { var r = 0; for (k = 0; k < len; k++) { var t = 2 * Math.PI * k * n / len; r += re[k] * Math.cos(t) - im[k] * Math.sin(t); } out.push(r / len); } return out; }
    var psf = []; (function () { var s = 0, i; for (i = 0; i < N; i++) { var d = Math.min(i, N - i); psf.push(Math.exp(-d * d / (2 * 3 * 3))); s += psf[i]; } for (i = 0; i < N; i++) psf[i] /= s; })();
    var H = dft(psf), X = dft(x), Gb = [], Gi = [], k0;
    for (k0 = 0; k0 < N; k0++) { Gb.push(X[0][k0] * H[0][k0] - X[1][k0] * H[1][k0]); Gi.push(X[0][k0] * H[1][k0] + X[1][k0] * H[0][k0]); }
    var blurred = idft(Gb, Gi);
    function draw() {
      Array.prototype.forEach.call(bar.children, function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === mode)); });
      var sg = +iN.value, K = +iK.value; document.getElementById('wno').textContent = fx(sg, 1); document.getElementById('wko').textContent = fx(K, 4);
      seed = 99; var g = blurred.map(function (v) { return v + sg * gauss(); }), G = dft(g), re = [], im = [], k, mx = 0;
      for (k = 0; k < N; k++) {
        var h2 = H[0][k] * H[0][k] + H[1][k] * H[1][k], a, b;
        if (mode === 'inv') { var d = Math.max(h2, 1e-30); a = (G[0][k] * H[0][k] + G[1][k] * H[1][k]) / d; b = (G[1][k] * H[0][k] - G[0][k] * H[1][k]) / d; }
        else { a = (G[0][k] * H[0][k] + G[1][k] * H[1][k]) / (h2 + K); b = (G[1][k] * H[0][k] - G[0][k] * H[1][k]) / (h2 + K); }
        re.push(a); im.push(b);
      }
      var rest = idft(re, im), mse = 0, n; for (n = 0; n < N; n++) mse += (rest[n] - x[n]) * (rest[n] - x[n]); mse /= N;
      var mseB = 0; for (n = 0; n < N; n++) mseB += (g[n] - x[n]) * (g[n] - x[n]); mseB /= N;
      var lo = -40, hi = 180, Wd = 340, Hh = 170; box.innerHTML = '';
      var svg = svgEl('svg', { viewBox: '0 0 ' + Wd + ' ' + Hh, role: 'img', 'aria-label': 'Özgün, bulanık ve gürültülü, onarılmış sinyal' }, box);
      function Y(v) { return Hh - 16 - (Math.max(lo - 200, Math.min(hi + 400, v)) - lo) / (hi - lo) * (Hh - 24); }
      function path(a, c, w, d) { svgEl('path', { d: a.map(function (v, i) { return (i ? 'L' : 'M') + (8 + i / (N - 1) * (Wd - 16)) + ' ' + Math.max(-60, Math.min(Hh + 60, Y(v))); }).join(' '), fill: 'none', stroke: c, 'stroke-width': w, 'stroke-dasharray': d || '' }, svg); }
      svgEl('line', { x1: 8, x2: Wd - 8, y1: Y(0), y2: Y(0), stroke: 'var(--line)' }, svg);
      path(g, 'var(--muted)', 1.5, '4 3'); path(x, 'var(--ok)', 2.5); path(rest, 'var(--bad)', 2);
      var t = svgEl('text', { x: 8, y: Hh - 3, 'font-size': 10, fill: 'var(--muted)' }, svg); t.textContent = 'yeşil: özgün · gri kesik: bulanık+gürültülü · kırmızı: onarılmış (çizim kırpılmıştır)';
      info.innerHTML = '<div class="metric"><b>' + fx(mseB, 1) + '</b>bulanık + gürültülü sinyalin hatası (MSE)</div><div class="metric"><b>' + (mse > 1e6 ? '> 1.000.000' : Math.round(mse).toLocaleString('tr-TR')) + '</b>onarılmış sinyalin hatası (MSE)</div>';
      note.innerHTML = mode === 'inv' ? '<b>Ters filtreleme gürültüyü patlatır.</b> Bulanıklık fonksiyonu yüksek frekanslarda sıfıra yakın olduğu için bu bölgelerde G / H çok büyük değerler alır; gürültü katlanarak büyür. Gürültüyü 0 yaparsan yine de yuvarlama hataları sonucu bozabilir.' : '<b>Wiener filtresi bölmeyi K ile dengeler.</b> H(u, v) küçük olduğu frekanslarda paydaya K eklenir, bu yüzden gürültü büyümez. K çok küçükse ters filtreye, çok büyükse aşırı yumuşatmaya yaklaşırsın; ikisi arasında bir en iyi nokta vardır.';
    }
    draw();
  })();
})();
