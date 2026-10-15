/* Kampüs haritası: yurttan sınav salonuna yürüyüş. Ağırlıklar dakikadır.
   Harita bu proje için uydurulmuştur; gerçek bir yeri göstermez. */
(function (root) {
  var g = {
    scale: 40, start: 'S', goal: 'G',
    nodes: {
      S: { x: 60,  y: 210, name: 'Yurt' },
      A: { x: 210, y: 90,  name: 'Yemekhane' },
      B: { x: 210, y: 210, name: 'Kütüphane' },
      C: { x: 210, y: 330, name: 'Otopark' },
      D: { x: 380, y: 90,  name: 'Mühendislik' },
      E: { x: 380, y: 210, name: 'Spor Salonu' },
      F: { x: 380, y: 330, name: 'Kantin' },
      H: { x: 540, y: 150, name: 'Rektörlük' },
      G: { x: 670, y: 210, name: 'Sınav Salonu' }
    },
    edges: [
      ['S','A',6],['S','B',4],['S','C',5],['A','B',3],['B','C',4],
      ['A','D',5],['B','E',5],['C','F',5],['D','E',3],['E','F',3],
      ['D','H',5],['E','H',8],['E','G',14],['F','G',8],['H','G',12]
    ]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = g; else root.KampusGraf = g;
})(typeof window !== 'undefined' ? window : this);
