/* Arama algoritmaları çekirdeği: grafta BFS, DFS, UCS, Greedy, A*.
   Her adım, görselleştirmenin çizebilmesi için "olay" olarak kaydedilir. */
(function (root) {
  'use strict';

  function heuristic(g, id) {
    var n = g.nodes[id], t = g.nodes[g.goal];
    var dx = n.x - t.x, dy = n.y - t.y;
    return Math.floor(Math.sqrt(dx * dx + dy * dy) / g.scale);
  }

  function neighbors(g, id) {
    var out = [];
    g.edges.forEach(function (e) {
      if (e[0] === id) out.push({ to: e[1], w: e[2] });
      else if (e[1] === id) out.push({ to: e[0], w: e[2] });
    });
    out.sort(function (a, b) { return a.to < b.to ? -1 : 1; });
    return out;
  }

  /* Anahtar: frontier'den hangi düğümün çıkacağını belirler. */
  function keyOf(algo, g, cost, id, order) {
    var h = heuristic(g, id);
    if (algo === 'ucs') return cost;
    if (algo === 'greedy') return h;
    if (algo === 'astar') return cost + h;
    return order; // bfs / dfs: sadece geliş sırası
  }

  /* Tüm adımları önceden hesaplar; her adım bir anlık görüntüdür. */
  function run(g, algo) {
    var frontier = [{ id: g.start, cost: 0, parent: null, order: 0 }];
    var closed = {}, steps = [], counter = 1, expanded = 0;
    var bestCost = {}; bestCost[g.start] = 0;

    function snap(extra) {
      var f = frontier.map(function (n) {
        return { id: n.id, cost: n.cost, h: heuristic(g, n.id), key: keyOf(algo, g, n.cost, n.id, n.order), parent: n.parent };
      });
      steps.push(Object.assign({ frontier: f, closed: Object.keys(closed), expanded: expanded }, extra));
    }

    snap({ current: null, note: 'Başlangıç düğümü sınır listesine konur.' });

    while (frontier.length) {
      var pick = 0;
      for (var i = 1; i < frontier.length; i++) {
        var a = frontier[i], b = frontier[pick];
        if (algo === 'dfs') { if (a.order > b.order) pick = i; }
        else {
          var ka = keyOf(algo, g, a.cost, a.id, a.order), kb = keyOf(algo, g, b.cost, b.id, b.order);
          if (ka < kb) pick = i;
        }
      }
      var cur = frontier.splice(pick, 1)[0];
      if (closed[cur.id]) continue;

      if (cur.id === g.goal) {
        var path = rebuild(cur);
        snap({ current: cur.id, goal: true, path: path, totalCost: cur.cost, note: 'Hedef sınırdan çıktı: arama bitti.' });
        return steps;
      }

      closed[cur.id] = true; expanded++;
      parents[cur.id + '|' + cur.cost] = cur.parent;
      var added = [];
      var nbs = neighbors(g, cur.id);
      if (algo === 'dfs') nbs.reverse(); // yığın mantığı: ilk komşu en son eklenir, ilk o çıkar
      nbs.forEach(function (nb) {
        if (closed[nb.to]) return;
        var c = cur.cost + nb.w;
        if (algo === 'bfs' || algo === 'dfs') {
          if (frontier.some(function (n) { return n.id === nb.to; })) return;
        } else {
          // Daha ucuz yeni yol yoksa ekleme
          var better = frontier.filter(function (n) { return n.id === nb.to; });
          if (better.some(function (n) { return n.cost <= c; })) return;
          frontier = frontier.filter(function (n) { return !(n.id === nb.to && n.cost > c); });
        }
        var node = { id: nb.to, cost: c, parent: { id: cur.id, cost: cur.cost }, order: counter++ };
        frontier.push(node);
        added.push(nb.to);
      });
      snap({ current: cur.id, added: added, note: cur.id });
    }
    snap({ current: null, fail: true, note: 'Sınır boşaldı, yol yok.' });
    return steps;
  }

  var parents = {};
  function rebuild(node) {
    var path = [node.id], p = node.parent;
    while (p) { path.unshift(p.id); p = parents[p.id + '|' + p.cost]; }
    return path;
  }

  var api = { run: function (g, algo) { parents = {}; return run(g, algo); }, heuristic: heuristic, neighbors: neighbors };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GraphCore = api;
})(typeof window !== 'undefined' ? window : this);
