/* Makine Öğrenmesi · Bölüm 12: PAC örnek sayısı hesabı, örnek kümesini bölme (VC boyutu) ve hata sınırı oyunu.
   Sayılar ve örnek kümeleri bu site için seçilmiştir. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function tr(x, d) { return (Math.round(x * Math.pow(10, d || 0)) / Math.pow(10, d || 0)).toString().replace('.', ','); }

  /* ---------- 1) PAC: örnek sayısı ---------- */
  (function pacLab() {
    var root = document.getElementById('paclab');
    if (!root) return;
    function sl(id, label, min, max, step, val) { var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>'; root.appendChild(r); var i = r.querySelector('input'); i.addEventListener('input', draw); return i; }
    var bar = el('div', 'chips'); root.appendChild(bar);
    var bp = el('button', 'btn', 'Notun örneği: n = 10, ε = 0,1, δ = 0,05'); bp.type = 'button'; bar.appendChild(bp);
    var iN = sl('pn', 'Değişken sayısı n', 1, 30, 1, 10), iE = sl('pe', 'Hata sınırı ε', 0.01, 0.5, 0.01, 0.1), iD = sl('pd', 'Başarısızlık olasılığı δ', 0.01, 0.5, 0.01, 0.05);
    bp.addEventListener('click', function () { iN.value = 10; iE.value = 0.1; iD.value = 0.05; draw(); });
    var info = el('div', 'metrics'); root.appendChild(info);
    var tb = el('div', 'scroll-x'); root.appendChild(tb);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function need(n, e, d) { return Math.ceil((n * Math.log(3) + Math.log(1 / d)) / e - 1e-9); }
    function draw() {
      var n = +iN.value, e = +iE.value, d = +iD.value;
      document.getElementById('pno').textContent = n; document.getElementById('peo').textContent = tr(e, 2); document.getElementById('pdo').textContent = tr(d, 2);
      var m = need(n, e, d);
      info.innerHTML = '<div class="metric"><b>3<sup>' + n + '</sup> = ' + Math.pow(3, n).toLocaleString('tr-TR') + '</b>|H| (hipotez sayısı)</div><div class="metric"><b>' + m.toLocaleString('tr-TR') + '</b>yeterli eğitim örneği m</div><div class="metric"><b>%' + tr((1 - d) * 100, 0) + '</b>başarı olasılığı (1 − δ)</div>';
      var rows = [['n’i iki katına çıkar', need(2 * n, e, d)], ['ε’u yarıya indir', need(n, e / 2, d)], ['δ’yı yarıya indir', need(n, e, d / 2)]];
      tb.innerHTML = '<table class="cmp"><thead><tr><th>Değişiklik</th><th>Yeni m</th><th>Artış</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1].toLocaleString('tr-TR') + '</td><td>×' + tr(r[1] / m, 2) + '</td></tr>'; }).join('') + '</tbody></table>';
      note.innerHTML = 'm ≥ (1/ε)·(ln|H| + ln(1/δ)) ve |H| = 3ⁿ. m, <b>n ve 1/ε</b> ile yaklaşık doğrusal; <b>1/δ</b> ile yalnızca logaritmik büyür: δ’yı yarıya indirmek m’yi çok az artırırken ε’u yarıya indirmek yaklaşık iki katına çıkarır.';
    }
    draw();
  })();

  /* ---------- 2) Örnek kümesini bölme (shattering) ---------- */
  (function shatterLab() {
    var root = document.getElementById('shatlab');
    if (!root) return;
    var H = 'esik', S = 2;
    var bar1 = el('div', 'chips'); root.appendChild(bar1);
    var bar2 = el('div', 'chips'); bar2.style.marginTop = '8px'; root.appendChild(bar2);
    [['esik', 'H₁: eşik (x > a ise +)'], ['aralik', 'H₂: aralık (a < x < b ise +)']].forEach(function (a) { var b = el('button', 'chip', a[1]); b.type = 'button'; b.dataset.g = 'H'; b.dataset.k = a[0]; b.addEventListener('click', function () { H = a[0]; draw(); }); bar1.appendChild(b); });
    [1, 2, 3, 4].forEach(function (k) { var b = el('button', 'chip', 'S: ' + k + ' nokta'); b.type = 'button'; b.dataset.g = 'S'; b.dataset.k = k; b.addEventListener('click', function () { S = k; draw(); }); bar2.appendChild(b); });
    var info = el('div', 'metrics'); root.appendChild(info);
    var tb = el('div', 'scroll-x'); root.appendChild(tb);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function realized(k, kind) {
      var set = {}, a, b, i, cuts = []; for (i = 0; i <= k; i++) cuts.push(i + 0.5);
      cuts.forEach(function (a) {
        if (kind === 'esik') { var s = ''; for (i = 1; i <= k; i++) s += (i > a ? '1' : '0'); set[s] = 1; }
        else cuts.forEach(function (b) { if (b >= a) { var s = ''; for (i = 1; i <= k; i++) s += (i > a && i < b ? '1' : '0'); set[s] = 1; } });
      });
      return set;
    }
    function draw() {
      Array.prototype.forEach.call(root.querySelectorAll('.chip'), function (b) { b.setAttribute('aria-pressed', String(String(b.dataset.g === 'H' ? H : S) === b.dataset.k)); });
      var set = realized(S, H), total = Math.pow(2, S), rows = '', ok = 0, m;
      for (m = 0; m < total; m++) {
        var s = ''; for (var i = S - 1; i >= 0; i--) s += (m >> i) & 1;
        var yes = !!set[s]; if (yes) ok++;
        rows += '<tr><td class="mono">' + s.split('').map(function (c) { return c === '1' ? '+' : '−'; }).join(' ') + '</td><td>' + (yes ? 'H’de bu bölmeyi yapan hipotez var' : 'H’de yok') + '</td></tr>';
      }
      tb.innerHTML = '<table class="cmp"><thead><tr><th>S’nin bir dikotomisi (x₁ … x' + S + ')</th><th>Durum</th></tr></thead><tbody>' + rows + '</tbody></table>';
      var shat = ok === total, vc = 0, k;
      for (k = 1; k <= 4; k++) { if (Object.keys(realized(k, H)).length === Math.pow(2, k)) vc = k; else break; }
      info.innerHTML = '<div class="metric"><b>' + total + '</b>olası dikotomi (2<sup>|S|</sup>)</div><div class="metric"><b>' + ok + '</b>H’nin ifade edebildiği</div><div class="metric"><b>' + (shat ? 'evet' : 'hayır') + '</b>H, S’yi böler mi?</div><div class="metric"><b>' + vc + '</b>bu dört noktada bulunan en büyük bölünen küme</div>';
      note.innerHTML = shat ? '<b>H, bu ' + S + ' noktalı kümeyi böler:</b> iki gruba ayırmanın her yolunu ifade eden bir hipotez var. S büyüdükçe bunu sürdürebiliyorsa H’nin ifade gücü büyüktür.' : '<b>H, bu kümeyi bölemiyor:</b> ifade edemediği en az bir dikotomi var. Bu yüzden H için VC boyutu bu kümeden küçüktür.';
    }
    draw();
  })();

  /* ---------- 3) Hata sınırı: çevrimiçi tahmin ---------- */
  (function mistakeLab() {
    var root = document.getElementById('mistlab');
    if (!root) return;
    var N = 4, target = [[0, 1], [2, 0]]; // x1 ve ¬x3 (indeks 0 ve 2)
    var h, seen, mist, last, hist;
    var bar = el('div', 'chips'); root.appendChild(bar);
    var b1 = el('button', 'btn primary', 'Bir örnek gelsin'); b1.type = 'button';
    var b2 = el('button', 'btn', '20 örnek gelsin'); b2.type = 'button';
    var b3 = el('button', 'btn', 'Baştan başla'); b3.type = 'button';
    bar.appendChild(b1); bar.appendChild(b2); bar.appendChild(b3);
    var info = el('div', 'metrics'); root.appendChild(info);
    var tb = el('div', 'scroll-x'); root.appendChild(tb);
    var note = el('div', 'callout idea'); root.appendChild(note);
    function lit(l) { return (l[1] === 0 ? '¬' : '') + 'x' + (l[0] + 1); }
    function val(l, x) { return l[1] === 1 ? x[l[0]] === 1 : x[l[0]] === 0; }
    function holds(lits, x) { return lits.length > 0 && lits.every(function (l) { return val(l, x); }); }
    function reset() {
      h = []; for (var i = 0; i < N; i++) { h.push([i, 1]); h.push([i, 0]); }
      seen = 0; mist = 0; last = null; hist = []; draw();
    }
    function tc(x) { return val([0, 1], x) && val([2, 0], x) ? 1 : 0; }
    function step() {
      var x = []; for (var i = 0; i < N; i++) x.push(Math.random() < 0.5 ? 1 : 0);
      var pred = holds(h, x) ? 1 : 0, truth = tc(x);
      seen++;
      if (pred !== truth) mist++;
      if (truth === 1) h = h.filter(function (l) { return val(l, x); });
      hist.unshift({ x: x, pred: pred, truth: truth, wrong: pred !== truth }); hist = hist.slice(0, 8);
      draw();
    }
    function draw() {
      info.innerHTML = '<div class="metric"><b>' + seen + '</b>gelen örnek</div><div class="metric"><b>' + mist + '</b>yapılan hata</div><div class="metric"><b>' + (h.length === 2 * N ? 'henüz yok (hiçbir şeye “+” demiyor)' : h.map(lit).join(' ∧ ')) + '</b>öğrenicinin şimdiki hipotezi</div>';
      tb.innerHTML = '<table class="cmp"><thead><tr><th>Örnek (x₁ x₂ x₃ x₄)</th><th>Tahmin</th><th>Gerçek</th><th></th></tr></thead><tbody>' + (hist.length ? hist.map(function (r) { return '<tr><td class="mono">' + r.x.join(' ') + '</td><td>' + (r.pred ? '+' : '−') + '</td><td>' + (r.truth ? '+' : '−') + '</td><td>' + (r.wrong ? '<b>hata</b>' : 'doğru') + '</td></tr>'; }).join('') : '<tr><td colspan="4">Henüz örnek gelmedi.</td></tr>') + '</tbody></table>';
      note.innerHTML = 'Gizli hedef kavram: <b>x₁ ∧ ¬x₃</b>. Öğrenici her örneği görünce <b>önce tahmin eder</b>, sonra doğru değeri öğrenir; yanlış tahminler sayılır. Hata sayısı ilk başta artar, hipotez hedefe yaklaşınca durur. Öğrenici yalnızca pozitif örneklerden öğrenir (en özel hipotezi genelleştirir).';
    }
    b1.addEventListener('click', step);
    b2.addEventListener('click', function () { for (var i = 0; i < 20; i++) step(); });
    b3.addEventListener('click', reset);
    reset();
  })();
})();
