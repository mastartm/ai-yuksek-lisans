/* Yapay Zekâ Temelleri · Bölüm 7: beklenen fayda (diş ağrısı), para-fayda eğrisi ve çok nitelikli fayda. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function n1(x) { return (Math.round(x * 10) / 10).toString().replace('.', ','); }
  function n2(x) { return (Math.round(x * 100) / 100).toString().replace('.', ','); }
  function slider(parent, id, label, min, max, step, val) {
    var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>';
    parent.appendChild(r); return r.querySelector('input');
  }

  /* ---------- 1) Diş ağrısı: beklenen fayda ve bilgi değeri ---------- */
  var mu = document.getElementById('mulab');
  if (mu) {
    var pI = slider(mu, 'mup', 'P(çürük)', 0, 100, 1, 40);
    var uI = slider(mu, 'muu', 'Git + çürük yok (boşuna gitme)', 0, 70, 1, 40);
    var cI = slider(mu, 'muc', 'Kusursuz test ücreti', 0, 30, 1, 10);
    var mm = el('div', 'metrics'); mu.appendChild(mm);
    var mt = el('div', 'callout idea'); mu.appendChild(mt);
    var drawMu = function () {
      var p = +pI.value / 100, u = +uI.value, c = +cI.value;
      document.getElementById('mupo').textContent = '%' + Math.round(p * 100);
      document.getElementById('muuo').textContent = u;
      document.getElementById('muco').textContent = c;
      var eg = p * 80 + (1 - p) * u;            // git
      var en = p * -100 + (1 - p) * 70;         // gitme
      var best = Math.max(eg, en);
      var perfect = p * 80 + (1 - p) * Math.max(u, 70);   // çürük varsa git; yoksa u ≤ 70 olduğundan gitme
      var evpi = perfect - best;
      var thr = (70 - u) / (250 - u);           // EU(git) = EU(gitme) olduğu P(çürük)
      mm.innerHTML = '<div class="metric"><b>' + n1(eg) + '</b>EU(git)</div><div class="metric"><b>' + n1(en) + '</b>EU(gitme)</div><div class="metric"><b>' + n1(evpi) + '</b>kusursuz bilginin değeri</div><div class="metric"><b>%' + n1(thr * 100) + '</b>eşik P(çürük)</div>';
      var karar = eg >= en ? 'doktora git' : 'doktora gitme';
      var test;
      if (evpi <= 0.05) test = 'Test alsan da karar değişmez; bilgi <b>değersiz</b> (kusursuz bilginin değeri 0).';
      else if (evpi > c) test = 'Kusursuz bilginin değeri ' + n1(evpi) + ', ücret ' + c + ': ' + n1(evpi - c) + ' kazanç, test <b>değer</b>.';
      else test = 'Kusursuz bilginin değeri ' + n1(evpi) + ', ücret ' + c + ': test ücrete <b>değmez</b>.';
      mt.innerHTML = '<b>Karar: ' + karar + '.</b> P(çürük) eşik %' + n1(thr * 100) + '’in ' + (p * 100 >= thr * 100 ? 'üstünde' : 'altında') + '. ' + test + (pI.value === '40' && uI.value === '40' ? ' (Notun değerleri: 56’ya karşı 2.)' : '');
    };
    [pI, uI, cI].forEach(function (i) { i.addEventListener('input', drawMu); });
    drawMu();
  }

  /* ---------- 2) Para ve fayda: risk tutumu ---------- */
  var ul = document.getElementById('utillab');
  if (ul) {
    var CURVES = [
      ['İçbükey (√x, riskten kaçınan)', function (x) { return Math.sqrt(x); }, function (u) { return u * u; }],
      ['Doğrusal (riske nötr)', function (x) { return x; }, function (u) { return u; }],
      ['Dışbükey (x², riske açık)', function (x) { return x * x; }, function (u) { return Math.sqrt(u); }]
    ];
    var ci = 0;
    var chipBar = el('div', 'chips'); ul.appendChild(chipBar);
    var cb = CURVES.map(function (c, k) { var b = el('button', 'chip', c[0]); b.type = 'button'; b.addEventListener('click', function () { ci = k; drawUl(); }); chipBar.appendChild(b); return b; });
    var kI = slider(ul, 'utk', 'Kesin tutar (bin $)', 0, 1000, 10, 450);
    var gfx = el('div'); ul.appendChild(gfx);
    var um = el('div', 'metrics'); ul.appendChild(um);
    var ut = el('div', 'callout idea'); ul.appendChild(ut);
    var drawUl = function () {
      var c = CURVES[ci], k = +kI.value / 1000;
      document.getElementById('utko').textContent = Math.round(k * 1000) + ' bin $';
      cb.forEach(function (b, i) { b.setAttribute('aria-pressed', i === ci ? 'true' : 'false'); });
      var uk = c[1](k), ul2 = 0.5 * c[1](1) + 0.5 * c[1](0);     // piyango: %50 1 milyon, %50 hiçbir şey
      var ce = c[2](ul2) * 1000;                                  // kesin eşdeğer
      function X(x) { return 30 + x * 250; } function Y(u) { return 170 - u * 150; }
      var pts = []; for (var i = 0; i <= 20; i++) pts.push(X(i / 20).toFixed(1) + ',' + Y(c[1](i / 20)).toFixed(1));
      gfx.innerHTML = '<svg style="width:100%;max-width:420px;height:auto;display:block;margin:12px 0" viewBox="0 0 320 200" role="img" aria-label="Para-fayda eğrisi, piyango ve kesin tutar"><line class="d-line" x1="30" y1="170" x2="290" y2="170"/><line class="d-line" x1="30" y1="170" x2="30" y2="15"/>' +
        '<line class="d-dash" x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + X(1) + '" y2="' + Y(1) + '"/><polyline class="d-line-brand" points="' + pts.join(' ') + '"/>' +
        '<circle class="d-warn" cx="' + X(0.5) + '" cy="' + Y(ul2) + '" r="6"/><circle class="d-ok" cx="' + X(k).toFixed(1) + '" cy="' + Y(uk).toFixed(1) + '" r="6"/>' +
        '<text class="d-sm" x="30" y="190">0</text><text class="d-sm" x="290" y="190" text-anchor="end">1 milyon $</text><text class="d-sm" x="36" y="22">fayda</text></svg>';
      um.innerHTML = '<div class="metric"><b>' + n2(ul2) + '</b>piyangonun beklenen faydası (turuncu)</div><div class="metric"><b>' + n2(uk) + '</b>kesin tutarın faydası (yeşil)</div><div class="metric"><b>' + Math.round(ce) + ' bin $</b>kesin eşdeğer</div>';
      var secim = uk > ul2 + 1e-9 ? 'kesin tutarı' : (uk < ul2 - 1e-9 ? 'piyangoyu' : 'ikisi arasında kayıtsız kalır');
      ut.innerHTML = '<b>Ajan ' + (secim === 'ikisi arasında kayıtsız kalır' ? secim : secim + ' seçer') + '.</b> Piyangonun beklenen parası 500 bin $; kesin eşdeğeri ' + Math.round(ce) + ' bin $. Kesin tutar bu eşdeğerin üstündeyse kesin tutar seçilir. ' +
        (ci === 0 ? 'İçbükey eğride kesin eşdeğer 500 binin altındadır: ajan, beklenen parası 500 bin olan riskli piyango yerine daha düşük ama kesin bir tutarı kabul eder (ders notunun 450 bin örneği).' :
         ci === 1 ? 'Doğrusal eğride yalnızca beklenen paraya bakılır; eşik tam 500 bin $.' :
         'Dışbükey eğride eşdeğer 500’ün üstündedir: ajan riskli piyangoyu daha değerli bulur.') + ' Para sıralaması üç eğride de aynı; yine de karar farklı olabilir.';
    };
    kI.addEventListener('input', drawUl);
    drawUl();
  }

  /* ---------- 3) Çok nitelikli fayda ---------- */
  var ma = document.getElementById('mauflab');
  if (ma) {
    var CARS = [['A · Ekonomik', 9, 5, 4], ['B · Aile arabası', 5, 9, 6], ['C · Konfor arabası', 3, 7, 9]];   // fiyat, güvenlik, konfor (0–10)
    var wI = [slider(ma, 'maw1', 'w₁ fiyat', 0, 10, 1, 4), slider(ma, 'maw2', 'w₂ güvenlik', 0, 10, 1, 4), slider(ma, 'maw3', 'w₃ konfor', 0, 10, 1, 4)];
    var pre = el('div', 'chips'); ma.appendChild(pre);
    [['Öğrenci (fiyat öncelikli)', [6, 2, 2]], ['Aile (güvenlik öncelikli)', [2, 6, 2]], ['Konfor öncelikli', [2, 2, 6]]].forEach(function (p) {
      var b = el('button', 'chip', p[0]); b.type = 'button'; b.addEventListener('click', function () { wI.forEach(function (i, k) { i.value = p[1][k]; }); drawMa(); }); pre.appendChild(b);
    });
    var tb = el('div', 'scroll-x'); ma.appendChild(tb);
    var mt3 = el('div', 'callout idea'); ma.appendChild(mt3);
    var drawMa = function () {
      var w = wI.map(function (i) { return +i.value; }), s = w[0] + w[1] + w[2];
      ['maw1', 'maw2', 'maw3'].forEach(function (id, k) { document.getElementById(id + 'o').textContent = s ? n2(w[k] / s) : '0'; });
      if (!s) { tb.innerHTML = ''; mt3.innerHTML = '<b>Ağırlıkların hepsi 0.</b> Hiçbir nitelik önemli değilse arabalar arasında fark yoktur; en az bir ağırlığı artır.'; return; }
      var sc = CARS.map(function (c) { return (w[0] * c[1] + w[1] * c[2] + w[2] * c[3]) / s; });
      var order = [0, 1, 2].sort(function (a, b) { return sc[b] - sc[a]; });
      var h = '<table class="cmp"><thead><tr><th>Araba</th><th>Fiyat</th><th>Güvenlik</th><th>Konfor</th><th>U (0–10)</th></tr></thead><tbody>';
      CARS.forEach(function (c, i) { h += '<tr' + (i === order[0] ? ' style="background:var(--ok-soft)"' : '') + '><td>' + c[0] + '</td><td>' + c[1] + '</td><td>' + c[2] + '</td><td>' + c[3] + '</td><td><b>' + n2(sc[i]) + '</b></td></tr>'; });
      tb.innerHTML = h + '</tbody></table>';
      var gap = sc[order[0]] - sc[order[1]];
      mt3.innerHTML = '<b>Kazanan: ' + CARS[order[0]][0] + '.</b> İkinciyle fark ' + n2(gap) + ' puan. Her araba tablodaki sabit puanlarla kalır; yalnızca ağırlıklar değişir ve sıralama değişebilir. ' + (gap < 0.3 ? 'Fark küçük: ağırlıkların küçük bir değişimi kazananı çevirebilir.' : 'Fark belirgin.');
    };
    wI.forEach(function (i) { i.addEventListener('input', drawMa); });
    drawMa();
  }
})();
