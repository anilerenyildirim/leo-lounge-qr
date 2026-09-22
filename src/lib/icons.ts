/* ============================================================
   BARDAK İKONLARI — fotoğrafı olmayan içecek kartlarının sağ yarısı.

   İKİ KAYNAK, TEK ÇİZGİ KALINLIĞI:
   · Phosphor Icons, "thin" ağırlık — setin karşılığı olan bardaklar
     (martini, şarap, bira, ...). Path'ler setin kendisinden, değişmedi.
   · Elle çizilenler: önce müşterinin referansından (missingicons.png)
     tumbler, highball (rakı), shot, cordial; sonra 22 Eylül
     revizyonundakiler (aşağıda). Phosphor'da karşılıkları YOK. Aynı 256'lık ızgarada, Phosphor
     thin'in çizgi kalınlığıyla (8 birim) çizildi ki yan yana durunca
     aynı elden çıkmış görünsünler.

   Renk CSS'ten gelir (currentColor), SVG'de sabit renk yok.

   22 EYLÜL REVİZYONU (müşteri isteği) — elle çizilenlere eklenenler:
   · İmza Kokteyller → cocktail-olive (zeytinli kürdan)
   · Kokteyller      → cocktail (köşeye saplı yarım limon)
   · Şaraplar        → wine-glass (uzun saplı kadeh)
   · Vodkalar        → vodka (ince uzun, buzlu)
   · Likörler        → liqueur (ince uzun, daralan)
   · 6'lı Shotlar    → shots-clink (tokuşan iki shot)
   · Viski Şişeler   → ice-bucket (buz kovasında şişe)
   · Cinler, Romlar  → tumbler (Viskiler ile aynı)
   Eski Phosphor ikonları (martini, wine, pint-glass, beer-bottle,
   cheers, brandy) ve cordial müşteri onayı gelene kadar duruyor —
   geri dönmek tek satır. Onaydan sonra silinebilir.

   ------------------------------------------------------------
   Phosphor Icons — MIT License
   Copyright (c) 2023 Phosphor Icons

   Permission is hereby granted, free of charge, to any person obtaining
   a copy of this software and associated documentation files (the
   "Software"), to deal in the Software without restriction, including
   without limitation the rights to use, copy, modify, merge, publish,
   distribute, sublicense, and/or sell copies of the Software, and to
   permit persons to whom the Software is furnished to do so, subject to
   the following conditions:

   The above copyright notice and this permission notice shall be
   included in all copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
   MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
   LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
   OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
   WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
   ============================================================ */

/** Phosphor thin — dolgu path'i (setin kendi çizimi). */
const PHOSPHOR = {
  martini:
    'M234.83,42.83A4,4,0,0,0,232,36H24a4,4,0,0,0-2.83,6.83L124,145.66V212H88a4,4,0,0,0,0,8h80a4,4,0,0,0,0-8H132V145.66ZM33.66,44H222.34l-24,24H57.66ZM128,138.34,65.66,76H190.34Z',
  wine:
    'M201.5,104.8,179.72,30.87A4,4,0,0,0,175.89,28H80.11a4,4,0,0,0-3.83,2.87L54.5,104.8a59.51,59.51,0,0,0,16.32,60.62A83.39,83.39,0,0,0,124,187.91V236H88a4,4,0,1,0,0,8h80a4,4,0,1,0,0-8H132V187.91a83.39,83.39,0,0,0,53.18-22.49A59.51,59.51,0,0,0,201.5,104.8ZM83.1,36h89.8l20.93,71.06c.43,1.49.8,3,1.1,4.47-23.64,10.47-50.76.18-65.12-7.1-28.22-14.290-49.48-14.1-63.88-10.14Zm96.62,123.57a75.68,75.68,0,0,1-103.44,0,51.53,51.53,0,0,1-14.11-52.51l1-3.46c12.66-4.87,33.45-7,63,8C137,117,154.33,124,172.8,124A62.78,62.78,0,0,0,196,119.78,51.26,51.26,0,0,1,179.72,159.57Z',
  'beer-stein':
    'M216,92H196V72a36,36,0,0,0-36-36H147.31C136,25.81,120.34,20,104,20,70.92,20,44,43.33,44,72V208a12,12,0,0,0,12,12H184a12,12,0,0,0,12-12V196h20a20,20,0,0,0,20-20V112A20,20,0,0,0,216,92ZM104,28c14.89,0,29.09,5.43,39,14.89A4,4,0,0,0,145.74,44H160a28,28,0,0,1,27.710,24H52.22C54.62,45.61,76.92,28,104,28Zm84,180a4,4,0,0,1-4,4H56a4,4,0,0,1-4-4V76H188Zm40-32a12,12,0,0,1-12,12H196V100h20a12,12,0,0,1,12,12ZM100,104v80a4,4,0,0,1-8,0V104a4,4,0,0,1,8,0Zm48,0v80a4,4,0,0,1-8,0V104a4,4,0,0,1,8,0Z',
  'beer-bottle':
    'M242.83,45.17l-32-32a4,4,0,0,0-5.66,5.66l4.74,4.74L150.33,68.26l-39.11,7.82a4,4,0,0,0-2,1.09L25.86,160.49a20,20,0,0,0,0,28.28l41.37,41.37a20,20,0,0,0,28.28,0l83.32-83.31a4,4,0,0,0,1.09-2.05l7.82-39.11,44.69-59.58,4.74,4.74a4,4,0,1,0,5.66-5.66Zm-153,179.31a12,12,0,0,1-17,0L31.51,183.11a12,12,0,0,1,0-17L40,157.66,98.34,216ZM104,210.34,45.66,152,96,101.66,154.34,160ZM180.8,101.6a3.89,3.89,0,0,0-.72,1.62L172.32,142,160,154.34,101.66,96,114,83.68l38.81-7.76a3.89,3.89,0,0,0,1.62-.72l61.22-45.92,11.1,11.1Z',
  'pint-glass':
    'M203,29.35A4,4,0,0,0,200,28H56a4,4,0,0,0-4,4.48l23.15,193A12,12,0,0,0,87.1,236h81.8a12,12,0,0,0,11.92-10.57L204,32.48A4,4,0,0,0,203,29.35ZM195.49,36l-3.84,32H64.35L60.51,36ZM172.87,224.48a4,4,0,0,1-4,3.52H87.1a4,4,0,0,1-4-3.52L65.31,76H190.69Z',
  brandy:
    'M220,88h0a91.67,91.67,0,0,0-14.88-50.18A4,4,0,0,0,201.77,36H54.23a4,4,0,0,0-3.35,1.82A91.67,91.67,0,0,0,36,88h0a92.11,92.11,0,0,0,88,91.91V220H88a4,4,0,0,0,0,8h80a4,4,0,0,0,0-8H132V179.91A92.11,92.11,0,0,0,220,88ZM56.43,44H199.57a83.5,83.5,0,0,1,12.32,40H44.11A83.5,83.5,0,0,1,56.43,44ZM128,172A84.1,84.1,0,0,1,44.1,92H211.9A84.1,84.1,0,0,1,128,172Z',
  cheers:
    'M215,217.8l-21.5,5.77-12.35-46.06a36.06,36.06,0,0,0,21.66-42.84c-12.45-46.43-38.31-87.12-39.4-88.83A4,4,0,0,0,159,44.12l-26.94,6.73c.23-11.53-.09-18.840-.09-19a4,4,0,0,0-3-3.7l-32-8a4,4,0,0,0-4.34,1.72c-1.09,1.71-26.95,42.4-39.4,88.83a36.06,36.06,0,0,0,21.66,42.84L62.54,199.57,41,193.8A4,4,0,0,0,39,201.53l48,12.86a3.77,3.77,0,0,0,1,.14,4,4,0,0,0,1-7.86l-18.77-5,12.35-46.07a35.8,35.8,0,0,0,40.18-26.34c1.2-4.92,2.25-9.87,3.17-14.81a275.26,275.26,0,0,0,7.250,38.89A36.06,36.06,0,0,0,168,180a35,35,0,0,0,5.38-.43l12.35,46.07-18.77,5a4,4,0,0,0,1,7.86,3.77,3.77,0,0,0,1-.14l48-12.86A4,4,0,0,0,215,217.8ZM158.13,52.59c2.79,4.6,9.11,15.4,16.07,29.74l-42,10.5c-.81-14.58-.61-26.31-.4-32.28,0-.47,0-.93,0-1.39Zm-60.26-24,26.23,6.56c.09,4,.17,11.77-.17,21.87-.06,1.18-.15,3.09-.22,5.63s-.27,5.26-.45,8L80.94,60.11C88.24,44.88,95,33.38,97.87,28.59ZM80.76,147A28,28,0,0,1,61,112.750,299.88,299.88,0,0,1,77.5,67.5l45.14,11.28a320.22,320.22,0,0,1-7.59,48.46A28,28,0,0,1,80.76,147Zm60.19,4.2a282.84,282.84,0,0,1-8.2-50.3L177.68,89.7A302.43,302.43,0,0,1,195,136.75,28,28,0,0,1,141,151.24ZM188.42,41.79a4,4,0,0,1,1.79-5.37l16-8a4,4,0,1,1,3.58,7.16l-16,8a4,4,0,0,1-5.37-1.79ZM228,72a4,4,0,0,1-4,4H208a4,4,0,0,1,0-8h16A4,4,0,0,1,228,72ZM36.42,22.21a4,4,0,0,1,5.370-1.79l16,8a4,4,0,0,1-3.58,7.16l-16-8A4,4,0,0,1,36.42,22.21ZM40,68H24a4,4,0,0,1,0-8H40a4,4,0,0,1,0,8Z',
  'orange-slice':
    'M248,84H8a4,4,0,0,0-4,4,124,124,0,0,0,248,0A4,4,0,0,0,248,84ZM71.53,150.13,124,97.66V171.9A83.67,83.67,0,0,1,71.53,150.13Zm-5.66-5.66A83.67,83.67,0,0,1,44.1,92h74.24ZM132,97.66l52.47,52.47A83.67,83.67,0,0,1,132,171.9Zm58.130,46.81L137.66,92H211.9A83.67,83.67,0,0,1,190.13,144.47ZM128,204A116.14,116.14,0,0,1,12.07,92h24a92,92,0,0,0,183.82,0h24A116.14,116.14,0,0,1,128,204Z',
} as const;

/** Tokuşan shotların tek bardağı; orijin taban ortası, ağız y=-100. */
const SHOT_LOCAL =
  '<ellipse cx="0" cy="-100" rx="32" ry="7"/>' +
  '<path d="M-32 -100 L-21 0 M32 -100 L21 0"/>' +
  '<path d="M-21 0 A21 5 0 0 0 21 0"/>' +
  '<path d="M-23 -18 A23 5 0 0 0 23 -18"/>';

/** Damla: sivri ucu yukarıda, (x,y) gövdenin ortası. */
const drop = (x: number, y: number): string =>
  `<path d="M${x} ${y - 12} C${x + 8} ${y - 1} ${x + 7} ${y + 8} ${x} ${y + 8} C${x - 7} ${y + 8} ${x - 8} ${y - 1} ${x} ${y - 12} Z"/>`;

/** Çizgi martini kadehi — iki kokteyl ikonunun ortak gövdesi. */
const MARTINI =
  '<path d="M60 72 H196"/>' +
  '<path d="M128 140 V214 M88 216 H168"/>';

/* Limon: YARIM DİLİM, kadehin sağ köşesine saplı. Düz kenarı köşeye
   dik (köşenin açıortayına, -22.5°), kavisi dışarı bakıyor; kadehin
   ağzı ve duvarı dilimin düz kenarında bitiyor — cam dilimin yarığına
   girmiş görünüyor. Tam daire "tekerlek" gibi okunuyordu (22 Eylül).
   Merkez (222.5,42.3), r 30; kabuk çizgisi r 22; iki dilim çizgisi. */
const LEMON =
  '<path d="M28 40 H221.5 M28 40 L128 140 L223.4 44.6"/>' +
  '<path d="M211 14.6 A30 30 0 0 1 234 70 Z"/>' +
  '<path d="M214.1 22 A22 22 0 0 1 230.9 62.6"/>' +
  '<path d="M222.5 42.3 L244.3 45.2 M222.5 42.3 L235.9 24.9"/>';

/** Kadehin ağzı ve duvarı, garnitürsüz. */
const RIM = '<path d="M28 40 H228 L128 140 Z"/>';

/* Zeytinli kürdan: ağzın üstünden sıvıya çapraz iniyor; tepede boncuk,
   zeytinde kırmızıbiber deliği. */
const OLIVE =
  '<circle cx="80" cy="10" r="6"/>' +
  '<path d="M84 16 L140 106"/>' +
  '<ellipse cx="129" cy="88" rx="21" ry="15" transform="rotate(58 129 88)"/>' +
  '<circle cx="129" cy="88" r="5"/>';

/**
 * Müşterinin referansından çizilenler — ÇİZGİ (stroke) olarak.
 * Kalınlık iconSvg()'de tek yerden veriliyor: 8 birim = Phosphor thin.
 */
const CUSTOM = {
  /* Viski bardağı: geniş, kısa, hafif daralan; iki buz küpü. */
  tumbler:
    '<ellipse cx="128" cy="76" rx="64" ry="12"/>' +
    '<path d="M64 76 L72 200 M192 76 L184 200"/>' +
    '<path d="M72 200 A56 10 0 0 0 184 200"/>' +
    '<path d="M71 184 A57 9 0 0 0 185 184"/>' +
    '<path d="M67 124 A61 11 0 0 0 189 124"/>' +
    '<rect x="136" y="116" width="36" height="36" rx="5" transform="rotate(18 154 134)"/>' +
    '<rect x="100" y="134" width="30" height="30" rx="5" transform="rotate(-14 115 149)"/>',

  /* Rakı bardağı: uzun, düz; dalgalı yüzey, tek buz. */
  highball:
    '<ellipse cx="128" cy="40" rx="38" ry="8"/>' +
    '<path d="M90 40 V206 M166 40 V206"/>' +
    '<path d="M90 206 A38 9 0 0 0 166 206"/>' +
    '<path d="M90 190 A38 8 0 0 0 166 190"/>' +
    '<path d="M90 98 C104 88 116 108 128 98 S152 88 166 98"/>' +
    '<path d="M128 136 L148 156 L128 176 L108 156 Z"/>',

  /* Shot: daralan gövde, kalın taban. */
  shot:
    '<ellipse cx="128" cy="70" rx="52" ry="10"/>' +
    '<path d="M76 70 L90 202 M180 70 L166 202"/>' +
    '<path d="M90 202 A38 8 0 0 0 166 202"/>' +
    '<path d="M88 184 A40 8 0 0 0 168 184"/>' +
    '<ellipse cx="128" cy="128" rx="46" ry="9"/>',

  /* Likör kadehi: lale gövde, ince ayak. */
  cordial:
    '<ellipse cx="128" cy="44" rx="28" ry="7"/>' +
    '<path d="M100 44 C98 64 88 76 88 98 C88 124 106 140 128 140 C150 140 168 124 168 98 C168 76 158 64 156 44"/>' +
    '<path d="M89 102 C108 110 148 110 167 102"/>' +
    '<path d="M128 140 V203"/>' +
    '<ellipse cx="128" cy="210" rx="34" ry="7"/>',

  /* Şarap kadehi: Phosphor'unkinin sapı kısaydı (müşteri, 22 Eylül).
     Hazne üstte, sap ızgaranın neredeyse yarısı. */
  'wine-glass':
    '<ellipse cx="128" cy="26" rx="46" ry="8"/>' +
    '<path d="M82 26 C68 62 70 104 100 116 Q114 122 128 122 Q142 122 156 116 C186 104 188 62 174 26"/>' +
    '<path d="M74 66 C104 76 152 76 182 66"/>' +
    '<path d="M128 122 V216"/>' +
    '<ellipse cx="128" cy="220" rx="38" ry="7"/>',

  /* Kokteyl: martini kadehi, köşesine saplı yarım limon dilimi
     (müşteri, 22 Eylül). Phosphor'un martinisi dolgulu çizimdi;
     garnitür aynı elden çıksın diye kadeh burada çizgiyle yeniden
     çizildi. Dilimin geometrisi LEMON'un başında. */
  cocktail: MARTINI + LEMON,

  /* İmza Kokteyller: aynı kadeh, içinde zeytinli kürdan. */
  'cocktail-olive': MARTINI + RIM + OLIVE,

  /* Vodka: ince uzun, dik kenar; tek buz. Rakı bardağından dar ve uzun. */
  vodka:
    '<ellipse cx="128" cy="24" rx="33" ry="7"/>' +
    '<path d="M95 24 V218 M161 24 V218"/>' +
    '<path d="M95 218 A33 7 0 0 0 161 218"/>' +
    '<path d="M95 200 A33 7 0 0 0 161 200"/>' +
    '<path d="M95 78 A33 7 0 0 0 161 78"/>' +
    '<rect x="111" y="98" width="34" height="34" rx="5" transform="rotate(12 128 115)"/>',

  /* Likör: ince uzun, aşağı daralan, kalın taban — uzun bir shot. */
  liqueur:
    '<ellipse cx="128" cy="28" rx="40" ry="8"/>' +
    '<path d="M88 28 L104 216 M168 28 L152 216"/>' +
    '<path d="M104 216 A24 6 0 0 0 152 216"/>' +
    '<path d="M102 188 A26 6 0 0 0 154 188"/>' +
    '<path d="M91 68 A37 7 0 0 0 165 68"/>',

  /* 6'lı Shotlar: iki shot ağızdan tokuşuyor, iki damla sıçrıyor. */
  'shots-clink':
    '<g transform="translate(60 226) rotate(20)">' + SHOT_LOCAL + '</g>' +
    '<g transform="translate(196 226) rotate(-20)">' + SHOT_LOCAL + '</g>' +
    drop(106, 74) + drop(152, 62) +
    '<path d="M108 124 L96 112 M148 124 L160 112 M128 118 V102"/>',

  /* Viski Şişeler: buz kovasında çapraz duran şişe, ağızda buzlar. */
  'ice-bucket':
    '<g transform="translate(124 142) rotate(16)">' +
      '<path d="M-28 4 V-44 C-28 -62 -11 -64 -11 -78 V-106 M28 4 V-44 C28 -62 11 -64 11 -78 V-106"/>' +
      '<rect x="-14" y="-126" width="28" height="20" rx="3"/>' +
      '<path d="M-28 -26 H28"/>' +
    '</g>' +
    '<rect x="70" y="118" width="24" height="24" rx="4" transform="rotate(-15 82 130)"/>' +
    '<rect x="168" y="120" width="20" height="20" rx="4" transform="rotate(14 178 130)"/>' +
    '<ellipse cx="128" cy="140" rx="66" ry="11"/>' +
    '<path d="M62 140 L78 222 M194 140 L178 222"/>' +
    '<path d="M78 222 A50 9 0 0 0 178 222"/>' +
    '<path d="M71 186 A58 9 0 0 0 185 186"/>' +
    '<path d="M64 156 C46 156 46 176 67 176 M192 156 C210 156 210 176 189 176"/>',
} as const;

type PhosphorName = keyof typeof PHOSPHOR;
type CustomName = keyof typeof CUSTOM;
export type IconName = PhosphorName | CustomName;

const isPhosphor = (n: IconName): n is PhosphorName => n in PHOSPHOR;

/** İkonun tam SVG işaretlemesi — kart içine `set:html` ile basılır. */
export const iconSvg = (name: IconName): string =>
  isPhosphor(name)
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" focusable="false"><path d="${PHOSPHOR[name]}"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" focusable="false">${CUSTOM[name]}</svg>`;
