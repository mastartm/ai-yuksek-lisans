/* Dar ekranda geniş SVG çizimleri okunur boyutta tutmak için kaydırılabilir kapsayıcıya sarar. */
(function () {
  'use strict';
  var targets = document.querySelectorAll('svg.diagram, .graphlab > svg, #mmlab > svg');
  Array.prototype.forEach.call(targets, function (svg) {
    var wrap = document.createElement('div');
    wrap.className = 'svgscroll';
    svg.parentNode.insertBefore(wrap, svg);
    wrap.appendChild(svg);
    var hint = document.createElement('div');
    hint.className = 'swipehint';
    hint.textContent = 'Çizimi yana kaydırabilirsin →';
    wrap.parentNode.insertBefore(hint, wrap.nextSibling);
  });

  /* Geniş tablolar: panelden taşmasın, yana kaydırılabilsin */
  Array.prototype.forEach.call(document.querySelectorAll('table.cmp'), function (t) {
    if (t.parentNode.classList.contains('tblscroll')) return;
    var wrap = document.createElement('div');
    wrap.className = 'tblscroll';
    t.parentNode.insertBefore(wrap, t);
    wrap.appendChild(t);
    var hint = document.createElement('div');
    hint.className = 'swipehint';
    hint.textContent = 'Tabloyu yana kaydırabilirsin →';
    wrap.parentNode.insertBefore(hint, wrap.nextSibling);
  });
})();
