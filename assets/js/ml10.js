/* Makine Öğrenmesi · Bölüm 10: notundaki 6 noktalık yakınlık matrisiyle kümeleyici hiyerarşik kümeleme ve dendrogram,
   ayrıca bölücü yöntemde olası bölme sayısı. Matris: ders notundaki Bölüm 10.3 matrisi. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function svgEl(name, attrs, parent) { var e = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (parent) parent.appendChild(e); return e; }
  function f2(x) { return (Math.round(x * 100) / 100).toFixed(2).replace('.', ','); }
  var COL = ['var(--brand)', 'var(--ok)', 'var(--warn)', 'var(--bad)', 'var(--muted)', 'var(--text)'];

  /* ---------- 1) Kümeleyici hiyerarşik kümeleme ---------- */
  (function agnesLab() {
    var root = document.getElementById('hlab');
    if (!root) return;
    var D = [[0, .24, .22, .37, .34, .23], [.24, 0, .15, .20, .14, .25], [.22, .15, 0, .15, .28, .11], [.37, .20, .15, 0, .29, .22], [.34, .14, .28, .29, 0, .39], [.23, .25, .11, .22, .39, 0]];
    var link = 'single', cut = 0.2, nodes;

    function build() {
      nodes = []; var act = [], i;
      for (i = 0; i < 6; i++) { nodes.push({ id: i, mem: [i], h: 0, kids: null }); act.push(i); }
      function dist(a, b) {
        var v = [], x, y;
        nodes[a].mem.forEach(function (p) { nodes[b].mem.forEach(function (q) { v.push(D[p][q]); }); });
        if (link === 'single') return Math.min.apply(null, v);
        if (link === 'complete') return Math.max.apply(null, v);
        return v.reduce(function (s, t) { return s + t; }, 0) / v.length;
      }
      var merges = [];
      while (act.length > 1) {
        var best = null, a, b;
        for (a = 0; a < act.length; a++) for (b = a + 1; b < act.length; b++) {
          var d = Math.round(dist(act[a], act[b]) * 1e6) / 1e6, sz = nodes[act[a]].mem.length + nodes[act[b]].mem.length;
          if (!best || d < best.d - 1e-9 || (Math.abs(d - best.d) < 1e-9 && sz > best.sz)) best = { a: act[a], b: act[b], d: d, sz: sz };
        }
        var n = { id: nodes.length, mem: nodes[best.a].mem.concat(nodes[best.b].mem), h: best.d, kids: [best.a, best.b] };
        nodes.push(n); merges.push(n);
        act = act.filter(function (x) { return x !== best.a && x !== best.b; }); act.push(n.id);
      }
      return merges;
    }
    var bar = el('div', 'chips'); root.appendChild(bar);
    var LINKS = [['single', 'Tek bağlantı (en yakın)'], ['complete', 'Tam bağlantı (en uzak)'], ['average', 'Grup ortalama']];
    LINKS.forEach(function (l) { var b = el('button', 'chip', l[1]); b.type = 'button'; b.dataset.k = l[0]; b.addEventListener('click', function () { link = l[0]; draw(); }); bar.appendChild(b); });
    var row = el('div', 'slider-row');
    row.innerHTML = '<label for="hcut">Kesme yüksekliği</label><input id="hcut" type="range" min="0.05" max="0.45" step="0.01" value="0.2"><output id="hcuto">0,20</output>';
    root.appendChild(row);
    var rng = row.querySelector('input'); rng.addEventListener('input', function () { cut = +rng.value; draw(); });
    var box = el('div'); root.appendChild(box);
    var tw = el('div', 'scroll-x'); root.appendChild(tw);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);

    function draw() {
      Array.prototype.forEach.call(bar.children, function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === link)); });
      document.getElementById('hcuto').textContent = f2(cut);
      var merges = build(), top = merges[merges.length - 1];
      // yaprak sırası ve konum
      var order = [], pos = {};
      (function walk(n) { if (!n.kids) { pos[n.id] = order.length; order.push(n.id); } else { walk(nodes[n.kids[0]]); walk(nodes[n.kids[1]]); } })(top);
      var W = 340, H = 230, L = 34, R = 10, T = 14, B = 34, maxH = 0.45;
      function X(id) { var n = nodes[id]; if (!n.kids) return L + (pos[id] + 0.5) * (W - L - R) / 6; return (X(n.kids[0]) + X(n.kids[1])) / 2; }
      function Y(h) { return H - B - h / maxH * (H - B - T); }
      // kümeler: kesme çizgisi altındaki en büyük düğümler
      var groups = [];
      (function cutw(n) { if (n.h <= cut || !n.kids) groups.push(n); else { cutw(nodes[n.kids[0]]); cutw(nodes[n.kids[1]]); } })(top);
      var color = {}; groups.forEach(function (g, i) { g.mem.forEach(function (m) { color[m] = i; }); });
      var gid = {}; groups.forEach(function (g, i) { (function mark(n) { gid[n.id] = i; if (n.kids) { mark(nodes[n.kids[0]]); mark(nodes[n.kids[1]]); } })(g); });
      box.innerHTML = '';
      var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Dendrogram' }, box);
      [0, 0.1, 0.2, 0.3, 0.4].forEach(function (t) { svgEl('line', { x1: L, x2: W - R, y1: Y(t), y2: Y(t), stroke: 'var(--line)', 'stroke-width': 1 }, svg); var tx = svgEl('text', { x: L - 4, y: Y(t) + 4, 'text-anchor': 'end', 'font-size': 10, fill: 'var(--muted)' }, svg); tx.textContent = f2(t); });
      nodes.forEach(function (n) {
        if (!n.kids) return;
        var a = nodes[n.kids[0]], b = nodes[n.kids[1]], col = gid[n.id] !== undefined ? COL[gid[n.id] % COL.length] : 'var(--muted)';
        svgEl('path', { d: 'M' + X(a.id) + ' ' + Y(a.h) + ' V' + Y(n.h) + ' H' + X(b.id) + ' V' + Y(b.h), fill: 'none', stroke: col, 'stroke-width': 2.4 }, svg);
      });
      order.forEach(function (id) { var t = svgEl('text', { x: X(id), y: H - B + 16, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: COL[color[id] % COL.length] }, svg); t.textContent = 'p' + (id + 1); });
      svgEl('line', { x1: L, x2: W - R, y1: Y(cut), y2: Y(cut), stroke: 'var(--bad)', 'stroke-dasharray': '5 4', 'stroke-width': 2 }, svg);
      var rows = merges.map(function (m, i) { return '<tr><td>' + (i + 1) + '</td><td>' + m.mem.map(function (x) { return 'p' + (x + 1); }).join(' ∪ ') + '</td><td>' + f2(m.h) + '</td></tr>'; }).join('');
      tw.innerHTML = '<table class="cmp"><thead><tr><th>Adım</th><th>Oluşan küme</th><th>Birleşme uzaklığı</th></tr></thead><tbody>' + rows + '</tbody></table>';
      var gaps = merges.map(function (m, i) { return i ? m.h - merges[i - 1].h : 0; }), mg = 0, mi = 0; gaps.forEach(function (g, i) { if (g > mg) { mg = g; mi = i; } });
      info.innerHTML = '<div class="metric"><b>' + groups.length + '</b>kesme çizgisinde küme sayısı</div><div class="metric"><b>' + f2(merges[0].h) + '</b>ilk birleşme uzaklığı</div><div class="metric"><b>' + f2(top.h) + '</b>son birleşme uzaklığı</div>';
      var msg = link === 'single' ? 'Tek bağlantıda yeni kümenin uzaklığı, kümelerin <b>en yakın</b> çiftinden alınır. Notundaki örnekte sıra: p3∪p6 (0,11), p2∪p5 (0,14), bu ikisi (0,15), p4 (0,15), p1 (0,22).' : link === 'complete' ? 'Tam bağlantıda uzaklık, kümelerin <b>en uzak</b> çiftinden alınır. Notundaki örnekte sıra: p3∪p6 (0,11), p2∪p5 (0,14), p4 (0,22), p1 (0,34), son iki küme (0,39). Tek bağlantıdan farklı bir ağaç çıkar.' : 'Grup ortalamada uzaklık, iki kümedeki <b>tüm</b> nokta çiftlerinin uzaklık ortalamasıdır (5 ve 4 nokta için 20 çift). Notta tek ve tam bağlantı arasında bir yöntem olarak anılır; bu ağacı notunda bulamazsın, siteyi yapan hesapladı.';
      note.innerHTML = msg + '<br>En büyük sıçrama ' + (mi + 1) + '. birleşmede (' + f2(mg) + '): ağacı kesmek için iki birleşme arasındaki en büyük aralık uygun olabilir.';
    }
    draw();
  })();

  /* ---------- 2) Bölücü yöntemde olası bölme sayısı ---------- */
  (function splitLab() {
    var root = document.getElementById('bolenlab');
    if (!root) return;
    var r = el('div', 'slider-row'); r.innerHTML = '<label for="bn">Nesne sayısı n</label><input id="bn" type="range" min="2" max="40" step="1" value="5"><output id="bno">5</output>'; root.appendChild(r);
    var inp = r.querySelector('input');
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function draw() {
      var n = +inp.value; document.getElementById('bno').textContent = n;
      var splits = Math.pow(2, n - 1) - 1;
      info.innerHTML = '<div class="metric"><b>' + splits.toLocaleString('tr-TR') + '</b>olası bölme: 2<sup>n−1</sup> − 1</div><div class="metric"><b>' + n + '</b>kümeleyici yöntemin en çok yineleme sayısı (notta: en fazla n)</div>';
      note.innerHTML = n <= 5 ? 'Beş nesnede bile 15 farklı bölme vardır. Yine de sayı küçük kalır.' : 'n büyüdükçe olası bölme sayısı <b>üstel</b> artar. Bu yüzden bölücü yöntemler bölerken sezgisel (heuristic) kurallar kullanır ve bu yanlış sonuç verebilir.';
    }
    inp.addEventListener('input', draw); draw();
  })();
})();
