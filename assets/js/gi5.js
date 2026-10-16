/* Görüntü İşleme · Bölüm 5: gürültü ve filtre laboratuvarı (ortalama, Gauss, medyan, keskinleştirme).
   Görüntü bu site için kodla üretilen 32×32 sentetik bir sahnedir. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function f1(x) { return (Math.round(x * 10) / 10).toFixed(1).replace('.', ','); }
  var S = 32, SC = 5;

  function makeClean() {
    var g = [], y, x;
    for (y = 0; y < S; y++) { g.push([]); for (x = 0; x < S; x++) { var v = x < 16 ? 70 : 170; if (x >= 6 && x < 12 && y >= 6 && y < 12) v = 235; if (x >= 20 && x < 26 && y >= 20 && y < 26) v = 20; g[y].push(v); } }
    return g;
  }
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function gauss() { var u = 0; for (var i = 0; i < 6; i++) u += rnd(); return (u - 3) / 0.7071; }
  function clamp(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }
  function px(g, y, x) { y = y < 0 ? 0 : y >= S ? S - 1 : y; x = x < 0 ? 0 : x >= S ? S - 1 : x; return g[y][x]; }
  function conv(g, k, n) {
    var r = (n - 1) / 2, out = [], y, x, i, j;
    for (y = 0; y < S; y++) { out.push([]); for (x = 0; x < S; x++) { var s = 0; for (i = -r; i <= r; i++) for (j = -r; j <= r; j++) s += k[i + r][j + r] * px(g, y + i, x + j); out[y].push(s); } }
    return out;
  }
  function boxK(n) { var k = [], i, j; for (i = 0; i < n; i++) { k.push([]); for (j = 0; j < n; j++) k[i].push(1 / (n * n)); } return k; }
  function gaussK(n) { var k = [], r = (n - 1) / 2, sg = Math.max(0.8, n / 3), s = 0, i, j; for (i = 0; i < n; i++) { k.push([]); for (j = 0; j < n; j++) { var v = Math.exp(-((i - r) * (i - r) + (j - r) * (j - r)) / (2 * sg * sg)); k[i].push(v); s += v; } } for (i = 0; i < n; i++) for (j = 0; j < n; j++) k[i][j] /= s; return k; }
  function median(g, n) {
    var r = (n - 1) / 2, out = [], y, x, i, j;
    for (y = 0; y < S; y++) { out.push([]); for (x = 0; x < S; x++) { var a = []; for (i = -r; i <= r; i++) for (j = -r; j <= r; j++) a.push(px(g, y + i, x + j)); a.sort(function (p, q) { return p - q; }); out[y].push(a[(a.length - 1) / 2]); } }
    return out;
  }
  function unsharp(g, n, amt) { var b = conv(g, gaussK(n), n), out = [], y, x; for (y = 0; y < S; y++) { out.push([]); for (x = 0; x < S; x++) out[y].push(clamp(g[y][x] + amt * (g[y][x] - b[y][x]))); } return out; }
  function mse(a, b) { var s = 0, y, x; for (y = 0; y < S; y++) for (x = 0; x < S; x++) { var d = a[y][x] - b[y][x]; s += d * d; } return s / (S * S); }
  function edge(g) { var s = 0, y, x, c = 0; for (y = 13; y <= 18; y++) { var m = 0; for (x = 13; x <= 18; x++) m = Math.max(m, Math.abs(g[y][x + 1] - g[y][x])); s += m; c++; } return s / c; }
  function draw(cv, g) { var c = cv.getContext('2d'), y, x; for (y = 0; y < S; y++) for (x = 0; x < S; x++) { var v = Math.round(clamp(g[y][x])); c.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; c.fillRect(x * SC, y * SC, SC, SC); } }

  var box = document.getElementById('filtlab');
  if (!box) return;
  var clean = makeClean(), noisy, noise = 'gauss', filt = 'mean', size = 3;

  function addNoise() {
    seed = 7 + Math.floor(Math.random() * 1000);
    noisy = clean.map(function (r) { return r.map(function (v) {
      if (noise === 'gauss') return clamp(v + 28 * gauss());
      if (noise === 'sp') { var p = rnd(); return p < 0.05 ? 0 : p > 0.95 ? 255 : v; }
      return v;
    }); });
  }
  function group(label, items, cur, cb) {
    var wrap = el('div', 'chips'); wrap.appendChild(el('span', 'tip', label + ': '));
    items.forEach(function (it) { var b = el('button', 'chip', it[1]); b.type = 'button'; b.setAttribute('aria-pressed', it[0] === cur ? 'true' : 'false'); b.addEventListener('click', function () { cb(it[0]); }); wrap.appendChild(b); });
    box.appendChild(wrap); return wrap;
  }
  var gN, gF, gS;
  function rebuild() { [gN, gF, gS].forEach(function (g) { if (g && g.parentNode) g.parentNode.removeChild(g); }); build(); }
  function build() {
    gN = group('Gürültü', [['none', 'Yok'], ['gauss', 'Gauss'], ['sp', 'Tuz-biber']], noise, function (v) { noise = v; addNoise(); rebuild(); });
    gF = group('Filtre', [['none', 'Yok'], ['mean', 'Ortalama'], ['gauss', 'Gauss'], ['median', 'Medyan'], ['unsharp', 'Keskinleştir']], filt, function (v) { filt = v; rebuild(); });
    gS = group('Çekirdek', [[3, '3×3'], [5, '5×5'], [7, '7×7']], size, function (v) { size = v; rebuild(); });
    box.insertBefore(gN, row); box.insertBefore(gF, row); box.insertBefore(gS, row);
    render();
  }
  var row = el('div', 'filt-row');
  function mk() { var d = el('figure', 'filt-fig'); var c = el('canvas'); c.width = S * SC; c.height = S * SC; c.setAttribute('role', 'img'); d.appendChild(c); var cap = el('figcaption'); d.appendChild(cap); row.appendChild(d); return { c: c, cap: cap }; }
  var A = mk(), B = mk(), C = mk();
  box.appendChild(row);
  var info = el('div', 'metrics'); box.appendChild(info);
  var note = el('div', 'callout idea'); box.appendChild(note);
  var again = el('button', 'btn', 'Yeni gürültü çek'); again.type = 'button'; again.addEventListener('click', function () { addNoise(); render(); }); box.appendChild(again);

  function apply() {
    if (filt === 'mean') return conv(noisy, boxK(size), size);
    if (filt === 'gauss') return conv(noisy, gaussK(size), size);
    if (filt === 'median') return median(noisy, size);
    if (filt === 'unsharp') return unsharp(noisy, size, 1.5);
    return noisy;
  }
  function render() {
    var out = apply();
    draw(A.c, clean); draw(B.c, noisy); draw(C.c, out);
    A.cap.textContent = 'Temiz sahne'; B.cap.textContent = 'Gürültülü girdi'; C.cap.textContent = 'Sonuç';
    A.c.setAttribute('aria-label', 'Temiz görüntü'); B.c.setAttribute('aria-label', 'Gürültülü görüntü'); C.c.setAttribute('aria-label', 'Filtre sonucu');
    var mi = mse(noisy, clean), mo = mse(out, clean);
    info.innerHTML = '<div class="metric"><b>' + Math.round(mi) + '</b>girdi hatası (MSE)</div><div class="metric"><b>' + Math.round(mo) + '</b>sonuç hatası (MSE)</div><div class="metric"><b>' + Math.round(edge(out)) + '</b>kenar dikliği (temiz: 100)</div>';
    var t = noise === 'none' && filt !== 'none' ? 'Gürültü yokken yumuşatma yalnızca kenarı bulanıklaştırır; keskinleştirme ise kenar dikliğini aşırı artırır.' :
      filt === 'none' ? 'Filtre yok: hata girdiyle aynı. Bir filtre seç.' :
      filt === 'mean' ? '<b>Ortalama:</b>gürültüyü düşürür ama kenarı da bulanıklaştırır (kenar dikliği düşer). Çekirdek büyüdükçe ikisi de artar. Tuz-biberde uç değerler ortalamaya karışıp leke olarak kalır.' :
      filt === 'gauss' ? '<b>Gauss:</b>merkeze daha çok ağırlık verir; ortalamadan biraz daha doğal bir yumuşatma. Yine de kenar bulanır.' :
      filt === 'median' ? '<b>Medyan:</b>sıralanmış değerlerin ortancasını alır; tuz-biber gibi uç değerleri tamamen atar ve kenarı büyük ölçüde korur. Her pencerede sıralama gerektirdiği için biraz daha yavaştır.' :
      '<b>Keskinleştirme (unsharp):</b>görüntüden bulanık hâlini çıkarıp farkı ekler: kenar dikliği artar. Ama gürültü de “detay” sanılıp güçlenir; hata artabilir. Önce yumuşat, sonra keskinleştir.';
    note.innerHTML = t;
  }
  addNoise(); build();
})();
