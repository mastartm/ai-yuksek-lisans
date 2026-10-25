/* Veri Bilimi · Bölüm 8: bias-variance (polinom uyumu), boyutluluk laneti, pekiştirmeli öğrenmede indirgeme katsayısı γ.
   Tüm veriler bu site için üretilmiş sanal verilerdir (sabit tohum). */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function n2(x) { return (Math.round(x * 100) / 100).toFixed(2).replace('.', ','); }
  function n3(x) { return (Math.round(x * 1000) / 1000).toFixed(3).replace('.', ','); }
  function slider(parent, id, label, min, max, step, val) {
    var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>';
    parent.appendChild(r); return r.querySelector('input');
  }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function gauss(r) { var u = r() || 1e-9, v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  /* ---------- 1) Bias–variance: polinom derecesi ve L2 (ridge) cezası ---------- */
  var bl = document.getElementById('biasvarlab');
  if (bl) {
    var SIG = 0.3, NTR = 30, M = 100, LAMS = [0, 0.001, 0.01, 0.1, 1], DEG = 9, G = 50;
    var F = function (x) { return Math.sin(2 * Math.PI * x); };
    var r1 = rng(20261025), sets = [];
    for (var s = 0; s < M; s++) { var xs = [], ys = []; for (var i = 0; i < NTR; i++) { var x = r1(); xs.push(x); ys.push(F(x) + SIG * gauss(r1)); } sets.push([xs, ys]); }
    var gx = []; for (var g = 0; g < G; g++) gx.push((g + 0.5) / G);
    function feats(x, d) { var z = 2 * x - 1, f = [1]; for (var k = 1; k <= d; k++) f.push(f[k - 1] * z); return f; }
    function solve(A, b) {
      var n = b.length; for (var i = 0; i < n; i++) {
        var p = i; for (var r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
        var t = A[i]; A[i] = A[p]; A[p] = t; var tb = b[i]; b[i] = b[p]; b[p] = tb;
        for (var r2 = i + 1; r2 < n; r2++) { var f = A[r2][i] / A[i][i]; for (var c = i; c < n; c++) A[r2][c] -= f * A[i][c]; b[r2] -= f * b[i]; }
      }
      var w = new Array(n); for (var i2 = n - 1; i2 >= 0; i2--) { var sm = b[i2]; for (var c2 = i2 + 1; c2 < n; c2++) sm -= A[i2][c2] * w[c2]; w[i2] = sm / A[i2][i2]; } return w;
    }
    function fit(d, lam, xs, ys) {
      var n = d + 1, A = [], b = [], X = xs.map(function (x) { return feats(x, d); });
      for (var i = 0; i < n; i++) { A.push([]); for (var j = 0; j < n; j++) { var sm = 0; for (var k = 0; k < xs.length; k++) sm += X[k][i] * X[k][j]; A[i].push(sm + (i === j && i > 0 ? lam : 0)); } var sb = 0; for (var k2 = 0; k2 < xs.length; k2++) sb += X[k2][i] * ys[k2]; b.push(sb); }
      return solve(A, b);
    }
    var cache = {};
    function stats(lam) {
      if (cache[lam]) return cache[lam];
      var out = [];
      for (var d = 1; d <= DEG; d++) {
        var sum = new Array(G).fill(0), sq = new Array(G).fill(0), tr = 0;
        sets.forEach(function (st) {
          var w = fit(d, lam, st[0], st[1]), e = 0;
          st[0].forEach(function (x, k) { var p = 0, f = feats(x, d); for (var q = 0; q <= d; q++) p += w[q] * f[q]; e += (p - st[1][k]) * (p - st[1][k]); }); tr += e / NTR;
          gx.forEach(function (x, gi) { var p = 0, f = feats(x, d); for (var q = 0; q <= d; q++) p += w[q] * f[q]; sum[gi] += p; sq[gi] += p * p; });
        });
        var b2 = 0, v = 0; gx.forEach(function (x, gi) { var m = sum[gi] / M; b2 += (m - F(x)) * (m - F(x)); v += sq[gi] / M - m * m; });
        out.push({ d: d, b2: b2 / G, v: v / G, tr: tr / M });
      }
      return (cache[lam] = out);
    }
    var dI = slider(bl, 'bvd', 'Polinom derecesi', 1, DEG, 1, 3), lI = slider(bl, 'bvl', 'L2 ceza λ (0, 0,001, 0,01, 0,1, 1)', 0, 4, 1, 0);
    var bg = el('div'); bl.appendChild(bg);
    var bm = el('div', 'metrics'); bl.appendChild(bm);
    var bn = el('div', 'callout idea'); bl.appendChild(bn);
    var drawBv = function () {
      var d = +dI.value, lam = LAMS[+lI.value], st = stats(lam), c = st[d - 1];
      document.getElementById('bvdo').textContent = d; document.getElementById('bvlo').textContent = String(lam).replace('.', ',');
      var tot = st.map(function (x) { return x.b2 + x.v + SIG * SIG; }), mx = Math.max.apply(null, tot.concat(st.map(function (x) { return x.v; }), st.map(function (x) { return x.b2; }))), best = 0;
      tot.forEach(function (t, i) { if (t < tot[best] - 1e-12) best = i; });
      var px = function (i) { return (40 + i / (DEG - 1) * 480).toFixed(1); }, py = function (v) { return (150 - Math.min(v, 1.5) / 1.5 * 130).toFixed(1); };
      var line = function (arr, col, dash) { return '<polyline fill="none" style="stroke:var(' + col + ');stroke-width:2.5"' + (dash ? ' stroke-dasharray="5 4"' : '') + ' points="' + arr.map(function (v, i) { return px(i) + ',' + py(v); }).join(' ') + '"/>'; };
      var svg = '<svg style="width:100%;max-width:560px;height:auto;display:block;margin:12px 0" viewBox="0 0 560 190" role="img" aria-label="Dereceye göre bias karesi, varyans ve toplam hata"><line class="d-line" x1="40" y1="150" x2="520" y2="150"/><line class="d-line" x1="40" y1="20" x2="40" y2="150"/>' + line(st.map(function (x) { return x.b2; }), '--brand') + line(st.map(function (x) { return x.v; }), '--warn') + line(tot, '--ok', true) + '<circle cx="' + px(d - 1) + '" cy="' + py(tot[d - 1]) + '" r="5" style="fill:var(--ok)"/>';
      for (var i = 1; i <= DEG; i++) svg += '<text class="d-sm" x="' + px(i - 1) + '" y="166" text-anchor="middle">' + i + '</text>';
      svg += '<text class="d-sm" x="46" y="16">hata (üst sınır 1,5) · mavi: bias², turuncu: varyans, kesikli yeşil: toplam</text><text class="d-sm" x="280" y="184" text-anchor="middle">polinom derecesi</text></svg>';
      bg.innerHTML = svg;
      bm.innerHTML = '<div class="metric"><b>' + n3(c.b2) + '</b>bias² (ortalama tahmin ile gerçek fonksiyon arası)</div><div class="metric"><b>' + n3(c.v) + '</b>varyans (100 farklı eğitim kümesinde tahminin oynaması)</div><div class="metric"><b>' + n3(SIG * SIG) + '</b>gürültü σ² (kaçınılmaz)</div><div class="metric"><b>' + n3(c.b2 + c.v + SIG * SIG) + '</b>beklenen test hatası = bias² + varyans + σ²</div><div class="metric"><b>' + n3(c.tr) + '</b>eğitim hatası (30 gürültülü noktada)</div>';
      bn.innerHTML = (c.b2 > c.v ? '<b>Bu derecede bias baskın.</b> Model gerçek eğriyi yakalayamıyor' : '<b>Bu derecede varyans baskın.</b> Model her eğitim kümesinde farklı bir eğri çiziyor') + '; toplam hata en düşük ' + (best + 1) + '. derecede (' + n3(tot[best]) + '). Eğitim hatası dereceyle hep düşer ama test hatası düşmez: eğitim hatası aşırı uyumu gizler. λ’yı artırınca yüksek derecelerde varyans azalır, bias biraz artar. Veri bu site için üretildi (gerçek fonksiyon sin 2πx, σ = 0,3, 30 nokta, 100 küme).';
    };
    [dI, lI].forEach(function (i) { i.addEventListener('input', drawBv); });
    drawBv();
  }

  /* ---------- 2) Boyutluluk laneti: uzaklıklar birbirine yaklaşır ---------- */
  var cl = document.getElementById('curselab');
  if (cl) {
    var DIMS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000], NP = 300, NQ = 20, r2 = rng(777), res = [];
    DIMS.forEach(function (d) {
      var pts = []; for (var i = 0; i < NP; i++) { var p = []; for (var k = 0; k < d; k++) p.push(r2()); pts.push(p); }
      var rc = 0, ratio = 0, mn = 0, mxx = 0;
      for (var q = 0; q < NQ; q++) {
        var qp = []; for (var k2 = 0; k2 < d; k2++) qp.push(r2());
        var lo = Infinity, hi = 0; pts.forEach(function (p) { var s = 0; for (var k3 = 0; k3 < d; k3++) { var t = p[k3] - qp[k3]; s += t * t; } s = Math.sqrt(s); if (s < lo) lo = s; if (s > hi) hi = s; });
        rc += (hi - lo) / lo; ratio += lo / hi; mn += lo; mxx += hi;
      }
      res.push({ d: d, rc: rc / NQ, ratio: ratio / NQ, mn: mn / NQ, mx: mxx / NQ });
    });
    var cI = slider(cl, 'cud', 'Boyut sayısı d (1, 2, 5, 10, 20, 50, 100, 200, 500, 1000)', 0, DIMS.length - 1, 1, 3);
    var cg = el('div'); cl.appendChild(cg);
    var cm = el('div', 'metrics'); cl.appendChild(cm);
    var cn = el('div', 'callout idea'); cl.appendChild(cn);
    var drawCu = function () {
      var k = +cI.value, c = res[k]; document.getElementById('cudo').textContent = c.d;
      var maxrc = res[0].rc, px = function (i) { return (40 + i / (DIMS.length - 1) * 480).toFixed(1); }, py = function (v) { return (150 - Math.log10(1 + v) / Math.log10(1 + maxrc) * 130).toFixed(1); };
      var svg = '<svg style="width:100%;max-width:560px;height:auto;display:block;margin:12px 0" viewBox="0 0 560 190" role="img" aria-label="Boyuta göre göreli uzaklık farkı"><line class="d-line" x1="40" y1="150" x2="520" y2="150"/><line class="d-line" x1="40" y1="20" x2="40" y2="150"/><polyline fill="none" style="stroke:var(--brand);stroke-width:2.5" points="' + res.map(function (x, i) { return px(i) + ',' + py(x.rc); }).join(' ') + '"/><circle cx="' + px(k) + '" cy="' + py(c.rc) + '" r="5" style="fill:var(--warn)"/>';
      DIMS.forEach(function (d, i) { svg += '<text class="d-sm" x="' + px(i) + '" y="166" text-anchor="middle">' + d + '</text>'; });
      svg += '<text class="d-sm" x="46" y="16">(en uzak − en yakın) / en yakın (log ölçek)</text><text class="d-sm" x="280" y="184" text-anchor="middle">boyut sayısı d</text></svg>';
      cg.innerHTML = svg;
      cm.innerHTML = '<div class="metric"><b>' + n2(c.mn) + ' · ' + n2(c.mx) + '</b>en yakın ve en uzak komşunun ortalama uzaklığı</div><div class="metric"><b>' + n2(c.rc) + '</b>göreli fark (en uzak − en yakın) / en yakın</div><div class="metric"><b>' + n2(c.ratio) + '</b>en yakın / en uzak uzaklık oranı (1’e yaklaştıkça “hepsi aynı uzak”)</div>';
      cn.innerHTML = c.d <= 2 ? '<b>Düşük boyutta “yakın” ile “uzak” belirgin ayrışır.</b> ' + c.d + ' boyutta en yakın komşu en uzağın yalnızca %' + Math.round(c.ratio * 100) + '’i kadar uzakta.' : '<b>Boyut arttıkça tüm noktalar neredeyse aynı uzaklıkta görünür.</b> ' + c.d + ' boyutta en yakın komşu en uzağın %' + Math.round(c.ratio * 100) + '’i kadar uzakta; göreli fark ' + n2(c.rc) + '. Kümeleme “yakın = benzer” varsayar; fark küçülünce bu varsayım zayıflar. Notun önerdiği çare PCA gibi boyut indirgeme. Veri: 300 rastgele nokta, 20 sorgunun ortalaması (bu site için üretildi).';
    };
    cI.addEventListener('input', drawCu);
    drawCu();
  }

  /* ---------- 3) Pekiştirmeli öğrenme: indirgeme katsayısı γ ---------- */
  var gl = document.getElementById('gammalab');
  if (gl) {
    var gI = slider(gl, 'gmg', 'γ (indirgeme katsayısı)', 0.1, 1, 0.05, 0.9), tI = slider(gl, 'gmt', 'Büyük ödülün adımı T', 2, 20, 1, 10);
    var gg = el('div'); gl.appendChild(gg);
    var gm = el('div', 'metrics'); gl.appendChild(gm);
    var gn = el('div', 'callout idea'); gl.appendChild(gn);
    var drawGm = function () {
      var g = +gI.value, T = +tI.value; document.getElementById('gmgo').textContent = String(g).replace('.', ','); document.getElementById('gmto').textContent = T;
      var A = 10 * g, B = 30 * Math.pow(g, T), crit = Math.pow(1 / 3, 1 / (T - 1));
      var svg = '<svg style="width:100%;max-width:560px;height:auto;display:block;margin:12px 0" viewBox="0 0 560 150" role="img" aria-label="Adım başına indirgeme ağırlığı γ üssü t">';
      for (var t = 1; t <= 20; t++) { var w = Math.pow(g, t), x = 10 + (t - 1) * 26, h = w * 100, col = t === 1 ? '--brand' : (t === T ? '--warn' : '--line'); svg += '<rect x="' + x + '" y="' + (110 - h).toFixed(1) + '" width="20" height="' + h.toFixed(1) + '" style="fill:var(' + col + ')"/><text class="d-sm" x="' + (x + 10) + '" y="126" text-anchor="middle">' + t + '</text>'; }
      gg.innerHTML = svg + '<text class="d-sm" x="10" y="144">mavi: 1. adım (küçük ödül), turuncu: T. adım (büyük ödül); sütun yüksekliği = γᵗ</text></svg>';
      gm.innerHTML = '<div class="metric"><b>' + n2(A) + '</b>A: 1. adımda 10 ödül → 10·γ</div><div class="metric"><b>' + n2(B) + '</b>B: ' + T + '. adımda 30 ödül → 30·γ<sup>' + T + '</sup></div><div class="metric"><b>' + (A > B ? 'A (hemen küçük)' : (B > A ? 'B (geç büyük)' : 'eşit')) + '</b>ajanın seçeceği</div><div class="metric"><b>' + n3(crit) + '</b>eşit olduğu γ = (1/3)<sup>1/(T−1)</sup></div>';
      gn.innerHTML = g > crit + 1e-9 ? '<b>γ eşikten büyük: ajan beklemeyi göze alır.</b> γ ' + n2(g) + ' > ' + n3(crit) + ', 30·γ<sup>' + T + '</sup> = ' + n2(B) + ' > ' + n2(A) + '. Uzun vadeli kazançlar önemseniyor.' : '<b>γ eşikten küçük: ajan hemen alınan küçük ödülü seçer.</b> γ ' + n2(g) + ' ≤ ' + n3(crit) + ' olduğundan ' + n2(A) + ' ≥ ' + n2(B) + '. Notun dediği gibi düşük γ kısa vadeli getiriyi öne çıkarır. Büyük ödül ne kadar geç gelirse eşik 1’e yaklaşır: ajanın sabırlı olması için γ’nın çok yüksek olması gerekir. Ödül değerleri bu sitenin örneğidir.';
    };
    [gI, tI].forEach(function (i) { i.addEventListener('input', drawGm); });
    drawGm();
  }
})();
