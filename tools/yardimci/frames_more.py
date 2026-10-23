# -*- coding: utf-8 -*-
"""Yeni bölümlerin laboratuvar çerçeveleri. Kullanım: python frames_more.py"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from frames import L, lab, frame_html, rd, wr, ROOT

NEW = {}
def add(i, *a):
    lab(i, *a); NEW[i] = L[i]

# ---------------- Makine Öğrenmesi 7 ----------------
add('tenislab', 'makine-ogrenmesi/bolum-7.html',
    'Dört özniteliğin değerini seç (başlangıçta notundaki gün: Güneşli, Serin, Yüksek, Güçlü). Sonra m kaydırıcısını artır.',
    'Tabloda her sınıf için kesirler (n_c/n) ve altta evet/hayır skorları ile normalize olasılık görünür.',
    'Skorlar çarpılarak bulunur; büyük olan kazanır. Bir kesir 0 olursa çarpım sıfırlanır; m-tahmini bu sıfırı yumuşatır.',
    [('Önsel P(evet)', '9 oynanan günün 14 güne oranı: 9/14.'), ('Koşullu olasılık', 'Sınıf verildiğinde o öznitelik değerinin görülme oranı (örn. 3/9).'), ('m', 'm-tahmininde önsel tahmine verilen ağırlık (eşdeğer örnek büyüklüğü). m = 0: klasik kesir.'), ('Normalize', 'İki skoru toplamı 1 olacak biçimde oranlamak.')],
    'Veri: TenisOyna’nın 14 günü (karar ağacı bölümündeki aynı veri). Hesap yöntemi notundaki Bölüm 7.1’e dayanır.')
add('conflab', 'makine-ogrenmesi/bolum-7.html',
    'Dört sayıyı (TP, FN, FP, TN) kaydır ya da düğmelerle hazır durumları dene: dengeli, nadir pozitif, “hep negatif” model.',
    'Karışıklık matrisi ve beş metrik (doğruluk, duyarlılık, özgüllük, kesinlik, F ölçüsü) anında güncellenir.',
    'Nadir pozitif sınıfta doğruluk yüksek görünür ama duyarlılık düşük kalır. Sınıflar dengesizse tek metriğe değil metrik takımına bakılır.',
    [('Pozitif', 'İlgilendiğin ana sınıf (hasta, dolandırıcılık, bilgisayar alıyor).'), ('TP / FN / FP / TN', 'Gerçek pozitif, yanlış negatif, yanlış pozitif, gerçek negatif.'), ('Duyarlılık', 'Gerçek pozitiflerin ne kadarı yakalandı (TP/P).'), ('Kesinlik', '“Pozitif” dediklerinin ne kadarı gerçekten pozitif.')],
    'Sayılar bu site için seçildi. Formüller notundaki Bölüm 7.3.1’den alındı.')
add('bootlab', 'makine-ogrenmesi/bolum-7.html',
    'Veri sayısı d’yi seç ve “Bir önyükleme örneği çek”e birkaç kez bas.',
    'Eğitim kümesine giren farklı kayıt sayısı, oranı ve kuramsal oran yazılır.',
    'Yerine koyarak çekince kayıtların yaklaşık %63,2’si eğitim kümesine girer; seçilmeyen yaklaşık %36,8 test kümesi olur.',
    [('Önyükleme (bootstrap)', 'Yerine koyarak örnekleme: seçilen kayıt tekrar seçilebilir.'), ('d', 'Veri kümesindeki kayıt sayısı.'), ('.632', 'Eğitime giren farklı kayıtların yaklaşık oranı.')],
    'Veri yok; tamamen rastgele simülasyon. Kuram notundaki Bölüm 7.3.4’e dayanır.')

# ---------------- Makine Öğrenmesi 8 ----------------
add('kumelab', 'makine-ogrenmesi/bolum-8.html',
    'Önce bir veri seç (yuvarlak iki küme ya da iç içe geçen iki hilal). Sonra yöntemi değiştir; yoğunluk esaslı yöntemde komşuluk yarıçapını kaydır.',
    'Noktalar bulunan kümeye göre renklenir; altta bulunan küme sayısı, gerçek iki grupla uyum ve gri kalan nokta sayısı yazılır.',
    'Uzaklık esaslı yöntem hilali ortadan böler; yoğunluk esaslı yöntem komşuluk zincirini izleyip şekli bulur. Ama yarıçap parametresi yanlışsa o da parçalanır ya da birleşir.',
    [('Uzaklık esaslı', 'Nesneyi en yakın merkeze atar; küme şekli oval varsayılır.'), ('Yoğunluk/komşuluk esaslı', 'Yarıçap içindeki komşuları aynı kümeye bağlar; zincir sürdükçe küme büyür.'), ('Komşuluk yarıçapı', 'İki noktanın komşu sayılması için en çok ne kadar uzak olabileceği.'), ('Gri nokta', 'İlk iki büyük parçanın dışında kalan, kümeye girmeyen nokta.')],
    'Veri notta yok; bu site için üretilmiş sanal noktalardır. Karşılaştırılan iki fikir (uzaklık esaslı yöntemin düzensiz şekli bölmesi, yoğunluk esaslı yöntemin şekli izlemesi) notundaki Bölüm 8.2 ve 8.3’e dayanır; buradaki yöntemler yalnızca fikri göstermek için sadeleştirilmiştir.')

if __name__ == '__main__':
    done = 0
    for i, v in NEW.items():
        p = os.path.join(ROOT, v[0].replace('/', os.sep)); s = rd(p)
        a = '<div class="lab" id="%s">' % i
        if s.count(a) != 1: print('SORUN', i, s.count(a)); continue
        pos = s.index(a)
        if 'class="lab-frame"' in s[max(0, pos - 2500):pos].split('<div class="lab"')[-1]: continue
        wr(p, s.replace(a, frame_html(i) + a)); done += 1
    print('çerçeve:', done, '/', len(NEW))
