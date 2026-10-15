# Yapay Zeka Temelleri — Görsel Ders Notları

Yüksek lisans Yapay Zeka Temelleri konularının slayt tarzı, görsel ve etkileşimli anlatımı. Her bölümün sonunda quiz vardır; yanlış cevapta doğru cevap ve nedeni gösterilir.

Saf HTML, CSS ve JavaScript. Derleme adımı ve sunucu yoktur.

## Çalıştırma

`index.html` dosyasını tarayıcıda aç. Ya da klasörde yerel bir sunucu başlat:

```bash
python -m http.server 8137
```

Sonra `http://localhost:8137` adresine git.

## Yapı

| Dosya | Görev |
|---|---|
| `index.html` | Bölüm listesi |
| `bolum-3.html` | Bölüm 3: Arama Algoritmaları (20 slayt) |
| `assets/css/style.css` | Tüm stiller (açık/koyu tema) |
| `assets/js/deck.js` | Slayt motoru (ok tuşları, kaydırma, içindekiler) |
| `assets/js/graphcore.js` | BFS, DFS, UCS, Greedy, A* çekirdeği |
| `assets/js/graphlab.js` | Kampüs grafı üzerinde adım adım görselleştirme |
| `assets/js/gridlab.js` | Izgara laboratuvarı (beş algoritma karşılaştırması) |
| `assets/js/minimax.js` | Minimax ve alfa-beta budama görselleştirmesi |
| `assets/js/widgets.js` | Büyüme hesaplayıcı, değerlendirme fonksiyonu aracı |
| `assets/js/quiz.js` | Quiz motoru |
| `assets/data/` | Quiz soruları ve kampüs haritası verisi |

## Yeni bölüm eklemek

1. `bolum-N.html` dosyasını `bolum-3.html` iskeletinden kopyala; `<section class="slide" data-title="...">` blokları slayttır.
2. Quiz sorularını `assets/data/bolum-N-quiz.js` içine `window.QUIZ_BOLUM_N` olarak yaz ve `#quiz` öğesinin `data-quiz` değerini ona ayarla.
3. `index.html` içindeki kartı “Hazır” yap ve bağla.

## Telif notu

İçerik özgün anlatım, özgün örnek ve kendi çizilen görsellerdir. Ders slaytlarından, ders kitabından ya da hocanın görsellerinden metin veya resim alınmamıştır. Bu site resmî ders materyali değildir.
