# -*- coding: utf-8 -*-
"""Lab çerçevesi ekler: her laboratuvarın önüne 'ne yapacaksın / ne göreceksin / ne anlamalısın' + terimler + kaynak notu."""
import io, os, re
ROOT = r'C:\Users\user\Desktop\Projeler\ai-yuksek-lisans\content'

def rd(p):
    with io.open(p, encoding='utf-8', newline='') as f: return f.read().replace('\r\n', '\n')
def wr(p, s):
    with io.open(p, 'w', encoding='utf-8', newline='\n') as f: f.write(s)

# id: (dosya, yap, gör, anla, [(terim, tanım)], kaynak)
L = {}
def lab(i, f, yap, gor, anla, terms, kaynak): L[i] = (f, yap, gor, anla, terms, kaynak)

lab('samplab', 'arastirma-yontemleri/bolum-5.html',
    'Bir yöntem seç (basit seçkisiz, sistematik, tabakalı, uygun), sonra “Yeni örneklem çek”e birkaç kez bas.',
    'Seçilen birimler renkli görünür. Üstte, 10’luk örneklemde kaç birimin B grubundan geldiği yazar.',
    'Evrenin %30’u B grubu olduğundan 10’luk örnekte ideal sayı 3’tür. Tabakalı yöntem hep 3 verir; basit seçkisiz yöntem her çekilişte oynar; uygun örnekleme (ilk 10 birim) B grubunu hiç yakalamaz.',
    [('Evren', 'Sonuçların geçerli olacağı büyük grup (burada 100 birim).'), ('Örneklem', 'Evrenden seçilen 10 birim.'), ('B grubu', 'Evrenin %30’unu oluşturan alt grup; notundaki “lise türlerine göre değişen sorun” fikrinin sadeleştirilmiş hâli.')],
    'Veri: bu site için üretilmiş sanal 100 birimlik evren. Yöntemler notundaki Bölüm 5.3’e dayanır.')

lab('nlab', 'arastirma-yontemleri/bolum-5.html',
    'Evren büyüklüğünü (N), sapma miktarını (d), oranı (P) kaydır; güven düzeyini seç.',
    'Gereken örneklem büyüklüğü ve evrenin kaçta kaçı olduğu hesaplanır.',
    'Sapma miktarı küçüldükçe gereken örneklem hızla büyür. Evren çok büyüyünce gereken sayı sabitlenmeye başlar. P = %50 en büyük (en güvenli) örneklemi verir.',
    [('d (sapma miktarı)', 'Tahminde kabul ettiğin en büyük hata payı; ±5 puan gibi.'), ('Güven düzeyi', 'Tahminin doğru aralıkta kalma güveni; %95 için t = 1,96.'), ('P', 'Bir özelliğe sahip olanların evren oranı. Bilinmiyorsa 0,5 alınır.')],
    'Formül ve değerler notundaki Bölüm 5.4 ve Tablo 3.1’den alındı (N = 500, d = 0,05 için 218).')

lab('alphalab', 'arastirma-yontemleri/bolum-6.html',
    'Madde sayısını ve madde gürültüsünü kaydır; “Yeni 30 kişi”ye basarak yanıtları yenile.',
    'İlk 5 kişinin yanıtları, Cronbach α ve ölçmenin standart hatası görünür.',
    'Maddeler aynı özelliği ölçüyorsa birlikte değişir ve α yükselir. Madde sayısı artınca ya da gürültü azalınca α artar, standart hata (puandaki “şans payı”) küçülür.',
    [('Cronbach α', 'Maddelerin birlikte tutarlılığını gösteren katsayı (0–1). 1’e yaklaştıkça güvenirlik artar.'), ('Likert', '1–5 gibi derecelendirmeli yanıt ölçeği (Hiç katılmıyorum … Tamamen katılıyorum).'), ('Madde gürültüsü', 'Bir maddenin kişinin gerçek düzeyinden rastlantısal sapması.'), ('SEm', 'Ölçmenin standart hatası: toplam puana karışabilecek hata payı. SEm = SD·√(1 − güvenirlik).')],
    'Veri: bu site için üretilmiş sanal 30 kişilik anket. Kavramlar ve formüller notundaki Bölüm 6.2’ye dayanır.')

lab('cclab', 'goruntu-isleme/bolum-4.html',
    'Üstte 4-, 8- ya da m-bitişikliği seç. İstersen hücrelere tıklayıp pikselleri aç/kapat.',
    'Her bağlı bileşen ayrı renk ve numara alır; altta nesne pikseli ve bileşen sayısı yazar.',
    'Aynı şekil 4-bitişiklikte çok parçaya bölünür, 8-bitişiklikte birleşir. m-bitişiklikte bileşenler 8-bitişiklikle aynı çıkar, ama aralarındaki yol tek olur (çift yol sorunu kalkar).',
    [('Piksel = 1', 'Nesneye ait piksel (renkli hücre).'), ('Bağlı bileşen', 'Aynı sınıftan olup aralarında geçerli bir yol bulunan piksel kümesi.'), ('Bitişiklik', 'İki pikselin “komşu sayılma” kuralı (yatay-dikey ya da çapraz da).')],
    'Veri: sanal 8×8 ikili görüntü. Tanımlar notundaki Bölüm 4.2–4.5’e dayanır.')

lab('distlab', 'goruntu-isleme/bolum-4.html',
    'Izgarada iki kez tıkla: önce p noktasını, sonra q noktasını yerleştir. Sonraki tıklamalar sırayla bunları taşır.',
    'D₄, D₈ ve Öklid uzaklığı hemen güncellenir.',
    'Hep D₈ ≤ Dₑ ≤ D₄ çıkar. D₄ yalnızca dik adımları, D₈ çapraz adımı da 1 sayar.',
    [('D₄ (city-block)', '|Δsatır| + |Δsütun|: yalnızca yatay-dikey yürüyen taksi.'), ('D₈ (satranç)', 'max(|Δsatır|, |Δsütun|): çapraz adım da 1.'), ('Dₑ (Öklid)', 'Kuş uçuşu uzaklık: √(Δsatır² + Δsütun²).')],
    'Formüller notundaki Bölüm 4.8’den alındı.')

lab('filtlab', 'goruntu-isleme/bolum-5.html',
    'Gürültü türünü, filtreyi ve çekirdek boyutunu seç. “Yeni gürültü çek” ile gürültüyü yenile.',
    'Üç görüntü yan yana: temiz sahne, gürültülü girdi, filtre sonucu. Altında girdi hatası, sonuç hatası ve kenar dikliği yazar.',
    'İyi filtre sonuç hatasını (MSE) düşürürken kenar dikliğini 100’e yakın tutar. Tuz-biberde medyan bunu başarır; ortalama ve Gauss gürültüyü azaltır ama kenarı bulanıklaştırır; keskinleştirme gürültüyü büyütür.',
    [('MSE', 'Sonucun temiz görüntüden ortalama kare sapması. Küçük olması iyidir.'), ('Kenar dikliği', 'Koyu–parlak geçişin ne kadar keskin kaldığı (temiz görüntüde 100).'), ('Gauss gürültüsü', 'Her piksele rastgele küçük sapma eklenir.'), ('Tuz-biber gürültüsü', 'Rastgele siyah ve beyaz noktalar.'), ('Çekirdek', 'Filtrenin bir pikselde baktığı küçük pencere (3×3 gibi).')],
    'Veri: kodla üretilmiş sanal 32×32 sahne. Filtrelerin tanımı notundaki Bölüm 5.4–5.6’ya dayanır.')

lab('freqlab', 'goruntu-isleme/bolum-6.html',
    'Filtre türünü (alçak/yüksek geçiren, notch) ve biçimini (ideal, Butterworth, Gauss) seç. Kesim kaydırıcısını oynat.',
    'Sol: şerit parazitli girdi. Orta: spektrum (parlak nokta = o frekansta çok enerji; mavi = filtrenin bastırdığı yer). Sağ: sonuç. Altta hata (MSE).',
    'Şerit paraziti spektrumda yatayda iki parlak nokta olarak görünür; notch yalnızca onları siler. İdeal alçak geçiren kenarda halkalanma yapar, Gauss yapmaz.',
    [('Spektrum', 'Görüntünün frekans bileşenlerinin haritası; merkez düşük frekanstır.'), ('D₀ (kesim)', 'Filtrenin geçirdiği/bastırdığı frekans yarıçapı.'), ('Halkalanma', 'Keskin kesimli filtrenin kenar çevresinde yarattığı dalgalanma.'), ('MSE', 'Sonucun temiz görüntüden ortalama kare sapması.')],
    'Veri: sanal 32×32 sahne + eklenmiş şerit paraziti. Notundaki “tarama çizgileri, bantlar” örneğine denk gelir (Bölüm 6.2).')

lab('gdlab', 'makine-ogrenmesi/bolum-4.html',
    'α (öğrenme oranı) kaydırıcısını seç. “1 adım” ya da “20 adım”a bas; “Sıfırla” ile baştan başla.',
    'Mavi çizgi noktalara yaklaşır; maliyet J düşer, eğim θ₁ oturur.',
    'Hata büyükken adım büyük, küçükken küçüktür. α çok büyükse adımlar çözümü aşar ve çizgi “patlar” (ıraksar).',
    [('α (öğrenme oranı)', 'Her adımın büyüklüğü.'), ('Maliyet J', 'Tahminlerin gerçek değerlerden hata kareleri ortalaması (yarısı); ne kadar küçükse o kadar iyi.'), ('θ₁', 'Doğrunun eğimi.')],
    'Veri: sanal 12 daire (alan → kira). Fikir, notundaki ev fiyatı örneğine ve LMS kuralına dayanır (Bölüm 4.2).')

lab('polylab', 'makine-ogrenmesi/bolum-4.html',
    'Polinom derecesi kaydırıcısını 1’den 8’e çıkar.',
    'Eğri noktalara uyar. Dolu daireler eğitim, boş daireler test noktalarıdır; altta iki hata yazar.',
    'Derece 1’de eğri veriyi yakalayamaz (az uyum). 2–3’te iyi. 8’de eğitim hatası ≈ 0 olur ama test hatası büyür (aşırı uyum).',
    [('Eğitim hatası', 'Modelin öğrenirken gördüğü noktalardaki hata.'), ('Test hatası', 'Modelin görmediği noktalardaki hata; asıl önemli olan budur.'), ('Derece', 'Eğrinin esnekliği (x, x², x³ …).')],
    'Veri: sanal 9 eğitim + 6 test noktası. Az/aşırı uyum fikri notundaki Şekil 4.1 anlatımına dayanır.')

lab('siglab', 'makine-ogrenmesi/bolum-4.html',
    'z kaydırıcısını −8 ile +8 arasında gezdir.',
    'Nokta sigmoid eğrisi üzerinde kayar; altta g(z) değeri ve model kararı yazar.',
    'g(z) hiçbir zaman 0’ın altına, 1’in üstüne çıkmaz; z = 0’da 0,5’tir. 0,5’in üstü “sınıf 1”, altı “sınıf 0” demektir.',
    [('z', 'Girdilerin ağırlıklı toplamı (θᵀx).'), ('Sigmoid g(z)', 'z’yi 0–1 arasına sıkıştıran eğri: 1/(1+e⁻ᶻ).')],
    'Sigmoid tanımı notundaki Bölüm 4.3’ten alındı.')

lab('svmlab', 'makine-ogrenmesi/bolum-5.html',
    'Önce açı ve konum kaydırıcılarıyla çizgiyi iki sınıfı ayıracak biçimde getir. Sonra aralığı büyütmeye çalış; en sonda “En geniş aralığı bul”a bas.',
    'Çizgiyle birlikte kesikli iki marj çizgisi görünür. Altta aralık genişliği ve destek vektörü sayısı yazar; yeşil halka destek vektörünü gösterir.',
    'Birçok çizgi sınıfları ayırır, ama iki sınıfa da en uzak olan (en geniş aralıklı) seçilir. Çizgiyi yalnızca ona en yakın noktalar (destek vektörleri) belirler.',
    [('Marj', 'Ayırıcı çizgiyle en yakın noktalar arasındaki boşluk.'), ('Destek vektörü', 'Marj sınırında duran, çizgiyi belirleyen noktalar.'), ('Hiperdüzlem', 'İki boyutta bir doğru; üç boyutta bir düzlem.')],
    'Veri: sanal 12 nokta. Fikir notundaki Bölüm 5.1.1 ve Şekil 5.3’e dayanır.')

lab('xorlab', 'makine-ogrenmesi/bolum-5.html',
    'Önce w₁, w₂ ve b kaydırıcılarıyla tek birimi XOR’a uydurmaya çalış. Sonra “Gizli katman ekle”ye bas.',
    'Dört girdi için hedef, çıktı ve doğru/yanlış tablosu ve “kaç / 4 doğru” yazar.',
    'Tek birimle (tek doğru) en çok 3/4 doğru alırsın; XOR doğrusal ayrılamaz. Gizli katman eklenince 4/4 olur.',
    [('XOR', 'İki girdi farklıysa 1, aynıysa 0.'), ('w, b', 'Ağırlık ve eşik (bias): birimin girdileri nasıl toplayıp karar verdiği.'), ('Gizli katman', 'Girdi ile çıkış arasındaki ara birimler.')],
    'Notunda XOR yoktur; “gizli katman doğrusal olmayan sınır öğrenir” fikrini (Bölüm 5.2.1) göstermek için ders örneği olarak eklendi.')

lab('dxlab', 'makine-ogrenmesi/bolum-6.html',
    '“Derste işlenen örnek” düğmesine bas; sonra hastalık sıklığını, duyarlılığı ve yanlış alarmı değiştir.',
    '1000 kişilik nokta ızgarası ve altta P(h | pozitif) yazar.',
    'Hastalık nadirse test %98 doğru olsa bile pozitif çıkanların çoğu sağlamdır (derste örnekte yalnızca %21 hasta). Sonuç önsele güçlü biçimde bağlıdır.',
    [('Önsel P(h)', 'Hastalık sıklığı: teste bakmadan önceki olasılık.'), ('Duyarlılık P(+|h)', 'Hasta olanlarda testin pozitif çıkma oranı.'), ('Yanlış alarm P(+|¬h)', 'Sağlam olanlarda testin pozitif çıkma oranı.'), ('Ardıl P(h|+)', 'Test pozitif çıktıktan sonra hasta olma olasılığı.'), ('MAP', 'Ardıl olasılığı en büyük olan hipotez.')],
    'Sayılar notundaki kanser örneğinden (0,008 / 0,98 / 0,03). Ekrandaki nokta ızgarası görselleştirme için eklendi.')

lab('maplab', 'makine-ogrenmesi/bolum-6.html',
    'x kaydırıcısıyla bir değer seç, “Etiketli örnek ekle”ye bas. Birkaç farklı x ile tekrarla.',
    'Her hipotezin çubuğu: tutarsız olanlar silikleşir (olasılık 0), tutarlı olanlar eşit pay alır.',
    'Her örnek, ona aykırı hipotezleri eler; geriye kalanların her biri 1/|VS| olasılık taşır. Hedef kavrama yaklaştıkça tek hipotez kalır.',
    [('h_t', '“x ≥ t ise 1” kuralı; toplam 12 aday hipotez.'), ('VS (sürüm uzayı)', 'Verilerle tutarlı hipotezler kümesi.'), ('Ardıl P(h|D)', 'Veri görüldükten sonra hipotezin olasılığı.')],
    'Eşik hipotezleri bu site için seçildi; mantık notundaki “kaba-kuvvet MAP” anlatımına (Bölüm 6.3.1) dayanır.')

lab('axislab', 'veri-bilimi/bolum-4.html',
    'Eksen başlangıcı kaydırıcısını 0’dan yukarı çek.',
    'Dört çubuğun yüksekliği değişir; altta son çubuğun ilkinin kaç katı göründüğü yazar.',
    'Veri aynı (96→104, gerçek artış %8). Eksen kırpıldıkça fark çok büyük görünür: grafik izleyiciyi yanıltabilir.',
    [('Eksen başlangıcı', 'Dikey eksenin gösterdiği en küçük değer. 0’dan başlamıyorsa çubuk oranları gerçeği yansıtmaz.')],
    'Sayılar sanal. Uyarı notundaki “ölçek manipülasyonu, eksen kırpma” bölümüne dayanır (Bölüm 4.3.1).')

lab('pcalab', 'veri-bilimi/bolum-4.html',
    'Eksenin açısını kaydır; sonunda “En iyi eksene getir”e bas.',
    'Kırmızı noktalar, mavi noktaların eksene izdüşümüdür. Altta eksenin açıkladığı varyans yüzdesi yazar.',
    'PCA, noktaların en çok yayıldığı yönü (PC1) bulur: izdüşümler birbirinden en uzak kalır, bilgi kaybı en az olur.',
    [('Varyans', 'Noktaların bir eksende ne kadar yayıldığı.'), ('İzdüşüm', 'Bir noktanın eksene dik düşürülmüş karşılığı.'), ('PC1', 'İlk temel bileşen: en büyük varyanslı eksen.')],
    'Veri: sanal 36 nokta. Fikir notundaki Bölüm 4.4.1’e dayanır.')

lab('bayeslab', 'veri-bilimi/bolum-5.html',
    'Bir önsel seç (bilgisiz, “adil”, yanlı). “+1 tura”, “+1 yazı” ya da “+10 atış”la veri ekle.',
    'Kesikli çizgi önsel inancı, kalın çizgi güncellenmiş inancı (ardıl) gösterir. Altta ardıl ortalama ve %95 aralık yazar.',
    'Az veride önsel baskındır (güçlü “adil” önsel kolay oynamaz). Veri çoğaldıkça ardıl veriye yaklaşır; farklı önsellerle başlayanlar birleşir.',
    [('θ', 'Paranın tura gelme olasılığı (bilinmeyen).'), ('Önsel', 'Veriyi görmeden önceki inanç.'), ('Ardıl', 'Veri sonrası inanç: önsel × olabilirlik.'), ('Güvenilir aralık', 'Ardıl olasılığın %95’inin içinde kaldığı aralık.')],
    'Notunda para atışı örneği yoktur; Bayes güncellemesini (Bölüm 5.1.2) göstermek için ders örneği olarak eklendi.')

lab('plab', 'veri-bilimi/bolum-5.html',
    'Atış sayısını (n) ve gelen tura sayısını (k) kaydır.',
    'Grafik, para adilse (H₀) tura sayısının dağılımını gösterir; kırmızı çubuklar gözlenen kadar ya da daha uç sonuçlardır. Altta p-değeri ve karar yazar.',
    'p < 0,05 ise H₀ reddedilir. Aynı oran (%65) küçük örneklemde anlamsız, büyük örneklemde anlamlı çıkar: anlamlılık ≠ önem.',
    [('H₀', 'Sıfır hipotezi: “para adil”, yani etki yok.'), ('p-değeri', 'H₀ doğruyken gözlenen ya da daha uç sonucu bulma olasılığı.'), ('α', 'Reddetme eşiği (burada 0,05).')],
    'Notunda para atışı örneği yoktur; p-değeri ve hipotez testi mantığını (Bölüm 5.2.1) göstermek için ders örneği olarak eklendi.')

lab('rubinlab', 'veri-bilimi/bolum-5.html',
    '“Gönüllü katılım” ve “Seçkisiz atama” arasında geçiş yap; “Yeniden çalıştır”a birkaç kez bas.',
    'Tedavi ve kontrol grubu ortalamaları ve aralarındaki fark yazar. Gerçek etki herkes için +5’tir.',
    'Gönüllü katılımda motivasyonu yüksek olanlar tedaviyi seçer; fark 5’ten çok büyük çıkar (seçim yanlılığı). Seçkisiz atamada fark 5’e yaklaşır.',
    [('Tedavi / kontrol', 'Uygulamayı alan ve almayan grup.'), ('ATE', 'Ortalama tedavi etkisi: E[Y(1) − Y(0)].'), ('Seçim yanlılığı', 'Gruplar baştan farklı olduğu için farkın tedaviden gelmemesi.')],
    'Veri: sanal 600 kişi. Fikir notundaki Rubin modeli ve “atamanın bağımsızlığı” varsayımına dayanır (Bölüm 5.4.1).')

lab('schemalab', 'veri-bilimi/bolum-6.html',
    'Önce “Ambar” ya da “Göl” seç. Sonra “e-posta”, “telefon” gibi alanları açıp kapat.',
    'Üstte ham kayıtlar, altında seçtiğin yaklaşımla okunmuş tablo görünür. Ambarda uymayan kayıtlar elenir, göl hepsini tutar.',
    'Ambar (schema-on-write) düzenli ve hızlıdır ama yeni alan eklemek şema değişikliği ister. Göl (schema-on-read) esnektir, ama her okumada dönüşüm ve temizlik gerekir.',
    [('Şema', 'Verinin hangi alanlardan ve hangi türden oluştuğunun tanımı.'), ('Ham kayıt', 'Yüklenirken hiç dönüştürülmemiş veri.'), ('Reddedilen kayıt', 'Şemaya uymadığı için ambara alınmayan kayıt.')],
    'Veri: sanal 6 kayıt. Kavramlar notundaki Bölüm 6.2.1’e dayanır.')

lab('anonlab', 'veri-bilimi/bolum-6.html',
    'Yaşı genelleştir ve posta kodunu maskele kaydırıcılarını artır.',
    'Tabloda her kişi için “aynı görünen kişi sayısı” yazar. Kırmızı satır, o özelliklerle tek başına kalan, yani kolayca tanınabilen kişidir.',
    'Ad silinse bile yaş ve posta kodu birlikte kişiyi ortaya çıkarabilir. Genelleştirdikçe grup büyür, yeniden tanımlama riski düşer; ama ayrıntı kaybolur.',
    [('Yarı tanımlayıcı', 'Tek başına kimliği vermeyen ama birleşince veren özellik (yaş, posta kodu).'), ('k', 'Aynı özelliklere sahip en küçük grubun kişi sayısı. Ders notunda k’nın adı geçmez; yeniden tanımlama riskini ölçmek için eklenen bir göstergedir.')],
    'Veri: sanal 9 kişi. Fikir, notundaki “anonimleştirme tek başına yeterli değil, küçük nüfuslarda yeniden tanımlama” uyarısına dayanır (Bölüm 6.3.1).')

lab('inhlab', 'yapay-zeka-temelleri/bolum-4.html',
    'Bir kategori ve bir özellik seç (örneğin Penguen + uçar).',
    'Ağaçta kategoriden köke giden yol işaretlenir. Altta cevap ve cevabın hangi kategoriden geldiği yazar.',
    'Özellik üstte bir kez yazılır, alt kategoriler onu kalıtır. En özel kategorideki bilgi kazanır (istisna). Hiçbir yerde yazılmayan özellik “yanlış” değil “bilinmiyor”dur.',
    [('Kalıtım', 'Alt kategorinin üst kategorideki özellikleri devralması.'), ('İstisna', 'Alt kategorinin üstteki bilgiyi bozan kendi bilgisi (Penguen uçmaz).')],
    'Hayvan hiyerarşisi bu site için seçildi. Kategori ve kalıtım fikri notundaki Bölüm 4.3’e dayanır.')

lab('ttlab', 'yapay-zeka-temelleri/bolum-5.html',
    'Dört örnekten birini seç ve tablodaki satırları incele.',
    'Her satır bir dünya durumudur. Mavi satırlar KB’nin doğru olduğu durumlardır; sorgu bunların hepsinde doğruysa çıkarım geçerlidir.',
    'Çıkarım, KB’nin doğru olduğu her satırda sorgu da doğruysa geçerlidir. Son örnekte KB doğruyken sorgu yanlış olduğu bir satır var: çıkarım geçersizdir.',
    [('KB', 'Bilgi tabanı: elindeki cümleler kümesi.'), ('KB ⊨ α', 'KB’nin doğru olduğu her durumda α da doğrudur.'), ('D / Y', 'Doğru / yanlış.')],
    'Notundaki doğruluk tablosu örneği 1. örnektir (P, P ⇒ Q ⊨ Q). Diğer üçü karşılaştırma için eklendi (modus tollens notunda geçmez).')

lab('chainlab', 'yapay-zeka-temelleri/bolum-5.html',
    'Bir hedef seç (ŞemsiyeAl, MontGiy ya da GözlükTak).',
    'Solda ileri zincirleme (tüm sonuçlar), sağda geri zincirleme (yalnızca hedefin kanıtı) adım adım yazar.',
    'İleri zincirleme hedeften bağımsız her sonucu üretir; geri zincirleme yalnızca hedefi destekleyen kurallara bakar. Gerçeklerde olmayan hedef (GözlükTak) hiçbirinde kanıtlanamaz.',
    [('Gerçek', 'Bilgi tabanında doğru kabul edilen bilgi (Yağmur).'), ('Kural', 'A ⇒ B biçiminde bilgi.'), ('Hedef', 'Kanıtlamak istediğin sonuç.')],
    'Örnek, notundaki Yağmur → HavaIslak → ŞemsiyeAl zincirinin genişletilmiş hâlidir (Bölüm 5.1.3.1).')

lab('resolab', 'yapay-zeka-temelleri/bolum-6.html',
    'Bir sorgu seç, “Bir çözümleme adımı”na bas; ya da “Sonuna kadar”.',
    'Tabloda yan bağlaçlar eklenir; her yeni satırın hangi iki satırdan çıktığı yazar. Boş yan bağlaç (□) çıkarsa ispat tamamdır.',
    'Sorguyu ispatlamak için olumsuzunu KB’ye eklersin; çelişki (□) çıkarsa sorgu doğrudur. Çıkmıyorsa KB sorguyu gerektirmez.',
    [('Yan bağlaç', 'Literallerin “veya”sı (¬Yağmur ∨ HavaIslak).'), ('Literal', 'Bir önerme ya da olumsuzu.'), ('□ (boş yan bağlaç)', 'Çelişki işareti.'), ('Çürütme', 'Sonucun olumsuzunu ekleyip çelişki bularak ispatlama.')],
    'Çürütme yöntemi notundaki Bölüm 6.1.4’e dayanır. Şemsiye kuralları, önceki bölümlerle bağ kurmak için seçildi.')

lab('nblab', 'yapay-zeka-temelleri/bolum-6.html',
    'Önsel kaydırıcısını ayarla; e-postada geçen kelimelere (bedava, kredi, toplantı, rapor) tıkla.',
    'Seçtiğin kelimelerin olasılıkları tabloya girer; altta iki sınıfın skoru ve P(spam | kelimeler) yazar.',
    'Naive Bayes her kelimeyi bağımsız sayıp olasılıkları çarpar ve büyük skoru seçer. Önsel ve her kelime kararı çevirebilir.',
    [('Önsel P(spam)', 'Kelimelere bakmadan önce bir e-postanın spam olma oranı.'), ('P(kelime | sınıf)', 'O sınıfta kelimenin geçme olasılığı.'), ('Naif varsayım', 'Kelimeler sınıf verilince birbirinden bağımsızdır.')],
    'Kelime örnekleri notundaki spam örneğinden (kredi, şimdi kazan, bedava). Olasılık sayıları sanaldır.')


def frame_html(i):
    f, yap, gor, anla, terms, kaynak = L[i]
    dl = ''.join('<dt>%s</dt><dd>%s</dd>' % (t, d) for t, d in terms)
    return ('<div class="lab-frame">\n'
            '      <b>Bu laboratuvarda</b>\n'
            '      <ul>\n'
            '        <li><b>Ne yapacaksın:</b> %s</li>\n'
            '        <li><b>Ne göreceksin:</b> %s</li>\n'
            '        <li><b>Ne anlamalısın:</b> %s</li>\n'
            '      </ul>\n'
            '      <details><summary>Terimler</summary><dl>%s</dl></details>\n'
            '      <p class="lab-src">%s</p>\n'
            '    </div>\n    ') % (yap, gor, anla, dl, kaynak)

if __name__ == '__main__':
    done = 0
    for i, v in L.items():
        p = os.path.join(ROOT, v[0].replace('/', os.sep))
        s = rd(p)
        a = '<div class="lab" id="%s">' % i
        assert s.count(a) == 1, (i, s.count(a))
        if 'class="lab-frame"' in s[max(0, s.index(a) - 1500):s.index(a)]:
            continue
        s = s.replace(a, frame_html(i) + a)
        wr(p, s); done += 1
    print('çerçeve eklendi:', done, '/', len(L))
