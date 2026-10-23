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

# ---------------- Makine Öğrenmesi 9 ----------------
add('kmlab', 'makine-ogrenmesi/bolum-9.html',
    'k’yı seç, “Rastgele merkezler koy”a bas, sonra “Bir adım”a birkaç kez bas ya da “Yakınsayana kadar çalıştır”ı dene. Başka bir rastgele başlangıçla tekrarla.',
    'Noktalar en yakın merkezin rengini alır; + işaretli merkezler kümelerinin ortasına kayar. Yineleme sayısı, hata değeri ve yakınsama durumu güncellenir.',
    'Her adımda hata düşer ya da aynı kalır, merkezler oynamayınca algoritma durur. Farklı rastgele başlangıçlar farklı hata değerlerinde bitebilir; bu yerel optimumdur.',
    [('Merkez (centroid)', 'Kümedeki noktaların ortalaması.'), ('Hata', 'Her noktanın kendi merkezine uzaklığının karelerinin toplamı.'), ('Yakınsama', 'Merkezlerin artık değişmemesi.'), ('Yerel optimum', 'Başlangıca bağlı olarak takılınan, her zaman en iyi olmayan çözüm.')],
    'Veri notta yok; bu site için üretilmiş 75 sanal nokta (üç yoğun bölge). Algoritma notundaki Algoritma 9.1’e dayanır.')
add('medlab', 'makine-ogrenmesi/bolum-9.html',
    'Aykırı noktanın x konumunu kaydırıcıyla sağa çek ve ortalama (+) ile medoidin (○) nerede durduğuna bak.',
    'Sekiz noktalık küme sabit kalır; dokuzuncu (kırmızı) nokta uzaklaştıkça sarı + işareti ona doğru kayar, yeşil halka ise kümenin içindeki bir noktada kalır.',
    'Ortalama uç noktadan etkilenir; medoid gerçek bir nesne olduğu için kümeden kopmaz. Notta k-medoidlerin uç verilere daha dirençli olması bu yüzden vurgulanır.',
    [('Ortalama', 'Noktaların koordinat ortalaması; hiçbir noktaya denk gelmeyebilir.'), ('Medoid', 'Diğer tüm noktalara uzaklıkları toplamı en küçük olan gerçek nokta.'), ('Aykırı nokta', 'Kümenin dışında, uzakta kalan nokta.')],
    'Noktalar notta yok; bu site için seçilmiş sanal sayılardır. Mantık, notundaki Bölüm 9.3.1’deki dayanıklılık anlatımına dayanır.')
add('costlab', 'makine-ogrenmesi/bolum-9.html',
    'n, k, t ve s kaydırıcılarını değiştir.',
    'Üç algoritmanın notundaki formüllerle hesaplanan işlem sayıları ve PAM/CLARA oranı görünür.',
    'n büyüdükçe PAM’ın maliyeti hızla artar; CLARA yalnızca örnek (s) üzerinde PAM çalıştırdığı için çok daha ucuz kalır. Bu sayılar gerçek süre değil, formülün değeridir.',
    [('n', 'Toplam nesne sayısı.'), ('k', 'Küme sayısı.'), ('t', 'k-ortalamalarda yineleme sayısı.'), ('s', 'CLARA’da rastgele örneğin büyüklüğü.')],
    'Sayılar sanal; formüller notundaki Bölüm 9.2 ve 9.3 maliyet ifadeleridir (θ gösterimi sabit çarpanları içermez).')

# ---------------- Makine Öğrenmesi 10 ----------------
add('hlab', 'makine-ogrenmesi/bolum-10.html',
    'Üç bağlantı yönteminden birini seç (tek, tam, grup ortalama). Sonra kesme yüksekliği kaydırıcısını oynat.',
    'Altı noktanın dendrogramı çizilir; kesme çizgisinin altında kalan kümeler farklı renk alır. Altta birleşme sırası ve uzaklıkları tablo olarak çıkar.',
    'Aynı matristen yönteme göre farklı ağaçlar çıkar: tek bağlantıda son birleşme 0,22’de, tam bağlantıda 0,39’da olur. Kesme yüksekliği küme sayısını belirler.',
    [('Dendrogram', 'Birleşmeleri ve birleşme uzaklıklarını gösteren ağaç.'), ('Tek bağlantı', 'İki küme arası uzaklık = en yakın nokta çiftinin uzaklığı.'), ('Tam bağlantı', 'İki küme arası uzaklık = en uzak nokta çiftinin uzaklığı.'), ('Grup ortalama', 'İki küme arası uzaklık = tüm nokta çiftlerinin uzaklık ortalaması.'), ('Kesme yüksekliği', 'Ağacı yatay kesen çizgi; çizginin altında birleşmiş olanlar bir küme sayılır.')],
    'Veri: ders notundaki 6 noktalı yakınlık matrisi (Bölüm 10.3). Tek ve tam bağlantının birleşme sırası notundakiyle aynıdır. Grup ortalama sonucu notta çizilmemiştir; siteyi yapan hesaplamıştır. Kesme çizgisi ise bu sitenin eklediği bir araçtır.')
add('bolenlab', 'makine-ogrenmesi/bolum-10.html',
    'Nesne sayısı n’i kaydır.',
    '2^(n−1) − 1 formülüyle olası bölme sayısı ve kümeleyici yöntemin en çok yineleme sayısı yazılır.',
    'Bölücü yöntemde olası bölme sayısı n ile üstel büyür; bu yüzden sezgisel kurallar kullanılır.',
    [('Olası bölme', 'Bir kümeyi iki parçaya ayırmanın farklı yollarının sayısı.'), ('Üstel', 'n her arttığında sayının kabaca iki katına çıkması.')],
    'Veri yok; formül notundaki Bölüm 10.2’den alındı.')

# ---------------- Makine Öğrenmesi 11 ----------------
add('dbscanlab', 'makine-ogrenmesi/bolum-11.html',
    'ε (komşuluk yarıçapı) ve MinPts kaydırıcılarını değiştir.',
    'İki hilal ve dağınık noktalar renklenir: dolu daire merkez nokta, halka sınır nokta, kırmızı çarpı gürültü. Altta küme ve nokta türü sayıları görünür.',
    'ε ve MinPts doğru ayarlanınca iki hilal ayrı küme olur ve dağınık noktalar gürültü kalır. Ayarlar yanlışsa küme parçalanır ya da birleşir; yani kullanıcının seçtiği parametreler sonucu belirler.',
    [('ε (epsilon)', 'Komşuluk yarıçapı.'), ('MinPts', 'Bir noktanın merkez sayılması için komşuluğunda (kendisi dahil) bulunması gereken en az nokta sayısı.'), ('Merkez nokta', 'Komşuluğunda en az MinPts nokta olan nokta.'), ('Sınır nokta', 'Merkez olmayan ama bir merkez noktanın komşuluğunda olan nokta.'), ('Gürültü', 'Ne merkez ne sınır olan nokta.')],
    'Veri notta yok; bu site için üretilmiş 90 sanal nokta (iki hilal + 10 dağınık nokta). Algoritma notundaki Bölüm 11.2.1’e dayanır; komşu sayımına noktanın kendisi de dahil edilmiştir (bu site tercihi).')
add('hucrelab', 'makine-ogrenmesi/bolum-11.html',
    'Her boyuttaki aralık sayısını ve yoğunluk eşiğini kaydır.',
    'Izgara hücreleri çizilir; eşiği aşan yoğun hücreler renklenir, yan yana yoğun hücreler aynı renkli kümeyi oluşturur.',
    'Izgara yöntemi noktalara değil hücrelere bakar. Aralık sayısı ve eşik uygun değilse yoğun bölgeler ya parçalanır ya birleşir.',
    [('Aralık sayısı', 'Her boyutun kaç eşit parçaya bölündüğü; toplam hücre = aralık sayısının karesi.'), ('Yoğunluk eşiği', 'Bir hücrenin yoğun sayılması için içindeki nokta sayısının aşması gereken değer.'), ('Yoğun hücre', 'İçindeki nokta sayısı eşiği aşan hücre.')],
    'Veri notta yok; Bölüm 11’deki aynı sanal 90 nokta. Bu araç CLIQUE’in (Bölüm 11.3.2) yalnızca iki boyutlu, ilk adımını sadeleştiren bir göstergedir; alt uzay arama ve MDL adımları içermez.')
add('klab', 'makine-ogrenmesi/bolum-11.html',
    'Küme sayısı k’yı 1’den 8’e kadar kaydır.',
    'Üç yoğun bölgeli 90 nokta k kümeye bölünür; altta küme içi hata ve ortalama siluet k’ya göre çizilir, seçili k kırmızı noktayla gösterilir.',
    'Hata k arttıkça düşer ama dirsek noktasından sonra azalma küçülür. Siluet ise iyi ayrışmış kümelerde yükselir.',
    [('Küme içi hata', 'Her noktanın kendi merkezine uzaklığının karelerinin toplamı.'), ('Dirsek', 'Hata eğrisinin eğiminin belirgin değiştiği nokta.'), ('Siluet katsayısı', 'Nesnenin kümesine yakınlığı ile en yakın diğer kümeden uzaklığını karşılaştırır; −1 ile 1 arasındadır.')],
    'Veri notta yok; bu site için üretilmiş 90 sanal nokta. Dirsek ve siluet fikri notundaki Bölüm 11.4.2 ve 11.4.3.2’ye dayanır; siluetin (b − a) / max{a, b} biçimi notta şekil olarak verilir, burada standart hâliyle hesaplandı.')

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
