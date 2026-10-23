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
