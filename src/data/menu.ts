/* ============================================================
   LEO LOUNGE — menü verisinin TİPLİ GÖRÜNÜMÜ

   Tek kaynak `src/data/menu.json`. Bu modül onu okur, dili çözer ve
   bileşenlerin beklediği düz nesnelere dönüştürür.

   ŞEMA cafe-leo ile BİREBİR AYNI (schema: 2). Bu bilerek: ileride tek
   panel iki siteyi de yönetecek, o gün iki ayrı şema okuması yazılmak
   zorunda kalınmasın.

   VERİ ELLE YAZILMADI. qrall'daki eski QR menüden (23 kategori, 232
   ürün) çekildi ve bir üreteçle dönüştürüldü. Kaynak değişirse üreteç
   yeniden koşturulur; menu.json elle düzenlenmez.

   ŞEMA NOTLARI
   · Metin alanları TEK DİLLİ OLSA DA sözlük: { "tr": "…" }.
     İngilizce eklendiğinde migrasyon gerekmesin.
   · price TAMSAYI KURUŞ: 75000 = 750,00 ₺. Kayan nokta yok.
   · price: null → ekranda "—". Teyit edilmemiş fiyat YAZILMAZ.
     (Bugün 232 ürünün hepsinin fiyatı var; alan yine de nullable.)
   · `photo` ÖLÇÜ taşır: {w,h} ya da null. Adres şemada YOK,
     slug'dan türetiliyor (`photoSrc`) — aynı gerçek iki yerde durmasın.
   · `note` normalizasyon izidir: ALL CAPS düzeltmeleri ve kaynaktaki
     şüpheli yazımlar (`TEYİT:`). EKRANA BASILMAZ.

   TEYİT BEKLEYEN — kaynaktaki yazımlar korundu, düzeltilmedi.
   Tam liste için `menu.json` içinde "TEYİT:" araması yapılabilir
   (bugün 25 ürün). Örnekler: "Secret of Aegan" → Aegean?,
   "Blood Mary" → Bloody Mary?, "Red Label" iki kez kayıtlı.

   FOTOĞRAFI BEKLENEN — panele/CDN'e yüklendiği an görünür olurlar,
   koda dokunulmaz: Aperatifler (5), Çerez (4), Meyve & Meze (6).
   Kokteyllerin 14/23'ünün karesi qrall'da duruyor, CDN'e taşınmadı.
   ============================================================ */

import rawFile from './menu.json';

/* ------------------------------------------------------------
   HAM ŞEKİL — menu.json'un birebir karşılığı.
   Tek bir `as unknown as` burada; gerisi tam tipli.
   ------------------------------------------------------------ */

type Loc = Record<string, string>;

interface RawItem {
  slug: string;
  name: Loc;
  description?: Loc;
  price: number | null;
  unit?: string | null;
  photo?: { w: number; h: number } | null;
  badges?: string[];
  note?: string;
}

/** ürün tanımı ya da başka bir bölümdeki ürüne referans (slug) */
type RawEntry = RawItem | string;

interface RawSubsection {
  slug: string;
  name: Loc | null;
  /** çipte görünecek belirteç: bir ÜRÜN slug'ı */
  icon?: string;
  items: RawEntry[];
}

interface RawSection {
  slug: string;
  name: Loc;
  /** KDV — muhasebe için taşınıyor, ekranda gösterilmiyor.
      null: bölümdeki oranlar karışık (ör. İçkiler 10 ve 20). */
  vat: 10 | 20 | null;
  highlight?: boolean;
  subsections: RawSubsection[];
}

interface RawVenue {
  slug: 'lounge';
  name: Loc;
  eyebrow: Loc;
  tagline: Loc;
  contact: {
    address: string | null;
    phone: string | null;
    instagram: string | null;
    mapsUrl: string | null;
  };
  hours: Record<string, [number, number]> | null;
  hoursText: Loc | null;
  hero: string | null;
  featured: string[];
  sections: RawSection[] | null;
  extras: RawExtra[];
}

interface RawExtra {
  slug: string;
  name: Loc;
  price: number;
  appliesTo: string[];
}

interface RawFile {
  schema: number;
  /** CDN anahtarının ilk parçası — fotoğraf yolu bundan kuruluyor */
  tenant: string;
  cdn: string;
  locales: { default: string; enabled: string[] };
  venues: RawVenue[];
}

const raw = rawFile as unknown as RawFile;

/* ------------------------------------------------------------
   DİL ÇÖZÜMÜ
   Tek dil açık olduğu sürece bu iki satır.
   ------------------------------------------------------------ */

export const LOCALE = raw.locales.default;

const t = (d: Loc): string => d[LOCALE] ?? Object.values(d)[0] ?? '';
const tOpt = (d: Loc | null | undefined): string | null => (d ? t(d) : null);

/* ------------------------------------------------------------
   ÇÖZÜLMÜŞ TİPLER — bileşenlerin gördüğü şekil
   ------------------------------------------------------------ */

export interface MenuItem {
  slug: string;
  name: string;
  desc?: string;
  /** TAMSAYI KURUŞ. null → ekranda "—". */
  price: number | null;
  unit?: string | null;
  /** yoksa null; varsa ölçüsü ve tam adresi */
  photo: { w: number; h: number; src: string } | null;
  badges: string[];
  vat: 10 | 20 | null;
}

export interface Subsection {
  slug: string;
  /** null → alt başlık basılmaz */
  title: string | null;
  icon?: string;
  items: MenuItem[];
}

export interface Section {
  slug: string;
  title: string;
  vat: 10 | 20 | null;
  subs: Subsection[];
  /** bölümdeki toplam ürün adedi */
  count: number;
}

export interface Venue {
  key: 'lounge';
  name: string;
  eyebrow: string;
  tagline: string;
  sections: Section[] | null;
  contact: RawVenue['contact'];
  hours: Record<string, [number, number]> | null;
  hoursText: string | null;
  hero: string | null;
  featured: string[];
}

/* ------------------------------------------------------------
   ÇÖZÜMLEME
   İki geçiş: önce TANIMLI ürünler indekslenir, sonra bölümler
   kurulurken referanslar bu indeksten çözülür. Böylece bir seçki
   bölümü kendi kaynağından önce gelse bile çalışır.
   ------------------------------------------------------------ */

const isRef = (e: RawEntry): e is string => typeof e === 'string';

/**
 * Fotoğraf adresi ŞEMADAN DEĞİL slug'dan türetilir — aynı gerçeği iki
 * yerde tutmamak için. Mekan slug'ı gerektiğinden URL kurma bu modülde.
 */
export const photoSrc = (venueSlug: string, itemSlug: string): string =>
  `${raw.cdn}/${raw.tenant}/${venueSlug}/${itemSlug}.webp`;

const toItem = (r: RawItem, vat: 10 | 20 | null, venueSlug: string): MenuItem => {
  const desc = tOpt(r.description);
  return {
    slug: r.slug,
    name: t(r.name),
    ...(desc ? { desc } : {}),
    price: r.price,
    ...(r.unit ? { unit: r.unit } : {}),
    photo: r.photo ? { ...r.photo, src: photoSrc(venueSlug, r.slug) } : null,
    badges: r.badges ?? [],
    vat,
  };
};

function buildVenue(v: RawVenue): Venue {
  let sections: Section[] | null = null;

  if (v.sections) {
    /* 1. geçiş — tanımlı ürünlerin indeksi */
    const defined = new Map<string, MenuItem>();
    for (const sec of v.sections) {
      for (const sub of sec.subsections) {
        for (const e of sub.items) {
          if (isRef(e)) continue;
          defined.set(e.slug, toItem(e, sec.vat, v.slug));
        }
      }
    }

    /* 2. geçiş — bölümleri kur, referansları çöz */
    sections = v.sections.map((sec) => {
      const subs: Subsection[] = sec.subsections.map((sub) => ({
        slug: sub.slug,
        title: tOpt(sub.name),
        ...(sub.icon ? { icon: sub.icon } : {}),
        items: sub.items
          .map((e) => (isRef(e) ? defined.get(e) : defined.get(e.slug)))
          .filter((x): x is MenuItem => Boolean(x)),
      }));
      return {
        slug: sec.slug,
        title: t(sec.name),
        vat: sec.vat,
        subs,
        count: subs.reduce((n, s) => n + s.items.length, 0),
      };
    });
  }

  return {
    key: v.slug,
    name: t(v.name),
    eyebrow: t(v.eyebrow),
    tagline: t(v.tagline),
    sections,
    contact: v.contact,
    hours: v.hours,
    hoursText: tOpt(v.hoursText),
    hero: v.hero,
    featured: v.featured,
  };
}

export const VENUES: Venue[] = raw.venues.map(buildVenue);

export const LOUNGE: Venue = VENUES.find((v) => v.key === 'lounge')!;

/* ------------------------------------------------------------
   ARAMA YARDIMCILARI
   ------------------------------------------------------------ */

const ALL_ITEMS = new Map<string, MenuItem>();
for (const v of VENUES) {
  for (const sec of v.sections ?? []) {
    for (const sub of sec.subs) {
      for (const it of sub.items) if (!ALL_ITEMS.has(it.slug)) ALL_ITEMS.set(it.slug, it);
    }
  }
}

export const itemBySlug = (slug: string): MenuItem | undefined => ALL_ITEMS.get(slug);

export const photoOf = (slug: string): MenuItem['photo'] => itemBySlug(slug)?.photo ?? null;

/* ------------------------------------------------------------
   BİÇİMLEME
   ------------------------------------------------------------ */

/** Kuruş tamsayısı → "750 ₺". Fiyat yoksa "—". */
export const formatPrice = (kurus: number | null): string => {
  if (kurus === null) return '—';
  const lira = Math.trunc(kurus / 100);
  const kr = Math.abs(kurus % 100);
  return kr === 0 ? `${lira} ₺` : `${lira},${String(kr).padStart(2, '0')} ₺`;
};
