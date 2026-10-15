/* Makine Öğrenmesi · Bölüm 1: T-P-E kurucu ve dama tahtası değerlendirme fonksiyonu. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }

  /* ----- T · P · E ----- */
  var box = document.getElementById('tpe');
  if (box) {
    var D = [
      { n: 'Dama oynamak', t: 'Dama oyunu oynamak', p: 'Rakiplere karşı kazanılan oyunların yüzdesi', e: 'Kendine karşı oynanan pratik oyunlar', note: 'Ders notundaki örnek.' },
      { n: 'El yazısı tanıma', t: 'Görüntülerdeki el yazısı kelimeleri tanımak ve sınıflandırmak', p: 'Doğru sınıflandırılan kelimelerin yüzdesi', e: 'Doğru etiketleri bilinen el yazısı kelimeleri veri tabanı', note: 'Ders notundaki örnek.' },
      { n: 'Otonom sürüş', t: 'Sensörlerle dört şeritli otoyolda araç sürmek', p: 'Hata yapmadan önce kat edilen ortalama mesafe (insan gözetmen değerlendirir)', e: 'İnsan sürücüyü izlerken kaydedilen görüntüler ve direksiyon komutları', note: 'Ders notundaki örnek.' },
      { n: 'Spam filtresi', t: 'Gelen e-postayı “spam” ya da “değil” diye sınıflandırmak', p: 'Doğru sınıflanan e-posta yüzdesi (özellikle önemli postayı kaçırmamak)', e: 'Kullanıcının “spam” ya da “spam değil” diye işaretlediği e-postalar', note: 'Bu sitede eklenen günlük örnek.' },
      { n: 'Klavye önerisi', t: 'Yazarken bir sonraki kelimeyi önermek', p: 'Önerilen kelimenin kabul edilme oranı', e: 'Kullanıcının daha önce yazdığı mesajlar', note: 'Bu sitede eklenen günlük örnek.' }
    ];
    var chips = el('div', 'chips'), grid = el('div', 'peas-grid'), btns = [];
    box.appendChild(chips); box.appendChild(grid);
    D.forEach(function (d, i) { var b = el('button', 'chip', d.n); b.type = 'button'; b.addEventListener('click', function () { pick(i); }); chips.appendChild(b); btns.push(b); });
    function pick(i) {
      btns.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      var d = D[i];
      grid.innerHTML = '<div class="peas-c p"><b>T · Görev</b>' + d.t + '</div><div class="peas-c e"><b>P · Performans ölçüsü</b>' + d.p + '</div><div class="peas-c a"><b>E · Deneyim</b>' + d.e + '</div>';
    }
    pick(0);
  }

  /* ----- Dama tahtası değerlendirme fonksiyonu ----- */
  var cb = document.getElementById('checkers');
  if (cb) {
    var F = [['x1', 'Siyah taş sayısı'], ['x2', 'Kırmızı taş sayısı'], ['x3', 'Siyah şah sayısı'], ['x4', 'Kırmızı şah sayısı'], ['x5', 'Tehdit altındaki siyah taş'], ['x6', 'Tehdit altındaki kırmızı taş']];
    var A = [8, 6, 1, 0, 2, 0], B = [6, 6, 2, 0, 0, 2];
    var W = [1, -1, 1.5, -1.5, -0.5, 0.5], w0 = 0;
    var rows = el('div', 'neu-rows'); cb.appendChild(rows);
    var outs = [];
    F.forEach(function (f, i) {
      var r = el('div', 'neu-row'); r.style.gridTemplateColumns = '13em 3.2em 3.2em 1fr 3.5em';
      r.innerHTML = '<span>' + f[1] + ' <small class="mm-note">(' + f[0] + ')</small></span><span class="pill">A: ' + A[i] + '</span><span class="pill">B: ' + B[i] + '</span>';
      var sl = el('input'); sl.type = 'range'; sl.min = -3; sl.max = 3; sl.step = 0.5; sl.value = W[i]; sl.setAttribute('aria-label', f[1] + ' ağırlığı (w' + (i + 1) + ')');
      var o = el('output'); o.textContent = (W[i] > 0 ? '+' : '') + W[i];
      sl.addEventListener('input', function () { W[i] = +sl.value; o.textContent = (W[i] > 0 ? '+' : '') + W[i]; calc(); });
      r.appendChild(sl); r.appendChild(o); rows.appendChild(r);
    });
    var res = el('div', 'score'); cb.appendChild(res);
    res.innerHTML = '<div id="ckA"><span>Tahta A</span><b></b></div><div id="ckB"><span>Tahta B</span><b></b></div>';
    function calc() {
      var a = w0, b = w0; F.forEach(function (f, i) { a += W[i] * A[i]; b += W[i] * B[i]; });
      var ea = document.getElementById('ckA'), eb = document.getElementById('ckB');
      ea.querySelector('b').textContent = a.toFixed(1); eb.querySelector('b').textContent = b.toFixed(1);
      ea.className = a > b ? 'win' : ''; eb.className = b > a ? 'win' : '';
    }
    calc();
  }
})();
