/* Makine Öğrenmesi · Bölüm 9: k-ortalamalar adımları, ortalama ile medoid ve maliyet formülleri.
   Noktalar bu site için üretilmiştir (sabit tohumlu rastgele sayı). */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function svgEl(name, attrs, parent) { var e = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (parent) parent.appendChild(e); return e; }
  function fmt(x) { return Math.round(x).toLocaleString('tr-TR'); }
  var COL = ['var(--brand)', 'var(--ok)', 'var(--warn)', 'var(--bad)', 'var(--muted)'];
  var seed = 5;
  function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
  function gauss() { return (rnd() + rnd() + rnd() + rnd() - 2) * 1.7; }

  /* ---------- 1) k-ortalamalar adım adım ---------- */
  (function kmeansLab() {
    var root = document.getElementById('kmlab');
    if (!root) return;
    seed = 5;
    var P = [], blobs = [[90, 90], [260, 100], [170, 225]], bi, pi;
    for (bi = 0; bi < blobs.length; bi++) for (pi = 0; pi < 25; pi++) P.push([blobs[bi][0] + gauss() * 20, blobs[bi][1] + gauss() * 20]);
    var K = 3, C = [], lab = [], iter = 0, conv = false;

    var bar = el('div', 'chips'); root.appendChild(bar);
    var bInit = el('button', 'btn primary', 'Rastgele merkezler koy'); bInit.type = 'button';
    var bStep = el('button', 'btn', 'Bir adım'); bStep.type = 'button';
    var bRun = el('button', 'btn', 'Yakınsayana kadar çalıştır'); bRun.type = 'button';
    bar.appendChild(bInit); bar.appendChild(bStep); bar.appendChild(bRun);
    var row = el('div', 'slider-row');
    row.innerHTML = '<label for="kmk">Küme sayısı k</label><input id="kmk" type="range" min="2" max="5" step="1" value="3"><output id="kmko">3</output>';
    root.appendChild(row);
    var kIn = row.querySelector('input');
    var box = el('div'); root.appendChild(box);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);

    function d2(a, b) { return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]); }
    function assign() { lab = P.map(function (p) { var b = 0, i; for (i = 1; i < C.length; i++) if (d2(p, C[i]) < d2(p, C[b])) b = i; return b; }); }
    function sse() { var s = 0; P.forEach(function (p, i) { s += d2(p, C[lab[i]]); }); return s; }
    function init() {
      K = +kIn.value; document.getElementById('kmko').textContent = K;
      var idx = [], c = [];
      while (idx.length < K) { var r = Math.floor(Math.random() * P.length); if (idx.indexOf(r) < 0) idx.push(r); }
      idx.forEach(function (i) { c.push([P[i][0], P[i][1]]); });
      C = c; iter = 0; conv = false; assign(); draw('Merkezler rastgele kondu; her nokta en yakın merkeze atandı.');
    }
    function step() {
      if (!C.length) { init(); return; }
      if (conv) return;
      var moved = false;
      C = C.map(function (c, k) {
        var sx = 0, sy = 0, n = 0;
        P.forEach(function (p, i) { if (lab[i] === k) { sx += p[0]; sy += p[1]; n++; } });
        if (!n) return c;
        var nc = [sx / n, sy / n]; if (Math.abs(nc[0] - c[0]) > 1e-9 || Math.abs(nc[1] - c[1]) > 1e-9) moved = true; return nc;
      });
      assign(); iter++;
      conv = !moved;
      draw(conv ? 'Merkezler artık değişmiyor: algoritma <b>yakınsadı</b>. Bu sonuç ilk merkezlere bağlıdır; “Rastgele merkezler koy”la başka bir başlangıç dene.' : 'Merkezler kümelerin ortalamasına kaydı, noktalar yeniden atandı.');
    }
    function draw(msg) {
      box.innerHTML = '';
      var svg = svgEl('svg', { viewBox: '0 0 340 300', role: 'img', 'aria-label': 'k-ortalamalar: noktalar ve merkezler' }, box);
      P.forEach(function (p, i) { svgEl('circle', { cx: p[0], cy: p[1], r: 4.3, fill: C.length ? COL[lab[i]] : 'var(--muted)', opacity: 0.9 }, svg); });
      C.forEach(function (c, k) { svgEl('path', { d: 'M' + (c[0] - 8) + ' ' + c[1] + ' H' + (c[0] + 8) + ' M' + c[0] + ' ' + (c[1] - 8) + ' V' + (c[1] + 8), stroke: 'var(--text)', 'stroke-width': 4 }, svg); svgEl('path', { d: 'M' + (c[0] - 8) + ' ' + c[1] + ' H' + (c[0] + 8) + ' M' + c[0] + ' ' + (c[1] - 8) + ' V' + (c[1] + 8), stroke: COL[k], 'stroke-width': 2 }, svg); });
      info.innerHTML = '<div class="metric"><b>' + iter + '</b>adım (yineleme)</div><div class="metric"><b>' + (C.length ? fmt(sse()) : '–') + '</b>hata (merkeze uzaklıkların kareleri toplamı)</div><div class="metric"><b>' + (C.length ? (conv ? 'evet' : 'hayır') : '–') + '</b>yakınsadı mı?</div>';
      note.innerHTML = msg || 'Önce “Rastgele merkezler koy”a bas.';
    }
    bInit.addEventListener('click', init);
    bStep.addEventListener('click', step);
    bRun.addEventListener('click', function () { if (!C.length) init(); var g = 0; while (!conv && g++ < 100) step(); });
    kIn.addEventListener('input', init);
    draw('Önce “Rastgele merkezler koy”a bas.');
  })();

  /* ---------- 2) Ortalama ve medoid: aykırı değer ---------- */
  (function medoidLab() {
    var root = document.getElementById('medlab');
    if (!root) return;
    var base = [[120, 140], [135, 160], [150, 130], [160, 170], [175, 145], [185, 160], [145, 150], [165, 135]];
    var row = el('div', 'slider-row');
    row.innerHTML = '<label for="medx">Aykırı noktanın x konumu</label><input id="medx" type="range" min="150" max="330" step="1" value="170"><output id="medxo">170</output>';
    root.appendChild(row);
    var inp = row.querySelector('input');
    var box = el('div'); root.appendChild(box);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function draw() {
      var ox = +inp.value; document.getElementById('medxo').textContent = ox;
      var P = base.concat([[ox, 150]]);
      var mx = 0, my = 0; P.forEach(function (p) { mx += p[0]; my += p[1]; }); mx /= P.length; my /= P.length;
      var best = 0, bestS = Infinity; P.forEach(function (p, i) { var s = 0; P.forEach(function (q) { s += Math.hypot(p[0] - q[0], p[1] - q[1]); }); if (s < bestS) { bestS = s; best = i; } });
      var md = P[best];
      box.innerHTML = '';
      var svg = svgEl('svg', { viewBox: '0 0 360 260', role: 'img', 'aria-label': 'Bir küme, bir aykırı nokta, ortalama ve medoid' }, box);
      P.forEach(function (p, i) { svgEl('circle', { cx: p[0], cy: p[1], r: 5, fill: i === P.length - 1 ? 'var(--bad)' : 'var(--brand)' }, svg); });
      svgEl('path', { d: 'M' + (mx - 8) + ' ' + my + ' H' + (mx + 8) + ' M' + mx + ' ' + (my - 8) + ' V' + (my + 8), stroke: 'var(--warn)', 'stroke-width': 4 }, svg);
      svgEl('circle', { cx: md[0], cy: md[1], r: 10, fill: 'none', stroke: 'var(--ok)', 'stroke-width': 3 }, svg);
      var t1 = svgEl('text', { x: 10, y: 24, fill: 'var(--warn)', 'font-size': 13 }, svg); t1.textContent = '+ ortalama (k-ortalamalar merkezi)';
      var t2 = svgEl('text', { x: 10, y: 44, fill: 'var(--ok)', 'font-size': 13 }, svg); t2.textContent = '○ medoid (kümenin gerçek bir noktası)';
      var base0 = 0; base.forEach(function (p) { base0 += p[0]; }); base0 /= base.length;
      info.innerHTML = '<div class="metric"><b>' + Math.round(mx) + '</b>ortalamanın x konumu</div><div class="metric"><b>' + Math.round(md[0]) + '</b>medoidin x konumu</div><div class="metric"><b>' + Math.round(mx - base0) + '</b>aykırı noktasız ortalamaya göre kayma</div>';
      note.innerHTML = ox > 250 ? '<b>Ortalama aykırı noktaya doğru çekildi.</b> Merkez artık kümenin ortasında değil; medoid ise hâlâ kümenin içindeki bir noktadır. Notta k-medoidlerin gürültü ve uç verilere k-ortalamalar kadar duyarlı olmaması bu yüzden vurgulanır.' : 'Aykırı nokta kümeye yakınken ortalama ile medoid yakındır. Kaydırıcıyı sağa çek: ortalama uzaktaki tek noktadan etkilenir.';
    }
    inp.addEventListener('input', draw); draw();
  })();

  /* ---------- 3) Hesaplama maliyeti ---------- */
  (function costLab() {
    var root = document.getElementById('costlab');
    if (!root) return;
    function sl(id, label, min, max, step, val) { var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>'; root.appendChild(r); var i = r.querySelector('input'); i.addEventListener('input', draw); return i; }
    var iN = sl('cn', 'Nesne sayısı n', 1000, 100000, 1000, 10000), iK = sl('ck', 'Küme sayısı k', 2, 20, 1, 5), iT = sl('ct', 'Yineleme sayısı t', 5, 100, 1, 20), iS = sl('cs', 'Örnek büyüklüğü s', 40, 1000, 10, 100);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function draw() {
      var n = +iN.value, k = +iK.value, t = +iT.value, s = +iS.value;
      document.getElementById('cno').textContent = fmt(n); document.getElementById('cko').textContent = k; document.getElementById('cto').textContent = t; document.getElementById('cso').textContent = s;
      var km = n * k * t, pam = k * (n - k) * (n - k), clara = k * s * s + k * (n - k);
      info.innerHTML = '<div class="metric"><b>' + fmt(km) + '</b>k-ortalamalar: n·k·t</div><div class="metric"><b>' + fmt(pam) + '</b>PAM (bir yineleme): k(n−k)²</div><div class="metric"><b>' + fmt(clara) + '</b>CLARA: k·s² + k(n−k)</div><div class="metric"><b>' + (clara > 0 ? (Math.round(pam / clara * 10) / 10).toString().replace('.', ',') : '–') + ' kat</b>PAM / CLARA</div>';
      note.innerHTML = 'n büyüdükçe PAM’ın k(n−k)² terimi hızla şişer; CLARA yalnızca küçük örnek üzerinde (s) PAM çalıştırdığı için çok daha ucuzdur. Bu rakamlar notundaki θ ifadelerinin sade hesabıdır; gerçek süre değildir.';
    }
    draw();
  })();
})();
