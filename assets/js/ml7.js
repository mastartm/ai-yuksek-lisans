/* Makine Öğrenmesi · Bölüm 7: naive Bayes (TenisOyna), karışıklık matrisi metrikleri ve önyükleme (bootstrap). */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function f3(x) { return (Math.round(x * 1000) / 1000).toFixed(3).replace('.', ','); }
  function f4(x) { return (Math.round(x * 10000) / 10000).toFixed(4).replace('.', ','); }
  function pct(x) { return (Math.round(x * 1000) / 10).toString().replace('.', ',') + '%'; }

  /* ---------- 1) Naive Bayes: TenisOyna ---------- */
  var nb = document.getElementById('tenislab');
  if (nb) {
    var ATTR = [['Gökyüzü', ['Güneşli', 'Bulutlu', 'Yağmurlu']], ['Sıcaklık', ['Sıcak', 'Ilık', 'Serin']], ['Nem', ['Yüksek', 'Normal']], ['Rüzgar', ['Zayıf', 'Güçlü']]];
    // 14 gün: [gökyüzü, sıcaklık, nem, rüzgar, oyna(1=evet)]
    var D = [['Güneşli', 'Sıcak', 'Yüksek', 'Zayıf', 0], ['Güneşli', 'Sıcak', 'Yüksek', 'Güçlü', 0], ['Bulutlu', 'Sıcak', 'Yüksek', 'Zayıf', 1], ['Yağmurlu', 'Ilık', 'Yüksek', 'Zayıf', 1],
             ['Yağmurlu', 'Serin', 'Normal', 'Zayıf', 1], ['Yağmurlu', 'Serin', 'Normal', 'Güçlü', 0], ['Bulutlu', 'Serin', 'Normal', 'Güçlü', 1], ['Güneşli', 'Ilık', 'Yüksek', 'Zayıf', 0],
             ['Güneşli', 'Serin', 'Normal', 'Zayıf', 1], ['Yağmurlu', 'Ilık', 'Normal', 'Zayıf', 1], ['Güneşli', 'Ilık', 'Normal', 'Güçlü', 1], ['Bulutlu', 'Ilık', 'Yüksek', 'Güçlü', 1],
             ['Bulutlu', 'Sıcak', 'Normal', 'Zayıf', 1], ['Yağmurlu', 'Ilık', 'Yüksek', 'Güçlü', 0]];
    var sel = ['Güneşli', 'Serin', 'Yüksek', 'Güçlü'], m = 0, selects = [];
    ATTR.forEach(function (a, i) {
      var r = el('div', 'slider-row'); r.innerHTML = '<label for="tn' + i + '">' + a[0] + '</label><select id="tn' + i + '">' + a[1].map(function (v) { return '<option' + (v === sel[i] ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select><span></span>';
      nb.appendChild(r); var s = r.querySelector('select'); s.addEventListener('change', function () { sel[i] = s.value; draw(); }); selects.push(s);
    });
    var rm = el('div', 'slider-row'); rm.innerHTML = '<label for="tnm">m (eşdeğer örnek)</label><input id="tnm" type="range" min="0" max="10" step="1" value="0"><output id="tnmo">0</output>'; nb.appendChild(rm);
    var tbl = el('div', 'scroll-x'); nb.appendChild(tbl);
    var info = el('div', 'metrics'); nb.appendChild(info);
    var note = el('div', 'callout idea'); nb.appendChild(note);
    function frac(a, b) { return a + '/' + b; }
    function draw() {
      m = +rm.querySelector('input').value; document.getElementById('tnmo').textContent = m;
      var out = {}, rows = '', cls = [[1, 'evet'], [0, 'hayır']];
      cls.forEach(function (c) {
        var n = D.filter(function (r) { return r[4] === c[0]; }).length, prod = n / 14;
        out[c[1]] = { n: n, f: [], prod: 0 };
        ATTR.forEach(function (a, i) {
          var nc = D.filter(function (r) { return r[4] === c[0] && r[i] === sel[i]; }).length, p = 1 / a[1].length;
          var est = (nc + m * p) / (n + m); out[c[1]].f.push([nc, n, est]); prod *= est;
        });
        out[c[1]].prod = prod;
      });
      ATTR.forEach(function (a, i) {
        rows += '<tr><td>P(' + sel[i].toLowerCase() + ' | ' + 'evet)</td><td>' + frac(out.evet.f[i][0], out.evet.f[i][1]) + (m ? ' → ' + f3(out.evet.f[i][2]) : ' = ' + f3(out.evet.f[i][2])) + '</td><td>P(' + sel[i].toLowerCase() + ' | hayır)</td><td>' + frac(out['hayır'].f[i][0], out['hayır'].f[i][1]) + (m ? ' → ' + f3(out['hayır'].f[i][2]) : ' = ' + f3(out['hayır'].f[i][2])) + '</td></tr>';
      });
      tbl.innerHTML = '<table class="cmp"><thead><tr><th>Evet için</th><th>Tahmin</th><th>Hayır için</th><th>Tahmin</th></tr></thead><tbody><tr><td>P(evet)</td><td>9/14 = 0,643</td><td>P(hayır)</td><td>5/14 = 0,357</td></tr>' + rows + '</tbody></table>';
      var a = out.evet.prod, b = out['hayır'].prod, tot = a + b;
      info.innerHTML = '<div class="metric"><b>' + f4(a) + '</b>evet skoru</div><div class="metric"><b>' + f4(b) + '</b>hayır skoru</div><div class="metric"><b>' + (tot > 0 ? pct(a / tot) : '–') + '</b>P(evet | gün) (normalize)</div>';
      var zero = out.evet.f.concat(out['hayır'].f).some(function (x) { return x[0] === 0; });
      note.innerHTML = '<b>Karar: ' + (a > b ? 'tenis oynanır' : tot === 0 ? 'karar verilemiyor' : 'tenis oynanmaz') + '.</b> ' + (zero && m === 0 ? 'Bir kesir <b>0</b> çıktı: çarpım sıfıra iner ve diğer tüm kanıtlar yok sayılır. m kaydırıcısını artır: m-tahmini sıfırı yumuşatır.' : 'Skorlar çarpılarak bulunur; en büyük skor kazanır. m’yi artırınca küçük örneklemden gelen kesirler “önsel tahmine” (burada 1/değer sayısı) doğru çekilir.');
    }
    rm.querySelector('input').addEventListener('input', draw);
    draw();
  }

  /* ---------- 2) Karışıklık matrisi ---------- */
  var cf = document.getElementById('conflab');
  if (cf) {
    var V = { tp: 40, fn: 10, fp: 10, tn: 40 };
    var bar = el('div', 'chips'); cf.appendChild(bar);
    function preset(label, v) { var b = el('button', 'btn', label); b.type = 'button'; b.addEventListener('click', function () { V = { tp: v[0], fn: v[1], fp: v[2], tn: v[3] }; Object.keys(V).forEach(function (k) { sl[k].value = V[k]; }); draw2(); }); bar.appendChild(b); }
    preset('Dengeli sınıflar', [40, 10, 10, 40]);
    preset('Nadir pozitif (dolandırıcılık gibi)', [6, 24, 10, 960]);
    preset('Hep “negatif” diyen model', [0, 30, 0, 970]);
    var sl = {};
    [['tp', 'Gerçek pozitif (TP)'], ['fn', 'Yanlış negatif (FN)'], ['fp', 'Yanlış pozitif (FP)'], ['tn', 'Gerçek negatif (TN)']].forEach(function (a) {
      var r = el('div', 'slider-row'); r.innerHTML = '<label for="cf' + a[0] + '">' + a[1] + '</label><input id="cf' + a[0] + '" type="range" min="0" max="1000" step="1" value="' + V[a[0]] + '"><output id="cf' + a[0] + 'o"></output>'; cf.appendChild(r);
      sl[a[0]] = r.querySelector('input'); sl[a[0]].addEventListener('input', function () { V[a[0]] = +sl[a[0]].value; draw2(); });
    });
    var tb = el('div', 'scroll-x'); cf.appendChild(tb);
    var inf = el('div', 'metrics'); cf.appendChild(inf);
    var nt = el('div', 'callout idea'); cf.appendChild(nt);
    function dv(a, b) { return b > 0 ? a / b : 0; }
    function draw2() {
      Object.keys(V).forEach(function (k) { document.getElementById('cf' + k + 'o').textContent = V[k]; });
      var P = V.tp + V.fn, N = V.fp + V.tn, T = P + N;
      var acc = dv(V.tp + V.tn, T), rec = dv(V.tp, P), spec = dv(V.tn, N), prec = dv(V.tp, V.tp + V.fp), F = dv(2 * prec * rec, prec + rec);
      tb.innerHTML = '<table class="cmp"><thead><tr><th></th><th>Tahmin: pozitif</th><th>Tahmin: negatif</th><th>Toplam</th></tr></thead><tbody><tr><td><b>Gerçekte pozitif</b></td><td>TP = ' + V.tp + '</td><td>FN = ' + V.fn + '</td><td>P = ' + P + '</td></tr><tr><td><b>Gerçekte negatif</b></td><td>FP = ' + V.fp + '</td><td>TN = ' + V.tn + '</td><td>N = ' + N + '</td></tr></tbody></table>';
      inf.innerHTML = '<div class="metric"><b>' + pct(acc) + '</b>doğruluk (TP+TN)/(P+N)</div><div class="metric"><b>' + pct(rec) + '</b>duyarlılık/hatırlama TP/P</div><div class="metric"><b>' + pct(spec) + '</b>özgüllük TN/N</div><div class="metric"><b>' + pct(prec) + '</b>kesinlik TP/(TP+FP)</div><div class="metric"><b>' + pct(F) + '</b>F ölçüsü</div>';
      nt.innerHTML = (T > 0 && P / T < 0.1 && acc > 0.9 ? '<b>Doğruluk yanıltıyor.</b>Pozitif sınıf nadir (' + pct(P / T) + '); doğruluk yüksek görünse de modelin gerçek pozitiflerin yalnızca ' + pct(rec) + '’ini yakaladığına bak. Sınıflar dengesizse duyarlılık, özgüllük, kesinlik ve F ölçüsü birlikte okunmalıdır.' : 'Doğruluk, sınıflar aşağı yukarı eşit dağıldığında iyi bir özettir. Kesinlik “pozitif dediklerinin kaçı gerçekten pozitif?”, hatırlama “gerçek pozitiflerin kaçını yakaladı?” sorusunu yanıtlar; F ölçüsü bu ikisinin harmonik ortalamasıdır.');
    }
    draw2();
  }

  /* ---------- 3) Önyükleme ---------- */
  var bt = document.getElementById('bootlab');
  if (bt) {
    var rd = el('div', 'slider-row'); rd.innerHTML = '<label for="bsd">Veri sayısı d</label><input id="bsd" type="range" min="10" max="2000" step="10" value="200"><output id="bsdo">200</output>'; bt.appendChild(rd);
    var bb = el('button', 'btn primary', 'Bir önyükleme örneği çek'); bb.type = 'button'; bt.appendChild(bb);
    var bi = el('div', 'metrics'); bt.appendChild(bi);
    var bn = el('div', 'callout idea'); bt.appendChild(bn);
    function run() {
      var d = +rd.querySelector('input').value; document.getElementById('bsdo').textContent = d;
      var seen = {}, i, u = 0; for (i = 0; i < d; i++) { var k = Math.floor(Math.random() * d); if (!seen[k]) { seen[k] = 1; u++; } }
      var th = 1 - Math.pow(1 - 1 / d, d);
      bi.innerHTML = '<div class="metric"><b>' + u + ' / ' + d + '</b>eğitim kümesine giren farklı kayıt</div><div class="metric"><b>' + pct(u / d) + '</b>bu çekilişte oran</div><div class="metric"><b>' + pct(th) + '</b>kuramsal oran 1 − (1 − 1/d)ᵈ</div><div class="metric"><b>' + (d - u) + '</b>seçilmeyen: test kümesi</div>';
      bn.innerHTML = 'Her çekilişte bir kayıt <b>yerine konarak</b> seçilir; bu yüzden bazıları birkaç kez, bazıları hiç seçilmez. d büyüdükçe seçilen farklı kayıtların oranı yaklaşık <b>%63,2</b>’ye, seçilmeyenlerin oranı e⁻¹ ≈ <b>%36,8</b>’e yaklaşır. Seçilmeyenler test kümesi olur (.632 önyükleme).';
    }
    rd.querySelector('input').addEventListener('input', run); bb.addEventListener('click', run);
    run();
  }
})();
