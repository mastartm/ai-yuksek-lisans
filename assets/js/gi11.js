/* Görüntü İşleme · Bölüm 11: renk uzayları (RGB, HSV, CMYK, YCbCr), renk eşikleme (RGB ile HSV karşılaştırması)
   ve k-ortalamalarla renk kümeleme. Renkler ve sahne bu site için üretilmiştir. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function fx(x, d) { var k = Math.pow(10, d == null ? 0 : d); return (Math.round(x * k) / k).toString().replace('.', ','); }
  function clamp(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }
  function sl(root, id, label, min, max, step, val, cb) { var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>'; root.appendChild(r); var i = r.querySelector('input'); i.addEventListener('input', cb); return i; }
  function hsv(r, g, b) { r /= 255; g /= 255; b /= 255; var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0; if (d > 0) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; } return [h, mx === 0 ? 0 : d / mx, mx]; }

  /* ---------- 1) Renk uzayları ---------- */
  (function spaceLab() {
    var root = document.getElementById('spacelab');
    if (!root) return;
    var iR = sl(root, 'sr', 'Kırmızı (R)', 0, 255, 1, 60, draw), iG = sl(root, 'sg', 'Yeşil (G)', 0, 255, 1, 170, draw), iB = sl(root, 'sb', 'Mavi (B)', 0, 255, 1, 70, draw), iV = sl(root, 'sv', 'Parlaklığı ölçekle', 20, 100, 1, 100, draw);
    var bar = el('div', 'chips'); root.appendChild(bar);
    [['Yaprak yeşili', 60, 170, 70], ['Trafik tabelası kırmızısı', 200, 40, 40], ['Gökyüzü mavisi', 50, 80, 190], ['Sarı', 230, 200, 40]].forEach(function (c) { var b = el('button', 'chip', c[0]); b.type = 'button'; b.addEventListener('click', function () { iR.value = c[1]; iG.value = c[2]; iB.value = c[3]; iV.value = 100; draw(); }); bar.appendChild(b); });
    var sw = el('div'); sw.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;margin:10px 0'; root.appendChild(sw);
    var s1 = el('div'), s2 = el('div'); [s1, s2].forEach(function (s) { s.style.cssText = 'width:120px;height:70px;border-radius:10px;border:1px solid var(--line);display:flex;align-items:flex-end;padding:6px;font-size:.78rem;color:#fff;text-shadow:0 0 3px #000'; sw.appendChild(s); });
    var tb = el('div', 'scroll-x'); root.appendChild(tb);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function draw() {
      var r0 = +iR.value, g0 = +iG.value, b0 = +iB.value, k = +iV.value / 100, r = Math.round(r0 * k), g = Math.round(g0 * k), b = Math.round(b0 * k);
      document.getElementById('sro').textContent = r0; document.getElementById('sgo').textContent = g0; document.getElementById('sbo').textContent = b0; document.getElementById('svo').textContent = '%' + Math.round(k * 100);
      s1.style.background = 'rgb(' + r0 + ',' + g0 + ',' + b0 + ')'; s1.textContent = 'özgün'; s2.style.background = 'rgb(' + r + ',' + g + ',' + b + ')'; s2.textContent = 'ölçeklenmiş';
      var h1 = hsv(r0, g0, b0), h2 = hsv(r, g, b), kk = 1 - Math.max(r, g, b) / 255;
      var c = kk >= 1 ? 0 : (1 - r / 255 - kk) / (1 - kk), m = kk >= 1 ? 0 : (1 - g / 255 - kk) / (1 - kk), y = kk >= 1 ? 0 : (1 - b / 255 - kk) / (1 - kk);
      var Y = 0.299 * r + 0.587 * g + 0.114 * b, Cb = 128 + (-0.168736 * r - 0.331264 * g + 0.5 * b), Cr = 128 + (0.5 * r - 0.418688 * g - 0.081312 * b);
      tb.innerHTML = '<table class="cmp"><thead><tr><th>Uzay</th><th>Özgün renk</th><th>Ölçeklenmiş renk</th></tr></thead><tbody>' +
        '<tr><td><b>RGB</b></td><td>' + r0 + ', ' + g0 + ', ' + b0 + '</td><td>' + r + ', ' + g + ', ' + b + '</td></tr>' +
        '<tr><td><b>HSV</b> (ton°, doygunluk, değer)</td><td>' + fx(h1[0]) + '°, ' + fx(h1[1], 2) + ', ' + fx(h1[2], 2) + '</td><td><b>' + fx(h2[0]) + '°</b>, ' + fx(h2[1], 2) + ', ' + fx(h2[2], 2) + '</td></tr>' +
        '<tr><td><b>CMY</b> (255 − RGB)</td><td>' + (255 - r0) + ', ' + (255 - g0) + ', ' + (255 - b0) + '</td><td>' + (255 - r) + ', ' + (255 - g) + ', ' + (255 - b) + '</td></tr>' +
        '<tr><td><b>CMYK</b> (C, M, Y, K)</td><td>—</td><td>' + fx(c, 2) + ', ' + fx(m, 2) + ', ' + fx(y, 2) + ', ' + fx(kk, 2) + '</td></tr>' +
        '<tr><td><b>YCbCr</b> (parlaklık + renk farkları)</td><td>—</td><td>' + fx(Y) + ', ' + fx(Cb) + ', ' + fx(Cr) + '</td></tr></tbody></table>';
      note.innerHTML = k < 0.999 ? '<b>Parlaklığı azalttın: RGB değerlerinin üçü de değişti, HSV’de ton (H) aynı kaldı.</b> Notta HSV/HSI’nın parlaklık değişimlerinden bağımsız olarak renk tonunu koruduğu söylenir; renk tabanlı segmentasyonda bu yüzden RGB yerine tercih edilir. YCbCr’de yalnızca Y (parlaklık) ağırlıklı değişir.' : 'Renk aynı, yalnızca farklı koordinat sistemlerinde yazılmış. “Parlaklığı ölçekle” kaydırıcısını azalt: RGB’nin üç değeri de değişir ama HSV’deki ton değişmez.';
    }
    draw();
  })();

  /* ---------- Ortak: sahne ---------- */
  var W = 40, SC = 4, scene = [], truth = [];
  (function build() {
    var seed = 31; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    var x, y;
    for (y = 0; y < W; y++) for (x = 0; x < W; x++) {
      var c = [225, 210, 175], t = 0;
      var dx = (x - 14) / 11, dy = (y - 18) / 7;
      if (dx * dx + dy * dy <= 1) { t = 1; c = x < 14 ? [60, 170, 70] : [24, 68, 30]; }
      var ex = (x - 30) / 6, ey = (y - 9) / 4;
      if (ex * ex + ey * ey <= 1) { t = 1; c = [64, 172, 76]; }
      var rx = x - 28, ry = y - 27;
      if (rx * rx + ry * ry <= 36) { t = 2; c = [200, 40, 40]; }
      if (y >= 34) { t = 3; c = [50, 80, 190]; }
      scene.push([clamp(c[0] + (rnd() - 0.5) * 12), clamp(c[1] + (rnd() - 0.5) * 12), clamp(c[2] + (rnd() - 0.5) * 12)]); truth.push(t);
    }
  })();
  function canv(parent) { var c = el('canvas'); c.width = W * SC; c.height = W * SC; c.style.cssText = 'border:1px solid var(--line);border-radius:6px;max-width:100%;height:auto;image-rendering:pixelated'; parent.appendChild(c); return c; }
  function paint(cv, fn) { var c = cv.getContext('2d'), i; for (i = 0; i < scene.length; i++) { var p = fn(i); c.fillStyle = 'rgb(' + Math.round(p[0]) + ',' + Math.round(p[1]) + ',' + Math.round(p[2]) + ')'; c.fillRect((i % W) * SC, Math.floor(i / W) * SC, SC, SC); } }

  /* ---------- 2) Renk eşikleme ---------- */
  (function thresholdLab() {
    var root = document.getElementById('threshlab');
    if (!root) return;
    var mode = 'hsv', REF = [60, 170, 70];
    var bar = el('div', 'chips'); root.appendChild(bar);
    [['rgb', 'RGB uzaklığı ile'], ['hsv', 'HSV tonu ile']].forEach(function (a) { var b = el('button', 'chip', a[1]); b.type = 'button'; b.dataset.k = a[0]; b.addEventListener('click', function () { mode = a[0]; draw(); }); bar.appendChild(b); });
    var iT = sl(root, 'tt', 'Tolerans', 5, 150, 5, 30, draw);
    var imgs = el('div'); imgs.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;margin:10px 0'; root.appendChild(imgs);
    var cA = canv(imgs), cB = canv(imgs);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    var refH = hsv(REF[0], REF[1], REF[2])[0];
    function draw() {
      Array.prototype.forEach.call(bar.children, function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === mode)); });
      var T = +iT.value; document.getElementById('tto').textContent = mode === 'rgb' ? T : T + '°';
      var hit = [], i, leaf = 0, caught = 0, wrong = 0;
      for (i = 0; i < scene.length; i++) {
        var p = scene[i], ok;
        if (mode === 'rgb') ok = Math.sqrt(Math.pow(p[0] - REF[0], 2) + Math.pow(p[1] - REF[1], 2) + Math.pow(p[2] - REF[2], 2)) <= T;
        else { var h = hsv(p[0], p[1], p[2]), dh = Math.abs(h[0] - refH); dh = Math.min(dh, 360 - dh); ok = dh <= T / 2 && h[1] > 0.3 && h[2] > 0.1; }
        hit.push(ok); if (truth[i] === 1) { leaf++; if (ok) caught++; } else if (ok) wrong++;
      }
      paint(cA, function (i) { return scene[i]; }); paint(cB, function (i) { return hit[i] ? [30, 200, 60] : [20, 20, 20]; });
      info.innerHTML = '<div class="metric"><b>%' + Math.round(caught / leaf * 100) + '</b>yaprak piksellerinin yakalanan kısmı</div><div class="metric"><b>' + wrong + '</b>yaprak olmayıp yanlışlıkla seçilen piksel</div>';
      note.innerHTML = mode === 'rgb' ? '<b>RGB uzaklığı gölgeye yenilir.</b> Gölgedeki yaprak parçası aynı renk tonunda ama çok daha koyu olduğu için RGB uzaklığı büyüktür; toleransı büyütürsen önce yaprağın gölgesi gelmeden başka alanlar (koyu mavi vb.) seçilmeye başlar.' : '<b>HSV tonu parlaklıktan bağımsız olduğu için gölgedeki yaprak da yakalanır.</b> Notta HSV’de ton bileşeninin nesneleri ayırt etmede kritik olduğu, gölge ya da parlaklık değişimlerinden bağımsız ton eşiklemesiyle nesnelerin arka plandan ayrılabildiği söylenir. Tolerans (derece) çok büyürse başka tonlar da girer.';
    }
    draw();
  })();

  /* ---------- 3) k-ortalamalarla renk kümeleme ---------- */
  (function kmeansColorLab() {
    var root = document.getElementById('kmeanscolor');
    if (!root) return;
    var iK = sl(root, 'kc', 'Küme sayısı k', 2, 6, 1, 5, draw);
    var imgs = el('div'); imgs.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;margin:10px 0'; root.appendChild(imgs);
    var cA = canv(imgs), cB = canv(imgs);
    var pal = el('div'); pal.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin:6px 0'; root.appendChild(pal);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function d2(a, b) { return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]) + (a[2] - b[2]) * (a[2] - b[2]); }
    function run(k) {
      var C = [scene[0].slice()], i, j, lab = [];
      while (C.length < k) { var best = -1, bi = 0; for (i = 0; i < scene.length; i++) { var m = Math.min.apply(null, C.map(function (c) { return d2(scene[i], c); })); if (m > best) { best = m; bi = i; } } C.push(scene[bi].slice()); }
      for (var it = 0; it < 15; it++) {
        lab = scene.map(function (p) { var b = 0; for (j = 1; j < k; j++) if (d2(p, C[j]) < d2(p, C[b])) b = j; return b; });
        for (j = 0; j < k; j++) { var s = [0, 0, 0], n = 0; scene.forEach(function (p, q) { if (lab[q] === j) { s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; n++; } }); if (n) C[j] = [s[0] / n, s[1] / n, s[2] / n]; }
      }
      var err = 0; scene.forEach(function (p, q) { err += d2(p, C[lab[q]]); });
      return { C: C, lab: lab, err: err / scene.length };
    }
    function draw() {
      var k = +iK.value; document.getElementById('kco').textContent = k; var r = run(k);
      paint(cA, function (i) { return scene[i]; }); paint(cB, function (i) { return r.C[r.lab[i]]; });
      pal.innerHTML = ''; r.C.forEach(function (c) { var s = el('div'); s.style.cssText = 'width:34px;height:34px;border-radius:8px;border:1px solid var(--line);background:rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')'; pal.appendChild(s); });
      info.innerHTML = '<div class="metric"><b>' + k + '</b>renk kümesi</div><div class="metric"><b>' + fx(Math.sqrt(r.err), 1) + '</b>piksel başına ortalama renk hatası (RGB uzaklığı)</div>';
      note.innerHTML = k < 5 ? 'Sahnede beş ayrı renk bölgesi var (bej zemin, aydınlık yaprak, gölgeli yaprak, kırmızı tabela, mavi bant). <b>k küçükse farklı bölgeler tek kümede birleşir.</b> k’yı artırdıkça bölgeler ayrışır.' : k === 5 ? '<b>k = 5 beş bölgeyi ayırır.</b> Renk dağılımına bakan istatistiksel kümeleme, tek bir renk eşiğine göre daha esnektir ve çok nesneli sahnelerde işe yarar.' : '<b>k fazla olunca</b> aynı bölge birkaç kümeye bölünür; hata düşer ama nesne anlamı kaybolur.';
    }
    draw();
  })();
})();
