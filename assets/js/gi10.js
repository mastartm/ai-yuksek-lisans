/* Görüntü İşleme · Bölüm 10: ikili morfoloji oyun alanı, delik doldurma adımları ve gri seviye (tek boyutlu) morfoloji.
   Görüntüler ve sinyaller bu site için üretilmiştir. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function svgEl(name, attrs, parent) { var e = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (parent) parent.appendChild(e); return e; }
  function sl(root, id, label, min, max, step, val, cb) { var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>'; root.appendChild(r); var i = r.querySelector('input'); i.addEventListener('input', cb); return i; }
  function grid(h, w, f) { var g = [], y, x; for (y = 0; y < h; y++) { g.push([]); for (x = 0; x < w; x++) g[y].push(f(y, x)); } return g; }
  function paint(cv, g, SC, colorFn) { var c = cv.getContext('2d'), y, x; for (y = 0; y < g.length; y++) for (x = 0; x < g[0].length; x++) { c.fillStyle = colorFn(g[y][x], y, x); c.fillRect(x * SC, y * SC, SC, SC); } c.strokeStyle = 'rgba(128,128,128,.25)'; for (x = 0; x <= g[0].length; x++) { c.beginPath(); c.moveTo(x * SC + .5, 0); c.lineTo(x * SC + .5, g.length * SC); c.stroke(); } for (y = 0; y <= g.length; y++) { c.beginPath(); c.moveTo(0, y * SC + .5); c.lineTo(g[0].length * SC, y * SC + .5); c.stroke(); } }
  function canv(parent, w, h) { var c = el('canvas'); c.width = w; c.height = h; c.style.cssText = 'border:1px solid var(--line);border-radius:6px;max-width:100%;height:auto;image-rendering:pixelated;background:#fff'; parent.appendChild(c); return c; }
  var SES = { sq3: ['Kare 3×3', [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 0], [0, 1], [1, -1], [1, 0], [1, 1]]], cross: ['Çapraz (artı) 3×3', [[-1, 0], [0, -1], [0, 0], [0, 1], [1, 0]]], sq5: ['Kare 5×5', (function () { var a = [], i, j; for (i = -2; i <= 2; i++) for (j = -2; j <= 2; j++) a.push([i, j]); return a; })()] };
  function erode(g, se) { var h = g.length, w = g[0].length; return grid(h, w, function (y, x) { return se.every(function (d) { var yy = y + d[0], xx = x + d[1]; return yy >= 0 && yy < h && xx >= 0 && xx < w && g[yy][xx]; }) ? 1 : 0; }); }
  function dilate(g, se) { var h = g.length, w = g[0].length; return grid(h, w, function (y, x) { return se.some(function (d) { var yy = y - d[0], xx = x - d[1]; return yy >= 0 && yy < h && xx >= 0 && xx < w && g[yy][xx]; }) ? 1 : 0; }); }
  function sub(a, b) { return grid(a.length, a[0].length, function (y, x) { return a[y][x] && !b[y][x] ? 1 : 0; }); }
  function count(g) { var n = 0; g.forEach(function (r) { r.forEach(function (v) { n += v ? 1 : 0; }); }); return n; }
  function comps(g) { var h = g.length, w = g[0].length, seen = grid(h, w, function () { return 0; }), n = 0, y, x; for (y = 0; y < h; y++) for (x = 0; x < w; x++) { if (!g[y][x] || seen[y][x]) continue; n++; var st = [[y, x]]; seen[y][x] = 1; while (st.length) { var c = st.pop(), i, j; for (i = -1; i <= 1; i++) for (j = -1; j <= 1; j++) { var yy = c[0] + i, xx = c[1] + j; if (yy >= 0 && yy < h && xx >= 0 && xx < w && g[yy][xx] && !seen[yy][xx]) { seen[yy][xx] = 1; st.push([yy, xx]); } } } } return n; }

  /* ---------- 1) İkili morfoloji oyun alanı ---------- */
  (function morphLab() {
    var root = document.getElementById('morlab');
    if (!root) return;
    var N = 24, SC = 6;
    var A = grid(N, N, function (y, x) {
      if (y >= 3 && y <= 11 && x >= 3 && x <= 11 && !(y >= 7 && y <= 8 && x >= 7 && x <= 8)) return 1;
      if (y >= 4 && y <= 9 && x >= 15 && x <= 20) return 1;
      if (y === 7 && x >= 12 && x <= 14) return 1;
      if (y === 18 && x >= 2 && x <= 20 && !(x >= 10 && x <= 11)) return 1;
      return [[2, 22], [14, 2], [21, 10], [22, 21], [15, 14], [12, 20]].some(function (p) { return p[0] === y && p[1] === x; }) ? 1 : 0;
    });
    var OPS = [['ero', 'Aşınma A ⊖ B'], ['dil', 'Genişleme A ⊕ B'], ['open', 'Açma (A ⊖ B) ⊕ B'], ['close', 'Kapama (A ⊕ B) ⊖ B'], ['bound', 'Sınır A − (A ⊖ B)'], ['grad', 'Gradyan (A ⊕ B) − (A ⊖ B)'], ['top', 'Top-hat A − (A ∘ B)'], ['bot', 'Bottom-hat (A • B) − A']];
    var op = 'ero', se = 'sq3';
    var bar1 = el('div', 'chips'), bar2 = el('div', 'chips'); bar2.style.marginTop = '8px'; root.appendChild(bar1); root.appendChild(bar2);
    OPS.forEach(function (o) { var b = el('button', 'chip', o[1]); b.type = 'button'; b.dataset.g = 'op'; b.dataset.k = o[0]; b.addEventListener('click', function () { op = o[0]; draw(); }); bar1.appendChild(b); });
    Object.keys(SES).forEach(function (k) { var b = el('button', 'chip', 'Yapısal eleman: ' + SES[k][0]); b.type = 'button'; b.dataset.g = 'se'; b.dataset.k = k; b.addEventListener('click', function () { se = k; draw(); }); bar2.appendChild(b); });
    var imgs = el('div'); imgs.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;margin:10px 0'; root.appendChild(imgs);
    var cA = canv(imgs, N * SC, N * SC), cB = canv(imgs, N * SC, N * SC);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function run() {
      var B = SES[se][1], e = erode(A, B), d = dilate(A, B);
      switch (op) {
        case 'ero': return e; case 'dil': return d;
        case 'open': return dilate(e, B); case 'close': return erode(d, B);
        case 'bound': return sub(A, e); case 'grad': return sub(d, e);
        case 'top': return sub(A, dilate(e, B)); case 'bot': return sub(erode(d, B), A);
      }
    }
    function draw() {
      Array.prototype.forEach.call(root.querySelectorAll('.chip'), function (b) { b.setAttribute('aria-pressed', String((b.dataset.g === 'op' ? op : se) === b.dataset.k)); });
      var R = run(); paint(cA, A, SC, function (v) { return v ? '#1c2033' : '#ffffff'; }); paint(cB, R, SC, function (v) { return v ? '#b45309' : '#ffffff'; });
      info.innerHTML = '<div class="metric"><b>' + count(A) + ' → ' + count(R) + '</b>ön plan piksel sayısı</div><div class="metric"><b>' + comps(A) + ' → ' + comps(R) + '</b>bağlı parça sayısı (8’li)</div>';
      var msg = { ero: 'Aşınmada yapısal eleman yalnızca <b>tamamen nesnenin içinde kalıyorsa</b> o konum ön plan sayılır: tek piksellik noktalar ve ince köprü silinir, nesneler küçülür, delik büyür.', dil: 'Genişlemede yapısal elemanın <b>herhangi bir noktası</b> nesneye değiyorsa merkez ön plan olur: nesneler büyür, küçük boşluklar (örneğin çizgideki kırık) kapanır, köprü kalınlaşır.', open: 'Açma küçük nesneleri ve ince çıkıntıları (tek piksellik gürültü, ince köprü) siler ama ana şekli büyük ölçüde korur. Aşınma ve genişleme art arda uygulanır.', close: 'Kapama küçük boşlukları ve ince kırıkları (çizgideki 2 piksellik aralık, küçük delik) doldurur. Genişleme ve aşınma art arda uygulanır.', bound: 'Sınır çıkarma, nesneden aşınmış hâlini çıkarır: yalnızca konturlar kalır. Delikler de kontur verir.', grad: 'Morfolojik gradyan genişleme ile aşınma arasındaki farkı alır: sınırın iç ve dışındaki kalın bir kuşak kalır.', top: 'Top-hat, özgün görüntüden açmayı çıkarır: açmanın sildiği <b>küçük, parlak (burada ön plan)</b> ayrıntılar (gürültü noktaları, ince köprü) görünür.', bot: 'Bottom-hat, kapamadan özgün görüntüyü çıkarır: kapamanın doldurduğu <b>küçük boşluklar ve kırıklar</b> görünür.' };
      note.innerHTML = msg[op];
    }
    draw();
  })();

  /* ---------- 2) Delik doldurma ---------- */
  (function holeLab() {
    var root = document.getElementById('holelab');
    if (!root) return;
    var N = 16, SC = 14, broken = false, X, steps, done, se = 'cross';
    function makeA() { return grid(N, N, function (y, x) { var o = y >= 3 && y <= 12 && x >= 3 && x <= 12, inn = y >= 5 && y <= 10 && x >= 5 && x <= 10; if (broken && x === 8 && (y === 3 || y === 4)) return 0; return o && !inn ? 1 : 0; }); }
    var A = makeA();
    var bar = el('div', 'chips'); root.appendChild(bar);
    function btn(label, cls, fn) { var b = el('button', 'btn' + (cls ? ' ' + cls : ''), label); b.type = 'button'; b.addEventListener('click', function () { fn(); draw(); }); bar.appendChild(b); }
    var bar2 = el('div', 'chips'); bar2.style.marginTop = '8px'; root.appendChild(bar2);
    function step() { if (done) return; var D = dilate(X, SES[se][1]), nx = grid(N, N, function (y, x) { return D[y][x] && !A[y][x] ? 1 : 0; }); steps++; var same = true; nx.forEach(function (r, y) { r.forEach(function (v, x) { if (v !== X[y][x]) same = false; }); }); if (same) { done = true; steps--; } X = nx; }
    function reset() { A = makeA(); X = grid(N, N, function (y, x) { return y === 7 && x === 7 ? 1 : 0; }); steps = 0; done = false; }
    btn('Bir adım', 'primary', step); btn('Bitene kadar', '', function () { var g = 0; while (!done && g++ < 60) step(); }); btn('Sıfırla', '', reset);
    [['cross', 'Çapraz yapısal eleman'], ['sq3', 'Kare 3×3 yapısal eleman']].forEach(function (a) { var b = el('button', 'chip', a[1]); b.type = 'button'; b.dataset.g = 'se'; b.dataset.k = a[0]; b.addEventListener('click', function () { se = a[0]; reset(); draw(); }); bar2.appendChild(b); });
    var bk = el('button', 'chip', 'Duvarda 1 piksellik kırık aç'); bk.type = 'button'; bk.addEventListener('click', function () { broken = !broken; reset(); draw(); }); bar2.appendChild(bk);
    var imgs = el('div'); imgs.style.cssText = 'margin:10px 0'; root.appendChild(imgs);
    var cv = canv(imgs, N * SC, N * SC);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function draw() {
      Array.prototype.forEach.call(bar2.children, function (b) { if (b.dataset.g === 'se') b.setAttribute('aria-pressed', String(b.dataset.k === se)); else b.setAttribute('aria-pressed', String(broken)); });
      var comb = grid(N, N, function (y, x) { return A[y][x] ? 1 : (X[y][x] ? 2 : 0); }); paint(cv, comb, SC, function (v) { return v === 1 ? '#1c2033' : v === 2 ? '#f59e0b' : '#ffffff'; });
      var filled = count(X), leaked = X[0][0] || X[N - 1][N - 1] || X[0][N - 1] || X[N - 1][0];
      info.innerHTML = '<div class="metric"><b>' + steps + '</b>yineleme (k)</div><div class="metric"><b>' + filled + '</b>X<sub>k</sub> içindeki piksel</div><div class="metric"><b>' + (done ? 'evet' : 'hayır') + '</b>X<sub>k</sub> = X<sub>k−1</sub> oldu mu?</div>';
      note.innerHTML = 'X<sub>k</sub> = (X<sub>k−1</sub> ⊕ B) ∩ A<sup>c</sup>: turuncu bölge her turda genişler ama yalnızca nesnenin <b>tümleyeninin içinde</b> kalır. ' + (done ? (leaked ? '<b>Doldurma dışarı kaçtı.</b> Duvarda 1 piksellik kırık olduğu için delik arka planla bağlanıyor; bu yüzden “arka planla tamamen çevrili” bir boşluk kalmadı. Duvar kapalı olmalıdır.' : '<b>Delik doldu.</b> Yinelemeler durdu (X<sub>k</sub> = X<sub>k−1</sub>); delik içindeki tüm piksel turuncu oldu. Nesneyle birleştirince delik kapanmış olur.') : 'Siyah: nesne A. Başlangıç noktası deliğin içinde (turuncu tek piksel).');
    }
    reset(); draw();
  })();

  /* ---------- 3) Gri seviye morfoloji (tek boyutlu) ---------- */
  (function grayLab() {
    var root = document.getElementById('grilab');
    if (!root) return;
    var N = 96, f = []; for (var n0 = 0; n0 < N; n0++) { var v = 80 + 10 * Math.sin(n0 / 12); if (n0 >= 29 && n0 <= 31) v += 100; if (n0 >= 59 && n0 <= 61) v -= 55; if (n0 >= 70 && n0 <= 90) v += 40; f.push(v); }
    var cur = 'top';
    var OPS = [['ero', 'Aşınma (en küçük)'], ['dil', 'Genişleme (en büyük)'], ['open', 'Açma'], ['close', 'Kapama'], ['top', 'Top-hat  f − açma'], ['bot', 'Bottom-hat  kapama − f']];
    var bar = el('div', 'chips'); root.appendChild(bar);
    OPS.forEach(function (o) { var b = el('button', 'chip', o[1]); b.type = 'button'; b.dataset.k = o[0]; b.addEventListener('click', function () { cur = o[0]; draw(); }); bar.appendChild(b); });
    var iW = sl(root, 'gw', 'Pencere genişliği (yapısal eleman)', 3, 15, 2, 7, draw);
    var box = el('div'); root.appendChild(box);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function win(a, w, fn) { var r = (w - 1) / 2; return a.map(function (_, i) { var m = a[i], j; for (j = i - r; j <= i + r; j++) { var q = a[Math.max(0, Math.min(a.length - 1, j))]; m = fn(m, q); } return m; }); }
    function ero(a, w) { return win(a, w, Math.min); } function dil(a, w) { return win(a, w, Math.max); }
    function draw() {
      Array.prototype.forEach.call(bar.children, function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === cur)); });
      var w = +iW.value; document.getElementById('gwo').textContent = w;
      var e = ero(f, w), d = dil(f, w), op = dil(e, w), cl = ero(d, w), out, lo = -20, hi = 220;
      out = { ero: e, dil: d, open: op, close: cl, top: f.map(function (v, i) { return v - op[i]; }), bot: f.map(function (v, i) { return cl[i] - v; }) }[cur];
      var Wd = 340, H = 170; box.innerHTML = '';
      var svg = svgEl('svg', { viewBox: '0 0 ' + Wd + ' ' + H, role: 'img', 'aria-label': 'Gri seviye morfoloji' }, box);
      function Y(v) { return H - 16 - (v - lo) / (hi - lo) * (H - 24); }
      function path(a, c, wd, dash) { svgEl('path', { d: a.map(function (v, i) { return (i ? 'L' : 'M') + (8 + i / (N - 1) * (Wd - 16)) + ' ' + Y(v); }).join(' '), fill: 'none', stroke: c, 'stroke-width': wd, 'stroke-dasharray': dash || '' }, svg); }
      svgEl('line', { x1: 8, x2: Wd - 8, y1: Y(0), y2: Y(0), stroke: 'var(--line)' }, svg);
      path(f, 'var(--muted)', 1.6, '4 3'); path(out, 'var(--brand)', 2.6);
      var t = svgEl('text', { x: 8, y: H - 3, 'font-size': 10, fill: 'var(--muted)' }, svg); t.textContent = 'gri kesik: özgün profil (parlak sivri tepe, koyu çatlak, geniş yayla) · mavi: sonuç';
      var top = f.map(function (v, i) { return v - op[i]; }), mx = Math.max.apply(null, top), bt = f.map(function (v, i) { return cl[i] - v; });
      info.innerHTML = '<div class="metric"><b>' + Math.round(Math.max.apply(null, out)) + '</b>sonucun en büyük değeri</div><div class="metric"><b>' + Math.round(mx) + '</b>top-hat tepe değeri (parlak ayrıntı)</div><div class="metric"><b>' + Math.round(Math.max.apply(null, bt)) + '</b>bottom-hat tepe değeri (koyu ayrıntı)</div>';
      var msg = { ero: 'Gri seviyede aşınma, penceredeki <b>en küçük</b> değeri alır: parlak alanlar küçülür, koyu çatlak genişler.', dil: 'Gri seviyede genişleme, penceredeki <b>en büyük</b> değeri alır: parlak alanlar büyür, koyu çatlak kapanır.', open: 'Açma, pencereden dar olan <b>parlak</b> tepeyi siler ama geniş yaylayı korur.', close: 'Kapama, pencereden dar olan <b>koyu</b> çatlağı doldurur.', top: 'Top-hat = özgün − açma: pencereden dar parlak tepe öne çıkar, yayla (pencereden geniş) kaybolur. Pencereyi yaylanın genişliğine göre küçültüp büyüterek dene.', bot: 'Bottom-hat = kapama − özgün: pencereden dar koyu çatlak öne çıkar.' };
      note.innerHTML = msg[cur];
    }
    draw();
  })();
})();
