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
})();
