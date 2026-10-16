/* Veri Bilimi · Bölüm 5: Bayes güncellemesi, p-değeri (tam binom testi) ve seçkisiz atama ile gönüllü seçim. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function svgEl(name, attrs, parent) { var e = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (parent) parent.appendChild(e); return e; }
  function f2(x) { return (Math.round(x * 100) / 100).toFixed(2).replace('.', ','); }
  function f3(x) { return (Math.round(x * 1000) / 1000).toFixed(3).replace('.', ','); }
  var W = 560, H = 230, L = 40, R = 14, T = 14, B = 34;

  /* ---------- 1) Bayes: Beta-binom güncellemesi ---------- */
  var bl = document.getElementById('bayeslab');
  if (bl) {
    var prior = [1, 1], heads = 0, tails = 0, TRUE_P = 0.7;
    var bar = el('div', 'chips'); bl.appendChild(bar);
    function chip(label, fn) { var b = el('button', 'chip', label); b.type = 'button'; b.addEventListener('click', fn); bar.appendChild(b); return b; }
    var pc = [];
    [[[1, 1], 'Önsel: bilgisiz'], [[10, 10], 'Önsel: “adil” güçlü'], [[2, 8], 'Önsel: “yanlı” (0,2)']].forEach(function (p) {
      pc.push([p[0], chip(p[1], function () { prior = p[0]; draw(); })]);
    });
    var bar2 = el('div', 'chips'); bl.appendChild(bar2);
    function btn(label, fn) { var b = el('button', 'btn', label); b.type = 'button'; b.addEventListener('click', fn); bar2.appendChild(b); }
    btn('+1 tura', function () { heads++; draw(); });
    btn('+1 yazı', function () { tails++; draw(); });
    btn('+10 atış (gerçek p = 0,7)', function () { for (var i = 0; i < 10; i++) { if (Math.random() < TRUE_P) heads++; else tails++; } draw(); });
    btn('Sıfırla', function () { heads = 0; tails = 0; draw(); });
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'diagram', role: 'img', 'aria-label': 'Önsel ve ardıl dağılım eğrileri' }, null); bl.appendChild(svg);
    var info = el('div', 'metrics'); bl.appendChild(info);
    var note = el('div', 'callout idea'); bl.appendChild(note);
    function dens(a, b, N) {
      var ys = [], s = 0, i;
      for (i = 0; i <= N; i++) { var p = Math.min(Math.max(i / N, 1e-6), 1 - 1e-6); var v = Math.exp((a - 1) * Math.log(p) + (b - 1) * Math.log(1 - p)); ys.push(v); s += v; }
      return ys.map(function (v) { return v / s * N; });
    }
    function X(p) { return L + p * (W - L - R); }
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var N = 200, pr = dens(prior[0], prior[1], N), a = prior[0] + heads, b = prior[1] + tails, po = dens(a, b, N);
      var mx = Math.max(Math.max.apply(null, pr), Math.max.apply(null, po), 1.5);
      function Y(v) { return H - B - v / mx * (H - B - T); }
      svgEl('line', { x1: L, y1: H - B, x2: W - R, y2: H - B, 'class': 'd-line' }, svg);
      [0, 0.5, 1].forEach(function (p) { var t = svgEl('text', { x: X(p), y: H - B + 18, 'class': 'd-sm d-c' }, svg); t.textContent = String(p).replace('.', ','); });
      var xl = svgEl('text', { x: (L + W - R) / 2, y: H - 4, 'class': 'd-sm d-c' }, svg); xl.textContent = 'paranın tura gelme olasılığı θ';
      svgEl('polyline', { points: pr.map(function (v, i) { return X(i / N) + ',' + Y(v); }).join(' '), fill: 'none', 'class': 'd-dash' }, svg);
      svgEl('polyline', { points: po.map(function (v, i) { return X(i / N) + ',' + Y(v); }).join(' '), fill: 'none', 'class': 'd-line-brand', 'stroke-width': 3 }, svg);
      var n = heads + tails, mean = a / (a + b), acc = 0, lo = 0, hi = 1, i;
      for (i = 0; i <= N; i++) { acc += po[i] / N; if (acc >= 0.025 && lo === 0 && i > 0) lo = i / N; if (acc >= 0.975) { hi = i / N; break; } }
      pc.forEach(function (x) { x[1].setAttribute('aria-pressed', x[0] === prior ? 'true' : 'false'); });
      info.innerHTML = '<div class="metric"><b>' + heads + ' tura / ' + tails + ' yazı</b>gözlenen veri</div><div class="metric"><b>' + f3(mean) + '</b>ardıl ortalama</div><div class="metric"><b>' + f2(lo) + '–' + f2(hi) + '</b>%95 güvenilir aralık</div>';
      note.innerHTML = n === 0 ? '<b>Veri yok:</b>ardıl dağılım önselle aynıdır. Önsel, veriyi görmeden önce sahip olduğun inançtır.' :
        n < 20 ? '<b>Az veri:</b>ardıl dağılım hem önsele hem veriye dayanır. Güçlü bir önsel (“adil”) az veriyle kolay kolay yerinden oynamaz.' :
        '<b>Çok veri:</b>veri önseli bastırır; farklı önsellerle başlayanlar benzer sonuca yaklaşır. Her turun ardılı sonraki turun önseli olabilir: Bayes güncellemesi akan veriye uygundur.';
    }
    draw();
  }

  /* ---------- 2) p-değeri: tam binom testi ---------- */
  var pl = document.getElementById('plab');
  if (pl) {
    var LF = [0]; for (var q = 1; q <= 400; q++) LF.push(LF[q - 1] + Math.log(q));
    function pmf(n, k) { return Math.exp(LF[n] - LF[k] - LF[n - k] + n * Math.log(0.5)); }
    function row(id, label, min, max, val) { var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="1" value="' + val + '"><output id="' + id + 'o"></output>'; pl.appendChild(r); return r.querySelector('input'); }
    var iN = row('pn', 'Atış sayısı n', 10, 400, 40), iK = row('pk', 'Gelen tura', 0, 400, 26);
    var svg2 = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'diagram', role: 'img', 'aria-label': 'H0 altında tura sayısının dağılımı' }, null); pl.appendChild(svg2);
    var info2 = el('div', 'metrics'); pl.appendChild(info2);
    var note2 = el('div', 'callout idea'); pl.appendChild(note2);
    function draw2() {
      var n = +iN.value; iK.max = n; if (+iK.value > n) iK.value = n; var k = +iK.value;
      document.getElementById('pno').textContent = n; document.getElementById('pko').textContent = k;
      while (svg2.firstChild) svg2.removeChild(svg2.firstChild);
      var ps = [], i, mx = 0, pobs = pmf(n, k), pv = 0;
      for (i = 0; i <= n; i++) { var v = pmf(n, i); ps.push(v); mx = Math.max(mx, v); if (v <= pobs * (1 + 1e-9)) pv += v; }
      var bw = (W - L - R) / (n + 1);
      function Y(v) { return H - B - v / mx * (H - B - T); }
      svgEl('line', { x1: L, y1: H - B, x2: W - R, y2: H - B, 'class': 'd-line' }, svg2);
      ps.forEach(function (v, j) { svgEl('rect', { x: L + j * bw, y: Y(v), width: Math.max(bw - 0.5, 0.5), height: H - B - Y(v), 'class': v <= pobs * (1 + 1e-9) ? 'd-bad' : 'd-brand', 'fill-opacity': v <= pobs * (1 + 1e-9) ? 0.9 : 0.35 }, svg2); });
      svgEl('line', { x1: L + (k + 0.5) * bw, y1: T, x2: L + (k + 0.5) * bw, y2: H - B, 'class': 'd-line-brand', 'stroke-width': 2 }, svg2);
      var t1 = svgEl('text', { x: L, y: H - 8, 'class': 'd-sm' }, svg2); t1.textContent = '0'; var t2 = svgEl('text', { x: W - R, y: H - 8, 'class': 'd-sm', 'text-anchor': 'end' }, svg2); t2.textContent = n + ' tura';
      var rej = pv < 0.05;
      info2.innerHTML = '<div class="metric"><b>' + f3(pv) + '</b>p-değeri (iki yönlü)</div><div class="metric"><b>' + (rej ? 'Reddedilir' : 'Reddedilemez') + '</b>H₀: para adil, α = 0,05</div><div class="metric"><b>%' + f2(k / n * 100) + '</b>gözlenen tura oranı</div>';
      note2.innerHTML = 'Kırmızı çubuklar, H₀ doğruyken gözlediğin kadar ya da daha uç sonuçlar. Alanları toplamı p-değeridir. ' +
        (rej ? '<b>p &lt; 0,05:</b>veri H₀ ile uyumsuz; reddedilir. ' : '<b>p ≥ 0,05:</b>kanıt yetersiz; H₀ “doğru” kanıtlanmış olmaz, yalnızca reddedilemez. ') +
        'Aynı %65 oranını n = 20 ve n = 400 için dene: örneklem büyüdükçe küçük bir fark bile “anlamlı” olur; anlamlılık ≠ önem.';
    }
    [iN, iK].forEach(function (i) { i.addEventListener('input', draw2); });
    draw2();
  }

  /* ---------- 3) Rubin: gönüllü seçim ve seçkisiz atama ---------- */
  var rl = document.getElementById('rubinlab');
  if (rl) {
    var mode = 'self', EFFECT = 5, res = null;
    var bar3 = el('div', 'chips'); rl.appendChild(bar3);
    var mc = {};
    [['self', 'Gönüllü katılım'], ['rand', 'Seçkisiz atama']].forEach(function (m) { var b = el('button', 'chip', m[1]); b.type = 'button'; b.addEventListener('click', function () { mode = m[0]; run(); }); bar3.appendChild(b); mc[m[0]] = b; });
    var again = el('button', 'btn', 'Yeniden çalıştır'); again.type = 'button'; again.addEventListener('click', run); bar3.appendChild(again);
    var info3 = el('div', 'metrics'); rl.appendChild(info3);
    var note3 = el('div', 'callout idea'); rl.appendChild(note3);
    function run() {
      var N = 600, t = [], c = [], i;
      for (i = 0; i < N; i++) {
        var m = Math.random();                      // gizli “motivasyon”
        var y0 = 50 + 20 * m + 6 * (Math.random() + Math.random() + Math.random() - 1.5);
        var y1 = y0 + EFFECT;                        // gerçek etki herkes için +5
        var treated = mode === 'self' ? (m + 0.35 * (Math.random() - 0.5) > 0.5) : (Math.random() < 0.5);
        (treated ? t : c).push(treated ? y1 : y0);
      }
      function avg(a) { var s = 0; a.forEach(function (v) { s += v; }); return s / a.length; }
      res = { mt: avg(t), mc: avg(c), nt: t.length, nc: c.length };
      draw();
    }
    function draw() {
      Object.keys(mc).forEach(function (k) { mc[k].setAttribute('aria-pressed', k === mode ? 'true' : 'false'); });
      var d = res.mt - res.mc;
      info3.innerHTML = '<div class="metric"><b>' + f2(res.mt) + '</b>tedavi grubu ort. (n = ' + res.nt + ')</div><div class="metric"><b>' + f2(res.mc) + '</b>kontrol grubu ort. (n = ' + res.nc + ')</div><div class="metric"><b>' + f2(d) + '</b>gözlenen fark (gerçek etki: 5,00)</div>';
      note3.innerHTML = mode === 'self' ? '<b>Gönüllü katılım:</b>motivasyonu yüksek olanlar tedaviye daha çok katılıyor ve zaten daha yüksek puan alıyor. Fark, gerçek etkiden (5) çok büyük çıkar: yanlılık (seçim sapması). Ortak değişken (motivasyon) ölçülmüyor.' :
        '<b>Seçkisiz atama:</b>motivasyon iki gruba ortalamada eşit dağılır; potansiyel sonuçlar atamadan bağımsızdır. Fark gerçek etki 5’e yaklaşır (küçük rastlantısal oynamalar olur). Yeniden çalıştırıp bak.';
    }
    run();
  }
})();
