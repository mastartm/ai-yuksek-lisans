/* Izgara laboratuvarı: aynı haritada BFS, DFS, UCS, Greedy ve A* karşılaştırması.
   Hücre maliyeti: boş = 1, çamur = 5, duvar = geçilmez.
   Arayüz üç adımdır: harita seç → algoritma seç → çalıştır. */
(function () {
  'use strict';
  var root = document.getElementById('gridlab');
  if (!root) return;
  var NS = 'http://www.w3.org/2000/svg';
  var COLS = 24, ROWS = 12, CS = 30;

  var ALGOS = {
    bfs:    { name: 'BFS',    long: 'Genişlik öncelikli', tip: 'Her yöne eşit yayılır. Sadece adım sayar.',
              icon: '<circle cx="18" cy="18" r="3" class="gi-fill"/><circle cx="18" cy="18" r="8"/><circle cx="18" cy="18" r="14"/>' },
    dfs:    { name: 'DFS',    long: 'Derinlik öncelikli', tip: 'Tek yöne dalar, çıkmazda geri döner.',
              icon: '<polyline points="5,30 13,22 9,14 19,8 31,12" fill="none"/><circle cx="31" cy="12" r="3" class="gi-fill"/>' },
    ucs:    { name: 'UCS',    long: 'Tek tip maliyet', tip: 'En ucuz yola öncelik verir. Her yöne yayılır ama maliyeti bilir.',
              icon: '<ellipse cx="18" cy="18" rx="14" ry="9"/><ellipse cx="18" cy="18" rx="7" ry="4"/><circle cx="18" cy="18" r="2" class="gi-fill"/>' },
    greedy: { name: 'Greedy', long: 'Açgözlü', tip: 'Hedefe en yakın görüneni seçer. Hızlı ama maliyeti saymaz.',
              icon: '<line x1="4" y1="18" x2="30" y2="18"/><polyline points="23,11 31,18 23,25" fill="none"/>' },
    astar:  { name: 'A*',     long: 'A yıldız', tip: 'Harcananı ve kalanı toplar. Hızlı ve en ucuz yolu bulur.',
              icon: '<polygon points="18,4 22,14 33,14 24,21 28,32 18,25 8,32 12,21 3,14 14,14" class="gi-fill"/>' }
  };

  var grid, start, goal, algo = 'astar', mapKey = 'mud', tool = 'wall', timer = null, painting = false;

  function emptyGrid() { var a = []; for (var r = 0; r < ROWS; r++) { a.push([]); for (var c = 0; c < COLS; c++) a[r].push(0); } return a; }

  var PRESETS = {
    open: { label: 'Açık alan', hint: 'Engel yok', build: function () { return { g: emptyGrid(), s: [5, 2], t: [5, 21] }; } },
    trap: { label: 'U duvarı', hint: 'Çıkmaz', build: function () {
      var g = emptyGrid(); for (var r = 1; r <= 10; r++) g[r][14] = 1; for (var c = 8; c <= 14; c++) { g[1][c] = 1; g[10][c] = 1; }
      return { g: g, s: [5, 11], t: [5, 21] }; } },
    mud: { label: 'Çamurlu yol', hint: 'Pahalı bölge', build: function () {
      var g = emptyGrid(); for (var r = 0; r < ROWS; r++) for (var c = 9; c <= 13; c++) g[r][c] = 2; for (var c2 = 9; c2 <= 13; c2++) g[0][c2] = 0;
      return { g: g, s: [6, 3], t: [6, 21] }; } },
    maze: { label: 'Engelli harita', hint: 'Duvarlar', build: function () {
      var g = emptyGrid();
      for (var r = 0; r < 9; r++) g[r][7] = 1; for (var r2 = 3; r2 < ROWS; r2++) g[r2][12] = 1;
      for (var r3 = 0; r3 < 9; r3++) g[r3][17] = 1; g[10][17] = 1; g[11][17] = 1;
      return { g: g, s: [1, 2], t: [10, 21] }; } }
  };

  /* ----- Algoritmalar ----- */
  function cost(c) { return c === 2 ? 5 : 1; }
  function h(r, c) { return Math.abs(r - goal[0]) + Math.abs(c - goal[1]); }
  function solve(a) {
    var open = [{ r: start[0], c: start[1], g: 0, par: null, ord: 0 }];
    var best = {}, closed = {}, order = [], n = 1;
    best[start[0] + ',' + start[1]] = 0;
    var dirs = [[-1, 0], [0, 1], [1, 0], [0, -1]];
    if (a === 'dfs') dirs = dirs.slice().reverse();
    function key(x) { return a === 'ucs' ? x.g : a === 'greedy' ? h(x.r, x.c) : a === 'astar' ? x.g + h(x.r, x.c) : x.ord; }
    while (open.length) {
      var pi = 0;
      for (var i = 1; i < open.length; i++) {
        if (a === 'dfs') { if (open[i].ord > open[pi].ord) pi = i; }
        else {
          var ki = key(open[i]), kp = key(open[pi]);
          if (ki < kp || (ki === kp && a === 'astar' && h(open[i].r, open[i].c) < h(open[pi].r, open[pi].c))) pi = i;
        }
      }
      var cur = open.splice(pi, 1)[0], ck = cur.r + ',' + cur.c;
      if (closed[ck]) continue;
      closed[ck] = true; order.push([cur.r, cur.c]);
      if (cur.r === goal[0] && cur.c === goal[1]) {
        var path = [], p = cur; while (p) { path.unshift([p.r, p.c]); p = p.par; }
        return { order: order, path: path, cost: cur.g };
      }
      dirs.forEach(function (d) {
        var nr = cur.r + d[0], nc = cur.c + d[1];
        if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS || grid[nr][nc] === 1) return;
        var k = nr + ',' + nc; if (closed[k]) return;
        var ng = cur.g + cost(grid[nr][nc]);
        if (a === 'bfs' || a === 'dfs') { if (best[k] !== undefined) return; }
        else if (best[k] !== undefined && best[k] <= ng) return;
        best[k] = ng;
        open.push({ r: nr, c: nc, g: ng, par: cur, ord: n++ });
      });
    }
    return { order: order, path: null, cost: null };
  }

  /* ----- Yardımcılar ----- */
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function svgEl(name, attrs, parent) { var e = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (parent) parent.appendChild(e); return e; }

  /* Küçük harita çizimi (kartlar ve karşılaştırma için). res verilirse gezilen alan ve yol da çizilir. */
  function miniSVG(g, s, t, res, px) {
    px = px || 8;
    var out = '<svg viewBox="0 0 ' + COLS * px + ' ' + ROWS * px + '" class="gl-mini" aria-hidden="true">';
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      var cls = g[r][c] === 1 ? 'c-wall' : g[r][c] === 2 ? 'c-mud' : 'c-empty';
      out += '<rect x="' + c * px + '" y="' + r * px + '" width="' + px + '" height="' + px + '" class="' + cls + '"/>';
    }
    if (res) {
      var N = res.order.length;
      res.order.forEach(function (o, i) { out += '<rect x="' + o[1] * px + '" y="' + o[0] * px + '" width="' + px + '" height="' + px + '" class="c-vis" fill-opacity="' + (0.15 + 0.5 * i / Math.max(1, N - 1)).toFixed(2) + '"/>'; });
      if (res.path) res.path.forEach(function (p) { out += '<rect x="' + p[1] * px + '" y="' + p[0] * px + '" width="' + px + '" height="' + px + '" class="c-path"/>'; });
    }
    out += '<circle cx="' + (s[1] * px + px / 2) + '" cy="' + (s[0] * px + px / 2) + '" r="' + px * 0.45 + '" class="c-start"/>';
    out += '<circle cx="' + (t[1] * px + px / 2) + '" cy="' + (t[0] * px + px / 2) + '" r="' + px * 0.45 + '" class="c-goal"/>';
    return out + '</svg>';
  }

  /* ----- Arayüz iskeleti ----- */
  function stepHead(n, text, sub) { return el('div', 'gl-step', '<span class="gl-num">' + n + '</span><span><b>' + text + '</b>' + (sub ? ' <span class="gl-sub">' + sub + '</span>' : '') + '</span>'); }

  root.appendChild(stepHead(1, 'Bir harita seç', 'ya da aşağıda kendin çiz'));
  var mapRow = el('div', 'gl-cards gl-maps'); root.appendChild(mapRow);

  root.appendChild(stepHead(2, 'Bir algoritma seç', 'nasıl düşündüğü kartın altında yazıyor'));
  var algoRow = el('div', 'gl-cards gl-algos'); root.appendChild(algoRow);

  root.appendChild(stepHead(3, 'Çalıştır ve izle', 'mavi alan = gezilen hücreler, yeşil çizgi = bulunan yol'));
  var actions = el('div', 'gl-actions'); root.appendChild(actions);
  var runBtn = el('button', 'btn primary gl-run', '▶ Çalıştır'); runBtn.type = 'button';
  var cmpBtn = el('button', 'btn gl-cmp', '⚖ Beşini yan yana karşılaştır'); cmpBtn.type = 'button';
  var clrBtn = el('button', 'btn', '↺ Temizle'); clrBtn.type = 'button';
  actions.appendChild(runBtn); actions.appendChild(cmpBtn); actions.appendChild(clrBtn);

  var stage = el('div', 'gl-stage'); root.appendChild(stage);
  var mapWrap = el('div', 'gl-mapwrap'); stage.appendChild(mapWrap);
  var banner = el('div', 'gl-banner'); mapWrap.appendChild(banner);
  var svg = svgEl('svg', { viewBox: '0 0 ' + COLS * CS + ' ' + ROWS * CS, role: 'img', 'aria-label': 'Yol bulma ızgarası: başlangıç S, hedef H' });
  svg.setAttribute('class', 'gl-map'); svg.style.touchAction = 'none';
  mapWrap.appendChild(svg);

  var tools = el('div', 'gl-tools', '<div class="gl-toolhead">Haritayı düzenle<br><span>tıkla ya da sürükle</span></div>');
  stage.appendChild(tools);
  var TOOLS = [
    ['wall', 'Duvar', '<i class="sw sw-wall"></i>', 'Geçilemez engel'],
    ['mud', 'Çamur', '<i class="sw sw-mud"></i>', 'Geçmesi 5 kat pahalı'],
    ['erase', 'Silgi', '<i class="sw sw-erase"></i>', 'Engeli kaldır'],
    ['start', 'Başlangıç', '<i class="sw sw-start">S</i>', 'S’yi taşı'],
    ['goal', 'Hedef', '<i class="sw sw-goal">H</i>', 'H’yi taşı']
  ];
  var toolBtns = {};
  TOOLS.forEach(function (t) {
    var b = el('button', 'gl-tool', t[2] + '<span><b>' + t[1] + '</b><small>' + t[3] + '</small></span>'); b.type = 'button';
    b.setAttribute('aria-pressed', t[0] === tool ? 'true' : 'false');
    b.addEventListener('click', function () { tool = t[0]; refreshTools(); });
    tools.appendChild(b); toolBtns[t[0]] = b;
  });
  function refreshTools() { Object.keys(toolBtns).forEach(function (k) { toolBtns[k].setAttribute('aria-pressed', k === tool ? 'true' : 'false'); }); svg.setAttribute('data-tool', tool); }

  var result = el('div', 'gl-result'); root.appendChild(result);
  var compare = el('div', 'gl-compare'); root.appendChild(compare);
  var legend = el('div', 'gl-legend', '<span><i class="sw sw-wall"></i>duvar</span><span><i class="sw sw-mud"></i>çamur (5 kat pahalı)</span><span><i class="sw sw-vis"></i>gezilen hücre (koyu = daha geç)</span><span><i class="sw sw-path"></i>bulunan yol</span><span><i class="sw sw-start">S</i>başlangıç</span><span><i class="sw sw-goal">H</i>hedef</span>');
  root.appendChild(legend);

  /* ----- Kartlar ----- */
  var mapBtns = {}, algoBtns = {};
  Object.keys(PRESETS).forEach(function (k) {
    var p = PRESETS[k].build();
    var b = el('button', 'gl-card', miniSVG(p.g, p.s, p.t, null, 6) + '<b>' + PRESETS[k].label + '</b><small>' + PRESETS[k].hint + '</small>'); b.type = 'button';
    b.addEventListener('click', function () { stopAnim(); load(k); });
    mapRow.appendChild(b); mapBtns[k] = b;
  });
  Object.keys(ALGOS).forEach(function (k) {
    var a = ALGOS[k];
    var b = el('button', 'gl-card gl-algo', '<svg viewBox="0 0 36 36" class="gl-icon" aria-hidden="true">' + a.icon + '</svg><b>' + a.name + '</b><small>' + a.tip + '</small>'); b.type = 'button';
    b.addEventListener('click', function () { stopAnim(); algo = k; refreshAlgos(); compare.innerHTML = ''; clearRun(); drawAll(); });
    algoRow.appendChild(b); algoBtns[k] = b;
  });
  function refreshAlgos() { Object.keys(algoBtns).forEach(function (k) { algoBtns[k].setAttribute('aria-pressed', k === algo ? 'true' : 'false'); }); runBtn.textContent = '▶ ' + ALGOS[algo].name + ' çalıştır'; }
  function refreshMaps() { Object.keys(mapBtns).forEach(function (k) { mapBtns[k].setAttribute('aria-pressed', k === mapKey ? 'true' : 'false'); }); }

  /* ----- Ana harita çizimi ----- */
  var cells = [], overlays = [], markers;
  (function buildMap() {
    for (var r = 0; r < ROWS; r++) { cells.push([]); overlays.push([]); for (var c = 0; c < COLS; c++) {
      cells[r].push(svgEl('rect', { x: c * CS, y: r * CS, width: CS, height: CS, 'class': 'gl-cell c-empty' }, svg));
    } }
    for (var r2 = 0; r2 < ROWS; r2++) for (var c2 = 0; c2 < COLS; c2++) {
      overlays[r2].push(svgEl('rect', { x: c2 * CS, y: r2 * CS, width: CS, height: CS, 'class': 'c-none', 'pointer-events': 'none' }, svg));
    }
    markers = svgEl('g', { 'pointer-events': 'none' }, svg);
  })();

  var visited = {}, pathSet = {}, visTotal = 1;
  function paintCell(r, c) {
    var v = grid[r][c], k = r + ',' + c;
    cells[r][c].setAttribute('class', 'gl-cell ' + (v === 1 ? 'c-wall' : v === 2 ? 'c-mud' : 'c-empty'));
    var o = overlays[r][c];
    if (pathSet[k]) { o.setAttribute('class', 'c-path'); o.removeAttribute('fill-opacity'); }
    else if (visited[k] !== undefined) { o.setAttribute('class', 'c-vis'); o.setAttribute('fill-opacity', (0.15 + 0.5 * visited[k] / Math.max(1, visTotal - 1)).toFixed(2)); }
    else { o.setAttribute('class', 'c-none'); o.removeAttribute('fill-opacity'); }
  }
  function drawMarkers() {
    markers.innerHTML = '';
    [[start, 'S', 'c-start'], [goal, 'H', 'c-goal']].forEach(function (m) {
      svgEl('circle', { cx: m[0][1] * CS + CS / 2, cy: m[0][0] * CS + CS / 2, r: CS / 2 - 2, 'class': m[2] }, markers);
      var t = svgEl('text', { x: m[0][1] * CS + CS / 2, y: m[0][0] * CS + CS / 2 + 5, 'text-anchor': 'middle', 'class': 'c-mark' }, markers); t.textContent = m[1];
    });
  }
  function drawAll() { for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) paintCell(r, c); drawMarkers(); }

  function setBanner(html, kind) { banner.className = 'gl-banner' + (kind ? ' ' + kind : ''); banner.innerHTML = html; }
  function clearRun() {
    visited = {}; pathSet = {}; visTotal = 1; result.innerHTML = '';
    setBanner('Seçili: <b>' + ALGOS[algo].name + '</b> · harita: <b>' + PRESETS[mapKey].label + '</b>. Şimdi <b>▶ Çalıştır</b>’a bas.', 'idle');
  }

  function load(key) {
    var p = PRESETS[key].build(); grid = p.g; start = p.s; goal = p.t; mapKey = key;
    compare.innerHTML = ''; refreshMaps(); clearRun(); drawAll();
  }

  /* ----- Çalıştırma ----- */
  function stopAnim() { if (timer) { clearInterval(timer); timer = null; } }
  function runAnim() {
    stopAnim(); compare.innerHTML = ''; clearRun(); drawAll();
    var res = solve(algo), i = 0;
    visTotal = res.order.length;
    setBanner('<b>' + ALGOS[algo].name + '</b> çalışıyor… gezilen hücreler maviye boyanıyor.', 'run');
    var per = Math.max(1, Math.ceil(res.order.length / 80));
    timer = setInterval(function () {
      for (var k = 0; k < per && i < res.order.length; k++, i++) { var o = res.order[i]; visited[o[0] + ',' + o[1]] = i; paintCell(o[0], o[1]); }
      if (i >= res.order.length) {
        stopAnim();
        if (res.path) res.path.forEach(function (p) { pathSet[p[0] + ',' + p[1]] = true; });
        drawAll(); showResult(res);
      }
    }, 28);
  }
  function showResult(res) {
    if (!res.path) { setBanner('<b>' + ALGOS[algo].name + '</b>: hedefe giden yol yok.', 'bad'); result.innerHTML = ''; return; }
    setBanner('<b>' + ALGOS[algo].name + '</b> hedefi buldu.', 'ok');
    result.innerHTML =
      '<div class="gl-stat"><span class="gl-big">' + res.order.length + '</span><span>hücre gezdi<br><small>az = hızlı arama</small></span></div>' +
      '<div class="gl-stat"><span class="gl-big">' + res.cost + '</span><span>yol maliyeti<br><small>az = ucuz yol</small></span></div>' +
      '<div class="gl-stat"><span class="gl-big">' + (res.path.length - 1) + '</span><span>adım<br><small>yolun uzunluğu</small></span></div>';
  }

  function compareAll() {
    stopAnim(); clearRun(); drawAll(); result.innerHTML = '';
    var keys = Object.keys(ALGOS), rows = keys.map(function (a) { return { a: a, r: solve(a) }; });
    var found = rows.filter(function (x) { return x.r.path; });
    if (!found.length) { setBanner('Hiçbir algoritma hedefe ulaşamadı. Duvarları kontrol et.', 'bad'); compare.innerHTML = ''; return; }
    var opt = Math.min.apply(null, found.map(function (x) { return x.r.cost; }));
    var maxCells = Math.max.apply(null, rows.map(function (x) { return x.r.order.length; }));
    var minCells = Math.min.apply(null, found.map(function (x) { return x.r.order.length; }));
    setBanner('Aynı harita, beş algoritma. <b>Az hücre</b> = hızlı, <b>en ucuz yol</b> = yeşil rozet.', 'ok');
    var html = '<div class="gl-cmp-grid">';
    rows.forEach(function (x) {
      var a = ALGOS[x.a], res = x.r, badge;
      if (!res.path) badge = '<span class="gl-badge bad">yol yok</span>';
      else if (res.cost === opt) badge = '<span class="gl-badge ok">✓ en ucuz yol</span>';
      else badge = '<span class="gl-badge bad">+' + (res.cost - opt) + ' pahalı yol</span>';
      var fast = res.path && res.order.length === minCells ? ' <span class="gl-badge fast">⚡ en hızlı</span>' : '';
      html += '<div class="gl-cmp-card' + (res.path && res.cost === opt ? ' best' : '') + '"><div class="gl-cmp-title">' + a.name + ' <small>' + a.long + '</small></div>' +
        miniSVG(grid, start, goal, res, 8) +
        '<div class="gl-bar"><span style="width:' + Math.max(3, res.order.length / maxCells * 100) + '%"></span></div>' +
        '<div class="gl-cmp-num"><b>' + res.order.length + '</b> hücre gezdi · maliyet <b>' + (res.path ? res.cost : '—') + '</b></div>' +
        '<div>' + badge + fast + '</div></div>';
    });
    compare.innerHTML = html + '</div>';
    compare.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  runBtn.addEventListener('click', runAnim);
  cmpBtn.addEventListener('click', compareAll);
  clrBtn.addEventListener('click', function () { stopAnim(); compare.innerHTML = ''; clearRun(); drawAll(); });

  /* ----- Fare / dokunma ile çizim ----- */
  function cellAt(ev) {
    var rc = svg.getBoundingClientRect();
    var c = Math.floor((ev.clientX - rc.left) / rc.width * COLS), r = Math.floor((ev.clientY - rc.top) / rc.height * ROWS);
    if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return null; return [r, c];
  }
  function apply(ev) {
    var p = cellAt(ev); if (!p) return;
    var r = p[0], c = p[1];
    var isS = r === start[0] && c === start[1], isG = r === goal[0] && c === goal[1];
    if (tool === 'start') { if (!isG && grid[r][c] !== 1) start = [r, c]; }
    else if (tool === 'goal') { if (!isS && grid[r][c] !== 1) goal = [r, c]; }
    else if (!isS && !isG) grid[r][c] = tool === 'wall' ? 1 : tool === 'mud' ? 2 : 0;
    visited = {}; pathSet = {}; result.innerHTML = ''; drawAll();
    setBanner('Harita değişti. <b>▶ Çalıştır</b> ya da <b>⚖ karşılaştır</b>.', 'idle');
  }
  svg.addEventListener('pointerdown', function (e) { stopAnim(); compare.innerHTML = ''; painting = true; try { svg.setPointerCapture(e.pointerId); } catch (x) { } apply(e); });
  svg.addEventListener('pointermove', function (e) { if (painting && tool !== 'start' && tool !== 'goal') apply(e); });
  svg.addEventListener('pointerup', function () { painting = false; });
  svg.addEventListener('pointercancel', function () { painting = false; });

  refreshTools(); refreshAlgos();
  load('mud');
})();
