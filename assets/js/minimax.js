/* Minimax ve alfa-beta budama: adım adım ağaç görselleştirmesi.
   Ağaç bu projeye özgüdür: kökte MAX, altında üç MIN düğümü, her birinin altında üç yaprak. */
(function () {
  'use strict';
  var root = document.getElementById('mmlab');
  if (!root) return;
  var NS = 'http://www.w3.org/2000/svg';
  var LEAVES = [[7, 3, 9], [2, 8, 6], [1, 5, 4]];
  var MOVES = ['Hamle A', 'Hamle B', 'Hamle C'];
  var INF = 99;

  /* Düğüm kimlikleri: R (kök), M0..M2 (MIN), L0_0..L2_2 (yaprak) */
  function build(prune) {
    var snaps = [], vals = {}, cut = {}, ab = {}, active = null, leavesSeen = 0, best = null;
    function snap(note) {
      snaps.push({ vals: Object.assign({}, vals), cut: Object.assign({}, cut), ab: JSON.parse(JSON.stringify(ab)), active: active, leaves: leavesSeen, note: note, best: best });
    }
    var alpha = -INF, beta = INF, v = -INF;
    ab.R = { a: alpha, b: beta };
    snap('Başlangıç: kök MAX düğümü. Üç hamlemiz var; her hamleden sonra rakip (MIN) cevap verecek.');
    for (var i = 0; i < 3; i++) {
      var mid = 'M' + i, mv = INF;
      ab[mid] = { a: alpha, b: beta };
      active = mid; snap(MOVES[i] + ' düşünülüyor. Şimdi sıra rakipte: o, bizim için en kötü yaprağı seçer.');
      var pruned = false;
      for (var j = 0; j < 3; j++) {
        var lid = 'L' + i + '_' + j, x = LEAVES[i][j];
        if (pruned) { cut[lid] = true; continue; }
        leavesSeen++; active = lid; vals[lid] = x;
        mv = Math.min(mv, x); vals[mid] = mv;
        if (prune && mv <= alpha) {
          pruned = true;
          for (var q = j + 1; q < 3; q++) cut['L' + i + '_' + q] = true;
          snap('Yaprak ' + x + ' görüldü. Rakip bu hamlede bize en fazla ' + mv + ' bırakır; ama başka bir hamlede zaten ' + alpha + ' garantimiz var. Bu dalın kalanına bakmaya gerek yok: budandı.');
          continue;
        }
        if (prune) ab[mid].b = Math.min(ab[mid].b, mv);
        snap('Yaprak ' + x + ' görüldü. Rakibin şimdiye kadarki en iyi seçimi: ' + mv + '.');
      }
      active = mid; vals[mid] = mv;
      var improved = mv > v;
      v = Math.max(v, mv);
      if (prune) { alpha = Math.max(alpha, mv); ab.R = { a: alpha, b: beta }; }
      vals.R = v;
      if (improved) best = i;
      snap(MOVES[i] + ' için sonuç: ' + mv + '. Kökte şimdiye kadarki en iyi: ' + v + '.' + (prune ? ' (alfa=' + alpha + ')' : ''));
    }
    active = 'R';
    snap('Bitti. En iyi hamle: ' + MOVES[best] + ' (değer ' + v + '). Bakılan yaprak sayısı: ' + leavesSeen + ' / 9.');
    return snaps;
  }

  var mode = 'minimax', snaps, idx = 0, timer = null;
  var bar = document.createElement('div'); bar.className = 'bar'; root.appendChild(bar);
  var chips = document.createElement('div'); chips.className = 'chips'; bar.appendChild(chips);
  [['minimax', 'Minimax'], ['ab', 'Alfa-beta budama']].forEach(function (m) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = m[1];
    b.setAttribute('aria-pressed', m[0] === mode ? 'true' : 'false');
    b.addEventListener('click', function () { mode = m[0]; Array.prototype.forEach.call(chips.children, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); reset(); });
    chips.appendChild(b);
  });
  function btn(label, fn, primary) { var b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (primary ? ' primary' : ''); b.textContent = label; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  var bNext = btn('Sonraki adım', function () { stop(); go(1); }, true);
  var bPrev = btn('Geri', function () { stop(); go(-1); });
  var bPlay = btn('Otomatik oynat', function () { if (timer) stop(); else play(); });
  btn('Başa sar', function () { stop(); reset(); });

  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 720 400'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Minimax oyun ağacı');
  root.appendChild(svg);
  var status = document.createElement('div'); status.className = 'status'; root.appendChild(status);

  var P = { R: [360, 50], M0: [140, 160], M1: [360, 160], M2: [580, 160] };
  for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) P['L' + i + '_' + j] = [P['M' + i][0] + (j - 1) * 80, 290];
  var edges = [];
  ['M0', 'M1', 'M2'].forEach(function (m, i) { edges.push(['R', m]); for (var j = 0; j < 3; j++) edges.push([m, 'L' + i + '_' + j]); });
  var edgeEl = {}, nodeEl = {}, abEl = {};
  edges.forEach(function (e) {
    var l = document.createElementNS(NS, 'line');
    l.setAttribute('x1', P[e[0]][0]); l.setAttribute('y1', P[e[0]][1] + 18); l.setAttribute('x2', P[e[1]][0]); l.setAttribute('y2', P[e[1]][1] - 18);
    l.setAttribute('class', 'tedge'); svg.appendChild(l); edgeEl[e[1]] = l;
  });
  function mk(id, shape) {
    var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'tnode'); g.setAttribute('transform', 'translate(' + P[id][0] + ',' + P[id][1] + ')');
    var s;
    if (shape === 'max') { s = document.createElementNS(NS, 'polygon'); s.setAttribute('points', '0,-22 24,18 -24,18'); }
    else if (shape === 'min') { s = document.createElementNS(NS, 'polygon'); s.setAttribute('points', '0,20 24,-18 -24,-18'); }
    else { s = document.createElementNS(NS, 'rect'); s.setAttribute('x', -20); s.setAttribute('y', -16); s.setAttribute('width', 40); s.setAttribute('height', 32); s.setAttribute('rx', 8); }
    g.appendChild(s);
    var t = document.createElementNS(NS, 'text'); t.setAttribute('y', shape === 'max' ? 5 : shape === 'min' ? -3 : 0); g.appendChild(t);
    svg.appendChild(g); nodeEl[id] = { g: g, t: t };
  }
  mk('R', 'max'); ['M0', 'M1', 'M2'].forEach(function (m) { mk(m, 'min'); });
  Object.keys(P).filter(function (k) { return k[0] === 'L'; }).forEach(function (k) { mk(k, 'leaf'); });
  function lbl(x, y, text) { var t = document.createElementNS(NS, 'text'); t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('class', 'tlabel'); t.setAttribute('text-anchor', 'middle'); t.textContent = text; svg.appendChild(t); return t; }
  lbl(60, 55, 'MAX (biz)'); lbl(60, 165, 'MIN (rakip)'); lbl(360, 345, 'yapraklar: oyun sonu puanları');
  ['M0', 'M1', 'M2'].forEach(function (m, i) { lbl(P[m][0], 118, MOVES[i]); abEl[m] = lbl(P[m][0], 205, ''); });
  abEl.R = lbl(360, 92, '');
  var cutMarks = [];
  var counter = lbl(660, 370, ''); counter.setAttribute('text-anchor', 'end');

  function draw() {
    var s = snaps[idx];
    Object.keys(nodeEl).forEach(function (id) {
      var n = nodeEl[id], cls = 'tnode';
      if (s.cut[id]) cls += ' cut'; else if (s.vals[id] !== undefined && id[0] !== 'L') cls += ' done';
      if (s.active === id) cls += ' active';
      if (id[0] === 'L' && s.vals[id] !== undefined && !s.cut[id]) cls += ' done';
      n.g.setAttribute('class', cls);
      n.t.textContent = s.vals[id] !== undefined ? s.vals[id] : (s.cut[id] ? '' : (id[0] === 'L' ? '?' : '?'));
    });
    cutMarks.forEach(function (m) { svg.removeChild(m); }); cutMarks = [];
    edges.forEach(function (e) {
      var cls = 'tedge';
      if (s.cut[e[1]]) { cls += ' cut'; var m = document.createElementNS(NS, 'text'); m.setAttribute('class', 'cutmark'); m.setAttribute('x', P[e[1]][0]); m.setAttribute('y', P[e[1]][1] + 8); m.textContent = '✂'; svg.appendChild(m); cutMarks.push(m); }
      if (idx === snaps.length - 1 && e[0] === 'R' && 'M' + s.best === e[1]) cls += ' best';
      edgeEl[e[1]].setAttribute('class', cls);
    });
    ['M0', 'M1', 'M2'].forEach(function (m) { var a = s.ab[m]; abEl[m].textContent = mode === 'ab' && a ? 'α=' + (a.a <= -INF ? '−∞' : a.a) + '  β=' + (a.b >= INF ? '+∞' : a.b) : ''; });
    abEl.R.textContent = mode === 'ab' && s.ab.R ? 'α=' + (s.ab.R.a <= -INF ? '−∞' : s.ab.R.a) + '  β=+∞' : '';
    counter.textContent = 'Bakılan yaprak: ' + s.leaves + ' / 9';
    status.innerHTML = '<div class="kicker">' + (mode === 'ab' ? 'Alfa-beta budama' : 'Minimax') + ' · adım ' + (idx + 1) + '/' + snaps.length + '</div>' + s.note;
    bPrev.disabled = idx === 0; bNext.disabled = idx === snaps.length - 1;
  }
  function reset() { snaps = build(mode === 'ab'); idx = 0; draw(); }
  function go(d) { idx = Math.max(0, Math.min(snaps.length - 1, idx + d)); draw(); }
  function stop() { if (timer) { clearInterval(timer); timer = null; bPlay.textContent = 'Otomatik oynat'; } }
  function play() { if (idx >= snaps.length - 1) idx = 0; bPlay.textContent = 'Durdur'; timer = setInterval(function () { if (idx >= snaps.length - 1) { stop(); return; } go(1); }, 1200); }
  reset();
})();
