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

   KART SAYISI 23 ve kaynaktaki kategorilerle BİREBİR. Kategoriler
   birleştirilmedi: müşteri bu listeyi qrall menüsünden ve basılı
   menüden zaten böyle tanıyor. Birleştirme gerekirse (ör. Shotlar +
   6'lı Shotlar, ya da Çerez + Meyve & Meze) burada tek kayıt
   değişir — veriye dokunulmaz.

   SIRA KAYNAKTAKİ SIRA DEĞİL. qrall'da Salatalar en sonda, Sushi
   ortada duruyordu; o bir veri giriş sırası, okuma sırası değil.
   Burada Kokteyller başa alındı (mekanın imzası), yemekler bir
   arada, içkiler bir arada.

   KAPAK: kategoriyi en iyi anlatan ÜRÜNÜN kendi fotoğrafı. Ayrı bir
   kapak görseli seti yok. Kapağı olmayan kart kırılmıyor, tipografik
   basılıyor (bkz. CatCard.astro → .no-shot).
   ============================================================ */

import { LOUNGE, type MenuItem, type Section, type Subsection } from '../data/menu';
import { hasPhoto } from './config';

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
}

/** Okuma sırası — imza önce, sonra sofra, sonra bar. */
export const MENU_CARDS: MenuCard[] = [
  { key: 'kokteyller',         title: 'Kokteyller',          sectionSlug: 'kokteyller', subs: ['kokteyller'] },

  { key: 'aperatifler',        title: 'Aperatifler',         sectionSlug: 'yiyecekler', subs: ['aperatifler'] },
  { key: 'salatalar',          title: 'Salatalar',           sectionSlug: 'yiyecekler', subs: ['salatalar'] },
  { key: 'makarnalar',         title: 'Makarnalar',          sectionSlug: 'yiyecekler', subs: ['makarnalar'] },
  { key: 'pizzalar',           title: 'Pizzalar',            sectionSlug: 'yiyecekler', subs: ['pizzalar'] },
  { key: 'burgerler',          title: 'Burgerler',           sectionSlug: 'yiyecekler', subs: ['burgerler'] },
  { key: 'bowllar',            title: 'Bowllar',             sectionSlug: 'yiyecekler', subs: ['bowllar'] },
  { key: 'ana-yemekler',       title: 'Ana Yemekler',        sectionSlug: 'yiyecekler', subs: ['ana-yemekler'] },
  { key: 'sushi',              title: 'Sushi',               sectionSlug: 'yiyecekler', subs: ['sushi'] },

  { key: 'cerez',              title: 'Çerez',               sectionSlug: 'yaninda',    subs: ['cerez'] },
  { key: 'meyve-ve-meze',      title: 'Meyve & Meze',        sectionSlug: 'yaninda',    subs: ['meyve-ve-meze'] },

  { key: 'biralar',            title: 'Biralar',             sectionSlug: 'bira-sarap', subs: ['biralar'] },
  { key: 'saraplar',           title: 'Şaraplar',            sectionSlug: 'bira-sarap', subs: ['saraplar'] },

  { key: 'viskiler',           title: 'Viskiler',            sectionSlug: 'ickiler',    subs: ['viskiler'] },
  { key: 'viski-siseler',      title: 'Viski Şişeler',       sectionSlug: 'ickiler',    subs: ['viski-siseler'] },
  { key: 'cinler',             title: 'Cinler',              sectionSlug: 'ickiler',    subs: ['cinler'] },
  { key: 'vodkalar',           title: 'Vodkalar',            sectionSlug: 'ickiler',    subs: ['vodkalar'] },
  { key: 'romlar',             title: 'Romlar',              sectionSlug: 'ickiler',    subs: ['romlar'] },
  { key: 'raki',               title: 'Rakı',                sectionSlug: 'ickiler',    subs: ['raki'] },
  { key: 'likorler',           title: 'Likörler',            sectionSlug: 'ickiler',    subs: ['likorler'] },
  { key: 'shotlar',            title: 'Shotlar',             sectionSlug: 'ickiler',    subs: ['shotlar'] },
  { key: 'altili-shotlar',     title: "6'lı Shotlar",        sectionSlug: 'ickiler',    subs: ['altili-shotlar'] },

  { key: 'alkolsuz-icecekler', title: 'Alkolsüz İçecekler',  sectionSlug: 'alkolsuz',   subs: ['alkolsuz-icecekler'] },
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
 * Hiçbiri yoksa null — kart tipografik basılır.
 */
export const cardPhoto = (card: MenuCard): string | null => {
  if (card.cover && hasPhoto(card.cover)) return card.cover;
  return cardItems(card).find((i) => hasPhoto(i.slug))?.slug ?? null;
};
