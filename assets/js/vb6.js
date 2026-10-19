/* Veri Bilimi · Bölüm 6: ambar (schema-on-write) ve göl (schema-on-read) karşılaştırması; k-anonimlik ile yeniden tanımlama riski.
   Kayıtlar bu site için üretilmiş sanal verilerdir. */
(function () {
  'use strict';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  /* ---------- 1) Schema-on-write ve schema-on-read ---------- */
  var sl = document.getElementById('schemalab');
  if (sl) {
    var RAW = [
      { ad: 'Ayşe', yas: 31, sehir: 'İzmir', email: 'ayse@ornek.test', kayit: '2026-03-02' },
      { ad: 'Burak', yas: '28', sehir: 'Ankara', kayit: '03.04.2026' },
      { ad: 'Cem', sehir: 'Bursa', email: 'cem@ornek.test' },
      { ad: 'Deniz', yas: 45, sehir: 'İstanbul', kayit: '2026-05-11' },
      { ad: 'Ela', yas: 'otuz', sehir: 'İzmir', email: 'ela@ornek.test', kayit: '2026-06-01' },
      { ad: 'Fatih', yas: 52, sehir: 'Konya', tel: '0555 000 00 00' }
    ];
    var mode = 'lake', cols = { ad: true, yas: true, sehir: true, email: false, kayit: false, tel: false };
    var LABEL = { ad: 'ad', yas: 'yaş', sehir: 'şehir', email: 'e-posta', kayit: 'kayıt tarihi', tel: 'telefon' };
    var WH = ['ad', 'yas', 'sehir'];
    var bar = el('div', 'chips'), chips = {};
    [['wh', 'Ambar: yazarken şema'], ['lake', 'Göl: okurken şema']].forEach(function (m) { var b = el('button', 'chip', m[1]); b.type = 'button'; b.addEventListener('click', function () { mode = m[0] === 'wh' ? 'wh' : 'lake'; draw(); }); bar.appendChild(b); chips[m[0]] = b; });
    sl.appendChild(bar);
    var cb = el('div', 'chips'); cb.appendChild(el('span', 'tip', 'Okunacak alanlar: '));
    Object.keys(cols).forEach(function (k) { var b = el('button', 'chip', LABEL[k]); b.type = 'button'; b.addEventListener('click', function () { cols[k] = !cols[k]; draw(); }); cb.appendChild(b); cols[k + '_btn'] = b; });
    sl.appendChild(cb);
    var raw = el('div', 'scroll-x'); sl.appendChild(raw);
    var out = el('div', 'scroll-x'); sl.appendChild(out);
    var note = el('div', 'callout idea'); sl.appendChild(note);
    raw.innerHTML = '<p><b>Kaynaktaki ham kayıtlar (hepsi aynı biçimde değil):</b></p><pre style="white-space:pre-wrap;font-size:.8rem;margin:0">' + RAW.map(function (r) { return esc(JSON.stringify(r)); }).join('\n') + '</pre>';
    function draw() {
      chips.wh.setAttribute('aria-pressed', mode === 'wh' ? 'true' : 'false'); chips.lake.setAttribute('aria-pressed', mode === 'lake' ? 'true' : 'false');
      Object.keys(LABEL).forEach(function (k) { cols[k + '_btn'].setAttribute('aria-pressed', cols[k] ? 'true' : 'false'); });
      var sel = Object.keys(LABEL).filter(function (k) { return cols[k]; });
      var h = '<table class="cmp"><thead><tr>' + sel.map(function (k) { return '<th>' + LABEL[k] + '</th>'; }).join('') + '</tr></thead><tbody>', rows = 0, rej = 0, missing = [];
      if (mode === 'wh') {
        RAW.forEach(function (r) {
          var ok = typeof r.yas === 'number' || (typeof r.yas === 'string' && /^\d+$/.test(r.yas));
          if (!ok) { rej++; return; }
          rows++; h += '<tr>' + sel.map(function (k) { return '<td>' + (WH.indexOf(k) >= 0 ? esc(r[k]) : '<i style="color:var(--muted)">kolon yok</i>') + '</td>'; }).join('') + '</tr>';
        });
        sel.forEach(function (k) { if (WH.indexOf(k) < 0) missing.push(LABEL[k]); });
        note.innerHTML = '<b>Schema-on-write (ambar):</b>şema yükleme anında uygulanır: yaşı geçerli sayı olmayan <b>' + rej + ' kayıt reddedildi</b> (ya da temizlenmesi gerekir). Okuma hızlı ve tutarlıdır. ' + (missing.length ? '“' + missing.join(', ') + '” için tabloda kolon yok: eklemek <b>şema değişikliği ve yeniden yükleme</b> demektir.' : 'Şemadaki alanlar kullanılabilir.');
      } else {
        RAW.forEach(function (r) {
          rows++; h += '<tr>' + sel.map(function (k) { var v = r[k]; return '<td>' + (v === undefined ? '<i style="color:var(--muted)">boş</i>' : esc(v)) + '</td>'; }).join('') + '</tr>';
        });
        note.innerHTML = '<b>Schema-on-read (göl):</b>ham veri olduğu gibi saklanır, şema sorgu anında uygulanır: tüm ' + rows + ' kayıt duruyor, yeni alanlar (e-posta, telefon, kayıt tarihi) <b>depolamayı değiştirmeden</b> okunabiliyor. Bedeli: her sorguda dönüşüm ve yorumlama (“otuz”, “03.04.2026” gibi tutarsız değerleri okuyan kişi temizler); metadata ve veri kalitesi denetimi zayıfsa “veri bataklığı”na dönüşme riski.';
      }
      out.innerHTML = h + '</tbody></table>';
    }
    draw();
  }

  /* ---------- 2) k-anonimlik ---------- */
  var kl = document.getElementById('anonlab');
  if (kl) {
    var P = [[34, '35012', 'Diyabet'], [36, '35014', 'Grip'], [37, '35013', 'Astım'], [52, '06440', 'Hipertansiyon'], [55, '06441', 'Diyabet'], [58, '06445', 'Grip'], [29, '35010', 'Astım'], [31, '35011', 'Kanser'], [33, '35019', 'Grip']];
    function mk(id, label, min, max, val) { var r = el('div', 'slider-row'); r.innerHTML = '<label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="1" value="' + val + '"><output id="' + id + 'o"></output>'; kl.appendChild(r); return r.querySelector('input'); }
    var iA = mk('kya', 'Yaşı genelleştir (bant)', 0, 3, 0), iZ = mk('kyz', 'Posta kodunu maskele (hane)', 0, 5, 0);
    var ktbl = el('div', 'scroll-x'); kl.appendChild(ktbl);
    var kinfo = el('div', 'metrics'); kl.appendChild(kinfo);
    var knote = el('div', 'callout idea'); kl.appendChild(knote);
    var BANDS = [1, 10, 20, 100];
    function band(a, b) { return b === 1 ? String(a) : (Math.floor(a / b) * b) + '–' + (Math.floor(a / b) * b + b - 1); }
    function draw() {
      var b = BANDS[+iA.value], m = +iZ.value;
      document.getElementById('kyao').textContent = b === 1 ? 'tam yaş' : b === 100 ? 'gizli' : b + ' yıllık bant'; document.getElementById('kyzo').textContent = m + ' hane';
      var rows = P.map(function (p) { var age = b === 100 ? '*' : band(p[0], b), zip = p[1].slice(0, 5 - m) + new Array(m + 1).join('*'); return { age: age, zip: zip, dis: p[2], key: age + '|' + zip }; });
      var cnt = {}; rows.forEach(function (r) { cnt[r.key] = (cnt[r.key] || 0) + 1; });
      var k = Math.min.apply(null, rows.map(function (r) { return cnt[r.key]; })), risky = rows.filter(function (r) { return cnt[r.key] === 1; }).length;
      ktbl.innerHTML = '<table class="cmp"><thead><tr><th>Yaş</th><th>Posta kodu</th><th>Hastalık (hassas)</th><th>Grup boyu</th></tr></thead><tbody>' + rows.map(function (r) { var c = cnt[r.key]; return '<tr' + (c === 1 ? ' style="background:var(--bad-soft)"' : '') + '><td>' + r.age + '</td><td>' + r.zip + '</td><td>' + r.dis + '</td><td>' + c + '</td></tr>'; }).join('') + '</tbody></table>';
      kinfo.innerHTML = '<div class="metric"><b>k = ' + k + '</b>her kayıt en az k kişiyle aynı görünür</div><div class="metric"><b>' + risky + '</b>benzersiz (yeniden tanımlanabilir) kayıt</div>';
      knote.innerHTML = k === 1 ? '<b>Risk yüksek.</b>Yaş ve posta kodu gibi “yarı tanımlayıcılar” birleşince bazı kayıtlar tek kişiye indirgeniyor (kırmızı). Adı silmek yetmez: komşuluk bilgisi biliniyorsa kişi ve hastalığı bulunur. Genelleştirmeyi artır.' :
        k < 3 ? '<b>Kısmen korumalı.</b>Her kayıt en az ' + k + ' kişiyle ortak; daha güvenli için k’yi büyüt (ama ayrıntı kaybolur).' :
        '<b>k = ' + k + ':</b>her kayıt en az ' + k + ' kişiyle aynı görünüyor. Bedeli bilgi kaybı: yaş ve konum ayrıntısı azaldı; analiz değeri ile mahremiyet arasında denge kurulur. Genelleştirme tek başına yeterli değildir; notundaki gibi sentetik veri ve diferansiyel gizlilik gibi ek teknikler de kullanılır.';
    }
    [iA, iZ].forEach(function (i) { i.addEventListener('input', draw); });
    draw();
  }
})();
