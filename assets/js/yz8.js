/* Yapay Zekâ Temelleri · Bölüm 8: entropi/Gini ile bölünme, aşırı uyum (ağaç derinliği) ve sürekli nitelikte eşik. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function n3(x) { return (Math.round(x * 1000) / 1000).toFixed(3).replace('.', ','); }
  function pc(x) { return '%' + (Math.round(x * 1000) / 10).toString().replace('.', ','); }
  function slider(parent, id, label, min, max, step, val) {
    var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>';
    parent.appendChild(r); return r.querySelector('input');
  }
  function gini(c0, c1) { var n = c0 + c1; if (!n) return 0; var p = c1 / n; return 1 - p * p - (1 - p) * (1 - p); }
  function ent(c0, c1) { var n = c0 + c1, s = 0; if (!n) return 0; [c0, c1].forEach(function (c) { if (c) { var p = c / n; s -= p * Math.log(p) / Math.LN2; } }); return s; }

  /* ---------- 1) Piknik verisi: entropi, bilgi kazancı, Gini ---------- */
  var sp = document.getElementById('splitlab');
  if (sp) {
    var ROWS = [['Güneşli', 'Yüksek', 0], ['Güneşli', 'Yüksek', 0], ['Bulutlu', 'Yüksek', 1], ['Yağmurlu', 'Normal', 1], ['Yağmurlu', 'Düşük', 1], ['Yağmurlu', 'Düşük', 0], ['Bulutlu', 'Düşük', 1], ['Güneşli', 'Normal', 1], ['Güneşli', 'Düşük', 1], ['Yağmurlu', 'Normal', 1]];   // [hava, nem, piknik: 1 = Evet]
    var FEATS = [['Hava', function (r) { return r[0]; }], ['Nem', function (r) { return r[1]; }], ['Gün numarası (sitenin eklediği)', function (r, i) { return 'Gün ' + (i + 1); }]];
    var fi = 1;
    var fb = el('div', 'chips'); sp.appendChild(fb);
    var fbs = FEATS.map(function (f, k) { var b = el('button', 'chip', f[0]); b.type = 'button'; b.addEventListener('click', function () { fi = k; drawSp(); }); fb.appendChild(b); return b; });
    var dt = '<div class="scroll-x"><table class="cmp"><thead><tr><th>Gün</th><th>Hava</th><th>Nem</th><th>Piknik</th></tr></thead><tbody>';
    ROWS.forEach(function (r, i) { dt += '<tr><td>' + (i + 1) + '</td><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + (r[2] ? 'Evet' : 'Hayır') + '</td></tr>'; });
    sp.appendChild(el('div', '', dt + '</tbody></table></div>'));
    var bt = el('div', 'scroll-x'); sp.appendChild(bt);
    var sm = el('div', 'metrics'); sp.appendChild(sm);
    var sn = el('div', 'callout idea'); sp.appendChild(sn);
    var total0 = ROWS.filter(function (r) { return !r[2]; }).length, total1 = ROWS.length - total0, HS = ent(total0, total1), GS = gini(total0, total1);
    var calc = function (k) {
      var g = {}; ROWS.forEach(function (r, i) { var v = FEATS[k][1](r, i); g[v] = g[v] || [0, 0]; g[v][r[2]]++; });
      var ig = HS, gs = 0;
      Object.keys(g).forEach(function (v) { var c = g[v], n = c[0] + c[1]; ig -= n / ROWS.length * ent(c[0], c[1]); gs += n / ROWS.length * gini(c[0], c[1]); });
      return { g: g, ig: ig, gs: gs };
    };
    var drawSp = function () {
      fbs.forEach(function (b, k) { b.setAttribute('aria-pressed', k === fi ? 'true' : 'false'); });
      var c = calc(fi), h = '<table class="cmp"><thead><tr><th>' + FEATS[fi][0].split(' (')[0] + '</th><th>Örnek</th><th>Evet</th><th>Hayır</th><th>Entropi</th><th>Gini</th></tr></thead><tbody>';
      Object.keys(c.g).forEach(function (v) { var x = c.g[v]; h += '<tr><td>' + v + '</td><td>' + (x[0] + x[1]) + '</td><td>' + x[1] + '</td><td>' + x[0] + '</td><td>' + n3(ent(x[0], x[1])) + '</td><td>' + n3(gini(x[0], x[1])) + '</td></tr>'; });
      bt.innerHTML = h + '</tbody></table>';
      sm.innerHTML = '<div class="metric"><b>' + n3(HS) + '</b>H(S) kök entropisi (7 Evet, 3 Hayır)</div><div class="metric"><b>' + n3(c.ig) + '</b>bilgi kazancı IG</div><div class="metric"><b>' + n3(GS) + '</b>Gini(S)</div><div class="metric"><b>' + n3(c.gs) + '</b>Gini bölünmesi</div>';
      var a = calc(0), b = calc(1);
      if (fi === 2) {
        sn.innerHTML = '<b>Her dal tek bir gün: entropi ve Gini 0.</b> IG = H(S) = ' + n3(HS) + ', Hava ve Nem’den büyük; Gini bölünmesi 0, en küçük. İki ölçüt de bu “özelliği” seçerdi ama öğrenilen şey ezberdir: yeni bir günün numarası hiçbir dala girmez. İşte notun “çok değerli özellikler bilgi kazancını yapay olarak şişirir” uyarısı. (Bu satır ve “Gün numarası” bu sitenin eklemesidir.)';
      } else {
        sn.innerHTML = '<b>Hava ve Nem karşılaştırması.</b> IG(Hava) = ' + n3(a.ig) + ', IG(Nem) = ' + n3(b.ig) + ' → ID3 <b>' + (b.ig > a.ig ? 'Nem' : 'Hava') + '</b>’i seçer. Gini bölünmesi Hava = ' + n3(a.gs) + ', Nem = ' + n3(b.gs) + ' → CART (bu çok kollu hesapla) <b>' + (b.gs < a.gs ? 'Nem' : 'Hava') + '</b>’i seçer. Saf dallar (entropi 0, Gini 0) kararı belirginleştirir: Nem = Normal’de 3 günün üçü de Evet.';
      }
    };
    drawSp();
  }

  /* ---------- 2) Ağaç derinliği ve aşırı uyum ---------- */
  var tl = document.getElementById('treelab');
  if (tl) {
    var seed = 20261023;
    function rnd() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
    function make(n) { var d = []; for (var i = 0; i < n; i++) { var x = rnd(), y = rnd(), c = x > 0.5 && y > 0.4 ? 1 : 0; if (rnd() < 0.15) c = 1 - c; d.push([x, y, c]); } return d; }
    var TRAIN = make(60), TEST = make(400);
    function build(rows, depth, maxD, minLeaf) {
      var c1 = rows.filter(function (r) { return r[2]; }).length, n = rows.length, c0 = n - c1;
      var leaf = { leaf: true, cls: c1 > c0 ? 1 : 0 };
      if (depth >= maxD || c0 === 0 || c1 === 0 || n < 2 * minLeaf) return leaf;
      var best = null, g0 = gini(c0, c1);
      for (var f = 0; f < 2; f++) {
        var s = rows.slice().sort(function (a, b) { return a[f] - b[f]; }), l0 = 0, l1 = 0;
        for (var i = 0; i < n - 1; i++) {
          if (s[i][2]) l1++; else l0++;
          if (s[i][f] === s[i + 1][f]) continue;
          var nl = i + 1, nr = n - nl; if (nl < minLeaf || nr < minLeaf) continue;
          var gs = (nl * gini(l0, l1) + nr * gini(c0 - l0, c1 - l1)) / n;
          if (!best || gs < best.gs - 1e-12) best = { gs: gs, f: f, t: (s[i][f] + s[i + 1][f]) / 2 };
        }
      }
      if (!best || best.gs >= g0 - 1e-12) return leaf;
      return { f: best.f, t: best.t, l: build(rows.filter(function (r) { return r[best.f] < best.t; }), depth + 1, maxD, minLeaf), r: build(rows.filter(function (r) { return r[best.f] >= best.t; }), depth + 1, maxD, minLeaf) };
    }
    function pred(t, x, y) { while (!t.leaf) t = (t.f ? y : x) < t.t ? t.l : t.r; return t.cls; }
    function acc(t, d) { var k = 0; d.forEach(function (r) { if (pred(t, r[0], r[1]) === r[2]) k++; }); return k / d.length; }
    function leaves(t) { return t.leaf ? 1 : leaves(t.l) + leaves(t.r); }
    var dI = slider(tl, 'trd', 'max_depth', 1, 12, 1, 3), lI = slider(tl, 'trl', 'min_samples_leaf', 1, 10, 1, 1);
    var gfx2 = el('div'); tl.appendChild(gfx2);
    var tm = el('div', 'metrics'); tl.appendChild(tm);
    var tsw = el('div', 'scroll-x'); tl.appendChild(tsw);
    var tn = el('div', 'callout idea'); tl.appendChild(tn);
    var drawTr = function () {
      var D = +dI.value, M = +lI.value;
      document.getElementById('trdo').textContent = D; document.getElementById('trlo').textContent = M;
      var tree = build(TRAIN, 0, D, M), a1 = acc(tree, TRAIN), a2 = acc(tree, TEST), nl = leaves(tree);
      var svg = '<svg style="width:100%;max-width:340px;height:auto;display:block;margin:12px 0" viewBox="0 0 300 300" role="img" aria-label="İki özellikli veri ve ağacın bölge haritası">', N = 30, cs = 300 / N;
      for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
        var cls = pred(tree, (i + 0.5) / N, 1 - (j + 0.5) / N);
        svg += '<rect x="' + (i * cs) + '" y="' + (j * cs) + '" width="' + cs + '" height="' + cs + '" style="fill:var(' + (cls ? '--ok-soft' : '--warn-soft') + ')"/>';
      }
      TRAIN.forEach(function (r) { svg += '<circle cx="' + (r[0] * 300).toFixed(1) + '" cy="' + ((1 - r[1]) * 300).toFixed(1) + '" r="4" style="fill:var(' + (r[2] ? '--ok' : '--warn') + ');stroke:var(--surface);stroke-width:1.5"/>'; });
      gfx2.innerHTML = svg + '</svg>';
      tm.innerHTML = '<div class="metric"><b>' + nl + '</b>yaprak sayısı</div><div class="metric"><b>' + pc(a1) + '</b>eğitim doğruluğu (60 nokta)</div><div class="metric"><b>' + pc(a2) + '</b>test doğruluğu (400 nokta)</div><div class="metric"><b>' + pc(a1 - a2) + '</b>fark (eğitim − test)</div>';
      var h = '<table class="cmp"><thead><tr><th>max_depth</th>', r1 = '<tr><td>Eğitim</td>', r2 = '<tr><td>Test</td>', bestD = 1, bestA = -1;
      for (var d = 1; d <= 12; d++) {
        var t2 = build(TRAIN, 0, d, M), x1 = acc(t2, TRAIN), x2 = acc(t2, TEST); if (x2 > bestA + 1e-12) { bestA = x2; bestD = d; }
        var st = d === D ? ' style="background:var(--brand-soft)"' : '';
        h += '<th' + st + '>' + d + '</th>'; r1 += '<td' + st + '>' + Math.round(x1 * 100) + '</td>'; r2 += '<td' + st + '>' + Math.round(x2 * 100) + '</td>';
      }
      tsw.innerHTML = h + '</tr></thead><tbody>' + r1 + '</tr>' + r2 + '</tr></tbody></table>';
      var msg;
      if (D > bestD && a2 < bestA - 0.03) msg = '<b>Aşırı uyum.</b> Ağaç eğitimde ' + pc(a1) + ', testte ' + pc(a2) + '; en iyi test doğruluğu ' + pc(bestA) + ' ile ' + bestD + ' derinliğinde. Fazla dallanan ağaç %15 etiket gürültüsünü de öğreniyor; harita küçük parçalara bölünür.';
      else if (D < bestD && a2 < bestA - 0.03) msg = '<b>Ağaç fazla sığ.</b> Test doğruluğu ' + pc(a2) + '; en iyi ' + pc(bestA) + ' (' + bestD + ' derinlik). Bölge birkaç dikdörtgenle yakalanamıyor, eksik uyum var.';
      else msg = '<b>Test doğruluğu en iyiye yakın</b> (' + pc(a2) + ', en iyi ' + pc(bestA) + '). Eğitim ' + pc(a1) + ' olsa da test geride kalmıyor; fark ' + pc(a1 - a2) + ' (etiketlerin %15’i gürültü olduğu için sıfıra inmez).';
      tn.innerHTML = msg + ' Bu min_samples_leaf (' + M + ') ayarında test doğruluğunun en yüksek olduğu derinlik <b>' + bestD + '</b>. Veri bu site için üretildi; rakamlar bu veriye özgüdür.';
    };
    [dI, lI].forEach(function (i) { i.addEventListener('input', drawTr); });
    drawTr();
  }

  /* ---------- 3) Sürekli nitelikte eşik ---------- */
  var th = document.getElementById('thrlab');
  if (th) {
    var AGE = [22, 25, 27, 31, 34, 38, 42, 45, 51, 55, 60, 64], BUY = [0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0];
    function split(t) {
      var l0 = 0, l1 = 0, r0 = 0, r1 = 0;
      AGE.forEach(function (a, i) { if (a < t) { if (BUY[i]) l1++; else l0++; } else { if (BUY[i]) r1++; else r0++; } });
      return { l0: l0, l1: l1, r0: r0, r1: r1, gs: ((l0 + l1) * gini(l0, l1) + (r0 + r1) * gini(r0, r1)) / AGE.length };
    }
    var bestT = null; for (var q = 0; q < AGE.length - 1; q++) { var mid = (AGE[q] + AGE[q + 1]) / 2, s2 = split(mid); if (!bestT || s2.gs < bestT.gs - 1e-12) bestT = { t: mid, gs: s2.gs }; }
    var tI = slider(th, 'tht', 'Eşik: yaş <', 20, 66, 0.5, 45);
    var g3 = el('div'); th.appendChild(g3);
    var thm = el('div', 'metrics'); th.appendChild(thm);
    var thn = el('div', 'callout idea'); th.appendChild(thn);
    var drawTh = function () {
      var t = +tI.value, s = split(t);
      document.getElementById('thto').textContent = String(t).replace('.', ',');
      function X(a) { return 15 + (a - 20) / 46 * 290; }
      var svg = '<svg style="width:100%;max-width:420px;height:auto;display:block;margin:12px 0" viewBox="0 0 320 90" role="img" aria-label="Yaş ekseninde müşteriler ve eşik çizgisi"><line class="d-line" x1="15" y1="50" x2="305" y2="50"/>';
      AGE.forEach(function (a, i) { svg += '<circle cx="' + X(a).toFixed(1) + '" cy="50" r="7" style="fill:var(' + (BUY[i] ? '--ok' : '--warn') + ');stroke:var(--surface);stroke-width:2"/>'; });
      svg += '<line class="d-line-brand" x1="' + X(t).toFixed(1) + '" y1="15" x2="' + X(t).toFixed(1) + '" y2="75"/><text class="d-sm" x="15" y="86">20</text><text class="d-sm" x="305" y="86" text-anchor="end">66 yaş</text></svg>';
      g3.innerHTML = svg;
      thm.innerHTML = '<div class="metric"><b>' + (s.l0 + s.l1) + ' (' + s.l1 + ' alır)</b>sol: yaş &lt; eşik</div><div class="metric"><b>' + (s.r0 + s.r1) + ' (' + s.r1 + ' alır)</b>sağ: yaş ≥ eşik</div><div class="metric"><b>' + n3(s.gs) + '</b>Gini bölünmesi (kök: 0,500)</div><div class="metric"><b>' + String(bestT.t).replace('.', ',') + ' → ' + n3(bestT.gs) + '</b>en iyi aday eşik ve Gini</div>';
      thn.innerHTML = s.gs <= bestT.gs + 1e-9 ? '<b>Bu eşik en iyi adayla aynı değerde (' + n3(s.gs) + ').</b> 31 ile 34 arasındaki her eşik soldaki 4 müşterinin hepsini “almaz”, sağdaki 8’in 6’sını “alır” diye ayırır. Eşik aramak, tüm aday noktaların Gini’sini karşılaştırmaktır.' :
        '<b>Bu eşikte Gini ' + n3(s.gs) + ', en iyi ' + n3(bestT.gs) + '’den ' + n3(s.gs - bestT.gs) + ' büyük.</b> Daha karışık gruplar oluşuyor. Eşiği 31–34 aralığına çekince sol grup saf olur. (Yaklaşık 40’ta ikinci, daha zayıf bir dip daha vardır.)';
    };
    tI.addEventListener('input', drawTh);
    drawTh();
  }
})();
