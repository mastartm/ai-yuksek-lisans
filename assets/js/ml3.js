/* Makine Öğrenmesi · Bölüm 3: entropi eğrisi, ID3 ağaç laboratuvarı, sürekli öznitelik eşiği.
   Veri kümesi bu site için tasarlanmıştır: "Öğrenci kütüphaneye çalışmaya gider mi?" */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function svgEl(name, attrs, parent) { var e = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (parent) parent.appendChild(e); return e; }
  function H(p, n) { var t = p + n; if (!t) return 0; var e = 0;[p, n].forEach(function (c) { if (c) { var q = c / t; e -= q * Math.log(q) / Math.LN2; } }); return e; }
  function f3(x) { return (Math.round(x * 1000) / 1000).toFixed(3).replace('.', ','); }
  function f2(x) { return (Math.round(x * 100) / 100).toFixed(2).replace('.', ','); }

  /* ---------- 1) Entropi eğrisi ---------- */
  var eb = document.getElementById('entropy');
  if (eb) {
    var row = el('div', 'slider-row'); row.innerHTML = '<label for="enp">Pozitif örnek sayısı (toplam 14)</label><input id="enp" type="range" min="0" max="14" value="7"><output id="eno">7</output>';
    eb.appendChild(row);
    var svg = svgEl('svg', { viewBox: '0 0 560 220', 'class': 'diagram', role: 'img', 'aria-label': 'Entropi eğrisi: p=0,5 iken en yüksek' }); eb.appendChild(svg);
    var L = 50, R = 20, T = 15, B = 40, W = 560, Hh = 220;
    function x(p) { return L + p * (W - L - R); } function y(e) { return T + (1 - e) * (Hh - T - B); }
    svgEl('line', { x1: L, y1: Hh - B, x2: W - R, y2: Hh - B, 'class': 'd-line' }, svg); svgEl('line', { x1: L, y1: T, x2: L, y2: Hh - B, 'class': 'd-line' }, svg);
    var pts = []; for (var i = 0; i <= 100; i++) { var p = i / 100; pts.push(x(p) + ',' + y(H(p, 1 - p))); }
    svgEl('polyline', { points: pts.join(' '), 'class': 'd-line-brand', fill: 'none' }, svg);
    [[0, '0'], [0.5, '0,5'], [1, '1']].forEach(function (a) { var t = svgEl('text', { x: x(a[0]), y: Hh - B + 18, 'class': 'd-sm d-c' }, svg); t.textContent = a[1]; });
    var xl = svgEl('text', { x: (L + W - R) / 2, y: Hh - 6, 'class': 'd-sm d-c' }, svg); xl.textContent = 'pozitif oranı p';
    var yl = svgEl('text', { x: 4, y: T + 10, 'class': 'd-sm' }, svg); yl.textContent = 'entropi';
    var dot = svgEl('circle', { r: 8, 'class': 'd-bad' }, svg);
    var dots = el('div', 'dots'); var res = el('div', 'status');
    eb.appendChild(dots); eb.appendChild(res);
    var sl = document.getElementById('enp'), so = document.getElementById('eno');
    var upd = function () {
      var pos = +sl.value, neg = 14 - pos, p = pos / 14, e = H(pos, neg);
      so.textContent = pos; dot.setAttribute('cx', x(p)); dot.setAttribute('cy', y(e));
      dots.innerHTML = ''; for (var k = 0; k < 14; k++) dots.appendChild(el('span', 'dot ' + (k < pos ? 'pos' : 'neg'), k < pos ? '+' : '−'));
      res.innerHTML = '[' + pos + '+, ' + neg + '−] kümesinin entropisi: <b>' + f3(e) + '</b> bit ' + (e === 0 ? '(tamamen saf: hepsi aynı sınıf)' : e > 0.99 ? '(en karışık: yarı yarıya)' : '');
    };
    sl.addEventListener('input', upd); upd();
  }

  /* ---------- 2) ID3 laboratuvarı ---------- */
  var lab = document.getElementById('id3lab');
  if (lab) {
    var A = ['Sınav', 'Ortam', 'Hava', 'Arkadaş'];
    var D = [
      ['Yakın', 'Gürültülü', 'Güzel', 'Var', 1], ['Yakın', 'Gürültülü', 'Kötü', 'Yok', 1], ['Yakın', 'Sessiz', 'Güzel', 'Var', 0], ['Yakın', 'Sessiz', 'Kötü', 'Yok', 0],
      ['Uzak', 'Gürültülü', 'Güzel', 'Var', 1], ['Uzak', 'Gürültülü', 'Kötü', 'Var', 0], ['Uzak', 'Sessiz', 'Güzel', 'Var', 1], ['Uzak', 'Sessiz', 'Güzel', 'Yok', 0],
      ['Uzak', 'Gürültülü', 'Güzel', 'Yok', 0], ['Yakın', 'Gürültülü', 'Güzel', 'Yok', 1], ['Uzak', 'Sessiz', 'Kötü', 'Yok', 0], ['Yakın', 'Sessiz', 'Güzel', 'Yok', 0]
    ];
    var ALL = D.map(function (_, i) { return i; });
    function counts(idx) { var p = idx.filter(function (i) { return D[i][4]; }).length; return [p, idx.length - p]; }
    function gain(idx, k) {
      var c = counts(idx), r = H(c[0], c[1]);
      var vals = []; idx.forEach(function (i) { if (vals.indexOf(D[i][k]) < 0) vals.push(D[i][k]); });
      vals.forEach(function (v) { var s = idx.filter(function (i) { return D[i][k] === v; }), cc = counts(s); r -= s.length / idx.length * H(cc[0], cc[1]); });
      return r;
    }
    var tree;
    function mk(idx, used) { return { idx: idx, used: used, attr: null, kids: {} }; }
    function reset() { tree = mk(ALL, []); render(); }
    function split(node, k) {
      node.attr = k; node.kids = {};
      var vals = []; node.idx.forEach(function (i) { if (vals.indexOf(D[i][k]) < 0) vals.push(D[i][k]); });
      vals.forEach(function (v) { node.kids[v] = mk(node.idx.filter(function (i) { return D[i][k] === v; }), node.used.concat(k)); });
    }
    function best(node) { var b = -1, bg = -1; A.forEach(function (a, k) { if (node.used.indexOf(k) >= 0) return; var g = gain(node.idx, k); if (g > bg + 1e-9) { bg = g; b = k; } }); return b; }
    function isPure(node) { var c = counts(node.idx); return c[0] === 0 || c[1] === 0; }
    function auto(node) { if (isPure(node) || node.used.length === A.length) return; split(node, best(node)); Object.keys(node.kids).forEach(function (v) { auto(node.kids[v]); }); }
    function leaves(node) { if (node.attr === null) return 1; return Object.keys(node.kids).reduce(function (s, v) { return s + leaves(node.kids[v]); }, 0); }
    function rules(node, path, out) {
      if (node.attr === null) { if (isPure(node)) { var c = counts(node.idx); out.push('EĞER ' + (path.length ? path.join(' VE ') : '(hiçbir şart)') + ' İSE ' + (c[0] ? 'Gider' : 'Gitmez') + ' <span class="mm-note">[' + c[0] + '+, ' + c[1] + '−]</span>'); } return; }
      Object.keys(node.kids).forEach(function (v) { rules(node.kids[v], path.concat(A[node.attr] + ' = ' + v), out); });
    }
    var bar = el('div', 'bar'); lab.appendChild(bar);
    function btn(label, fn, primary) { var b = el('button', 'btn' + (primary ? ' primary' : ''), label); b.type = 'button'; b.addEventListener('click', fn); bar.appendChild(b); return b; }
    btn('🤖 ID3 kursun (otomatik)', function () { tree = mk(ALL, []); auto(tree); render(); }, true);
    btn('↺ Sıfırla', reset);
    var dataBox = el('details', 'datad', '<summary>12 günlük veri kümesini göster</summary>'); lab.appendChild(dataBox);
    var dt = '<div class="scroll-x"><table class="cmp"><thead><tr><th>#</th>' + ['Sınav', 'Ortam', 'Hava', 'Arkadaş'].map(function (a) { return '<th>' + a + '</th>'; }).join('') + '<th>Kütüphaneye gider mi?</th></tr></thead><tbody>';
    D.forEach(function (r, i) { dt += '<tr><td>' + (i + 1) + '</td>' + r.slice(0, 4).map(function (v) { return '<td>' + v + '</td>'; }).join('') + '<td class="' + (r[4] ? 'yes' : 'no') + '">' + (r[4] ? 'Evet' : 'Hayır') + '</td></tr>'; });
    dataBox.insertAdjacentHTML('beforeend', dt + '</tbody></table></div><p class="mm-note">Sınav: sınav yakın mı uzak mı. Ortam: evdeki çalışma ortamı. Hava, Arkadaş: dışarıda birlikte çalışacak biri var mı.</p>');
    var host = el('div', 'tree-host'); lab.appendChild(host);
    var stat = el('div', 'status'); lab.appendChild(stat);
    var ruleBox = el('div', 'quad-info'); lab.appendChild(ruleBox);

    function nodeEl(node, label) {
      var c = counts(node.idx), li = el('li'), box = el('div', 'tnode2' + (isPure(node) ? (c[0] ? ' pos' : ' neg') : ''));
      var head = '<div class="tn-h">' + (label ? '<span class="tn-edge">' + label + '</span> ' : '') + '<b>[' + c[0] + '+, ' + c[1] + '−]</b> <span class="mm-note">entropi ' + f3(H(c[0], c[1])) + '</span></div>';
      if (node.attr !== null) { box.innerHTML = head + '<div class="tn-split">Bölen: <b>' + A[node.attr] + '</b></div>'; li.appendChild(box); var ul = el('ul'); Object.keys(node.kids).forEach(function (v) { ul.appendChild(nodeEl(node.kids[v], A[node.attr] + ' = ' + v)); }); li.appendChild(ul); return li; }
      if (isPure(node)) { box.innerHTML = head + '<div class="tn-leaf">' + (c[0] ? '✅ Yaprak: Gider' : '🛋 Yaprak: Gitmez') + '</div>'; li.appendChild(box); return li; }
      box.innerHTML = head;
      var opts = el('div', 'tn-opts'); var bk = best(node);
      opts.appendChild(el('div', 'mm-note', 'Hangi özniteliğe göre bölelim? (bilgi kazancı)'));
      A.forEach(function (a, k) {
        if (node.used.indexOf(k) >= 0) return;
        var b = el('button', 'chip' + (k === bk ? ' bestg' : ''), a + ' <small>' + f3(gain(node.idx, k)) + (k === bk ? ' ★' : '') + '</small>'); b.type = 'button';
        b.addEventListener('click', function () { split(node, k); render(); }); opts.appendChild(b);
      });
      if (node.used.length === A.length) opts.innerHTML = '<div class="mm-note">Tüm öznitelikler kullanıldı; bu yaprak saf değil (çelişkili örnek).</div>';
      box.appendChild(opts); li.appendChild(box); return li;
    }
    function render() {
      host.innerHTML = ''; var ul = el('ul', 'tree'); ul.appendChild(nodeEl(tree, '')); host.appendChild(ul);
      var finished = (function chk(n) { if (n.attr === null) return isPure(n) || n.used.length === A.length; return Object.keys(n.kids).every(function (v) { return chk(n.kids[v]); }); })(tree);
      var lv = leaves(tree);
      stat.innerHTML = finished ? '<b>Ağaç tamamlandı:</b> ' + lv + ' yaprak, tüm eğitim örnekleri doğru sınıflanıyor. İpucu: ★ işaretli (en yüksek kazançlı) öznitelikleri seçmeyen bir ağaç daha büyük çıkar mı? Sıfırla ve kendi seçimlerinle dene.' : 'Ağaç henüz bitmedi. Saf olmayan (karışık) düğümlerde bir öznitelik seç. ★ en yüksek bilgi kazancını gösterir.';
      var out = []; rules(tree, [], out);
      ruleBox.innerHTML = '<div class="kicker">Ağaçtan çıkan kurallar</div>' + (out.length ? '<ul>' + out.map(function (r) { return '<li>' + r + '</li>'; }).join('') + '</ul>' : '<p class="mm-note">Henüz kural yok: ağaç yalnızca köktür.</p>');
    }
    reset();
  }

  /* ---------- 3) Sürekli öznitelik: eşik adayları ---------- */
  var tb = document.getElementById('thresh');
  if (tb) {
    var S = [[1, 0], [2, 0], [4, 0], [5, 1], [7, 1], [8, 0], [10, 1]];
    var tp = S.filter(function (r) { return r[1]; }).length, tn = S.length - tp, base = H(tp, tn);
    var cand = [];
    for (var i = 0; i < S.length - 1; i++) if (S[i][1] !== S[i + 1][1]) cand.push((S[i][0] + S[i + 1][0]) / 2);
    var html = '<div class="scroll-x"><table class="cmp"><tbody><tr><th>Çalışma saati</th>' + S.map(function (r) { return '<td>' + r[0] + '</td>'; }).join('') + '</tr><tr><th>Sınavı geçti mi?</th>' + S.map(function (r) { return '<td class="' + (r[1] ? 'yes' : 'no') + '">' + (r[1] ? 'Evet' : 'Hayır') + '</td>'; }).join('') + '</tr></tbody></table></div>';
    html += '<p>Sınıf değiştiren komşu çiftlerin ortalaması aday eşiktir. Başlangıç entropisi: <b>' + f3(base) + '</b></p><div class="scroll-x"><table class="cmp"><thead><tr><th>Aday eşik</th><th>≤ eşik</th><th>&gt; eşik</th><th>Bilgi kazancı</th></tr></thead><tbody>';
    var bestc = -1, bg = -1, rows = [];
    cand.forEach(function (c) {
      var le = S.filter(function (r) { return r[0] <= c; }), gt = S.filter(function (r) { return r[0] > c; });
      var lp = le.filter(function (r) { return r[1]; }).length, gp = gt.filter(function (r) { return r[1]; }).length;
      var g = base - le.length / S.length * H(lp, le.length - lp) - gt.length / S.length * H(gp, gt.length - gp);
      rows.push({ c: c, le: [lp, le.length - lp], gt: [gp, gt.length - gp], g: g }); if (g > bg) { bg = g; bestc = c; }
    });
    rows.forEach(function (r) { html += '<tr' + (r.c === bestc ? ' class="cur-row"' : '') + '><td><b>' + String(r.c).replace('.', ',') + '</b></td><td>[' + r.le[0] + '+, ' + r.le[1] + '−]</td><td>[' + r.gt[0] + '+, ' + r.gt[1] + '−]</td><td><b>' + f3(r.g) + '</b>' + (r.c === bestc ? ' ★ en iyi' : '') + '</td></tr>'; });
    tb.innerHTML = html + '</tbody></table></div><p class="mm-note">Seçilen eşik: <b>Çalışma saati ≤ ' + String(bestc).replace('.', ',') + '</b> testi. Sürekli öznitelik, bu eşikle ikili (≤ / &gt;) bir özniteliğe çevrilir.</p>';
  }
})();
