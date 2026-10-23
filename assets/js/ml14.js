/* Makine Öğrenmesi · Bölüm 14: indirim, tek bir Q güncellemesi ve ızgara-dünyasında Q-öğrenme.
   Izgara-dünyası: notundaki 6 karelik örnek (hedef G'ye geçişte ödül 100, γ = 0,9); eylem seçimi ve bölümler bu siteye aittir. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function tr(x, d) { var k = Math.pow(10, d == null ? 1 : d); return (Math.round(x * k) / k).toString().replace('.', ','); }
  function sl(root, id, label, min, max, step, val, cb) { var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>'; root.appendChild(r); var i = r.querySelector('input'); i.addEventListener('input', cb); return i; }

  /* ---------- 1) İndirimli toplam ödül ---------- */
  (function discountLab() {
    var root = document.getElementById('gamlab');
    if (!root) return;
    var iG = sl(root, 'gm', 'İndirim faktörü γ', 0, 0.99, 0.01, 0.9, draw);
    var tb = el('div', 'scroll-x'); root.appendChild(tb);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function draw() {
      var g = +iG.value; document.getElementById('gmo').textContent = tr(g, 2);
      var head = '<tr><th>Ödülün gecikmesi (adım)</th>', row = '<tr><td>100 ödülün bugünkü değeri</td>', i;
      for (i = 0; i <= 6; i++) { head += '<th>' + i + '</th>'; row += '<td>' + tr(100 * Math.pow(g, i), 1) + '</td>'; }
      tb.innerHTML = '<table class="cmp"><thead>' + head + '</tr></thead><tbody>' + row + '</tr></tbody></table>';
      info.innerHTML = '<div class="metric"><b>' + tr(100 * g, 1) + '</b>1 adım sonra gelen 100 ödül</div><div class="metric"><b>' + tr(100 * g * g, 1) + '</b>2 adım sonra gelen 100 ödül</div><div class="metric"><b>' + tr(100 * Math.pow(g, 6), 1) + '</b>6 adım sonra gelen 100 ödül</div>';
      note.innerHTML = g === 0 ? 'γ = 0: etmen <b>yalnızca hemen gelen ödülü</b> önemser; gecikmeli ödülün değeri sıfırdır.' : g >= 0.95 ? 'γ 1’e yaklaşınca gecikmeli ödüller neredeyse hemen gelen ödüller kadar önemli olur.' : 'i adım sonra alınan ödülün toplama etkisi γ<sup>i</sup> kadar azalır. γ = 0,9 iken 100, 90, 81, 72,9 … olur: notun ızgara-dünyasındaki V* değerleri (100, 90, 81) böyle çıkar.';
    }
    draw();
  })();

  /* ---------- 2) Tek bir Q güncellemesi ---------- */
  (function updateLab() {
    var root = document.getElementById('qupdlab');
    if (!root) return;
    var bar = el('div', 'chips'); root.appendChild(bar);
    var bp = el('button', 'btn', 'Notun örneği (Şekil 14.3)'); bp.type = 'button'; bar.appendChild(bp);
    var iR = sl(root, 'qr', 'Hemen gelen ödül r', 0, 100, 1, 0, draw);
    var iG = sl(root, 'qg', 'İndirim γ', 0, 1, 0.05, 0.9, draw);
    var iA = sl(root, 'qa', 'Yeni durumda Q(s′, a₁)', 0, 100, 1, 63, draw);
    var iB = sl(root, 'qb', 'Yeni durumda Q(s′, a₂)', 0, 100, 1, 81, draw);
    var iC = sl(root, 'qc', 'Yeni durumda Q(s′, a₃)', 0, 100, 1, 100, draw);
    bp.addEventListener('click', function () { iR.value = 0; iG.value = 0.9; iA.value = 63; iB.value = 81; iC.value = 100; draw(); });
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function draw() {
      var r = +iR.value, g = +iG.value, a = +iA.value, b = +iB.value, c = +iC.value;
      document.getElementById('qro').textContent = r; document.getElementById('qgo').textContent = tr(g, 2); document.getElementById('qao').textContent = a; document.getElementById('qbo').textContent = b; document.getElementById('qco').textContent = c;
      var mx = Math.max(a, b, c), q = r + g * mx;
      info.innerHTML = '<div class="metric"><b>' + mx + '</b>max Q(s′, ·)</div><div class="metric"><b>' + tr(g * mx, 1) + '</b>γ · max</div><div class="metric"><b>' + tr(q, 1) + '</b>yeni Q(s, a) = r + γ · max</div>';
      note.innerHTML = 'Q(s, a) ← r + γ · max<sub>a′</sub> Q(s′, a′) = ' + r + ' + ' + tr(g, 2) + ' × ' + mx + ' = <b>' + tr(q, 1) + '</b>. Güncelleme yeni durumdaki <b>en iyi</b> Q değerini kullanır; etmenin r ve δ fonksiyonlarını bilmesine gerek yoktur, aksiyonu uygulayıp sonucu algılaması yeter.';
    }
    draw();
  })();

  /* ---------- 3) Izgara-dünyasında Q-öğrenme ---------- */
  (function gridLab() {
    var root = document.getElementById('qgrid');
    if (!root) return;
    var R = 2, C = 3, G = 2, GAMMA = 0.9, DIRS = [[-1, 0, '↑'], [1, 0, '↓'], [0, -1, '←'], [0, 1, '→']];
    var Q, eps, steps, episodes, last, mode = 'random', last2;
    function nxt(s, a) { var r = Math.floor(s / C), c = s % C, nr = r + DIRS[a][0], nc = c + DIRS[a][1]; if (nr < 0 || nc < 0 || nr >= R || nc >= C) return -1; return nr * C + nc; }
    function avail(s) { var o = []; for (var a = 0; a < 4; a++) if (nxt(s, a) >= 0) o.push(a); return o; }
    function vmax(s) { if (s === G) return 0; var m = -1, a; avail(s).forEach(function (x) { if (Q[s][x] > m) m = Q[s][x]; }); return Math.max(m, 0); }
    function reset() { Q = []; for (var s = 0; s < R * C; s++) Q.push([0, 0, 0, 0]); steps = 0; episodes = 0; last = 'Henüz adım atılmadı. Tüm Q değerleri 0.'; draw(); }
    function pick(s) {
      var av = avail(s);
      if (mode === 'random' || Math.random() < 0.1) return av[Math.floor(Math.random() * av.length)];
      var m = -1, best = []; av.forEach(function (a) { if (Q[s][a] > m + 1e-9) { m = Q[s][a]; best = [a]; } else if (Math.abs(Q[s][a] - m) < 1e-9) best.push(a); });
      return best[Math.floor(Math.random() * best.length)];
    }
    var cur = 3;
    function step() {
      var a = pick(cur), s2 = nxt(cur, a), r = s2 === G ? 100 : 0, old = Q[cur][a];
      Q[cur][a] = r + GAMMA * vmax(s2); steps++;
      last = 'Q(' + name(cur) + ', ' + DIRS[a][2] + ') ← ' + r + ' + ' + tr(GAMMA, 1) + ' × ' + tr(vmax(s2), 1) + ' = ' + tr(Q[cur][a], 1) + ' (önce ' + tr(old, 1) + ')';
      if (s2 === G) { episodes++; cur = [0, 1, 3, 4, 5][Math.floor(Math.random() * 5)]; last += ' · hedefe ulaşıldı, yeni bölüm başladı'; } else cur = s2;
    }
    function name(s) { return s === G ? 'G' : ['A', 'B', 'G', 'D', 'E', 'F'][s]; }
    function episode() { var g = 0; var e0 = episodes; while (episodes === e0 && g++ < 400) step(); }
    var bar = el('div', 'chips'); root.appendChild(bar);
    function btn(label, cls, fn) { var b = el('button', 'btn' + (cls ? ' ' + cls : ''), label); b.type = 'button'; b.addEventListener('click', function () { fn(); draw(); }); bar.appendChild(b); return b; }
    btn('Bir adım', 'primary', step); btn('Bir bölüm (hedefe kadar)', '', episode); btn('100 bölüm', '', function () { for (var i = 0; i < 100; i++) episode(); }); btn('Sıfırla', '', function () { cur = 3; reset(); });
    var bar2 = el('div', 'chips'); bar2.style.marginTop = '8px'; root.appendChild(bar2);
    [['random', 'Eylem seçimi: rastgele keşif'], ['greedy', 'Eylem seçimi: öğrenileni uygula (%90) + keşif (%10)']].forEach(function (a) { var b = el('button', 'chip', a[1]); b.type = 'button'; b.dataset.k = a[0]; b.addEventListener('click', function () { mode = a[0]; draw(); }); bar2.appendChild(b); });
    var grid = el('div'); grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0'; root.appendChild(grid);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function draw() {
      Array.prototype.forEach.call(bar2.children, function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === mode)); });
      grid.innerHTML = '';
      for (var s = 0; s < R * C; s++) {
        var cell = el('div'); cell.style.cssText = 'border:2px solid ' + (s === G ? 'var(--ok)' : 'var(--line)') + ';border-radius:10px;padding:6px;background:' + (s === cur ? 'var(--brand-soft)' : 'var(--surface)') + ';font-size:.78rem;min-height:92px';
        if (s === G) cell.innerHTML = '<b>G</b> hedef<br>yutan durum<br><span style="color:var(--muted)">ödül: buraya geçişte 100</span>';
        else {
          var v = vmax(s), best = -1, bests = [];
          avail(s).forEach(function (a) { if (Q[s][a] > best + 1e-9) { best = Q[s][a]; bests = [a]; } else if (Math.abs(Q[s][a] - best) < 1e-9) bests.push(a); });
          var lines = avail(s).map(function (a) { return '<span style="' + (best > 0 && bests.indexOf(a) >= 0 ? 'font-weight:700;color:var(--ok)' : '') + '">' + DIRS[a][2] + ' ' + tr(Q[s][a], 1) + '</span>'; }).join(' &nbsp;');
          cell.innerHTML = '<b>' + name(s) + '</b>' + (s === cur ? ' <span style="color:var(--brand)">etmen burada</span>' : '') + '<br>' + lines + '<br><span style="color:var(--muted)">V ≈ ' + tr(v, 1) + '</span>';
        }
        grid.appendChild(cell);
      }
      info.innerHTML = '<div class="metric"><b>' + steps + '</b>atılan adım</div><div class="metric"><b>' + episodes + '</b>tamamlanan bölüm</div><div class="metric"><b>' + tr(vmax(5), 1) + ' / ' + tr(vmax(4), 1) + ' / ' + tr(vmax(3), 1) + '</b>V(F) / V(E) / V(D): hedefe 1, 2, 3 adım</div>';
      note.innerHTML = last + '<br>Q değeri yalnızca hedefe giden yolda yayılır: önce hedefin hemen yanındaki durumlar 100 olur, sonra bir önceki durumlar 90, 81 … olur. Yeşil kalın eylem, o durumda şimdilik en yüksek Q’ya sahip eylemdir.';
    }
    reset();
  })();
})();
