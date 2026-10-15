/* 8-bulmaca laboratuvarı: bir problemin beş bileşenini canlı gösterir ve A* ile çözer.
   <div id="puzzle8"></div> */
(function () {
  'use strict';
  var root = document.getElementById('puzzle8');
  if (!root) return;
  var GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  var START = [1, 3, 6, 4, 0, 2, 7, 5, 8];
  var MOVES = { U: [-1, 0, '↑ Boşluğu yukarı kaydır'], D: [1, 0, '↓ Boşluğu aşağı kaydır'], L: [0, -1, '← Boşluğu sola kaydır'], R: [0, 1, '→ Boşluğu sağa kaydır'] };
  var state = START.slice(), history = [], timer = null;

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function actions(s) {
    var b = s.indexOf(0), r = Math.floor(b / 3), c = b % 3, out = [];
    Object.keys(MOVES).forEach(function (k) { var nr = r + MOVES[k][0], nc = c + MOVES[k][1]; if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) out.push(k); });
    return out;
  }
  function result(s, a) {
    var b = s.indexOf(0), r = Math.floor(b / 3), c = b % 3, nb = (r + MOVES[a][0]) * 3 + (c + MOVES[a][1]), n = s.slice();
    n[b] = n[nb]; n[nb] = 0; return n;
  }
  function h2(s) { var t = 0; s.forEach(function (v, i) { if (!v) return; var g = GOAL.indexOf(v); t += Math.abs(Math.floor(i / 3) - Math.floor(g / 3)) + Math.abs(i % 3 - g % 3); }); return t; }
  function h1(s) { var t = 0; s.forEach(function (v, i) { if (v && v !== GOAL[i]) t++; }); return t; }
  function key(s) { return s.join(''); }
  function isGoal(s) { return key(s) === key(GOAL); }

  /* A* (Manhattan sezgiseli) */
  function solve(s0) {
    var heap = [], push = function (n) { heap.push(n); var i = heap.length - 1; while (i > 0) { var p = (i - 1) >> 1; if (heap[p].f <= heap[i].f) break; var t = heap[p]; heap[p] = heap[i]; heap[i] = t; i = p; } };
    var pop = function () { var top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; var i = 0; for (;;) { var l = 2 * i + 1, r = l + 1, m = i; if (l < heap.length && heap[l].f < heap[m].f) m = l; if (r < heap.length && heap[r].f < heap[m].f) m = r; if (m === i) break; var t = heap[m]; heap[m] = heap[i]; heap[i] = t; i = m; } } return top; };
    var best = {}, expanded = 0; best[key(s0)] = 0;
    push({ s: s0, g: 0, f: h2(s0), par: null, a: null });
    while (heap.length) {
      var n = pop(); if (n.g > best[key(n.s)]) continue; expanded++;
      if (isGoal(n.s)) { var path = []; while (n.par) { path.unshift(n.a); n = n.par; } return { path: path, expanded: expanded }; }
      actions(n.s).forEach(function (a) { var ns = result(n.s, a), g = n.g + 1, k = key(ns); if (best[k] === undefined || g < best[k]) { best[k] = g; push({ s: ns, g: g, f: g + h2(ns), par: n, a: a }); } });
    }
    return null;
  }

  var wrap = el('div', 'p8'); root.appendChild(wrap);
  var board = el('div', 'p8-board'); wrap.appendChild(board);
  var panel = el('div', 'p8-panel'); wrap.appendChild(panel);
  var tiles = [];
  for (var i = 0; i < 9; i++) { var t = el('button', 'p8-tile'); t.type = 'button'; (function (idx) { t.addEventListener('click', function () { clickTile(idx); }); })(i); board.appendChild(t); tiles.push(t); }

  var comp = el('div', 'p8-comp'); panel.appendChild(comp);
  var acts = el('div', 'p8-acts'); panel.appendChild(acts);
  var bar = el('div', 'bar'); panel.appendChild(bar);
  function btn(label, fn, primary) { var b = el('button', 'btn' + (primary ? ' primary' : ''), label); b.type = 'button'; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  btn('🤖 Bilgisayar çözsün (A*)', function () { aiSolve(); }, true);
  btn('🔀 Karıştır', function () { shuffle(); });
  btn('↶ Geri al', function () { stop(); if (history.length) { state = history.pop(); draw(); } });
  btn('↺ Başa dön', function () { stop(); state = START.slice(); history = []; draw(); });
  var note = el('div', 'status'); panel.appendChild(note);

  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function move(a) { history.push(state); state = result(state, a); draw(); }
  function clickTile(idx) {
    stop();
    var b = state.indexOf(0), br = Math.floor(b / 3), bc = b % 3, r = Math.floor(idx / 3), c = idx % 3;
    var dr = r - br, dc = c - bc;
    var a = dr === -1 && dc === 0 ? 'U' : dr === 1 && dc === 0 ? 'D' : dr === 0 && dc === -1 ? 'L' : dr === 0 && dc === 1 ? 'R' : null;
    if (a) move(a);
  }
  function shuffle() { stop(); var s = GOAL.slice(), prev = null; for (var i = 0; i < 40; i++) { var as = actions(s), a = as[Math.floor(Math.random() * as.length)]; s = result(s, a); } state = s; history = []; note.textContent = ''; draw(); }
  function aiSolve() {
    stop(); note.textContent = 'A* düşünüyor…';
    setTimeout(function () {
      var r = solve(state);
      if (!r) { note.textContent = 'Çözüm bulunamadı.'; return; }
      if (!r.path.length) { note.textContent = 'Zaten çözülmüş.'; return; }
      note.innerHTML = '<b>A*</b> ' + r.expanded + ' durum genişletti ve <b>' + r.path.length + ' hamlelik</b> en kısa çözümü buldu. Şimdi uyguluyor…';
      var i = 0; timer = setInterval(function () { if (i >= r.path.length) { stop(); note.innerHTML += ' Bitti.'; return; } move(r.path[i++]); }, 450);
    }, 30);
  }

  function draw() {
    state.forEach(function (v, i) { var t = tiles[i]; t.textContent = v || ''; t.className = 'p8-tile' + (v ? (v === GOAL[i] ? ' ok' : ' bad') : ' blank'); t.setAttribute('aria-label', v ? 'Taş ' + v : 'Boşluk'); });
    var as = actions(state);
    comp.innerHTML =
      '<div class="p8-row"><b>1 · Başlangıç durumu</b><span>karıştırılmış tahta (solda)</span></div>' +
      '<div class="p8-row"><b>2 · ACTIONS(s)</b><span>şu an <b>' + as.length + '</b> yasal hamle var</span></div>' +
      '<div class="p8-row"><b>3 · RESULT(s, a)</b><span>aşağıdan bir hamle seç, yeni durum oluşsun</span></div>' +
      '<div class="p8-row"><b>4 · Hedef testi</b><span>' + (isGoal(state) ? '<b class="yes">✓ Hedefe ulaşıldı!</b>' : 'tahta sağdaki düzene benziyor mu? <span class="no">henüz değil</span>') + '</span></div>' +
      '<div class="p8-row"><b>5 · Yol maliyeti</b><span>şu ana kadar <b>' + history.length + '</b> hamle (her hamle 1)</span></div>' +
      '<div class="p8-row"><b>Sezgisel</b><span>yanlış yerde <b>' + h1(state) + '</b> taş · Manhattan toplamı <b>' + h2(state) + '</b></span></div>';
    acts.innerHTML = '';
    as.forEach(function (a) { var b = el('button', 'btn', MOVES[a][2]); b.type = 'button'; b.addEventListener('click', function () { stop(); move(a); }); acts.appendChild(b); });
  }
  draw();
})();
