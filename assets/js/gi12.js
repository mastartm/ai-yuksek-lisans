/* Görüntü İşleme · Bölüm 12: eşikleme (genel / Otsu / yerel), bölge büyütme ve bölme-birleştirme (dörtlü ağaç).
   Görüntüler bu site için üretilmiştir. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function sl(root, id, label, min, max, step, val, cb) { var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>'; root.appendChild(r); var i = r.querySelector('input'); i.addEventListener('input', cb); return i; }
  function clamp(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }
  function canv(parent, w, sc) { var c = el('canvas'); c.width = w * sc; c.height = w * sc; c.style.cssText = 'border:1px solid var(--line);border-radius:6px;max-width:100%;height:auto;image-rendering:pixelated'; parent.appendChild(c); return c; }
  function paint(cv, w, sc, fn) { var c = cv.getContext('2d'), i; for (i = 0; i < w * w; i++) { var g = Math.round(fn(i)); c.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')'; c.fillRect((i % w) * sc, Math.floor(i / w) * sc, sc, sc); } }
  function rowWrap(root) { var d = el('div'); d.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;margin:10px 0'; root.appendChild(d); return d; }
  function lcg(seed) { return function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; }

  /* ---------- 1) Eşikleme: genel, Otsu, yerel ---------- */
  (function thresholdLab() {
    var root = document.getElementById('threshgray');
    if (!root) return;
    var W = 40, SC = 4, img = [], truth = [], rnd = lcg(7), x, y;
    for (y = 0; y < W; y++) for (x = 0; x < W; x++) {
      var bg = 90 + x * 2, t = 0, dx = (x - 11) / 6, dy = (y - 13) / 6;
      if (dx * dx + dy * dy <= 1) t = 1;
      if (x >= 27 && x <= 35 && y >= 22 && y <= 31) t = 1;
      img.push(clamp(bg + (t ? 50 : 0) + (rnd() - 0.5) * 12)); truth.push(t);
    }
    var mode = 'global';
    var bar = el('div', 'chips'); root.appendChild(bar);
    [['global', 'Genel eşik (elle)'], ['otsu', 'Otsu (otomatik genel)'], ['local', 'Yerel uyarlanabilir']].forEach(function (a) { var b = el('button', 'chip', a[1]); b.type = 'button'; b.dataset.k = a[0]; b.addEventListener('click', function () { mode = a[0]; draw(); }); bar.appendChild(b); });
    var iT = sl(root, 'gt', 'Genel eşik değeri', 60, 240, 1, 130, draw), iWin = sl(root, 'gw', 'Yerel pencere boyu', 3, 25, 2, 15, draw);
    var imgs = rowWrap(root), cA = canv(imgs, W, SC), cB = canv(imgs, W, SC);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function otsu() {
      var h = new Array(256).fill(0), i, tot = img.length, sum = 0;
      img.forEach(function (v) { h[Math.round(v)]++; sum += Math.round(v); });
      var wB = 0, sB = 0, best = -1, th = 0;
      for (i = 0; i < 256; i++) { wB += h[i]; if (!wB) continue; var wF = tot - wB; if (!wF) break; sB += i * h[i]; var mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF); if (v > best) { best = v; th = i; } }
      return th;
    }
    function local(win) {
      var half = (win - 1) / 2, out = [], yy, xx, a, b;
      for (yy = 0; yy < W; yy++) for (xx = 0; xx < W; xx++) {
        var s = 0, n = 0;
        for (a = -half; a <= half; a++) for (b = -half; b <= half; b++) { var py = yy + a, px = xx + b; if (py >= 0 && py < W && px >= 0 && px < W) { s += img[py * W + px]; n++; } }
        out.push(img[yy * W + xx] > s / n + 10 ? 1 : 0);
      }
      return out;
    }
    function draw() {
      Array.prototype.forEach.call(bar.children, function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === mode)); });
      var T = +iT.value, win = +iWin.value, res, i, label;
      document.getElementById('gto').textContent = T; document.getElementById('gwo').textContent = win + '×' + win;
      if (mode === 'global') { res = img.map(function (v) { return v > T ? 1 : 0; }); label = 'Eşik ' + T; }
      else if (mode === 'otsu') { var o = otsu(); res = img.map(function (v) { return v > o ? 1 : 0; }); label = 'Otsu eşiği ' + o; }
      else { res = local(win); label = 'Pencere ' + win + '×' + win; }
      var ok = 0; for (i = 0; i < res.length; i++) if (res[i] === truth[i]) ok++;
      paint(cA, W, SC, function (i) { return img[i]; }); paint(cB, W, SC, function (i) { return res[i] ? 255 : 0; });
      info.innerHTML = '<div class="metric"><b>%' + Math.round(ok / res.length * 100) + '</b>doğru sınıflanan piksel</div><div class="metric"><b>' + (res.length - ok) + '</b>yanlış piksel</div><div class="metric"><b>' + label + '</b>kullanılan kural</div>';
      note.innerHTML = mode === 'global' ? '<b>Tek eşik, değişen aydınlatmaya yenilir.</b> Soldaki nesne sağdaki zeminden bile daha koyu olabilir; bu yüzden bir eşik ya soldaki nesneyi kaçırır ya da sağdaki zemini nesne sanır. Notta global eşiklemenin homojen aydınlatmada işe yaradığı söylenir.' : mode === 'otsu' ? '<b>Otsu eşiği otomatik bulur ama yine tek eşiktir.</b> Sınıflar arası varyansı büyüten değeri seçer; fakat aydınlatma soldan sağa değiştiği için tek değer yetmez. Notta Otsu’nun kontrollü, tutarlı aydınlatmada etkili olduğu söylenir.' : (win < 9 ? '<b>Pencere çok küçük.</b> Nesnenin içinde pencere yalnızca nesne piksellerini görür, ortalama nesnenin kendi parlaklığı olur ve iç kısım boş kalır. Pencereyi büyüt.' : '<b>Yerel eşik her pikseli komşuluğuyla karşılaştırır.</b> Aydınlatma değişse de nesne kendi çevresinden parlak kaldığı için yakalanır. Pencere nesneden çok küçükse içi boşalır, çok büyükse yerel değişimi kaçırır.');
    }
    draw();
  })();

  /* ---------- 2) Bölge büyütme ---------- */
  (function regionLab() {
    var root = document.getElementById('regionlab');
    if (!root) return;
    var W = 40, SC = 4, img = [], truth = [], rnd = lcg(11), x, y;
    for (y = 0; y < W; y++) for (x = 0; x < W; x++) {
      var t = 0, dx = (x - 13) / 9, dy = (y - 14) / 8;
      if (dx * dx + dy * dy <= 1) t = 1;
      if (x >= 27 && x <= 36 && y >= 24 && y <= 34) t = 2;
      img.push(clamp((t === 1 ? 160 : t === 2 ? 150 : 60) + (rnd() - 0.5) * 24)); truth.push(t);
    }
    var seeds = { A: [13, 14], B: [31, 29], bg: [4, 4] }, which = 'A';
    var bar = el('div', 'chips'); root.appendChild(bar);
    [['A', 'Tohum: nesne A’nın içinde'], ['B', 'Tohum: nesne B’nin içinde'], ['bg', 'Tohum: zeminde']].forEach(function (a) { var b = el('button', 'chip', a[1]); b.type = 'button'; b.dataset.k = a[0]; b.addEventListener('click', function () { which = a[0]; draw(); }); bar.appendChild(b); });
    var iT = sl(root, 'rt', 'Benzerlik toleransı', 5, 130, 5, 25, draw);
    var imgs = rowWrap(root), cA = canv(imgs, W, SC), cB = canv(imgs, W, SC);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function grow(sx, sy, tol) {
      var inR = new Array(W * W).fill(0), q = [[sx, sy]], sum = img[sy * W + sx], n = 1;
      inR[sy * W + sx] = 1;
      while (q.length) {
        var p = q.shift(), d = [[1, 0], [-1, 0], [0, 1], [0, -1]], k;
        for (k = 0; k < 4; k++) {
          var nx = p[0] + d[k][0], ny = p[1] + d[k][1];
          if (nx < 0 || ny < 0 || nx >= W || ny >= W || inR[ny * W + nx]) continue;
          if (Math.abs(img[ny * W + nx] - sum / n) <= tol) { inR[ny * W + nx] = 1; sum += img[ny * W + nx]; n++; q.push([nx, ny]); }
        }
      }
      return inR;
    }
    function draw() {
      Array.prototype.forEach.call(bar.children, function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === which)); });
      var tol = +iT.value; document.getElementById('rto').textContent = tol;
      var s = seeds[which], r = grow(s[0], s[1], tol), tcls = truth[s[1] * W + s[0]], i, n = 0, inside = 0, tot = 0, leak = 0;
      for (i = 0; i < r.length; i++) { if (truth[i] === tcls) tot++; if (r[i]) { n++; if (truth[i] === tcls) inside++; else leak++; } }
      paint(cA, W, SC, function (i) { return img[i]; });
      paint(cB, W, SC, function (i) { return r[i] ? 255 : img[i] * 0.35; });
      var c = cA.getContext('2d'); c.strokeStyle = '#e53935'; c.lineWidth = 2; c.strokeRect(s[0] * SC - 2, s[1] * SC - 2, SC + 4, SC + 4);
      info.innerHTML = '<div class="metric"><b>' + n + '</b>büyüyen bölgedeki piksel</div><div class="metric"><b>%' + Math.round(inside / tot * 100) + '</b>gerçek bölgenin yakalanan kısmı</div><div class="metric"><b>' + leak + '</b>bölge dışına taşan piksel</div>';
      note.innerHTML = tol <= 10 ?'<b>Tolerans küçük:</b> gürültü yüzünden komşu pikseller bölgeye girmez, bölge parça parça kalır. Notta başarının benzerlik ölçütünün iyi tanımlanmasına bağlı olduğu söylenir.' : tol >= 90 ? '<b>Tolerans çok büyük:</b> bölge nesne sınırını aşıp zemine taşar. Bu, tohumdan büyümenin kontrolsüz kaldığı durumdur.' : (which === 'bg' ? '<b>Zeminden başlayan tohum zemini doldurur,</b> nesneleri almaz. Hangi tohumdan başlandığı sonucu belirler; ayrıca B nesnesi A’ya bitişik olmadığı için A’nın tohumu onu hiç bulamaz.' : '<b>Bu tolerans nesneyi tam doldurur.</b> Bölge yalnızca tohuma bağlı pikselleri toplar: bağlı olmayan öteki nesne seçilmez, çünkü bölge büyütme komşuluk üzerinden ilerler.');
    }
    draw();
  })();

  /* ---------- 3) Bölme ve birleştirme (dörtlü ağaç) ---------- */
  (function quadLab() {
    var root = document.getElementById('quadlab');
    if (!root) return;
    var W = 32, SC = 5, img = [], rnd = lcg(5), x, y;
    for (y = 0; y < W; y++) for (x = 0; x < W; x++) {
      var dx = (x - 11) / 8, dy = (y - 12) / 7, v = 70;
      if (dx * dx + dy * dy <= 1) v = 190;
      if (x >= 21 && x <= 29 && y >= 18 && y <= 27) v = 140;
      img.push(clamp(v + (rnd() - 0.5) * 14));
    }
    var iT = sl(root, 'qt', 'Homojenlik eşiği (en büyük − en küçük)', 10, 160, 5, 40, draw);
    var imgs = rowWrap(root), cA = canv(imgs, W, SC), cB = canv(imgs, W, SC);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function split(x0, y0, s, T, out) {
      var mn = 999, mx = -1, a, b, sum = 0;
      for (a = 0; a < s; a++) for (b = 0; b < s; b++) { var v = img[(y0 + a) * W + x0 + b]; if (v < mn) mn = v; if (v > mx) mx = v; sum += v; }
      if (mx - mn <= T || s === 1) { out.push([x0, y0, s, sum / (s * s)]); return; }
      var h = s / 2; split(x0, y0, h, T, out); split(x0 + h, y0, h, T, out); split(x0, y0 + h, h, T, out); split(x0 + h, y0 + h, h, T, out);
    }
    function draw() {
      var T = +iT.value; document.getElementById('qto').textContent = T;
      var blocks = [], err = 0, i; split(0, 0, W, T, blocks);
      var rec = new Array(W * W);
      blocks.forEach(function (b) { var a, c; for (a = 0; a < b[2]; a++) for (c = 0; c < b[2]; c++) rec[(b[1] + a) * W + b[0] + c] = b[3]; });
      for (i = 0; i < rec.length; i++) err += Math.abs(rec[i] - img[i]);
      paint(cA, W, SC, function (i) { return img[i]; }); paint(cB, W, SC, function (i) { return rec[i]; });
      var c = cB.getContext('2d'); c.strokeStyle = '#e53935'; c.lineWidth = 1;
      blocks.forEach(function (b) { c.strokeRect(b[0] * SC + 0.5, b[1] * SC + 0.5, b[2] * SC - 1, b[2] * SC - 1); });
      info.innerHTML = '<div class="metric"><b>' + blocks.length + '</b>blok (düğüm yaprağı)</div><div class="metric"><b>' + (W * W) + '</b>piksel sayısı</div><div class="metric"><b>' + (Math.round(err / rec.length * 10) / 10).toString().replace('.', ',') + '</b>piksel başına ortalama sapma</div>';
      note.innerHTML = T >= 145 ? '<b>Eşik çok yüksek:</b> görüntü tek blok kalır; ayrıntı gider.' : T < 15 ?'<b>Eşik düşük:</b> gürültü bile “homojen değil” sayıldığı için zeminde de küçük bloklara bölünür.' : '<b>Homojen yerler büyük blokta kalır, nesne kenarları küçük bloklara bölünür.</b> Notta homojen bölgelerin erken durdurulduğu, karmaşık bölgelerin daha derine bölündüğü söylenir. Bu yüzden bloklar sınırda yoğunlaşır. Bölünmüş komşu blokların benzerse birleştirilmesi ikinci adımdır; burada yalnızca bölme gösterilir.';
    }
    draw();
  })();
})();
