/* Makine Öğrenmesi · Bölüm 11: DBSCAN, hücre ızgarası (CLIQUE fikri) ve küme sayısı (dirsek + siluet).
   Noktalar bu site için üretilmiştir (sabit tohumlu rastgele sayı). */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function svgEl(name, attrs, parent) { var e = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (parent) parent.appendChild(e); return e; }
  function f2(x) { return (Math.round(x * 100) / 100).toFixed(2).replace('.', ','); }
  var COL = ['var(--brand)', 'var(--ok)', 'var(--warn)', 'var(--bad)', 'var(--text)', 'var(--muted)'];
  var seed = 3;
  function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
  function gauss() { return (rnd() + rnd() + rnd() + rnd() - 2) * 1.7; }

  function moonsWithNoise() {
    seed = 11; var a = [], i, t;
    for (i = 0; i < 40; i++) { t = Math.PI * i / 39; a.push([50 + 100 + 100 * Math.cos(t) + gauss() * 2.5, 190 - 100 * Math.sin(t) + gauss() * 2.5]); }
    for (i = 0; i < 40; i++) { t = Math.PI * i / 39; a.push([250 + 100 * Math.cos(t) + gauss() * 2.5, 140 + 100 * Math.sin(t) + gauss() * 2.5]); }
    for (i = 0; i < 10; i++) a.push([20 + rnd() * 360, 20 + rnd() * 260]);
    return a;
  }
  function threeBlobs() {
    seed = 21; var a = [], c = [[80, 80], [280, 90], [180, 230]], i, j;
    for (j = 0; j < 3; j++) for (i = 0; i < 30; i++) a.push([c[j][0] + gauss() * 16, c[j][1] + gauss() * 16]);
    return a;
  }

  /* ---------- 1) DBSCAN ---------- */
  (function dbscanLab() {
    var root = document.getElementById('dbscanlab');
    if (!root) return;
    var P = moonsWithNoise(), eps = 22, minPts = 4;
    function row(id, label, min, max, step, val) { var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>'; root.appendChild(r); var i = r.querySelector('input'); i.addEventListener('input', draw); return i; }
    var iE = row('dbe', 'Komşuluk yarıçapı ε', 6, 40, 1, eps), iM = row('dbm', 'MinPts', 2, 10, 1, minPts);
    var box = el('div'); root.appendChild(box);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function dbscan() {
      var n = P.length, nb = [], i, j;
      for (i = 0; i < n; i++) { nb[i] = []; for (j = 0; j < n; j++) if (Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]) <= eps) nb[i].push(j); }
      var core = nb.map(function (x) { return x.length >= minPts; });
      var lab = P.map(function () { return -1; }), cid = 0;
      for (i = 0; i < n; i++) {
        if (!core[i] || lab[i] !== -1) continue;
        var stack = [i]; lab[i] = cid;
        while (stack.length) { var q = stack.pop(); nb[q].forEach(function (r) { if (lab[r] === -1) { lab[r] = cid; if (core[r]) stack.push(r); } }); }
        cid++;
      }
      var kind = P.map(function (_, k) { return core[k] ? 'core' : (lab[k] >= 0 ? 'border' : 'noise'); });
      return { lab: lab, kind: kind, count: cid };
    }
    function draw() {
      eps = +iE.value; minPts = +iM.value; document.getElementById('dbeo').textContent = eps; document.getElementById('dbmo').textContent = minPts;
      var r = dbscan();
      box.innerHTML = '';
      var svg = svgEl('svg', { viewBox: '0 0 400 300', role: 'img', 'aria-label': 'DBSCAN sonucu: merkez, sınır ve gürültü noktaları' }, box);
      P.forEach(function (p, i) {
        var k = r.kind[i], col = r.lab[i] >= 0 ? COL[r.lab[i] % 5] : 'var(--muted)';
        if (k === 'core') svgEl('circle', { cx: p[0], cy: p[1], r: 5, fill: col }, svg);
        else if (k === 'border') svgEl('circle', { cx: p[0], cy: p[1], r: 4.5, fill: 'var(--surface)', stroke: col, 'stroke-width': 2.4 }, svg);
        else svgEl('path', { d: 'M' + (p[0] - 4) + ' ' + (p[1] - 4) + ' L' + (p[0] + 4) + ' ' + (p[1] + 4) + ' M' + (p[0] + 4) + ' ' + (p[1] - 4) + ' L' + (p[0] - 4) + ' ' + (p[1] + 4), stroke: 'var(--bad)', 'stroke-width': 2 }, svg);
      });
      var cnt = { core: 0, border: 0, noise: 0 }; r.kind.forEach(function (k) { cnt[k]++; });
      info.innerHTML = '<div class="metric"><b>' + r.count + '</b>bulunan küme</div><div class="metric"><b>' + cnt.core + '</b>merkez nokta (dolu daire)</div><div class="metric"><b>' + cnt.border + '</b>sınır nokta (halka)</div><div class="metric"><b>' + cnt.noise + '</b>gürültü nokta (kırmızı ×)</div>';
      note.innerHTML = r.count === 2 && cnt.noise > 0 ? '<b>Güzel ayar.</b> İki hilal tek tek küme olarak bulundu ve dağınık noktalar gürültü olarak etiketlendi. Algoritma kümeye gürültü katmadı.' : r.count > 2 ? '<b>Küme sayısı arttı.</b> ε küçük ya da MinPts büyükse yoğunluk koşulu zorlaşır, hilal parçalanır.' : r.count < 2 ? '<b>Kümeler birleşti ya da kayboldu.</b> ε çok büyükse iki hilal birbirine bağlanır; MinPts çok büyükse hiçbir nokta merkez olamaz.' : '<b>Gürültü yok.</b> ε çok büyük olduğunda dağınık noktalar da bir kümeye bağlanır.';
    }
    draw();
  })();

  /* ---------- 2) Hücre ızgarası (CLIQUE'in ilk adımı) ---------- */
  (function cellLab() {
    var root = document.getElementById('hucrelab');
    if (!root) return;
    var P = moonsWithNoise();
    function row(id, label, min, max, step, val) { var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>'; root.appendChild(r); var i = r.querySelector('input'); i.addEventListener('input', draw); return i; }
    var iG = row('hg', 'Her boyuttaki aralık sayısı', 4, 20, 1, 6), iT = row('ht', 'Yoğunluk eşiği (bu sayıyı aşan hücre yoğun)', 0, 8, 1, 2);
    var box = el('div'); root.appendChild(box);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function draw() {
      var g = +iG.value, th = +iT.value; document.getElementById('hgo').textContent = g; document.getElementById('hto').textContent = th;
      var W = 400, H = 300, cw = W / g, ch = H / g, cnt = [], i, j;
      for (i = 0; i < g; i++) { cnt.push([]); for (j = 0; j < g; j++) cnt[i].push(0); }
      P.forEach(function (p) { var a = Math.min(g - 1, Math.floor(p[0] / cw)), b = Math.min(g - 1, Math.floor(p[1] / ch)); cnt[a][b]++; });
      var dense = cnt.map(function (c) { return c.map(function (v) { return v > th; }); });
      var comp = cnt.map(function (c) { return c.map(function () { return -1; }); }), n = 0;
      for (i = 0; i < g; i++) for (j = 0; j < g; j++) {
        if (!dense[i][j] || comp[i][j] !== -1) continue;
        var st = [[i, j]]; comp[i][j] = n;
        while (st.length) { var c = st.pop(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var x = c[0] + d[0], y = c[1] + d[1]; if (x >= 0 && y >= 0 && x < g && y < g && dense[x][y] && comp[x][y] === -1) { comp[x][y] = n; st.push([x, y]); } }); }
        n++;
      }
      box.innerHTML = '';
      var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Hücre ızgarası ve yoğun hücreler' }, box);
      var nd = 0;
      for (i = 0; i < g; i++) for (j = 0; j < g; j++) {
        if (dense[i][j]) { nd++; svgEl('rect', { x: i * cw, y: j * ch, width: cw, height: ch, fill: COL[comp[i][j] % 5], opacity: 0.28 }, svg); }
        svgEl('rect', { x: i * cw, y: j * ch, width: cw, height: ch, fill: 'none', stroke: 'var(--line)', 'stroke-width': 0.6 }, svg);
      }
      P.forEach(function (p) { svgEl('circle', { cx: p[0], cy: p[1], r: 3, fill: 'var(--text)' }, svg); });
      info.innerHTML = '<div class="metric"><b>' + nd + '</b>yoğun hücre</div><div class="metric"><b>' + n + '</b>bağlı yoğun hücre grubu (küme)</div><div class="metric"><b>' + (g * g) + '</b>toplam hücre</div>';
      note.innerHTML = n === 2 ? '<b>İki küme bulundu.</b> Yan yana duran yoğun hücreler bir araya bağlandı; seyrek hücreler dışarıda kaldı. Kümeler hücre kenarlarıyla sınırlı olduğundan sınırlar basamaklıdır.' : n > 2 ? 'Izgara çok ince ya da eşik yüksek: yoğun bölgeler küçük parçalara ayrıldı. Notta, ızgara boyutu ve yoğunluk eşiğinin doğru ayarlanmasının zor olduğu söylenir.' : n === 1 ? 'Izgara kaba ya da eşik düşük: iki bölge tek parça oldu. Çok kaba ızgarada küme kalitesi düşer.' : 'Eşik çok yüksek: hiçbir hücre yoğun sayılmadı.';
    }
    draw();
  })();

  /* ---------- 3) Küme sayısı: dirsek ve siluet ---------- */
  (function kLab() {
    var root = document.getElementById('klab');
    if (!root) return;
    var P = threeBlobs(), n = P.length;
    function d(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
    function kmeans(k) {
      var C = [P[0].slice()], i, j;
      while (C.length < k) { var best = -1, bi = 0; for (i = 0; i < n; i++) { var m = Math.min.apply(null, C.map(function (c) { return d(P[i], c); })); if (m > best) { best = m; bi = i; } } C.push(P[bi].slice()); }
      var lab = [];
      for (var it = 0; it < 40; it++) {
        lab = P.map(function (p) { var b = 0; for (j = 1; j < k; j++) if (d(p, C[j]) < d(p, C[b])) b = j; return b; });
        for (j = 0; j < k; j++) { var sx = 0, sy = 0, c = 0; P.forEach(function (p, q) { if (lab[q] === j) { sx += p[0]; sy += p[1]; c++; } }); if (c) C[j] = [sx / c, sy / c]; }
      }
      var sse = 0; P.forEach(function (p, q) { sse += Math.pow(d(p, C[lab[q]]), 2); });
      var sil = null;
      if (k > 1) {
        var tot = 0;
        for (i = 0; i < n; i++) {
          var sum = {}, cn = {}; for (j = 0; j < n; j++) if (j !== i) { sum[lab[j]] = (sum[lab[j]] || 0) + d(P[i], P[j]); cn[lab[j]] = (cn[lab[j]] || 0) + 1; }
          var own = cn[lab[i]] ? sum[lab[i]] / cn[lab[i]] : 0, other = Infinity;
          Object.keys(sum).forEach(function (key) { if (+key !== lab[i]) other = Math.min(other, sum[key] / cn[key]); });
          tot += cn[lab[i]] ? (other - own) / Math.max(own, other) : 0;
        }
        sil = tot / n;
      }
      return { lab: lab, C: C, sse: sse, sil: sil };
    }
    var R = []; for (var k = 1; k <= 8; k++) R.push(kmeans(k));
    var row = el('div', 'slider-row'); row.innerHTML = '<label for="kk">Küme sayısı k</label><input id="kk" type="range" min="1" max="8" step="1" value="3"><output id="kko">3</output>'; root.appendChild(row);
    var inp = row.querySelector('input');
    var box = el('div'); root.appendChild(box);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function draw() {
      var kk = +inp.value; document.getElementById('kko').textContent = kk;
      var r = R[kk - 1];
      box.innerHTML = '';
      var svg = svgEl('svg', { viewBox: '0 0 400 420', role: 'img', 'aria-label': 'k-ortalamalar sonucu, dirsek grafiği ve siluet grafiği' }, box);
      P.forEach(function (p, i) { svgEl('circle', { cx: p[0] * 1.0, cy: p[1] * 0.9 + 6, r: 4, fill: COL[r.lab[i] % 5] }, svg); });
      r.C.forEach(function (c) { svgEl('path', { d: 'M' + (c[0] - 7) + ' ' + (c[1] * 0.9 + 6) + ' H' + (c[0] + 7) + ' M' + c[0] + ' ' + (c[1] * 0.9 + 6 - 7) + ' V' + (c[1] * 0.9 + 6 + 7), stroke: 'var(--text)', 'stroke-width': 3 }, svg); });
      function chart(x0, title, vals, lo, hi) {
        var w = 170, h = 100, y0 = 300;
        var t = svgEl('text', { x: x0, y: y0 - 6, 'font-size': 12, fill: 'var(--muted)' }, svg); t.textContent = title;
        svgEl('rect', { x: x0, y: y0, width: w, height: h, fill: 'none', stroke: 'var(--line)' }, svg);
        var pts = vals.map(function (v, i) { return v === null ? null : [x0 + 8 + i * (w - 16) / 7, y0 + h - 8 - (v - lo) / (hi - lo) * (h - 16)]; });
        var path = pts.filter(Boolean).map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join(' ');
        svgEl('path', { d: path, fill: 'none', stroke: 'var(--brand)', 'stroke-width': 2 }, svg);
        pts.forEach(function (p, i) { if (p) svgEl('circle', { cx: p[0], cy: p[1], r: i === kk - 1 ? 5 : 3, fill: i === kk - 1 ? 'var(--bad)' : 'var(--brand)' }, svg); });
        var l = svgEl('text', { x: x0, y: y0 + h + 14, 'font-size': 10, fill: 'var(--muted)' }, svg); l.textContent = 'k = 1 … 8';
      }
      var sses = R.map(function (x) { return x.sse; }), sils = R.map(function (x) { return x.sil; });
      chart(20, 'Küme içi hata (dirsek)', sses, 0, sses[0]);
      var vs = sils.filter(function (v) { return v !== null; });
      chart(210, 'Ortalama siluet', sils, Math.min.apply(null, vs) - 0.05, Math.max.apply(null, vs) + 0.05);
      var bestK = 1, bs = -2; sils.forEach(function (v, i) { if (v !== null && v > bs) { bs = v; bestK = i + 1; } });
      info.innerHTML = '<div class="metric"><b>' + Math.round(r.sse).toLocaleString('tr-TR') + '</b>küme içi toplam hata (k = ' + kk + ')</div><div class="metric"><b>' + (r.sil === null ? 'tanımsız' : f2(r.sil)) + '</b>ortalama siluet katsayısı</div><div class="metric"><b>' + bestK + '</b>siluetin en yüksek olduğu k</div>';
      note.innerHTML = 'Hata k arttıkça hep düşer; <b>eğimin ilk belirgin değiştiği nokta</b> (dirsek) doğru sayıya işaret eder. Siluet −1 ile 1 arasındadır; 1’e yakın değer küme yoğun, nesne diğer kümelerden uzak demektir. Bu 90 noktalık veride üç yoğun bölge vardır.';
    }
    inp.addEventListener('input', draw); draw();
  })();
})();
