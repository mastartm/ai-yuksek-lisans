/* Yapay Zekâ Temelleri · Bölüm 5: doğruluk tablosuyla çıkarım ve ileri/geri zincirleme laboratuvarı. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function tf(b) { return b ? 'D' : 'Y'; }

  /* ---------- 1) Doğruluk tablosu ile çıkarım ---------- */
  var tt = document.getElementById('ttlab');
  if (tt) {
    var CASES = [
      { name: 'Modus ponens', kb: ['P', 'P ⇒ Q'], q: 'Q', f: [function (p, q) { return p; }, function (p, q) { return !p || q; }], g: function (p, q) { return q; }, why: 'KB’nin doğru olduğu tek satırda (P = D, Q = D) Q de doğrudur: çıkarım geçerli.' },
      { name: 'Modus tollens', kb: ['P ⇒ Q', '¬Q'], q: '¬P', f: [function (p, q) { return !p || q; }, function (p, q) { return !q; }], g: function (p, q) { return !p; }, why: 'KB’nin doğru olduğu tek satırda P yanlıştır: ¬P çıkar. Geçerli.' },
      { name: 'Veya ile eleme', kb: ['P ∨ Q', '¬P'], q: 'Q', f: [function (p, q) { return p || q; }, function (p, q) { return !p; }], g: function (p, q) { return q; }, why: 'P yanlışsa “P ya da Q”nun doğru olması için Q doğru olmalıdır. Geçerli.' },
      { name: 'Sonucu doğrulama (hatalı)', kb: ['P ⇒ Q', 'Q'], q: 'P', f: [function (p, q) { return !p || q; }, function (p, q) { return q; }], g: function (p, q) { return p; }, why: 'KB, P = Y, Q = D satırında da doğrudur ama orada P yanlış. Yani P zorunlu değil: çıkarım geçersiz. (Yağmur yağarsa yol ıslanır; yol ıslak, yağmur yağdı demek değildir: sulama arabası da olabilir.)' }
    ];
    var cur = 0;
    var bar = el('div', 'chips'); tt.appendChild(bar);
    var cb = CASES.map(function (c, i) { var b = el('button', 'chip', c.name); b.type = 'button'; b.addEventListener('click', function () { cur = i; draw(); }); bar.appendChild(b); return b; });
    var head = el('p', ''); tt.appendChild(head);
    var wrap = el('div', 'scroll-x'); tt.appendChild(wrap);
    var note = el('div', 'callout idea'); tt.appendChild(note);
    function draw() {
      var c = CASES[cur], rows = '', ok = true, kbRows = 0;
      cb.forEach(function (b, i) { b.setAttribute('aria-pressed', i === cur ? 'true' : 'false'); });
      head.innerHTML = '<b>KB</b> = { ' + c.kb.join(' ,  ') + ' } &nbsp; <b>Sorgu α</b> = ' + c.q + ' &nbsp;→&nbsp; KB ⊨ α ?';
      [[true, true], [true, false], [false, true], [false, false]].forEach(function (r) {
        var vals = c.f.map(function (fn) { return fn(r[0], r[1]); }), kb = vals.every(Boolean), a = c.g(r[0], r[1]);
        if (kb) { kbRows++; if (!a) ok = false; }
        rows += '<tr' + (kb ? ' style="background:var(--brand-soft)"' : '') + '><td>' + tf(r[0]) + '</td><td>' + tf(r[1]) + '</td>' + vals.map(function (v) { return '<td>' + tf(v) + '</td>'; }).join('') + '<td><b>' + (kb ? 'D' : '–') + '</b></td><td>' + tf(a) + '</td><td>' + (kb ? (a ? '✓' : '✗') : '') + '</td></tr>';
      });
      wrap.innerHTML = '<table class="cmp"><thead><tr><th>P</th><th>Q</th>' + c.kb.map(function (k) { return '<th>' + k + '</th>'; }).join('') + '<th>KB doğru?</th><th>' + c.q + '</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>';
      note.innerHTML = '<b>' + (ok ? 'KB ⊨ α: geçerli çıkarım.' : 'KB ⊭ α: çıkarım geçersiz.') + '</b> Mavi satırlar KB’nin doğru olduğu durumlardır; çıkarımın geçerli olması için sorgu <i>bu satırların hepsinde</i> doğru olmalıdır. ' + c.why;
    }
    draw();
  }

  /* ---------- 2) İleri ve geri zincirleme ---------- */
  var ch = document.getElementById('chainlab');
  if (ch) {
    var RULES = [
      { id: 'R1', ifs: ['Yağmur'], then: 'HavaIslak' },
      { id: 'R2', ifs: ['HavaIslak'], then: 'ŞemsiyeAl' },
      { id: 'R3', ifs: ['Güneşli'], then: 'GözlükTak' },
      { id: 'R4', ifs: ['Yağmur', 'Rüzgâr'], then: 'MontGiy' },
      { id: 'R5', ifs: ['MontGiy'], then: 'EvdenÇıkabilir' }
    ];
    var FACTS = ['Yağmur', 'Rüzgâr'], goal = 'ŞemsiyeAl';
    var info0 = el('p', '', '<b>Gerçekler:</b> Yağmur, Rüzgâr. &nbsp; <b>Kurallar:</b> R1 Yağmur ⇒ HavaIslak · R2 HavaIslak ⇒ ŞemsiyeAl · R3 Güneşli ⇒ GözlükTak · R4 Yağmur ∧ Rüzgâr ⇒ MontGiy · R5 MontGiy ⇒ EvdenÇıkabilir');
    ch.appendChild(info0);
    var bar2 = el('div', 'chips'); ch.appendChild(bar2);
    var gc = {};
    ['ŞemsiyeAl', 'MontGiy', 'GözlükTak'].forEach(function (g) { var b = el('button', 'chip', 'Hedef: ' + g); b.type = 'button'; b.addEventListener('click', function () { goal = g; run(); }); bar2.appendChild(b); gc[g] = b; });
    var grid = el('div', 'peas-grid'); ch.appendChild(grid);
    var fw = el('div', 'peas-c p'), bw = el('div', 'peas-c e'); grid.appendChild(fw); grid.appendChild(bw);
    var cnote = el('div', 'callout idea'); ch.appendChild(cnote);
    function forward() {
      var known = FACTS.slice(), steps = [], changed = true;
      while (changed) { changed = false; RULES.forEach(function (r) { if (known.indexOf(r.then) < 0 && r.ifs.every(function (x) { return known.indexOf(x) >= 0; })) { known.push(r.then); steps.push(r.id + ': ' + r.ifs.join(' ∧ ') + ' ⇒ <b>' + r.then + '</b>'); changed = true; } }); }
      return { steps: steps, known: known };
    }
    function backward(g, depth, trace, seen) {
      if (FACTS.indexOf(g) >= 0) { trace.push(g + ' → bilgi tabanında gerçek ✓'); return true; }
      if (seen.indexOf(g) >= 0) return false; seen.push(g);
      var rs = RULES.filter(function (r) { return r.then === g; });
      for (var i = 0; i < rs.length; i++) {
        trace.push('Hedef <b>' + g + '</b>: ' + rs[i].id + ' ile alt hedef(ler) ' + rs[i].ifs.join(', '));
        if (rs[i].ifs.every(function (x) { return backward(x, depth + 1, trace, seen); })) return true;
      }
      trace.push(g + ' → kanıtlanamadı ✗'); return false;
    }
    function run() {
      Object.keys(gc).forEach(function (k) { gc[k].setAttribute('aria-pressed', k === goal ? 'true' : 'false'); });
      var f = forward(), tr = [], ok = backward(goal, 0, tr, []);
      fw.innerHTML = '<b>İleri zincirleme (veri güdümlü)</b><ol>' + f.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol><p>' + f.steps.length + ' yeni gerçek üretti; hedef ' + (f.known.indexOf(goal) >= 0 ? '<b>üretildi</b>' : '<b>üretilemedi</b>') + '.</p>';
      bw.innerHTML = '<b>Geri zincirleme (hedef güdümlü)</b><ol>' + tr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol><p>' + tr.length + ' adımda sonuç: <b>' + (ok ? 'kanıtlandı' : 'kanıtlanamadı') + '</b>.</p>';
      cnote.innerHTML = 'İleri zincirleme hedefi bilmeden <b>her sonucu</b> çıkarır (hedef ŞemsiyeAl iken MontGiy ve EvdenÇıkabilir de türetilir). Geri zincirleme yalnızca hedefi destekleyen kuralları dolaşır. Hedefi değiştirip iki yöntemin adımlarını karşılaştır. Hedef <b>GözlükTak</b> ise “Güneşli” gerçeği olmadığı için hiçbiri sonuca varamaz.';
    }
    run();
  }
})();
