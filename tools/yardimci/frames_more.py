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

# ---------------- Makine Öğrenmesi 12 ----------------
add('paclab', 'makine-ogrenmesi/bolum-12.html',
    'Değişken sayısı n, hata sınırı ε ve başarısızlık olasılığı δ kaydırıcılarını değiştir; ya da “Notun örneği” düğmesine bas.',
    '|H| = 3ⁿ, gereken örnek sayısı m ve üç “ya şöyle olsaydı” satırı (n’yi iki katına çıkar, ε’u yarıya indir, δ’yı yarıya indir) görünür.',
    'm, n ve 1/ε ile yaklaşık doğrusal büyür; 1/δ ile yalnızca logaritmik büyür. Yani yüksek güven (küçük δ) ucuzdur, küçük hata (küçük ε) pahalıdır.',
    [('ε', 'İzin verilen en büyük hata (yaklaşık doğru).'), ('δ', 'Başarısız olma olasılığı (muhtemelen).'), ('|H|', 'Hipotez uzayındaki hipotez sayısı; n değişkenli birleşimlerde 3ⁿ.'), ('m', 'Yeterli eğitim örneği sayısı (üst sınır).')],
    'Sayılar sanal. Hipotez sayısı 3ⁿ ve “m, n ve 1/ε ile doğrusal, 1/δ ile logaritmik” sonucu notundaki Bölüm 12.3.1’den alındı. m ≥ (1/ε)(ln|H| + ln(1/δ)) biçimi notta şekil olarak verilir, burada standart biçimiyle hesaplandı.')
add('shatlab', 'makine-ogrenmesi/bolum-12.html',
    'Bir hipotez ailesi (eşik ya da aralık) ve doğru üzerinde 1–4 nokta seç.',
    'Noktaların tüm olası “+/−” bölünmeleri tabloda sıralanır; her biri için H’nin onu ifade edip edemediği yazılır. Üstte H’nin S’yi bölüp bölmediği ve bulunan en büyük bölünen küme görünür.',
    'H bir kümeyi bölüyorsa o küme üzerinde her hedef kavramı ifade edebilir. Eşik ailesi 1 noktayı, aralık ailesi 2 noktayı bölebilir; bu, onların VC boyutlarının 1 ve 2 olduğunu gösterir.',
    [('Dikotomi', 'Bir noktalar kümesinin “+” ve “−” diye iki gruba ayrılması.'), ('Bölmek (shatter)', 'Her dikotomiyi ifade eden bir hipotez bulunması.'), ('Eşik', 'x değeri a’dan büyükse “+”, değilse “−” diyen hipotezler.'), ('Aralık', 'x değeri (a, b) aralığındaysa “+”, değilse “−” diyen hipotezler.')],
    'Bu iki hipotez ailesi notta yok; bölme (shattering) ve VC boyutu tanımlarını göstermek için bu sitede eklendi. Tanımlar notundaki Bölüm 12.4’tendir.')
add('mistlab', 'makine-ogrenmesi/bolum-12.html',
    '“Bir örnek gelsin” ya da “20 örnek gelsin”e bas; “Baştan başla” ile yeniden dene.',
    'Her örnek için öğrenicinin tahmini ve gerçek değeri listelenir; yanlış tahminler sayılır. Öğrenicinin hipotezi pozitif örnekler geldikçe hedefe yaklaşır.',
    'Hata sınırı modelinde önemli olan, öğrenmeden önce yapılan toplam hata sayısıdır; öğrenici her örneği önce tahmin eder, sonra doğrusunu görür.',
    [('Hata', 'Öğrenicinin tahmini ile gerçek değerin farklı çıkması.'), ('Hipotez', 'Öğrenicinin şimdiki tahmin kuralı: değişkenlerin birleşimi.'), ('¬', '“Değil” (olumsuz).')],
    'Hedef kavram ve örnekler bu site için üretildi (4 ikili değişken, hedef x₁ ∧ ¬x₃). Öğrenici notundaki FIND-S fikrinin (yalnızca pozitiflerden genelleme) çevrimiçi hâlidir; hata sınırı değeri bu araçla iddia edilmez.')

# ---------------- Makine Öğrenmesi 13 ----------------
add('oylab', 'makine-ogrenmesi/bolum-13.html',
    'Üç kaydırıcıyı değiştir: her sınıflandırıcının doğruluğu, sınıflandırıcı sayısı ve birbirini kopyalama olasılığı.',
    'Grafikte sınıflandırıcı sayısı arttıkça topluluğun doğruluğu çizilir; kırmızı nokta seçili sayıyı, turuncu kesik çizgi tek sınıflandırıcıyı gösterir.',
    'Topluluk, doğruluk %50’nin üstündeyse ve sınıflandırıcılar birbirinden bağımsızsa sayı arttıkça iyileşir. Doğruluk %50’nin altındaysa kötüleşir; sınıflandırıcılar birbirini kopyalıyorsa kazanç kaybolur.',
    [('Çoğunluk oyu', 'En çok oyu alan sınıfın seçilmesi.'), ('Kopyalama olasılığı', 'Sınıflandırıcıların aynı cevabı vermesi: çeşitlilik eksikliği.'), ('Bağımsız', 'Bir sınıflandırıcının hatasının diğerlerini etkilememesi.')],
    'Sayılar sanal. Hesap: sınıflandırıcıların bağımsız ve aynı doğrulukta olduğu varsayımıyla oy sayılarının binom olasılığı; kopyalama için ρ·p + (1 − ρ)·(oy hesabı) basitleştirmesi bu siteye aittir. “Yarısından fazlası yanılırsa yanlış”, “çeşitlilik gerekir”, “rastgeleden iyi olmalı” fikirleri notundaki Bölüm 13.1’dendir.')
add('baglab', 'makine-ogrenmesi/bolum-13.html',
    'T kaydırıcısıyla topluluk büyüklüğünü seç ve “Örnekleri yeniden çek”e birkaç kez bas.',
    'Her satır bir önyükleme eğitim kümesidir; tablodaki sayılar 10 kaydın o kümede kaç kez bulunduğunu gösterir. Hiç seçilmeyenler kırmızı 0 olur.',
    'Yerine koyarak çekilen kümelerde bazı kayıtlar tekrarlanır, bazıları dışarıda kalır. Her model farklı bir küme gördüğü için modeller birbirinden farklı çıkar.',
    [('Önyükleme örneği', 'Yerine koyarak çekilen, özgün veriyle aynı büyüklükte eğitim kümesi.'), ('T', 'Topluluktaki model sayısı.'), ('D', 'Özgün veri kümesi (burada 10 kayıt).')],
    'Veri yok; tamamen rastgele simülasyon. Yöntem notundaki Bölüm 13.2 ve Algoritma 13.1’e dayanır.')
add('boostlab', 'makine-ogrenmesi/bolum-13.html',
    '“Sonraki tur”a birkaç kez bas; sonra “Baştan”la yeniden başla.',
    'On nokta çizilir (yeşil +, mor −); daire büyüklüğü ağırlığı gösterir. Her turda bir eşik sınıflandırıcı eklenir, yanlış bilinen noktalar büyür ve topluluğun tahmini noktaların altında görünür.',
    'Hiçbir tek eşik bu on noktayı doğru ayıramaz; ama ağırlıklandırarak art arda eklenen eşiklerin oyu ayırabilir. Her tur bir öncekinin hatalı kayıtlarına daha fazla dikkat eder.',
    [('Eşik sınıflandırıcı', '“x değeri a’dan büyükse +, değilse −” (ya da tersi) diyen basit sınıflandırıcı.'), ('Ağırlıklı hata', 'Yanlış bilinen kayıtların ağırlıklarının toplamı.'), ('Oy ağırlığı', 'Sınıflandırıcı ne kadar doğruysa oyu o kadar ağırdır.')],
    'Noktalar ve etiketler bu site için seçildi. Ağırlıkların yarısının hatalılara verilmesi notundaki Bölüm 13.3’tendir; oy ağırlığı ln((1 − hata) / hata) AdaBoost’un standart biçimidir ve notta formül olarak yazılı değildir.')

# ---------------- Makine Öğrenmesi 14 ----------------
add('gamlab', 'makine-ogrenmesi/bolum-14.html',
    'İndirim faktörü γ kaydırıcısını değiştir.',
    'Tabloda 100 ödülün 0’dan 6’ya kadar farklı gecikmelerdeki bugünkü değeri ve üç özet sayı görünür.',
    'γ küçükse gecikmeli ödül çok değer kaybeder; γ 1’e yaklaşırsa neredeyse hiç kaybetmez. γ = 0,9 iken 100, 90, 81 … dizisi çıkar: notun ızgara-dünyasındaki değerleri.',
    [('γ (gama)', 'Gelecekteki ödülün ne kadar önemli sayılacağını belirleyen 0–1 arası sayı.'), ('İndirimli ödül', 'i adım sonra gelen ödülün γ^i ile çarpılarak toplanması.'), ('Gecikme', 'Ödülün kaç adım sonra geldiği.')],
    'Sayılar sanal (100 ödül, 0–6 adım); γ^i ilişkisi notundaki Bölüm 14.2’den, γ = 0,9 değeri ise o bölümün ızgara-dünyası örneğindendir.')
add('qupdlab', 'makine-ogrenmesi/bolum-14.html',
    'Ödül r, γ ve yeni durumdaki üç Q değerini kaydır; ya da “Notun örneği” düğmesine bas.',
    'Yeni durumdaki en büyük Q, γ ile çarpımı ve güncellenmiş Q(s, a) değeri yazılır; altta hesap açık açık gösterilir.',
    'Güncelleme yeni durumdaki en iyi eylemin değerini kullanır. Etmen r ve δ fonksiyonlarını bilmek zorunda değildir.',
    [('r', 'Eylemden sonra hemen gelen ödül.'), ('s′', 'Eylemden sonra ulaşılan yeni durum.'), ('max Q(s′, ·)', 'Yeni durumda seçilebilecek eylemlerin en büyük Q değeri.')],
    'Notun Şekil 14.3 örneğindeki değerler (r = 0, γ = 0,9, en büyük Q = 100) hazır düğmeyle yüklenir; diğer iki Q değeri (63, 81) bu sitede seçildi.')
add('qgrid', 'makine-ogrenmesi/bolum-14.html',
    '“Bir adım” ya da “Bir bölüm” düğmesine bas; sonra “100 bölüm”e bas. İstersen eylem seçimini “öğrenileni uygula”ya çevir ve “Sıfırla” ile baştan dene.',
    'Altı karenin her birinde eylemlerin Q değerleri ve durumun değeri görünür; hedef G’dir. En altta son güncellemenin hesabı yazılır.',
    'Önce hedefin hemen yanındaki Q değerleri 100 olur, sonra bir önceki durumlar 90, sonra 81 olur: bilgi hedeften geriye yayılır. Yeterince bölümden sonra Q̂ değerleri V* değerlerine (100, 90, 81) varır.',
    [('Bölüm (episode)', 'Rastgele bir durumdan hedefe varana kadar süren deneme.'), ('Q değeri', 'Bir durumda bir eylemin tahmini uzun vadeli değeri.'), ('V', 'Durumdaki en büyük Q değeri.'), ('Yutan durum', 'Girilince çıkılmayan hedef durumu (G).')],
    'Izgara-dünyası notundaki Şekil 14.2’nin altı karelik düzenidir (G’ye geçişte ödül 100, γ = 0,9). Eylem seçimi (rastgele ya da %90 öğrenileni uygula) ve bölüm başlangıçları bu sitenin eklemesidir.')

# ---------------- Görüntü İşleme 7 ----------------
add('kernlab', 'goruntu-isleme/bolum-7.html',
    'Bir çekirdek seç (ortalama, Gauss, yüksek geçiren, Laplace, keskinleştirme, Sobel X/Y, Prewitt X) ya da Sobel büyüklüğünü dene.',
    'Üstte çekirdek matrisi, altında solda özgün görüntü sağda süzülmüş görüntü görünür. Çekirdek toplamı ve ham çıktı aralığı yazılır.',
    'Toplamı 1 olan çekirdekler parlaklığı korur ve yumuşatır ya da keskinleştirir; toplamı 0 olan çekirdekler düz bölgeyi sıfırlayıp yalnızca değişimin olduğu yerleri gösterir.',
    [('Çekirdek (kernel)', 'Filtrenin ağırlık tablosu.'), ('Yüksek geçiren', 'Ani değişimleri (kenarları) vurgulayan filtre.'), ('Alçak geçiren', 'Ani değişimleri yumuşatan filtre.'), ('Çekirdek toplamı', 'Ağırlıkların toplamı: 1 ise parlaklık korunur, 0 ise düz bölge siyah olur.')],
    'Görüntü bu site için kodla üretilmiş 32×32 sahnedir (kare, daire, çizgi ve gri geçiş). Yüksek geçiren, Laplace, keskinleştirme, Sobel ve Prewitt çekirdekleri notundaki Bölüm 7.3’ten; ortalama ve Gauss çekirdekleri standart 3×3 biçimleridir (notta matris şekil olarak verilir).')
add('bordlab', 'goruntu-isleme/bolum-7.html',
    'Bir sınır yöntemi seç, sonra piksel satır ve sütununu kaydır (köşe için 0, 0 dene).',
    'Seçili pikselin 3×3 komşuluğu görünür; görüntü dışından gelen hücreler sarı olur. Altta 3×3 ortalama filtresinin sonucu ve çıktı boyutu yazılır.',
    'İç bölgede bütün yöntemler aynı sonucu verir; fark yalnızca kenar ve köşelerde ortaya çıkar. Kırpmada kenar pikselleri için sonuç hesaplanamaz ve çıktı küçülür.',
    [('Komşuluk', 'Çekirdeğin altında kalan piksel değerleri.'), ('Sınır dışı', 'Görüntünün dışında kalan, yönteme göre doldurulan hücre.'), ('Kopyalama', 'En yakın kenar pikselini tekrarlar.'), ('Aynalama', 'Kenardan simetrik yansıtır (antisimetrikte işareti değiştirir).')],
    'Beş yönteme ait formüller notundaki Bölüm 7.4’tendir. 5×5 sayı matrisi ve sabit doldurma değeri (ortalama 40) bu site için seçildi.')
add('medlab7', 'goruntu-isleme/bolum-7.html',
    'Bozuk pikselin değerini kaydır; istersen ikinci bir bozuk piksel (0) ekle.',
    '3×3 pencere, sıralı hâli, medyan ve ortalama yazılır; ortalamanın sapması altta görünür.',
    'Medyan sıralamada uçtaki bozuk değeri dışarıda bırakır; ortalama ise bozuk pikselden doğrudan etkilenir.',
    [('Medyan', 'Sıralanmış dizinin ortancası.'), ('Ortalama', 'Değerlerin toplamının sayıya bölümü.'), ('Bozuk piksel', 'Tuz-biber gibi, çevresinden çok farklı değerli piksel.')],
    'Pencere değerleri notundaki medyan hesabı örneğine dayanır (10, 15, 200, 12, 14, 16, 13, 11, 17); kaydırıcı ve ikinci bozuk piksel bu sitenin eklemesidir.')
add('maliyetlab', 'goruntu-isleme/bolum-7.html',
    'Görüntü kenarını ve çekirdek kenarı k’yı kaydır.',
    'Doğrudan konvolüsyon, ayrılabilir Gauss ve medyan için işlem sayısı mertebesi ile ayrılabilirlikten gelen kazanç görünür.',
    'Çekirdek büyüdükçe doğrudan konvolüsyonun maliyeti k² ile artar; ayrılabilir filtre yalnızca 2k ile artar.',
    [('M, N', 'Görüntünün genişliği ve yüksekliği.'), ('k', 'Çekirdeğin kenar uzunluğu.'), ('Ayrılabilir', 'Önce satırlar, sonra sütunlar boyunca iki ayrı tek boyutlu süzme.')],
    'Sayılar sanal. Formüller (O(M×N×k²), O(M×N×2k), medyanda ek log çarpanı) notundaki Bölüm 7.1 ve 7.3’ten alındı; gerçek süre değildir.')

# ---------------- Görüntü İşleme 8 ----------------
add('dftlab', 'goruntu-isleme/bolum-8.html',
    'Ortalama düzeyini, iki sinüs bileşeninin frekansını ve genliğini kaydır.',
    'Üstte 64 örnekli sinyal, altta genlik spektrumu çubukları görünür; her çubuk bir frekans bileşenidir. Altta O(N²) ile O(N log N) işlem sayıları yazılır.',
    'Her sinüs bileşeni spektrumda kendi frekansında bir çubuk bırakır; k = 0 çubuğu ortalama parlaklığı (doğru akım bileşeni) gösterir.',
    [('k', 'Frekans indeksi: sinyalde kaç tam dalga olduğu.'), ('Genlik', 'Bir frekans bileşeninin gücü.'), ('DC bileşeni (k = 0)', 'Sinyalin ortalama düzeyi.'), ('DFT', 'Sinyali sinüs bileşenlerine ayıran ayrık Fourier dönüşümü.')],
    'Sinyal bu site için üretildi (tek boyutlu, 64 örnek). Dönüşüm formülü ve O(N²) → O(N log N) bilgisi notundaki Bölüm 8.3.1’den.')
add('convlab', 'goruntu-isleme/bolum-8.html',
    'Çekirdek genişliğini kaydır.',
    'Gri kesik çizgi girdi, mavi çizgi uzamsal konvolüsyon, kırmızı noktalı çizgi frekans uzayında çarpma sonucudur. Altta iki yolun farkı ve işlem sayıları yazılır.',
    'Mavi ve kırmızı eğriler üst üste biner: uzamsal konvolüsyon ile frekans uzayında çarpma aynı sonucu verir (fark yalnızca yuvarlama hatasıdır).',
    [('Çekirdek', 'Ortalamayı alan küçük pencere.'), ('Dairesel konvolüsyon', 'Sağ uçtan çıkan değerin sol uca sarıldığı konvolüsyon.'), ('FFT', 'Hızlı Fourier dönüşümü.')],
    'Sinyal ve çekirdek bu site için üretildi (32 örnek; kutu şeklinde bir sinyal ve ortalama çekirdeği). Konvolüsyon teoremi notundaki Bölüm 8.4’ten; işlem sayıları kaba mertebedir.')
add('ringlab', 'goruntu-isleme/bolum-8.html',
    'Filtre türünü (ideal, Gauss, Butterworth), alçak ya da yüksek geçirenliği ve kesim frekansını seç; Butterworth için mertebeyi de değiştir.',
    'Üstte filtrenin H(D) eğrisi, altında 20/120 basamaklı sinyalin gri girdisi ve mavi çıktısı görünür. Altta aşma miktarı (alçak geçirende) ya da çıktının ortalaması (yüksek geçirende) yazılır.',
    'İdeal filtre basamağın iki yanında dalgalanma (halka) üretir; Gauss yumuşak geçişle dalgalanmaz; Butterworth arada kalır. Yüksek geçirende ortalama sıfıra kayar.',
    [('H(D)', 'Filtrenin D frekans uzaklığındaki değeri: 1 geçirir, 0 keser.'), ('D₀', 'Kesim frekansı.'), ('Halka (ringing)', 'Keskin kesimin kenar yanında yarattığı dalgalanma.'), ('Aşma', 'Çıktının girdinin aralığını aşan miktarı.')],
    'Sinyal bu site için üretildi (128 örnekli, 20/120 basamak). Üç filtrenin formülleri ve halka artefaktı bilgisi notundaki Bölüm 8.5 ve 8.6’dan; işlem tek boyutlu yapılır.')

# ---------------- Görüntü İşleme 9 ----------------
add('noiselab', 'goruntu-isleme/bolum-9.html',
    'Sekiz gürültü türünden birini seç ve gürültü şiddeti kaydırıcısını değiştir.',
    'Solda temiz, sağda gürültülü 32×32 görüntü; altında gürültü değerlerinin (g − f) dağılım grafiği ve gürültünün ortalaması, standart sapması, PSNR’si görünür.',
    'Her türün dağılımı farklı biçimdedir: Gauss çan, tuz-karabiber iki uçta çubuk, düzgün dikdörtgen, üstel/Rayleigh/Gamma yalnızca pozitif yanda. Benek ve Poisson’da gürültü parlak bölgede daha büyüktür.',
    [('g − f', 'Gürültülü pikselden temiz pikselin çıkarılması: gürültünün kendisi.'), ('PSNR', 'Temiz ile gürültülü görüntü arasındaki farkı dB olarak ölçer; yüksek değer = daha az bozulma.'), ('Çarpımsal', 'Gürültünün piksel değeriyle çarpılması (g = f × η).'), ('Toplayıcı', 'Gürültünün piksel değerine eklenmesi (g = f + η).')],
    'Görüntü bu site için kodla üretilmiş 32×32 sahnedir. Sekiz türün özellikleri (toplayıcı/çarpımsal, tek taraflı, sinyale bağımlı vb.) notundaki Bölüm 9.2’den; kullanılan sayısal parametreler siteye aittir.')
add('filtlab9', 'goruntu-isleme/bolum-9.html',
    'Gürültü türünü (Gauss ya da tuz-karabiber) seç, bir filtre seç ve şiddet kaydırıcısını değiştir.',
    'Solda gürültülü, sağda süzülmüş görüntü; altında iki PSNR değeri ve dikey kenardaki fark (temiz görüntüde 100) görünür.',
    'Medyan tuz-karabiberde, ortalama Gauss’ta başarılıdır; adaptif filtre kenarı ortalamadan çok daha iyi korur. Alfa-kırpmalı ortalama ikisinin arasındadır.',
    [('PSNR', 'Temiz görüntüyle benzerlik: yüksek iyi.'), ('Alfa-kırpmalı ortalama', 'Sıralı değerlerin iki ucundan değer atıp kalanın ortalaması.'), ('Adaptif filtre', 'Yerel varyansa göre filtreleme gücünü değiştiren filtre.'), ('Kenar farkı', 'Kenarın iki yanındaki parlaklık farkı; yumuşadıkça düşer.')],
    'Görüntü bu site için üretilmiş 32×32 sentetik sahnedir (iki ton ve iki kare). Adaptif filtrenin “çıkış = giriş + faktör × (yerel ortalama − giriş)” biçimi notundaki Bölüm 9.4.4’tendir; faktörün yerel varyans ile hesabı Lee filtresi fikrinin sadeleştirilmiş uyarlamasıdır.')
add('wienerlab', 'goruntu-isleme/bolum-9.html',
    'Ters filtre ve Wiener filtresi arasında geçiş yap; gürültü σ ve Wiener K değerlerini kaydır.',
    'Yeşil çizgi özgün sinyal, gri kesik çizgi bulanık ve gürültülü hâli, kırmızı çizgi onarılmış sinyaldir. Altta hata (MSE) değerleri yazılır.',
    'Ters filtre bulanıklığı tam tersine çevirmeye çalıştığı için gürültüyü patlatır; Wiener K ile bölmeyi dengeler ve gürültüyü kontrol eder.',
    [('Bulanıklık (PSF)', 'Sinyali yayan Gauss şekilli ağırlık.'), ('H', 'Bulanıklığın frekans uzayındaki hâli.'), ('K', 'Sinyal-gürültü oranının tersi: büyükse daha çok bastırma.'), ('MSE', 'Ortalama kare hata.')],
    'Sinyal bu site için üretildi (128 örnek, tek boyutlu). Ters filtre G/H ve Wiener H*/(|H|² + K) formülleri notundaki Bölüm 9.6’dandır.')

# ---------------- Görüntü İşleme 10 ----------------
add('morlab', 'goruntu-isleme/bolum-10.html',
    'Bir morfolojik işlem (aşınma, genişleme, açma, kapama, sınır, gradyan, top-hat, bottom-hat) ve bir yapısal eleman (kare 3×3, çapraz, kare 5×5) seç.',
    'Solda siyah ön planlı ikili görüntü, sağda turuncu ön planlı sonuç görünür. Altta ön plan piksel sayısı ve bağlı parça sayısı (önce → sonra) yazılır.',
    'Aşınma gürültüyü ve ince köprüyü siler ama nesneyi küçültür; genişleme boşluğu kapatır ama nesneyi büyütür. Açma gürültüyü silip şekli korur; kapama çizgideki kırığı onarır.',
    [('Yapısal eleman', 'Görüntüde gezdirilen küçük şekil kalıbı (kare, çapraz).'), ('Ön plan', 'Nesneyi oluşturan pikseller (1).'), ('Bağlı parça', 'Birbirine (8’li komşulukla) bağlı piksel grubu.'), ('Açma / kapama', 'Aşınma+genişleme / genişleme+aşınma.')],
    'Görüntü bu site için üretilmiş 24×24 ikili sahnedir (delikli bir kare, ince köprüyle bağlı ikinci bir nesne, tek piksellik gürültü noktaları ve kırık bir çizgi). Tüm işlem tanımları notundaki Bölüm 10.5–10.8’dendir.')
add('holelab', 'goruntu-isleme/bolum-10.html',
    '“Bir adım” ya da “Bitene kadar”a bas; yapısal elemanı değiştir; “Duvarda 1 piksellik kırık aç”la sonucu karşılaştır.',
    'Siyah halka nesnedir; turuncu bölge deliğin içindeki X_k kümesidir. Altta yineleme sayısı ve X_k’nin değişmeyip değişmediği yazılır.',
    'Genişleme yalnızca nesnenin tümleyeni içinde sürdüğü için deliğin içi dolar ve durur. Duvarda kırık varsa doldurma dışarı kaçar: delik arka planla tamamen çevrili değildir.',
    [('X₀', 'Deliğin içindeki başlangıç noktası.'), ('X_k', 'k. yinelemede doldurulmuş bölge.'), ('A^c', 'Nesnenin tümleyeni (arka plan).'), ('Yutan duvar', 'Doldurmanın dışarı sızmasını engelleyen kapalı nesne sınırı.')],
    'Şekil bu site için 16×16 ikili görüntüdür. Algoritma notundaki Bölüm 10.7.2’deki X_k = (X_{k−1} ⊕ B) ∩ A^c formülüdür.')
add('grilab', 'goruntu-isleme/bolum-10.html',
    'Bir gri seviye işlemi (aşınma, genişleme, açma, kapama, top-hat, bottom-hat) seç; pencere genişliğini kaydır.',
    'Gri kesik çizgi özgün profil, mavi çizgi sonuçtur. Altta sonucun en büyük değeri ile top-hat ve bottom-hat tepe değerleri yazılır.',
    'Aşınma pencerenin en küçük, genişleme en büyük değerini alır. Top-hat pencereden dar parlak tepeyi, bottom-hat pencereden dar koyu çatlağı çıkarır; geniş yayla pencere büyüdükçe ayrıntı olmaktan çıkar.',
    [('Pencere', 'Yapısal elemanın tek boyutlu karşılığı: aynı anda bakılan komşu sayısı.'), ('Top-hat', 'Özgün − açma: küçük parlak ayrıntı.'), ('Bottom-hat', 'Kapama − özgün: küçük koyu ayrıntı.')],
    'Profil bu site için üretilmiş 96 örnekli tek boyutlu sinyaldir. Gri seviyede minimum/maksimum tanımı ve top-hat/bottom-hat formülleri notundaki Bölüm 10.5 ve 10.8’dendir.')

# ---------------- Görüntü İşleme 11 ----------------
add('spacelab', 'goruntu-isleme/bolum-11.html',
    'R, G, B kaydırıcılarıyla bir renk kur (ya da hazır renklerden birini seç), sonra “Parlaklığı ölçekle” kaydırıcısını azalt.',
    'İki renk kutusu (özgün ve ölçeklenmiş) ve tabloda aynı renklerin RGB, HSV, CMY, CMYK ve YCbCr değerleri görünür.',
    'Parlaklık azalınca RGB’nin üç değeri de değişir, ama HSV’deki ton (H) aynı kalır. Bu yüzden renk tabanlı segmentasyonda HSV tercih edilir.',
    [('Ton (H)', 'Rengin türü, derece cinsinden (0–360).'), ('Doygunluk (S)', 'Rengin canlılığı; 0 gri, 1 saf renk.'), ('Değer (V)', 'Parlaklık.'), ('YCbCr', 'Y parlaklık, Cb ve Cr renk farkı bileşenleri.')],
    'Renkler bu site için seçildi. Uzayların rolleri notundaki Bölüm 11.2–11.3’ten; HSV, CMY, CMYK ve YCbCr dönüşüm formülleri standart biçimleridir (notta formül verilmez).')
add('threshlab', 'goruntu-isleme/bolum-11.html',
    'Yöntemi seç (RGB uzaklığı ya da HSV tonu) ve tolerans kaydırıcısını değiştir.',
    'Solda 40×40 sahne, sağda seçilen piksellerin yeşil maskesi görünür. Altta yaprak piksellerinin yüzde kaçının yakalandığı ve yanlışlıkla seçilen piksel sayısı yazılır.',
    'RGB uzaklığı gölgedeki yaprağı kaçırır ya da toleransı büyütünce başka alanları seçmeye başlar; HSV tonu parlaklıktan bağımsız olduğu için gölgedeki yaprağı da yakalar.',
    [('RGB uzaklığı', 'Pikselin referans yeşile üç boyutlu uzaklığı.'), ('HSV tonu', 'Pikselin tonunun referans yeşilin tonundan farkı (derece).'), ('Tolerans', 'Seçime girecek en büyük uzaklık/fark.'), ('Maske', 'Seçilen piksellerin siyah-yeşil görüntüsü.')],
    'Sahne bu site için üretildi (aydınlık ve gölgeli yaprak, kırmızı tabela, mavi bant, bej zemin; küçük gürültülü). Renk eşikleme fikri notundaki Bölüm 11.4’ten; HSV için doygunluk ve değer ek şartları bu sitenin basit kuralıdır.')
add('kmeanscolor', 'goruntu-isleme/bolum-11.html',
    'Küme sayısı k kaydırıcısını 2’den 6’ya kadar değiştir.',
    'Solda özgün sahne, sağda her pikselin kendi kümesinin ortalama rengine boyandığı görüntü ve altında küme renkleri (palet) görünür. Piksel başına ortalama renk hatası yazılır.',
    'k küçükken farklı bölgeler tek kümede birleşir; k = 5’te sahnedeki beş renk bölgesi ayrılır; k büyüyünce aynı bölge birkaç kümeye bölünür.',
    [('Küme', 'Benzer renkli piksellerin grubu.'), ('Palet', 'Kümelerin ortalama renkleri.'), ('Renk hatası', 'Pikselin özgün rengi ile kümenin rengi arasındaki RGB uzaklığı.')],
    'Sahne bu site için üretildi (Bölüm 11’deki aynı sahne). k-ortalamalar notundaki Bölüm 9’daki algoritmadır; renk bölütlemede kullanımı notundaki Bölüm 11.4.1’dendir.')

add('threshgray', 'goruntu-isleme/bolum-12.html',
    'Üç yoldan birini seç: elle genel eşik, Otsu (otomatik genel eşik) ya da yerel uyarlanabilir eşik. Genel eşik ve yerel pencere kaydırıcılarını oynat.',
    'Solda soldan sağa parlaklaşan bir ışık altında iki nesne (daire ve dikdörtgen), sağda eşik sonucu (beyaz = nesne) görünür. Altta doğru sınıflanan piksel yüzdesi ve yanlış piksel sayısı yazılır.',
    'Aydınlatma değiştiği için hiçbir tek eşik (elle ya da Otsu) iki nesneyi birden temiz ayıramaz; yerel eşik her pikseli komşuluğuyla karşılaştırdığı için başarılıdır. Pencere nesneden çok küçükse nesnenin içi boş kalır.',
    [('Genel eşik', 'Tüm görüntüde tek eşik değeri.'), ('Otsu', 'Sınıflar arası varyansı en büyük yapan tek eşik, histogramdan otomatik bulunur.'), ('Yerel eşik', 'Pikselin komşuluk ortalamasına göre hesaplanan eşik (burada ortalama + 10).'), ('Pencere', 'Yerel ortalamanın hesaplandığı kare komşuluk.')],
    'Görüntü bu site için üretildi (40×40, ışık soldan sağa artar, nesneler zeminden 50 gri seviye parlak, küçük gürültü). Genel, Otsu ve yerel eşikleme notundaki Bölüm 12.5.1’den; “ortalama + 10” kuralı bu sitenin basit seçimidir.')
add('regionlab', 'goruntu-isleme/bolum-12.html',
    'Tohumu seç (nesne A, nesne B ya da zemin) ve benzerlik toleransını değiştir.',
    'Solda gürültülü görüntü (kırmızı kare tohumu gösterir), sağda tohumdan büyüyen bölge (beyaz) görünür. Altta bölgedeki piksel sayısı, gerçek bölgenin yüzde kaçının yakalandığı ve bölge dışına taşan piksel sayısı yazılır.',
    'Tolerans çok küçükse bölge gürültüde takılıp parça parça kalır; çok büyükse nesne sınırını aşıp zemine taşar. Bölge yalnızca tohuma bağlı pikselleri toplar: öteki nesne seçilmez. Sonuç tohuma ve ölçüte bağlıdır.',
    [('Tohum', 'Büyümenin başladığı piksel.'), ('Tolerans', 'Komşu pikselin bölge ortalamasından en fazla ne kadar farklı olabileceği (gri seviye).'), ('Taşma', 'Tohumun ait olduğu gerçek bölgenin dışında kalan seçili piksel.'), ('Bağlı', 'Komşuluk (4’lü) üzerinden ulaşılabilir.')],
    'Görüntü bu site için üretildi (40×40, iki nesne ve zemin, gürültülü). Tohumdan büyüme fikri notundaki Bölüm 12.8’den; ölçüt olarak “bölge ortalamasına uzaklık” ve 4’lü komşuluk bu sitenin basit seçimidir.')
add('quadlab', 'goruntu-isleme/bolum-12.html',
    'Homojenlik eşiği kaydırıcısını değiştir.',
    'Solda 32×32 görüntü, sağda dörtlü ağaç blokları (kırmızı çerçeveli, her blok kendi ortalama grisinde) görünür. Altta blok sayısı ve piksel başına ortalama sapma yazılır.',
    'Homojen yerler büyük blokta kalır; nesne kenarları küçük bloklara bölünür. Eşik düşük olursa gürültü yüzünden her yer parçalanır, çok yüksek olursa ayrıntı kaybolur.',
    [('Dörtlü ağaç', 'Her bölgenin dört alt bölgeye bölündüğü hiyerarşi.'), ('Homojenlik eşiği', 'Bir bloktaki en büyük ve en küçük gri seviye farkının izin verilen en çok değeri.'), ('Blok', 'Artık bölünmeyen bölge (ağacın yaprağı).')],
    'Görüntü bu site için üretildi (32×32, bir daire, bir dikdörtgen, zemin, küçük gürültü). Dörtlü ağaçla bölme fikri notundaki Bölüm 12.9’dan; “en büyük − en küçük” homojenlik ölçütü bu sitenin basit seçimidir; birleştirme adımı gösterilmez.')

add('templab', 'goruntu-isleme/bolum-13.html',
    'Nesnenin yönünü seç (şablonla aynı ya da 180° döndürülmüş) ve “ışık kayması” kaydırıcısını artır.',
    'Solda sahne (kırmızı kesikli kutu nesnenin gerçek yeri, yeşil kutu en iyi eşleşme), ortada fark haritası, sağda şablon. Altta en iyi eşleşmenin gerçek konumda olup olmadığı ve en küçük fark toplamı yazılır.',
    'Aynı ışık ve aynı yönde şablon nesneyi bulur. Nesne dönünce ya da sahne parlaklaşınca doğru yer en iyi eşleşme olmaktan çıkar; şablon eşleme bu değişimlere duyarlıdır.',
    [('Şablon', 'Aranan nesnenin sabit küçük görüntüsü (7×7).'), ('Fark toplamı', 'Şablon ile sahnedeki pencerenin piksel farklarının mutlak değerleri toplamı; küçük olan iyi eşleşmedir.'), ('Işık kayması', 'Sahnedeki tüm piksellere eklenen parlaklık.')],
    'Sahne ve şablon bu site için üretildi (40×40 gürültülü zemin, L biçimli nesne, bir parlak kare). Şablon eşleme fikri ve ışık, boyut, dönme duyarlılığı notundaki Bölüm 13.3.1’den; “fark toplamı” ölçüsü bu sitenin basit seçimidir.')
add('ioulab', 'goruntu-isleme/bolum-13.html',
    'Tahmin kutusunu yatay ve dikey kaydır, ölçeğini değiştir; doğru sayma eşiğini ayarla.',
    'Yeşil çerçeve gerçek kutu, turuncu çerçeve tahmin, yeşil dolgu kesişim alanıdır. Altta IoU, kesişim, birleşim ve eşiğe göre karar yazılır.',
    'Kutu aynı yerde ama iki kat büyükse bile IoU düşer; hem konum hem boyut doğru olmalıdır. Eşiği değiştirmek aynı tahmini doğru ya da yanlış yapabilir.',
    [('IoU', 'Kesişim alanı ÷ birleşim alanı (Intersection over Union); 0 ile 1 arası.'), ('Kesişim', 'İki kutunun ortak alanı.'), ('Birleşim', 'İki kutunun kapladığı toplam alan.'), ('Eşik', 'IoU’nun doğru sayılması için aşması gereken değer.')],
    'Kutu boyutları bu site için seçildi. IoU’nun nesne kutusu doğruluğunu ölçtüğü notundaki Bölüm 13.2.4’ten; notta eşik değeri verilmez, kaydırıcıdaki eşik bu sitenin seçimidir.')
add('hoglab', 'goruntu-isleme/bolum-13.html',
    'Çizginin yönünü değiştir; sonra kontrast çarpanını ve parlaklık kaymasını oynat.',
    'Solda koyu zeminde parlak bir çizgi, sağda 9 kutulu gradyan yönelim histogramı (her kutu 20°) görünür. Altta baskın yön ve toplam gradyan gücü yazılır.',
    'Çizgi dönünce histogramın tepesi kayar; kontrast ve parlaklık değişince tepenin yeri değişmez, yalnızca toplam güç değişir. HOG bu yüzden aydınlatma değişimine dayanıklıdır.',
    [('Gradyan', 'Yoğunluğun en hızlı değiştiği yön ve hız; kenara diktir.'), ('Yönelim kutusu', '0–180° aralığının 20° genişliğinde dilimi.'), ('Güç', 'Gradyan büyüklüklerinin toplamı; histogram bu büyüklüklerle ağırlıklanır.')],
    'Görüntü bu site için üretildi (24×24 çizgi). HOG’un gradyan yönelimlerini analiz ettiği ve insan tespitinde başarılı olduğu notundaki Bölüm 13.3.4’ten; 9 kutu, merkezî fark ve tek hücre bu sitenin basit hâlidir (gerçek HOG blok normalizasyonu da kullanır; burada yok).')

add('snnlab', 'goruntu-isleme/bolum-14.html',
    'Girdi parlaklığını, sızıntıyı ve ateşleme eşiğini değiştir; hazır düğmelerle koyu, orta ve parlak pikseli dene.',
    '80 zaman adımında hücrenin zar potansiyeli (mavi çizgi), eşik (turuncu kesikli) ve ateşlediği darbeler (kırmızı çizgiler) görünür. Altta darbe sayısı, ilk darbenin adımı ve adım başına girdi yazılır.',
    'Parlak girdi hücreyi sık ve erken ateşletir; zayıf girdi sızıntıya yenilip hiç ateşletmez. Bilgi darbelerin sayısında ve zamanında taşınır.',
    [('Zar potansiyeli', 'Hücrenin birikmiş girdisi; eşiğe ulaşınca darbe üretilir.'), ('Sızıntı', 'Her adımda potansiyelin bir kısmının sönmesi.'), ('Darbe (spike)', 'Eşik aşılınca hücrenin gönderdiği ani sinyal; sonra potansiyel sıfırlanır.'), ('Eşik', 'Darbe için aşılması gereken potansiyel.')],
    'Model bu site için sadeleştirildi (sızıntılı toplayıp ateşleyen hücre; girdi = parlaklık × 0,3). Darbe sinir ağlarının zamansal dinamiği değerlendirdiği notundaki Bölüm 14.2.1’den; hücre denklemi ve sayılar notta yoktur.')
add('galab', 'goruntu-isleme/bolum-14.html',
    'Popülasyon büyüklüğünü ve mutasyon büyüklüğünü seç; “Bir nesil ilerlet” ya da “10 nesil ilerlet”e bas.',
    'İki tepeli bir histogram, üzerinde eşik adaylarını gösteren turuncu noktalar, en iyi aday (yeşil çizgi) ve tüm eşikler denenince bulunan en uygun eşik (beyaz kesikli çizgi) görünür. Altta nesil sayısı, en iyi eşik ve uygunluk oranı yazılır.',
    'Seçilim, çaprazlama ve mutasyonla bireyler nesiller içinde en uygun eşiğe yaklaşır. Burada tek eşik aranır; bu yüzden 256 değeri tek tek denemek de mümkündür.',
    [('Birey', 'Bir eşik adayı (0–255).'), ('Uygunluk', 'Eşiğin iki sınıfı ayırma başarısı; burada sınıflar arası varyans (Otsu ölçütü).'), ('Çaprazlama', 'İki ebeveynin ortalaması alınarak yeni birey üretmek.'), ('Mutasyon', 'Yeni bireyi rastgele biraz oynatmak.')],
    'Histogram bu site için üretildi (iki tepe: 70 ve 180 civarı). Genetik algoritmanın segmentasyon eşiği seçiminde kullanılması notundaki Bölüm 14.2.2’den; seçilim yöntemi (en iyiyi koru, ikili turnuva) ve uygunluk ölçütü bu sitenin sade seçimleridir.')
add('dplab', 'goruntu-isleme/bolum-14.html',
    'Gizlilik katsayısı ε kaydırıcısını değiştir ve “Yeni 20 yanıt çek”e bas.',
    'Sayı doğrusu üzerinde gerçek sayı (60, yeşil çizgi) ve gürültü eklenmiş 20 yanıt (turuncu noktalar) görünür. Altta ortalama sapma, yanıt aralığı ve gürültü ölçeği yazılır.',
    'ε küçükken yanıtlar daha dağınıktır, bu da tek bir kişinin varlığını gizler; ε büyükken yanıtlar gerçeğe yakındır ama koruma azalır. Koruma ile doğruluk arasında denge vardır.',
    [('ε (epsilon)', 'Gizlilik katsayısı; küçük = daha çok gürültü, daha çok koruma.'), ('Laplace gürültüsü', 'Sayıya eklenen rastgele sapma; ölçeği 1 ÷ ε.'), ('Sapma', 'Gürültülü yanıt ile gerçek sayı arasındaki fark.')],
    'Sayı (60) ve sayma sorusu bu site için seçildi. Farklılaştırılmış gizliliğin istatistiksel analize izin verip bireysel kimliği koruduğu notundaki Bölüm 14.5.1’den; Laplace mekanizması standart bir yöntemdir ve notta anlatılmaz.')

# ---------------- Yapay Zekâ Temelleri 7 ----------------
add('mulab', 'yapay-zeka-temelleri/bolum-7.html',
    'Çürük olasılığını, “git + çürük yok” faydasını ve kusursuz test ücretini kaydır.',
    'İki eylemin beklenen faydası (EU), kusursuz bilginin değeri ve iki eylemin eşit olduğu eşik olasılık görünür. Altta karar ve testin değip değmediği yazılır.',
    'Karar, olasılıkla fayda birlikte değişince çevrilir: eşiğin altında gitmemek, üstünde gitmek en iyidir. Çürüğü önceden bilmek yalnızca kararı değiştirebiliyorsa değerlidir.',
    [('EU (beklenen fayda)', 'Sonuç faydalarının olasılıkla ağırlıklı toplamı.'), ('Eşik olasılık', 'İki eylemin beklenen faydasının eşit olduğu P(çürük).'), ('Kusursuz bilginin değeri', 'Çürüğün olup olmadığını önceden kesin bilmenin beklenen faydaya katkısı.'), ('Ücret', 'Bu kusursuz testin faydadan düşen bedeli.')],
    'Faydalar ve P(çürük) = 0,4 notundaki diş ağrısı örneğinden (Bölüm 7.2.2): EU(git) = 56, EU(gitme) = 2. Eşik formülü, kusursuz bilginin değeri ve test ücreti bu sitenin hesabıdır; notta ücret ve eşik yoktur, bilgi değeri yalnızca kavram olarak anlatılır.')
add('utillab', 'yapay-zeka-temelleri/bolum-7.html',
    'Üç eğriden birini seç (içbükey, doğrusal, dışbükey) ve kesin tutar kaydırıcısını oynat.',
    'Fayda eğrisi, turuncu nokta (piyangonun beklenen faydası) ve yeşil nokta (kesin tutarın faydası) görünür. Altta kesin eşdeğer ve ajanın seçimi yazılır.',
    'Aynı para sıralaması farklı eğrilerle farklı karar verir: içbükey eğri riskli piyangodan kaçınır, doğrusal eğri yalnızca beklenen paraya bakar, dışbükey eğri piyangoyu sever.',
    [('Piyango', '%50 ihtimalle 1 milyon dolar, %50 ihtimalle hiçbir şey.'), ('Kesin eşdeğer', 'Ajanı piyangoyla kayıtsız bırakan kesin tutar.'), ('İçbükey / dışbükey', 'Eğrinin biçimi; riskten kaçınma ve riske açıklığı gösterir.')],
    'Piyango (%50, 1 milyon) ve 450 bin dolar notundaki Bölüm 7.1.4 örneğinden. Eğri formülleri (√x, x, x²) ve 0–1 ölçeği bu sitenin seçimidir; notta formül verilmez.')
add('mauflab', 'yapay-zeka-temelleri/bolum-7.html',
    'w₁, w₂, w₃ ağırlıklarını kaydır ya da “Öğrenci / Aile / Konfor” düğmelerini dene.',
    'Üç arabanın fiyat, güvenlik, konfor puanları ve ağırlıklı fayda (U) tabloda görünür; en yüksek olan yeşil satırdır.',
    'Araba puanları sabit kalır, yalnızca ağırlıklar değişir; ama kazanan değişir. “En iyi araba” kişinin ağırlıklarına bağlıdır.',
    [('Ağırlık (w)', 'Bir niteliğin göreli önemi; burada toplamı 1 olacak şekilde normalleştirilir.'), ('U', 'Ağırlıklı fayda toplamı (0–10 ölçeği).'), ('Çok nitelikli fayda', 'Birden çok ölçütü tek bir sayıya toplayan fayda.')],
    'Formül notundaki Bölüm 7.1.4 (U = w₁·U_fiyat + w₂·U_güvenlik + w₃·U_konfor) ve aile/öğrenci örneğinden. Üç arabanın adı ve 0–10 puanları bu site için uydurulmuştur.')

# ---------------- Yapay Zekâ Temelleri 8 ----------------
add('splitlab', 'yapay-zeka-temelleri/bolum-8.html',
    'Hava, Nem ya da “Gün numarası” özelliklerinden birini seç.',
    'Seçilen özelliğin her dalındaki örnek sayısı, Evet/Hayır dağılımı, entropi ve Gini görünür. Üstte kök entropisi, bilgi kazancı ve Gini bölünmesi yazılır.',
    'Hava ile Nem karşılaştırılınca Nem hem bilgi kazancında hem Gini’de önde çıkar. Gün numarası her dalı tek örneğe böler: ölçütler “mükemmel” der, ama bu ezberdir.',
    [('Entropi', 'Dalın karışıklığı; 0 = saf, 1 = yarı yarıya (iki sınıf).'), ('Bilgi kazancı (IG)', 'Kök entropisi ile dalların ağırlıklı entropisi arasındaki fark.'), ('Gini bölünmesi', 'Dalların Gini değerlerinin örnek sayısıyla ağırlıklı ortalaması; küçük olan iyi.')],
    'Veri: notundaki Bölüm 8.2.3 piknik tablosu (10 satır). Notun yazdığı 6 Evet / 4 Hayır ve IG(Hava) = 0,246, IG(Nem) = 0,371, Gini(Hava) = 0,4 tabloyla tutmadığı için burada tablodan yeniden hesaplandı (7 Evet / 3 Hayır). “Gün numarası” bu sitenin eklemesidir.')
add('treelab', 'yapay-zeka-temelleri/bolum-8.html',
    'max_depth ve min_samples_leaf kaydırıcılarını değiştir.',
    'İki özellikli sanal verinin bölge haritası (yeşil/turuncu), 60 eğitim noktası, yaprak sayısı, eğitim ve test doğruluğu ve 12 derinlik için doğruluk tablosu görünür.',
    'Derinlik arttıkça eğitim doğruluğu yükselir ama test doğruluğu bir noktadan sonra düşer ya da durur; gürültüyü ezberleyen ağaç genellemez. min_samples_leaf büyütmek ön-budama gibi davranır.',
    [('max_depth', 'Ağacın en fazla kaç seviye büyüyeceği.'), ('min_samples_leaf', 'Bir yaprakta bulunması gereken en az örnek.'), ('Eğitim / test doğruluğu', 'Ağacın eğitim noktalarında / hiç görmediği 400 noktada doğru tahmin oranı.'), ('Ön-budama', 'Ağacı büyürken durdurmak (derinlik ya da yaprak sınırıyla).')],
    'Veri bu site için üretildi (“x > 0,5 ve y > 0,4” bölgesi sınıf 1, %15 etiket gürültüsü, sabit tohum). Aşırı uyum ve parametre rolü notundaki Bölüm 8.2.4 ve 8.6.1’e dayanır; ağaç kurma ve doğruluklar bu sitenin basit CART benzeri uygulamasıdır.')
add('thrlab', 'yapay-zeka-temelleri/bolum-8.html',
    'Eşik kaydırıcısını (yaş <) 20 ile 66 arasında oynat.',
    'Yaş ekseninde 12 müşteri (yeşil: alır, turuncu: almaz), eşik çizgisi, iki tarafın sayıları ve Gini bölünmesi görünür.',
    'Sayısal özellikte ağaç, aday eşikler arasından Gini bölünmesi en küçük olanı seçer. Burada en iyi eşik 31 ile 34 arasında, ikinci bir zayıf dip 40 civarındadır.',
    [('Eşik', 'Sayısal özelliği ikiye ayıran değer (yaş < eşik).'), ('Aday eşik', 'Komşu iki farklı değerin ortası.'), ('Gini bölünmesi', 'İki tarafın ağırlıklı Gini ortalaması.')],
    'Müşteri yaşları ve alma kararları bu site için uydurulmuştur. Eşikle bölme ve en uygun bölünme noktasını bulma fikri notundaki Bölüm 8.5 ve 8.2.2’den; Gini hesabı notundaki formüldür.')

# ---------------- Yapay Zekâ Temelleri 9 ----------------
add('advlab', 'yapay-zeka-temelleri/bolum-9.html',
    'ε kaydırıcısını 0 ile 0,30 arasında oynat.',
    'Sekiz özelliğin özgün (mavi) ve saldırılmış (turuncu) değerleri, özgün skor, saldırılmış skor, aynı büyüklükte rastgele değişimin skoru ve kritik ε görünür.',
    'Her özellik ε kadar, skoru düşüren yöne çekilince skor ε·Σ|w| düşer. ε kritik değerin (skor / Σ|w| ≈ 0,106) üstüne çıkınca sınıf çevrilir; aynı büyüklükte rastgele değişim sınıfı çevirmez.',
    [('ε', 'Her özelliğin en çok ne kadar değiştirilebileceği (özellikler 0–1 aralığında).'), ('Skor f(x)', 'w·x + b; pozitifse sınıf “+”, negatifse “−”.'), ('Σ|w|', 'Ağırlıkların mutlak değerlerinin toplamı (burada 18).'), ('Kritik ε', 'Sınıfı çeviren en küçük ε = skor / Σ|w|.')],
    'Ağırlıklar, girdi ve skor bu site için seçildi; notta sayısal saldırgan örnek yoktur. Adversarial attack fikri notundaki Bölüm 9.1.2 Dijital Güvenlik’e dayanır.')
add('biaslab', 'yapay-zeka-temelleri/bolum-9.html',
    'Ayrımcılık payını (0–20 puan) kaydır. Sonra “Grup sütunu silindi” düğmesine bas ve vekil sütunun B grubuyla örtüşmesini değiştir.',
    'Beş nitelik bandı için geçmişteki ve modelin öğrendiği onay oranları, kararlar (onay/red), grup farkı ve kararı farklı çıkan bant sayısı görünür.',
    'Model geçmişi öğrenir: nitelik aynıyken B grubuna daha düşük onay verir. Grup sütunu silinse bile vekil sütun B ile örtüşüyorsa fark d·(2r−1)² kadar sürer.',
    [('Nitelik bandı', 'Başvurunun niteliğini 1 (zayıf) – 5 (güçlü) arası gösteren sanal ölçü.'), ('Ayrımcılık payı', 'Geçmişte B grubunun onay oranından kesilen puan.'), ('Vekil sütun', 'Grup bilgisini dolaylı taşıyan sütun (örneğin posta kodu).'), ('Örtüşme r', 'Vekil sütunun B grubunu doğru gösterme oranı; %50 = bilgi taşımaz.')],
    'Veri ve sayılar bu site için uydurulmuştur. Verideki önyargının modele geçmesi notundaki Bölüm 9.2.2’ye dayanır; vekil sütun fikri notta yoktur.')
add('balonlab', 'yapay-zeka-temelleri/bolum-9.html',
    'Öneri keskinliği k’yı ve gün sayısını kaydır.',
    'Beş konunun tüketim payı, en büyük konu payı ve zamana göre etkin konu sayısı grafiği görünür.',
    'k > 1 iken öneri çok tüketileni daha da öne çıkarır ve çeşitlilik düşer; k = 1’de pay sabit kalır; k < 1’de paylar eşitlenir.',
    [('k', 'Önerinin tüketim payının kaçıncı kuvvetiyle orantılı olduğu.'), ('Pay', 'Kullanıcının tüketiminde bir konunun oranı.'), ('Etkin konu sayısı', 'Paylar eşit olsaydı kaç konu varmış gibi davranırdı (exp(entropi)).')],
    'Model ve sayılar bu site için sadeleştirilmiştir; notta yalnızca bilgi balonu fikri anlatılır (Bölüm 9.1.2 ve 9.2.2).')

# ---------------- Yapay Zekâ Temelleri 10 ----------------
add('qubitlab', 'yapay-zeka-temelleri/bolum-10.html',
    'n kaydırıcısıyla qubit sayısını, θ kaydırıcısıyla tek qubitin açısını değiştir. İstersen “1000 ölçüm yap”a bas.',
    'n qubitin kaç genlikle anlatıldığı (2ⁿ), ölçümde kaç bit okunduğu (n), tek qubit için 0 ve 1 çıkma olasılıkları ve 1000 ölçümün dağılımı görünür.',
    'Durumu anlatmak için 2ⁿ sayı gerekir ama ölçüm yalnızca n bitlik tek bir sonuç verir. Süperpozisyon, tüm cevapları aynı anda okumak demek değildir.',
    [('Qubit', 'Kuantum bit; durumu iki genlikle anlatılır.'), ('Genlik', 'Durumun bir bileşenini belirleyen sayı; olasılık, genliğin karesidir.'), ('θ', 'Tek qubitin durumunu ayarlayan açı; P(0) = cos²(θ/2).'), ('Ölçüm', 'Qubiti okumak; tek bir 0 ya da 1 sonucu verir.')],
    'Notta yalnızca “qubit aynı anda 0 ve 1 olabilir” anlatımı vardır (Bölüm 10.2.1); genlik ve ölçüm ayrıntısı bu sitenin ekidir, kuantum hesaplama ders kitabı bilgisidir (kaynakla doğrula). Ölçümler sabit tohumlu rastgele sayıyla simüle edilir.')
add('otolab', 'yapay-zeka-temelleri/bolum-10.html',
    'Hız, sensör menzili ve algılama + karar gecikmesi kaydırıcılarını değiştir.',
    'Gecikmede alınan yol, frenleme mesafesi, toplam durma mesafesi, sensör menzili çizgisi ve araç durur mu çarpar mı (çarparsa hızı) görünür.',
    'Frenleme mesafesi hızın karesiyle artar; gecikme yolu hızla doğrusal artar. Menzil toplam durma mesafesinden kısaysa araç çarpar.',
    [('Gecikme yolu', 'Algılama ve karar sürerken araç hızıyla ilerler: v·t.'), ('Frenleme mesafesi', 'Frenle durmak için gereken yol: v²/(2a).'), ('Sensör menzili', 'Aracın engeli görebildiği en uzak mesafe.'), ('a', 'Frenleme ivmesi; bu sitede 6 m/s² alındı.')],
    'Sayılar ve a = 6 m/s² bu sitenin varsayımıdır; notta sayısal örnek yoktur. Algılama–karar–hareket yapısı notundaki Bölüm 10.3.1’den alındı.')
add('xailab', 'yapay-zeka-temelleri/bolum-10.html',
    'Bir başvuru seç (1–8). Sonra “Yerel” ve “Küresel” görünümleri karşılaştır.',
    'Dört özelliğin seçili başvurudaki katkısı (yeşil: skoru artırır, turuncu: azaltır), toplam skor, karar ve küresel görünümde ortalama mutlak katkı çubukları görünür.',
    'Yerel açıklama tek kararı, küresel açıklama modelin genel eğilimini anlatır; Başvuru 6’da gelire rağmen gecikme sayısı kararı belirler, küresel görünümde ise gelir en öndedir. Her açıklama farklı soruya cevap verir.',
    [('Katkı', 'Ağırlık × (değer − ortalama değer): özelliğin skoru ortalamaya göre ne kadar oynattığı.'), ('Yerel', 'Tek bir kararın nedeni.'), ('Küresel', 'Tüm başvurularda katkının ortalama büyüklüğü.'), ('Skor', 'Dört katkının toplamı; ≥ 0 ise onay.')],
    'Başvurular, ağırlıklar ve ortalamalar bu site için uydurulmuştur. Yerel/küresel ayrımı ve SHAP fikri notundaki Bölüm 10.7’ye dayanır; doğrusal modelde Shapley katkısının bu biçimi standart bilgidir (kaynakla doğrula).')

# ---------------- Veri Bilimi 7 ----------------
add('edgelab', 'veri-bilimi/bolum-7.html',
    'Sensör sayısını, sensör başına ham veriyi, edge’den çıkan veri oranını ve bulut hattı kapasitesini kaydır.',
    'Her şeyi buluta göndermenin ve edge’de özetlemenin hat yükü iki çubukla, kapasite çizgisiyle ve “yeter / yetmez” kutularıyla görünür.',
    'Ham veri hattı kolayca aşar; edge’de özetlenmiş veri çok daha küçüktür. Oran yükseldikçe edge’in kazancı azalır.',
    [('Ham veri yükü', 'Sensör sayısı × sensör başına kB/sn × 8 ÷ 1000 (Mbit/sn).'), ('Edge’den çıkan oran', 'Edge düğümünün buluta gönderdiği özetin ham veriye oranı.'), ('Hat kapasitesi', 'Buluta giden bağlantının taşıyabildiği en çok Mbit/sn.')],
    'Sayılar bu site için seçildi; notta sayısal örnek yoktur. Fikir notundaki Bölüm 7.2.2’ye dayanır. Edge düğümünün işlem gücü ve pil ömrü hesaba girmez.')
add('mrlab', 'veri-bilimi/bolum-7.html',
    'Reducer sayısını kaydır. İstersen “Map tarafında birleştir”i aç ya da kapat.',
    'Dört satırlık sözcük sayımında her map’in ürettiği (sözcük, sayı) çiftleri, reducer’ların topladığı sayımlar ve shuffle’a giden çift sayısı görünür.',
    'Aynı sözcük her zaman aynı reducer’a gider, bu yüzden toplamlar doğru çıkar. Birleştirici shuffle’a giden çift sayısını 16’dan 8’e indirir.',
    [('Map', 'Her satırı (sözcük, 1) çiftlerine çevirir.'), ('Shuffle', 'Aynı anahtarlı çiftleri aynı reducer’a taşır; ağ maliyeti buradadır.'), ('Reduce', 'Aynı sözcüğün sayılarını toplar.'), ('Combiner', 'Map’in kendi çıktısını ağa göndermeden önce yerelde toplaması.')],
    'Satırlar bu site için uydurulmuştur. Map/shuffle/reduce akışı notundaki Bölüm 7.3.2’ye dayanır. Reducer atamasında basit bir karakter toplamı kullanıldı; gerçek sistemler başka bir karma işlevi kullanır.')
add('quorumlab', 'veri-bilimi/bolum-7.html',
    'N, W ve R kaydırıcılarını değiştir ya da hazır düğmelerle üç düzeni dene.',
    'Kopyalar kutular olarak çizilir (yeşil: yeni yazılan, gri: eski; çerçeve: en kötü durumda okunan kopyalar). Altta W + R, güncel kopya sayısı ve dayanılan çöken kopya sayıları yazar.',
    'W + R > N olunca okuma kümesi ile yazma kümesi kesişir ve okuma en az bir güncel kopya görür. Bunun bedeli, yazma ve okumada daha çok kopyanın cevabını beklemektir.',
    [('N', 'Verinin tutulduğu toplam kopya sayısı.'), ('W', 'Bir yazmanın başarılı sayılması için onay vermesi gereken kopya sayısı.'), ('R', 'Bir okumada cevabı beklenen kopya sayısı.'), ('Kesişim', 'Okunan ve yazılan kopyaların ortak olanları: en az W + R − N.')],
    'Sayılar bu site için seçildi. W + R > N kuralı notundaki Bölüm 7.4.1’den alındı; “en kötü durum” gösterimi bu sitenin çizimidir.')

# ---------------- Veri Bilimi 8 ----------------
add('biasvarlab', 'veri-bilimi/bolum-8.html',
    'Polinom derecesini (1–9) ve L2 ceza λ’yı kaydır.',
    'Dereceye göre bias², varyans ve toplam hata çizgileri; seçili derece için bias², varyans, σ², beklenen test hatası ve eğitim hatası görünür.',
    'Derece arttıkça bias düşer, varyans yükselir; toplam hata bir dereceye kadar düşüp sonra artar. Eğitim hatası hep düşer, bu yüzden aşırı uyumu gizler. λ’yı artırmak yüksek derecelerde varyansı azaltır.',
    [('Bias²', 'Ortalama tahminin gerçek fonksiyondan sapmasının karesi (100 eğitim kümesi üzerinden).'), ('Varyans', 'Farklı eğitim kümelerinde tahminlerin ortalama etrafındaki oynaması.'), ('σ²', 'Veriye eklenen gürültünün varyansı (0,3² = 0,09); hiçbir model bunu ortadan kaldıramaz.'), ('λ', 'L2 (Ridge) ceza: büyük katsayıları cezalandırır.')],
    'Veri bu site için üretildi: gerçek fonksiyon sin(2πx), gürültü σ = 0,3, her kümede 30 nokta, 100 küme, sabit tohum. Kavramlar notundaki Bölüm 8.1.2’ye dayanır.')
add('curselab', 'veri-bilimi/bolum-8.html',
    'Boyut sayısını (1’den 1000’e) kaydır.',
    'Boyuta göre göreli uzaklık farkı (log ölçekli çizgi), en yakın ve en uzak komşunun ortalama uzaklığı ve en yakın/en uzak oranı görünür.',
    'Boyut arttıkça en yakın ve en uzak komşu neredeyse aynı uzaklığa gelir; oran 1’e yaklaşır. Bu durumda “yakın = benzer” varsayımına dayanan kümeleme zayıflar.',
    [('Göreli fark', '(en uzak − en yakın) / en yakın uzaklık.'), ('Oran', 'En yakın uzaklığın en uzağa bölümü; 1’e yaklaşırsa fark kalmamıştır.'), ('Boyut d', 'Her noktanın özellik sayısı.')],
    'Veri bu site için üretildi: [0,1]ᵈ içinde 300 rastgele nokta, 20 rastgele sorgunun ortalaması, sabit tohum. Boyutluluk laneti fikri notundaki Bölüm 8.2.2’den.')
add('gammalab', 'veri-bilimi/bolum-8.html',
    'γ (indirgeme katsayısı) ve büyük ödülün geldiği adım T kaydırıcılarını değiştir.',
    'Her adım için γᵗ ağırlığı sütunlarla, A (hemen 10) ve B (T. adımda 30) seçeneklerinin indirgenmiş değeri, ajanın seçeceği seçenek ve eşit olduğu γ görünür.',
    'γ yüksekse ajan beklemeyi göze alır, düşükse hemen küçük ödülü seçer. Büyük ödül ne kadar geç gelirse beklemek için gereken γ eşiği 1’e yaklaşır.',
    [('γ', 'İndirgeme katsayısı: gelecekteki ödülün bugünkü değeri her adımda γ ile çarpılır.'), ('T', 'Büyük ödülün geldiği adım.'), ('Eşit γ', 'İki seçeneğin indirgenmiş değerinin eşit olduğu γ: (1/3)^(1/(T−1)).')],
    'Ödül değerleri (10 ve 30) bu site için seçildi. İndirgeme fikri notundaki Bölüm 8.4.1’den; formül görseldir, burada standart biçimi kullanıldı.')

# ---------------- Veri Bilimi 9 ----------------
add('metriclab', 'veri-bilimi/bolum-9.html',
    'Doğruluk, kesinlik, duyarlılık ya da F1 düğmesine bas.',
    'Dört modelin karışıklık sayıları (TP, FP, FN, TN) ve dört metriği, seçilen metriğe göre sıralanmış tabloda görünür; altta her metriğin birincisi yazar.',
    'Aynı dört model, metrik değişince farklı sıralanır: doğrulukta A, duyarlılıkta B, F1’de C birinci. Hiç pozitif yakalamayan D bile doğrulukta üçüncü gelir.',
    [('TP / FP / FN / TN', 'Gerçek pozitif, yanlış pozitif, yanlış negatif, gerçek negatif sayısı.'), ('Doğruluk', 'Doğru tahminlerin tüm örneklere oranı.'), ('Kesinlik', '“Pozitif” dediklerinin gerçekten pozitif olma oranı.'), ('Duyarlılık', 'Gerçek pozitiflerin ne kadarının yakalandığı.'), ('F1', 'Kesinlik ile duyarlılığın harmonik ortalaması.')],
    'Dört model ve sayılar bu site için uydurulmuştur (1000 örnek, 50 pozitif). Metriğin sıralamayı değiştirebileceği fikri notundaki Bölüm 9.1.1’den; ROC-AUC burada hesaplanmadı.')
add('opendatalab', 'veri-bilimi/bolum-9.html',
    'Veriye erişim açıklığını ve kapasite geliştirme yatırımını kaydır.',
    'Üç grubun (büyük şirket, üniversite, yerel topluluk/STK) yararlanması çubuklarla, toplulukların payı ve şirketin topluluğa oranı metriklerle görünür.',
    'Erişim tam açık olsa bile yararlanma eşit değildir: topluluğun payı yaklaşık %11,8’de kalır. Kapasite geliştirme yatırımı arttıkça fark kapanır.',
    [('Erişim açıklığı', 'Verinin ne ölçüde herkese açık olduğu.'), ('Analiz kapasitesi', 'Bir grubun veriden çıkarım yapabilme gücü (0–1).'), ('Yararlanma', 'Erişim × kapasite.'), ('Kapasite yatırımı', 'Düşük kapasiteli grupları en yüksek kapasite düzeyine yaklaştıran eğitim ve destek.')],
    'Gruplar, kapasite değerleri (0,9 · 0,6 · 0,2) ve modelin kendisi bu sitenin varsayımıdır. Erişimin eşit yararlanma sağlamadığı ve kapasite geliştirmenin gerektiği fikri notundaki Bölüm 9.2.1’dendir.')
add('multilab', 'veri-bilimi/bolum-9.html',
    'Gen sayısını ve gerçekten etkili gen sayısını kaydır; α düzeyini seç.',
    'Düzeltmesiz ve Bonferroni düzeltmeli “anlamlı” gen sayıları, bunların kaçının sahte olduğu, beklenen sahte keşif sayısı ve gerçek etkilerden kaçının yakalandığı görünür.',
    'Etkisiz gen sayısı büyüdükçe α oranında sahte keşif kaçınılmazdır. Bonferroni sahte keşfi neredeyse sıfırlar ama gerçek etkilerden de daha azını yakalar.',
    [('α', 'Bir testte “anlamlı” sonuç çıkmasına izin verilen yanlış alarm olasılığı.'), ('Sahte keşif', 'Gerçekte etkisi olmadığı hâlde “anlamlı” çıkan gen.'), ('Bonferroni', 'Eşiği α/m’e çekerek m testteki toplam yanlış alarmı sınırlayan düzeltme.'), ('Etkili gen', 'İki grup arasında gerçekten 1σ ortalama farkı olan gen.')],
    'Veri bu site için üretildi: her gen için 20’şer kişilik iki grup, sabit tohum, normal yaklaşımlı p-değeri. Teorisiz çok sayıda korelasyon aramanın riski notundaki Bölüm 9.3.2’den; çoklu test düzeltmesi notta yoktur, bu sitenin eklemesidir.')

# ---------------- Veri Bilimi 10 ----------------
add('outlierlab', 'veri-bilimi/bolum-10.html',
    'Örnek sayısı n’yi ve aykırı değeri kaydır.',
    'Değerler bir doğru üzerinde noktalar olarak, IQR sınırları açık mavi bant olarak görünür; altta aykırının z-skoru, n için en büyük olası |z| ve iki kuralın sonucu (yakalar / kaçırır) yazılır.',
    'n küçükken (n = 10 için üst sınır ≈ 2,85) aykırı ne kadar uç olursa olsun |z| > 3 kuralı onu yakalayamaz; IQR kuralı yakalar. Aykırı değer ortalamayı ve std’yi şişirdiği için z-skoru kendini gizler.',
    [('z-skor', '(x − ortalama) / örnek std; notta |z| > 3 aykırı sayılır.'), ('IQR', 'Üçüncü çeyrek − birinci çeyrek; sınırlar Q1 − 1,5·IQR ve Q3 + 1,5·IQR.'), ('En büyük |z|', 'n örnekte, örnek std ile bir değerin alabileceği en büyük z: (n − 1)/√n.')],
    'Değerler bu site için üretildi (ortalaması 50, std’si 2 civarı sanal veri, sabit tohum). z-skor ve IQR kuralları notundaki Bölüm 10.3’ten; (n−1)/√n sınırı standart istatistik bilgisidir, notta yoktur.')
add('reglab', 'veri-bilimi/bolum-10.html',
    'Ceza şiddeti λ’yı ve ElasticNet’in α’sını kaydır.',
    'Beş katsayı için cezasız (OLS), Ridge, Lasso ve ElasticNet değerleri sütunlarla ve sayılarla görünür; kaç katsayının sıfırlandığı yazılır.',
    'Ridge tüm katsayıları aynı oranda küçültür ama sıfırlamaz; Lasso küçük katsayıları tam sıfıra indirir; ElasticNet α ile ikisi arasında gidip gelir.',
    [('λ', 'Cezanın şiddeti; büyüdükçe katsayılar küçülür.'), ('α', 'ElasticNet’te L1 (Lasso) ağırlığı; 1 = Lasso, 0 = Ridge.'), ('Ortonormal tasarım', 'Değişkenlerin birbirine dik olduğu özel durum; formüller bu durumda kapalı biçimde yazılır.')],
    'Katsayılar (3; 1,5; 0,6; 0,2; −0,1) bu site için seçildi. Ridge, Lasso ve ElasticNet amaç fonksiyonları notundaki Bölüm 10.4.1’den; ortonormal durumdaki kapalı çözümler (β/(1+λ), yumuşak eşikleme) standart bilgidir, notta yoktur.')
add('fairlab', 'veri-bilimi/bolum-10.html',
    'B grubunun gerçek pozitif oranını, karar eşiğini ve B’nin puanlarındaki kaymayı (δ) değiştir.',
    'İki grup için gerçek pozitif oranı, olumlu karar oranı, TPR ve FPR bir tabloda; demografik parite farkı ve eşitlenmiş olasılık farkı iki kutuda görünür.',
    'Puanlar iki grupta aynı dağılıyorsa TPR ve FPR eşittir (eşitlenmiş olasılık sağlanır), ama gerçek pozitif oranları farklıysa olumlu karar oranları farklı kalır (demografik parite bozulur). δ > 0 olunca eşitlenmiş olasılık da bozulur.',
    [('Demografik parite', 'Olumlu karar oranı gruplar arasında eşit.'), ('Eşitlenmiş olasılık', 'Gerçek sınıf verildiğinde olumlu karar oranı (TPR ve FPR) gruplar arasında eşit.'), ('TPR / FPR', 'Gerçek pozitifi yakalama / gerçek negatife yanlış olumlu verme oranı.'), ('δ', 'B grubunun tüm puanlarının aşağı kayma miktarı.')],
    'Gruplar, oranlar ve puan dağılımları (pozitif N(+1,1), negatif N(−1,1)) bu sitenin varsayımıdır. İki ölçütün tanımı notundaki Bölüm 10.23’ten; “ikisi birlikte sağlanamayabilir” sonucu notta yazmaz, bu lab’ın gösterdiğidir.')

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
