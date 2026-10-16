/* Makine Öğrenmesi · Bölüm 4: bayır inişi ile doğru uydurma, polinom derecesi (az/aşırı uyum), sigmoid.
   Veriler bu site için üretilmiştir: konut alanı (m²) ve kira (bin ₺). */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function svgEl(name, attrs, parent) { var e = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (parent) parent.appendChild(e); return e; }
  function f2(x) { return (Math.round(x * 100) / 100).toFixed(2).replace('.', ','); }
  function f3(x) { return (Math.round(x * 1000) / 1000).toFixed(3).replace('.', ','); }
  var W = 560, Hh = 260, L = 46, R = 16, T = 14, B = 34;
  function axes(svg, xl, yl) {
    svgEl('line', { x1: L, y1: Hh - B, x2: W - R, y2: Hh - B, 'class': 'd-line' }, svg);
    svgEl('line', { x1: L, y1: T, x2: L, y2: Hh - B, 'class': 'd-line' }, svg);
    var a = svgEl('text', { x: (L + W - R) / 2, y: Hh - 6, 'class': 'd-sm d-c' }, svg); a.textContent = xl;
    var b = svgEl('text', { x: 4, y: T + 8, 'class': 'd-sm' }, svg); b.textContent = yl;
  }

  /* ---------- 1) Bayır inişi ile doğru uydurma ---------- */
  var gd = document.getElementById('gdlab');
  if (gd) {
    // x: alan (m²) → [-1,1] ölçeğine çevrilir; y: kira, bin ₺
    var raw = [[55, 14], [70, 17], [85, 16], [95, 22], [110, 24], [125, 23], [140, 29], [160, 31], [175, 36], [190, 35], [210, 41], [235, 44]];
    var xs = raw.map(function (p) { return (p[0] - 145) / 100; });
    var ys = raw.map(function (p) { return p[1] / 10; });
    var m = xs.length, th0, th1, steps, alpha = 0.3;
    function reset() { th0 = 0; th1 = 0; steps = 0; }
    function cost() { var s = 0; for (var i = 0; i < m; i++) { var e = th0 + th1 * xs[i] - ys[i]; s += e * e; } return s / (2 * m); }
    function step() { var g0 = 0, g1 = 0; for (var i = 0; i < m; i++) { var e = th0 + th1 * xs[i] - ys[i]; g0 += e; g1 += e * xs[i]; } th0 -= alpha * g0 / m; th1 -= alpha * g1 / m; steps++; }
    var row = el('div', 'slider-row'); row.innerHTML = '<label for="gda">Öğrenme oranı α</label><input id="gda" type="range" min="0.02" max="2" step="0.02" value="0.3"><output id="gdo">0,30</output>';
    gd.appendChild(row);
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + Hh, 'class': 'diagram', role: 'img', 'aria-label': 'Noktalara doğru uydurma' }, null); gd.appendChild(svg);
    function X(x) { return L + (x + 1.1) / 2.2 * (W - L - R); }
    function Y(y) { return T + (1 - (y + 0.5) / 6.5) * (Hh - T - B); }
    axes(svg, 'konut alanı (m²) →', 'kira');
    xs.forEach(function (x, i) { svgEl('circle', { cx: X(x), cy: Y(ys[i]), r: 5, 'class': 'd-brand' }, svg); });
    var line = svgEl('line', { 'class': 'd-line-brand' }, svg);
    var info = el('div', 'metrics'); gd.appendChild(info);
    var bar = el('div', 'chips');
    function mk(t, fn) { var b = el('button', 'btn', t); b.type = 'button'; b.addEventListener('click', fn); bar.appendChild(b); return b; }
    mk('1 adım', function () { step(); draw(); });
    mk('20 adım', function () { for (var i = 0; i < 20; i++) step(); draw(); });
    mk('Sıfırla', function () { reset(); draw(); });
    gd.appendChild(bar);
    var note = el('div', 'callout idea'); gd.appendChild(note);
    function draw() {
      var ok = isFinite(th0) && isFinite(th1) && Math.abs(th0) < 1e6 && Math.abs(th1) < 1e6;
      var x1 = -1.1, x2 = 1.1;
      var y1 = ok ? th0 + th1 * x1 : 0, y2 = ok ? th0 + th1 * x2 : 0;
      line.setAttribute('x1', X(x1)); line.setAttribute('x2', X(x2));
      line.setAttribute('y1', Math.max(-2000, Math.min(2000, Y(y1)))); line.setAttribute('y2', Math.max(-2000, Math.min(2000, Y(y2))));
      var j = cost();
      info.innerHTML = '<div class="metric"><b>' + steps + '</b>adım</div><div class="metric"><b>' + (ok ? f3(j) : 'patladı') + '</b>maliyet J</div><div class="metric"><b>' + (ok ? f2(th1) : '–') + '</b>eğim θ₁</div>';
      note.innerHTML = !ok ? '<b>Iraksadı.</b>α çok büyük: adımlar çözümü aşıp her seferinde daha uzağa savruldu. Sıfırla ve α’yı küçült.' :
        j > 1.5 ? '<b>Başlangıç.</b>Doğru henüz noktaları yakalamıyor. Adım at; hata azaldıkça adımlar küçülür.' :
        j > 0.05 ? '<b>Yaklaşıyor.</b>Her adımda maliyet düşüyor. Hata büyükken güncelleme büyük, hata küçülünce küçük olur.' :
        '<b>Yakınsadı.</b>Maliyet artık neredeyse değişmiyor. Doğru, noktalara en küçük kareler anlamında oturdu.';
    }
    row.querySelector('input').addEventListener('input', function (e) { alpha = +e.target.value; document.getElementById('gdo').textContent = f2(alpha); });
    reset(); draw();
  }

  /* ---------- 2) Polinom derecesi: az uyum / aşırı uyum ---------- */
  var pl = document.getElementById('polylab');
  if (pl) {
    var tr = [[-0.95, 1.3], [-0.75, 0.9], [-0.55, 1.0], [-0.3, 0.2], [-0.05, -0.1], [0.2, -0.6], [0.45, -0.2], [0.7, 0.6], [0.95, 1.4]];
    var te = [[-0.85, 1.1], [-0.4, 0.5], [0.1, -0.4], [0.35, -0.5], [0.6, 0.2], [0.85, 1.1]];
    function solve(deg) {
      var n = deg + 1, A = [], b = [], i, j, k;
      for (i = 0; i < n; i++) { A.push(new Array(n).fill(0)); b.push(0); }
      tr.forEach(function (p) {
        var pw = []; for (i = 0; i < 2 * n; i++) pw.push(Math.pow(p[0], i));
        for (i = 0; i < n; i++) { b[i] += pw[i] * p[1]; for (j = 0; j < n; j++) A[i][j] += pw[i + j]; }
      });
      for (i = 0; i < n; i++) A[i][i] += 1e-9;
      for (i = 0; i < n; i++) {
        var mx = i; for (k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[mx][i])) mx = k;
        var t = A[i]; A[i] = A[mx]; A[mx] = t; var tb = b[i]; b[i] = b[mx]; b[mx] = tb;
        for (k = i + 1; k < n; k++) { var f = A[k][i] / A[i][i]; for (j = i; j < n; j++) A[k][j] -= f * A[i][j]; b[k] -= f * b[i]; }
      }
      var c = new Array(n).fill(0);
      for (i = n - 1; i >= 0; i--) { var s = b[i]; for (j = i + 1; j < n; j++) s -= A[i][j] * c[j]; c[i] = s / A[i][i]; }
      return c;
    }
    function ev(c, x) { var s = 0, p = 1; for (var i = 0; i < c.length; i++) { s += c[i] * p; p *= x; } return s; }
    function mse(c, pts) { var s = 0; pts.forEach(function (p) { var e = ev(c, p[0]) - p[1]; s += e * e; }); return s / pts.length; }
    var row2 = el('div', 'slider-row'); row2.innerHTML = '<label for="pld">Polinom derecesi</label><input id="pld" type="range" min="1" max="8" step="1" value="1"><output id="plo">1</output>';
    pl.appendChild(row2);
    var sv = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + Hh, 'class': 'diagram', role: 'img', 'aria-label': 'Polinom uydurma' }, null); pl.appendChild(sv);
    function X2(x) { return L + (x + 1.05) / 2.1 * (W - L - R); }
    function Y2(y) { return T + (1 - (y + 1.2) / 3.2) * (Hh - T - B); }
    axes(sv, 'girdi x →', 'y');
    var curve = svgEl('polyline', { fill: 'none', 'class': 'd-line-brand' }, sv);
    tr.forEach(function (p) { svgEl('circle', { cx: X2(p[0]), cy: Y2(p[1]), r: 5, 'class': 'd-brand' }, sv); });
    te.forEach(function (p) { svgEl('circle', { cx: X2(p[0]), cy: Y2(p[1]), r: 5, 'class': 'd-bad', 'fill-opacity': '0.15', 'stroke-width': '2' }, sv); });
    var inf2 = el('div', 'metrics'); pl.appendChild(inf2);
    var nt = el('div', 'callout idea'); pl.appendChild(nt);
    var lg = el('p', 'd-note', 'Dolu daire: eğitim verisi (model bunu görür). Boş daire: test verisi (model görmez).'); pl.appendChild(lg);
    function draw2(deg) {
      var c = solve(deg), pts = [];
      for (var i = 0; i <= 120; i++) { var x = -1.05 + 2.1 * i / 120; var y = Math.max(-1.6, Math.min(2.2, ev(c, x))); pts.push(X2(x) + ',' + Y2(y)); }
      curve.setAttribute('points', pts.join(' '));
      var a = mse(c, tr), b = mse(c, te);
      inf2.innerHTML = '<div class="metric"><b>' + f3(a) + '</b>eğitim hatası</div><div class="metric"><b>' + f3(b) + '</b>test hatası</div>';
      nt.innerHTML = deg <= 1 ? '<b>Az uyum (underfit).</b>Doğru, verideki kıvrımı yakalayamaz; hem eğitim hem test hatası yüksek.' :
        deg <= 3 ? '<b>Dengeli.</b>Eğri eğilimi yakalıyor; test hatası da düşük.' :
        deg <= 5 ? '<b>Dikkat.</b>Eğitim hatası düşmeye devam ediyor ama test hatası artmaya başlıyor mu bak.' :
        '<b>Aşırı uyum (overfit).</b>Eğri eğitim noktalarına yapışıyor; görmediği noktalarda dalgalanıp test hatasını büyütüyor.';
    }
    row2.querySelector('input').addEventListener('input', function (e) { document.getElementById('plo').textContent = e.target.value; draw2(+e.target.value); });
    draw2(1);
  }

  /* ---------- 3) Sigmoid ---------- */
  var sg = document.getElementById('siglab');
  if (sg) {
    var r3 = el('div', 'slider-row'); r3.innerHTML = '<label for="sgz">z = θᵀx</label><input id="sgz" type="range" min="-8" max="8" step="0.1" value="0"><output id="sgo">0,0</output>';
    sg.appendChild(r3);
    var s3 = svgEl('svg', { viewBox: '0 0 ' + W + ' 220', 'class': 'diagram', role: 'img', 'aria-label': 'Sigmoid fonksiyonu' }, null); sg.appendChild(s3);
    var H3 = 220, B3 = 30;
    function X3(z) { return L + (z + 8) / 16 * (W - L - R); }
    function Y3(g) { return T + (1 - g) * (H3 - T - B3); }
    svgEl('line', { x1: L, y1: H3 - B3, x2: W - R, y2: H3 - B3, 'class': 'd-line' }, s3);
    svgEl('line', { x1: X3(0), y1: T, x2: X3(0), y2: H3 - B3, 'class': 'd-line' }, s3);
    svgEl('line', { x1: L, y1: Y3(0.5), x2: W - R, y2: Y3(0.5), 'class': 'd-dash' }, s3);
    var pp = []; for (var q = -80; q <= 80; q++) { var zz = q / 10; pp.push(X3(zz) + ',' + Y3(1 / (1 + Math.exp(-zz)))); }
    svgEl('polyline', { points: pp.join(' '), fill: 'none', 'class': 'd-line-brand' }, s3);
    var t05 = svgEl('text', { x: L + 4, y: Y3(0.5) - 4, 'class': 'd-sm' }, s3); t05.textContent = '0,5 eşiği';
    var dt = svgEl('circle', { r: 8, 'class': 'd-bad' }, s3);
    var o3 = el('div', 'callout idea'); sg.appendChild(o3);
    function draw3(z) {
      var g = 1 / (1 + Math.exp(-z));
      dt.setAttribute('cx', X3(z)); dt.setAttribute('cy', Y3(g));
      o3.innerHTML = '<b>g(z) = ' + f3(g) + '</b>' + (g >= 0.5 ? ' → model sınıf 1 der.' : ' → model sınıf 0 der.') + ' z büyüdükçe çıktı 1’e, küçüldükçe 0’a yaklaşır; hiçbir zaman ikisini de aşmaz.';
    }
    r3.querySelector('input').addEventListener('input', function (e) { var z = +e.target.value; document.getElementById('sgo').textContent = f2(z).replace(/0$/, ''); draw3(z); });
    draw3(0);
  }
})();
