/* Veri Bilimi · Bölüm 10: aykırı değerde z-skor ve IQR, Ridge/Lasso/ElasticNet büzülmesi, adalet ölçütlerinin çatışması.
   Tüm veriler bu site için üretilmiş sanal verilerdir. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function n1(x) { return (Math.round(x * 10) / 10).toFixed(1).replace('.', ','); }
  function n2(x) { return (Math.round(x * 100) / 100).toFixed(2).replace('.', ','); }
  function n3(x) { return (Math.round(x * 1000) / 1000).toFixed(3).replace('.', ','); }
  function pc(x) { return '%' + (Math.round(x * 1000) / 10).toString().replace('.', ','); }
  function slider(parent, id, label, min, max, step, val) {
    var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>';
    parent.appendChild(r); return r.querySelector('input');
  }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function gauss(r) { var u = r() || 1e-9, v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function erfc(x) { var z = Math.abs(x), t = 1 / (1 + 0.5 * z), r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))); return x >= 0 ? r : 2 - r; }
  function Phi(x) { return 0.5 * erfc(-x / Math.SQRT2); }

  /* ---------- 1) Aykırı değer: z-skor ve IQR ---------- */
  var ol = document.getElementById('outlierlab');
  if (ol) {
    var rr = rng(20261025), BASE = []; for (var i = 0; i < 60; i++) BASE.push(50 + 2 * gauss(rr));
    function quant(sorted, q) { var p = (sorted.length - 1) * q, lo = Math.floor(p), hi = Math.ceil(p); return sorted[lo] + (sorted[hi] - sorted[lo]) * (p - lo); }
    var nI = slider(ol, 'oln', 'Örnek sayısı n (aykırı dahil)', 5, 60, 1, 10), vI = slider(ol, 'olv', 'Aykırı değer', 55, 150, 1, 70);
    var og = el('div'); ol.appendChild(og);
    var om = el('div', 'metrics'); ol.appendChild(om);
    var on = el('div', 'callout idea'); ol.appendChild(on);
    var drawOl = function () {
      var n = +nI.value, v = +vI.value; document.getElementById('olno').textContent = n; document.getElementById('olvo').textContent = v;
      var xs = BASE.slice(0, n - 1).concat([v]), m = xs.reduce(function (s, x) { return s + x; }, 0) / n, sd = Math.sqrt(xs.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / (n - 1));
      var z = (v - m) / sd, bound = (n - 1) / Math.sqrt(n), s = xs.slice().sort(function (a, b) { return a - b; }), q1 = quant(s, 0.25), q3 = quant(s, 0.75), iqr = q3 - q1, hi = q3 + 1.5 * iqr, lo = q1 - 1.5 * iqr;
      var zf = Math.abs(z) > 3, qf = v > hi || v < lo, X = function (a) { return 20 + (a - 40) / 115 * 520; };
      var svg = '<svg style="width:100%;max-width:560px;height:auto;display:block;margin:12px 0" viewBox="0 0 560 80" role="img" aria-label="Değerler, IQR sınırları ve aykırı değer"><line class="d-line" x1="20" y1="40" x2="540" y2="40"/>';
      svg += '<rect x="' + X(Math.max(lo, 40)).toFixed(1) + '" y="28" width="' + Math.max(0, X(Math.min(hi, 155)) - X(Math.max(lo, 40))).toFixed(1) + '" height="24" style="fill:var(--brand-soft)"/>';
      xs.slice(0, n - 1).forEach(function (a) { svg += '<circle cx="' + X(a).toFixed(1) + '" cy="40" r="4" style="fill:var(--brand)"/>'; });
      svg += '<circle cx="' + X(v).toFixed(1) + '" cy="40" r="6" style="fill:var(--warn);stroke:var(--surface);stroke-width:2"/><text class="d-sm" x="20" y="74">40</text><text class="d-sm" x="540" y="74" text-anchor="end">155</text><text class="d-sm" x="280" y="14" text-anchor="middle">açık mavi bant: IQR sınırları içi · turuncu: aykırı aday</text></svg>';
      og.innerHTML = svg;
      om.innerHTML = '<div class="metric"><b>' + n2(z) + '</b>aykırının z-skoru (örnek std ile)</div><div class="metric"><b>' + n2(bound) + '</b>bu n’de ulaşılabilecek en büyük |z| = (n−1)/√n</div><div class="metric"><b>' + (zf ? 'Yakalar' : 'Kaçırır') + '</b>|z| &gt; 3 kuralı</div><div class="metric"><b>' + (qf ? 'Yakalar' : 'Kaçırır') + '</b>IQR kuralı (Q1 − 1,5·IQR, Q3 + 1,5·IQR: ' + n1(lo) + ' ile ' + n1(hi) + ')</div>';
      on.innerHTML = bound <= 3 ? '<b>Bu n’de |z| &gt; 3 kuralı aykırıyı asla yakalayamaz.</b> n = ' + n + ' iken örnek z-skorunun alabileceği en büyük değer ' + n2(bound) + '’dir; aykırı ne kadar büyük olursa olsun z 3’ü geçemez. IQR kuralı ise ' + (qf ? 'aykırıyı yakalıyor.' : 'bu değerde henüz sınırın içinde; değeri büyüt.') + ' Notun “|z| > 3” kuralı normal dağılım ve yeterince büyük örnek varsayar.' : '<b>Yeterince büyük n’de iki kural da çalışabilir.</b> n = ' + n + ' için z-skorunun üst sınırı ' + n2(bound) + ' ve bu örnekte aykırının z-skoru ' + n2(z) + ': z kuralı ' + (zf ? 'yakalıyor' : 'henüz yakalamıyor') + ', IQR kuralı ' + (qf ? 'yakalıyor' : 'henüz yakalamıyor') + '. Aykırı değer ortalamayı ve std’yi de şişirdiği için z-skoru kendini gizler; IQR bundan etkilenmez.';
    };
    [nI, vI].forEach(function (i) { i.addEventListener('input', drawOl); });
    drawOl();
  }

  /* ---------- 2) Ridge, Lasso, ElasticNet: katsayı büzülmesi (ortonormal tasarım) ---------- */
  var rl = document.getElementById('reglab');
  if (rl) {
    var B = [3.0, 1.5, 0.6, 0.2, -0.1], NM = ['β₁', 'β₂', 'β₃', 'β₄', 'β₅'];
    var lI = slider(rl, 'rgl', 'Ceza şiddeti λ', 0, 3, 0.1, 0.6), aI = slider(rl, 'rga', 'ElasticNet α (1 = Lasso, 0 = Ridge)', 0, 1, 0.1, 0.5);
    var rg = el('div'); rl.appendChild(rg);
    var rm = el('div', 'metrics'); rl.appendChild(rm);
    var rn = el('div', 'callout idea'); rl.appendChild(rn);
    var soft = function (b, t) { return Math.sign(b) * Math.max(Math.abs(b) - t, 0); };
    var drawRg = function () {
      var lam = +lI.value, al = +aI.value; document.getElementById('rglo').textContent = String(lam).replace('.', ','); document.getElementById('rgao').textContent = String(al).replace('.', ',');
      var ridge = B.map(function (b) { return b / (1 + lam); }), lasso = B.map(function (b) { return soft(b, lam / 2); }), en = B.map(function (b) { return soft(b, lam * al / 2) / (1 + lam * (1 - al)); });
      var cols = ['--line', '--brand', '--warn', '--ok'], sets = [B, ridge, lasso, en], svg = '<svg style="width:100%;max-width:560px;height:auto;display:block;margin:12px 0" viewBox="0 0 560 190" role="img" aria-label="Katsayıların yöntemlere göre büyüklüğü"><line class="d-line" x1="30" y1="140" x2="540" y2="140"/>';
      B.forEach(function (b, j) {
        sets.forEach(function (st, k) { var h = Math.abs(st[j]) / 3 * 100, x = 40 + j * 100 + k * 20, up = st[j] >= 0; svg += '<rect x="' + x + '" y="' + (up ? 140 - h : 140).toFixed(1) + '" width="16" height="' + h.toFixed(1) + '" style="fill:var(' + cols[k] + ')"/>'; });
        svg += '<text class="d-sm" x="' + (40 + j * 100 + 32) + '" y="160" text-anchor="middle">' + NM[j] + '</text>';
      });
      svg += '<text class="d-sm" x="30" y="184">gri: OLS (cezasız) · mavi: Ridge · turuncu: Lasso · yeşil: ElasticNet (sütun yüksekliği = |katsayı|, β₅ negatif olduğundan aşağı)</text></svg>';
      rg.innerHTML = svg;
      var zc = function (a) { return a.filter(function (x) { return Math.abs(x) < 1e-12; }).length; };
      rm.innerHTML = '<div class="metric"><b>' + B.join(' · ').replace(/\./g, ',') + '</b>OLS katsayıları</div><div class="metric"><b>' + ridge.map(n2).join(' · ') + '</b>Ridge (β / (1 + λ)); sıfır: ' + zc(ridge) + '</div><div class="metric"><b>' + lasso.map(n2).join(' · ') + '</b>Lasso (|β| − λ/2, sıfırda kesilir); sıfır: ' + zc(lasso) + '</div><div class="metric"><b>' + en.map(n2).join(' · ') + '</b>ElasticNet; sıfır: ' + zc(en) + '</div>';
      rn.innerHTML = '<b>Ridge katsayıları küçültür ama hiçbirini sıfırlamaz; Lasso küçük katsayıları tam sıfıra indirir (değişken seçimi).</b> λ = ' + String(lam).replace('.', ',') + ' iken Lasso ' + zc(lasso) + ' katsayıyı sıfırlıyor, Ridge hepsini oransal olarak ' + n2(1 / (1 + lam)) + ' katına çekiyor. ElasticNet α = ' + String(al).replace('.', ',') + ' ile Lasso ve Ridge arasında ayarlanır: α = 1’de Lasso, α = 0’da Ridge ile aynı sonucu verir. Bu hesap, değişkenlerin birbirine dik (ortonormal) olduğu özel durum içindir; gerçek veride korelasyon varsa sonuçlar farklıdır. Katsayılar bu sitenin örneğidir.';
    };
    [lI, aI].forEach(function (i) { i.addEventListener('input', drawRg); });
    drawRg();
  }

  /* ---------- 3) Adalet ölçütleri: demografik parite ve eşitlenmiş olasılık ---------- */
  var fl = document.getElementById('fairlab');
  if (fl) {
    var bI = slider(fl, 'frb', 'B grubunun gerçek pozitif oranı (%)', 10, 60, 5, 20), tI = slider(fl, 'frt', 'Karar eşiği (puan > t ise olumlu)', -1, 1, 0.1, 0), dI = slider(fl, 'frd', 'B grubunun puanlarındaki kayma δ', 0, 1, 0.1, 0);
    var ft = el('div', 'scroll-x'); fl.appendChild(ft);
    var fm = el('div', 'metrics'); fl.appendChild(fm);
    var fn = el('div', 'callout idea'); fl.appendChild(fn);
    var drawFr = function () {
      var pB = +bI.value / 100, t = +tI.value, d = +dI.value, pA = 0.5;
      document.getElementById('frbo').textContent = Math.round(pB * 100); document.getElementById('frto').textContent = String(t).replace('.', ','); document.getElementById('frdo').textContent = String(d).replace('.', ',');
      function grp(p, shift) { var tpr = 1 - Phi(t - (1 - shift)), fpr = 1 - Phi(t - (-1 - shift)); return { p: p, tpr: tpr, fpr: fpr, sel: p * tpr + (1 - p) * fpr }; }
      var A = grp(pA, 0), Bg = grp(pB, d), dp = Math.abs(A.sel - Bg.sel), eo = Math.max(Math.abs(A.tpr - Bg.tpr), Math.abs(A.fpr - Bg.fpr));
      ft.innerHTML = '<table class="cmp"><thead><tr><th>Grup</th><th>Gerçek pozitif oranı</th><th>Olumlu karar oranı</th><th>TPR (pozitifi yakalama)</th><th>FPR (negatife yanlış olumlu)</th></tr></thead><tbody><tr><td>A</td><td>' + pc(A.p) + '</td><td>' + pc(A.sel) + '</td><td>' + pc(A.tpr) + '</td><td>' + pc(A.fpr) + '</td></tr><tr><td>B</td><td>' + pc(Bg.p) + '</td><td>' + pc(Bg.sel) + '</td><td>' + pc(Bg.tpr) + '</td><td>' + pc(Bg.fpr) + '</td></tr></tbody></table>';
      fm.innerHTML = '<div class="metric"><b>' + n3(dp) + '</b>demografik parite farkı |P(ŷ=1|A) − P(ŷ=1|B)|</div><div class="metric"><b>' + n3(eo) + '</b>eşitlenmiş olasılık farkı: en büyük |TPR farkı|, |FPR farkı|</div>';
      fn.innerHTML = (eo < 1e-9 && dp > 0.005) ? '<b>Eşitlenmiş olasılık sağlanıyor ama demografik parite bozuk.</b> İki grupta model puanları aynı dağılıyor, yani TPR ve FPR eşit; ama gerçek pozitif oranı farklı (%' + Math.round(pB * 100) + ' ve %50) olduğundan olumlu karar oranları ' + pc(A.sel) + ' ve ' + pc(Bg.sel) + '. Gruplar arasında gerçek oran farkı varsa iki ölçütü birden sıfıra indirmek genelde mümkün olmaz.' : (eo < 1e-9 && dp <= 0.005) ? '<b>İki ölçüt de sağlanıyor (gerçek oranlar eşit, puanlar eşit dağılıyor).</b> B grubunun gerçek pozitif oranını ya da kaymayı değiştirince ölçütler ayrışır.' : '<b>Eşitlenmiş olasılık da bozuldu.</b> B grubunun puanları ' + String(d).replace('.', ',') + ' kadar aşağı kaydığı için B’nin pozitiflerini yakalama oranı ' + pc(Bg.tpr) + ', A’nın ' + pc(A.tpr) + '. Bu, notun “algoritmik ayrımcılık” örneğidir: aynı niteliğe farklı davranılıyor. Bu sitenin sanal modeli: pozitiflerin puanı N(+1,1), negatiflerin N(−1,1).';
    };
    [bI, tI, dI].forEach(function (i) { i.addEventListener('input', drawFr); });
    drawFr();
  }
})();
