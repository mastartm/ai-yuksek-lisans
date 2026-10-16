/* Araştırma Yöntemleri · Bölüm 5: örnekleme yöntemleri laboratuvarı ve örneklem büyüklüğü hesaplayıcı. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function f1(x) { return (Math.round(x * 10) / 10).toFixed(1).replace('.', ','); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function nfmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

  /* ---------- 1) Örnekleme laboratuvarı ---------- */
  var sl = document.getElementById('samplab');
  if (sl) {
    var N = 100, SIZE = 10, method = 'basit', chosen = [];
    // evren: 1-70 "A grubu", 71-100 "B grubu" (örn. 70 devlet, 30 özel okul), listede gruplar ardışık
    function isB(i) { return i >= 70; }
    var bar = el('div', 'chips'), chips = {};
    [['basit', 'Basit seçkisiz'], ['sistematik', 'Sistematik (k = 10)'], ['tabakali', 'Tabakalı'], ['uygun', 'Uygun (ilk 10)']].forEach(function (m) {
      var b = el('button', 'chip', m[1]); b.type = 'button'; b.addEventListener('click', function () { method = m[0]; hist = []; pick(); draw(); }); bar.appendChild(b); chips[m[0]] = b;
    });
    sl.appendChild(bar);
    var grid = el('div', 'gi-grid'); grid.style.gridTemplateColumns = 'repeat(10, 1fr)'; sl.appendChild(grid);
    var cells = [];
    for (var i = 0; i < N; i++) { var c = el('div', 'gi-cell'); c.style.cursor = 'default'; c.style.display = 'flex'; c.style.alignItems = 'center'; c.style.justifyContent = 'center'; c.textContent = i + 1; grid.appendChild(c); cells.push(c); }
    var info = el('div', 'metrics'); sl.appendChild(info);
    var note = el('div', 'callout idea'); sl.appendChild(note);
    var again = el('button', 'btn primary', 'Yeni örneklem çek'); again.type = 'button'; again.addEventListener('click', function () { pick(); draw(); }); sl.appendChild(again);
    var hist = []; // son çekilişlerin B sayısı
    function pick() {
      var idx = [], k, s;
      if (method === 'basit') { idx = shuffle(Array.apply(null, Array(N)).map(function (_, i) { return i; })).slice(0, SIZE); }
      else if (method === 'sistematik') { k = N / SIZE; s = Math.floor(Math.random() * k); for (var i = s; i < N; i += k) idx.push(i); }
      else if (method === 'tabakali') {
        var A = shuffle(Array.apply(null, Array(70)).map(function (_, i) { return i; })).slice(0, 7);
        var B = shuffle(Array.apply(null, Array(30)).map(function (_, i) { return i + 70; })).slice(0, 3);
        idx = A.concat(B);
      } else { idx = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; }
      chosen = idx;
      var b = idx.filter(isB).length; hist.push(b); if (hist.length > 30) hist.shift();
    }
    function draw() {
      Object.keys(chips).forEach(function (k) { chips[k].setAttribute('aria-pressed', k === method ? 'true' : 'false'); });
      cells.forEach(function (c, i) {
        var on = chosen.indexOf(i) >= 0;
        c.className = 'gi-cell' + (on ? ' on' : '');
        c.style.background = on ? (isB(i) ? 'hsl(15 85% 58%)' : 'hsl(210 80% 55%)') : (isB(i) ? 'var(--warn-soft)' : '');
        c.style.color = on ? '#fff' : '';
      });
      var b = chosen.filter(isB).length;
      info.innerHTML = '<div class="metric"><b>' + b + ' / ' + chosen.length + '</b>örnekteki B grubu (evrende %30)</div><div class="metric"><b>' + (hist.length ? Math.min.apply(null, hist) + '–' + Math.max.apply(null, hist) : '–') + '</b>son çekilişlerde B sayısı aralığı</div>';
      note.innerHTML = method === 'basit' ? '<b>Basit seçkisiz:</b>her birimin şansı eşit. Ortalamada B payı %30 çıkar ama tek bir çekilişte 1 ile 5 arasında oynayabilir. Birkaç kez çek.' :
        method === 'sistematik' ? '<b>Sistematik:</b>rastgele bir başlangıç seçilir, sonra her 10. birim alınır. Liste gruplara göre sıralıysa B’den hep 3 birim gelir; ama listede düzenli bir desen varsa yanıltabilir.' :
        method === 'tabakali' ? '<b>Tabakalı:</b>her tabakadan evrendeki oranda ayrı çekiliş yapılır: 7 A + 3 B. B payı her çekilişte tam %30; alt grupların temsili garantidir.' :
        '<b>Uygun:</b>ilk 10 birim alındı. Hepsi A grubundan; B hiç temsil edilmedi. Kolay ve ucuz ama sonuçlara en az güvenilen yöntemdir; seçkisiz değildir.';
    }
    pick(); draw();
  }

  /* ---------- 2) Örneklem büyüklüğü ---------- */
  var nl = document.getElementById('nlab');
  if (nl) {
    var st = { N: 5000, d: 0.05, conf: 1.96, p: 0.5 };
    function row(id, label, min, max, step, val, out) {
      var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>'; nl.appendChild(r); return r.querySelector('input');
    }
    var iN = row('nN', 'Evren (N)', 500, 500000, 500, 5000);
    var iD = row('nD', 'Sapma d', 1, 10, 1, 5);
    var iP = row('nP', 'Oran P', 10, 90, 5, 50);
    var bar2 = el('div', 'chips'), ch2 = {};
    [[1.645, '%90 güven'], [1.96, '%95 güven'], [2.576, '%99 güven']].forEach(function (c) {
      var b = el('button', 'chip', c[1]); b.type = 'button'; b.addEventListener('click', function () { st.conf = c[0]; calc(); }); bar2.appendChild(b); ch2[c[0]] = b;
    });
    nl.appendChild(bar2);
    var info2 = el('div', 'metrics'); nl.appendChild(info2);
    var note2 = el('div', 'callout idea'); nl.appendChild(note2);
    function calc() {
      st.N = +iN.value; st.d = +iD.value / 100; st.p = +iP.value / 100;
      var t = st.conf, pq = st.p * (1 - st.p), n = Math.ceil(st.N * t * t * pq / (st.d * st.d * (st.N - 1) + t * t * pq));
      n = Math.min(n, st.N);
      document.getElementById('nNo').textContent = nfmt(st.N); document.getElementById('nDo').textContent = '±' + f1(st.d * 100) + ' puan'; document.getElementById('nPo').textContent = '%' + Math.round(st.p * 100);
      Object.keys(ch2).forEach(function (k) { ch2[k].setAttribute('aria-pressed', +k === st.conf ? 'true' : 'false'); });
      info2.innerHTML = '<div class="metric"><b>' + nfmt(n) + '</b>gereken örneklem</div><div class="metric"><b>%' + f1(n / st.N * 100) + '</b>evrenin oranı</div>';
      note2.innerHTML = 'Formül (süreksiz değişken): n = N·t²·PQ / (d²(N−1) + t²·PQ). P = %50 iken PQ en yüksek değeri (0,25) alır; yani P bilinmiyorsa en büyük (en güvenli) örneklem çıkar. d küçüldükçe n hızla büyür; N büyüdükçe n sabitlenmeye başlar.';
    }
    [iN, iD, iP].forEach(function (i) { i.addEventListener('input', calc); });
    calc();
  }
})();
