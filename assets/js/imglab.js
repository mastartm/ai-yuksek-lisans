/* Görüntü İşleme laboratuvarı: histogram, noktasal işlemler ve renk kanalı histogramları.
   Görüntüler kodla üretilir. <div class="imglab" data-mode="hist|point"></div> ve <div id="colorlab"></div> */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  var W = 256, Hh = 192;

  function drawScene(ctx, w, h) {
    var g = ctx.createLinearGradient(0, 0, 0, h * 0.7); g.addColorStop(0, '#3b82f6'); g.addColorStop(1, '#bfdbfe');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(w * 0.78, h * 0.22, h * 0.11, 0, 7); ctx.fill();
    ctx.fillStyle = '#16a34a'; ctx.beginPath(); ctx.moveTo(0, h);
    for (var x = 0; x <= w; x += 4) ctx.lineTo(x, h * 0.66 + Math.sin(x / w * 7) * h * 0.06); ctx.lineTo(w, h); ctx.fill();
    ctx.fillStyle = '#92400e'; ctx.fillRect(w * 0.18, h * 0.52, w * 0.22, h * 0.26);
    ctx.fillStyle = '#b91c1c'; ctx.beginPath(); ctx.moveTo(w * 0.15, h * 0.52); ctx.lineTo(w * 0.29, h * 0.36); ctx.lineTo(w * 0.43, h * 0.52); ctx.fill();
    ctx.fillStyle = '#fef3c7'; ctx.fillRect(w * 0.23, h * 0.58, w * 0.06, h * 0.07); ctx.fillRect(w * 0.31, h * 0.58, w * 0.06, h * 0.07);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.2, h * 0.05, 0, 7); ctx.arc(w * 0.56, h * 0.18, h * 0.06, 0, 7); ctx.arc(w * 0.62, h * 0.2, h * 0.05, 0, 7); ctx.fill();
  }
  var base = document.createElement('canvas'); base.width = W; base.height = Hh; drawScene(base.getContext('2d'), W, Hh);
  var baseData = base.getContext('2d').getImageData(0, 0, W, Hh);
  var gray = new Uint8ClampedArray(W * Hh);
  for (var i = 0; i < gray.length; i++) { var d = baseData.data; gray[i] = Math.round(0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]); }

  /* Hazır görüntü türleri: temel gri görüntüye uygulanan basit dönüşümler */
  var KINDS = [
    { n: 'Dengeli', f: function (v) { return v; } },
    { n: 'Karanlık', f: function (v) { return v * 0.33; } },
    { n: 'Aşırı aydınlık', f: function (v) { return 255 - (255 - v) * 0.33; } },
    { n: 'Düşük kontrast', f: function (v) { return 96 + v * 0.25; } },
    { n: 'Yüksek kontrast', f: function (v) { var t = v / 255; return 255 * (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)); } },
    { n: 'İki tepeli (gölge + parlak)', f: function (v) { return v < 128 ? v * 0.35 : 170 + (v - 128) * 0.6; } }
  ];
  function variant(k) { var a = new Uint8ClampedArray(gray.length); for (var i = 0; i < a.length; i++) a[i] = Math.max(0, Math.min(255, Math.round(KINDS[k].f(gray[i])))); return a; }
  function hist(a) { var h = new Array(256).fill(0); for (var i = 0; i < a.length; i++) h[a[i]]++; return h; }
  function stats(h, n) {
    var m = 0; for (var i = 0; i < 256; i++) m += i * h[i]; m /= n;
    var v = 0; for (i = 0; i < 256; i++) v += h[i] * (i - m) * (i - m); v = Math.sqrt(v / n);
    var acc = 0, p5 = 0, p95 = 255, f5 = false; for (i = 0; i < 256; i++) { acc += h[i]; if (!f5 && acc >= n * 0.05) { p5 = i; f5 = true; } if (acc >= n * 0.95) { p95 = i; break; } }
    return { mean: m, std: v, p5: p5, p95: p95 };
  }
  function plotHist(cv, hs, colors, marks) {
    var c = cv.getContext('2d'), w = cv.width, h = cv.height; c.clearRect(0, 0, w, h);
    var max = 0; hs.forEach(function (x) { x.forEach(function (v) { if (v > max) max = v; }); }); max = Math.max(1, max);
    var cs = getComputedStyle(document.documentElement), line = cs.getPropertyValue('--line') || '#999', mut = cs.getPropertyValue('--muted') || '#888';
    hs.forEach(function (arr, k) { c.fillStyle = colors[k]; for (var i = 0; i < 256; i++) { var bh = Math.sqrt(arr[i] / max) * (h - 18); c.fillRect(i * w / 256, h - 14 - bh, Math.max(1, w / 256), bh); } });
    c.strokeStyle = line.trim() || '#999'; c.beginPath(); c.moveTo(0, h - 13.5); c.lineTo(w, h - 13.5); c.stroke();
    c.fillStyle = mut.trim() || '#888'; c.font = '10px sans-serif'; c.fillText('0 (siyah)', 2, h - 2); c.textAlign = 'right'; c.fillText('255 (beyaz)', w - 2, h - 2); c.textAlign = 'left';
    (marks || []).forEach(function (m) { c.strokeStyle = m.c; c.lineWidth = 2; c.beginPath(); c.moveTo(m.x * w / 256, 0); c.lineTo(m.x * w / 256, h - 14); c.stroke(); c.lineWidth = 1; });
  }
  function putGray(cv, a) { var c = cv.getContext('2d'), d = c.createImageData(W, Hh); for (var i = 0; i < a.length; i++) { d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = a[i]; d.data[i * 4 + 3] = 255; } c.putImageData(d, 0, 0); }
  function cvs(w, h, cls) { var c = el('canvas', cls || 'il-cv'); c.width = w; c.height = h; return c; }

  /* ---------- Ana laboratuvar ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.imglab'), function (root) {
    var mode = root.getAttribute('data-mode') || 'hist', kind = 0, op = 'none';
    var P = { b: 60, a: 1.6, c: 45, g: 0.5, t: 128, lo: 80, hi: 180 };
    var chips = el('div', 'chips'), kb = [];
    KINDS.forEach(function (k, i) { var b = el('button', 'chip', k.n); b.type = 'button'; b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'); b.addEventListener('click', function () { kind = i; kb.forEach(function (x, j) { x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); draw(); }); chips.appendChild(b); kb.push(b); });
    root.appendChild(el('div', 'il-lbl', 'Görüntü türü:')); root.appendChild(chips);
    var ops = [
      ['none', 'İşlem yok'], ['bright', 'Parlaklık'], ['contrast', 'Kontrast'], ['neg', 'Negatif'], ['log', 'Logaritmik'], ['gamma', 'Gamma'], ['thr', 'Eşikleme'], ['win', 'Yoğunluk penceresi'], ['auto', 'Otomatik kontrast (germe)'], ['eq', 'Histogram eşitleme']
    ];
    if (mode === 'hist') ops = [['none', 'Ham görüntü'], ['auto', 'Kontrast germe'], ['eq', 'Histogram eşitleme']];
    var ob = [], opChips = el('div', 'chips'); ops.forEach(function (o, i) { var b = el('button', 'chip', o[1]); b.type = 'button'; b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'); b.addEventListener('click', function () { op = o[0]; ob.forEach(function (x, j) { x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); draw(); }); opChips.appendChild(b); ob.push(b); });
    root.appendChild(el('div', 'il-lbl', mode === 'hist' ? 'Düzeltme dene:' : 'Noktasal işlem:')); root.appendChild(opChips);
    var sl = el('div', 'il-sl'); root.appendChild(sl);
    function slider(id, label, min, max, step, key, fmt) {
      var r = el('div', 'slider-row'); r.setAttribute('data-op', id);
      r.innerHTML = '<label>' + label + '</label><input type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + P[key] + '"><output></output>';
      var inp = r.querySelector('input'), out = r.querySelector('output');
      var up = function () { P[key] = +inp.value; out.textContent = fmt(P[key]); draw(); }; inp.addEventListener('input', up); out.textContent = fmt(P[key]); sl.appendChild(r);
    }
    if (mode === 'point') {
      slider('bright', 'b (eklenen sabit)', -120, 120, 5, 'b', function (v) { return (v > 0 ? '+' : '') + v; });
      slider('contrast', 'a (çarpan)', 0.3, 3, 0.1, 'a', function (v) { return v.toFixed(1); });
      slider('log', 'c (ölçek)', 10, 80, 1, 'c', function (v) { return v; });
      slider('gamma', 'γ (gamma)', 0.2, 3, 0.1, 'g', function (v) { return v.toFixed(1); });
      slider('thr', 'eşik', 1, 254, 1, 't', function (v) { return v; });
      slider('win', 'pencere alt (a)', 0, 250, 1, 'lo', function (v) { return v; });
      slider('win', 'pencere üst (b)', 5, 255, 1, 'hi', function (v) { return v; });
    }
    var grid = el('div', 'il-grid'); root.appendChild(grid);
    var cImg = cvs(W, Hh), cOut = cvs(W, Hh), cH1 = cvs(256, 110, 'il-cv il-h'), cH2 = cvs(256, 110, 'il-cv il-h'), cT = cvs(160, 160, 'il-cv il-t');
    function cell(title, node) { var c = el('div', 'il-cell'); c.appendChild(el('div', 'il-ct', title)); c.appendChild(node); return c; }
    grid.appendChild(cell('Girdi görüntü', cImg)); grid.appendChild(cell('Girdi histogramı', cH1));
    var cellT = null, cellO = null, cellH2 = null;
    if (mode === 'point' || true) { cellO = cell('Sonuç görüntü', cOut); cellH2 = cell('Sonuç histogramı', cH2); grid.appendChild(cellO); grid.appendChild(cellH2); }
    if (mode === 'point') { cellT = cell('Dönüşüm eğrisi T(r)', cT); grid.appendChild(cellT); }
    var diag = el('div', 'quad-info'); root.appendChild(diag);

    function lut() {
      var L = new Array(256), v;
      var src = current, h = hist(src), n = src.length;
      for (var r = 0; r < 256; r++) {
        if (op === 'bright') v = r + P.b; else if (op === 'contrast') v = (r - 128) * P.a + 128 + 0; else if (op === 'neg') v = 255 - r;
        else if (op === 'log') v = P.c * Math.log(1 + r);
        else if (op === 'gamma') v = 255 * Math.pow(r / 255, P.g); else if (op === 'thr') v = r >= P.t ? 255 : 0;
        else if (op === 'win') v = r < P.lo ? 0 : r > P.hi ? 255 : (r - P.lo) / Math.max(1, P.hi - P.lo) * 255; else v = r;
        L[r] = v;
      }
      if (op === 'auto') { var mn = 0, mx = 255; while (mn < 255 && !h[mn]) mn++; while (mx > 0 && !h[mx]) mx--; for (r = 0; r < 256; r++) L[r] = mx > mn ? (r - mn) / (mx - mn) * 255 : r; }
      if (op === 'eq') { var cdf = 0, cmin = 0, i2 = 0; while (i2 < 256 && !h[i2]) i2++; cmin = h[i2] || 0; var cum = 0; for (r = 0; r < 256; r++) { cum += h[r]; L[r] = n > cmin ? (cum - cmin) / (n - cmin) * 255 : r; } }
      return L.map(function (x) { return Math.max(0, Math.min(255, Math.round(x))); });
    }
    var current = variant(0);
    function draw() {
      current = variant(kind); putGray(cImg, current);
      var h1 = hist(current), s = stats(h1, current.length);
      plotHist(cH1, [h1], ['#6366f1'], [{ x: s.mean, c: '#ef4444' }]);
      var L = lut(), out = new Uint8ClampedArray(current.length); for (var i = 0; i < out.length; i++) out[i] = L[current[i]];
      putGray(cOut, out); var h2 = hist(out), s2 = stats(h2, out.length);
      plotHist(cH2, [h2], ['#16a34a'], [{ x: s2.mean, c: '#ef4444' }]);
      if (cellT) {
        var c = cT.getContext('2d'); c.clearRect(0, 0, 160, 160); c.strokeStyle = '#8888'; c.strokeRect(0.5, 0.5, 159, 159); c.setLineDash([4, 4]); c.beginPath(); c.moveTo(0, 160); c.lineTo(160, 0); c.stroke(); c.setLineDash([]);
        c.strokeStyle = '#f59e0b'; c.lineWidth = 3; c.beginPath(); for (var r = 0; r < 256; r++) { var x = r * 160 / 255, y = 160 - L[r] * 160 / 255; if (r === 0) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke(); c.lineWidth = 1;
        c.fillStyle = '#888'; c.font = '10px sans-serif'; c.fillText('girdi →', 110, 156); c.save(); c.translate(10, 40); c.rotate(-Math.PI / 2); c.fillText('çıktı →', 0, 0); c.restore();
        var showOps = { bright: 'bright', contrast: 'contrast', log: 'log', gamma: 'gamma', thr: 'thr', win: 'win' };
        Array.prototype.forEach.call(sl.children, function (r2) { r2.style.display = (r2.getAttribute('data-op') === op) ? '' : 'none'; });
      }
      var bright = s.mean < 85 ? 'koyu (histogram sola yaslı)' : s.mean > 170 ? 'açık (histogram sağa yaslı)' : 'orta';
      var spread = s.p95 - s.p5, contrast = spread < 80 ? '<b>düşük kontrast</b>: histogram dar bir aralığa toplanmış' : spread > 200 ? '<b>yüksek kontrast</b>: histogram geniş bir alana yayılmış' : 'orta kontrast';
      diag.innerHTML = '<div class="kicker">Histogramı oku</div><p>Ortalama parlaklık <b>' + Math.round(s.mean) + '</b> → görüntü genel olarak ' + bright + '. Piksellerin %90’ı <b>' + s.p5 + '–' + s.p95 + '</b> aralığında → ' + contrast + '.' + (op !== 'none' ? ' Sonuçta ortalama <b>' + Math.round(s2.mean) + '</b>, %90 aralığı <b>' + s2.p5 + '–' + s2.p95 + '</b>.' : '') + '</p>';
    }
    draw();
  });

  /* ---------- Renkli histogram laboratuvarı ---------- */
  var cl = document.getElementById('colorlab');
  if (cl) {
    var G = { r: 1, g: 1, b: 1 };
    ['r', 'g', 'b'].forEach(function (k, i) {
      var nm = ['Kırmızı', 'Yeşil', 'Mavi'][i], r = el('div', 'slider-row'); r.innerHTML = '<label>' + nm + ' kanal kazancı</label><input type="range" min="0.4" max="1.6" step="0.05" value="1"><output>1,00</output>';
      var inp = r.querySelector('input'), o = r.querySelector('output'); inp.addEventListener('input', function () { G[k] = +inp.value; o.textContent = G[k].toFixed(2).replace('.', ','); draw2(); }); cl.appendChild(r);
    });
    var gr = el('div', 'il-grid'), cI = cvs(W, Hh), cHH = cvs(256, 130, 'il-cv il-h'); gr.appendChild(el('div', 'il-cell')).appendChild(cI); var cc = el('div', 'il-cell'); cc.appendChild(cHH); gr.appendChild(cc); cl.appendChild(gr);
    var note = el('div', 'status'); cl.appendChild(note);
    function draw2() {
      var d = new ImageData(new Uint8ClampedArray(baseData.data), W, Hh), hr = new Array(256).fill(0), hg = new Array(256).fill(0), hb = new Array(256).fill(0);
      for (var i = 0; i < d.data.length; i += 4) { d.data[i] = Math.min(255, d.data[i] * G.r); d.data[i + 1] = Math.min(255, d.data[i + 1] * G.g); d.data[i + 2] = Math.min(255, d.data[i + 2] * G.b); hr[Math.round(d.data[i])]++; hg[Math.round(d.data[i + 1])]++; hb[Math.round(d.data[i + 2])]++; }
      cI.getContext('2d').putImageData(d, 0, 0);
      plotHist(cHH, [hr, hg, hb], ['rgba(239,68,68,.55)', 'rgba(34,197,94,.55)', 'rgba(59,130,246,.55)'], []);
      var m = function (h) { var s = 0, n = 0; for (var i = 0; i < 256; i++) { s += i * h[i]; n += h[i]; } return s / n; }, mr = m(hr), mg = m(hg), mb = m(hb);
      var dom = mr > mg && mr > mb ? 'kırmızı kanal en sağda: sıcak tonlar baskın' : mb > mr && mb > mg ? 'mavi kanal en sağda: soğuk tonlar baskın' : 'yeşil kanal en sağda';
      note.innerHTML = 'Kanal ortalamaları: <b style="color:#ef4444">K ' + Math.round(mr) + '</b> · <b style="color:#16a34a">Y ' + Math.round(mg) + '</b> · <b style="color:#3b82f6">M ' + Math.round(mb) + '</b> → ' + dom + '.';
    }
    draw2();
  }
})();
