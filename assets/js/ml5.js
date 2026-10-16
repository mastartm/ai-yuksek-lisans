/* Makine Öğrenmesi · Bölüm 5: maksimum aralıklı ayırıcı (SVM) ve XOR ile gizli katman. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function svgEl(name, attrs, parent) { var e = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (parent) parent.appendChild(e); return e; }
  function f2(x) { return (Math.round(x * 100) / 100).toFixed(2).replace('.', ','); }
  function sig(z) { return 1 / (1 + Math.exp(-z)); }

  /* ---------- 1) Maksimum aralık ---------- */
  var sv = document.getElementById('svmlab');
  if (sv) {
    var P = [[-2.2, 1.6, 1], [-1.4, 2.3, 1], [-0.6, 1.1, 1], [-1.9, 0.5, 1], [-0.9, 2.5, 1], [-2.5, 2.4, 1],
             [1.0, -0.9, -1], [1.8, -1.6, -1], [2.4, -0.4, -1], [0.6, -2.0, -1], [2.2, -2.3, -1], [1.3, 0.1, -1]];
    var W = 560, H = 300, cx = W / 2, cy = H / 2, sc = 44;
    var ang = 20, off = 0;
    var r1 = el('div', 'slider-row'); r1.innerHTML = '<label for="svA">Çizginin açısı</label><input id="svA" type="range" min="0" max="359" step="1" value="20"><output id="svAo">20°</output>';
    var r2 = el('div', 'slider-row'); r2.innerHTML = '<label for="svC">Çizginin konumu</label><input id="svC" type="range" min="-3" max="3" step="0.05" value="0"><output id="svCo">0,00</output>';
    sv.appendChild(r1); sv.appendChild(r2);
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'diagram', role: 'img', 'aria-label': 'İki sınıf ve ayırıcı doğru' }, null); sv.appendChild(svg);
    var gL = svgEl('g', {}, svg), gP = svgEl('g', {}, svg);
    var mid = svgEl('line', { 'class': 'd-line-brand', 'stroke-width': 3 }, gL);
    var m1 = svgEl('line', { 'class': 'd-dash' }, gL), m2 = svgEl('line', { 'class': 'd-dash' }, gL);
    var dots = P.map(function (p) {
      var ring = svgEl('circle', { cx: cx + p[0] * sc, cy: cy - p[1] * sc, r: 11, fill: 'none', 'class': 'd-ok', 'stroke-width': 2.5, visibility: 'hidden' }, gP);
      var c = svgEl('circle', { cx: cx + p[0] * sc, cy: cy - p[1] * sc, r: 6, 'class': p[2] > 0 ? 'd-brand' : 'd-bad' }, gP);
      return { ring: ring, c: c };
    });
    var info = el('div', 'metrics'); sv.appendChild(info);
    var note = el('div', 'callout idea'); sv.appendChild(note);
    var bar = el('div', 'chips'); var bb = el('button', 'btn primary', 'En geniş aralığı bul'); bb.type = 'button'; bar.appendChild(bb); sv.appendChild(bar);
    var sA = r1.querySelector('input'), sC = r2.querySelector('input');
    function seg(l, a, c, d) { // doğrunun n·x = c + d üzerindeki uç noktaları
      var t = a * Math.PI / 180, nx = Math.cos(t), ny = Math.sin(t), k = c + d, tx = -ny, ty = nx, L = 8;
      var bx = nx * k, by = ny * k;
      l.setAttribute('x1', cx + (bx - tx * L) * sc); l.setAttribute('y1', cy - (by - ty * L) * sc);
      l.setAttribute('x2', cx + (bx + tx * L) * sc); l.setAttribute('y2', cy - (by + ty * L) * sc);
    }
    function best() {
      var bg = -1e9, ba = 0, bc = 0;
      for (var a = 0; a < 360; a++) {
        var t = a * Math.PI / 180, nx = Math.cos(t), ny = Math.sin(t), mp = 1e9, mn = -1e9;
        P.forEach(function (p) { var z = p[0] * nx + p[1] * ny; if (p[2] > 0) mp = Math.min(mp, z); else mn = Math.max(mn, z); });
        // pozitif sınıf n yönünde, negatif ters yönde kalmalı
        var g = mp - mn; if (g > bg) { bg = g; ba = a; bc = (mp + mn) / 2; }
      }
      return { a: ba, c: bc, g: bg };
    }
    var B = best();
    function draw() {
      var t = ang * Math.PI / 180, nx = Math.cos(t), ny = Math.sin(t), ok = true, m = 1e9;
      P.forEach(function (p) { var z = p[0] * nx + p[1] * ny - off; if (z * p[2] <= 0) ok = false; m = Math.min(m, Math.abs(z)); });
      seg(mid, ang, off, 0);
      if (ok) { seg(m1, ang, off, m); seg(m2, ang, off, -m); m1.setAttribute('visibility', 'visible'); m2.setAttribute('visibility', 'visible'); } else { m1.setAttribute('visibility', 'hidden'); m2.setAttribute('visibility', 'hidden'); }
      var nsv = 0;
      P.forEach(function (p, i) { var z = Math.abs(p[0] * nx + p[1] * ny - off), s = ok && z - m < 0.06; dots[i].ring.setAttribute('visibility', s ? 'visible' : 'hidden'); if (s) nsv++; });
      document.getElementById('svAo').textContent = ang + '°'; document.getElementById('svCo').textContent = f2(off);
      info.innerHTML = '<div class="metric"><b>' + (ok ? f2(m * 2) : '–') + '</b>aralık (marj) genişliği</div><div class="metric"><b>' + f2(B.g) + '</b>mümkün olan en geniş aralık</div><div class="metric"><b>' + (ok ? nsv : '–') + '</b>destek vektörü</div>';
      note.innerHTML = !ok ? '<b>Yanlış ayrım.</b>Bazı noktalar çizginin yanlış tarafında. Doğruyu iki sınıfı ayıracak biçimde çevir ya da kaydır.' :
        (m * 2 > B.g - 0.08) ? '<b>Maksimum aralık.</b>Çizgi iki sınıfa da en uzak durdu. Yeşil halkalar <b>destek vektörleridir</b>: karar sınırını yalnızca onlar belirler; diğer noktaları silsen çizgi değişmez.' :
        '<b>Ayırıyor, ama dar.</b>Çizgi iki sınıfı ayırıyor fakat bir sınıfa fazla yakın. Yeni veride hata riski yüksek. Aralığı büyütmeye çalış.';
    }
    sA.addEventListener('input', function (e) { ang = +e.target.value; draw(); });
    sC.addEventListener('input', function (e) { off = +e.target.value; draw(); });
    bb.addEventListener('click', function () { ang = B.a; off = B.c; sA.value = ang; sC.value = Math.max(-3, Math.min(3, Math.round(off * 20) / 20)); draw(); });
    draw();
  }

  /* ---------- 2) XOR ve gizli katman ---------- */
  var xl = document.getElementById('xorlab');
  if (xl) {
    var w = { a: 10, b: 10, c: -5 }, hidden = false;
    function mkrow(id, label, min, max, val) { var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="1" value="' + val + '"><output id="' + id + 'o"></output>'; xl.appendChild(r); return r.querySelector('input'); }
    var ia = mkrow('xw1', 'Ağırlık w₁', -20, 20, 10), ib = mkrow('xw2', 'Ağırlık w₂', -20, 20, 10), ic = mkrow('xb', 'Eşik (bias) b', -30, 30, -5);
    var bar2 = el('div', 'chips'), tg = el('button', 'chip', 'Gizli katman ekle'); tg.type = 'button'; bar2.appendChild(tg); xl.appendChild(bar2);
    var tbl = el('div', 'scroll-x'); xl.appendChild(tbl);
    var note2 = el('div', 'callout idea'); xl.appendChild(note2);
    function out(x1, x2) {
      if (!hidden) return sig(w.a * x1 + w.b * x2 + w.c);
      var h1 = sig(20 * x1 + 20 * x2 - 10), h2 = sig(20 * x1 + 20 * x2 - 30);
      return sig(20 * h1 - 20 * h2 - 10);
    }
    function draw2() {
      w.a = +ia.value; w.b = +ib.value; w.c = +ic.value;
      document.getElementById('xw1o').textContent = w.a; document.getElementById('xw2o').textContent = w.b; document.getElementById('xbo').textContent = w.c;
      [ia, ib, ic].forEach(function (i) { i.disabled = hidden; });
      tg.setAttribute('aria-pressed', hidden ? 'true' : 'false');
      var ok = 0, rows = '';
      [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(function (p) {
        var y = out(p[0], p[1]), t = p[0] ^ p[1], pr = y >= 0.5 ? 1 : 0, good = pr === t; if (good) ok++;
        rows += '<tr><td>' + p[0] + '</td><td>' + p[1] + '</td><td>' + t + '</td><td>' + f2(y) + '</td><td>' + (good ? '✓' : '✗') + '</td></tr>';
      });
      tbl.innerHTML = '<table class="cmp"><thead><tr><th>x₁</th><th>x₂</th><th>hedef (XOR)</th><th>çıktı</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>';
      note2.innerHTML = hidden ? '<b>' + ok + ' / 4 doğru.</b>İki gizli birim (biri “VEYA”, biri “VE” gibi davranır) ve onları birleştiren çıkış birimi XOR’u çözer. Gizli katman, girdiyi doğrusal ayrılabilir yeni bir temsile çevirir.' :
        '<b>' + ok + ' / 4 doğru.</b>Tek birimle (tek doğru) hangi ağırlığı denesen en çok 3 doğru alırsın: XOR doğrusal ayrılamaz. Ağırlıkları kaydırıp dene, sonra “Gizli katman ekle”ye bas.';
    }
    [ia, ib, ic].forEach(function (i) { i.addEventListener('input', draw2); });
    tg.addEventListener('click', function () { hidden = !hidden; draw2(); });
    draw2();
  }
})();
