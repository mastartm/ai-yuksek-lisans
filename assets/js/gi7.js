/* Görüntü İşleme · Bölüm 7: çekirdek (kernel) gezgini, kenar işleme yöntemleri, medyan ile ortalama ve işlem maliyeti.
   Görüntü ve sayılar bu site için üretilmiştir (32×32 sentetik sahne). */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function fx(x, d) { var k = Math.pow(10, d == null ? 2 : d); return (Math.round(x * k) / k).toString().replace('.', ','); }
  function clamp(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }
  function sl(root, id, label, min, max, step, val, cb) { var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>'; root.appendChild(r); var i = r.querySelector('input'); i.addEventListener('input', cb); return i; }

  /* ---------- 1) Çekirdek gezgini ---------- */
  (function kernelLab() {
    var root = document.getElementById('kernlab');
    if (!root) return;
    var S = 32, SC = 4, g = [], y, x;
    for (y = 0; y < S; y++) { g.push([]); for (x = 0; x < S; x++) { var v = 70; if (x >= 5 && x < 13 && y >= 5 && y < 13) v = 220; var dx = x - 23, dy = y - 9; if (dx * dx + dy * dy < 30) v = 190; if (Math.abs((x - 4) - (y - 16)) <= 0 && x > 4 && y > 16) v = 230; if (y >= 24) v = 40 + (x / S) * 190; g[y].push(v); } }
    var K = {
      mean: ['Ortalama 3×3 (alçak geçiren)', [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]], 'lp'],
      gauss: ['Gauss 3×3 (alçak geçiren)', [[1 / 16, 2 / 16, 1 / 16], [2 / 16, 4 / 16, 2 / 16], [1 / 16, 2 / 16, 1 / 16]], 'lp'],
      hp: ['Basit yüksek geçiren', [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]], 'edge'],
      lap: ['Laplace tabanlı', [[0, -1, 0], [-1, 4, -1], [0, -1, 0]], 'edge'],
      sharp: ['Keskinleştirme', [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], 'lp'],
      sobx: ['Sobel X (dikey kenarlar)', [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], 'edge'],
      soby: ['Sobel Y (yatay kenarlar)', [[-1, -2, -1], [0, 0, 0], [1, 2, 1]], 'edge'],
      prex: ['Prewitt X', [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], 'edge']
    };
    var cur = 'mean';
    var bar = el('div', 'chips'); root.appendChild(bar);
    Object.keys(K).forEach(function (k) { var b = el('button', 'chip', K[k][0]); b.type = 'button'; b.dataset.k = k; b.addEventListener('click', function () { cur = k; draw(); }); bar.appendChild(b); });
    var bm = el('button', 'chip', 'Sobel büyüklük √(Gx² + Gy²)'); bm.type = 'button'; bm.dataset.k = 'mag'; bm.addEventListener('click', function () { cur = 'mag'; draw(); }); bar.appendChild(bm);
    var mat = el('div', 'scroll-x'); root.appendChild(mat);
    var imgs = el('div'); imgs.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;margin:10px 0'; root.appendChild(imgs);
    var cA = el('canvas'), cB = el('canvas'); [cA, cB].forEach(function (c) { c.width = S * SC; c.height = S * SC; c.style.cssText = 'border:1px solid var(--line);border-radius:6px;max-width:100%;height:auto;image-rendering:pixelated'; imgs.appendChild(c); });
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function px(a, yy, xx) { yy = yy < 0 ? 0 : yy >= S ? S - 1 : yy; xx = xx < 0 ? 0 : xx >= S ? S - 1 : xx; return a[yy][xx]; }
    function conv(k) { var o = [], yy, xx, i, j; for (yy = 0; yy < S; yy++) { o.push([]); for (xx = 0; xx < S; xx++) { var s = 0; for (i = -1; i <= 1; i++) for (j = -1; j <= 1; j++) s += k[i + 1][j + 1] * px(g, yy + i, xx + j); o[yy].push(s); } } return o; }
    function show(cv, a, type) {
      var c = cv.getContext('2d'), yy, xx, mx = 0, mn = 1e9;
      for (yy = 0; yy < S; yy++) for (xx = 0; xx < S; xx++) { mx = Math.max(mx, a[yy][xx]); mn = Math.min(mn, a[yy][xx]); }
      for (yy = 0; yy < S; yy++) for (xx = 0; xx < S; xx++) { var v = type === 'edge' ? clamp(Math.abs(a[yy][xx]) / (Math.max(Math.abs(mx), Math.abs(mn)) || 1) * 255) : clamp(a[yy][xx]); v = Math.round(v); c.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; c.fillRect(xx * SC, yy * SC, SC, SC); }
      return [mn, mx];
    }
    function draw() {
      Array.prototype.forEach.call(bar.children, function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === cur)); });
      var out, type, kmat, sum, rng;
      if (cur === 'mag') { var a = conv(K.sobx[1]), b = conv(K.soby[1]); out = a.map(function (r, i) { return r.map(function (v, j) { return Math.sqrt(v * v + b[i][j] * b[i][j]); }); }); type = 'edge'; kmat = null; sum = 0; }
      else { kmat = K[cur][1]; type = K[cur][2]; out = conv(kmat); sum = 0; kmat.forEach(function (r) { r.forEach(function (v) { sum += v; }); }); }
      show(cA, g, 'lp'); rng = show(cB, out, type);
      mat.innerHTML = kmat ? '<table class="cmp"><tbody>' + kmat.map(function (r) { return '<tr>' + r.map(function (v) { return '<td class="mono">' + (Math.abs(v - Math.round(v)) < 1e-9 ? Math.round(v) : fx(v, 3)) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>' : '<p>İki Sobel çıktısının büyüklüğü: her piksel için √(Gx² + Gy²). Kenar yönü ne olursa olsun kenarlar belirir.</p>';
      info.innerHTML = '<div class="metric"><b>' + (kmat ? fx(sum, 2) : '–') + '</b>çekirdek toplamı</div><div class="metric"><b>' + fx(rng[0], 0) + ' … ' + fx(rng[1], 0) + '</b>ham çıktı aralığı</div>';
      note.innerHTML = cur === 'mag' ? 'Sobel X dikey, Sobel Y yatay kenarları bulur; büyüklük ikisini birleştirir. Sağdaki görüntü gösterim için en büyük değere göre ölçeklenmiştir.' : (type === 'edge' ? '<b>Toplamı sıfır (ya da sıfıra yakın) çekirdek.</b> Düz bölgelerde sonuç 0 olur, yalnızca değişimin olduğu yerde değer çıkar. Pozitif ve negatif ağırlıklar birlikte kenarı vurgular. Sağdaki görüntü, çıktının mutlak değerinin ölçeklenmiş hâlidir.' : (cur === 'sharp' ? '<b>Toplamı 1 olan keskinleştirme çekirdeği.</b> Düz bölgeler korunur, kenarlar vurgulanır.' : '<b>Toplamı 1 olan pozitif ağırlıklı çekirdek.</b> Genel parlaklık korunur, kenarlar ve ince detaylar yumuşar.'));
    }
    draw();
  })();

  /* ---------- 2) Kenar işleme ---------- */
  (function borderLab() {
    var root = document.getElementById('bordlab');
    if (!root) return;
    var F = [[10, 20, 30, 40, 50], [15, 25, 35, 45, 55], [20, 30, 40, 50, 60], [25, 35, 45, 55, 65], [30, 40, 50, 60, 70]], N = 5, mean = 40, cur = 'rep';
    var M = [['crop', 'Kırpma (crop)'], ['zero', 'Sıfır doldurma'], ['const', 'Sabit doldurma (ortalama)'], ['rep', 'Kopyalama (replicate)'], ['sym', 'Simetrik aynalama'], ['anti', 'Antisimetrik aynalama'], ['wrap', 'Sarma (wrap)']];
    var bar = el('div', 'chips'); root.appendChild(bar);
    M.forEach(function (m) { var b = el('button', 'chip', m[1]); b.type = 'button'; b.dataset.k = m[0]; b.addEventListener('click', function () { cur = m[0]; draw(); }); bar.appendChild(b); });
    var iR = sl(root, 'bdr', 'Piksel satırı', 0, 4, 1, 0, draw), iC = sl(root, 'bdc', 'Piksel sütunu', 0, 4, 1, 0, draw);
    var tb = el('div', 'scroll-x'); root.appendChild(tb);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function val(r, c) {
      var inside = r >= 0 && r < N && c >= 0 && c < N;
      if (inside) return F[r][c];
      if (cur === 'zero') return 0;
      if (cur === 'const') return mean;
      if (cur === 'rep') return F[Math.min(N - 1, Math.max(0, r))][Math.min(N - 1, Math.max(0, c))];
      if (cur === 'wrap') return F[((r % N) + N) % N][((c % N) + N) % N];
      var rr = r < 0 ? -r : r > N - 1 ? 2 * (N - 1) - r : r, cc = c < 0 ? -c : c > N - 1 ? 2 * (N - 1) - c : c, sg = 1;
      if (cur === 'anti') { if (r < 0 || r > N - 1) sg *= -1; if (c < 0 || c > N - 1) sg *= -1; }
      return sg * F[rr][cc];
    }
    function draw() {
      Array.prototype.forEach.call(bar.children, function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === cur)); });
      var r = +iR.value, c = +iC.value; document.getElementById('bdro').textContent = r; document.getElementById('bdco').textContent = c;
      var rows = '', sum = 0, undef = false, i, j;
      for (i = -1; i <= 1; i++) { rows += '<tr>'; for (j = -1; j <= 1; j++) { var rr = r + i, cc = c + j, out = rr < 0 || rr >= N || cc < 0 || cc >= N; var v = (cur === 'crop' && out) ? null : val(rr, cc); if (v === null) undef = true; else sum += v; rows += '<td' + (out ? ' style="background:var(--warn-soft)"' : '') + '>' + (v === null ? '–' : v) + '</td>'; } rows += '</tr>'; }
      tb.innerHTML = '<table class="cmp"><caption style="text-align:left">Seçili pikselin (' + r + ', ' + c + ') 3×3 komşuluğu; sarı hücreler görüntü dışından gelen değerler</caption><tbody>' + rows + '</tbody></table>';
      info.innerHTML = '<div class="metric"><b>' + F[r][c] + '</b>özgün piksel değeri</div><div class="metric"><b>' + (undef ? 'hesaplanamaz' : fx(sum / 9, 1)) + '</b>3×3 ortalama filtre çıktısı</div><div class="metric"><b>' + (cur === 'crop' ? '3 × 3' : '5 × 5') + '</b>çıktı görüntüsü boyutu (5×5 girdi)</div>';
      var msg = { crop: 'Kırpma: kenar pikselleri işlem dışı bırakılır; çıktı (N−k+1) × (M−k+1) boyutuna küçülür.', zero: 'Sıfır doldurma: sınır dışı 0 sayılır; kenar bölgelerde düşük değerler üretilebilir, kenar tespit filtrelerinde kenar vurgusunu artırır.', const: 'Sabit doldurma: genellikle görüntünün ortalama piksel değeri (burada 40) seçilir.', rep: 'Kopyalama: en yakın kenar pikseli tekrarlanır: f(−1, y) = f(0, y).', sym: 'Simetrik aynalama: f(−1, y) = f(1, y); kenardan simetrik yansıtılır.', anti: 'Antisimetrik aynalama: f(−1, y) = −f(1, y); yansıyan değerin işareti değişir.', wrap: 'Sarma: görüntü halka gibi sayılır; bir kenardan çıkan değer karşı kenardan devam eder: f(−1, y) = f(N−1, y).' };
      note.innerHTML = msg[cur] + (r > 0 && r < 4 && c > 0 && c < 4 ? ' <b>Seçili piksel iç bölgede olduğu için tüm yöntemler aynı sonucu verir;</b> farkı görmek için satır ve sütunu 0 ya da 4 yap.' : '');
    }
    draw();
  })();

  /* ---------- 3) Medyan ile ortalama ---------- */
  (function medianLab() {
    var root = document.getElementById('medlab7');
    if (!root) return;
    var base = [10, 15, 12, 14, 16, 13, 11, 17];
    var iO = sl(root, 'mo', 'Bozuk pikselin değeri', 18, 255, 1, 200, draw);
    var bar = el('div', 'chips'); root.appendChild(bar);
    var two = false, bt = el('button', 'chip', 'İkinci bozuk piksel ekle (0)'); bt.type = 'button'; bt.addEventListener('click', function () { two = !two; draw(); }); bar.appendChild(bt);
    var tb = el('div', 'scroll-x'); root.appendChild(tb);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function draw() {
      var o = +iO.value; document.getElementById('moo').textContent = o; bt.setAttribute('aria-pressed', String(two));
      var vals = two ? base.slice(1).concat([o, 0]) : base.concat([o]);
      var sorted = vals.slice().sort(function (a, b) { return a - b; }), med = sorted[4], mean = vals.reduce(function (s, v) { return s + v; }, 0) / 9;
      tb.innerHTML = '<table class="cmp"><tbody><tr><td><b>3×3 pencere</b></td><td class="mono">' + vals.join(', ') + '</td></tr><tr><td><b>Sıralanmış</b></td><td class="mono">' + sorted.map(function (v, i) { return i === 4 ? '<b>' + v + '</b>' : v; }).join(', ') + '</td></tr></tbody></table>';
      info.innerHTML = '<div class="metric"><b>' + med + '</b>medyan (sıralı dizinin ortancası)</div><div class="metric"><b>' + fx(mean, 1) + '</b>ortalama</div><div class="metric"><b>' + fx(Math.abs(mean - med), 1) + '</b>ortalama ile medyan arasındaki fark</div>';
      note.innerHTML = 'Bozuk piksel (tuz-biber türü) pencere içinde yalnızca bir değerdir. <b>Medyan</b> sıralamada onu uçlara iter ve ortadaki değeri alır, bu yüzden bozulmaz. <b>Ortalama</b> ise her değeri eşit sayar; tek bozuk piksel sonucu çok çeker.' + (two ? ' İki bozuk piksel olsa da medyan, pencerenin yarısından azı bozuk olduğu sürece sağlam kalır.' : '');
    }
    draw();
  })();

  /* ---------- 4) İşlem maliyeti ---------- */
  (function costLab() {
    var root = document.getElementById('maliyetlab');
    if (!root) return;
    var iM = sl(root, 'cm', 'Görüntü kenarı (M = N)', 256, 4096, 256, 1024, draw), iK = sl(root, 'ck', 'Çekirdek kenarı k', 3, 31, 2, 7, draw);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function draw() {
      var m = +iM.value, k = +iK.value; document.getElementById('cmo').textContent = m; document.getElementById('cko').textContent = k;
      var d = m * m * k * k, s = m * m * 2 * k, med = m * m * k * k * Math.log2(k * k);
      info.innerHTML = '<div class="metric"><b>' + d.toLocaleString('tr-TR') + '</b>doğrudan konvolüsyon: M·N·k²</div><div class="metric"><b>' + s.toLocaleString('tr-TR') + '</b>ayrılabilir Gauss: M·N·2k</div><div class="metric"><b>' + Math.round(med).toLocaleString('tr-TR') + '</b>medyan (sıralamalı): M·N·k²·log₂(k²)</div><div class="metric"><b>' + fx(d / s, 1) + ' kat</b>ayrılabilirlikle kazanç (k²/2k = k/2)</div>';
      note.innerHTML = 'Çekirdek büyüdükçe doğrudan konvolüsyonun maliyeti k² ile artar; ayrılabilir filtre (önce satırlar, sonra sütunlar) yalnızca 2k ile artar. Medyan, sıralama gerektirdiği için ek bir log çarpanı taşır. Bu sayılar işlem sayısının mertebesidir, ölçülmüş süre değildir.';
    }
    draw();
  })();
})();
