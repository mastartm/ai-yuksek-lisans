/* Araştırma Yöntemleri · Bölüm 6: Cronbach alfa simülatörü ve ölçmenin standart hatası.
   Veriler bu site için kodla üretilen sanal anket yanıtlarıdır (30 kişi, 5'li Likert). */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function f2(x) { return (Math.round(x * 100) / 100).toFixed(2).replace('.', ','); }
  function f1(x) { return (Math.round(x * 10) / 10).toFixed(1).replace('.', ','); }

  var box = document.getElementById('alphalab');
  if (!box) return;
  var NP = 30, items = 5, noise = 1.0, data = null, seed = 11;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function gauss() { var u = 0; for (var i = 0; i < 6; i++) u += rnd(); return (u - 3) / 0.7071; }
  var trait = [], eps = [];
  function regen() { seed = 11 + Math.floor(Math.random() * 5000); trait = []; eps = []; for (var p = 0; p < NP; p++) { trait.push(gauss()); var r = []; for (var j = 0; j < 20; j++) r.push(gauss()); eps.push(r); } }
  function build() {
    var m = [], p, j;
    for (p = 0; p < NP; p++) { m.push([]); for (j = 0; j < items; j++) { var v = Math.round(3 + 0.9 * trait[p] + noise * eps[p][j]); m[p].push(Math.max(1, Math.min(5, v))); } }
    return m;
  }
  function variance(a) { var m = 0, s = 0; a.forEach(function (x) { m += x; }); m /= a.length; a.forEach(function (x) { s += (x - m) * (x - m); }); return s / (a.length - 1); }
  function alpha(m) {
    var k = m[0].length, sumVar = 0, j, tot = m.map(function (r) { var s = 0; r.forEach(function (x) { s += x; }); return s; });
    for (j = 0; j < k; j++) sumVar += variance(m.map(function (r) { return r[j]; }));
    return k / (k - 1) * (1 - sumVar / variance(tot));
  }

  function row(id, label, min, max, step, val) { var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>'; box.appendChild(r); return r.querySelector('input'); }
  var iK = row('alk', 'Madde sayısı', 2, 20, 1, 5), iN = row('aln', 'Madde gürültüsü', 0.2, 2.5, 0.1, 1);
  var wrap = el('div', 'scroll-x'); box.appendChild(wrap);
  var info = el('div', 'metrics'); box.appendChild(info);
  var note = el('div', 'callout idea'); box.appendChild(note);
  var again = el('button', 'btn', 'Yeni 30 kişi'); again.type = 'button'; again.addEventListener('click', function () { regen(); draw(); }); box.appendChild(again);

  function draw() {
    items = +iK.value; noise = +iN.value;
    document.getElementById('alko').textContent = items; document.getElementById('alno').textContent = f1(noise);
    data = build();
    var a = alpha(data), tot = data.map(function (r) { var s = 0; r.forEach(function (x) { s += x; }); return s; }), sd = Math.sqrt(variance(tot)), sem = sd * Math.sqrt(Math.max(0, 1 - a));
    var show = Math.min(items, 6), h = '<table class="cmp"><thead><tr><th>Kişi</th>';
    for (var j = 0; j < show; j++) h += '<th>M' + (j + 1) + '</th>';
    h += (items > show ? '<th>…</th>' : '') + '<th>Toplam</th></tr></thead><tbody>';
    for (var p = 0; p < 5; p++) { h += '<tr><td>' + (p + 1) + '</td>'; for (j = 0; j < show; j++) h += '<td>' + data[p][j] + '</td>'; h += (items > show ? '<td>…</td>' : '') + '<td><b>' + tot[p] + '</b></td></tr>'; }
    wrap.innerHTML = h + '</tbody></table><p style="font-size:.85rem;color:var(--muted)">İlk 5 kişi gösteriliyor; alfa 30 kişiyle hesaplanır.</p>';
    info.innerHTML = '<div class="metric"><b>' + f2(a) + '</b>Cronbach α</div><div class="metric"><b>' + f1(sd) + '</b>toplam puan sapması</div><div class="metric"><b>±' + f1(sem) + '</b>ölçmenin standart hatası</div>';
    note.innerHTML = (a >= 0.8 ? '<b>Yüksek tutarlılık.</b>' : a >= 0.6 ? '<b>Orta tutarlılık.</b>' : '<b>Düşük tutarlılık.</b>') +
      ' Maddeler aynı özelliği ölçtükçe birlikte değişir ve α yükselir. Madde sayısını artırmak ya da gürültüyü azaltmak α’yı yükseltir; α yükselince ölçmenin standart hatası düşer: puandaki “şans payı” küçülür. SEm = SD·√(1 − α). (Bu üçlü sınıflama bu sitenin kabaca ayrımıdır; ders notunda kesin bir eşik verilmez.)';
  }
  [iK, iN].forEach(function (i) { i.addEventListener('input', draw); });
  regen(); draw();
})();
