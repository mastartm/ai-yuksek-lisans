/* Bölüm sonu quizi: anında geri bildirim, yanlışta doğru cevabı gösterir, sonda konu bazlı özet verir.
   <div id="quiz" data-quiz="QUIZ_BOLUM_3"></div> */
(function () {
  'use strict';
  var box = document.getElementById('quiz');
  if (!box) return;
  var data = window[box.getAttribute('data-quiz')];
  if (!data) return;
  var LETTERS = ['A', 'B', 'C', 'D', 'E'];

  function safe(fn) { try { return fn(); } catch (e) { return null; } }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var order, pos, answers;
  var storeKey = 'quiz-best-' + data.id;

  function start(subset) {
    var base = subset || data.questions.map(function (_, i) { return i; });
    order = shuffle(base).map(function (qi) {
      var q = data.questions[qi];
      var opts = shuffle(q.options.map(function (t, i) { return { text: t, ok: i === q.correct }; }));
      return { qi: qi, q: q, opts: opts };
    });
    pos = 0; answers = [];
    render();
  }

  function render() {
    box.innerHTML = '';
    if (pos >= order.length) return summary();
    var item = order[pos];
    var wrap = h('div', 'quiz');
    wrap.appendChild(h('div', 'qhead', '<span>Soru ' + (pos + 1) + ' / ' + order.length + '</span><span>' + esc(item.q.topic) + '</span>'));
    var pr = h('div', 'progress'); pr.appendChild(h('i')); pr.firstChild.style.width = (pos / order.length * 100) + '%'; wrap.appendChild(pr);
    wrap.appendChild(h('div', 'qtext', esc(item.q.q)));
    var opts = h('div', 'opts'); wrap.appendChild(opts);
    var after = h('div', 'explain'); wrap.appendChild(after);

    item.opts.forEach(function (o, i) {
      var b = h('button', 'opt'); b.type = 'button';
      b.innerHTML = '<span class="letter">' + LETTERS[i] + '</span><span class="txt">' + esc(o.text) + '</span>';
      b.addEventListener('click', function () { choose(i, opts, after, item); });
      opts.appendChild(b);
    });
    box.appendChild(wrap);
  }

  function choose(i, opts, after, item) {
    var picked = item.opts[i], right = picked.ok;
    answers.push({ item: item, picked: picked.text, right: right });
    Array.prototype.forEach.call(opts.children, function (b, k) {
      b.disabled = true;
      var o = item.opts[k];
      if (o.ok) { b.classList.add('correct'); b.querySelector('.txt').insertAdjacentHTML('beforeend', '<span class="tagline">' + (right ? '✓ Doğru cevap' : '✓ Doğru cevap bu') + '</span>'); }
      else if (k === i) { b.classList.add('wrong'); b.querySelector('.txt').insertAdjacentHTML('beforeend', '<span class="tagline">✗ Senin cevabın</span>'); }
    });
    var box2 = h('div', 'callout ' + (right ? 'ok' : 'bad'), '<b>' + (right ? 'Doğru!' : 'Yanlış.') + '</b>' + esc(item.q.explain) + (item.q.ref ? '<div class="mm-note" style="margin-top:6px">📖 Ders notunda: ' + esc(item.q.ref) + '</div>' : ''));
    after.appendChild(box2);
    var nb = h('button', 'btn primary', pos === order.length - 1 ? 'Sonucu gör' : 'Sonraki soru');
    nb.type = 'button'; nb.style.marginTop = '8px';
    nb.addEventListener('click', function () { pos++; render(); box.scrollIntoView({ block: 'start' }); });
    after.appendChild(nb);
    nb.focus();
  }

  function summary() {
    var ok = answers.filter(function (a) { return a.right; }).length, n = answers.length;
    var pct = Math.round(ok / n * 100);
    var best = parseInt(safe(function () { return localStorage.getItem(storeKey); }), 10);
    var isFull = n === data.questions.length;
    if (isFull && (isNaN(best) || pct > best)) { safe(function () { localStorage.setItem(storeKey, String(pct)); }); }
    var wrap = h('div', 'quiz');
    wrap.appendChild(h('h2', '', 'Sonuç'));
    wrap.appendChild(h('div', 'result-big', ok + ' / ' + n));
    var msg = pct === 100 ? 'Hepsi doğru. Sınavda aynı rahatlıkla ilerlersin.' : pct >= 70 ? 'İyi gidiyorsun. Yanlışlarına aşağıdan bak.' : 'Bu bölümü slaytlardan bir kez daha gözden geçirmekte fayda var. Yanlışlarını tekrar çözebilirsin.';
    wrap.appendChild(h('p', '', msg + (isFull && !isNaN(best) ? ' <span class="mm-note">(Bu tarayıcıdaki en iyi sonucun: %' + Math.max(best, pct) + ')</span>' : '')));

    var topics = {};
    answers.forEach(function (a) { var t = a.item.q.topic; topics[t] = topics[t] || { ok: 0, n: 0 }; topics[t].n++; if (a.right) topics[t].ok++; });
    var tb = h('div', 'topics bars');
    Object.keys(topics).forEach(function (t) {
      var x = topics[t], row = h('div', 'barrow');
      row.innerHTML = '<span>' + esc(t) + '</span><span class="track"><span class="fill" style="width:' + (x.ok / x.n * 100) + '%;display:block"></span><span class="val">' + x.ok + '/' + x.n + '</span></span>';
      tb.appendChild(row);
    });
    wrap.appendChild(tb);

    var wrong = answers.filter(function (a) { return !a.right; });
    if (wrong.length) {
      wrap.appendChild(h('h3', '', 'Yanlış yaptıkların ve doğru cevapları'));
      var ul = h('ul', 'review');
      wrong.forEach(function (a) {
        var right = a.item.opts.filter(function (o) { return o.ok; })[0].text;
        ul.appendChild(h('li', '', '<b>' + esc(a.item.q.q) + '</b><div class="your">✗ Senin cevabın: ' + esc(a.picked) + '</div><div class="right">✓ Doğru cevap: ' + esc(right) + '</div><div class="mm-note" style="margin-top:6px">' + esc(a.item.q.explain) + (a.item.q.ref ? ' <b>📖 ' + esc(a.item.q.ref) + '</b>' : '') + '</div>'));
      });
      wrap.appendChild(ul);
    }
    var row = h('div', 'bar');
    var again = h('button', 'btn primary', 'Baştan çöz'); again.type = 'button'; again.addEventListener('click', function () { start(); box.scrollIntoView({ block: 'start' }); });
    row.appendChild(again);
    if (wrong.length) {
      var wr = h('button', 'btn', 'Sadece yanlışları tekrar çöz (' + wrong.length + ')'); wr.type = 'button';
      wr.addEventListener('click', function () { start(wrong.map(function (a) { return a.item.qi; })); box.scrollIntoView({ block: 'start' }); });
      row.appendChild(wr);
    }
    wrap.appendChild(row);
    box.appendChild(wrap);
  }

  start();
})();
