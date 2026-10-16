"""content/<ders>/bolum-N.html parçalarını tam sayfalara çevirir.
Kullanım: python tools/build.py            (hepsini)
          python tools/build.py content/yapay-zeka-temelleri/bolum-1.html
Parçanın başındaki <!-- ... --> bloğu anahtar: değer satırları içerir."""
import re, sys, glob, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = '''<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — {course_title}</title>
<meta name="description" content="{course_title}, Bölüm {no}: {title}. Görsel anlatım, etkileşimli çizimler ve bölüm sonu quizi.">
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>

<header class="topbar">
  <a class="back home" href="../index.html" aria-label="Ana sayfa" title="Ana sayfa"><svg class="hico" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 10.5V20h4.5v-5.5h4V20h4.5v-9.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="ht">Ana sayfa</span></a>
  <a class="back" href="index.html">← Bölümler</a>
  <span class="title">Bölüm {no} · {title}</span>
  <button class="btn" id="toc-open" type="button">İçindekiler</button>
  <button class="btn" id="theme" type="button" aria-label="Açık/koyu tema">◐</button>
</header>
<div class="progress"><i></i></div>

<aside class="toc" id="toc" aria-label="İçindekiler">
  <button class="btn" id="toc-close" type="button" style="float:right">Kapat</button>
  <h3>İçindekiler</h3>
  <ol id="toc-list"></ol>
</aside>

<main class="deck">
{body}
<section class="slide" data-title="Quiz">
  <div class="panel">
    <div class="kicker">Bölüm sonu</div>
    <div id="quiz" data-quiz="{quiz}"></div>
  </div>
</section>

</main>

<nav class="deck-nav" aria-label="Slayt gezintisi">
  <button class="btn" id="prev" type="button">← Önceki</button>
  <span class="count" id="count" aria-live="polite"></span>
  <button class="btn primary" id="next" type="button">Sonraki →</button>
</nav>

<script src="../assets/data/{quiz_file}"></script>
{extra_data}<script src="../assets/js/deck.js"></script>
{extra_js}<script src="../assets/js/quiz.js"></script>
<script src="../assets/js/responsive.js"></script>
</body>
</html>
'''

def build(path):
    src = open(path, encoding='utf-8').read()
    m = re.match(r'\s*<!--(.*?)-->\s*', src, re.S)
    meta = dict(l.split(':', 1) for l in m.group(1).strip().splitlines() if ':' in l)
    meta = {k.strip(): v.strip() for k, v in meta.items()}
    body = src[m.end():].rstrip() + '\n'
    data = [s for s in meta.get('data', '').split() if s]
    js = [s for s in meta.get('scripts', '').split() if s]
    meta['extra_data'] = ''.join('<script src="../assets/data/%s"></script>\n' % s for s in data)
    meta['extra_js'] = ''.join('<script src="../assets/js/%s"></script>\n' % s for s in js)
    meta['body'] = body
    out = os.path.join(ROOT, meta['course'], 'bolum-%s.html' % meta['no'])
    open(out, 'w', encoding='utf-8').write(PAGE.format(**meta))
    print('yazıldı:', os.path.relpath(out, ROOT))

targets = sys.argv[1:] or sorted(glob.glob(os.path.join(ROOT, 'content', '*', 'bolum-*.html')))
for t in targets:
    build(t)
