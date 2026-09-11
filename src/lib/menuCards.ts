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

   KART SAYISI 23 ve kaynaktaki kategorilerle BİREBİR. Birleştirme
   gerekirse (ör. Shotlar + 6'lı Shotlar) burada tek kayıt değişir.

   SIRA KAYNAKTAKİ SIRA DEĞİL. Kokteyller başa alındı (mekanın imzası),
   yemekler bir arada, içkiler bir arada.

   KARTIN SAĞ YARISI — üç durum, öncelik sırasıyla:
     1. fotoğraf  — kapak ürünün karesi (cover ya da fotoğraflı ilk ürün)
     2. ikon      — fotoğrafı olmayan İÇECEK kartları (lib/icons.ts)
     3. baş harf  — fotoğrafı henüz gelmemiş YEMEK kartları
   İçeceklere harf konmuyor: müşteri kararı, "kategorisine uygun bardak"
   daha okunur. Yemekte ikon yok, çünkü onların fotoğrafı gelecek.
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
   * Izgarada TAM GENİŞLİK kart. Yalnız mekanın imzası (Kokteyller).
   * Yan etkisi de istenen bir şey: 23 kart iki sütunda tek kartı
   * son satırda yalnız bırakıyordu; geniş kart 1 + 22 yapıyor.
   */
  wide?: boolean;
}

/** Okuma sırası — imza önce, sonra sofra, sonra bar. */
export const MENU_CARDS: MenuCard[] = [
  { key: 'kokteyller',         title: 'Kokteyller',          sectionSlug: 'kokteyller', subs: ['kokteyller'], icon: 'martini', wide: true },

  /* Kapaklar elle seçildi: varsayılan "fotoğraflı ilk ürün" Burgerler'de
     hot dog'u, Ana Yemekler'de schnitzel'i kapağa çıkarıyordu. */
  { key: 'aperatifler',        title: 'Aperatifler',         sectionSlug: 'yiyecekler', subs: ['aperatifler'] },
  { key: 'salatalar',          title: 'Salatalar',           sectionSlug: 'yiyecekler', subs: ['salatalar'] },
  { key: 'makarnalar',         title: 'Makarnalar',          sectionSlug: 'yiyecekler', subs: ['makarnalar'] },
  { key: 'pizzalar',           title: 'Pizzalar',            sectionSlug: 'yiyecekler', subs: ['pizzalar'],     cover: 'leo-pizza' },
  { key: 'burgerler',          title: 'Burgerler',           sectionSlug: 'yiyecekler', subs: ['burgerler'],    cover: 'cheese-burger' },
  { key: 'bowllar',            title: 'Bowllar',             sectionSlug: 'yiyecekler', subs: ['bowllar'] },
  { key: 'ana-yemekler',       title: 'Ana Yemekler',        sectionSlug: 'yiyecekler', subs: ['ana-yemekler'], cover: 'antrikot' },
  { key: 'sushi',              title: 'Sushi',               sectionSlug: 'yiyecekler', subs: ['sushi'] },

  { key: 'cerez',              title: 'Çerez',               sectionSlug: 'yaninda',    subs: ['cerez'] },
  { key: 'meyve-ve-meze',      title: 'Meyve & Meze',        sectionSlug: 'yaninda',    subs: ['meyve-ve-meze'] },

  /* İkonlar: Phosphor (thin) ya da müşterinin referansından çizilenler
     (tumbler, highball, shot, cordial). Ayrıntı lib/icons.ts'te. */
  { key: 'biralar',            title: 'Biralar',             sectionSlug: 'bira-sarap', subs: ['biralar'],            icon: 'beer-stein' },
  { key: 'saraplar',           title: 'Şaraplar',            sectionSlug: 'bira-sarap', subs: ['saraplar'],           icon: 'wine' },

  { key: 'viskiler',           title: 'Viskiler',            sectionSlug: 'ickiler',    subs: ['viskiler'],           icon: 'tumbler' },
  { key: 'viski-siseler',      title: 'Viski Şişeler',       sectionSlug: 'ickiler',    subs: ['viski-siseler'],      icon: 'beer-bottle' },
  { key: 'cinler',             title: 'Cinler',              sectionSlug: 'ickiler',    subs: ['cinler'],             icon: 'brandy' },
  { key: 'vodkalar',           title: 'Vodkalar',            sectionSlug: 'ickiler',    subs: ['vodkalar'],           icon: 'pint-glass' },
  { key: 'romlar',             title: 'Romlar',              sectionSlug: 'ickiler',    subs: ['romlar'],             icon: 'tumbler' },
  { key: 'raki',               title: 'Rakı',                sectionSlug: 'ickiler',    subs: ['raki'],               icon: 'highball' },
  { key: 'likorler',           title: 'Likörler',            sectionSlug: 'ickiler',    subs: ['likorler'],           icon: 'cordial' },
  { key: 'shotlar',            title: 'Shotlar',             sectionSlug: 'ickiler',    subs: ['shotlar'],            icon: 'shot' },
  { key: 'altili-shotlar',     title: "6'lı Shotlar",        sectionSlug: 'ickiler',    subs: ['altili-shotlar'],     icon: 'cheers' },

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
  const subs: Subsection[] = card.subs
    .map((s) => sec.subs.find((x) => x.slug === s))
    .filter((x): x is Subsection => Boolean(x));

  return {
    slug: card.key,
    title: card.title,
    vat: sec.vat,
    subs,
    count: subs.reduce((n, s) => n + s.items.length, 0),
  };
};

/** Kartın kapsadığı bütün ürünler, DOM sırasında. */
export const cardItems = (card: MenuCard): MenuItem[] =>
  cardSection(card).subs.flatMap((s) => s.items);

/**
 * Kart kapağı: açıkça verilmişse o, yoksa fotoğrafı olan ilk ürün.
 * Hiçbiri yoksa null — sağ yarıyı ikon ya da baş harf dolduruyor.
 */
export const cardPhoto = (card: MenuCard): string | null => {
  if (card.cover && hasPhoto(card.cover)) return card.cover;
  return cardItems(card).find((i) => hasPhoto(i.slug))?.slug ?? null;
};
