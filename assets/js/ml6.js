/* Makine Öğrenmesi · Bölüm 6: Bayes teoremiyle tanı testi ve kaba-kuvvet MAP kavram öğrenmesi.
   Veriler bu site için üretilmiştir (örnek 1: sanal bir hastalık testi, örnek 2: eşik hipotezleri). */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function svgEl(name, attrs, parent) { var e = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (parent) parent.appendChild(e); return e; }
  function pct(x, d) { var k = Math.pow(10, d == null ? 1 : d); return (Math.round(x * 100 * k) / k).toString().replace('.', ',') + '%'; }
  function f3(x) { return (Math.round(x * 1000) / 1000).toFixed(3).replace('.', ','); }

  /* ---------- 1) Tanı testi ve Bayes ---------- */
  var dx = document.getElementById('dxlab');
  if (dx) {
    function row(id, label, min, max, step, val) { var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>'; dx.appendChild(r); return r.querySelector('input'); }
    var iP = row('dxp', 'Hastalık sıklığı P(h)', 0.1, 50, 0.1, 0.8), iS = row('dxs', 'Duyarlılık P(+|h)', 50, 100, 1, 98), iF = row('dxf', 'Yanlış alarm P(+|¬h)', 0, 30, 1, 3);
    var bar = el('div', 'chips'); var pre = el('button', 'btn', 'Derste işlenen örnek (0,8% / 98% / 3%)'); pre.type = 'button'; bar.appendChild(pre); dx.appendChild(bar);
    var grid = el('div', 'dx-grid'); dx.appendChild(grid);
    var cells = []; for (var i = 0; i < 1000; i++) { var c = el('i'); grid.appendChild(c); cells.push(c); }
    var info = el('div', 'metrics'); dx.appendChild(info);
    var note = el('div', 'callout idea'); dx.appendChild(note);
    function draw() {
      var p = +iP.value / 100, s = +iS.value / 100, f = +iF.value / 100;
      document.getElementById('dxpo').textContent = pct(p, 1); document.getElementById('dxso').textContent = pct(s, 0); document.getElementById('dxfo').textContent = pct(f, 0);
      var a = s * p, b = f * (1 - p), post = a + b > 0 ? a / (a + b) : 0;
      var tp = Math.round(1000 * a), fp = Math.round(1000 * b), fn = Math.round(1000 * p) - tp, sick = Math.round(1000 * p);
      if (fn < 0) fn = 0;
      // sıra: TP, FN, FP, geri kalan sağlıklı-negatif
      cells.forEach(function (c, k) { var cls = k < tp ? 'tp' : k < sick ? 'fn' : k < sick + fp ? 'fp' : 'tn'; c.className = cls; });
      info.innerHTML = '<div class="metric"><b>' + f3(a) + '</b>P(+|h)·P(h)</div><div class="metric"><b>' + f3(b) + '</b>P(+|¬h)·P(¬h)</div><div class="metric"><b>' + pct(post, 0) + '</b>P(h | +): test pozitifken gerçekten hasta olma olasılığı</div>';
      note.innerHTML = '1000 kişide: <b style="color:var(--bad)">' + tp + ' gerçek pozitif</b>, <b>' + fp + ' yanlış pozitif</b> (pozitif çıkan ' + (tp + fp) + ' kişiden yalnızca ' + tp + ' kişi hasta). ' + (a > b ? 'MAP hipotezi: <b>hasta</b>.' : 'MAP hipotezi: <b>hasta değil</b>: önsel olasılık düşük olduğu için pozitif test bile hastalığı en olası hipotez yapmaz.') + ' Hastalık sıklığını artırınca ardıl olasılığın nasıl yükseldiğine bak.';
    }
    [iP, iS, iF].forEach(function (i) { i.addEventListener('input', draw); });
    pre.addEventListener('click', function () { iP.value = 0.8; iS.value = 98; iF.value = 3; draw(); });
    draw();
  }

  /* ---------- 2) Kaba-kuvvet MAP kavram öğrenmesi ---------- */
  var ml = document.getElementById('maplab');
  if (ml) {
    var NH = 12, TARGET = 5, ex = [];   // h_t(x) = (x >= t), t = 0..11; hedef: t = 5; x = 0..10
    var W = 560, H = 230, L = 36, R = 12, T = 14, B = 44;
    var r1 = el('div', 'slider-row'); r1.innerHTML = '<label for="mpx">Örnek x</label><input id="mpx" type="range" min="0" max="10" step="1" value="3"><output id="mpxo">3</output>';
    ml.appendChild(r1);
    var bar2 = el('div', 'chips'); ml.appendChild(bar2);
    function btn(t, fn) { var b = el('button', 'btn', t); b.type = 'button'; b.addEventListener('click', fn); bar2.appendChild(b); }
    var sl = r1.querySelector('input');
    btn('Etiketli örnek ekle (gerçek etiketle)', function () { ex.push(+sl.value); draw(); });
    btn('Rastgele örnek ekle', function () { ex.push(Math.floor(Math.random() * 11)); draw(); });
    btn('Sıfırla', function () { ex = []; draw(); });
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'diagram', role: 'img', 'aria-label': 'Her hipotezin ardıl olasılığı' }, null); ml.appendChild(svg);
    var info2 = el('div', 'metrics'); ml.appendChild(info2);
    var note2 = el('div', 'callout idea'); ml.appendChild(note2);
    function label(x) { return x >= TARGET ? 1 : 0; }
    function draw() {
      document.getElementById('mpxo').textContent = sl.value;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var cons = [], t, i;
      for (t = 0; t < NH; t++) { var ok = true; ex.forEach(function (x) { if ((x >= t ? 1 : 0) !== label(x)) ok = false; }); cons.push(ok); }
      var nvs = cons.filter(Boolean).length, bw = (W - L - R) / NH;
      svgEl('line', { x1: L, y1: H - B, x2: W - R, y2: H - B, 'class': 'd-line' }, svg);
      for (t = 0; t < NH; t++) {
        var v = cons[t] ? 1 / nvs : 0, h = v * (H - B - T), x = L + t * bw + bw * 0.12;
        svgEl('rect', { x: x, y: H - B - h, width: bw * 0.76, height: Math.max(h, 0), rx: 3, 'class': t === TARGET ? 'd-ok' : 'd-brand', 'fill-opacity': cons[t] ? 0.95 : 0.15 }, svg);
        var tx = svgEl('text', { x: x + bw * 0.38, y: H - B + 16, 'class': 'd-sm d-c' }, svg); tx.textContent = 'h' + t;
        if (cons[t]) { var pv = svgEl('text', { x: x + bw * 0.38, y: H - B - h - 5, 'class': 'd-sm d-c' }, svg); pv.textContent = pct(v, 0); }
      }
      var cap = svgEl('text', { x: (L + W - R) / 2, y: H - 6, 'class': 'd-sm d-c' }, svg); cap.textContent = 'hipotezler: h_t(x) = (x ≥ t); hedef kavram h5 (yeşil)';
      var exTxt = ex.length ? ex.map(function (x) { return x + '→' + label(x); }).join(', ') : 'henüz yok';
      info2.innerHTML = '<div class="metric"><b>' + ex.length + '</b>eğitim örneği</div><div class="metric"><b>' + nvs + ' / ' + NH + '</b>tutarlı hipotez |VS|</div><div class="metric"><b>' + pct(1 / nvs, 0) + '</b>tutarlıların her biri P(h | D)</div>';
      note2.innerHTML = '<b>Örnekler (x → etiket):</b> ' + exTxt + '. Başlangıçta 12 hipotez eşit olasılıklıdır (1/|H|). Etiketli her örnek, ona <b>aykırı hipotezlerin olasılığını 0’a</b> indirir; kalan |VS| hipotez 1/|VS| payını paylaşır. ' + (nvs === 1 ? 'Tek hipotez kaldı: hedef kavram öğrenildi.' : 'Örnek sayısı arttıkça tutarlı hipotez azalır; hepsi MAP hipotezidir.');
    }
    sl.addEventListener('input', draw);
    draw();
  }
})();
