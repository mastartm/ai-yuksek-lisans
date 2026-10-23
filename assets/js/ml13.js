/* Makine Öğrenmesi · Bölüm 13: çoğunluk oyu, bagging için önyükleme örnekleri ve AdaBoost benzeri güçlendirme.
   Sayılar ve noktalar bu site için üretilmiştir. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function svgEl(name, attrs, parent) { var e = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (parent) parent.appendChild(e); return e; }
  function pct(x) { return (Math.round(x * 1000) / 10).toString().replace('.', ',') + '%'; }
  function f2(x) { return (Math.round(x * 100) / 100).toFixed(2).replace('.', ','); }

  /* ---------- 1) Çoğunluk oyu ---------- */
  (function voteLab() {
    var root = document.getElementById('oylab');
    if (!root) return;
    function sl(id, label, min, max, step, val) { var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>'; root.appendChild(r); var i = r.querySelector('input'); i.addEventListener('input', draw); return i; }
    var iP = sl('vp', 'Her sınıflandırıcının doğruluğu', 0.3, 0.9, 0.01, 0.65), iT = sl('vt', 'Sınıflandırıcı sayısı (tek)', 1, 25, 2, 11), iR = sl('vr', 'Birbirini kopyalama olasılığı', 0, 1, 0.05, 0);
    var box = el('div'); root.appendChild(box);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function binom(n, k) { var r = 1; for (var i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; }
    function acc(p, T, rho) {
      var s = 0, k; for (k = Math.floor(T / 2) + 1; k <= T; k++) s += binom(T, k) * Math.pow(p, k) * Math.pow(1 - p, T - k);
      return rho * p + (1 - rho) * s;
    }
    function draw() {
      var p = +iP.value, T = +iT.value, rho = +iR.value;
      document.getElementById('vpo').textContent = pct(p); document.getElementById('vto').textContent = T; document.getElementById('vro').textContent = pct(rho);
      var a = acc(p, T, rho);
      box.innerHTML = '';
      var W = 340, H = 170, L = 36, B = 28, svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Sınıflandırıcı sayısına göre topluluk doğruluğu' }, box);
      [0, 0.5, 1].forEach(function (v) { var y = H - B - v * (H - B - 10); svgEl('line', { x1: L, x2: W - 6, y1: y, y2: y, stroke: 'var(--line)' }, svg); var t = svgEl('text', { x: L - 4, y: y + 4, 'text-anchor': 'end', 'font-size': 10, fill: 'var(--muted)' }, svg); t.textContent = pct(v); });
      var pts = [], t;
      for (t = 1; t <= 25; t += 2) pts.push([L + (t - 1) / 24 * (W - L - 12), H - B - acc(p, t, rho) * (H - B - 10)]);
      svgEl('path', { d: pts.map(function (q, i) { return (i ? 'L' : 'M') + q[0] + ' ' + q[1]; }).join(' '), fill: 'none', stroke: 'var(--brand)', 'stroke-width': 2.4 }, svg);
      svgEl('circle', { cx: L + (T - 1) / 24 * (W - L - 12), cy: H - B - a * (H - B - 10), r: 5, fill: 'var(--bad)' }, svg);
      svgEl('line', { x1: L, x2: W - 6, y1: H - B - p * (H - B - 10), y2: H - B - p * (H - B - 10), stroke: 'var(--warn)', 'stroke-dasharray': '4 4' }, svg);
      var tx = svgEl('text', { x: L, y: H - 8, 'font-size': 10, fill: 'var(--muted)' }, svg); tx.textContent = '1 … 25 sınıflandırıcı (turuncu kesik çizgi: tek sınıflandırıcının doğruluğu)';
      info.innerHTML = '<div class="metric"><b>' + pct(p) + '</b>tek sınıflandırıcı</div><div class="metric"><b>' + pct(a) + '</b>' + T + ' sınıflandırıcılı topluluk</div><div class="metric"><b>' + (a > p + 0.0005 ? '+' : '') + pct(a - p) + '</b>fark</div>';
      note.innerHTML = p <= 0.5 ? '<b>Rastgele tahminden kötü sınıflandırıcılar.</b> Notta sınıflandırıcıların rastgele tahminden daha iyi olması gerektiği söylenir; doğruluk %50’nin altındaysa oy sayısını artırmak topluluğu <i>daha da kötü</i> yapar.' : rho > 0.5 ? '<b>Aralarında çeşitlilik yok.</b> Sınıflandırıcılar birbirini kopyaladıkça topluluk tek sınıflandırıcıya yaklaşır. Notta çeşitlilik ve sınıflandırıcılar arasında az korelasyon önemle istenir.' : '<b>Topluluk, sınıflandırıcılardan iyi.</b> Topluluk bir kaydı yalnızca sınıflandırıcıların yarısından fazlası yanılırsa yanlış sınıflar. Doğruluk %50’nin üstünde ve sınıflandırıcılar bağımsızsa sayı arttıkça topluluk iyileşir.';
    }
    draw();
  })();

  /* ---------- 2) Bagging: önyükleme örnekleri ---------- */
  (function baggingLab() {
    var root = document.getElementById('baglab');
    if (!root) return;
    var D = 10;
    var r = el('div', 'slider-row'); r.innerHTML = '<label for="bgt">Topluluk büyüklüğü T</label><input id="bgt" type="range" min="2" max="6" step="1" value="3"><output id="bgto">3</output>'; root.appendChild(r);
    var inp = r.querySelector('input');
    var bn = el('button', 'btn primary', 'Örnekleri yeniden çek'); bn.type = 'button'; root.appendChild(bn);
    var tb = el('div', 'scroll-x'); root.appendChild(tb);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function draw() {
      var T = +inp.value; document.getElementById('bgto').textContent = T;
      var head = '<tr><th>Eğitim kümesi</th>', i, t, rows = '', miss = 0, dup = 0;
      for (i = 1; i <= D; i++) head += '<th>k' + i + '</th>'; head += '</tr>';
      for (t = 1; t <= T; t++) {
        var c = []; for (i = 0; i < D; i++) c.push(0);
        for (i = 0; i < D; i++) c[Math.floor(Math.random() * D)]++;
        rows += '<tr><td>D<sub>' + t + '</sub> → M<sub>' + t + '</sub></td>' + c.map(function (v) { if (v === 0) miss++; if (v > 1) dup++; return '<td>' + (v === 0 ? '<span style="color:var(--bad)">0</span>' : v) + '</td>'; }).join('') + '</tr>';
      }
      tb.innerHTML = '<table class="cmp"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table>';
      info.innerHTML = '<div class="metric"><b>' + T + '</b>önyükleme örneği, T model</div><div class="metric"><b>' + (Math.round(miss / T * 10) / 10).toString().replace('.', ',') + '</b>örnek başına hiç seçilmeyen kayıt (ortalama)</div><div class="metric"><b>' + (Math.round(dup / T * 10) / 10).toString().replace('.', ',') + '</b>örnek başına birden fazla seçilen kayıt</div>';
      note.innerHTML = 'Her satır bir eğitim kümesidir: tablodaki sayı, k. kaydın o kümede kaç kez bulunduğunu gösterir. Yerine koyarak örnekleme yüzünden bazı kayıtlar birkaç kez, bazıları (kırmızı 0) hiç seçilmez. Her küme farklı olduğu için M<sub>t</sub> modelleri birbirinden farklı çıkar; bagging’in amacı bu çeşitliliktir.';
    }
    inp.addEventListener('input', draw); bn.addEventListener('click', draw); draw();
  })();

  /* ---------- 3) Güçlendirme (boosting) ---------- */
  (function boostLab() {
    var root = document.getElementById('boostlab');
    if (!root) return;
    var X = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], Y = [1, 1, 1, -1, -1, -1, 1, 1, -1, -1];
    var rounds, w, round;
    function pred(st, x) { return (x > st.a ? 1 : -1) * st.s; }
    function reset() { w = X.map(function () { return 1 / X.length; }); rounds = []; round = 0; draw(); }
    function next() {
      if (rounds.length >= 8) return;
      var best = null, bestE = 9, a, s;
      for (a = 0.5; a <= 10.5; a += 1) [1, -1].forEach(function (sg) { var st = { a: a, s: sg }, e = 0; X.forEach(function (x, i) { if (pred(st, x) !== Y[i]) e += w[i]; }); if (e < bestE - 1e-12) { bestE = e; best = st; } });
      var alpha = Math.log((1 - bestE) / bestE), wBefore = w.slice();
      var mis = 0, ok = 0; X.forEach(function (x, i) { if (pred(best, x) !== Y[i]) mis += w[i]; else ok += w[i]; });
      w = w.map(function (v, i) { return pred(best, X[i]) !== Y[i] ? v / mis * 0.5 : v / ok * 0.5; });
      rounds.push({ st: best, err: bestE, alpha: alpha, wBefore: wBefore });
      draw();
    }
    var bar = el('div', 'chips'); root.appendChild(bar);
    var b1 = el('button', 'btn primary', 'Sonraki tur'); b1.type = 'button'; var b2 = el('button', 'btn', 'Baştan'); b2.type = 'button';
    bar.appendChild(b1); bar.appendChild(b2);
    var box = el('div'); root.appendChild(box);
    var info = el('div', 'metrics'); root.appendChild(info);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function ensPred(x) { var f = 0; rounds.forEach(function (m) { f += m.alpha * pred(m.st, x); }); return f >= 0 ? 1 : -1; }
    function draw() {
      box.innerHTML = '';
      var W = 340, H = 150, svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Ağırlıklar ve topluluk tahmini' }, box);
      var cur = w, mx = Math.max.apply(null, cur);
      X.forEach(function (x, i) {
        var cx = 25 + i * 32, r = 5 + 14 * Math.sqrt(cur[i] / mx), wrong = rounds.length && ensPred(x) !== Y[i];
        svgEl('circle', { cx: cx, cy: 55, r: r, fill: Y[i] === 1 ? 'var(--ok)' : 'var(--brand)', opacity: 0.8, stroke: wrong ? 'var(--bad)' : 'none', 'stroke-width': 3 }, svg);
        var t = svgEl('text', { x: cx, y: 59, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#fff' }, svg); t.textContent = Y[i] === 1 ? '+' : '−';
        var l = svgEl('text', { x: cx, y: 100, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--muted)' }, svg); l.textContent = f2(cur[i]);
        if (rounds.length) { var e = svgEl('text', { x: cx, y: 125, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: ensPred(x) === Y[i] ? 'var(--ok)' : 'var(--bad)' }, svg); e.textContent = ensPred(x) === 1 ? '+' : '−'; }
      });
      var t1 = svgEl('text', { x: 4, y: 116, 'font-size': 9, fill: 'var(--muted)' }, svg); t1.textContent = 'altta: ağırlık (sonraki tur için)';
      var t2 = svgEl('text', { x: 4, y: 144, 'font-size': 9, fill: 'var(--muted)' }, svg); t2.textContent = 'en altta: topluluğun tahmini (kırmızı halka = hatalı)';
      var acc = 0; X.forEach(function (x, i) { if (rounds.length && ensPred(x) === Y[i]) acc++; });
      var last = rounds[rounds.length - 1];
      info.innerHTML = '<div class="metric"><b>' + rounds.length + '</b>tur (sınıflandırıcı sayısı)</div><div class="metric"><b>' + (last ? pct(last.err) : '–') + '</b>son sınıflandırıcının ağırlıklı hatası</div><div class="metric"><b>' + (last ? f2(last.alpha) : '–') + '</b>son sınıflandırıcının oy ağırlığı</div><div class="metric"><b>' + (rounds.length ? acc + ' / 10' : '–') + '</b>topluluğun doğru bildiği kayıt</div>';
      note.innerHTML = rounds.length === 0 ? 'Başlangıçta her kaydın ağırlığı eşit (0,10). “Sonraki tur”a bas.' : 'Tur ' + rounds.length + ': basit bir eşik (“x > ' + last.st.a + ' ise ' + (last.st.s === 1 ? '+' : '−') + '”) seçildi. Yanlış sınıflandırdığı kayıtların toplam ağırlığı <b>0,5</b>’e, doğrularınki de 0,5’e ayarlandı; bu yüzden yanlışlar büyüdü. ' + (acc === 10 ? '<b>Topluluk artık 10 kaydın hepsini doğru biliyor.</b> Hiçbir tek eşik bunu yapamazdı.' : 'Bir sonraki tur bu büyük kayıtlara “daha fazla dikkat eder”.');
    }
    b1.addEventListener('click', next); b2.addEventListener('click', reset);
    reset();
  })();
})();
