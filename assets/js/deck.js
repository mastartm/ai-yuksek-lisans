/* Slayt motoru: ok tuşları, kaydırma, içindekiler, ilerleme çubuğu, tema. */
(function () {
  'use strict';
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  if (!slides.length) return;
  var cur = 0;
  var bar = document.querySelector('.progress > i');
  var count = document.getElementById('count');
  var prev = document.getElementById('prev');
  var next = document.getElementById('next');
  var toc = document.getElementById('toc');
  var tocList = document.getElementById('toc-list');

  function safe(fn) { try { return fn(); } catch (e) { return null; } }

  /* İçindekiler: her slaytın data-title değerinden */
  slides.forEach(function (s, i) {
    var li = document.createElement('li');
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = s.getAttribute('data-title') || ('Slayt ' + (i + 1));
    b.addEventListener('click', function () { go(i); toc.classList.remove('open'); });
    li.appendChild(b);
    tocList.appendChild(li);
  });

  function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    slides[cur].classList.remove('active');
    cur = i;
    slides[cur].classList.add('active');
    count.textContent = (cur + 1) + ' / ' + slides.length;
    bar.style.width = ((cur + 1) / slides.length * 100) + '%';
    prev.disabled = cur === 0;
    next.disabled = cur === slides.length - 1;
    Array.prototype.forEach.call(tocList.children, function (li, k) { li.classList.toggle('cur', k === cur); });
    safe(function () { history.replaceState(null, '', '#' + (cur + 1)); });
    window.scrollTo(0, 0);
    document.dispatchEvent(new CustomEvent('slidechange', { detail: { index: cur, el: slides[cur] } }));
  }

  prev.addEventListener('click', function () { go(cur - 1); });
  next.addEventListener('click', function () { go(cur + 1); });
  document.getElementById('toc-open').addEventListener('click', function () { toc.classList.toggle('open'); });
  document.getElementById('toc-close').addEventListener('click', function () { toc.classList.remove('open'); });

  document.addEventListener('keydown', function (e) {
    var t = e.target && e.target.tagName;
    if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { go(cur + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { go(cur - 1); }
    else if (e.key === 'Escape') { toc.classList.remove('open'); }
  });

  /* Dokunmatik kaydırma: yatay jest, dikey kaydırmayı bozmaz */
  var sx = 0, sy = 0;
  document.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 2) {
      if (e.target.closest && e.target.closest('svg, .scroll-x, input')) return;
      go(cur + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  /* Tema */
  var themeBtn = document.getElementById('theme');
  function applyTheme(t) { if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme'); }
  applyTheme(safe(function () { return localStorage.getItem('theme'); }));
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    var t = dark ? 'light' : 'dark';
    applyTheme(t);
    safe(function () { localStorage.setItem('theme', t); });
  });

  window.addEventListener('hashchange', function () {
    var n = parseInt((location.hash || '').replace('#', ''), 10);
    if (!isNaN(n) && n - 1 !== cur) go(n - 1);
  });

  var start = parseInt((location.hash || '').replace('#', ''), 10);
  go(isNaN(start) ? 0 : start - 1);
  window.Deck = { go: go, current: function () { return cur; } };
})();
