/* Makine Öğrenmesi · Bölüm 8: uzaklık esaslı ve yoğunluk (komşuluk) esaslı kümelemenin şekil karşılaştırması.
   Noktalar bu site için üretilmiştir (sabit tohumlu rastgele sayı). */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function svgEl(name, attrs, parent) { var e = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (parent) parent.appendChild(e); return e; }
  function pct(x) { return Math.round(x * 100) + '%'; }

  var root = document.getElementById('kumelab');
  if (!root) return;

  var seed = 7;
  function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
  function gauss() { return (rnd() + rnd() + rnd() + rnd() - 2) * 1.7; }

  // [x, y, gerçek grup]
  function blobs() {
    seed = 7; var a = [], i;
    for (i = 0; i < 40; i++) a.push([110 + gauss() * 22, 150 + gauss() * 22, 0]);
    for (i = 0; i < 40; i++) a.push([290 + gauss() * 22, 150 + gauss() * 22, 1]);
    return a;
  }
  function moons() {
    seed = 11; var a = [], i, t;
    for (i = 0; i < 40; i++) { t = Math.PI * i / 39; a.push([150 + 100 * Math.cos(t) + gauss() * 2.5, 190 - 100 * Math.sin(t) + gauss() * 2.5, 0]); }
    for (i = 0; i < 40; i++) { t = Math.PI * i / 39; a.push([250 + 100 * Math.cos(t) + gauss() * 2.5, 140 + 100 * Math.sin(t) + gauss() * 2.5, 1]); }
    return a;
  }
  var DATA = { blobs: blobs(), moons: moons() };
  var state = { set: 'moons', method: 'dist', eps: 20 };

  var bar1 = el('div', 'chips'); root.appendChild(bar1);
  var bar2 = el('div', 'chips'); bar2.style.marginTop = '8px'; root.appendChild(bar2);
  function chip(parent, label, group, key) {
    var b = el('button', 'chip', label); b.type = 'button'; b.dataset.g = group; b.dataset.k = key;
    b.addEventListener('click', function () { state[group] = key; draw(); });
    parent.appendChild(b); return b;
  }
  chip(bar1, 'Yuvarlak iki küme', 'set', 'blobs'); chip(bar1, 'İç içe geçen iki hilal', 'set', 'moons');
  chip(bar2, 'Uzaklık esaslı (k = 2, en yakın merkez)', 'method', 'dist'); chip(bar2, 'Yoğunluk/komşuluk esaslı (yarıçap)', 'method', 'dens');
  var row = el('div', 'slider-row');
  row.innerHTML = '<label for="kmeps">Komşuluk yarıçapı</label><input id="kmeps" type="range" min="8" max="60" step="1" value="20"><output id="kmepso">20</output>';
  root.appendChild(row);
  var rng = row.querySelector('input');
  rng.addEventListener('input', function () { state.eps = +rng.value; draw(); });
  var box = el('div'); root.appendChild(box);
  var info = el('div', 'metrics'); root.appendChild(info);
  var note = el('div', 'callout idea'); root.appendChild(note);
  var COL = ['var(--brand)', 'var(--warn)', 'var(--muted)'];

  function distCluster(P) {
    var c = [[P[0][0], P[0][1]], null], i, best = -1, d;
    for (i = 0; i < P.length; i++) { d = Math.hypot(P[i][0] - c[0][0], P[i][1] - c[0][1]); if (d > best) { best = d; c[1] = [P[i][0], P[i][1]]; } }
    var lab = [], it, k;
    for (it = 0; it < 25; it++) {
      lab = P.map(function (p) { return Math.hypot(p[0] - c[0][0], p[1] - c[0][1]) <= Math.hypot(p[0] - c[1][0], p[1] - c[1][1]) ? 0 : 1; });
      for (k = 0; k < 2; k++) {
        var sx = 0, sy = 0, n = 0;
        P.forEach(function (p, j) { if (lab[j] === k) { sx += p[0]; sy += p[1]; n++; } });
        if (n) c[k] = [sx / n, sy / n];
      }
    }
    return { lab: lab, centers: c, count: 2 };
  }
  function densCluster(P, eps) {
    var par = P.map(function (_, i) { return i; });
    function find(a) { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; }
    var i, j;
    for (i = 0; i < P.length; i++) for (j = i + 1; j < P.length; j++) if (Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]) <= eps) par[find(i)] = find(j);
    var size = {}; P.forEach(function (_, k) { var r = find(k); size[r] = (size[r] || 0) + 1; });
    var roots = Object.keys(size).sort(function (a, b) { return size[b] - size[a]; });
    var rank = {}; roots.forEach(function (r, k) { rank[r] = k; });
    var lab = P.map(function (_, k) { var r = rank[find(k)]; return r > 1 ? 2 : r; });
    return { lab: lab, count: roots.length, centers: null };
  }

  function draw() {
    var P = DATA[state.set];
    Array.prototype.forEach.call(root.querySelectorAll('.chip'), function (b) { b.setAttribute('aria-pressed', String(state[b.dataset.g] === b.dataset.k)); });
    document.getElementById('kmepso').textContent = state.eps;
    rng.disabled = state.method !== 'dens';
    var res = state.method === 'dist' ? distCluster(P) : densCluster(P, state.eps);
    box.innerHTML = '';
    var svg = svgEl('svg', { viewBox: '0 0 400 300', role: 'img', 'aria-label': 'Nokta bulutu ve bulunan kümeler' }, box);
    P.forEach(function (p, i) { svgEl('circle', { cx: p[0], cy: p[1], r: 4.2, fill: COL[res.lab[i]], opacity: 0.9 }, svg); });
    if (res.centers) res.centers.forEach(function (c) { svgEl('path', { d: 'M' + (c[0] - 7) + ' ' + c[1] + ' H' + (c[0] + 7) + ' M' + c[0] + ' ' + (c[1] - 7) + ' V' + (c[1] + 7), stroke: 'var(--text)', 'stroke-width': 3 }, svg); });
    var same = 0, flip = 0; P.forEach(function (p, i) { if (res.lab[i] === p[2]) same++; else if (res.lab[i] === 1 - p[2]) flip++; });
    var agree = Math.max(same, flip) / P.length;
    var odd = res.lab.filter(function (l) { return l === 2; }).length;
    info.innerHTML = '<div class="metric"><b>' + res.count + '</b>bulunan küme (bağlı parça) sayısı</div><div class="metric"><b>' + pct(agree) + '</b>iki gerçek grupla uyum</div><div class="metric"><b>' + odd + '</b>kümelere girmeyen (gri) nokta</div>';
    var txt;
    if (state.method === 'dist') txt = state.set === 'moons' ? '<b>Merkeze yakınlık hilalleri bölüyor.</b> Uzaklık esaslı yöntem, iki merkez arasına bir doğru çizer; hilal gibi düzensiz şekli iki yarıya böler. Notta anlatılan sorun tam budur.' : '<b>Yuvarlak kümelerde uzaklık esaslı yöntem iyi çalışır.</b> Küme şekli oval olduğu için merkez, grubu iyi temsil eder.';
    else txt = state.eps < 14 ? '<b>Yarıçap çok küçük.</b> Komşular birbirine ulaşamıyor; veri çok sayıda küçük parçaya ayrılır ve çoğu nokta gri kalır. Kullanıcının verdiği parametre sonucu değiştirir.' : state.eps > 45 ? '<b>Yarıçap çok büyük.</b> Komşuluk her şeyi birleştirir ve iki grup tek parça olur.' : '<b>Komşuluk zinciri şekli izliyor.</b> Her nokta, yarıçap içindeki komşusuna bağlanır; hilal gibi düzensiz şekil de tek küme olarak bulunur.';
    note.innerHTML = txt;
  }
  draw();
})();
