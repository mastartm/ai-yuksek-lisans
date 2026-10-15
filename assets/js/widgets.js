/* Küçük etkileşimli araçlar: büyüme hesaplayıcı ve değerlendirme fonksiyonu ayarı. */
(function () {
  'use strict';

  /* ----- 1) Düğüm sayısı büyümesi: BFS, DFS ve çift yönlü ----- */
  var g = document.getElementById('growth');
  if (g) {
    var b = g.querySelector('#gb'), d = g.querySelector('#gd');
    var ob = g.querySelector('#gbo'), od = g.querySelector('#gdo');
    var rows = { bfs: g.querySelector('[data-r=bfs]'), dfs: g.querySelector('[data-r=dfs]'), bi: g.querySelector('[data-r=bi]') };
    var note = g.querySelector('#gnote');
    var fmt = function (n) {
      if (n < 1e4) return Math.round(n).toLocaleString('tr-TR');
      var e = Math.floor(Math.log10(n));
      return (n / Math.pow(10, e)).toFixed(1).replace('.', ',') + ' × 10^' + e;
    };
    var mem = function (nodes) {
      var by = nodes * 1000; // düğüm başına yaklaşık 1 KB varsayımı
      var u = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'], i = 0;
      while (by >= 1000 && i < u.length - 1) { by /= 1000; i++; }
      return by.toFixed(by < 10 ? 1 : 0).replace('.', ',') + ' ' + u[i];
    };
    var update = function () {
      var bv = +b.value, dv = +d.value;
      ob.textContent = bv; od.textContent = dv;
      var bfs = (Math.pow(bv, dv + 1) - 1) / (bv - 1);
      var dfs = bv * dv + 1;
      var bi = 2 * (Math.pow(bv, Math.ceil(dv / 2) + 1) - 1) / (bv - 1);
      var vals = { bfs: bfs, dfs: dfs, bi: bi };
      var max = Math.log10(bfs);
      Object.keys(rows).forEach(function (k) {
        var w = Math.max(1, Math.log10(vals[k]) / max * 100);
        rows[k].querySelector('.fill').style.width = w + '%';
        rows[k].querySelector('.val').textContent = fmt(vals[k]) + ' düğüm ≈ ' + mem(vals[k]);
      });
      note.textContent = 'Çubuklar logaritmik ölçektedir; yani bir çubuk yarım görünse bile gerçekte kat kat küçük olabilir. Düğüm başına yaklaşık 1 KB bellek varsayıldı.';
    };
    b.addEventListener('input', update); d.addEventListener('input', update); update();
  }

  /* ----- 2) Değerlendirme fonksiyonu: ağırlıklar kararı değiştirir ----- */
  var ev = document.getElementById('evalfn');
  if (ev) {
    var feats = [['Materyal farkı', 'm'], ['Hareket serbestliği', 'o'], ['Merkez kontrolü', 'c']];
    var X = { m: 3, o: 2, c: 1 }, Y = { m: 5, o: -6, c: -2 };
    var W = { m: 1, o: 0.5, c: 0.2 };
    var holder = ev.querySelector('#evw'), sx = ev.querySelector('#evx'), sy = ev.querySelector('#evy');
    var outs = {};
    feats.forEach(function (f) {
      var row = document.createElement('div'); row.className = 'wrow';
      row.innerHTML = '<span>w · ' + f[0] + '</span><input type="range" min="0" max="2" step="0.1" value="' + W[f[1]] + '" aria-label="' + f[0] + ' ağırlığı"><output></output>';
      var inp = row.querySelector('input'), out = row.querySelector('output');
      outs[f[1]] = out; out.textContent = W[f[1]].toFixed(1);
      inp.addEventListener('input', function () { W[f[1]] = +inp.value; out.textContent = (+inp.value).toFixed(1); calc(); });
      holder.appendChild(row);
    });
    var calc = function () {
      var vx = 0, vy = 0;
      feats.forEach(function (f) { vx += W[f[1]] * X[f[1]]; vy += W[f[1]] * Y[f[1]]; });
      sx.querySelector('b').textContent = vx.toFixed(1); sy.querySelector('b').textContent = vy.toFixed(1);
      sx.className = vx >= vy ? 'win' : ''; sy.className = vy > vx ? 'win' : '';
    };
    calc();
  }
})();
