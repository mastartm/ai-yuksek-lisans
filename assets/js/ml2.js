/* Makine Öğrenmesi · Bölüm 2: hipotez deneme tahtası, FIND-S ve ADAY-ELEME laboratuvarı.
   Veri kümesi bu site için tasarlanmıştır: "Arkadaşlarla basketbol oynanır mı?" */
(function () {
  'use strict';
  var ATTR = ['Hava', 'Sıcaklık', 'Zemin', 'Oyuncu'];
  var DOM = [['Güneşli', 'Yağmurlu'], ['Ilık', 'Soğuk'], ['Kuru', 'Islak'], ['Yeterli', 'Eksik']];
  var EX = [
    { x: ['Güneşli', 'Ilık', 'Kuru', 'Yeterli'], y: 1 },
    { x: ['Güneşli', 'Soğuk', 'Kuru', 'Yeterli'], y: 1 },
    { x: ['Yağmurlu', 'Ilık', 'Islak', 'Yeterli'], y: 0 },
    { x: ['Güneşli', 'Ilık', 'Kuru', 'Eksik'], y: 0 }
  ];

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function covers(h, x) { for (var i = 0; i < h.length; i++) { if (h[i] === null) return false; if (h[i] !== '?' && h[i] !== x[i]) return false; } return true; }
  function geq(a, b) { // a, b'den genel mi (veya eşit)?
    if (b.some(function (v) { return v === null; })) return true;
    for (var i = 0; i < a.length; i++) { if (a[i] === null) return false; if (a[i] !== '?' && a[i] !== b[i]) return false; }
    return true;
  }
  function show(h) { return '⟨' + h.map(function (v) { return v === null ? '∅' : v; }).join(', ') + '⟩'; }
  function allNull() { return [null, null, null, null]; }
  function allQ() { return ['?', '?', '?', '?']; }
  function same(a, b) { return a.every(function (v, i) { return v === b[i]; }); }
  function generalize(s, x) { if (s.every(function (v) { return v === null; })) return x.slice(); return s.map(function (v, i) { return v === x[i] ? v : '?'; }); }

  /* ----- Algoritmalar: her örnekten sonra anlık görüntü ----- */
  function runFindS(ex) {
    var h = allNull(), snaps = [{ h: h.slice(), i: -1, note: 'En özel hipotezle başla: hiçbir şeyi kabul etmez.' }];
    ex.forEach(function (e, i) {
      var note;
      if (e.y === 1) { var before = show(h); h = covers(h, e.x) ? h : generalize(h, e.x); note = 'Örnek ' + (i + 1) + ' pozitif: ' + (before === show(h) ? 'hipotez zaten kapsıyor, değişmedi.' : 'hipotez genelleştirildi.'); }
      else note = 'Örnek ' + (i + 1) + ' negatif: FIND-S negatif örnekleri yok sayar, hipotez değişmedi.';
      snaps.push({ h: h.slice(), i: i, note: note });
    });
    return snaps;
  }
  function runCE(ex) {
    var S = [allNull()], G = [allQ()], snaps = [{ S: S.map(function (v) { return v.slice(); }), G: G.map(function (v) { return v.slice(); }), i: -1, note: 'Başlangıç: S en özel, G en genel hipotez. Tüm hipotezler bu ikisinin arasında.' }];
    ex.forEach(function (e, i) {
      var note;
      if (e.y === 1) {
        G = G.filter(function (g) { return covers(g, e.x); });
        var newS = [];
        S.forEach(function (s) { var h = covers(s, e.x) ? s : generalize(s, e.x); if (G.some(function (g) { return geq(g, h); })) newS.push(h); });
        S = newS.filter(function (a, k) { return !newS.some(function (b, m) { return m !== k && !same(a, b) && geq(a, b); }) && newS.findIndex(function (b) { return same(a, b); }) === k; });
        note = 'Örnek ' + (i + 1) + ' pozitif: G’de bu örneği kapsamayanlar elendi, S genelleştirildi.';
      } else {
        S = S.filter(function (s) { return !covers(s, e.x); });
        var newG = [];
        G.forEach(function (g) {
          if (!covers(g, e.x)) { newG.push(g); return; }
          g.forEach(function (v, k) {
            if (v !== '?') return;
            DOM[k].forEach(function (val) {
              if (val === e.x[k]) return;
              var h = g.slice(); h[k] = val;
              if (S.some(function (s) { return geq(h, s); })) newG.push(h);
            });
          });
        });
        G = newG.filter(function (a, k) { return !newG.some(function (b, m) { return m !== k && !same(a, b) && geq(b, a); }) && newG.findIndex(function (b) { return same(a, b); }) === k; });
        note = 'Örnek ' + (i + 1) + ' negatif: S’de bu örneği kapsayanlar elendi, G özelleştirildi.';
      }
      snaps.push({ S: S.map(function (v) { return v.slice(); }), G: G.map(function (v) { return v.slice(); }), i: i, note: note });
    });
    return snaps;
  }
  /* Bağımsız doğrulama: tüm bağlaçlı hipotezleri say, verilerle tutarlı olanları döndür */
  function versionSpace(ex) {
    var all = [allNull()];
    (function rec(i, cur) { if (i === 4) { all.push(cur.slice()); return; } ['?'].concat(DOM[i]).forEach(function (v) { cur[i] = v; rec(i + 1, cur); }); })(0, []);
    return all.filter(function (h) { return ex.every(function (e) { return covers(h, e.x) === !!e.y; }); });
  }

  /* ----- 1) Hipotez deneme tahtası ----- */
  var hb = document.getElementById('hypo');
  if (hb) {
    var cur = ['?', '?', '?', '?'];
    var row = el('div', 'hyp-sel'); hb.appendChild(row);
    var sels = ATTR.map(function (a, i) {
      var wrap = el('label', 'hyp-s', '<span>' + a + '</span>'); var s = el('select');
      ['?'].concat(DOM[i]).concat(['∅']).forEach(function (v) { var o = el('option', '', v === '?' ? '? (herhangi)' : v === '∅' ? '∅ (hiçbiri)' : v); o.value = v; s.appendChild(o); });
      s.addEventListener('change', function () { cur[i] = s.value === '∅' ? null : s.value; draw(); });
      wrap.appendChild(s); row.appendChild(wrap); return s;
    });
    var tbl = el('div', 'scroll-x'); hb.appendChild(tbl);
    var out = el('div', 'status'); hb.appendChild(out);
    var draw = function () {
      var okAll = true, html = '<table class="cmp"><thead><tr><th>#</th>' + ATTR.map(function (a) { return '<th>' + a + '</th>'; }).join('') + '<th>Gerçek</th><th>Hipotez</th><th></th></tr></thead><tbody>';
      EX.forEach(function (e, i) {
        var p = covers(cur, e.x), ok = p === !!e.y; if (!ok) okAll = false;
        html += '<tr><td>' + (i + 1) + '</td>' + e.x.map(function (v) { return '<td>' + v + '</td>'; }).join('') + '<td><b>' + (e.y ? 'Evet' : 'Hayır') + '</b></td><td>' + (p ? 'Evet' : 'Hayır') + '</td><td>' + (ok ? '<span class="yes">✓</span>' : '<span class="no">✗</span>') + '</td></tr>';
      });
      tbl.innerHTML = html + '</tbody></table>';
      out.innerHTML = '<b>Hipotezin: ' + show(cur) + '</b> · ' + (okAll ? '<span class="yes">Dört örnekle de tutarlı.</span> Başka tutarlı hipotezler de var mı? Dene.' : '<span class="no">Bazı örnekleri yanlış sınıflıyor.</span>');
    };
    draw();
  }

  /* ----- 2) FIND-S / ADAY-ELEME laboratuvarı ----- */
  var lab = document.getElementById('celab');
  if (lab) {
    var mode = 'ce', noise = false, idx = 0, exs = EX.map(function (e) { return { x: e.x, y: e.y }; }), snaps;
    var bar = el('div', 'bar'); lab.appendChild(bar);
    var chips = el('div', 'chips'); bar.appendChild(chips);
    var cb = [];
    [['find', 'FIND-S'], ['ce', 'ADAY-ELEME']].forEach(function (m) { var b = el('button', 'chip', m[1]); b.type = 'button'; b.addEventListener('click', function () { mode = m[0]; cb.forEach(function (x, k) { x.setAttribute('aria-pressed', ['find', 'ce'][k] === mode ? 'true' : 'false'); }); reset(); }); chips.appendChild(b); cb.push(b); });
    cb[1].setAttribute('aria-pressed', 'true'); cb[0].setAttribute('aria-pressed', 'false');
    function btn(label, fn, primary) { var b = el('button', 'btn' + (primary ? ' primary' : ''), label); b.type = 'button'; b.addEventListener('click', fn); bar.appendChild(b); return b; }
    var nx = btn('Sonraki örnek →', function () { if (idx < exs.length) { idx++; draw(); } }, true);
    var pv = btn('← Geri', function () { if (idx > 0) { idx--; draw(); } });
    btn('Başa sar', function () { idx = 0; draw(); });
    var nz = el('label', 'hyp-s', '<span></span>'); var nzc = el('input'); nzc.type = 'checkbox'; nz.insertBefore(nzc, nz.firstChild); nz.appendChild(document.createTextNode(' Gürültü ekle: 1. günün aynısı ama etiketi “Hayır” olan 5. bir örnek (çelişkili veri)'));
    nzc.addEventListener('change', function () { noise = nzc.checked; exs = EX.map(function (e) { return { x: e.x, y: e.y }; }); if (noise) exs.push({ x: EX[0].x.slice(), y: 0 }); reset(); }); lab.appendChild(nz);
    var table = el('div', 'scroll-x'); lab.appendChild(table);
    var info = el('div', 'quad-info'); lab.appendChild(info);
    var cls = el('div', 'quad-info'); lab.appendChild(cls);

    function reset() { snaps = mode === 'find' ? runFindS(exs) : runCE(exs); idx = 0; draw(); }
    function pills(list, kind) { return list.length ? list.map(function (h) { return '<span class="pill ' + kind + '">' + show(h) + '</span>'; }).join(' ') : '<span class="pill closed">∅ boş küme</span>'; }
    function draw() {
      var s = snaps[idx];
      var html = '<table class="cmp"><thead><tr><th>#</th>' + ATTR.map(function (a) { return '<th>' + a + '</th>'; }).join('') + '<th>Basketbol?</th></tr></thead><tbody>';
      exs.forEach(function (e, i) { html += '<tr class="' + (i === s.i ? 'cur-row' : i < s.i ? '' : 'dim-row') + '"><td>' + (i + 1) + '</td>' + e.x.map(function (v) { return '<td>' + v + '</td>'; }).join('') + '<td><b class="' + (e.y ? 'yes' : 'no') + '">' + (e.y ? 'Evet (+)' : 'Hayır (−)') + '</b></td></tr>'; });
      table.innerHTML = html + '</tbody></table>';
      var msg = '<div class="kicker">' + (mode === 'find' ? 'FIND-S' : 'ADAY-ELEME') + ' · adım ' + idx + '/' + exs.length + '</div><p>' + s.note + '</p>';
      if (mode === 'find') msg += '<p><b>h =</b> <span class="pill cur">' + show(s.h) + '</span></p>';
      else msg += '<p><b>S (en özel sınır):</b> ' + pills(s.S, 'cur') + '</p><p><b>G (en genel sınır):</b> ' + pills(s.G, 'closed') + '</p>';
      var finished = idx === exs.length;
      if (finished) {
        var vs = versionSpace(exs);
        if (mode === 'ce') msg += '<p><b>Versiyon uzayı</b> (tüm tutarlı hipotezler, ' + vs.length + ' tane): ' + (vs.length ? vs.map(function (h) { return '<span class="pill">' + show(h) + '</span>'; }).join(' ') : '<span class="no"><b>boş!</b></span> Hiçbir bağlaçlı hipotez bu verilerle tutarlı değil: ya veride hata var ya da hedef kavram bu hipotez uzayında ifade edilemiyor.') + '</p>';
        else msg += '<p class="mm-note">Not: FIND-S yalnızca bir hipotez verir. Tutarlı başka hipotezler olup olmadığını söyleyemez; bunun için ADAY-ELEME modunu dene.</p>';
      }
      info.innerHTML = msg;
      nx.disabled = idx >= exs.length; pv.disabled = idx === 0;
      renderClassify(finished);
    }
    function renderClassify(finished) {
      cls.innerHTML = '<div class="kicker">Yeni bir günü sınıflandır</div>';
      if (!finished) { cls.innerHTML += '<p class="mm-note">Önce dört örneği de işle (Sonraki örnek →), sonra buradan yeni bir gün sor.</p>'; return; }
      var vs = versionSpace(exs), q = ['Güneşli', 'Soğuk', 'Kuru', 'Yeterli'];
      var row = el('div', 'hyp-sel'), res = el('div', 'status');
      ATTR.forEach(function (a, i) { var w = el('label', 'hyp-s', '<span>' + a + '</span>'), s = el('select'); DOM[i].forEach(function (v) { var o = el('option', '', v); o.value = v; s.appendChild(o); }); s.value = q[i]; s.addEventListener('change', function () { q[i] = s.value; go(); }); w.appendChild(s); row.appendChild(w); });
      cls.appendChild(row); cls.appendChild(res);
      function go() {
        if (!vs.length) { res.innerHTML = '<span class="no">Versiyon uzayı boş; güvenilir bir sınıflandırma yapılamaz.</span>'; return; }
        var yes = vs.filter(function (h) { return covers(h, q); }).length, n = vs.length;
        if (yes === n) res.innerHTML = '<b class="yes">Evet</b>: ' + n + ' hipotezin hepsi pozitif diyor. Hedef kavram tam öğrenilmemiş olsa bile bu sınıflandırma güvenli.';
        else if (yes === 0) res.innerHTML = '<b class="no">Hayır</b>: ' + n + ' hipotezin hepsi negatif diyor. Güvenli sınıflandırma.';
        else res.innerHTML = '<b>Belirsiz</b>: ' + yes + ' hipotez “Evet”, ' + (n - yes) + ' hipotez “Hayır” diyor (oy oranı %' + Math.round(yes / n * 100) + ' Evet). Bu gün, öğrenme için en bilgilendirici sorgu adaylarından biri: gerçek etiketi öğrenmek versiyon uzayını küçültür.';
      }
      go();
    }
    reset();
  }
})();
