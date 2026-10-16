/* Veri Bilimi · Bölüm 4: kırpılmış eksen (grafik yanıltması) ve PCA ekseni laboratuvarı. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function svgEl(name, attrs, parent) { var e = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (parent) parent.appendChild(e); return e; }
  function f1(x) { return (Math.round(x * 10) / 10).toFixed(1).replace('.', ','); }
  function f2(x) { return (Math.round(x * 100) / 100).toFixed(2).replace('.', ','); }

  /* ---------- 1) Kırpılmış eksen ---------- */
  var ax = document.getElementById('axislab');
  if (ax) {
    var data = [['Oca', 96], ['Şub', 98], ['Mar', 101], ['Nis', 104]];
    var W = 560, H = 260, L = 46, R = 16, T = 20, B = 34, base = 0;
    var row = el('div', 'slider-row'); row.innerHTML = '<label for="axb">Eksen başlangıcı</label><input id="axb" type="range" min="0" max="92" step="2" value="0"><output id="axo">0</output>';
    ax.appendChild(row);
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'diagram', role: 'img', 'aria-label': 'Aylık sipariş sayısı çubuk grafiği' }, null); ax.appendChild(svg);
    var info = el('div', 'callout idea'); ax.appendChild(info);
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var max = 106, span = max - base;
      svgEl('line', { x1: L, y1: H - B, x2: W - R, y2: H - B, 'class': 'd-line' }, svg);
      svgEl('line', { x1: L, y1: T, x2: L, y2: H - B, 'class': 'd-line' }, svg);
      [base, Math.round((base + max) / 2), max].forEach(function (v) { var y = H - B - (v - base) / span * (H - B - T); var t = svgEl('text', { x: L - 6, y: y + 4, 'class': 'd-sm', 'text-anchor': 'end' }, svg); t.textContent = v; });
      var bw = (W - L - R) / data.length;
      data.forEach(function (d, i) {
        var h = (d[1] - base) / span * (H - B - T), x = L + i * bw + bw * 0.18;
        svgEl('rect', { x: x, y: H - B - h, width: bw * 0.64, height: Math.max(h, 0), rx: 4, 'class': 'd-brand' }, svg);
        var t = svgEl('text', { x: x + bw * 0.32, y: H - B + 18, 'class': 'd-sm d-c' }, svg); t.textContent = d[0];
        var v = svgEl('text', { x: x + bw * 0.32, y: H - B - h - 6, 'class': 'd-sm d-c' }, svg); v.textContent = d[1];
      });
      var ratio = (data[3][1] - base) / Math.max(data[0][1] - base, 1);
      info.innerHTML = base === 0 ? '<b>Dürüst eksen.</b>Sipariş sayısı 96’dan 104’e çıkmış: yaklaşık %8 artış. Çubukların yükseklik oranı gerçek oranla uyumlu.' :
        '<b>Çıplak gözle fark:</b>Son çubuk ilk çubuğun yaklaşık <b>' + f1(ratio) + ' katı</b> yüksekliğinde görünüyor, oysa gerçek oran 1,08. Eksen kırpılınca küçük fark büyük sıçrama gibi görünür.';
    }
    row.querySelector('input').addEventListener('input', function (e) { base = +e.target.value; document.getElementById('axo').textContent = base; draw(); });
    draw();
  }

  /* ---------- 2) PCA ekseni ---------- */
  var pc = document.getElementById('pcalab');
  if (pc) {
    var pts = [], n = 36, i;
    for (i = 0; i < n; i++) {
      var t = (i / (n - 1)) * 4.4 - 2.2;
      var nz = Math.sin(i * 12.9898) * 0.9 + Math.cos(i * 78.233) * 0.6;
      pts.push([t, 0.55 * t + 0.55 * nz]);
    }
    var mx = 0, my = 0; pts.forEach(function (p) { mx += p[0]; my += p[1]; }); mx /= n; my /= n;
    pts = pts.map(function (p) { return [p[0] - mx, p[1] - my]; });
    var sxx = 0, syy = 0, sxy = 0; pts.forEach(function (p) { sxx += p[0] * p[0]; syy += p[1] * p[1]; sxy += p[0] * p[1]; });
    var total = sxx + syy, best = 0.5 * Math.atan2(2 * sxy, sxx - syy);
    function varAt(a) { var c = Math.cos(a), s = Math.sin(a), v = 0; pts.forEach(function (p) { var z = p[0] * c + p[1] * s; v += z * z; }); return v / total; }
    var W2 = 560, H2 = 280, cx = W2 / 2, cy = H2 / 2, sc = 52;
    var row2 = el('div', 'slider-row'); row2.innerHTML = '<label for="pca">Eksen açısı</label><input id="pca" type="range" min="0" max="180" step="1" value="90"><output id="pco">90°</output>';
    pc.appendChild(row2);
    var sv = svgEl('svg', { viewBox: '0 0 ' + W2 + ' ' + H2, 'class': 'diagram', role: 'img', 'aria-label': 'İki boyutlu nokta bulutu ve izdüşüm ekseni' }, null); pc.appendChild(sv);
    var gP = svgEl('g', {}, sv), gProj = svgEl('g', {}, sv);
    var axis = svgEl('line', { 'class': 'd-line-brand', 'stroke-width': 3 }, sv);
    pts.forEach(function (p) { svgEl('circle', { cx: cx + p[0] * sc, cy: cy - p[1] * sc, r: 4, 'class': 'd-brand', 'fill-opacity': '0.55' }, gP); });
    var metrics = el('div', 'metrics'); pc.appendChild(metrics);
    var note = el('div', 'callout idea'); pc.appendChild(note);
    var bar = el('div', 'chips'); var bb = el('button', 'btn', 'En iyi eksene getir (PC1)'); bb.type = 'button'; bar.appendChild(bb); pc.appendChild(bar);
    var sl = row2.querySelector('input');
    function draw(deg) {
      var a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), len = 3.6 * sc;
      axis.setAttribute('x1', cx - c * len); axis.setAttribute('y1', cy + s * len); axis.setAttribute('x2', cx + c * len); axis.setAttribute('y2', cy - s * len);
      while (gProj.firstChild) gProj.removeChild(gProj.firstChild);
      pts.forEach(function (p) {
        var z = p[0] * c + p[1] * s, qx = cx + z * c * sc, qy = cy - z * s * sc;
        svgEl('line', { x1: cx + p[0] * sc, y1: cy - p[1] * sc, x2: qx, y2: qy, 'class': 'd-dash' }, gProj);
        svgEl('circle', { cx: qx, cy: qy, r: 3, 'class': 'd-bad' }, gProj);
      });
      var v = varAt(a), bd = ((best * 180 / Math.PI) % 180 + 180) % 180;
      document.getElementById('pco').textContent = deg + '°';
      metrics.innerHTML = '<div class="metric"><b>%' + f1(v * 100) + '</b>bu eksenin açıkladığı varyans</div><div class="metric"><b>%' + f1(varAt(best) * 100) + '</b>en iyi eksen (PC1 ≈ ' + Math.round(bd) + '°)</div>';
      var diff = Math.abs(((deg - bd + 90) % 180 + 180) % 180 - 90);
      note.innerHTML = diff < 4 ? '<b>İlk temel bileşen.</b>Bu eksen noktaların en çok yayıldığı yöndür: izdüşümler (kırmızı) birbirinden en uzak durur, bilgi kaybı en azdır.' :
        diff < 30 ? '<b>Yaklaşıyorsun.</b>Eksen veri bulutuna yaklaştıkça izdüşümler daha çok yayılır; açıklanan varyans artar.' :
        '<b>Zayıf eksen.</b>İzdüşümler sıkışıyor: noktaların çoğu üst üste biniyor, farklılıklar kayboluyor.';
    }
    sl.addEventListener('input', function (e) { draw(+e.target.value); });
    bb.addEventListener('click', function () { var d = Math.round(((best * 180 / Math.PI) % 180 + 180) % 180); sl.value = d; draw(d); });
    draw(90);
  }
})();
