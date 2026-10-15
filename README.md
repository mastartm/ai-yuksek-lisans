# Yüksek Lisans Görsel Ders Notları

Yüksek lisans derslerinin slayt tarzı, görsel ve etkileşimli anlatımı. Her bölümün sonunda quiz vardır; yanlış cevapta doğru cevap ve nedeni gösterilir.

Saf HTML, CSS ve JavaScript. Derleme adımı ve sunucu yoktur.

## Çalıştırma

`index.html` dosyasını tarayıcıda aç. Ya da klasörde yerel bir sunucu başlat:

```bash
python -m http.server 8137
```

Sonra `http://localhost:8137` adresine git.

## Yapı

| Yol | Görev |
|---|---|
| `index.html` | Ders listesi |
| `<ders>/index.html` | Dersin bölüm listesi |
| `<ders>/bolum-N.html` | Bir bölümün slaytları ve quizi |
| `assets/js/chapters.js` | Ders ve bölüm kayıt defteri (kartlar buradan çizilir) |
| `assets/css/style.css` | Tüm stiller (açık/koyu tema, telefon uyumu) |
| `assets/js/deck.js` | Slayt motoru (ok tuşları, kaydırma, içindekiler) |
| `assets/js/quiz.js` | Quiz motoru |
| `assets/js/responsive.js` | Dar ekranda geniş çizimleri kaydırılabilir yapar |
| `assets/js/graphcore.js`, `graphlab.js`, `gridlab.js`, `minimax.js`, `widgets.js` | Arama algoritmaları bölümünün etkileşimli araçları |
| `assets/data/` | Quiz soruları ve örnek veriler |

Dersler: `yapay-zeka-temelleri`, `makine-ogrenmesi`, `goruntu-isleme`, `veri-bilimi`, `arastirma-yontemleri`.

## Yeni bölüm eklemek

1. `<ders>/bolum-N.html` dosyasını `yapay-zeka-temelleri/bolum-3.html` iskeletinden kopyala; `<section class="slide" data-title="...">` blokları slayttır.
2. Quiz sorularını `assets/data/<ders>-bolum-N-quiz.js` içine `window.QUIZ_...` olarak yaz ve `#quiz` öğesinin `data-quiz` değerini ona ayarla.
3. `assets/js/chapters.js` içinde ilgili bölümün son değerini `1` yap (kart “Hazır” olur).
