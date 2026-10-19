/* Görüntü İşleme · Bölüm 6: frekans alanında filtreleme laboratuvarı (alçak/yüksek geçiren, notch; ideal, Butterworth, Gauss).
   Görüntü bu site için kodla üretilen 32×32 sentetik bir sahnedir; üzerine düzenli (periyodik) bir şerit paraziti eklenmiştir. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  var N = 32, SC = 5, PI2 = 2 * Math.PI;
  var box = document.getElementById('freqlab');
  if (!box) return;

  function clamp(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }
  var clean = [], noisy = [], y, x;
  for (y = 0; y < N; y++) { clean.push([]); noisy.push([]); for (x = 0; x < N; x++) { var v = x < 16 ? 70 : 170; if (x >= 6 && x < 12 && y >= 6 && y < 12) v = 235; if (x >= 20 && x < 26 && y >= 20 && y < 26) v = 20; clean[y].push(v); noisy[y].push(clamp(v + 35 * Math.sin(PI2 * 6 * x / N))); } }

  var COS = [], SIN = [], k, n;
  for (k = 0; k < N; k++) { COS.push([]); SIN.push([]); for (n = 0; n < N; n++) { COS[k].push(Math.cos(PI2 * k * n / N)); SIN[k].push(Math.sin(PI2 * k * n / N)); } }
  // satır sonra sütun DFT (ayrılabilir)
  function dft2(re, im, inv) {
    var s = inv ? -1 : 1, R1 = [], I1 = [], i, j, m;
    for (i = 0; i < N; i++) { R1.push([]); I1.push([]); for (j = 0; j < N; j++) { var a = 0, b = 0; for (m = 0; m < N; m++) { var c = COS[j][m], sn = s * -SIN[j][m]; a += re[i][m] * c - im[i][m] * sn; b += re[i][m] * sn + im[i][m] * c; } R1[i].push(a); I1[i].push(b); } }
    var R2 = [], I2 = [];
    for (i = 0; i < N; i++) { R2.push([]); I2.push([]); for (j = 0; j < N; j++) { var a2 = 0, b2 = 0; for (m = 0; m < N; m++) { var c2 = COS[i][m], s2 = s * -SIN[i][m]; a2 += R1[m][j] * c2 - I1[m][j] * s2; b2 += R1[m][j] * s2 + I1[m][j] * c2; } R2[i].push(a2); I2[i].push(b2); } }
    return { re: R2, im: I2 };
  }
  var zero = []; for (y = 0; y < N; y++) zero.push(new Array(N).fill(0));
  var F = dft2(noisy, zero, false);

  var type = 'lp', shape = 'gauss', d0 = 8;
  function freq(u) { return u <= N / 2 ? u : u - N; }
  function H(u, v) {
    var fu = freq(u), fv = freq(v), D = Math.sqrt(fu * fu + fv * fv), lp;
    if (type === 'notch') {
      var d1 = Math.sqrt(fu * fu + (fv - 6) * (fv - 6)), d2 = Math.sqrt(fu * fu + (fv + 6) * (fv + 6)), r = Math.max(1, d0 / 4);
      var rej = function (d) { return shape === 'ideal' ? (d <= r ? 0 : 1) : shape === 'butter' ? 1 / (1 + Math.pow(r / Math.max(d, 1e-6), 4)) : 1 - Math.exp(-(d * d) / (2 * r * r)); };
      return rej(d1) * rej(d2);
    }
    lp = shape === 'ideal' ? (D <= d0 ? 1 : 0) : shape === 'butter' ? 1 / (1 + Math.pow(D / d0, 4)) : Math.exp(-(D * D) / (2 * d0 * d0));
    return type === 'lp' ? lp : 1 - lp;
  }

  function group(label, items, cur, cb) {
    var wrap = el('div', 'chips'); wrap.appendChild(el('span', 'tip', label + ': '));
    items.forEach(function (it) { var b = el('button', 'chip', it[1]); b.type = 'button'; b.setAttribute('aria-pressed', it[0] === cur ? 'true' : 'false'); b.addEventListener('click', function () { cb(it[0]); }); wrap.appendChild(b); });
    return wrap;
  }
  var holder = el('div'); box.appendChild(holder);
  var r1 = el('div', 'slider-row'); r1.innerHTML = '<label for="fcut">Kesim D₀ / yarıçap</label><input id="fcut" type="range" min="2" max="16" step="1" value="8"><output id="fcuto">8</output>'; box.appendChild(r1);
  var row = el('div', 'filt-row'); box.appendChild(row);
  function mk() { var d = el('figure', 'filt-fig'), c = el('canvas'); c.width = N * SC; c.height = N * SC; d.appendChild(c); var cap = el('figcaption'); d.appendChild(cap); row.appendChild(d); return { c: c, cap: cap }; }
  var A = mk(), S = mk(), O = mk();
  var info = el('div', 'metrics'); box.appendChild(info);
  var note = el('div', 'callout idea'); box.appendChild(note);

  function gray(c, g, norm) {
    var ctx = c.getContext('2d'), lo = 0, hi = 255, i, j;
    if (norm) { lo = 1e9; hi = -1e9; for (i = 0; i < N; i++) for (j = 0; j < N; j++) { lo = Math.min(lo, g[i][j]); hi = Math.max(hi, g[i][j]); } }
    for (i = 0; i < N; i++) for (j = 0; j < N; j++) { var v = norm ? (g[i][j] - lo) / Math.max(hi - lo, 1e-6) * 255 : g[i][j]; v = Math.round(clamp(v)); ctx.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; ctx.fillRect(j * SC, i * SC, SC, SC); }
  }
  function render() {
    var Fr = [], Fi = [], u, v, max = 0, mag = [];
    for (u = 0; u < N; u++) { Fr.push([]); Fi.push([]); for (v = 0; v < N; v++) { var h = H(u, v); Fr[u].push(F.re[u][v] * h); Fi[u].push(F.im[u][v] * h); } }
    var inv = dft2(Fr, Fi, true), out = [], mse = 0;
    for (u = 0; u < N; u++) { out.push([]); for (v = 0; v < N; v++) { var val = inv.re[u][v] / (N * N); out[u].push(val); var d = clamp(val) - clean[u][v]; mse += d * d; } }
    mse /= N * N;
    // spektrum (merkezlenmiş, log) ve filtre maskesi
    var ctx = S.c.getContext('2d'), lm = 0;
    for (u = 0; u < N; u++) { mag.push([]); for (v = 0; v < N; v++) { var m = Math.log(1 + Math.sqrt(F.re[u][v] * F.re[u][v] + F.im[u][v] * F.im[u][v])); mag[u].push(m); lm = Math.max(lm, m); } }
    for (u = 0; u < N; u++) for (v = 0; v < N; v++) {
      var du = (u + N / 2) % N, dv = (v + N / 2) % N, g0 = Math.round(mag[u][v] / lm * 255), hh = H(u, v);
      var rr = Math.round(g0 * (0.25 + 0.75 * hh)), gg = Math.round(g0 * (0.25 + 0.75 * hh) * (type === 'notch' ? 1 : 1)), bb = Math.round(g0 * (0.25 + 0.75 * hh) + (1 - hh) * 70);
      ctx.fillStyle = 'rgb(' + rr + ',' + gg + ',' + Math.min(255, bb) + ')'; ctx.fillRect(dv * SC, du * SC, SC, SC);
    }
    gray(A.c, noisy, false); gray(O.c, out, type === 'hp');
    A.cap.textContent = 'Girdi (şerit parazitli)'; S.cap.textContent = 'Spektrum (mavi: bastırılan)'; O.cap.textContent = 'Sonuç';
    A.c.setAttribute('aria-label', 'Parazitli görüntü'); S.c.setAttribute('aria-label', 'Genlik spektrumu'); O.c.setAttribute('aria-label', 'Filtre sonucu');
    var mi = 0; for (u = 0; u < N; u++) for (v = 0; v < N; v++) { var dd = noisy[u][v] - clean[u][v]; mi += dd * dd; } mi /= N * N;
    info.innerHTML = '<div class="metric"><b>' + Math.round(mi) + '</b>girdi hatası (MSE)</div><div class="metric"><b>' + (type === 'hp' ? '–' : Math.round(mse)) + '</b>sonuç hatası (MSE)</div>';
    note.innerHTML = type === 'lp' ? '<b>Alçak geçiren:</b>yüksek frekansları kısar: ince doku ve şerit zayıflar, ama kenarlar da yumuşar. ' + (shape === 'ideal' ? '<b>İdeal</b> (keskin kesimli) filtre kenar çevresinde <b>halkalanma</b> (ringing, Gibbs etkisi) üretir; Butterworth ve Gauss ile karşılaştır.' : shape === 'butter' ? 'Butterworth geçişi yumuşatır; düzen arttıkça halkalanma eğilimi artar.' : 'Gauss filtre hem uzayda hem frekansta Gauss biçimlidir; halkalanma üretmez.') :
      type === 'hp' ? '<b>Yüksek geçiren:</b>düşük frekansları atar, yalnızca kenar ve ayrıntı kalır (görüntü gösterim için normalleştirildi). Keskinleştirmenin frekans alanı karşılığıdır.' :
      '<b>Notch (çentik):</b>spektrumda yalnızca şerit parazitinin iki parlak noktasını bastırır; kenarlar ve nesneler neredeyse bozulmaz. Periyodik parazitler için en uygun araçtır. Çentik yarıçapı D₀/4’tür: kaydırıcıyı küçültünce yalnızca parazit silinir, büyütünce nesne ayrıntısı da gider.';
  }
  function rebuild() {
    holder.innerHTML = '';
    holder.appendChild(group('Filtre', [['lp', 'Alçak geçiren'], ['hp', 'Yüksek geçiren'], ['notch', 'Notch']], type, function (v) { type = v; rebuild(); }));
    holder.appendChild(group('Biçim', [['ideal', 'İdeal'], ['butter', 'Butterworth'], ['gauss', 'Gauss']], shape, function (v) { shape = v; rebuild(); }));
    render();
  }
  r1.querySelector('input').addEventListener('input', function (e) { d0 = +e.target.value; document.getElementById('fcuto').textContent = d0; render(); });
  rebuild();
})();
