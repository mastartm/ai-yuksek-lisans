# Her bölümün başına özgün "Büyük resim" şeması ekler (tekrar çalıştırılırsa atlar).
import io

NL = chr(10)
CL = ['d-brand', 'd-ok', 'd-warn', 'd-box', 'd-bad']


def lines(x, t, y0, cls, lh=16):
    return ''.join('<text class="%s d-c" x="%s" y="%d">%s</text>' % (cls, x, y0 + i * lh, l) for i, l in enumerate(t.split(NL)))


def flow(items):
    n = len(items)
    gap = 34
    w = (720 - (n - 1) * gap) / n
    o = ''
    for i, (t, s) in enumerate(items):
        x = 20 + i * (w + gap)
        cx = x + w / 2
        o += '<rect class="%s" x="%.0f" y="55" width="%.0f" height="116" rx="12"/>' % (CL[i % 5], x, w)
        o += '<circle class="d-plain" cx="%.0f" cy="46" r="13"/><text class="d-txt d-c" x="%.0f" y="51">%d</text>' % (cx, cx, i + 1)
        o += lines('%.0f' % cx, t, 92, 'd-txt') + lines('%.0f' % cx, s, 92 + 16 * (t.count(NL) + 1) + 6, 'd-sm', 14)
        if i < n - 1:
            ax = x + w + 4
            o += '<path class="d-line-brand" d="M%.0f 105 L%.0f 105"/><path class="d-line-brand" d="M%.0f 99 L%.0f 105 L%.0f 111"/>' % (ax, ax + gap - 8, ax + gap - 14, ax + gap - 8, ax + gap - 14)
    return 215, o


def hub(center, sats):
    pos = [(130, 48), (630, 48), (130, 192), (630, 192)]
    o = ''
    for (x, y) in pos:
        o += '<path class="d-dash" d="M380 120 L%d %d"/>' % (x, y)
    for i, ((t, s), (x, y)) in enumerate(zip(sats, pos)):
        o += '<rect class="%s" x="%d" y="%d" width="220" height="68" rx="12"/>' % (CL[i % 5], x - 110, y - 34)
        o += lines(x, t, y - 6, 'd-txt') + lines(x, s, y + 12 + 16 * t.count(NL), 'd-sm', 14)
    o += '<ellipse class="d-plain" cx="380" cy="120" rx="95" ry="38" style="stroke:var(--brand);stroke-width:3"/>'
    o += lines(380, center, 126, 'd-txt d-big')
    return 240, o


def steps(items):
    o = ''
    n = len(items)
    w = 720 / n
    for i, (t, s) in enumerate(items):
        h = 50 + i * 38
        x = 20 + i * w
        y = 215 - h
        o += '<rect class="%s" x="%.0f" y="%d" width="%.0f" height="%d" rx="8"/>' % (CL[i % 5], x, y, w - 10, h)
        cx = x + (w - 10) / 2
        o += lines('%.0f' % cx, t, y + 22, 'd-txt') + lines('%.0f' % cx, s, y + 22 + 16 * (t.count(NL) + 1) + 2, 'd-sm', 14)
    o += '<path class="d-line-brand" d="M30 25 L740 25"/><path class="d-line-brand" d="M732 19 L740 25 L732 31"/>'
    o += '<text class="d-sm" x="30" y="16">kontrol ve neden-sonuç gücü artar</text>'
    return 235, o


def L(*a):
    return NL.join(a)


SPEC = {
    'yapay-zeka-temelleri/bolum-1': ('Tanım ve dört bakış, alt alanlar, ajan çerçevesi', hub('Yapay zekâ', [
        ('Dört tanım', L('düşünme/davranma ×', 'insan/akılcı')), ('Turing Testi', L('makine insandan', 'ayırt edilir mi?')),
        ('Alt alanlar', 'öğrenme, görü, dil'), ('Ajan + PEAS', L('algıla → karar ver', '→ harekete geç'))])),
    'yapay-zeka-temelleri/bolum-2': ('Bir problemi arama problemine çevirme adımları', flow([
        (L('Durumu', 'tanımla'), 'şu an neredeyiz?'), (L('Hedefi', 'belirle'), L('nereye varmak', 'istiyoruz?')),
        (L('Aksiyonları', 'say'), L('hangi hamleler', 'mümkün?')), (L('Strateji', 'seç'), L('kör ya da', 'sezgisel')),
        (L('Çözüm', 'yolu'), L('maliyeti', 'ölç'))])),
    'makine-ogrenmesi/bolum-1': ('Öğrenme döngüsü: deneyimden performansa', flow([
        (L('Deneyim', '(E)'), 'örnek veriler'), (L('Öğrenme', 'algoritması'), 'hipotez arar'),
        (L('Model', '(hipotez)'), L('öğrenilen', 'fonksiyon')), (L('Görev (T)', 'üzerinde'), 'tahmin yap'),
        (L('Performans', '(P)'), L('ölç, geri', 'bildirim ver'))])),
    'makine-ogrenmesi/bolum-2': ('Örneklerle hipotez uzayını daraltma', flow([
        (L('Eğitim', 'örnekleri'), L('pozitif ve', 'negatif')), (L('Hipotez', 'uzayı'), L('tüm olası', 'kurallar')),
        (L('Tutarsızları', 'ele'), L('örnekle', 'çelişen gider')), (L('Sürüm', 'uzayı'), L('kalan', 'hipotezler')),
        ('Kavram', L('yeterli örnekte', 'tek kural'))])),
    'makine-ogrenmesi/bolum-3': ('Karar ağacını adım adım büyütme', flow([
        (L('Tüm', 'veri'), L('karışık', 'sınıflar')), (L('En iyi', 'özniteliği seç'), L('bilgi kazancı', 'en yüksek')),
        (L('Veriyi', 'böl'), L('her değere', 'bir dal')), (L('Alt kümede', 'tekrarla'), L('saflaşana', 'kadar')),
        ('Yapraklar', 'sınıf kararı')])),
    'goruntu-isleme/bolum-1': ('Işıktan piksel matrisine, oradan yoruma', flow([
        ('Işık', L('sahneden', 'gelen enerji')), ('Edinim', L('kamera /', 'sensör')),
        (L('Örnekleme', '+ nicemleme'), L('konumu ve', 'parlaklığı', 'ayrıklaştır')),
        (L('Piksel', 'matrisi'), L('sayılardan', 'oluşan görüntü')), ('İşleme', L('iyileştir,', 'çözümle,', 'yorumla'))])),
    'goruntu-isleme/bolum-2': ('Histogram: görüntünün parlaklık özeti', hub('Histogram', [
        ('Parlaklık dağılımı', L('hangi gri değerden', 'kaç piksel var?')), ('Kontrast', L('dağılım ne kadar', 'geniş?')),
        ('Eşikleme', L('iki gruba ayır:', 'arka plan / nesne')), ('Eşitleme', L('dağılımı yay,', 'detayı çıkar'))])),
    'goruntu-isleme/bolum-3': ('Her piksel kendi başına dönüşür: s = T(r)', hub('s = T(r)', [
        ('Parlaklık', L('tüm değerlere', 'sabit ekle')), ('Kontrast', L('değerleri', 'gerip yay')),
        ('Negatif', 'ışığı ters çevir'), ('Eşik / eğri', L('gamma, log,', 'ikili görüntü'))])),
    'veri-bilimi/bolum-1': ('Dört kavram: kara kutu, çeviklik, Beş V, veri kalitesi', hub('Veri bilimi', [
        ('Kara kutu ve XAI', L('model neden', 'böyle dedi?')), ('Çevik çalışma', 'Scrum ve Kanban'),
        ('Büyük veri (Beş V)', L('hacim, hız,', 'çeşit...')), ('Veri kalitesi', L('doğru, eksiksiz,', 'tutarlı mı?'))])),
    'veri-bilimi/bolum-2': ('Veri bilimi hangi bilgi anlayışlarının kesişiminde?', hub('Veri nedir?', [
        ('Pozitivist', L('veri gerçeği', 'olduğu gibi yansıtır')), ('Yorumlayıcı', L('veri, toplayanın', 'bakışıyla şekillenir')),
        ('Ham veri miti', L('“ham” veri', 'yoktur')), ('Üç ortak payda', L('istatistik + bilgisayar', '+ alan bilgisi'))])),
    'veri-bilimi/bolum-3': ('Toplamadan etiğe: verinin yolculuğu', flow([
        (L('Yöntemi', 'seç'), L('nicel, nitel', 'ya da karma')), (L('Eksik', 'veriyi çöz'), L('MCAR, MAR,', 'MNAR')),
        (L('Belirsizliği', 'modelle'), L('Bayes ile', 'güncelle')), (L('Varsayımı', 'sına'), L('duyarlılık', 'analizi')),
        (L('Etik', 'sınır'), L('epistemik', 'adalet'))])),
    'arastirma-yontemleri/bolum-1': ('Bilgiden araştırmaya: bilimin iskeleti', flow([
        (L('Bilmenin', 'yolları'), L('gelenek, otorite,', 'deney')), (L('Bilimsel', 'yöntem'), L('sistematik', 've denetlenebilir')),
        (L('Araştırma', 'türü'), L('amaca göre', 'sınıflandır')), (L('Süreç', 'adımları'), L('problemden', 'rapora')),
        (L('Bilimsel', 'etik'), L('her adımda', 'geçerli'))])),
    'arastirma-yontemleri/bolum-2': ('Fikirden test edilebilir hipoteze', flow([
        (L('Fikir', 'kaynağı'), L('gözlem, kuram,', 'boşluk')), (L('Problem', 'cümlesi'), L('açık ve', 'cevaplanabilir')),
        (L('Literatür', 'taraması'), L('başkaları ne', 'bulmuş?')), ('Değişkenler', L('neyi ölçüp', 'neyi değiştirirsin?')),
        ('Hipotez', L('sınanabilir', 'iddia'))])),
    'arastirma-yontemleri/bolum-3': ('Nicel araştırma türleri: kontrol arttıkça neden-sonuç netleşir', steps([
        ('Tarama', 'durum nedir?'), ('Korelasyon', 'ilişki var mı?'),
        (L('Nedensel', 'karşılaştırma'), 'fark nereden?'), ('Deneysel', 'müdahale et')])),
    'yapay-zeka-temelleri/bolum-3': ('Arama algoritmaları: kör yöntemlerden rakipli oyunlara', flow([
        (L('Arama', 'problemi'), L('durum, aksiyon,', 'hedef')), (L('Ağaç ve', 'sınır'), L('neresi', 'keşfedilecek?')),
        ('Kör arama', L('BFS, DFS:', 'sezgi yok')), (L('Sezgisel', '(A*)'), L('hedefe yakınlığı', 'tahmin et')),
        (L('Rakipli', 'arama'), L('minimax:', 'rakip de oynar'))])),
}


def box(key):
    cap, (h, body) = SPEC[key]
    return ('<section class="slide" data-title="Büyük resim">' + NL +
            '  <div class="panel">' + NL +
            '    <div class="kicker">Büyük resim</div>' + NL +
            '    <h2>%s</h2>' % cap + NL +
            '    <svg class="diagram" viewBox="0 0 760 %d" role="img" aria-label="%s">%s</svg>' % (h, cap, body) + NL +
            '    <p>Bu şema bölümün haritasıdır: sonraki slaytların her biri bu kutulardan birini açar. Kaybolursan buraya dön.</p>' + NL +
            '  </div>' + NL +
            '</section>')


for key in SPEC:
    course, b = key.split('/')
    path = '%s/%s.html' % (course, b) if key == 'yapay-zeka-temelleri/bolum-3' else 'content/%s.html' % key
    s = io.open(path, encoding='utf-8').read()
    if 'data-title="Büyük resim"' in s:
        a = s.index('<section class="slide" data-title="Büyük resim">')
        e = s.index('</section>', a) + len('</section>')
        s = s[:a].rstrip() + s[e:]
    i = s.index('</section>') + len('</section>')
    s = s[:i] + NL + NL + box(key) + s[i:]
    io.open(path, 'w', encoding='utf-8').write(s)
    print('eklendi', key)
