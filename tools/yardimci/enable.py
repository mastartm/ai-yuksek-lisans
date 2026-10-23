# -*- coding: utf-8 -*-
import re, sys, io
p = r'C:\Users\user\Desktop\Projeler\ai-yuksek-lisans\assets\js\chapters.js'
s = io.open(p, encoding='utf-8', newline='').read().replace('\r\n', '\n')
slug = sys.argv[1]
i = s.index("slug: '%s'" % slug); j = s.index('] }', i)
blk = s[i:j]
for n in sys.argv[2:]:
    blk, c = re.subn(r"\[%s, ('[^']*'), 0\]" % n, r"[%s, \1, 1]" % n, blk)
    print(slug, n, 'açıldı' if c else 'BULUNAMADI/zaten açık')
io.open(p, 'w', encoding='utf-8', newline='\n').write(s[:i] + blk + s[j:])
