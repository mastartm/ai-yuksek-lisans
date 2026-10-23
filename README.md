# Yüksek Lisans Görsel Ders Notları

Yüksek lisans derslerinin slayt tarzı, görsel ve etkileşimli anlatımı. Her bölümün sonunda quiz mevcuttur; yanlış cevapta doğru cevap, nedeni ve konunun ders notundaki yeri gösterilir.

**Canlı site:** https://mastartm.github.io/ai-yuksek-lisans/

Saf HTML, CSS ve JavaScript. Siteyi çalıştırmak için derleme ya da sunucu gerekmez; GitHub Pages doğrudan yayınlar.

## Dersler

Şimdilik her dersin ilk 6 bölümü hazır. Diğer bölümler "Yakında" olarak listelenir.

| Ders | Hazır bölümler |
|---|---|
| Yapay Zekâ Temelleri | 1 Yapay Zekâ Tanımı ve Tarihsel Gelişimi · 2 Problem Çözme · 3 Arama Algoritmaları · 4 Bilgi Gösterimi · 5 Mantık · 6 Akıl Yürütme |
| Makine Öğrenmesi | 1 Giriş · 2 Kavram Öğrenme · 3 Karar Ağacı Öğrenme · 4 Doğrusal Modeller ve Regresyon · 5 Destek Vektör Makineleri ve Sinir Ağları · 6 Bayes Öğrenmesi · 7 Naive Bayes, Bayes Ağları ve Model Değerlendirme · 8 Kümeleme · 9 Bölümlemeli Kümeleme · 10 Hiyerarşik Kümeleme · 11 Yoğunluk ve Izgara Tabanlı Kümeleme, Değerlendirme · 12 Hesaplamalı Öğrenme Teorisi · 13 Model Toplulukları · 14 Takviyeli Öğrenme |
| Görüntü İşleme | 1 Görüntü İşlemeye Giriş · 2 Histogramlar · 3 Noktasal İşlemler · 4 Piksel İlişkileri · 5 Görüntü İyileştirme · 6 Frekans Alanına Giriş |
| Veri Bilimi | 1 Veri Biliminin Bilimsel Temelleri · 2 Felsefi ve Epistemolojik Temeller · 3 Veri Toplama Süreçleri ve Etik Boyut · 4 Keşifçi Veri Analizi ve Görselleştirme · 5 İstatistiksel Analiz ve Çıkarım Temelleri · 6 Veri Mimarisi ve Yönetimi |
| Araştırma Yöntemleri | 1 Giriş · 2 Araştırma Problemini Tanımlama · 3 Nicel Araştırmalar · 4 Nitel Araştırmalar · 5 Örnekleme Yöntemleri · 6 Verilerin Toplanması |

## Özellikler

- **Slaytlar:** ok tuşları, alttaki Önceki / Sonraki düğmeleri ve içindekiler menüsüyle gezilir. Her bölümün başında "Büyük resim" şeması bulunur.
- **Etkileşimli araçlar:** kurcalanabilen laboratuvarlar, simülasyonlar ve çizimler (arama algoritmaları haritası, 8-bulmaca, FIND-S ve ADAY-ELEME, karar ağacı büyütme, bayır inişi ve polinom uyumu, histogram ve nokta işlemleri, bağlı bileşen bulma, eksik veri simülatörü, eksen kırpma ve PCA, kalıtım ve istisna, SVM aralığı ve XOR, filtre laboratuvarı, Bayes güncellemesi ve p-değeri, ileri/geri zincirleme, çözümleme ve naive Bayes, tanı testi ve MAP, frekans filtreleri, ambar–göl ve yeniden tanımlama riski, Cronbach alfa, örnekleme ve örneklem büyüklüğü, seçkisizlik simülasyonu ve daha fazlası).
- **Laboratuvar çerçevesi:** 4. bölümden itibaren her etkileşimli aracın başında “ne yapacaksın / ne göreceksin / ne anlamalısın”, açılır bir terimler listesi ve verinin kaynağı (ders notundaki hangi örneğe dayandığı ya da sanal olduğu) yazılıdır.
- **Gerçek hayat örnekleri:** her kavramın yanında günlük hayattan bir örnek.
- **Bölüm sonu quizi:** sorular ders notlarındaki konulara göre hazırlanmıştır. Her sorunun `ref` alanı, ilgili not başlığını öğrenciye gösterir. Yanlış cevapta doğru seçenek ve açıklama çıkar, yanlış yapılan sorular yeniden çözülebilir.
- **Açık / koyu tema** ve **telefon uyumu** (320 px ve üstü). Geniş çizimler ve tablolar kendi içinde yana kaydırılır.

## Çalıştırma

`index.html` dosyasını tarayıcıda aç. Ya da klasörde yerel bir sunucu başlat:

```bash
python -m http.server 8137
```

Sonra `http://localhost:8137` adresine git.

## Klasör yapısı

| Yol | Görev |
|---|---|
| `index.html` | Ders listesi (ana sayfa) |
| `<ders>/index.html` | Dersin bölüm listesi |
| `<ders>/bolum-N.html` | Bir bölümün slaytları ve quizi (derleme çıktısı) |
| `content/<ders>/bolum-N.html` | Bölümün düzenlenebilir kaynağı (yalnızca slaytlar) |
| `tools/build.py` | `content/` kaynaklarından `<ders>/bolum-N.html` sayfalarını üretir |
| `tools/add_overview.py` | Her bölümün başındaki "Büyük resim" şemalarını üretir |
| `assets/js/chapters.js` | Ders ve bölüm kayıt defteri (kartlar ve listeler buradan çizilir) |
| `assets/js/deck.js` | Slayt motoru (ok tuşları, içindekiler, tema) |
| `assets/js/quiz.js` | Quiz motoru |
| `assets/js/responsive.js` | Dar ekranda çizim ve tabloları kaydırılabilir yapar |
| `assets/js/*.js` (diğerleri) | Konuya özel etkileşimli araçlar (`yz1`, `yz4`, `yz5`, `yz6`, `puzzle8`, `ml1`–`ml6`, `gi1`, `gi4`–`gi6`, `imglab`, `vb`, `vb4`–`vb6`, `ar`, `ar5`, `ar6`, arama araçları) |
| `assets/css/style.css` | Tüm stiller |
| `assets/data/` | Quiz soruları |

Dersler: `yapay-zeka-temelleri`, `makine-ogrenmesi`, `goruntu-isleme`, `veri-bilimi`, `arastirma-yontemleri`.

> Yapay Zekâ 3 (Arama Algoritmaları) elle yazılmıştır, `content/` altında kaynağı yoktur. Onu doğrudan `yapay-zeka-temelleri/bolum-3.html` içinde düzenle.

## Yeni bölüm eklemek

1. `content/<ders>/bolum-N.html` dosyasını oluştur. Başındaki HTML yorumu bölümün bilgisini taşır:

   ```html
   <!--
   course: veri-bilimi
   course_title: Veri Bilimi
   no: 4
   title: Bölüm Başlığı
   quiz: QUIZ_VB_4
   quiz_file: vb-bolum-4-quiz.js
   scripts: vb.js
   -->
   <section class="slide" data-title="Başlangıç">…</section>
   ```

   Her `<section class="slide" data-title="...">` bir slayttır. Var olan bir bölümü iskelet olarak kopyalamak en kolayıdır.
2. Quiz sorularını `assets/data/<ders>-bolum-N-quiz.js` içine `window.QUIZ_...` olarak yaz. Her soru şu alanlara sahiptir: `topic`, `q`, `options`, `correct` (0'dan başlar), `explain`, `ref` (ders notundaki başlık).
3. `assets/js/chapters.js` içinde bölümün son değerini `1` yap, kart "Hazır" olur.
4. Sayfaları üret:

   ```bash
   python tools/build.py
   ```

   `content/` altındaki bir dosyayı her düzenlediğinde yeniden çalıştır. Quiz ya da JavaScript dosyalarını düzenlemek derleme gerektirmez.

## Yayın (GitHub Pages)

Repo ayarlarında **Settings → Pages → Build and deployment** bölümünde kaynak olarak `main` dalı ve `/ (root)` klasörü seçilidir. `main` dalına yapılan her push, birkaç dakika içinde siteyi günceller. Tarayıcı eski sürümü gösterirse Ctrl+F5 ile yenile.

## Geri bildirim

Hatalı ya da kafa karıştıran bir yer, çalışmayan bir etkileşim ya da yazım hatası görürsen **Issues** sekmesinden bildirebilirsin. Hangi ders, bölüm ve slaytta olduğunu yazman yeterli.
