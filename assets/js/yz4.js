/* Yapay Zekâ Temelleri · Bölüm 4: kategori hiyerarşisinde kalıtım ve istisna laboratuvarı. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }

  var T = {
    'Canlı': { up: null, p: { 'büyür': true } },
    'Bitki': { up: 'Canlı', p: { 'fotosentez yapar': true, 'hareket eder': false } },
    'Hayvan': { up: 'Canlı', p: { 'hareket eder': true, 'fotosentez yapar': false } },
    'Memeli': { up: 'Hayvan', p: { 'sıcakkanlıdır': true, 'süt verir': true, 'kanadı vardır': false } },
    'Kuş': { up: 'Hayvan', p: { 'sıcakkanlıdır': true, 'kanadı vardır': true, 'uçar': true } },
    'Yarasa': { up: 'Memeli', p: { 'kanadı vardır': true, 'uçar': true } },
    'Kedi': { up: 'Memeli', p: {} },
    'Serçe': { up: 'Kuş', p: {} },
    'Penguen': { up: 'Kuş', p: { 'uçar': false } }
  };
  var ORDER = [['Canlı', 0], ['Bitki', 1], ['Hayvan', 1], ['Memeli', 2], ['Yarasa', 3], ['Kedi', 3], ['Kuş', 2], ['Serçe', 3], ['Penguen', 3]];
  var PROPS = ['büyür', 'hareket eder', 'fotosentez yapar', 'sıcakkanlıdır', 'süt verir', 'kanadı vardır', 'uçar'];

  var box = document.getElementById('inhlab');
  if (!box) return;

  var r1 = el('div', 'slider-row'); r1.innerHTML = '<label for="inhc">Kategori</label><select id="inhc"></select><span></span>';
  var r2 = el('div', 'slider-row'); r2.innerHTML = '<label for="inhp">Soru: … mı?</label><select id="inhp"></select><span></span>';
  box.appendChild(r1); box.appendChild(r2);
  var sc = r1.querySelector('select'), sp = r2.querySelector('select');
  ORDER.forEach(function (o) { var op = el('option', '', o[0]); op.value = o[0]; sc.appendChild(op); });
  PROPS.forEach(function (p) { var op = el('option', '', p); op.value = p; sp.appendChild(op); });
  sc.value = 'Penguen'; sp.value = 'uçar';

  var tree = el('ul', 'inh-tree'); box.appendChild(tree);
  var out = el('div', 'callout idea'); box.appendChild(out);

  function chain(name) { var c = [], n = name; while (n) { c.push(n); n = T[n].up; } return c; }
  function draw() {
    var cat = sc.value, prop = sp.value, c = chain(cat), found = null, i;
    for (i = 0; i < c.length; i++) { if (Object.prototype.hasOwnProperty.call(T[c[i]].p, prop)) { found = c[i]; break; } }
    tree.innerHTML = '';
    ORDER.forEach(function (o) {
      var n = o[0], li = el('li', 'inh-n'), tags = Object.keys(T[n].p).map(function (k) { return (T[n].p[k] ? '' : 'değil: ') + k; }).join(', ');
      li.style.marginLeft = (o[1] * 18) + 'px';
      li.innerHTML = '<b>' + n + '</b>' + (tags ? ' <small>' + tags + '</small>' : '');
      if (c.indexOf(n) >= 0) li.classList.add('path');
      if (n === found) li.classList.add('hit');
      tree.appendChild(li);
    });
    if (!found) {
      out.className = 'callout idea';
      out.innerHTML = '<b>Bilinmiyor.</b>“' + cat + '” kategorisinden köke kadar hiçbir yerde “' + prop + '” bilgisi yok. Sistem bunu sessizce “hayır” saymamalı; bilgi tabanında bu soruya yanıt bulunmuyor.';
      return;
    }
    var val = T[found].p[prop], via = found === cat ? 'doğrudan kategorinin kendisinde' : '“' + found + '” kategorisinden kalıtımla';
    out.className = 'callout ' + (val ? 'ok' : 'bad');
    var ex = '';
    for (i = c.indexOf(found) + 1; i < c.length; i++) { if (Object.prototype.hasOwnProperty.call(T[c[i]].p, prop) && T[c[i]].p[prop] !== val) { ex = ' Daha üstte (“' + c[i] + '”) bunun tersi yazılı; ama en özel kategori kazanır: <b>istisna</b>.'; break; } }
    out.innerHTML = '<b>' + (val ? 'Evet' : 'Hayır') + '.</b>' + (val ? cat + ' için “' + prop + '” doğru' : cat + ' için “' + prop + '” yanlış') + ' (' + via + ').' + ex;
  }
  sc.addEventListener('change', draw); sp.addEventListener('change', draw);
  draw();
})();
