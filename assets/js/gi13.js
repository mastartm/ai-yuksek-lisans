/* Görüntü İşleme · Bölüm 13: şablon eşleme (ışık ve dönme duyarlılığı), IoU (kutu örtüşmesi) ve HOG (gradyan yönelim histogramı).
   Görüntüler ve sayılar bu site için üretilmiştir. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function fx(x, d) { var k = Math.pow(10, d == null ? 0 : d); return (Math.round(x * k) / k).toString().replace('.', ','); }
  function clamp(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }
  function sl(root, id, label, min, max, step, val, cb) { var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>'; root.appendChild(r); var i = r.querySelector('input'); i.addEventListener('input', cb); return i; }
  function canv(parent, w, h) { var c = el('canvas'); c.width = w; c.height = h; c.style.cssText = 'border:1px solid var(--line);border-radius:6px;max-width:100%;height:auto;image-rendering:pixelated'; parent.appendChild(c); return c; }
  function rowWrap(root) { var d = el('div'); d.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;margin:10px 0'; root.appendChild(d); return d; }
  function lcg(seed) { return function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; }

  /* ---------- 1) Şablon eşleme ---------- */
  (function templateLab() {
    var root = document.getElementById('templab');
    if (!root) return;
    var W = 40, S = 7, SC = 4, OX = 24, OY = 10;
    var mode = 'same';
    var tpl = [], i, a, b;
    for (a = 0; a < S; a++) for (b = 0; b < S; b++) tpl.push(b === 0 || a === S - 1 ? 200 : 60);
    function tplAt(a, b, rot) { return rot ? tpl[(S - 1 - a) * S + (S - 1 - b)] : tpl[a * S + b]; }
    var bar = el('div', 'chips'); root.appendChild(bar);
    [['same', 'Nesne şablonla aynı yönde'], ['rot', 'Nesne 180° döndürülmüş']].forEach(function (c) { var bt = el('button', 'chip', c[1]); bt.type = 'button'; bt.dataset.k = c[0]; bt.addEventListener('click', function () { mode = c[0]; draw(); }); bar.appendChild(bt); });
    var iB = sl(root, 'tb', 'Işık kayması (sahneye eklenen parlaklık)', 0, 100, 5, 0, draw);
    var imgs = rowWrap(root), cS = canv(imgs, W * SC, W * SC), cH = canv(imgs, (W - S + 1) * SC, (W - S + 1) * SC), cT = canv(imgs, S * 12, S * 12);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    // sahnenin ışıksız hâli (rastgele tohum sabit)
    function scene(rot) {
      var rnd = lcg(3), s = [], x, y;
      for (y = 0; y < W; y++) for (x = 0; x < W; x++) s.push(60 + (rnd() - 0.5) * 20);
      for (a = 0; a < S; a++) for (b = 0; b < S; b++) { if (tplAt(a, b, rot) === 200) s[(OY + a) * W + OX + b] = 200; }
      for (a = 0; a < 5; a++) for (b = 0; b < 5; b++) s[(26 + a) * W + 6 + b] = 200;   // dikkat dağıtıcı kare
      return s;
    }
    function draw() {
      Array.prototype.forEach.call(bar.children, function (bt) { bt.setAttribute('aria-pressed', String(bt.dataset.k === mode)); });
      var sh = +iB.value; document.getElementById('tbo').textContent = '+' + sh;
      var base = scene(mode === 'rot'), sc = base.map(function (v) { return clamp(v + sh); });
      var N = W - S + 1, score = [], best = 1e9, bx = 0, by = 0, x, y, p, q, tv;
      for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
        var sum = 0;
        for (p = 0; p < S; p++) for (q = 0; q < S; q++) sum += Math.abs(sc[(y + p) * W + x + q] - tpl[p * S + q]);
        score.push(sum); if (sum < best) { best = sum; bx = x; by = y; }
      }
      var mx = Math.max.apply(null, score), mn = Math.min.apply(null, score);
      var g = cS.getContext('2d'), h = cH.getContext('2d'), t = cT.getContext('2d');
      for (i = 0; i < sc.length; i++) { g.fillStyle = 'rgb(' + Math.round(sc[i]) + ',' + Math.round(sc[i]) + ',' + Math.round(sc[i]) + ')'; g.fillRect((i % W) * SC, Math.floor(i / W) * SC, SC, SC); }
      for (i = 0; i < score.length; i++) { var k = Math.round(255 * (1 - (score[i] - mn) / (mx - mn || 1))); h.fillStyle = 'rgb(' + k + ',' + k + ',' + k + ')'; h.fillRect((i % N) * SC, Math.floor(i / N) * SC, SC, SC); }
      for (p = 0; p < S; p++) for (q = 0; q < S; q++) { tv = tpl[p * S + q]; t.fillStyle = 'rgb(' + tv + ',' + tv + ',' + tv + ')'; t.fillRect(q * 12, p * 12, 12, 12); }
      g.lineWidth = 2; g.strokeStyle = '#22c55e'; g.strokeRect(bx * SC + 1, by * SC + 1, S * SC - 2, S * SC - 2);
      g.strokeStyle = '#e53935'; g.setLineDash([4, 3]); g.strokeRect(OX * SC + 1, OY * SC + 1, S * SC - 2, S * SC - 2); g.setLineDash([]);
      var found = Math.abs(bx - OX) <= 1 && Math.abs(by - OY) <= 1;
      info.innerHTML = '<div class="metric"><b>' + (found ? 'Bulundu' : 'Yanlış yer') + '</b>en iyi eşleşme gerçek konumda mı</div><div class="metric"><b>(' + bx + ', ' + by + ')</b>en iyi eşleşme (yeşil kutu)</div><div class="metric"><b>' + Math.round(best) + '</b>en küçük fark toplamı</div>';
      note.innerHTML = 'Solda sahne (kırmızı kesikli = nesnenin gerçek yeri, yeşil = en iyi eşleşme), ortada fark haritası (parlak = iyi eşleşme), sağda şablon. ' + (found ? (sh === 0 && mode === 'same' ? '<b>Aynı ışık, aynı yön: şablon eşleme işe yarar.</b> Basit ve uygulaması kolaydır; bunun için sabit koşul gerekir.' : '<b>Hâlâ bulunuyor, ama sınır yakın.</b> Işığı artırdıkça ya da nesneyi döndürdükçe doğru yer ile öteki yerlerin farkı azalır.') : (mode === 'rot' ? '<b>Nesne dönünce şablon tutmaz.</b> Notta şablon eşlemenin ışık, boyut ve dönme değişiminde hızla zayıfladığı söylenir; bu yüzden küçük ve sabit koşullu problemlerde tercih edilir.' : '<b>Işık kayınca fark toplamı bozulur.</b> Şablon sabit parlaklıkta saklandığı için sahne parlaklaşınca doğru yer artık en iyi sayılmaz.'));
    }
    draw();
  })();

  /* ---------- 2) IoU ---------- */
  (function iouLab() {
    var root = document.getElementById('ioulab');
    if (!root) return;
    var GT = { x: 60, y: 45, w: 110, h: 90 };
    var iX = sl(root, 'ix', 'Tahmin kutusu: yatay kayma', -80, 80, 2, 20, draw), iY = sl(root, 'iy', 'Tahmin kutusu: dikey kayma', -80, 80, 2, 10, draw), iS = sl(root, 'is', 'Tahmin kutusu: ölçek', 50, 160, 5, 100, draw), iT = sl(root, 'it', 'Doğru sayma eşiği (IoU ≥)', 10, 90, 5, 50, draw);
    var cv = canv(rowWrap(root), 280, 200), info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function draw() {
      var dx = +iX.value, dy = +iY.value, sc = +iS.value / 100, th = +iT.value / 100;
      document.getElementById('ixo').textContent = dx; document.getElementById('iyo').textContent = dy; document.getElementById('iso').textContent = '%' + Math.round(sc * 100); document.getElementById('ito').textContent = fx(th, 2);
      var pw = GT.w * sc, ph = GT.h * sc, px = GT.x + (GT.w - pw) / 2 + dx, py = GT.y + (GT.h - ph) / 2 + dy;
      var ix = Math.max(0, Math.min(GT.x + GT.w, px + pw) - Math.max(GT.x, px)), iy = Math.max(0, Math.min(GT.y + GT.h, py + ph) - Math.max(GT.y, py));
      var inter = ix * iy, uni = GT.w * GT.h + pw * ph - inter, iou = inter / uni;
      var c = cv.getContext('2d'); c.clearRect(0, 0, 280, 200); c.fillStyle = '#12161c'; c.fillRect(0, 0, 280, 200);
      c.fillStyle = 'rgba(34,197,94,.28)'; c.fillRect(Math.max(GT.x, px), Math.max(GT.y, py), ix, iy);
      c.lineWidth = 2; c.strokeStyle = '#22c55e'; c.strokeRect(GT.x, GT.y, GT.w, GT.h); c.strokeStyle = '#f59e0b'; c.strokeRect(px, py, pw, ph);
      c.fillStyle = '#ddd'; c.font = '11px sans-serif'; c.fillText('yeşil: gerçek kutu', 6, 14); c.fillText('turuncu: tahmin', 6, 28);
      info.innerHTML = '<div class="metric"><b>' + fx(iou, 2) + '</b>IoU (kesişim ÷ birleşim)</div><div class="metric"><b>' + Math.round(inter) + '</b>kesişim alanı</div><div class="metric"><b>' + Math.round(uni) + '</b>birleşim alanı</div><div class="metric"><b>' + (iou >= th ? 'Doğru tespit' : 'Yanlış tespit') + '</b>seçtiğin eşiğe göre</div>';
      note.innerHTML = iou === 0 ? '<b>Kutular hiç örtüşmüyor: IoU = 0.</b>' : iou > 0.9 ? '<b>Neredeyse tam örtüşme: IoU 1’e yakın.</b>' : '<b>IoU kutuların ne kadar örtüştüğünü tek sayıyla verir.</b> Aynı kutuyu iki kat büyütürsen kesişim aynı kalır ama birleşim büyür, IoU düşer; kutu doğru yerde olsa bile boyutu yanlışsa puan kaybedersin.';
    }
    draw();
  })();

  /* ---------- 3) HOG: gradyan yönelim histogramı ---------- */
  (function hogLab() {
    var root = document.getElementById('hoglab');
    if (!root) return;
    var N = 24, SC = 6, NB = 9;
    var iA = sl(root, 'ha', 'Çizginin yönü (derece)', 0, 170, 10, 30, draw), iG = sl(root, 'hg', 'Kontrast çarpanı', 50, 110, 5, 100, draw), iO = sl(root, 'ho', 'Parlaklık kayması', -30, 30, 5, 0, draw);
    var imgs = rowWrap(root), cv = canv(imgs, N * SC, N * SC), hist = el('div'); hist.style.cssText = 'flex:1;min-width:200px'; imgs.appendChild(hist);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function draw() {
      var th = +iA.value * Math.PI / 180, gain = +iG.value / 100, off = +iO.value, x, y;
      document.getElementById('hao').textContent = iA.value + '°'; document.getElementById('hgo').textContent = fx(gain, 2); document.getElementById('hoo').textContent = off;
      var img = [], cx = (N - 1) / 2, dx = Math.cos(th), dy = Math.sin(th);
      for (y = 0; y < N; y++) for (x = 0; x < N; x++) { var d = Math.abs(-(x - cx) * dy + (y - cx) * dx); img.push(clamp(gain * (60 + 140 * Math.exp(-d * d / (2 * 1.5 * 1.5))) + off)); }
      var c = cv.getContext('2d'), i; for (i = 0; i < img.length; i++) { var g = Math.round(img[i]); c.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')'; c.fillRect((i % N) * SC, Math.floor(i / N) * SC, SC, SC); }
      var h = new Array(NB).fill(0), tot = 0;
      for (y = 1; y < N - 1; y++) for (x = 1; x < N - 1; x++) {
        var gx = img[y * N + x + 1] - img[y * N + x - 1], gy = img[(y + 1) * N + x] - img[(y - 1) * N + x], m = Math.sqrt(gx * gx + gy * gy);
        if (m < 1e-6) continue; var ang = Math.atan2(gy, gx) * 180 / Math.PI; if (ang < 0) ang += 180; if (ang >= 180) ang -= 180;
        h[Math.min(NB - 1, Math.floor(ang / 20))] += m; tot += m;
      }
      var mx = Math.max.apply(null, h), best = h.indexOf(mx), html = '<div style="font-size:.85rem;margin-bottom:4px">Gradyan yönelim histogramı (9 kutu, her kutu 20°)</div>';
      h.forEach(function (v, k) { html += '<div style="display:flex;align-items:center;gap:6px;font-size:.78rem"><span style="width:62px">' + (k * 20) + '–' + (k * 20 + 20) + '°</span><span style="height:12px;border-radius:3px;background:' + (k === best ? 'var(--brand, #6c63ff)' : 'var(--line)') + ';width:' + Math.round(v / (mx || 1) * 100) + '%;max-width:calc(100% - 70px)"></span></div>'; });
      hist.innerHTML = html;
      info.innerHTML = '<div class="metric"><b>' + (best * 20) + '–' + (best * 20 + 20) + '°</b>baskın gradyan yönü</div><div class="metric"><b>' + Math.round(tot) + '</b>toplam gradyan gücü</div>';
      note.innerHTML = '<b>Gradyan, çizgiye dik yönde olur.</b> Çizgiyi döndürünce histogramın tepesi kayar; kontrastı ya da parlaklığı değiştirince tepenin <b>yeri</b> değişmez, yalnızca toplam güç değişir. HOG bu yönelim dağılımını kullandığı için aydınlatma değişimine karşı dayanıklıdır; notta özellikle insan tespitinde başarılı olduğu söylenir.';
    }
    draw();
  })();
})();
