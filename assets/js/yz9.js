/* Yapay Zekâ Temelleri · Bölüm 9: veri önyargısı, saldırgan örnek, bilgi balonu. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function n2(x) { return (Math.round(x * 100) / 100).toFixed(2).replace('.', ','); }
  function n3(x) { return (Math.round(x * 1000) / 1000).toFixed(3).replace('.', ','); }
  function pc(x) { return '%' + Math.round(x * 100); }
  function slider(parent, id, label, min, max, step, val) {
    var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output id="' + id + 'o"></output>';
    parent.appendChild(r); return r.querySelector('input');
  }

  /* ---------- 1) Veri önyargısı: geçmiş kararlardaki ayrımcılık payı ---------- */
  var bl = document.getElementById('biaslab');
  if (bl) {
    var BASE = [0.20, 0.35, 0.50, 0.65, 0.80];   // A grubunun geçmişte nitelik bandı başına onay oranı
    var dI = slider(bl, 'bld', 'Geçmişteki ayrımcılık payı (puan)', 0, 20, 5, 15);
    var rI = slider(bl, 'blr', 'Vekil sütun B ile örtüşme (%)', 50, 100, 5, 80);
    var mb = el('div', 'chips'); bl.appendChild(mb);
    var mode = 0;
    var mbs = ['Model grup sütununu görüyor', 'Grup sütunu silindi, vekil sütun duruyor'].map(function (t, k) { var b = el('button', 'chip', t); b.type = 'button'; b.addEventListener('click', function () { mode = k; drawBl(); }); mb.appendChild(b); return b; });
    var bt = el('div', 'scroll-x'); bl.appendChild(bt);
    var bm = el('div', 'metrics'); bl.appendChild(bm);
    var bn = el('div', 'callout idea'); bl.appendChild(bn);
    var drawBl = function () {
      var d = +dI.value / 100, r = +rI.value / 100;
      document.getElementById('bldo').textContent = Math.round(d * 100); document.getElementById('blro').textContent = Math.round(r * 100);
      document.getElementById('blr').disabled = mode === 0; document.getElementById('blr').closest('.slider-row').style.opacity = mode === 0 ? 0.45 : 1;
      mbs.forEach(function (b, k) { b.setAttribute('aria-pressed', k === mode ? 'true' : 'false'); });
      // Modelin öğrendiği onay olasılığı: (nitelik bandı, grup üyesi) için beklenen değer
      var shiftA = mode === 0 ? 0 : d * 2 * r * (1 - r), shiftB = mode === 0 ? d : d * (r * r + (1 - r) * (1 - r));
      var h = '<table class="cmp"><thead><tr><th>Nitelik bandı</th><th>Geçmiş A</th><th>Geçmiş B</th><th>Model A</th><th>Model B</th><th>Karar A / B</th></tr></thead><tbody>', diffBands = 0;
      BASE.forEach(function (b, i) {
        var a = b - shiftA, bb = b - shiftB, da = a >= 0.5 - 1e-9, db = bb >= 0.5 - 1e-9;
        if (da !== db) diffBands++;
        h += '<tr><td>' + (i + 1) + '</td><td>' + pc(b) + '</td><td>' + pc(b - d) + '</td><td>' + pc(a) + '</td><td>' + pc(bb) + '</td><td>' + (da ? 'Onay' : 'Red') + ' / ' + (db ? 'Onay' : 'Red') + '</td></tr>';
      });
      bt.innerHTML = h + '</tbody></table>';
      var avg = BASE.reduce(function (s, x) { return s + x; }, 0) / 5, gap = shiftB - shiftA;
      bm.innerHTML = '<div class="metric"><b>' + pc(avg) + ' / ' + pc(avg - d) + '</b>geçmişte genel onay: A / B</div><div class="metric"><b>' + pc(avg - shiftA) + ' / ' + pc(avg - shiftB) + '</b>modelin ortalama onay olasılığı: A / B</div><div class="metric"><b>' + Math.round(gap * 100) + ' puan</b>aynı niteliğe düşen fark (B aleyhine)</div><div class="metric"><b>' + diffBands + ' / 5</b>aynı bantta kararı farklı çıkan bant</div>';
      if (d === 0) bn.innerHTML = '<b>Geçmiş kararlar adil: model de adil.</b> İki grup, aynı niteliğe aynı onay olasılığını alır. Ayrımcılık payını artırınca model aynı veriyi “doğru” öğrenir ama doğru öğrendiği şey haksızdır.';
      else if (mode === 0) bn.innerHTML = '<b>Model geçmişteki ayrımcılığı birebir öğrendi.</b> Nitelik aynıyken B grubunun onay olasılığı ' + Math.round(d * 100) + ' puan düşük. Hata modelin kodunda değil, öğrendiği verinin içindedir; model yalnızca “geçmişte ne oldu”yu en iyi tahmin eden kuralı buldu.';
      else if (gap < 0.005) bn.innerHTML = '<b>Bu vekil sütun grup bilgisi taşımıyor.</b> Örtüşme %50 olduğundan sütun B’yi A’dan ayıramaz; iki grup aynı olasılığı alır. Ama model geçmişin düşük onay düzeyini yine öğrendi (A grubu da ' + Math.round(shiftA * 100) + ' puan düşük). Örtüşmeyi artırınca fark geri gelir.';
      else bn.innerHTML = '<b>Sütunu silmek yetmedi.</b> Vekil sütun (örneğin posta kodu) B grubuyla %' + Math.round(r * 100) + ' örtüşüyor; model grubu doğrudan görmese de fark ' + Math.round(gap * 100) + ' puan kalıyor. Fark d·(2r−1)² kadardır: örtüşme %50 olunca vekil bilgi taşımaz ve fark sıfırlanır, %100 olunca sütunu silmemişsin gibi olur.';
    };
    [dI, rI].forEach(function (i) { i.addEventListener('input', drawBl); });
    drawBl();
  }

  /* ---------- 2) Saldırgan örnek: doğrusal sınıflandırıcıda küçük değişiklikle sınıf çevirme ---------- */
  var al = document.getElementById('advlab');
  if (al) {
    var W = [2, -3, 1, 4, -2, 3, -1, 2], B0 = -3, X0 = [0.6, 0.3, 0.5, 0.7, 0.3, 0.4, 0.5, 0.6], RS = [1, 1, -1, 1, -1, -1, 1, -1];
    function score(x) { var s = B0; for (var i = 0; i < W.length; i++) s += W[i] * x[i]; return s; }
    var sumW = W.reduce(function (s, w) { return s + Math.abs(w); }, 0), f0 = score(X0), epsCrit = f0 / sumW;
    var eI = slider(al, 'ade', 'ε (her özellikte en çok değişim)', 0, 0.3, 0.01, 0.05);
    var ag = el('div'); al.appendChild(ag);
    var am = el('div', 'metrics'); al.appendChild(am);
    var an = el('div', 'callout idea'); al.appendChild(an);
    var drawAd = function () {
      var e = +eI.value; document.getElementById('adeo').textContent = n2(e);
      var xa = X0.map(function (x, i) { return x - e * (W[i] > 0 ? 1 : -1); }), xr = X0.map(function (x, i) { return x + e * RS[i]; });
      var fa = score(xa), fr = score(xr);
      var svg = '<svg style="width:100%;max-width:520px;height:auto;display:block;margin:12px 0" viewBox="0 0 400 150" role="img" aria-label="Sekiz özelliğin özgün ve saldırılmış değerleri">';
      X0.forEach(function (x, i) {
        var cx = 25 + i * 48, h0 = x * 100, h1 = xa[i] * 100;
        svg += '<rect x="' + (cx - 14) + '" y="' + (110 - h0) + '" width="12" height="' + h0 + '" style="fill:var(--brand)"/><rect x="' + (cx) + '" y="' + (110 - h1) + '" width="12" height="' + h1 + '" style="fill:var(--warn)"/><text class="d-sm" x="' + (cx) + '" y="128" text-anchor="middle">x' + (i + 1) + '</text><text class="d-sm" x="' + cx + '" y="143" text-anchor="middle">w=' + W[i] + '</text>';
      });
      ag.innerHTML = svg + '</svg>';
      var cls = function (f) { return f > 0 ? 'sınıf +' : 'sınıf −'; };
      am.innerHTML = '<div class="metric"><b>' + n2(f0) + ' → ' + cls(f0) + '</b>özgün girdinin skoru</div><div class="metric"><b>' + n2(fa) + ' → ' + cls(fa) + '</b>saldırılmış skor (her özellik ε, skoru düşüren yönde)</div><div class="metric"><b>' + n2(fr) + ' → ' + cls(fr) + '</b>aynı ε ile rastgele işaretli değişim</div><div class="metric"><b>' + n3(epsCrit) + '</b>kritik ε = skor / Σ|w| = ' + n2(f0) + ' / ' + sumW + '</div>';
      an.innerHTML = fa > 0 ? '<b>Saldırı henüz çevirmedi.</b> Skor ' + n2(fa) + ' ile hâlâ pozitif. Her özellik ε kadar oynayınca skor en fazla ε·Σ|w| = ' + n2(e * sumW) + ' düşer; skor ' + n2(f0) + ' olduğundan ε ' + n3(epsCrit) + '’i geçince sınıf değişir. Rastgele değişim ise skoru ancak ε·(Σ wᵢsᵢ) = ' + n2(-2 * e) + ' kadar oynatır.' : '<b>Sınıf çevrildi.</b> Her özellik en çok ' + n2(e) + ' oynadı (0–1 aralığında) ama skor ' + n2(f0) + ' değerinden ' + n2(fa) + ' değerine indi. Rastgele işaretli aynı büyüklükte değişim skoru ' + n2(fr) + ' yapar ve sınıf ' + (fr > 0 ? 'değişmez' : 'değişir') + '. Fark, saldırganın değişimi ağırlıkların işaretine göre seçmesinden gelir.';
    };
    eI.addEventListener('input', drawAd);
    drawAd();
  }

  /* ---------- 3) Bilgi balonu: öneri keskinliği ve konu çeşitliliği ---------- */
  var bb = document.getElementById('balonlab');
  if (bb) {
    var TOP = ['Siyaset', 'Spor', 'Ekonomi', 'Bilim', 'Sanat'], C0 = [0.30, 0.25, 0.20, 0.15, 0.10], ETA = 0.2, T = 40;
    var kI = slider(bb, 'blk', 'Öneri keskinliği k', 0.5, 3, 0.25, 1.5), tI = slider(bb, 'blt', 'Adım (gün)', 0, T, 1, 20);
    var bg = el('div'); bb.appendChild(bg);
    var bmx = el('div', 'metrics'); bb.appendChild(bmx);
    var bnx = el('div', 'callout idea'); bb.appendChild(bnx);
    function effN(c) { var h = 0; c.forEach(function (p) { if (p > 0) h -= p * Math.log(p); }); return Math.exp(h); }
    function run(k) {
      var c = C0.slice(), out = [c.slice()];
      for (var t = 0; t < T; t++) {
        var w = c.map(function (p) { return Math.pow(p, k); }), s = w.reduce(function (a, b) { return a + b; }, 0);
        c = c.map(function (p, i) { return (1 - ETA) * p + ETA * w[i] / s; });
        out.push(c.slice());
      }
      return out;
    }
    var drawBb = function () {
      var k = +kI.value, t = +tI.value;
      document.getElementById('blko').textContent = String(k).replace('.', ','); document.getElementById('blto').textContent = t;
      var tr = run(k), c = tr[t], ev = tr.map(effN), top = Math.max.apply(null, c), ti = c.indexOf(top);
      var svg = '<svg style="width:100%;max-width:560px;height:auto;display:block;margin:12px 0" viewBox="0 0 560 170" role="img" aria-label="Konu payları ve zamana göre çeşitlilik">';
      c.forEach(function (p, i) {
        var y = 14 + i * 30;
        svg += '<text class="d-sm" x="0" y="' + (y + 12) + '">' + TOP[i] + '</text><rect x="62" y="' + y + '" width="' + (p * 210).toFixed(1) + '" height="18" rx="4" style="fill:var(--brand)"/><text class="d-sm" x="' + (68 + p * 210).toFixed(1) + '" y="' + (y + 13) + '">' + pc(p) + '</text>';
      });
      var px = function (i) { return (330 + i / T * 220).toFixed(1); }, py = function (v) { return (150 - (v - 1) / 4 * 130).toFixed(1); };
      svg += '<line class="d-line" x1="330" y1="150" x2="550" y2="150"/><line class="d-line" x1="330" y1="20" x2="330" y2="150"/><polyline fill="none" style="stroke:var(--warn);stroke-width:2.5" points="' + ev.map(function (v, i) { return px(i) + ',' + py(v); }).join(' ') + '"/><circle cx="' + px(t) + '" cy="' + py(ev[t]) + '" r="5" style="fill:var(--warn)"/><text class="d-sm" x="330" y="166">gün 0</text><text class="d-sm" x="550" y="166" text-anchor="end">gün ' + T + '</text><text class="d-sm" x="336" y="14">etkin konu sayısı</text></svg>';
      bg.innerHTML = svg;
      bmx.innerHTML = '<div class="metric"><b>' + TOP[ti] + ' ' + pc(top) + '</b>en büyük konu payı (gün ' + t + ')</div><div class="metric"><b>' + n2(ev[t]) + '</b>etkin konu sayısı (gün ' + t + '; başlangıç ' + n2(ev[0]) + ')</div><div class="metric"><b>' + n2(ev[T]) + '</b>gün ' + T + ' sonunda etkin konu sayısı</div>';
      bnx.innerHTML = k > 1 ? '<b>Keskinlik 1’in üstünde: büyük olan daha da büyüyor.</b> Öneri, zaten çok tüketilen konuyu orantısız öne çıkarır; kullanıcı onu tüketince pay daha da büyür. Çeşitlilik ' + n2(ev[0]) + ' konudan ' + n2(ev[t]) + ' konuya düştü (gün ' + t + ').' : k === 1 ? '<b>Keskinlik 1: öneri, tüketimle orantılı.</b> Paylar değişmez, çeşitlilik sabit kalır. Bu denge kırılgandır; k biraz artınca balon oluşmaya başlar.' : '<b>Keskinlik 1’in altında: az görülen konulara da şans veriliyor.</b> Paylar eşitlenmeye yaklaşır, çeşitlilik ' + n2(ev[0]) + ' konudan ' + n2(ev[t]) + ' konuya çıkar.';
      bnx.innerHTML += ' Bu model bu sitenin sadeleştirmesidir: gerçek öneri sistemleri bundan çok daha karmaşıktır, buradaki sayılar yalnızca eğilimi gösterir.';
    };
    [kI, tI].forEach(function (i) { i.addEventListener('input', drawBb); });
    drawBb();
  }
})();
