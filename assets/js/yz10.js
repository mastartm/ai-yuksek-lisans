/* Yapay Zekâ Temelleri · Bölüm 10: yerel/küresel açıklama (XAI), qubit ve 2ⁿ, otonom aracın durma mesafesi. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function n1(x) { return (Math.round(x * 10) / 10).toFixed(1).replace('.', ','); }
  function n2(x) { return (Math.round(x * 100) / 100).toFixed(2).replace('.', ','); }
  function pc(x) { return '%' + (Math.round(x * 1000) / 10).toString().replace('.', ','); }
  function slider(parent, id, label, min, max, step, val) {
    var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>';
    parent.appendChild(r); return r.querySelector('input');
  }

  /* ---------- 1) Yerel ve küresel açıklama: doğrusal kredi modeli ---------- */
  var xl = document.getElementById('xailab');
  if (xl) {
    var NAMES = ['Gelir (bin TL)', 'Borç oranı (%)', 'Kredi geçmişi (yıl)', 'Gecikme sayısı'], WX = [0.20, -0.06, 0.15, -0.8];
    var DATA = [[30, 20, 8, 0], [12, 55, 2, 3], [22, 35, 5, 1], [45, 15, 12, 0], [9, 60, 1, 2], [28, 45, 3, 4], [35, 30, 10, 0], [15, 25, 3, 1]];
    var MEAN = [0, 1, 2, 3].map(function (j) { return DATA.reduce(function (s, r) { return s + r[j]; }, 0) / DATA.length; });
    function contrib(r) { return r.map(function (v, j) { return WX[j] * (v - MEAN[j]); }); }
    var GLOB = [0, 1, 2, 3].map(function (j) { return DATA.reduce(function (s, r) { return s + Math.abs(contrib(r)[j]); }, 0) / DATA.length; });
    var who = 1, view = 0;
    var cb = el('div', 'chips'); xl.appendChild(cb);
    var cbs = DATA.map(function (r, i) { var b = el('button', 'chip', 'Başvuru ' + (i + 1)); b.type = 'button'; b.addEventListener('click', function () { who = i; view = 0; drawXa(); }); cb.appendChild(b); return b; });
    var vb = el('div', 'chips'); xl.appendChild(vb);
    var vbs = ['Yerel: bu başvuru', 'Küresel: tüm başvurular'].map(function (t, k) { var b = el('button', 'chip', t); b.type = 'button'; b.addEventListener('click', function () { view = k; drawXa(); }); vb.appendChild(b); return b; });
    var xg = el('div'); xl.appendChild(xg);
    var xm = el('div', 'metrics'); xl.appendChild(xm);
    var xn = el('div', 'callout idea'); xl.appendChild(xn);
    var drawXa = function () {
      cbs.forEach(function (b, i) { b.setAttribute('aria-pressed', i === who ? 'true' : 'false'); });
      vbs.forEach(function (b, k) { b.setAttribute('aria-pressed', k === view ? 'true' : 'false'); });
      var r = DATA[who], c = contrib(r), tot = c.reduce(function (s, x) { return s + x; }, 0), vals = view ? GLOB : c, mx = Math.max.apply(null, vals.map(Math.abs)) || 1;
      var svg = '<svg style="width:100%;max-width:560px;height:auto;display:block;margin:12px 0" viewBox="0 0 560 190" role="img" aria-label="Özelliklerin katkıları">';
      vals.forEach(function (v, j) {
        var y = 10 + j * 44, w = Math.abs(v) / mx * 130, x0 = view ? 250 : 300, x = view ? x0 : (v >= 0 ? x0 : x0 - w);
        svg += '<text class="d-sm" x="0" y="' + (y + 14) + '">' + NAMES[j] + (view ? '' : ' = ' + String(r[j]).replace('.', ',')) + '</text><rect x="' + x.toFixed(1) + '" y="' + y + '" width="' + w.toFixed(1) + '" height="22" rx="4" style="fill:var(' + (view || v >= 0 ? '--ok' : '--warn') + ')"/><text class="d-sm" x="' + ((view || v >= 0) ? x0 + w + 6 : x0 + 6).toFixed(1) + '" y="' + (y + 16) + '">' + (view ? n2(v) : (v >= 0 ? '+' : '−') + n2(Math.abs(v))) + '</text>';
      });
      if (!view) svg += '<line class="d-line" x1="300" y1="4" x2="300" y2="186"/>';
      xg.innerHTML = svg + '</svg>';
      var top = 0; c.forEach(function (v, j) { if (Math.abs(v) > Math.abs(c[top])) top = j; });
      var gtop = GLOB.indexOf(Math.max.apply(null, GLOB));
      xm.innerHTML = '<div class="metric"><b>' + (tot >= 0 ? '+' : '−') + n2(Math.abs(tot)) + ' → ' + (tot >= 0 ? 'ONAY' : 'RED') + '</b>başvuru ' + (who + 1) + ': toplam skor (ortalama başvuru = 0)</div><div class="metric"><b>' + NAMES[top] + '</b>bu kararda en büyük katkı</div><div class="metric"><b>' + NAMES[gtop] + '</b>tüm başvurularda ortalama en büyük katkı (n = 8)</div>';
      if (view) xn.innerHTML = '<b>Küresel açıklama:</b> katkıların mutlak değerinin ortalaması “model genelde neye bakıyor”u gösterir. Burada ' + NAMES[gtop] + ' en büyüğüdür (' + n2(GLOB[gtop]) + '). Bu bilgi tek bir kararı açıklamaz.';
      else xn.innerHTML = '<b>Yerel açıklama (başvuru ' + (who + 1) + '):</b> skor ' + (tot >= 0 ? 'pozitif, onay' : 'negatif, red') + '. Karara en çok ' + NAMES[top] + ' katkı yapıyor (' + (c[top] >= 0 ? '+' : '−') + n2(Math.abs(c[top])) + '). Dört katkının toplamı skora eşittir; doğrusal modelde (özellikler bağımsız sayılırsa) Shapley katkısı ağırlık × (değer − ortalama) olarak hesaplanır. ' + (top !== gtop ? 'Burada yerel neden (' + NAMES[top] + ') küreseldekinden (' + NAMES[gtop] + ') farklı: iki açıklama farklı sorulara cevap verir.' : 'Bu başvuruda yerel neden küresel örüntüyle aynı.');;
    };
    drawXa();
  }

  /* ---------- 2) Qubit: 2ⁿ genlik var, ölçüm n bit verir ---------- */
  var ql = document.getElementById('qubitlab');
  if (ql) {
    var nI = slider(ql, 'qbn', 'Qubit / bit sayısı n', 1, 30, 1, 10), thI = slider(ql, 'qbt', 'Tek qubit açısı θ (°)', 0, 180, 5, 90);
    var qs = el('button', 'btn', '1000 ölçüm yap'); qs.type = 'button'; ql.appendChild(qs);
    var qm = el('div', 'metrics'); ql.appendChild(qm);
    var qg = el('div'); ql.appendChild(qg);
    var qn = el('div', 'callout idea'); ql.appendChild(qn);
    var shots = null, seed = 7;
    function rnd() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
    var drawQ = function () {
      var n = +nI.value, th = +thI.value, p0 = Math.pow(Math.cos(th * Math.PI / 360), 2);
      document.getElementById('qbno').textContent = n; document.getElementById('qbto').textContent = th;
      var big = Math.pow(2, n);
      qm.innerHTML = '<div class="metric"><b>' + n + ' bit</b>klasik: n bitlik tek bir değer tutar</div><div class="metric"><b>' + big.toLocaleString('tr-TR') + ' genlik</b>n qubitlik durum 2ⁿ sayı ile tanımlanır</div><div class="metric"><b>' + n + ' bit</b>ölçünce okunan bilgi (2ⁿ değil, n bit)</div><div class="metric"><b>P(0) = ' + pc(p0) + '</b>tek qubit: cos²(θ/2) · P(1) = ' + pc(1 - p0) + '</div>';
      var svg = '<svg style="width:100%;max-width:420px;height:auto;display:block;margin:12px 0" viewBox="0 0 420 80" role="img" aria-label="Tek qubitin ölçüm olasılıkları"><rect x="10" y="12" width="' + (p0 * 400).toFixed(1) + '" height="26" rx="4" style="fill:var(--brand)"/><rect x="' + (10 + p0 * 400).toFixed(1) + '" y="12" width="' + ((1 - p0) * 400).toFixed(1) + '" height="26" rx="4" style="fill:var(--warn)"/><text class="d-sm" x="10" y="56">0: ' + pc(p0) + '</text><text class="d-sm" x="410" y="56" text-anchor="end">1: ' + pc(1 - p0) + '</text>';
      if (shots) svg += '<text class="d-sm" x="10" y="74">1000 ölçüm: ' + shots[0] + ' kez 0, ' + shots[1] + ' kez 1</text>';
      qg.innerHTML = svg + '</svg>';
      qn.innerHTML = '<b>Süperpozisyon “her cevabı aynı anda okumak” değildir.</b> ' + n + ' qubit ' + big.toLocaleString('tr-TR') + ' genlikle anlatılır, ama ölçüm yapınca yalnızca ' + n + ' bitlik <b>tek bir sonuç</b> çıkar. Hesabın işe yaraması için algoritmanın genlikleri doğru sonucu öne çıkaracak biçimde düzenlemesi gerekir; bu her problem için bilinmiyor. Notun “inanılmaz paralel hesaplama” cümlesi bu yüzden fazla kestirmedir.';
    };
    qs.addEventListener('click', function () { var p0 = Math.pow(Math.cos(+thI.value * Math.PI / 360), 2), z = 0; for (var i = 0; i < 1000; i++) if (rnd() < p0) z++; shots = [z, 1000 - z]; drawQ(); });
    [nI, thI].forEach(function (i) { i.addEventListener('input', function () { shots = null; drawQ(); }); });
    drawQ();
  }

  /* ---------- 3) Otonom araç: algıla → karar ver → fren, durma mesafesi ---------- */
  var ol = document.getElementById('otolab');
  if (ol) {
    var A = 6;   // frenleme ivmesi, m/s² (bu sitenin varsayımı)
    var vI = slider(ol, 'otv', 'Hız (km/h)', 20, 130, 5, 50), rI = slider(ol, 'otr', 'Sensör menzili (m)', 10, 150, 5, 50), tI = slider(ol, 'ott', 'Algılama + karar gecikmesi (sn)', 0, 1.5, 0.1, 0.5);
    var og = el('div'); ol.appendChild(og);
    var om = el('div', 'metrics'); ol.appendChild(om);
    var on = el('div', 'callout idea'); ol.appendChild(on);
    var drawOt = function () {
      var kmh = +vI.value, R = +rI.value, t = +tI.value, v = kmh / 3.6;
      document.getElementById('otvo').textContent = kmh; document.getElementById('otro').textContent = R; document.getElementById('otto').textContent = String(t).replace('.', ',');
      var dr = v * t, db = v * v / (2 * A), tot = dr + db, rem = R - dr, ok = tot <= R + 1e-9;
      var vi = ok ? 0 : Math.sqrt(Math.max(0, v * v - 2 * A * Math.max(0, rem))) * 3.6;
      var W = 520, sc = W / Math.max(R, tot, 20) * 0.95;
      var svg = '<svg style="width:100%;max-width:560px;height:auto;display:block;margin:12px 0" viewBox="0 0 560 110" role="img" aria-label="Gecikme mesafesi, frenleme mesafesi ve sensör menzili"><rect x="10" y="14" width="' + (dr * sc).toFixed(1) + '" height="26" style="fill:var(--warn)"/><rect x="' + (10 + dr * sc).toFixed(1) + '" y="14" width="' + (db * sc).toFixed(1) + '" height="26" style="fill:var(--brand)"/><line x1="' + (10 + R * sc).toFixed(1) + '" y1="4" x2="' + (10 + R * sc).toFixed(1) + '" y2="52" style="stroke:var(' + (ok ? '--ok' : '--warn') + ');stroke-width:3"/><text class="d-sm" x="10" y="72">turuncu: gecikmede alınan yol ' + n1(dr) + ' m · mavi: frenleme ' + n1(db) + ' m</text><text class="d-sm" x="10" y="92">dikey çizgi: sensör menzili ' + R + ' m (toplam ' + n1(tot) + ' m)</text></svg>';
      og.innerHTML = svg;
      om.innerHTML = '<div class="metric"><b>' + n1(dr) + ' m</b>gecikmede alınan yol (v·t)</div><div class="metric"><b>' + n1(db) + ' m</b>frenleme mesafesi (v²/2a, a = 6 m/s²)</div><div class="metric"><b>' + n1(tot) + ' m</b>toplam durma mesafesi</div><div class="metric"><b>' + (ok ? 'Durur · ' + n1(R - tot) + ' m pay' : 'Çarpar · ' + Math.round(vi) + ' km/h') + '</b>engel ' + R + ' m ötede ise sonuç</div>';
      on.innerHTML = ok ? '<b>Araç engelden önce duruyor.</b> Toplam ' + n1(tot) + ' m, menzil ' + R + ' m. Hız iki katına çıkarsa frenleme mesafesi dört katına çıkar (v² ile artar); gecikme ise doğrusal ekler.' : '<b>Algılama yetmedi.</b> Toplam durma mesafesi ' + n1(tot) + ' m, sensör menzili ' + R + ' m. Frenleme başlayana kadar ' + n1(Math.min(dr, R)) + ' m gidildi; kalan yol frene yetmedi ve araç yaklaşık ' + Math.round(vi) + ' km/h ile çarpar. Çözüm: yavaşlamak, daha uzağı görmek ya da daha hızlı karar vermek. Bu üçü notun “gelişmiş sensörler ve güvenilirlik” fikrinin sayıya dökülmüş hâlidir.';
    };
    [vI, rI, tI].forEach(function (i) { i.addEventListener('input', drawOt); });
    drawOt();
  }
})();
