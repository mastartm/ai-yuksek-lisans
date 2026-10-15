/* Izgara laboratuvarı: aynı haritada BFS, DFS, UCS, Greedy ve A* karşılaştırması.
   Hücre maliyeti: boş = 1, çamur = 5, duvar = geçilmez. */
(function () {
  'use strict';
  var root = document.getElementById('gridlab');
  if (!root) return;
  var NS = 'http://www.w3.org/2000/svg';
  var COLS = 24, ROWS = 12, CS = 30;
  var NAMES = { bfs: 'BFS', dfs: 'DFS', ucs: 'UCS', greedy: 'Greedy', astar: 'A*' };
  var LONG = { bfs: 'Genişlik öncelikli', dfs: 'Derinlik öncelikli', ucs: 'Tek tip maliyet', greedy: 'Açgözlü', astar: 'A*' };

  var grid, start, goal, tool = 'wall', algo = 'astar', timer = null, painting = false;

  function emptyGrid() { var a = []; for (var r = 0; r < ROWS; r++) { a.push([]); for (var c = 0; c < COLS; c++) a[r].push(0); } return a; }

  var PRESETS = {
    open: { label: 'Açık alan', build: function () { return { g: emptyGrid(), s: [5, 2], t: [5, 21] }; } },
    trap: { label: 'U duvarı (çıkmaz)', build: function () {
      var g = emptyGrid(); for (var r = 1; r <= 10; r++) g[r][14] = 1; for (var c = 8; c <= 14; c++) { g[1][c] = 1; g[10][c] = 1; }
      return { g: g, s: [5, 11], t: [5, 21] }; } },
    mud: { label: 'Çamurlu yol', build: function () {
      var g = emptyGrid(); for (var r = 0; r < ROWS; r++) for (var c = 9; c <= 13; c++) g[r][c] = 2; g[0][11] = 0; g[0][10] = 0; g[0][12] = 0; g[0][9] = 0; g[0][13] = 0;
      return { g: g, s: [6, 3], t: [6, 21] }; } },
    maze: { label: 'Engelli harita', build: function () {
      var g = emptyGrid();
      for (var r = 0; r < 9; r++) g[r][7] = 1; for (var r2 = 3; r2 < ROWS; r2++) g[r2][12] = 1;
      for (var r3 = 0; r3 < 9; r3++) g[r3][17] = 1; g[10][17] = 1; g[11][17] = 1;
      return { g: g, s: [1, 2], t: [10, 21] }; } }
  };

  function load(key) { var p = PRESETS[key].build(); grid = p.g; start = p.s; goal = p.t; clearRun(); drawAll(); }

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

  /* ----- Çizim ----- */
  var bar = document.createElement('div'); bar.className = 'bar'; root.appendChild(bar);
  function chipGroup(label, items, get, set) {
    var wrap = document.createElement('div'); wrap.className = 'chips';
    var l = document.createElement('label'); l.textContent = label; wrap.appendChild(l);
    items.forEach(function (it) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = it[1];
      b.setAttribute('aria-pressed', get() === it[0] ? 'true' : 'false');
      b.addEventListener('click', function () { set(it[0]); Array.prototype.forEach.call(wrap.querySelectorAll('.chip'), function (x, i) { x.setAttribute('aria-pressed', items[i][0] === get() ? 'true' : 'false'); }); });
      wrap.appendChild(b);
    });
    bar.appendChild(wrap);
  }
  chipGroup('Harita:', Object.keys(PRESETS).map(function (k) { return [k, PRESETS[k].label]; }), function () { return null; }, function (k) { stopAnim(); load(k); });
  var bar2 = document.createElement('div'); bar2.className = 'bar'; root.appendChild(bar2);
  var bar3 = document.createElement('div'); bar3.className = 'bar'; root.appendChild(bar3);
  bar = bar2;
  chipGroup('Algoritma:', Object.keys(NAMES).map(function (k) { return [k, NAMES[k]]; }), function () { return algo; }, function (k) { algo = k; });
  bar = bar3;
  chipGroup('Çiz:', [['wall', 'Duvar'], ['mud', 'Çamur (5×)'], ['erase', 'Sil'], ['start', 'Başlangıç'], ['goal', 'Hedef']], function () { return tool; }, function (k) { tool = k; });
  function btn(label, fn, primary) { var b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (primary ? ' primary' : ''); b.textContent = label; b.addEventListener('click', fn); bar3.appendChild(b); return b; }
  btn('Çalıştır', function () { runAnim(); }, true);
  btn('Hepsini karşılaştır', function () { compareAll(); });
  btn('Temizle', function () { stopAnim(); clearRun(); drawAll(); });

  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + COLS * CS + ' ' + ROWS * CS);
  svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Izgara üzerinde yol bulma laboratuvarı');
  svg.style.touchAction = 'none';
  root.appendChild(svg);
  var cells = [];
  for (var r = 0; r < ROWS; r++) { cells.push([]); for (var c = 0; c < COLS; c++) {
    var rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x', c * CS); rect.setAttribute('y', r * CS); rect.setAttribute('width', CS); rect.setAttribute('height', CS);
    rect.setAttribute('class', 'gridcell'); svg.appendChild(rect); cells[r].push(rect);
  } }
  var markers = document.createElementNS(NS, 'g'); svg.appendChild(markers);

  var status = document.createElement('div'); status.className = 'status'; root.appendChild(status);
  var stats = document.createElement('div'); stats.className = 'stats'; root.appendChild(stats);
  var tableBox = document.createElement('div'); tableBox.className = 'scroll-x'; root.appendChild(tableBox);
  var lg = document.createElement('div'); lg.className = 'legend';
  lg.innerHTML = '<span><i style="background:#334155"></i>duvar</span><span><i style="background:#a16207"></i>çamur (maliyet 5)</span><span><i style="background:var(--brand-soft)"></i>genişletilen</span><span><i style="background:var(--ok)"></i>bulunan yol</span><span>Haritayı sürükleyerek çizebilirsin.</span>';
  root.appendChild(lg);

  var visited = {}, pathSet = {};
  function clearRun() { visited = {}; pathSet = {}; stats.innerHTML = ''; status.textContent = 'Bir algoritma seç ve “Çalıştır” de. Haritayı sürükleyerek değiştirebilirsin.'; }

  function paint(r, c) {
    var k = r + ',' + c, v = grid[r][c], fill = 'var(--surface)';
    if (v === 1) fill = '#334155'; else if (v === 2) fill = '#a16207';
    if (visited[k]) fill = v === 2 ? '#c08a2a' : 'var(--brand-soft)';
    if (pathSet[k]) fill = 'var(--ok)';
    cells[r][c].setAttribute('fill', fill);
  }
  function drawAll() {
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) paint(r, c);
    markers.innerHTML = '';
    [[start, 'S', 'var(--brand)'], [goal, 'H', 'var(--bad)']].forEach(function (m) {
      var circ = document.createElementNS(NS, 'circle');
      circ.setAttribute('cx', m[0][1] * CS + CS / 2); circ.setAttribute('cy', m[0][0] * CS + CS / 2); circ.setAttribute('r', CS / 2 - 3);
      circ.setAttribute('fill', m[2]); markers.appendChild(circ);
      var t = document.createElementNS(NS, 'text');
      t.setAttribute('x', m[0][1] * CS + CS / 2); t.setAttribute('y', m[0][0] * CS + CS / 2 + 5);
      t.setAttribute('text-anchor', 'middle'); t.setAttribute('fill', '#fff'); t.setAttribute('font-weight', '700'); t.setAttribute('font-size', '14');
      t.textContent = m[1]; markers.appendChild(t);
    });
  }

  function stopAnim() { if (timer) { clearInterval(timer); timer = null; } }
  function runAnim() {
    stopAnim(); clearRun(); drawAll();
    var res = solve(algo), i = 0;
    status.innerHTML = '<b>' + LONG[algo] + '</b> çalışıyor…';
    var per = Math.max(1, Math.ceil(res.order.length / 90));
    timer = setInterval(function () {
      for (var k = 0; k < per && i < res.order.length; k++, i++) { var o = res.order[i]; visited[o[0] + ',' + o[1]] = true; paint(o[0], o[1]); }
      if (i >= res.order.length) {
        stopAnim();
        if (res.path) res.path.forEach(function (p) { pathSet[p[0] + ',' + p[1]] = true; paint(p[0], p[1]); });
        drawAll();
        showStats(res);
      }
    }, 30);
  }
  function showStats(res) {
    if (!res.path) { status.innerHTML = '<b>' + LONG[algo] + ':</b> hedefe giden yol yok.'; stats.innerHTML = ''; return; }
    status.innerHTML = '<b>' + LONG[algo] + '</b> bitti.';
    stats.innerHTML = '<span>Genişletilen hücre: <b>' + res.order.length + '</b></span><span>Yol uzunluğu: <b>' + (res.path.length - 1) + ' adım</b></span><span>Yol maliyeti: <b>' + res.cost + '</b></span>';
  }
  function compareAll() {
    stopAnim(); clearRun(); drawAll();
    var rows = Object.keys(NAMES).map(function (a) { var r = solve(a); return { a: a, r: r }; });
    var opt = Math.min.apply(null, rows.filter(function (x) { return x.r.path; }).map(function (x) { return x.r.cost; }));
    var html = '<table class="cmp"><thead><tr><th>Algoritma</th><th>Genişletilen hücre</th><th>Yol maliyeti</th><th>En iyi mi?</th></tr></thead><tbody>';
    rows.forEach(function (x) {
      if (!x.r.path) { html += '<tr><td>' + LONG[x.a] + '</td><td>' + x.r.order.length + '</td><td>—</td><td><span class="no">yol yok</span></td></tr>'; return; }
      html += '<tr><td>' + LONG[x.a] + ' (' + NAMES[x.a] + ')</td><td>' + x.r.order.length + '</td><td>' + x.r.cost + '</td><td>' + (x.r.cost === opt ? '<span class="yes">evet</span>' : '<span class="no">hayır (+' + (x.r.cost - opt) + ')</span>') + '</td></tr>';
    });
    tableBox.innerHTML = html + '</tbody></table>';
    status.textContent = 'Aynı haritada beş algoritma. Haritayı değiştirip tekrar karşılaştır.';
  }

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
    visited = {}; pathSet = {}; drawAll();
  }
  svg.addEventListener('pointerdown', function (e) { stopAnim(); painting = true; try { svg.setPointerCapture(e.pointerId); } catch (x) { } apply(e); });
  svg.addEventListener('pointermove', function (e) { if (painting && tool !== 'start' && tool !== 'goal') apply(e); });
  svg.addEventListener('pointerup', function () { painting = false; });
  svg.addEventListener('pointercancel', function () { painting = false; });

  load('mud');
})();
