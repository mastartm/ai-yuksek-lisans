/* Görüntü İşleme · Bölüm 4: bağlı bileşen laboratuvarı (4 / 8 / m bitişiklik) ve uzaklık ölçüleri. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function f2(x) { return (Math.round(x * 100) / 100).toFixed(2).replace('.', ','); }
  var PAL = ['hsl(210 80% 55%)', 'hsl(15 85% 58%)', 'hsl(145 60% 42%)', 'hsl(280 60% 60%)', 'hsl(45 90% 50%)', 'hsl(180 65% 40%)', 'hsl(330 70% 58%)', 'hsl(95 55% 45%)'];

  /* ---------- 1) Bağlı bileşenler ---------- */
  var cc = document.getElementById('cclab');
  if (cc) {
    var N = 8, mode = '8';
    var preset = [
      '11000000',
      '11000110',
      '00100110',
      '00011000',
      '00000001',
      '11100001',
      '00100001',
      '11000111'
    ];
    var g = [];
    function load() { g = preset.map(function (r) { return r.split('').map(Number); }); }
    function on(r, c) { return r >= 0 && c >= 0 && r < N && c < N && g[r][c] === 1; }
    function adj(r1, c1, r2, c2) {
      var dr = Math.abs(r1 - r2), dc = Math.abs(c1 - c2);
      if (!on(r2, c2)) return false;
      if (dr + dc === 1) return true;                       // 4 komşu
      if (dr === 1 && dc === 1) {                           // çapraz
        if (mode === '4') return false;
        if (mode === '8') return true;
        return !on(r1, c2) && !on(r2, c1);                  // m: ortak 4-komşu yoksa
      }
      return false;
    }
    function label() {
      var L = [], i, j, id = 0; for (i = 0; i < N; i++) L.push(new Array(N).fill(0));
      for (i = 0; i < N; i++) for (j = 0; j < N; j++) {
        if (!g[i][j] || L[i][j]) continue;
        id++; var st = [[i, j]]; L[i][j] = id;
        while (st.length) {
          var p = st.pop();
          for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) {
            if (!a && !b) continue; var r = p[0] + a, c = p[1] + b;
            if (r >= 0 && c >= 0 && r < N && c < N && !L[r][c] && adj(p[0], p[1], r, c)) { L[r][c] = id; st.push([r, c]); }
          }
        }
      }
      return { L: L, n: id };
    }
    var bar = el('div', 'chips'), chips = {};
    [['4', '4-bitişiklik'], ['8', '8-bitişiklik'], ['m', 'm-bitişiklik']].forEach(function (m) {
      var b = el('button', 'chip', m[1]); b.type = 'button'; b.addEventListener('click', function () { mode = m[0]; draw(); }); bar.appendChild(b); chips[m[0]] = b;
    });
    cc.appendChild(bar);
    var grid = el('div', 'gi-grid'); grid.style.gridTemplateColumns = 'repeat(' + N + ', 1fr)'; cc.appendChild(grid);
    var cells = [];
    for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
      (function (r, c) {
        var b = el('button', 'gi-cell'); b.type = 'button'; b.setAttribute('aria-label', 'Satır ' + (r + 1) + ' sütun ' + (c + 1));
        b.addEventListener('click', function () { g[r][c] = g[r][c] ? 0 : 1; draw(); });
        grid.appendChild(b); cells.push(b);
      })(i, j);
    }
    var info = el('div', 'metrics'); cc.appendChild(info);
    var nt = el('div', 'callout idea'); cc.appendChild(nt);
    var rs = el('button', 'btn', 'Örnek şekle dön'); rs.type = 'button'; rs.addEventListener('click', function () { load(); draw(); }); cc.appendChild(rs);
    var counts = {};
    function draw() {
      var res = label();
      cells.forEach(function (b, k) {
        var r = Math.floor(k / N), c = k % N, v = res.L[r][c];
        b.style.background = v ? PAL[(v - 1) % PAL.length] : '';
        b.textContent = v ? v : '';
        b.className = 'gi-cell' + (v ? ' on' : '');
      });
      Object.keys(chips).forEach(function (k) { chips[k].setAttribute('aria-pressed', k === mode ? 'true' : 'false'); chips[k].classList.toggle('active', k === mode); });
      counts[mode] = res.n;
      var ones = 0; g.forEach(function (r) { r.forEach(function (v) { ones += v; }); });
      info.innerHTML = '<div class="metric"><b>' + ones + '</b>nesne pikseli</div><div class="metric"><b>' + res.n + '</b>bağlı bileşen</div>';
      nt.innerHTML = mode === '4' ? '<b>4-bitişiklik:</b>yalnızca yatay ve dikey komşular bağlar. Köşeden dokunan pikseller ayrı sayılır; bileşen sayısı en yüksek çıkar.' :
        mode === '8' ? '<b>8-bitişiklik:</b>çapraz komşular da bağlar. Köşeden değen iki şekil tek bileşen olur; bu bazen istenmeyen birleşme demektir.' :
        '<b>m-bitişiklik:</b>çapraz bağ yalnızca ortak bir yatay/dikey komşu yoksa kabul edilir. Bileşenler çoğu zaman 8-bitişiklikle aynı çıkar; fark, aralarındaki yolun tek olması (çift yol sorunu yok).';
    }
    load(); draw();
  }

  /* ---------- 2) Uzaklık ölçüleri ---------- */
  var dl = document.getElementById('distlab');
  if (dl) {
    var M = 9, A = [1, 1], Bp = [6, 4], turn = 0;
    var dgrid = el('div', 'gi-grid'); dgrid.style.gridTemplateColumns = 'repeat(' + M + ', 1fr)'; dl.appendChild(dgrid);
    var dc = [];
    for (var a = 0; a < M; a++) for (var b = 0; b < M; b++) {
      (function (r, c) {
        var x = el('button', 'gi-cell'); x.type = 'button'; x.setAttribute('aria-label', 'Satır ' + (r + 1) + ' sütun ' + (c + 1));
        x.addEventListener('click', function () { if (turn === 0) A = [r, c]; else Bp = [r, c]; turn = 1 - turn; ddraw(); });
        dgrid.appendChild(x); dc.push(x);
      })(a, b);
    }
    var dinfo = el('div', 'metrics'); dl.appendChild(dinfo);
    var dnote = el('div', 'callout idea'); dl.appendChild(dnote);
    function ddraw() {
      dc.forEach(function (x, k) {
        var r = Math.floor(k / M), c = k % M, isA = r === A[0] && c === A[1], isB = r === Bp[0] && c === Bp[1];
        x.className = 'gi-cell' + (isA || isB ? ' on' : '');
        x.style.background = isA ? PAL[0] : isB ? PAL[1] : '';
        x.textContent = isA ? 'p' : isB ? 'q' : '';
      });
      var dr = Math.abs(A[0] - Bp[0]), dcc = Math.abs(A[1] - Bp[1]);
      dinfo.innerHTML = '<div class="metric"><b>' + (dr + dcc) + '</b>D₄ (city-block)</div><div class="metric"><b>' + Math.max(dr, dcc) + '</b>D₈ (satranç)</div><div class="metric"><b>' + f2(Math.sqrt(dr * dr + dcc * dcc)) + '</b>Dₑ (Öklid)</div>';
      dnote.innerHTML = 'Sıradaki tıklama <b>' + (turn === 0 ? 'p' : 'q') + '</b> noktasını taşır. D₄ = |Δsatır| + |Δsütun|, D₈ = max(|Δsatır|, |Δsütun|), Dₑ = √(Δsatır² + Δsütun²). Hep D₈ ≤ Dₑ ≤ D₄ olur.';
    }
    ddraw();
  }
})();
