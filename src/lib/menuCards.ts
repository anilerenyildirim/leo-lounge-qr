/* ============================================================
   MENÜ KARTLARI — /menu kategori ızgarasının tek kaynağı

   menu.json iki seviyeli bir DEPOLAMA düzeni tutuyor (Yiyecekler →
   pizzalar, burgerler…; İçkiler → viskiler, cinler…). Müşterinin
   gördüğü liste bir OKUMA düzeni ve ikisi örtüşmek zorunda değil.
   Burası ikincisini birincinin üzerine koyan sunum haritası.

   BU AYRIM BİLEREK KORUNUYOR (cafe-leo'da da öyle): panel menu.json'u
   her güncellemede baştan yazıyor. Okuma sırası orada tutulsaydı her
   panel güncellemesinde silinirdi. Harita burada durduğu sürece panel
   ürün ekleyip fiyat değiştirebiliyor, kategori okuması yerinde
   kalıyor.

   KART SAYISI 24: kaynaktaki 23 kategori, Kokteyller ikiye bölünmüş
   (İmza Kokteyller + Kokteyller). Birleştirme gerekirse (ör. Shotlar +
   6'lı Shotlar) burada tek kayıt değişir.

   SIRA KAYNAKTAKİ SIRA DEĞİL (müşteri kararı, 22 Eylül): menü
   yemekle açılıyor (Aperatifler, Salatalar, Bowllar, Sushi, …),
   meze bitince kokteyller, ardından bar.

   KARTIN SAĞ YARISI — üç durum, öncelik sırasıyla:
     1. fotoğraf  — kapak ürünün karesi (cover ya da fotoğraflı ilk ürün)
     2. ikon      — fotoğrafı olmayan İÇECEK kartları (lib/icons.ts)
     3. hiçbiri   — fotoğrafı henüz gelmemiş YEMEK kartları: fotoğrafsız,
                    yalnız yazı. Yer tutucu yok (müşteri kararı, 11 Eylül).
   Yemekte ikon yok, çünkü onların fotoğrafı gelecek.
   ============================================================ */

import { LOUNGE, type MenuItem, type Section, type Subsection } from '../data/menu';
import { hasPhoto } from './config';
import type { IconName } from './icons';

export interface MenuCard {
  /** URL parçası: /menu/<key> */
  key: string;
  /** kart üzerinde ve kategori sayfasının başlığında yazan ad */
  title: string;
  /** kaynak ana kategori (menu.json → section.slug) */
  sectionSlug: string;
  /** bu karta girecek alt kategoriler (menu.json → subsection.slug) */
  subs: string[];
  /**
   * Kartın kapağı olacak ÜRÜN slug'ı. Verilmezse kartın kapsadığı
   * ürünlerden fotoğrafı olan İLKİ kullanılır.
   */
  cover?: string;
  /**
   * Fotoğraf yokken sağda duracak bardak ikonu. Fotoğraf gelirse
   * fotoğraf kazanır — ikon yalnız boşluğu dolduruyor.
   */
  icon?: IconName;
  /**
   * Izgarada TAM GENİŞLİK kart. Yalnız iki kokteyl kartı: sofra ile
   * barın arasında ayraç gibi duruyorlar. İkisi birlikte geniş olunca
   * iki sütunlu ızgara 10 + 2 + 12 — hiçbir satırda tek kart kalmıyor.
   */
  wide?: boolean;
  /** yalnız bu ürünler (slug) — bir kaynak kategoriyi iki karta bölmek için */
  only?: string[];
  /** bu ürünler hariç — `only`'nin tümleyeni */
  except?: string[];
  /**
   * Kadeh/şişe eşleme: "X (Kadeh)" ürününün hemen ardına "X (Şişe)"
   * gelir; kadehi olmayanlar sonra, kaynaktaki sırayla (Şaraplar).
   */
  glassFirst?: boolean;
}

/**
 * İmza kokteyller (ürün slug'ları). Listede olmayan her kokteyl
 * "Kokteyller" kartına düşer. Sıra kaynaktaki sıra.
 */
const SIGNATURE: string[] = [
  'island',
  'green-garden',
  'secret-of-aegan',
  'the-alchemist',
  'herbarium',
  'peach-and-ash',
  'leo-pink',
  'tropikal',
  'alexia',
];

/** Okuma sırası — sofra önce, sonra kokteyller, sonra bar
    (müşteri kararı, 22 Eylül). */
export const MENU_CARDS: MenuCard[] = [
  /* Kapaklar elle seçildi: varsayılan "fotoğraflı ilk ürün" Burgerler'de
     hot dog'u, Ana Yemekler'de schnitzel'i, Bowllar'da bonfileyi
     kapağa çıkarıyordu. */
  { key: 'aperatifler',        title: 'Aperatifler',         sectionSlug: 'yiyecekler', subs: ['aperatifler'] },
  { key: 'salatalar',          title: 'Salatalar',           sectionSlug: 'yiyecekler', subs: ['salatalar'] },
  { key: 'bowllar',            title: 'Bowllar',             sectionSlug: 'yiyecekler', subs: ['bowllar'],      cover: 'karidesli-bowl' },
  { key: 'sushi',              title: 'Sushi',               sectionSlug: 'yiyecekler', subs: ['sushi'] },
  { key: 'makarnalar',         title: 'Makarnalar',          sectionSlug: 'yiyecekler', subs: ['makarnalar'] },
  { key: 'pizzalar',           title: 'Pizzalar',            sectionSlug: 'yiyecekler', subs: ['pizzalar'],     cover: 'leo-pizza' },
  { key: 'burgerler',          title: 'Burgerler',           sectionSlug: 'yiyecekler', subs: ['burgerler'],    cover: 'cheese-burger' },
  { key: 'ana-yemekler',       title: 'Ana Yemekler',        sectionSlug: 'yiyecekler', subs: ['ana-yemekler'], cover: 'antrikot' },

  { key: 'cerez',              title: 'Çerez',               sectionSlug: 'yaninda',    subs: ['cerez'] },
  { key: 'meyve-ve-meze',      title: 'Meyve & Meze',        sectionSlug: 'yaninda',    subs: ['meyve-ve-meze'] },

  /* Kaynakta TEK kategori, burada iki kart. Ayrım `only`/`except` ile:
     panelin yeni eklediği kokteyl kendiliğinden "Kokteyller"e düşer,
     imzaya ancak SIGNATURE listesine yazılınca geçer. */
  { key: 'imza-kokteyller',    title: 'İmza Kokteyller',     sectionSlug: 'kokteyller', subs: ['kokteyller'], only: SIGNATURE,   icon: 'cocktail-olive', wide: true },
  { key: 'kokteyller',         title: 'Kokteyller',          sectionSlug: 'kokteyller', subs: ['kokteyller'], except: SIGNATURE, icon: 'cocktail', wide: true },

  /* İkonlar: Phosphor (thin) ya da elle çizilenler. Ayrıntı
     lib/icons.ts'te. */
  { key: 'biralar',            title: 'Biralar',             sectionSlug: 'bira-sarap', subs: ['biralar'],            icon: 'beer-stein' },
  { key: 'saraplar',           title: 'Şaraplar',            sectionSlug: 'bira-sarap', subs: ['saraplar'],           icon: 'wine-glass', glassFirst: true },

  { key: 'viskiler',           title: 'Viskiler',            sectionSlug: 'ickiler',    subs: ['viskiler'],           icon: 'tumbler' },
  { key: 'viski-siseler',      title: 'Viski Şişeler',       sectionSlug: 'ickiler',    subs: ['viski-siseler'],      icon: 'ice-bucket' },
  { key: 'cinler',             title: 'Cinler',              sectionSlug: 'ickiler',    subs: ['cinler'],             icon: 'tumbler-gin' },
  { key: 'vodkalar',           title: 'Vodkalar',            sectionSlug: 'ickiler',    subs: ['vodkalar'],           icon: 'vodka' },
  { key: 'romlar',             title: 'Romlar',              sectionSlug: 'ickiler',    subs: ['romlar'],             icon: 'tumbler-rum' },
  { key: 'raki',               title: 'Rakı',                sectionSlug: 'ickiler',    subs: ['raki'],               icon: 'highball' },
  { key: 'likorler',           title: 'Likörler',            sectionSlug: 'ickiler',    subs: ['likorler'],           icon: 'liqueur' },
  { key: 'shotlar',            title: 'Shotlar',             sectionSlug: 'ickiler',    subs: ['shotlar'],            icon: 'shot' },
  { key: 'altili-shotlar',     title: "6'lı Shotlar",        sectionSlug: 'ickiler',    subs: ['altili-shotlar'],     icon: 'shots-clink' },

  { key: 'alkolsuz-icecekler', title: 'Alkolsüz İçecekler',  sectionSlug: 'alkolsuz',   subs: ['alkolsuz-icecekler'], icon: 'orange-slice' },
];

const sectionOf = (slug: string): Section => {
  const sec = (LOUNGE.sections ?? []).find((s) => s.slug === slug);
  if (!sec) throw new Error(`menuCards: bölüm bulunamadı → ${slug}`);
  return sec;
};

/**
 * Kartın kapsadığı alt grupları TEK bölüm nesnesi hâlinde verir.
 * Kategori sayfası Section.astro'yu olduğu gibi kullanabilsin diye.
 */
export const cardSection = (card: MenuCard): Section => {
  const sec = sectionOf(card.sectionSlug);
  const keep = (i: MenuItem) =>
    (!card.only || card.only.includes(i.slug)) && !card.except?.includes(i.slug);
  const subs: Subsection[] = card.subs
    .map((s) => sec.subs.find((x) => x.slug === s))
    .filter((x): x is Subsection => Boolean(x))
    .map((sub) => {
      const items = sub.items.filter(keep);
      return { ...sub, items: card.glassFirst ? glassFirst(items) : items };
    });

  return {
    slug: card.key,
    title: card.title,
    vat: sec.vat,
    subs,
    count: subs.reduce((n, s) => n + s.items.length, 0),
  };
};

const GLASS = /\s*\(Kadeh\)$/;
const BOTTLE = /\s*\(Şişe\)$/;

/** Kadeh → aynı adlı şişe → kadehi olmayanlar (kaynaktaki sırayla). */
const glassFirst = (items: MenuItem[]): MenuItem[] => {
  const rest = [...items];
  const out: MenuItem[] = [];
  for (const g of items.filter((i) => GLASS.test(i.name))) {
    const base = g.name.replace(GLASS, '');
    out.push(g);
    rest.splice(rest.indexOf(g), 1);
    const b = rest.findIndex((i) => BOTTLE.test(i.name) && i.name.replace(BOTTLE, '') === base);
    if (b >= 0) out.push(...rest.splice(b, 1));
  }
  return [...out, ...rest];
};

/** Kartın kapsadığı bütün ürünler, DOM sırasında. */
export const cardItems = (card: MenuCard): MenuItem[] =>
  cardSection(card).subs.flatMap((s) => s.items);

/**
 * Kart kapağı: açıkça verilmişse o, yoksa fotoğrafı olan ilk ürün.
 * Hiçbiri yoksa null — sağ yarıda ikon ya da hiçbir şey durur.
 */
export const cardPhoto = (card: MenuCard): string | null => {
  if (card.cover && hasPhoto(card.cover)) return card.cover;
  return cardItems(card).find((i) => hasPhoto(i.slug))?.slug ?? null;
};
