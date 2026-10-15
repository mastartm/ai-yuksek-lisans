/* Kampüs grafı üzerinde adım adım arama görselleştirmesi.
   <div class="graphlab" data-algo="bfs" data-show-h="false"> öğelerini canlandırır. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var g = window.KampusGraf, core = window.GraphCore;
  if (!g || !core) return;

  var NAMES = { bfs: 'Genişlik öncelikli (BFS)', dfs: 'Derinlik öncelikli (DFS)', ucs: 'Tek tip maliyet (UCS)', greedy: 'Açgözlü (Greedy)', astar: 'A*' };
  var KEYTXT = {
    bfs: 'sıra: ilk giren ilk çıkar',
    dfs: 'yığın: son giren ilk çıkar',
    ucs: 'anahtar = g (şimdiye kadar yürüdüğün dakika)',
    greedy: 'anahtar = h (tahmini kalan dakika)',
    astar: 'anahtar = f = g + h'
  };

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(e);
    return e;
  }
  function pill(text, cls) {
    var s = document.createElement('span'); s.className = 'pill' + (cls ? ' ' + cls : ''); s.textContent = text; return s;
  }

  function init(root) {
    var algos = (root.getAttribute('data-algos') || root.getAttribute('data-algo')).split(',');
    var algo = algos[0];
    var showH = root.getAttribute('data-show-h') === 'true';
    var steps = [], idx = 0, timer = null;

    var bar = document.createElement('div'); bar.className = 'bar'; root.appendChild(bar);
    var chips = document.createElement('div'); chips.className = 'chips'; bar.appendChild(chips);
    if (algos.length > 1) {
      algos.forEach(function (a) {
        var c = document.createElement('button'); c.type = 'button'; c.className = 'chip'; c.textContent = NAMES[a];
        c.setAttribute('aria-pressed', a === algo ? 'true' : 'false');
        c.addEventListener('click', function () { algo = a; Array.prototype.forEach.call(chips.children, function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); }); reset(); });
        chips.appendChild(c);
      });
    }
    function btn(label, fn, primary) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (primary ? ' primary' : ''); b.textContent = label;
      b.addEventListener('click', fn); bar.appendChild(b); return b;
    }
    var bStep = btn('Sonraki adım', function () { stop(); step(1); }, true);
    var bBack = btn('Geri', function () { stop(); step(-1); });
    var bPlay = btn('Otomatik oynat', function () { if (timer) stop(); else play(); });
    btn('Başa sar', function () { stop(); reset(); });

    var svg = el('svg', { viewBox: '0 0 720 420', role: 'img', 'aria-label': 'Kampüs haritası üzerinde arama görselleştirmesi' });
    root.appendChild(svg);
    var edgeEls = {}, nodeEls = {};
    g.edges.forEach(function (e) {
      var a = g.nodes[e[0]], b = g.nodes[e[1]];
      var line = el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, 'class': 'gedge' }, svg);
      edgeEls[e[0] + e[1]] = line; edgeEls[e[1] + e[0]] = line;
    });
    if (root.getAttribute('data-weights') === 'true') {
      g.edges.forEach(function (e) {
        var a = g.nodes[e[0]], b = g.nodes[e[1]];
        var t = el('text', { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 4, 'class': 'gw' }, svg); t.textContent = e[2];
      });
    }
    Object.keys(g.nodes).forEach(function (id) {
      var n = g.nodes[id];
      var grp = el('g', { 'class': 'gnode', transform: 'translate(' + n.x + ',' + n.y + ')' }, svg);
      el('circle', { r: 27 }, grp);
      var t1 = el('text', { y: -2 }, grp); t1.textContent = id;
      var t2 = el('text', { y: 12, 'class': 'sub' }, grp); t2.textContent = '';
      var lab = el('text', { y: 46, 'class': 'sub' }, grp); lab.textContent = n.name;
      nodeEls[id] = { grp: grp, sub: t2 };
    });

    var info = document.createElement('div'); info.className = 'status'; root.appendChild(info);
    var lists = document.createElement('div'); root.appendChild(lists);
    var legend = document.createElement('div'); legend.className = 'legend';
    legend.innerHTML = '<span><i style="background:var(--brand)"></i>şu an genişletilen</span><span><i style="background:var(--warn-soft);border-color:var(--warn)"></i>sınırda (sırada)</span><span><i style="background:var(--brand-soft);border-color:var(--brand)"></i>genişletildi</span><span><i style="background:var(--ok-soft);border-color:var(--ok)"></i>bulunan yol</span>';
    root.appendChild(legend);

    function reset() { steps = core.run(g, algo); idx = 0; draw(); }
    function stop() { if (timer) { clearInterval(timer); timer = null; bPlay.textContent = 'Otomatik oynat'; } }
    function play() {
      if (idx >= steps.length - 1) idx = 0;
      bPlay.textContent = 'Durdur';
      timer = setInterval(function () { if (idx >= steps.length - 1) { stop(); return; } step(1); }, 1100);
    }
    function step(d) { idx = Math.max(0, Math.min(steps.length - 1, idx + d)); draw(); }

    function name(id) { return g.nodes[id].name; }

    function draw() {
      var s = steps[idx];
      Object.keys(edgeEls).forEach(function (k) { edgeEls[k].setAttribute('class', 'gedge'); });
      var front = {};
      s.frontier.forEach(function (n) { front[n.id] = n; });
      var closed = {};
      s.closed.forEach(function (c) { closed[c] = true; });
      var onpath = {};
      if (s.path) s.path.forEach(function (p) { onpath[p] = true; });
      Object.keys(nodeEls).forEach(function (id) {
        var cls = 'gnode';
        if (closed[id]) cls += ' closed';
        if (front[id] && !s.goal) cls += ' frontier';
        if (s.current === id && !s.goal) cls += ' current';
        if (s.goal && onpath[id]) cls += ' onpath';
        nodeEls[id].grp.setAttribute('class', cls);
        var sub = '';
        if (showH && (algo === 'greedy' || algo === 'astar' || algo === 'ucs')) {
          var f = front[id];
          if (f) sub = algo === 'greedy' ? 'h=' + f.h : algo === 'ucs' ? 'g=' + f.cost : 'f=' + (f.cost + f.h);
        }
        nodeEls[id].sub.textContent = sub;
      });
      if (s.path) for (var i = 0; i < s.path.length - 1; i++) edgeEls[s.path[i] + s.path[i + 1]].setAttribute('class', 'gedge onpath');

      var msg;
      if (s.goal) msg = '<b>Bitti.</b> Yol: ' + s.path.map(name).join(' → ') + '. Toplam <b>' + s.totalCost + ' dakika</b>, ' + s.expanded + ' düğüm genişletildi.';
      else if (s.fail) msg = 'Yol bulunamadı.';
      else if (s.current === null) msg = 'Başlangıç: <b>' + name(g.start) + '</b> sınır listesine konur. Strateji: ' + KEYTXT[algo] + '.';
      else msg = '<b>' + name(s.current) + '</b> genişletildi.' + (s.added && s.added.length ? ' Yeni komşular sınıra eklendi: ' + s.added.map(name).join(', ') + '.' : ' Sınıra eklenecek yeni komşu yok.');
      info.innerHTML = '<div class="kicker">' + NAMES[algo] + ' · adım ' + (idx + 1) + '/' + steps.length + '</div>' + msg;

      lists.innerHTML = '';
      var row1 = document.createElement('div'); row1.className = 'listrow';
      var l1 = document.createElement('span'); l1.className = 'lbl'; l1.textContent = algo === 'bfs' ? 'Sıra (frontier):' : algo === 'dfs' ? 'Yığın (frontier):' : 'Öncelik kuyruğu:';
      row1.appendChild(l1);
      var sorted = s.frontier.slice();
      if (algo === 'dfs') sorted.reverse();
      else if (algo !== 'bfs') sorted.sort(function (a, b) { return a.key - b.key; });
      if (!sorted.length) row1.appendChild(pill('boş'));
      sorted.forEach(function (n) {
        var t = n.id;
        if (algo === 'ucs') t += ' (g=' + n.cost + ')';
        else if (algo === 'greedy') t += ' (h=' + n.h + ')';
        else if (algo === 'astar') t += ' (' + n.cost + '+' + n.h + '=' + (n.cost + n.h) + ')';
        row1.appendChild(pill(t));
      });
      lists.appendChild(row1);
      var row2 = document.createElement('div'); row2.className = 'listrow';
      var l2 = document.createElement('span'); l2.className = 'lbl'; l2.textContent = 'Genişletilenler:';
      row2.appendChild(l2);
      if (!s.closed.length) row2.appendChild(pill('henüz yok'));
      s.closed.forEach(function (c) { row2.appendChild(pill(c, 'closed')); });
      lists.appendChild(row2);

      bBack.disabled = idx === 0; bStep.disabled = idx === steps.length - 1;
    }

    reset();
  }

  Array.prototype.forEach.call(document.querySelectorAll('.graphlab'), init);
})();
