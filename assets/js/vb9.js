/* Veri Bilimi · Bölüm 9: metrik seçimi ve model sıralaması (AutoML), açık veriden yararlanma eşitsizliği, çoklu test ve sahte keşif.
   Tüm veriler bu site için üretilmiş sanal verilerdir. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function n2(x) { return (Math.round(x * 100) / 100).toFixed(2).replace('.', ','); }
  function n3(x) { return (Math.round(x * 1000) / 1000).toFixed(3).replace('.', ','); }
  function pc(x) { return '%' + (Math.round(x * 10) / 10).toString().replace('.', ','); }
  function slider(parent, id, label, min, max, step, val) {
    var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>';
    parent.appendChild(r); return r.querySelector('input');
  }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function gauss(r) { var u = r() || 1e-9, v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function erfc(x) { var z = Math.abs(x), t = 1 / (1 + 0.5 * z), r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))); return x >= 0 ? r : 2 - r; }

  /* ---------- 1) Metrik seçimi sıralamayı değiştirir ---------- */
  var ml = document.getElementById('metriclab');
  if (ml) {
    var MODELS = [['A', 30, 10, 20, 940], ['B', 45, 60, 5, 890], ['C', 40, 25, 10, 925], ['D', 0, 0, 50, 950]];   // ad, TP, FP, FN, TN (1000 örnek, 50 pozitif)
    var METS = [['Doğruluk', function (m) { return (m[1] + m[4]) / 1000; }], ['Kesinlik', function (m) { return m[1] + m[2] ? m[1] / (m[1] + m[2]) : 0; }], ['Duyarlılık', function (m) { return m[1] / (m[1] + m[3]); }], ['F1', function (m) { var p = m[1] + m[2] ? m[1] / (m[1] + m[2]) : 0, r = m[1] / (m[1] + m[3]); return p + r ? 2 * p * r / (p + r) : 0; }]];
    var mi = 0, mb = el('div', 'chips'); ml.appendChild(mb);
    var mbs = METS.map(function (m, k) { var b = el('button', 'chip', m[0]); b.type = 'button'; b.addEventListener('click', function () { mi = k; drawMt(); }); mb.appendChild(b); return b; });
    var mt = el('div', 'scroll-x'); ml.appendChild(mt);
    var mn = el('div', 'callout idea'); ml.appendChild(mn);
    var drawMt = function () {
      mbs.forEach(function (b, k) { b.setAttribute('aria-pressed', k === mi ? 'true' : 'false'); });
      var vals = MODELS.map(function (m) { return METS.map(function (x) { return x[1](m); }); });
      var order = MODELS.map(function (m, i) { return i; }).sort(function (a, b) { return vals[b][mi] - vals[a][mi]; });
      var h = '<table class="cmp"><thead><tr><th>Sıra</th><th>Model</th><th>TP</th><th>FP</th><th>FN</th><th>TN</th>' + METS.map(function (x, k) { return '<th' + (k === mi ? ' style="background:var(--brand-soft)"' : '') + '>' + x[0] + '</th>'; }).join('') + '</tr></thead><tbody>';
      order.forEach(function (i, r) { var m = MODELS[i]; h += '<tr><td>' + (r + 1) + '</td><td><b>' + m[0] + '</b></td><td>' + m[1] + '</td><td>' + m[2] + '</td><td>' + m[3] + '</td><td>' + m[4] + '</td>' + vals[i].map(function (v, k) { return '<td' + (k === mi ? ' style="background:var(--brand-soft)"' : '') + '>' + n3(v) + '</td>'; }).join('') + '</tr>'; });
      mt.innerHTML = h + '</tbody></table>';
      var winners = METS.map(function (x, k) { var b = 0; vals.forEach(function (v, i) { if (v[k] > vals[b][k]) b = i; }); return x[0] + ': ' + MODELS[b][0]; }).join(' · ');
      mn.innerHTML = '<b>Seçilen metrik: ' + METS[mi][0] + ' → birinci model ' + MODELS[order[0]][0] + '.</b> Metriğe göre birinci: ' + winners + '. Aynı dört model, metrik değişince farklı sıralanıyor; “en iyi model” metrikten bağımsız söylenemez. Model D hiç pozitif yakalamıyor (duyarlılık 0) ama doğruluğu %95 görünüyor, çünkü 1000 örneğin 950’si negatif. Notun “ROC-AUC mi F1 mi” uyarısının sayıyla gösterimi; ROC-AUC burada hesaplanmadı, çünkü olasılık skoru yok. Sayılar bu sitenin sanal sonuçlarıdır.';
    };
    drawMt();
  }

  /* ---------- 2) Açık veri: erişim eşit yararlanma demek değildir ---------- */
  var dl = document.getElementById('opendatalab');
  if (dl) {
    var G = [['Büyük şirket', 0.9], ['Üniversite', 0.6], ['Yerel topluluk / STK', 0.2]];
    var aI = slider(dl, 'oda', 'Veriye erişim açıklığı (%)', 0, 100, 10, 100), gI = slider(dl, 'odg', 'Kapasite geliştirme yatırımı (%)', 0, 100, 10, 0);
    var dg = el('div'); dl.appendChild(dg);
    var dm = el('div', 'metrics'); dl.appendChild(dm);
    var dn = el('div', 'callout idea'); dl.appendChild(dn);
    var drawOd = function () {
      var a = +aI.value / 100, g = +gI.value / 100; document.getElementById('odao').textContent = Math.round(a * 100); document.getElementById('odgo').textContent = Math.round(g * 100);
      var cap = G.map(function (x) { return x[1] + g * (0.9 - x[1]); }), ben = cap.map(function (c) { return a * c; }), tot = ben.reduce(function (s, x) { return s + x; }, 0);
      var svg = '<svg style="width:100%;max-width:560px;height:auto;display:block;margin:12px 0" viewBox="0 0 560 130" role="img" aria-label="Gruplara göre yararlanma">';
      G.forEach(function (x, i) { var y = 8 + i * 40; svg += '<text class="d-sm" x="0" y="' + (y + 14) + '">' + x[0] + '</text><rect x="150" y="' + y + '" width="' + (ben[i] * 380).toFixed(1) + '" height="22" rx="4" style="fill:var(' + (i === 2 ? '--warn' : '--brand') + ')"/><text class="d-sm" x="' + (156 + ben[i] * 380).toFixed(1) + '" y="' + (y + 16) + '">' + n2(ben[i]) + '</text>'; });
      dg.innerHTML = svg + '</svg>';
      dm.innerHTML = '<div class="metric"><b>' + cap.map(n2).join(' · ') + '</b>analiz kapasitesi: şirket · üniversite · topluluk</div><div class="metric"><b>' + n2(tot) + '</b>toplam yararlanma (erişim × kapasite)</div><div class="metric"><b>' + pc(ben[2] / (tot || 1) * 100) + '</b>topluluğun toplam yararlanmadaki payı</div><div class="metric"><b>' + (ben[2] > 0 ? n2(ben[0] / ben[2]) + ' kat' : '—') + '</b>şirketin topluluğa göre yararlanması</div>';
      dn.innerHTML = a === 0 ? '<b>Erişim kapalı: kimse yararlanamıyor.</b> Erişimi açınca yararlanma erişimle birlikte artar.' : g === 0 ? '<b>Erişim eşit, yararlanma eşit değil.</b> Veri herkese açık (%' + Math.round(a * 100) + ') ama topluluğun payı yalnızca ' + pc(ben[2] / tot * 100) + '; şirket topluluğun ' + n2(ben[0] / ben[2]) + ' katı yararlanıyor. Notun uyarısı: “veriye erişim imkânı artsa bile analiz kapasitesindeki eşitsizlikler sürebilir”.' : '<b>Kapasite geliştirme açığı kapatıyor.</b> Yatırım %' + Math.round(g * 100) + ' iken topluluğun payı ' + pc(ben[2] / tot * 100) + ', şirketin ' + n2(ben[0] / ben[2]) + ' katına düştü. Yatırım %100 olunca üç grup eşitlenir. Bu, notun “eşzamanlı eğitim ve kapasite geliştirme” önerisinin basit bir modeli; kapasite sayıları bu sitenin varsayımıdır.';
    };
    [aI, gI].forEach(function (i) { i.addEventListener('input', drawOd); });
    drawOd();
  }

  /* ---------- 3) Çoklu test: çok değişken, teori yok → sahte keşif ---------- */
  var tl = document.getElementById('multilab');
  if (tl) {
    var N = 20, EFF = 1.0, MAXM = 2000, r3 = rng(20261025), Z0 = [], Z1 = [];
    var se = Math.sqrt(2 / N);
    for (var i = 0; i < MAXM; i++) { var a = 0, b = 0; for (var k = 0; k < N; k++) { a += gauss(r3); b += gauss(r3); } Z0.push((a / N - b / N) / se); }
    for (var j = 0; j < 20; j++) { var a2 = 0, b2 = 0; for (var k2 = 0; k2 < N; k2++) { a2 += gauss(r3) + EFF; b2 += gauss(r3); } Z1.push((a2 / N - b2 / N) / se); }
    var mI = slider(tl, 'mtm', 'Test edilen gen sayısı m', 50, MAXM, 50, 1000), kI = slider(tl, 'mtk', 'Gerçekten etkili gen sayısı', 0, 20, 1, 5);
    var ab = el('div', 'chips'); tl.appendChild(ab); var al = 0.05;
    var abs = [0.01, 0.05, 0.1].map(function (v) { var b = el('button', 'chip', 'α = ' + String(v).replace('.', ',')); b.type = 'button'; b.addEventListener('click', function () { al = v; drawMu(); }); ab.appendChild(b); return b; });
    var tm = el('div', 'metrics'); tl.appendChild(tm);
    var tn = el('div', 'callout idea'); tl.appendChild(tn);
    var drawMu = function () {
      var m = +mI.value, kk = +kI.value; document.getElementById('mtmo').textContent = m; document.getElementById('mtko').textContent = kk;
      abs.forEach(function (b, q) { b.setAttribute('aria-pressed', [0.01, 0.05, 0.1][q] === al ? 'true' : 'false'); });
      var nullN = m - kk, raw = 0, rawFalse = 0, bon = 0, bonFalse = 0, realRaw = 0, realBon = 0, bth = al / m;
      for (var i = 0; i < nullN; i++) { var p = erfc(Math.abs(Z0[i]) / Math.SQRT2); if (p < al) { raw++; rawFalse++; } if (p < bth) { bon++; bonFalse++; } }
      for (var j = 0; j < kk; j++) { var p2 = erfc(Math.abs(Z1[j]) / Math.SQRT2); if (p2 < al) { raw++; realRaw++; } if (p2 < bth) { bon++; realBon++; } }
      tm.innerHTML = '<div class="metric"><b>' + raw + ' (' + rawFalse + ' sahte)</b>düzeltmesiz “anlamlı” gen sayısı</div><div class="metric"><b>' + n2((m - kk) * al) + '</b>beklenen sahte keşif = (m − etkili) × α</div><div class="metric"><b>' + bon + ' (' + bonFalse + ' sahte)</b>Bonferroni düzeltmeli (eşik α/m = ' + (al / m).toExponential(1).replace('.', ',').replace('e-', '·10⁻') + ')</div><div class="metric"><b>' + realRaw + ' → ' + realBon + ' / ' + kk + '</b>gerçek etkiden yakalanan: düzeltmesiz → düzeltmeli</div>';
      tn.innerHTML = '<b>Çok sayıda hipotezi tek tek test edersen sahte keşif kaçınılmazdır.</b> ' + (m - kk) + ' etkisiz genden α = ' + String(al).replace('.', ',') + ' ile beklenen ' + n2((m - kk) * al) + ' tanesi “anlamlı” çıkar; bu sürümde ' + rawFalse + '. Bonferroni eşiği α/m’e çekince sahte keşif ' + bonFalse + ' olur' + (kk ? ', ama gerçek etkilerden daha azını yakalarsın (' + realRaw + ' yerine ' + realBon + ' / ' + kk + ')' : ' (hiç gerçek etki yok, yakalanacak bir şey de yok)') + '. Notun “teoriden yoksun analizler biyolojik anlam taşımayan korelasyonlar bulabilir” uyarısının sayısal hâli. Veri sanal: her gen için 20’şer kişilik iki grup, etkili genlerde 1σ ortalama farkı (bu site için üretildi).';
    };
    [mI, kI].forEach(function (i) { i.addEventListener('input', drawMu); });
    drawMu();
  }
})();
