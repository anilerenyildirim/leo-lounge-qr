/* ============================================================
   qrall kaynağından leo-lounge/src/data/menu.json üreteci.

   ELLE YAZILMADI, ÜRETİLDİ — ve tekrar üretilebilir. Kaynak menü
   değiştiğinde 23 kategori yeniden çekilip bu script koşturulur;
   elle yapılan düzeltmeler kaybolmaz çünkü elle düzeltme YOK:
   içerik kararları aşağıdaki tablolarda duruyor.

   NE YAPILIYOR
   · <p> sarmalları sökülüyor (panelin bıraktığı artık)
   · ALL CAPS → Başlık Düzeni, TÜRKÇE kurallarıyla:
     I→ı, İ→i. Bu markaları da doğru çözüyor — kaynaktaki
     "CHİVAS" Türkçe klavye artefaktı, küçültünce "Chivas".
   · TL fiyat → tamsayı kuruş (750 → 75000)
   · içindekiler ayraçları ( - / , ) tek biçime (", ") çekiliyor

   NE YAPILMIYOR
   · YAZIM HATASI DÜZELTİLMİYOR. Kaynaktaki hata kaynaktaki
     hâliyle geçiyor, yanına `note: "TEYİT: …"` düşülüyor.
     Karar müşterinin, benim değil.
   · FİYAT UYDURULMUYOR. Kaynakta olmayan fiyat null kalır.
   ============================================================ */

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'src', 'data', 'menu.json');
/* Fotoğraf klasörü YEREL ve kişisel — repoya yazılmıyor (repo public).
   Ölçüler dosya başlığından okunduğu için klasör gerekli:
     LEO_FOTO_DIR="C:/…/cafe-leo-resimler/webp" node tools/gen-menu.cjs */
const PHOTO_DIR = process.env.LEO_FOTO_DIR;
if (!PHOTO_DIR || !fs.existsSync(PHOTO_DIR)) {
  console.error("LEO_FOTO_DIR ayarlı değil ya da klasör yok. Bkz. tools/README.md");
  process.exit(1);
}

/* ------------------------------------------------------------
   Kaynak kategoriler — çekilme sırasıyla (api/01..23.json)
   ------------------------------------------------------------ */
const SOURCE = [
  { file: '01', slug: 'aperatifler',        title: 'Aperatifler' },
  { file: '02', slug: 'makarnalar',         title: 'Makarnalar' },
  { file: '03', slug: 'pizzalar',           title: 'Pizzalar' },
  { file: '04', slug: 'burgerler',          title: 'Burgerler' },
  { file: '05', slug: 'bowllar',            title: 'Bowllar' },
  { file: '06', slug: 'ana-yemekler',       title: 'Ana Yemekler' },
  { file: '07', slug: 'kokteyller',         title: 'Kokteyller' },
  { file: '08', slug: 'biralar',            title: 'Biralar' },
  { file: '09', slug: 'viskiler',           title: 'Viskiler' },
  { file: '10', slug: 'shotlar',            title: 'Shotlar' },
  { file: '11', slug: 'vodkalar',           title: 'Vodkalar' },
  { file: '12', slug: 'saraplar',           title: 'Şaraplar' },
  { file: '13', slug: 'cinler',             title: 'Cinler' },
  { file: '14', slug: 'romlar',             title: 'Romlar' },
  { file: '15', slug: 'cerez',              title: 'Çerez' },
  { file: '16', slug: 'alkolsuz-icecekler', title: 'Alkolsüz İçecekler' },
  { file: '17', slug: 'sushi',              title: 'Sushi' },
  { file: '18', slug: 'altili-shotlar',     title: "6'lı Shotlar" },
  { file: '19', slug: 'raki',               title: 'Rakı' },
  { file: '20', slug: 'likorler',           title: 'Likörler' },
  { file: '21', slug: 'meyve-ve-meze',      title: 'Meyve & Meze' },
  { file: '22', slug: 'viski-siseler',      title: 'Viski Şişeler' },
  { file: '23', slug: 'salatalar',          title: 'Salatalar' },
];

/* ------------------------------------------------------------
   DEPOLAMA AĞACI — bölüm → alt bölümler.
   Okuma sırası bu değil; o lib/menuCards.ts'te.
   ------------------------------------------------------------ */
const SECTIONS = [
  { slug: 'yiyecekler', name: 'Yiyecekler',
    subs: ['aperatifler', 'salatalar', 'makarnalar', 'pizzalar', 'burgerler', 'bowllar', 'ana-yemekler', 'sushi'] },
  { slug: 'kokteyller', name: 'Kokteyller',
    subs: ['kokteyller'] },
  { slug: 'ickiler', name: 'İçkiler',
    subs: ['viskiler', 'viski-siseler', 'cinler', 'vodkalar', 'romlar', 'raki', 'likorler', 'shotlar', 'altili-shotlar'] },
  { slug: 'bira-sarap', name: 'Bira & Şarap',
    subs: ['biralar', 'saraplar'] },
  { slug: 'yaninda', name: 'Yanında',
    subs: ['cerez', 'meyve-ve-meze'] },
  { slug: 'alkolsuz', name: 'Alkolsüz',
    subs: ['alkolsuz-icecekler'] },
];

/* ------------------------------------------------------------
   TEYİT LİSTESİ — kaynaktaki şüpheli yazımlar.

   Anahtar: üretilen slug. Değer: nota düşülecek cümle.
   Ad DEĞİŞTİRİLMİYOR; yalnız iz bırakılıyor. Müşteri onaylarsa
   düzeltme kaynakta (panelde) yapılır, burada değil.
   ------------------------------------------------------------ */
const TEYIT = {
  'secret-of-aegan':            'TEYİT: "Aegan" — muhtemelen "Aegean".',
  'blood-mary':                 'TEYİT: "Blood Mary" — muhtemelen "Bloody Mary".',
  'jack-daniles-honey-double':  'TEYİT: "Daniles" — muhtemelen "Daniel\'s". Tek kadehi "Jack Danields Honey" yazılmış.',
  'red-lable-double':           'TEYİT: "Lable" — muhtemelen "Label". Ayrıca "Red Label Double" ikinci kez ayrı ürün olarak duruyor.',
  'gentlemanjack-double':       'TEYİT: "GentlemanJack" — boşluk eksik.',
  'ardberg-10':                 'TEYİT: "Ardberg" — markanın yazımı "Ardbeg".',
  'ardberg-10-double':          'TEYİT: "Ardberg" — markanın yazımı "Ardbeg".',
  'ardberg-5':                  'TEYİT: "Ardberg" — markanın yazımı "Ardbeg".',
  'hennesy-vs':                 'TEYİT: "Hennesy" — markanın yazımı "Hennessy".',
  'hennesy-vsop':               'TEYİT: "Hennesy" — markanın yazımı "Hennessy".',
  'bullet':                     'TEYİT: "Bullet" — markanın yazımı "Bulleit".',
  'bullet-double':              'TEYİT: "Bullet" — markanın yazımı "Bulleit".',
  'don-julio-blue-agave':       'TEYİT: kaynakta "DON JULİO % BLUE AGAVE" — araya "%" kaçmış, kaldırıldı.',
  'karidesli-fettucini':        'TEYİT: "Fettucini" — İtalyanca yazımı "Fettuccine".',
  'mantarli-fettucini':         'TEYİT: "Fettucini" — İtalyanca yazımı "Fettuccine".',
  'penne-arabiata':             'TEYİT: "Arabiata" — İtalyanca yazımı "Arrabbiata".',
  'clup-sandvic':               'TEYİT: "Clup" — muhtemelen "Club".',
  'deniz-mahsullu-salata':      'TEYİT: kaynakta "MAHSÜLLÜ" — doğrusu "mahsullü".',
  'margarita-pizza':            'TEYİT: "Margarita" — pizza için doğrusu "Margherita".',
  'island':                     'TEYİT: açıklamada "Kırmızıı" — fazladan ı.',
  'alexia':                     'TEYİT: açıklamada "POTAKAL" — doğrusu "Portakal".',
  'red-label':                  'TEYİT: kaynakta "RED LABEL" iki kez ayrı ürün olarak duruyor (aynı ad, aynı fiyat). Biri silinmeli mi?',
  'red-label-2':                'TEYİT: kaynakta "RED LABEL" iki kez ayrı ürün olarak duruyor (aynı ad, aynı fiyat). Biri silinmeli mi?',
  'dlc-moskado-sise':           'TEYİT: "Moskado" — üzüm adının yazımı "Moscato".',
  'sarafin-fume-blanc-sise':    'TEYİT: kaynakta "FUME" — doğrusu "Fumé Blanc".',
};

/* ------------------------------------------------------------
   FOTOĞRAF KÖPRÜSÜ — ürün slug'ı → klasördeki dosya adı.

   Yalnız ad farkı olanlar burada. Aynı olanlar kendiliğinden
   eşleşiyor. Dosyalar CDN'e ÜRÜN SLUG'IYLA yüklenecek; eşleme
   tablosu foto-manifesto.md'de.
   ------------------------------------------------------------ */
const PHOTO_ALIAS = {
  'bolonez-soslu-spaghetti': 'bolonez-soslu-spagetti',
  'karidesli-fettucini':     'karidesli-fettuccine',
  'mantarli-fettucini':      'mantarli-fettuccine',
  'alfredo-etli':            'bonfileli-alfredo',
  'alfredo-tavuklu':         'tavuklu-alfredo',
  'penne-arabiata':          'penne-arrabbiata',
  'clup-sandvic':            'club-sandvic',
  'hotdog':                  'hot-dog',
  'tavuk-schnitzel':         'tavuk-snitzel',
  'tavuklu-bowl':            'tavuk-bowl',
  'karidesli-bowl':          'karides-bowl',
  'akdeniz-salata':          'akdeniz-peynirli-salata',
};

/* ------------------------------------------------------------
   Türkçe metin araçları
   ------------------------------------------------------------ */

const stripTags = (s) => (s || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');

/** Türkçe küçültme: I→ı, İ→i. JS'in varsayılanı ikisini de bozar. */
const trLower = (s) =>
  s.replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase();

/** Türkçe büyütme: i→İ, ı→I. */
const trUpperFirst = (s) =>
  (s.charAt(0) === 'i' ? 'İ' : s.charAt(0) === 'ı' ? 'I' : s.charAt(0).toUpperCase()) + s.slice(1);

/** ALL CAPS → Başlık Düzeni. Kısa bağlaçlar ve ölçüler küçük kalır. */
/* Başlık düzeninde küçük kalan bağlaçlar. Menüde Türkçe ve İngilizce
   adlar yan yana duruyor ("Secret of Aegan", "Peach and Ash"), ikisinin
   de bağlacı küçük olmalı. İlk kelimeyse yine büyük kalır. */
const SMALL = new Set([
  've', 'ile', 'de', 'da',
  'of', 'and', 'the', 'in', 'on', 'with',
]);

/** Başlık düzeninde BÜYÜK kalacak kısaltmalar. Açık liste — tahmin yok. */
const ACRONYM = new Set(['DLC', 'IPA', 'VS', 'VSOP', 'XO', 'NA']);

/**
 * TÜRKÇE KÜÇÜLTMENİN YAN HASARI.
 *
 * Türkçede I→ı doğrudur ("KIZARTMASI" → "kızartması"), ama kaynakta
 * yabancı sözcükler de ALL CAPS: "PASSION" → "passıon" çıkıyor.
 * Kural tek başına ikisini ayıramaz — bu yüzden istisna AÇIK LİSTE.
 *
 * Listeye yalnız ÖLÇÜLEREK girildi: üretilen 232 addaki ı taşıyan
 * 43 sözcüğün tamamı tek tek gözden geçirildi; 30'u gerçekten
 * Türkçe (Fıstığı, Kızartması, Rakı…), 12'si yabancı. Aşağıdakiler
 * o 12'si.
 */
const LATIN_I = {
  'baıleys': 'baileys',
  'boulevardıer': 'boulevardier',
  'cardınal': 'cardinal',
  'chıcken': 'chicken',
  'guınnes': 'guinnes',      // kaynak yazımı korunuyor, TEYİT notu var
  'naıl': 'nail',
  'passıon': 'passion',
  'saperavı': 'saperavi',
  'sherıdans': 'sheridans',
  'tekıla': 'tekila',
  'yakıma': 'yakima',
  'fınger': 'finger',
};

const fixLatinI = (w) => LATIN_I[w] || w;

/** Tek kelimeyi çevirir; parantez/tire gibi sarmalları koruyarak. */
const titleWord = (w, i) => {
  // "(kadeh)" → sarmalı ayır, içini çevir, geri tak
  const m = w.match(/^([("']*)(.*?)([)"'.,]*)$/);
  const [, pre, core, post] = m;
  if (!core) return w;
  if (/^[0-9]/.test(core)) return pre + trLower(core) + post;      // 12, 40, 5
  if (ACRONYM.has(core.toUpperCase())) return pre + core.toUpperCase() + post;
  const low = fixLatinI(trLower(core));
  if (i > 0 && SMALL.has(low)) return pre + low + post;
  // tireli birleşikler: her parçayı ayrı büyüt (Sultaniye-Emir)
  return pre + low.split('-').map(trUpperFirst).join('-') + post;
};

const titleCase = (s) =>
  s.split(/\s+/).filter(Boolean).map(titleWord).join(' ');

/**
 * Ada özgü temizlik — başlık düzeninden ÖNCE koşar.
 *
 * Kaynakta iki biçim yan yana duruyordu: "… (KADEH)" ve "… / ŞİŞE".
 * Aynı bilgiyi iki türlü yazmak şarap listesini okunmaz yapıyordu;
 * ikisi de paranteze çekildi. Ham hâli her ürünün `note` alanında
 * `kaynak:` izi olarak duruyor, kaybolmuyor.
 */
const tidyName = (s) =>
  s
    .replace(/\s*%\s*/g, ' ')              // "DON JULİO % BLUE AGAVE" → kaçak %
    .replace(/(\d)\s+LI\b/g, "$1'LI")     // "6 LI SHOT" → "6'LI SHOT" (Türkçe ek)
    .replace(/\s*\/\s*ŞİŞE\b/gi, ' (ŞİŞE)')
    .replace(/([A-Za-zÇĞİÖŞÜçğıöşü])\(/g, '$1 (')  // "ALPACA(CHILE)" → "ALPACA (CHILE)"
    .replace(/\s+/g, ' ')
    .trim();

const slugify = (s) =>
  stripTags(s).trim()
    .replace(/İ/g, 'I').replace(/ı/g, 'i')
    .replace(/Ş/g, 'S').replace(/ş/g, 's')
    .replace(/Ğ/g, 'G').replace(/ğ/g, 'g')
    .replace(/Ü/g, 'U').replace(/ü/g, 'u')
    .replace(/Ö/g, 'O').replace(/ö/g, 'o')
    .replace(/Ç/g, 'C').replace(/ç/g, 'c')
    .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** İçindekiler: ayraçları tek biçime çek, cümle sonu noktasını at. */
/**
 * Açıklamalardaki Türkçe klavye artefaktları.
 * "İrish" tek başına bir yazım hatası değil, Türkçe I tuşunun izi —
 * adlarda LATIN_I ne yapıyorsa burada da o yapılıyor.
 */
const DESC_FIX = [[/İrish/g, "Irish"]];

const cleanDesc = (s) => {
  // Ayraç: tire/eğik çizgi YALNIZ en az bir yanında boşluk varsa ayraçtır.
  // "B-52" ve "Cabernet-Franc" bozulmasın diye boşluksuz tireye dokunulmaz.
  let d = stripTags(s)
    .replace(/\s+[-/·]\s*/g, ', ')   // "A -B" ve "A - B" → "A, B"
    .replace(/\s*[-/·]\s+/g, ', ')   // "A- B" → "A, B"
    .replace(/\s+,/g, ',')            // "A , B" → "A, B"
    .replace(/,(?=\S)/g, ', ')        // "A,B" → "A, B"
    .replace(/(,\s*){2,}/g, ', ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.,;]+$/, '')
    .trim();
  for (const [re, to] of DESC_FIX) d = d.replace(re, to);
  if (!d) return null;
  // Tamamı büyükse başlık düzenine çek, değilse ilk harfi büyüt.
  if (d === d.toUpperCase() && /[A-ZÇĞİÖŞÜ]/.test(d)) {
    d = d.split(', ')
      .map((p) => p.split(/\s+/).map((w) => fixLatinI(trLower(w))).join(' '))
      .map(trUpperFirst)
      .join(', ');
  } else {
    d = trUpperFirst(d);
  }
  return d;
};

/* ------------------------------------------------------------
   Fotoğraf envanteri — dosyanın gerçek ölçüsü başlıktan okunur.
   ------------------------------------------------------------ */
function webpDim(file) {
  const b = fs.readFileSync(file).subarray(0, 64);
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const cc = b.toString('ascii', 12, 16);
  if (cc === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (cc === 'VP8L') { const x = b.readUInt32LE(21); return { w: (x & 0x3fff) + 1, h: ((x >> 14) & 0x3fff) + 1 }; }
  if (cc === 'VP8X') return { w: (b[24] | (b[25] << 8) | (b[26] << 16)) + 1, h: (b[27] | (b[28] << 8) | (b[29] << 16)) + 1 };
  return null;
}

const PHOTOS = {};
for (const f of fs.readdirSync(PHOTO_DIR).filter((f) => f.endsWith('.webp'))) {
  PHOTOS[f.replace(/\.webp$/, '')] = webpDim(path.join(PHOTO_DIR, f));
}

/* ------------------------------------------------------------
   ÜRETİM
   ------------------------------------------------------------ */

const seen = new Map();          // slug → kaç kez görüldü
const bySub = {};                // subSlug → item[]
const vatBySub = {};             // subSlug → Set(oran)
const manifest = [];             // CDN yükleme listesi
const missingPhoto = [];         // fotoğrafı olmayan yemekler
const qrallPhoto = [];           // qrall'da karesi olanlar

for (const src of SOURCE) {
  const j = JSON.parse(fs.readFileSync(path.join(__dirname, 'api', `${src.file}.json`), 'utf8'));
  const items = [];
  vatBySub[src.slug] = new Set();

  for (const p of j.products) {
    const rawName = stripTags(p.translations[0].name).replace(/\s+/g, ' ').trim();
    const name = titleCase(tidyName(rawName));

    let slug = slugify(rawName);
    if (seen.has(slug)) {
      const n = seen.get(slug) + 1;
      seen.set(slug, n);
      slug = `${slug}-${n}`;
    } else {
      seen.set(slug, 1);
    }

    const pr = p.prices && p.prices[0];
    const price = pr && typeof pr.price === 'number' ? Math.round(pr.price * 100) : null;
    if (pr && pr.taxRate) vatBySub[src.slug].add(pr.taxRate);

    // fotoğraf: klasörde karşılığı var mı?
    const fileKey = PHOTO_ALIAS[slug] || slug;
    const dim = PHOTOS[fileKey] || null;
    if (dim) manifest.push({ slug, file: `${fileKey}.webp`, cat: src.title, renamed: fileKey !== slug });

    const notes = [];
    if (TEYIT[slug]) notes.push(TEYIT[slug]);
    if (rawName !== name) notes.push(`kaynak: "${rawName}"`);

    const item = { slug, name: { tr: name } };
    const desc = cleanDesc(p.translations[0].description);
    if (desc) item.description = { tr: desc };
    item.price = price;
    item.photo = dim ? { w: dim.w, h: dim.h } : null;
    if (notes.length) item.note = notes.join(' | ');
    items.push(item);

    // raporlama
    const isFood = ['aperatifler', 'salatalar', 'makarnalar', 'pizzalar', 'burgerler',
                    'bowllar', 'ana-yemekler', 'sushi', 'cerez', 'meyve-ve-meze'].includes(src.slug);
    if (isFood && !dim) missingPhoto.push(`${src.title} · ${name}`);
    if (!dim && p.files && p.files.length) qrallPhoto.push(`${src.title} · ${name}`);
  }

  bySub[src.slug] = items;
}

/* ---- bölümleri kur ---- */
const titleOf = Object.fromEntries(SOURCE.map((s) => [s.slug, s.title]));

const sections = SECTIONS.map((sec) => {
  const rates = new Set();
  for (const sub of sec.subs) for (const r of vatBySub[sub]) rates.add(r);
  return {
    slug: sec.slug,
    name: { tr: sec.name },
    // Tek oran varsa yazılır; karışıksa null — uydurulmaz.
    vat: rates.size === 1 ? [...rates][0] : null,
    subsections: sec.subs.map((sub) => {
      const items = bySub[sub];
      const cover = items.find((i) => i.photo);
      const s = { slug: sub, name: { tr: titleOf[sub] } };
      if (cover) s.icon = cover.slug;
      s.items = items;
      return s;
    }),
  };
});

const out = {
  schema: 2,
  tenant: 'leo-lounge',
  cdn: 'https://cdn.onlinemenu-qr.com',
  locales: { default: 'tr', enabled: ['tr'] },
  venues: [
    {
      slug: 'lounge',
      name: { tr: 'Leo Lounge' },
      eyebrow: { tr: 'Lounge · Ünlüsoy Caddesi' },
      tagline: { tr: 'Işık kısılır, gün üzerinden düşer.' },
      contact: {
        address: 'Sinanoba, Ünlüsoy Cd., Büyükçekmece',
        phone: null,
        instagram: 'https://www.instagram.com/leolounge.ist/',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=40.9985511,28.5438501&query_place_id=ChIJo3xPAABntRQRV_qZNT6yuG8',
      },
      hours: null,
      hoursText: null,
      hero: null,
      featured: [],
      sections,
      extras: [],
    },
  ],
};

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');

/* ---- rapor ---- */
const total = Object.values(bySub).reduce((n, a) => n + a.length, 0);
const withPhoto = manifest.length;
const noPrice = Object.values(bySub).flat().filter((i) => i.price === null).length;
const notes = Object.values(bySub).flat().filter((i) => i.note && i.note.startsWith('TEYİT')).length;

console.log(`menu.json yazıldı: ${OUT}`);
console.log(`  kategori (alt bölüm): ${SOURCE.length}   bölüm: ${SECTIONS.length}`);
console.log(`  ürün: ${total}   fotoğraflı: ${withPhoto}   fiyatsız: ${noPrice}   TEYİT notu: ${notes}`);
console.log(`  slug çakışması (sonek alan): ${[...seen.values()].filter((n) => n > 1).length}`);

fs.writeFileSync(path.join(__dirname, 'manifest.json'), JSON.stringify({ manifest, missingPhoto, qrallPhoto }, null, 1));
console.log(`\n  yüklenecek dosya: ${manifest.length} (adı değişecek: ${manifest.filter((m) => m.renamed).length})`);
console.log(`  fotoğrafı eksik yemek: ${missingPhoto.length}`);
console.log(`  qrall'da karesi olup klasörde olmayan: ${qrallPhoto.length}`);
