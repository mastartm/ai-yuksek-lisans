/* Ders ve bölüm kayıt defteri. Yeni bölüm eklenince ilgili satırda ready: true yapılır.
   Giriş sayfası ve ders sayfaları kartlarını buradan çizer. */
(function () {
  'use strict';
  var C = [
    { slug: 'yapay-zeka-temelleri', title: 'Yapay Zekâ Temelleri', blurb: 'Tanım, problem çözme, arama, mantık, karar verme, etik.', chapters: [
      [1, 'Yapay Zekâ Tanımı ve Tarihsel Gelişimi', 1], [2, 'Problem Çözme', 1], [3, 'Arama Algoritmaları', 1], [4, 'Bilgi Gösterimi', 1],
      [5, 'Mantık', 1], [6, 'Akıl Yürütme', 1], [7, 'Karar Verme', 0], [8, 'Karar Ağaçları', 0],
      [9, 'Yapay Zekâ Etiği ve Toplumsal Etkileri', 0], [10, 'Yapay Zekânın Geleceği', 0]
    ] },
    { slug: 'makine-ogrenmesi', title: 'Makine Öğrenmesi', blurb: 'Karar ağaçları, regresyon, Bayes, kümeleme, topluluklar, takviyeli öğrenme.', chapters: [
      [1, 'Giriş', 1], [2, 'Kavram Öğrenme', 1], [3, 'Karar Ağacı Öğrenme', 1], [4, 'Doğrusal Modeller ve Regresyon', 1],
      [5, 'Destek Vektör Makineleri ve Sinir Ağları', 1], [6, 'Bayes Öğrenmesi', 1], [7, 'Naive Bayes, Bayes Ağları ve Model Değerlendirme', 1],
      [8, 'Kümeleme', 1], [9, 'Bölümlemeli Kümeleme (k-means)', 1], [10, 'Hiyerarşik Kümeleme', 0],
      [11, 'Yoğunluk ve Izgara Tabanlı Kümeleme', 0], [12, 'Hesaplamalı Öğrenme Teorisi', 0], [13, 'Model Toplulukları', 0], [14, 'Takviyeli Öğrenme', 0]
    ] },
    { slug: 'goruntu-isleme', title: 'Görüntü İşleme', blurb: 'Piksel, histogram, filtre, frekans, morfoloji, bölütleme, nesne tanıma.', chapters: [
      [1, 'Görüntü İşlemeye Giriş', 1], [2, 'Histogramlar', 1], [3, 'Noktasal İşlemler', 1], [4, 'Piksel İlişkileri', 1], [5, 'Görüntü İyileştirme', 1],
      [6, 'Frekans Alanına Giriş', 1], [7, 'Filtreleme', 0], [8, 'Frekans Uzayında Filtreleme', 0], [9, 'Görüntü Onarımı ve Geri Çatma', 0],
      [10, 'Morfolojik Görüntü İşleme', 0], [11, 'Renkli Görüntü İşleme', 0], [12, 'Görüntü Bölütleme', 0], [13, 'Nesne Tanıma', 0], [14, 'Geleceğin Paradigmaları', 0]
    ] },
    { slug: 'veri-bilimi', title: 'Veri Bilimi', blurb: 'Temeller, veri toplama ve etik, EDA, istatistik, büyük veri, metodolojiler.', chapters: [
      [1, 'Veri Biliminin Bilimsel Temelleri', 1], [2, 'Felsefi ve Epistemolojik Temeller', 1], [3, 'Veri Toplama ve Etik', 1], [4, 'Keşifçi Veri Analizi ve Görselleştirme', 1],
      [5, 'İstatistiksel Analiz ve Çıkarım', 1], [6, 'Veri Mimarisi ve Yönetimi', 1], [7, 'Büyük Veri ve Ölçeklenebilirlik', 0],
      [8, 'Makine Öğrenmesi ve Yapay Zekâ', 0], [9, 'Veri Biliminin Geleceği', 0], [10, 'Metodolojiler ve Teknik Uygulamalar', 0]
    ] },
    { slug: 'arastirma-yontemleri', title: 'Araştırma Yöntemleri', blurb: 'Bilimsel yöntem, problem, nicel ve nitel araştırma, örnekleme, veri toplama.', chapters: [
      [1, 'Giriş', 1], [2, 'Araştırma Problemini Tanımlama', 1], [3, 'Nicel Araştırmalar', 1], [4, 'Nitel Araştırmalar', 1], [5, 'Örnekleme Yöntemleri', 1], [6, 'Verilerin Toplanması', 1]
    ] }
  ];
  window.COURSES = C;

  function card(href, num, title, desc, ready) {
    var a = document.createElement(ready ? 'a' : 'div');
    a.className = 'card' + (ready ? '' : ' soon');
    if (ready) a.href = href;
    a.innerHTML = '<div class="num">' + num + '</div><h3>' + title + '</h3>' + (desc ? '<p>' + desc + '</p>' : '') +
      '<span class="tag' + (ready ? '' : ' soon') + '">' + (ready ? 'Hazır' : 'Yakında') + '</span>';
    return a;
  }

  function row(href, num, title, ready) {
    var el = document.createElement(ready ? 'a' : 'div');
    el.className = 'row' + (ready ? '' : ' soon');
    if (ready) el.href = href;
    el.innerHTML = '<span class="rn">' + num + '</span><span class="rt">' + title + '</span>' +
      '<span class="tag' + (ready ? '' : ' soon') + '">' + (ready ? 'Hazır' : 'Yakında') + '</span>';
    return el;
  }

  /* Giriş sayfası: ders kartları, tıklayınca dersin bölüm listesine gider */
  var coursesBox = document.getElementById('courses');
  if (coursesBox) {
    C.forEach(function (c) {
      var ready = c.chapters.filter(function (x) { return x[2]; }).length;
      var a = document.createElement('a'); a.className = 'card'; a.href = c.slug + '/index.html';
      a.innerHTML = '<div class="num">DERS</div><h3>' + c.title + '</h3><p>' + c.blurb + '</p>' +
        '<span class="tag' + (ready ? '' : ' soon') + '">' + ready + ' / ' + c.chapters.length + ' bölüm hazır</span>';
      coursesBox.appendChild(a);
    });
  }

  /* Ders sayfası: tüm bölümler tek liste */
  var chBox = document.getElementById('chapters');
  if (chBox) {
    chBox.className = 'chlist';
    var slug = document.body.getAttribute('data-course');
    C.forEach(function (c) {
      if (c.slug !== slug) return;
      c.chapters.forEach(function (x) { chBox.appendChild(row('bolum-' + x[0] + '.html', x[0], x[1], !!x[2])); });
    });
  }

  /* Tema (ders ve giriş sayfaları) */
  var btn = document.getElementById('theme');
  if (btn) {
    var root = document.documentElement;
    try { var t = localStorage.getItem('theme'); if (t) root.setAttribute('data-theme', t); } catch (e) { }
    btn.addEventListener('click', function () {
      var dark = root.getAttribute('data-theme') === 'dark' || (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
      var n = dark ? 'light' : 'dark'; root.setAttribute('data-theme', n);
      try { localStorage.setItem('theme', n); } catch (e) { }
    });
  }
})();
