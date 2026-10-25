/* Veri Bilimi · Bölüm 7: quorum (W + R > N), MapReduce sözcük sayımı, edge ve bulut hat yükü. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function n1(x) { return (Math.round(x * 10) / 10).toFixed(1).replace('.', ','); }
  function slider(parent, id, label, min, max, step, val) {
    var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>';
    parent.appendChild(r); return r.querySelector('input');
  }

  /* ---------- 1) Quorum: yazma W, okuma R, kopya N ---------- */
  var ql = document.getElementById('quorumlab');
  if (ql) {
    var nI = slider(ql, 'qn', 'Kopya sayısı N', 1, 9, 1, 5), wI = slider(ql, 'qw', 'Yazma W (kaç kopya onaylar)', 1, 9, 1, 3), rI = slider(ql, 'qr', 'Okuma R (kaç kopyaya sorulur)', 1, 9, 1, 3);
    var pb = el('div', 'chips'); ql.appendChild(pb);
    var pbs = [['W = N, R = 1', function (n) { return [n, 1]; }], ['W = 1, R = N', function (n) { return [1, n]; }], ['Çoğunluk (W = R = ⌊N/2⌋+1)', function (n) { var m = Math.floor(n / 2) + 1; return [m, m]; }]].map(function (p) {
      var b = el('button', 'chip', p[0]); b.type = 'button'; b.addEventListener('click', function () { var v = p[1](+nI.value); wI.value = v[0]; rI.value = v[1]; draw(); }); pb.appendChild(b); return b;
    });
    var qg = el('div'); ql.appendChild(qg);
    var qm = el('div', 'metrics'); ql.appendChild(qm);
    var qn = el('div', 'callout idea'); ql.appendChild(qn);
    var draw = function () {
      var N = +nI.value; [wI, rI].forEach(function (i) { i.max = N; if (+i.value > N) i.value = N; });
      var W = +wI.value, R = +rI.value, ov = Math.max(0, W + R - N);
      ['qn', 'qw', 'qr'].forEach(function (id) { document.getElementById(id + 'o').textContent = document.getElementById(id).value; });
      var svg = '<svg style="width:100%;max-width:560px;height:auto;display:block;margin:12px 0" viewBox="0 0 560 120" role="img" aria-label="Kopyalar: yeni yazılanlar ve en kötü durumda okunanlar"><text class="d-sm" x="0" y="14">Kopyalar (yeşil: yeni değeri aldı, gri: eski değer; çerçeve: okuma kümesi, en kötü durum)</text>';
      var w = Math.min(56, 540 / N - 6);
      for (var i = 0; i < N; i++) {
        var fresh = i < W, inRead = i >= N - R, x = 4 + i * (w + 6);
        svg += '<rect x="' + x + '" y="30" width="' + w + '" height="46" rx="6" style="fill:var(' + (fresh ? '--ok-soft' : '--surface-2') + ');stroke:var(' + (inRead ? '--brand' : '--line') + ');stroke-width:' + (inRead ? 3 : 1) + '"/><text class="d-sm" x="' + (x + w / 2) + '" y="58" text-anchor="middle">' + (fresh ? 'yeni' : 'eski') + '</text>';
      }
      qg.innerHTML = svg + '<text class="d-sm" x="0" y="106">W + R = ' + (W + R) + ' · N = ' + N + '</text></svg>';
      qm.innerHTML = '<div class="metric"><b>' + (W + R) + ' ' + (W + R > N ? '>' : '≤') + ' ' + N + '</b>W + R ve N</div><div class="metric"><b>' + ov + '</b>okuma kümesinde en az kaç güncel kopya var</div><div class="metric"><b>' + (N - W) + '</b>yazmanın dayanabileceği çöken kopya sayısı</div><div class="metric"><b>' + (N - R) + '</b>okumanın dayanabileceği çöken kopya sayısı</div>';
      qn.innerHTML = ov > 0 ? '<b>Her okuma en az bir güncel kopyaya rastlar (W + R > N).</b> Okuma kümesi ile yazma kümesi kesişir; en yeni sürüm kopyalar arasından seçilirse okuma güncel değeri görür. Bedeli: yazma ' + W + ', okuma ' + R + ' kopyanın cevabını bekler; çöken kopya sayısı bu sınırı geçerse işlem yapılamaz (erişilebilirlik azalır).' : '<b>Kesişim garantisi yok (W + R ≤ N).</b> En kötü durumda okuma yalnızca eski kopyalara rastlar. Bu, notun “eventual consistency” tarafıdır: hızlı ve erişilebilir ama okuma eski değeri verebilir. Kopyalar sonradan eşitlenir.';
    };
    [nI, wI, rI].forEach(function (i) { i.addEventListener('input', draw); });
    draw();
  }

  /* ---------- 2) MapReduce: sözcük sayımı, birleştirici (combiner) ve reducer sayısı ---------- */
  var ml = document.getElementById('mrlab');
  if (ml) {
    var LINES = ['veri veri veri bilimi', 'veri sistem veri sistem', 'veri büyük veri büyük veri', 'sistem veri sistem'];
    var cmb = false;
    var rdI = slider(ml, 'mrr', 'Reducer sayısı', 1, 4, 1, 2);
    var cb = el('div', 'chips'); ml.appendChild(cb);
    var cbtn = el('button', 'chip', 'Map tarafında birleştir (combiner)'); cbtn.type = 'button'; cbtn.addEventListener('click', function () { cmb = !cmb; drawMr(); }); cb.appendChild(cbtn);
    var mt = el('div', 'scroll-x'); ml.appendChild(mt);
    var mm = el('div', 'metrics'); ml.appendChild(mm);
    var mn = el('div', 'callout idea'); ml.appendChild(mn);
    function h(s) { var t = 0; for (var i = 0; i < s.length; i++) t += s.charCodeAt(i); return t; }
    var drawMr = function () {
      var R = +rdI.value; document.getElementById('mrro').textContent = R; cbtn.setAttribute('aria-pressed', cmb ? 'true' : 'false');
      var mapOut = LINES.map(function (l) { var c = {}, arr = []; l.split(' ').forEach(function (w) { if (cmb) c[w] = (c[w] || 0) + 1; else arr.push([w, 1]); }); if (cmb) Object.keys(c).forEach(function (w) { arr.push([w, c[w]]); }); return arr; });
      var total = 0, shuf = 0, red = []; for (var r = 0; r < R; r++) red.push({});
      mapOut.forEach(function (a) { shuf += a.length; a.forEach(function (p) { var k = h(p[0]) % R; red[k][p[0]] = (red[k][p[0]] || 0) + p[1]; total += p[1]; }); });
      var t = '<table class="cmp"><thead><tr><th>Aşama</th><th>İçerik</th></tr></thead><tbody>';
      LINES.forEach(function (l, i) { t += '<tr><td>Map ' + (i + 1) + '</td><td>“' + l + '” → ' + mapOut[i].map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(' ') + '</td></tr>'; });
      red.forEach(function (o, k) { var ks = Object.keys(o).sort(); t += '<tr><td>Reduce ' + (k + 1) + '</td><td>' + (ks.length ? ks.map(function (w) { return w + ' = ' + o[w]; }).join(', ') : '(boş)') + '</td></tr>'; });
      mt.innerHTML = t + '</tbody></table>';
      mm.innerHTML = '<div class="metric"><b>' + shuf + '</b>shuffle’a giden (anahtar, değer) çifti</div><div class="metric"><b>' + total + '</b>toplam sayım (toplam sözcük)</div><div class="metric"><b>' + red.filter(function (o) { return Object.keys(o).length; }).length + ' / ' + R + '</b>iş alan reducer</div>';
      mn.innerHTML = '<b>Shuffle, aynı anahtarı aynı reducer’a götürür.</b> Aynı sözcük her zaman aynı reducer’da toplanır; bu yüzden sayımlar doğrudur. ' + (cmb ? 'Birleştirici açık: her map kendi satırında önce toplar, ağa yalnızca ' + shuf + ' çift gider (kapalıyken 16).' : 'Birleştirici kapalı: her sözcük ayrı bir (sözcük, 1) çiftidir, ağa 16 çift gider. “Map tarafında birleştir”i açınca shuffle yükü düşer.') + ' Bu, notun “shuffle yoğun I/O ve ağ maliyeti yaratır” cümlesinin küçük bir örneğidir. Reducer sayısını artırınca yük bölünür ama anahtar azsa bazı reducer’lar boş kalır.';
    };
    rdI.addEventListener('input', drawMr);
    drawMr();
  }

  /* ---------- 3) Edge: ham veriyi buluta mı, özetini mi gönder? ---------- */
  var el3 = document.getElementById('edgelab');
  if (el3) {
    var sI = slider(el3, 'eds', 'Sensör sayısı', 10, 400, 10, 100), kI = slider(el3, 'edk', 'Sensör başına ham veri (kB/sn)', 10, 500, 10, 100), pI = slider(el3, 'edp', 'Edge’den çıkan veri oranı (%)', 1, 100, 1, 5), cI = slider(el3, 'edc', 'Bulut hattı kapasitesi (Mbit/sn)', 5, 200, 5, 50);
    var eg = el('div'); el3.appendChild(eg);
    var em = el('div', 'metrics'); el3.appendChild(em);
    var en = el('div', 'callout idea'); el3.appendChild(en);
    var drawEd = function () {
      var S = +sI.value, K = +kI.value, P = +pI.value / 100, C = +cI.value;
      ['eds', 'edk', 'edp', 'edc'].forEach(function (id) { document.getElementById(id + 'o').textContent = document.getElementById(id).value; });
      var raw = S * K * 8 / 1000, edge = raw * P, top = Math.max(raw, edge, C);
      var bar = function (v, y, label, bad) { return '<rect x="10" y="' + y + '" width="' + (v / top * 480).toFixed(1) + '" height="22" rx="4" style="fill:var(' + (bad ? '--warn' : '--ok') + ')"/><text class="d-sm" x="10" y="' + (y + 38) + '">' + label + ': ' + n1(v) + ' Mbit/sn</text>'; };
      eg.innerHTML = '<svg style="width:100%;max-width:560px;height:auto;display:block;margin:12px 0" viewBox="0 0 560 150" role="img" aria-label="Hat yükü ve kapasite">' + bar(raw, 8, 'Her şeyi buluta gönder', raw > C) + bar(edge, 62, 'Edge’de özetle, özeti gönder', edge > C) + '<line x1="' + (10 + C / top * 480).toFixed(1) + '" y1="2" x2="' + (10 + C / top * 480).toFixed(1) + '" y2="118" style="stroke:var(--brand);stroke-width:3"/><text class="d-sm" x="10" y="144">dikey çizgi: hat kapasitesi ' + C + ' Mbit/sn</text></svg>';
      em.innerHTML = '<div class="metric"><b>' + n1(raw) + ' Mbit/sn</b>ham veri yükü (sensör × kB/sn × 8)</div><div class="metric"><b>' + n1(edge) + ' Mbit/sn</b>edge sonrası yük</div><div class="metric"><b>' + (raw <= C ? 'Yeter' : 'Yetmez · ' + n1(raw / C) + ' kat') + '</b>her şeyi buluta göndermek</div><div class="metric"><b>' + (edge <= C ? 'Yeter' : 'Yetmez · ' + n1(edge / C) + ' kat') + '</b>edge’de özetlemek</div>';
      en.innerHTML = (raw > C ? '<b>Hat doluyor.</b> Ham yük kapasitenin ' + n1(raw / C) + ' katı; veri hatta birikir, tepki gecikir. ' : '<b>Hat taşımıyor.</b> ') + (edge <= C ? 'Edge ' + Math.round(P * 100) + '% oranında özetleyince ' + n1(edge) + ' Mbit/sn yeter. ' : 'Edge sonrası bile yük kapasiteyi aşıyor; özet oranı düşürülmeli ya da hat büyütülmeli. ') + 'Bu, notun “ham veriyi buluta göndermeden önce uçta işlemek” fikridir. Edge düğümünün işlem gücü ve pil ömrü bu hesaba girmez; notta bunlar ayrı zorluk olarak geçer.';
    };
    [sI, kI, pI, cI].forEach(function (i) { i.addEventListener('input', drawEd); });
    drawEd();
  }
})();
