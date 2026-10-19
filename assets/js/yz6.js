/* Yapay Zekâ Temelleri · Bölüm 6: çözümleme (resolution) ile çürütme ve naive Bayes spam sınıflandırıcı. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function f3(x) { return (Math.round(x * 1000) / 1000).toFixed(3).replace('.', ','); }
  function pct(x) { return (Math.round(x * 1000) / 10).toString().replace('.', ',') + '%'; }

  /* ---------- 1) Çözümleme ile çürütme ---------- */
  var rl = document.getElementById('resolab');
  if (rl) {
    // literal: 'P' ya da '~P'; yan bağlaç: sıralı dizi
    var KB = [['~Yağmur', 'HavaIslak'], ['~HavaIslak', 'ŞemsiyeAl'], ['Yağmur']];
    var NAMES = ['K1: Yağmur ⇒ HavaIslak', 'K2: HavaIslak ⇒ ŞemsiyeAl', 'K3: Yağmur'];
    var queries = ['ŞemsiyeAl', 'GüneşGözlüğü'];
    var qi = 0, cl, tried, steps, done;
    function neg(l) { return l[0] === '~' ? l.slice(1) : '~' + l; }
    function show(c) { return c.length ? c.map(function (l) { return l[0] === '~' ? '¬' + l.slice(1) : l; }).join(' ∨ ') : '□ (boş yan bağlaç)'; }
    function key(c) { return c.slice().sort().join('|'); }
    function reset() {
      var q = queries[qi];
      cl = KB.map(function (c) { return c.slice(); }); cl.push([neg(q)]);
      tried = {}; steps = []; done = false; render();
    }
    function step() {
      if (done) return;
      var known = {}; cl.forEach(function (c) { known[key(c)] = 1; });
      for (var i = 0; i < cl.length; i++) for (var j = i + 1; j < cl.length; j++) {
        var pk = i + ',' + j; if (tried[pk]) continue; tried[pk] = 1;
        for (var a = 0; a < cl[i].length; a++) for (var b = 0; b < cl[j].length; b++) {
          if (cl[i][a] === neg(cl[j][b])) {
            var r = cl[i].filter(function (_, x) { return x !== a; }).concat(cl[j].filter(function (_, y) { return y !== b; }));
            r = r.filter(function (l, k) { return r.indexOf(l) === k; });
            if (known[key(r)]) continue;
            cl.push(r); steps.push({ n: cl.length, from: [i + 1, j + 1], res: r });
            if (!r.length) done = 'proved';
            render(); return;
          }
        }
      }
      done = 'stuck'; render();
    }
    var bar = el('div', 'chips'); rl.appendChild(bar);
    var qc = queries.map(function (q, k) { var b = el('button', 'chip', 'Sorgu: ' + q); b.type = 'button'; b.addEventListener('click', function () { qi = k; reset(); }); bar.appendChild(b); return b; });
    var sb = el('button', 'btn primary', 'Bir çözümleme adımı'); sb.type = 'button'; sb.addEventListener('click', step);
    var ab = el('button', 'btn', 'Sonuna kadar'); ab.type = 'button'; ab.addEventListener('click', function () { var g = 0; while (!done && g++ < 60) step(); });
    var bar2 = el('div', 'chips'); bar2.appendChild(sb); bar2.appendChild(ab); rl.appendChild(bar2);
    var list = el('div', 'scroll-x'); rl.appendChild(list);
    var note = el('div', 'callout idea'); rl.appendChild(note);
    function render() {
      qc.forEach(function (b, k) { b.setAttribute('aria-pressed', k === qi ? 'true' : 'false'); });
      var h = '<table class="cmp"><thead><tr><th>#</th><th>Yan bağlaç</th><th>Nereden?</th></tr></thead><tbody>';
      cl.forEach(function (c, i) { var src = i < KB.length ? NAMES[i] : i === KB.length ? 'Sorgunun olumsuzu: ¬' + queries[qi] : 'çözümleme ' + steps.filter(function (s) { return s.n === i + 1; })[0].from.join(' ve '); h += '<tr' + (c.length === 0 ? ' style="background:var(--ok-soft)"' : '') + '><td>' + (i + 1) + '</td><td class="mono">' + show(c) + '</td><td>' + src + '</td></tr>'; });
      list.innerHTML = h + '</tbody></table>';
      note.innerHTML = done === 'proved' ? '<b>Boş yan bağlaç türetildi (□).</b>KB ∧ ¬' + queries[qi] + ' çelişkili, yani doyurulamaz; demek ki <b>KB ⊨ ' + queries[qi] + '</b>. Çürütme yoluyla ispat tamam.' :
        done === 'stuck' ? '<b>Yeni çözümleyici üretilemiyor ama boş yan bağlaç çıkmadı.</b>KB ∧ ¬' + queries[qi] + ' doyurulabilir; yani KB, “' + queries[qi] + '”i gerektirmiyor. Bilgi tabanında bu sonucu veren bir şey yok.' :
        'KB cümleleri ve <b>sorgunun olumsuzu</b> yan bağlaç olarak başlar. Her adımda tamamlayıcı literal içeren (P ve ¬P) iki yan bağlaç çözümlenir. Amaç boş yan bağlaca ulaşmak.';
    }
    reset();
  }

  /* ---------- 2) Naive Bayes ---------- */
  var nb = document.getElementById('nblab');
  if (nb) {
    var WORDS = [['bedava', 0.60, 0.05], ['kredi', 0.45, 0.08], ['toplantı', 0.03, 0.35], ['rapor', 0.05, 0.30]];   // [kelime, P(w|spam), P(w|spam değil)]
    var sel = {}, prior = 0.4;
    var r1 = el('div', 'slider-row'); r1.innerHTML = '<label for="nbp">Önsel P(spam)</label><input id="nbp" type="range" min="5" max="95" step="5" value="40"><output id="nbpo">%40</output>'; nb.appendChild(r1);
    var bar3 = el('div', 'chips'); bar3.appendChild(el('span', 'tip', 'E-postada geçen kelimeler: '));
    var wb = WORDS.map(function (w) { var b = el('button', 'chip', w[0]); b.type = 'button'; b.addEventListener('click', function () { sel[w[0]] = !sel[w[0]]; draw(); }); bar3.appendChild(b); return b; });
    nb.appendChild(bar3);
    var tbl = el('div', 'scroll-x'); nb.appendChild(tbl);
    var info = el('div', 'metrics'); nb.appendChild(info);
    var note2 = el('div', 'callout idea'); nb.appendChild(note2);
    function draw() {
      prior = +r1.querySelector('input').value / 100; document.getElementById('nbpo').textContent = '%' + Math.round(prior * 100);
      var ps = prior, ph = 1 - prior, h = '<table class="cmp"><thead><tr><th>Kelime</th><th>P(k | spam)</th><th>P(k | spam değil)</th></tr></thead><tbody>';
      WORDS.forEach(function (w, i) { wb[i].setAttribute('aria-pressed', sel[w[0]] ? 'true' : 'false'); if (sel[w[0]]) { ps *= w[1]; ph *= w[2]; h += '<tr><td>' + w[0] + '</td><td>' + w[1].toString().replace('.', ',') + '</td><td>' + w[2].toString().replace('.', ',') + '</td></tr>'; } });
      var n = WORDS.filter(function (w) { return sel[w[0]]; }).length;
      if (!n) h += '<tr><td colspan="3"><i>Kelime seçilmedi: yalnızca önsel geçerli.</i></td></tr>';
      tbl.innerHTML = h + '</tbody></table>';
      var post = ps / (ps + ph);
      info.innerHTML = '<div class="metric"><b>' + f3(ps) + '</b>P(spam) · ΠP(kᵢ | spam)</div><div class="metric"><b>' + f3(ph) + '</b>P(değil) · ΠP(kᵢ | değil)</div><div class="metric"><b>' + pct(post) + '</b>normalize: P(spam | kelimeler)</div>';
      note2.innerHTML = '<b>Karar: ' + (ps > ph ? 'spam' : 'spam değil') + '.</b> Naive Bayes, kelimelerin sınıf verildiğinde birbirinden <b>bağımsız</b> olduğunu varsayar ve olasılıkları çarpar. Önseli değiştir: az rastlanan bir sınıfta (düşük önsel) kanıt gerekir. Kelimeleri tek tek ekleyip her çarpanın kararı nasıl çevirdiğine bak. Gerçekte “bedava” ile “kredi” ilişkili olabilir; varsayım kusurlu ama pratikte işe yarar.';
    }
    r1.querySelector('input').addEventListener('input', draw);
    draw();
  }
})();
