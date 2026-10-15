/* Görüntü İşleme · Bölüm 1: piksel matrisi, örnekleme/nicemleme laboratuvarı, eş zamanlı kontrast,
   dosya boyutu hesaplayıcı, format seçici, aşama kutuları. Görüntüler kodla üretilir. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function $(id) { return document.getElementById(id); }
  function pressGroup(btns, i) { btns.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); }); }

  /* ---------- Ortak: kodla çizilen sahne (güneş, tepeler, ev) ---------- */
  function drawScene(ctx, w, h) {
    var g = ctx.createLinearGradient(0, 0, 0, h * 0.7); g.addColorStop(0, '#3b82f6'); g.addColorStop(1, '#bfdbfe');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(w * 0.78, h * 0.22, h * 0.11, 0, 7); ctx.fill();
    ctx.fillStyle = '#16a34a'; ctx.beginPath(); ctx.moveTo(0, h);
    for (var x = 0; x <= w; x += 4) ctx.lineTo(x, h * 0.66 + Math.sin(x / w * 7) * h * 0.06); ctx.lineTo(w, h); ctx.fill();
    ctx.fillStyle = '#92400e'; ctx.fillRect(w * 0.18, h * 0.52, w * 0.22, h * 0.26);
    ctx.fillStyle = '#b91c1c'; ctx.beginPath(); ctx.moveTo(w * 0.15, h * 0.52); ctx.lineTo(w * 0.29, h * 0.36); ctx.lineTo(w * 0.43, h * 0.52); ctx.fill();
    ctx.fillStyle = '#fef3c7'; ctx.fillRect(w * 0.23, h * 0.58, w * 0.06, h * 0.07); ctx.fillRect(w * 0.31, h * 0.58, w * 0.06, h * 0.07);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.2, h * 0.05, 0, 7); ctx.arc(w * 0.56, h * 0.18, h * 0.06, 0, 7); ctx.arc(w * 0.62, h * 0.2, h * 0.05, 0, 7); ctx.fill();
  }

  /* ---------- 1) 8×8 gülen yüz matrisi ---------- */
  var pm = $('pixmat');
  if (pm) {
    var F = [
      [0, 0, 255, 255, 255, 255, 0, 0], [0, 255, 255, 255, 255, 255, 255, 0], [255, 255, 0, 255, 255, 0, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255],
      [255, 0, 255, 255, 255, 255, 0, 255], [255, 255, 0, 0, 0, 0, 255, 255], [0, 255, 255, 255, 255, 255, 255, 0], [0, 0, 255, 255, 255, 255, 0, 0]
    ];
    var wrap = el('div', 'pm-wrap');
    var left = el('div', 'pm-left'), right = el('div', 'pm-right');
    var cv = el('canvas', 'pm-cv'); cv.width = 8; cv.height = 8; cv.style.imageRendering = 'pixelated';
    var c2 = cv.getContext('2d'); F.forEach(function (r, y) { r.forEach(function (v, x) { c2.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; c2.fillRect(x, y, 1, 1); }); });
    left.appendChild(cv); left.appendChild(el('p', 'mm-note', 'Ekranda görünen: 8×8 piksellik bir görüntü'));
    var t = '<table class="pm-tbl">'; F.forEach(function (r, y) { t += '<tr>'; r.forEach(function (v, x) { t += '<td style="background:rgb(' + v + ',' + v + ',' + v + ');color:' + (v > 127 ? '#111' : '#eee') + '" title="f(' + x + ',' + y + ') = ' + v + '">' + v + '</td>'; }); t += '</tr>'; }); t += '</table>';
    right.innerHTML = t + '<p class="mm-note">Bilgisayarın gördüğü: her piksel bir sayı. Beyaz = 255, siyah = 0. Görüntü, f(x, y) fonksiyonunun matris hâlidir.</p>';
    wrap.appendChild(left); wrap.appendChild(right); pm.appendChild(wrap);
  }

  /* ---------- 2) Örnekleme ve nicemleme laboratuvarı ---------- */
  var pl = $('pixlab');
  if (pl) {
    var src = document.createElement('canvas'); src.width = 256; src.height = 192; drawScene(src.getContext('2d'), 256, 192);
    var out = el('canvas', 'pl-cv'); out.width = 256; out.height = 192; var oc = out.getContext('2d'); oc.imageSmoothingEnabled = false;
    var sizes = [256, 128, 64, 32, 16, 8];
    var row1 = el('div', 'slider-row'); row1.innerHTML = '<label for="plr">Uzamsal çözünürlük</label><input id="plr" type="range" min="0" max="5" value="0"><output id="plro"></output>';
    var row2 = el('div', 'slider-row'); row2.innerHTML = '<label for="plb">Yoğunluk çözünürlüğü (bit)</label><input id="plb" type="range" min="1" max="8" value="8"><output id="plbo"></output>';
    var gray = el('label', 'hyp-s', ''); var gc = el('input'); gc.type = 'checkbox'; gray.appendChild(gc); gray.appendChild(document.createTextNode(' Gri tonlamalı göster'));
    pl.appendChild(row1); pl.appendChild(row2); pl.appendChild(gray);
    var wrapc = el('div', 'pl-wrap'); wrapc.appendChild(out); pl.appendChild(wrapc);
    var info = el('div', 'status'); pl.appendChild(info);
    var tmp = document.createElement('canvas');
    function upd() {
      var n = sizes[+$('plr').value], bits = +$('plb').value, h = Math.round(n * 0.75), levels = Math.pow(2, bits);
      $('plro').textContent = n + '×' + h; $('plbo').textContent = bits + ' bit';
      tmp.width = n; tmp.height = h; var tc = tmp.getContext('2d'); tc.imageSmoothingEnabled = true; tc.drawImage(src, 0, 0, n, h);
      var d = tc.getImageData(0, 0, n, h), a = d.data, step = 255 / (levels - 1);
      for (var i = 0; i < a.length; i += 4) {
        if (gc.checked) { var l = 0.299 * a[i] + 0.587 * a[i + 1] + 0.114 * a[i + 2]; a[i] = a[i + 1] = a[i + 2] = l; }
        for (var k = 0; k < 3; k++) a[i + k] = Math.round(Math.round(a[i + k] / step) * step);
      }
      tc.putImageData(d, 0, 0); oc.imageSmoothingEnabled = false; oc.drawImage(tmp, 0, 0, 256, 192);
      var bytes = n * h * (gc.checked ? bits : 3 * bits) / 8;
      info.innerHTML = '<b>' + n + ' × ' + h + ' = ' + (n * h).toLocaleString('tr-TR') + ' piksel</b> · piksel başına <b>' + levels + '</b> yoğunluk seviyesi' + (gc.checked ? '' : ' (her renk kanalı için)') + ' · yaklaşık ham boyut: <b>' + (bytes < 1024 ? Math.round(bytes) + ' B' : (bytes / 1024).toFixed(1).replace('.', ',') + ' KB') + '</b>';
    }
    ['plr', 'plb'].forEach(function (id) { $(id).addEventListener('input', upd); }); gc.addEventListener('change', upd); upd();
  }

  /* ---------- 3) Eş zamanlı kontrast ---------- */
  var sc = $('simcon');
  if (sc) {
    var rowc = el('div', 'slider-row'); rowc.innerHTML = '<label for="scv">İç karelerin gri değeri</label><input id="scv" type="range" min="40" max="220" value="128"><output id="scvo">128</output>';
    sc.appendChild(rowc);
    var grid = el('div', 'sc-grid'); var inner = [];
    [20, 90, 160, 235].forEach(function (bg) { var b = el('div', 'sc-box'); b.style.background = 'rgb(' + bg + ',' + bg + ',' + bg + ')'; var i = el('div', 'sc-in'); b.appendChild(i); inner.push(i); b.appendChild(el('span', 'sc-lbl', 'arka plan ' + bg)); grid.appendChild(b); });
    sc.appendChild(grid);
    var note = el('div', 'status'); sc.appendChild(note);
    function u2() { var v = +$('scv').value; $('scvo').textContent = v; inner.forEach(function (i) { i.style.background = 'rgb(' + v + ',' + v + ',' + v + ')'; }); note.innerHTML = 'Dört iç karenin değeri de <b>aynı: ' + v + '</b>. Ama arka plan açıldıkça iç kare gözüne daha koyu görünür: algılanan parlaklık, gerçek değerin basit bir yansıması değildir.'; }
    $('scv').addEventListener('input', u2); u2();
  }

  /* ---------- 4) Dosya boyutu hesaplayıcı ---------- */
  var sz = $('sizecalc');
  if (sz) {
    var P = [['Telefon fotoğrafı (12 MP)', 4000, 3000, 24], ['Full HD ekran görüntüsü', 1920, 1080, 24], ['Tıbbi gri tonlu görüntü', 512, 512, 16], ['Küçük simge', 64, 64, 32]];
    var chips = el('div', 'chips'), btns = [];
    var f = el('div', 'hyp-sel'); f.innerHTML = '<label class="hyp-s"><span>Genişlik (piksel)</span><input id="szw" type="number" min="1" value="4000"></label><label class="hyp-s"><span>Yükseklik (piksel)</span><input id="szh" type="number" min="1" value="3000"></label><label class="hyp-s"><span>Piksel başına bit</span><input id="szb" type="number" min="1" value="24"></label>';
    var res = el('div', 'quad-info');
    P.forEach(function (p, i) { var b = el('button', 'chip', p[0]); b.type = 'button'; b.addEventListener('click', function () { $('szw').value = p[1]; $('szh').value = p[2]; $('szb').value = p[3]; pressGroup(btns, i); calc(); }); chips.appendChild(b); btns.push(b); });
    sz.appendChild(chips); sz.appendChild(f); sz.appendChild(res);
    function calc() {
      var w = +$('szw').value || 0, h = +$('szh').value || 0, b = +$('szb').value || 0, bytes = w * h * b / 8;
      var s = bytes >= 1048576 ? (bytes / 1048576).toFixed(1).replace('.', ',') + ' MB' : bytes >= 1024 ? (bytes / 1024).toFixed(1).replace('.', ',') + ' KB' : Math.round(bytes) + ' B';
      res.innerHTML = '<p class="mm-note">Ham (sıkıştırılmamış) boyut = genişlik × yükseklik × bit / 8</p><p><b>' + (w * h).toLocaleString('tr-TR') + '</b> piksel × <b>' + b + '</b> bit = <b>' + s + '</b></p><p class="mm-note">Seviye sayısı: 2<sup>' + b + '</sup> = ' + (b <= 32 ? Math.pow(2, b).toLocaleString('tr-TR') : '…') + '. JPEG gibi biçimler bunu sıkıştırarak çok daha küçük saklar.</p>';
    }
    ['szw', 'szh', 'szb'].forEach(function (id) { $(id).addEventListener('input', function () { pressGroup(btns, -1); calc(); }); }); pressGroup(btns, 0); calc();
  }

  /* ---------- 5) Hangi format? ---------- */
  var fp = $('fmtpick');
  if (fp) {
    var S = [
      { q: 'Bir web sitesine saydam arka planlı logo koyacaksın.', a: 'PNG', why: 'PNG kayıpsız sıkıştırma ve saydamlık (alfa kanalı) destekler. Web grafikleri ve tasarım için yaygındır.' },
      { q: 'Telefonla çekilen tatil fotoğraflarını paylaşacaksın; dosya küçük olsun, hafif kalite kaybı sorun değil.', a: 'JPEG', why: 'JPEG kayıplı sıkıştırma kullanır; kalite ile boyut arasında iyi bir denge kurar. Web ve mobilde yaygındır.' },
      { q: 'Bir hastanın MR görüntüsü; hasta bilgileri de dosyayla birlikte saklanacak.', a: 'DICOM', why: 'DICOM tıbbi görüntüleme standardıdır ve hasta bilgisi gibi üst verileri taşır.' },
      { q: 'Veri kaybı istenmeyen yüksek kaliteli arşiv ve profesyonel baskı.', a: 'TIFF', why: 'TIFF kayıpsız ve yüksek kalitelidir; radyoloji ve profesyonel baskıda tercih edilir.' },
      { q: 'Matbaaya gidecek bir afiş (baskı renk modeli).', a: 'CMYK', why: 'CMYK (camgöbeği, eflatun, sarı, siyah) baskı endüstrisinin standart renk modelidir; ekranda doğru renk göstermez.' },
      { q: 'Birkaç kareli, 256 renkle yetinen basit bir animasyon.', a: 'GIF', why: 'GIF 256 renkle sınırlıdır ve basit animasyonu destekler.' }
    ];
    var OPT = ['PNG', 'JPEG', 'DICOM', 'TIFF', 'CMYK', 'GIF'], i = 0, score = 0;
    var box = el('div', 'quad-info'); fp.appendChild(box);
    function render() {
      if (i >= S.length) { box.innerHTML = '<h3>Bitti: ' + score + ' / ' + S.length + '</h3><button class="btn primary" id="fmtre" type="button">Baştan</button>'; $('fmtre').addEventListener('click', function () { i = 0; score = 0; render(); }); return; }
      var s = S[i]; box.innerHTML = '<div class="kicker">Senaryo ' + (i + 1) + ' / ' + S.length + '</div><p><b>' + s.q + '</b></p>';
      var row = el('div', 'chips'); OPT.forEach(function (o) { var b = el('button', 'chip', o); b.type = 'button'; b.addEventListener('click', function () { var ok = o === s.a; if (ok) score++; row.querySelectorAll('.chip').forEach(function (x) { x.disabled = true; if (x.textContent === s.a) x.style.borderColor = 'var(--ok)'; }); var r = el('div', 'callout ' + (ok ? 'ok' : 'bad'), '<b>' + (ok ? 'Doğru!' : 'Doğrusu ' + s.a) + '</b>' + s.why); box.appendChild(r); var nb = el('button', 'btn primary', 'Sonraki'); nb.type = 'button'; nb.addEventListener('click', function () { i++; render(); }); box.appendChild(nb); }); row.appendChild(b); });
      box.appendChild(row);
    }
    render();
  }

  /* ---------- 6) Aşama kutuları ---------- */
  var st = $('stages');
  if (st) {
    var ST = [
      ['Edinim', 'Fiziksel sahneyi dijital ortama aktarmak: kamera, sensör dizisi, tarayıcı. Kaliteyi aydınlatma, lens ve sensör türü belirler.'],
      ['Ön işleme', 'Gürültü giderme, boyut düzeltme, histogram düzenleme, geometrik dönüşümler. Girdiyi temizler ve standartlaştırır.'],
      ['İyileştirme', 'İnsan algısı için: kontrast, keskinleştirme, renk dengeleme. Öznel kaliteyi artırır.'],
      ['Restorasyon', 'Bozulmayı modelleyip geri almak: bulanıklık, eksik bölge, parazit. Matematiksel modelle özgün hâle yaklaşmak.'],
      ['Renk işleme', 'RGB, HSV, CIELab gibi renk modelleriyle dönüşümler, renk dengesi, renge göre bölütleme.'],
      ['Morfoloji', 'İkili görüntülerde nesne biçimi: erozyon, genleşme, açma, kapama; yapısal elemanlarla.'],
      ['Bölütleme', 'Görüntüyü anlamlı bölgelere ayırmak: ilgilenilen nesneyi arka plandan ayırmak. Eşikleme, kümeleme, CNN.'],
      ['Tanıma', 'Bölgelerin özniteliklerine bakarak “bu ne?” demek: SVM, k-NN, karar ağaçları, derin ağlar.'],
      ['Temsil ve açıklama', 'Nesneyi sayılarla (şekil, renk, doku, kontur) temsil edip vektörleştirmek.'],
      ['Sıkıştırma', 'Daha az bellek ve bant genişliği: JPEG (kayıplı), PNG (kayıpsız) gibi.']
    ];
    var chips2 = el('div', 'chips'), info2 = el('div', 'quad-info'), b2 = [];
    ST.forEach(function (s, i) { var b = el('button', 'chip', (i + 1) + '. ' + s[0]); b.type = 'button'; b.addEventListener('click', function () { pressGroup(b2, i); info2.innerHTML = '<h3>' + (i + 1) + '. ' + s[0] + '</h3><p>' + s[1] + '</p>'; }); chips2.appendChild(b); b2.push(b); });
    st.appendChild(chips2); st.appendChild(info2); b2[0].click();
  }

  /* ---------- 7) Gözün hücreleri ---------- */
  var eye = $('eyecells');
  if (eye) {
    var C = [['Koniler', 'Renkli görme; parlak ışıkta çalışır; fovea (görme merkezi) bölgesinde yoğundur.', 'Gündüz bir tabelanın rengini ayırt etmek.'], ['Çubuklar', 'Düşük ışıkta çalışır, çevresel görüşten sorumludur; retinanın geneline dağılmıştır; renk vermez.', 'Karanlık odada eşyaların gri tonlarda, silik görünmesi.']];
    var cb = el('div', 'chips'), inf = el('div', 'quad-info'), bb = [];
    C.forEach(function (c, i) { var b = el('button', 'chip', c[0]); b.type = 'button'; b.addEventListener('click', function () { pressGroup(bb, i); inf.innerHTML = '<h3>' + c[0] + '</h3><p>' + c[1] + '</p><div class="callout real"><b>Gerçek hayat</b>' + c[2] + '</div>'; }); cb.appendChild(b); bb.push(b); });
    eye.appendChild(cb); eye.appendChild(inf); bb[0].click();
  }
})();
