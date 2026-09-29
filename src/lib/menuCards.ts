/* ============================================================
   MENÜ KARTLARI — /menu kategori ızgarası

   KARTLAR VERİDEN TÜRETİLİYOR. menu.json'daki her bölüm bir kart;
   kartın adı, sırası ve içindeki ürünler panelden geliyor. Panelde
   açılan yeni bölüm siteye kod değişmeden kart olarak gelir, bölüm
   adı değişirse kart adı da değişir.

   Önceden burada elle yazılmış 24 kartlık bir harita vardı ve
   menu.json'un 6 depolama bölümünü okuma düzenine çeviriyordu
   (İmza kokteyller slug listesiyle ayrılıyor, şaraplar kodla
   sıralanıyordu). cafe-leo'da aynı harita 11 Eylül 2026'da panelden
   eklenen ürünleri görünmez yapmış, kategori ağacı düzelince on iki
   sayfayı SESSİZCE boşaltmıştı. 29 Eylül 2026'da okuma düzeni veriye
   taşındı: menu.json artık 24 bölüm, sıra ve ayrım orada.
   Panelin kuralı: SİTE "nasıl görünsün"e, VERİ "ne var"a karar verir.

   TASARIM KARARLARI BURADA KALIYOR — kapak ürünü, bardak ikonu, geniş
   kart. Bunlar görünüm, veri değil. Bölüm slug'ına bağlılar ve slug
   verideki bir bölüme karşılık gelmezse DERLEME DURUYOR: panelde bölüm
   adı/slug'ı değişip buradaki karar boşa düşerse müşteri görmeden
   Pages kırmızı yanar.

   Tasarım kaydı olmayan (panelden yeni açılmış) bölüm yine çalışır:
   kapağı fotoğraflı ilk ürün, yoksa sade yazı kartı.

   KARTIN SAĞ YARISI — üç durum, öncelik sırasıyla:
     1. fotoğraf  — kapak ürünün karesi (cover ya da fotoğraflı ilk ürün)
     2. ikon      — fotoğrafı olmayan İÇECEK kartları (lib/icons.ts)
     3. hiçbiri   — fotoğrafı henüz gelmemiş YEMEK kartları: fotoğrafsız,
                    yalnız yazı. Yer tutucu yok (müşteri kararı, 11 Eylül).
   Yemekte ikon yok, çünkü onların fotoğrafı gelecek.
   ============================================================ */

import { LOUNGE, type Section } from '../data/menu';
import { hasPhoto, NO_PHOTO } from './config';
import type { IconName } from './icons';

export interface MenuCard {
  /** URL parçası: /menu/<key> — bölümün slug'ı */
  key: string;
  /** kart üzerinde ve kategori sayfasının başlığında yazan ad — bölümün adı */
  title: string;
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
}

type Tasarim = Pick<MenuCard, 'cover' | 'icon' | 'wide'>;

/** Bölüm slug'ı → görünüm kararı. Sıra burada DEĞİL, veride. */
const TASARIM: Record<string, Tasarim> = {
  /* Kapaklar elle seçildi: varsayılan "fotoğraflı ilk ürün" Burgerler'de
     hot dog'u, Ana Yemekler'de schnitzel'i, Bowllar'da bonfileyi
     kapağa çıkarıyordu. */
  'bowllar':            { cover: 'karidesli-bowl' },
  'pizzalar':           { cover: 'leo-pizza' },
  'burgerler':          { cover: 'cheese-burger' },
  'ana-yemekler':       { cover: 'antrikot' },

  'imza-kokteyller':    { icon: 'cocktail-olive', wide: true },
  'kokteyller':         { icon: 'cocktail', wide: true },

  /* İkonlar: Phosphor (thin) ya da elle çizilenler. Ayrıntı
     lib/icons.ts'te. */
  'biralar':            { icon: 'beer-stein' },
  'saraplar':           { icon: 'wine-glass' },
  'viskiler':           { icon: 'tumbler' },
  'viski-siseler':      { icon: 'ice-bucket' },
  'cinler':             { icon: 'tumbler-gin' },
  'vodkalar':           { icon: 'vodka' },
  'romlar':             { icon: 'tumbler-rum' },
  'raki':               { icon: 'highball' },
  'likorler':           { icon: 'liqueur' },
  'shotlar':            { icon: 'shot' },
  'altili-shotlar':     { icon: 'shots-clink' },
  'alkolsuz-icecekler': { icon: 'orange-slice' },
};

const SECTIONS: Section[] = LOUNGE.sections ?? [];

/* ── derleme anı doğrulaması ──────────────────────────────────
   Koda gömülü her slug veride olmalı. Sessiz boş kart yerine
   kırmızı derleme. */
{
  const bolumler = new Set(SECTIONS.map((s) => s.slug));
  const gruplar = new Set(SECTIONS.flatMap((s) => s.subs.map((u) => u.slug)));
  const urunler = new Set(SECTIONS.flatMap((s) => s.subs.flatMap((u) => u.items.map((i) => i.slug))));
  const sorun = [
    ...Object.keys(TASARIM).filter((k) => !bolumler.has(k)).map((k) => `tasarım kaydı, bölüm yok: ${k}`),
    ...Object.entries(TASARIM).filter(([, t]) => t.cover && !urunler.has(t.cover))
      .map(([k, t]) => `kapak ürünü yok: ${k} → ${t.cover}`),
    ...NO_PHOTO.filter((g) => !gruplar.has(g)).map((g) => `NO_PHOTO grubu yok: ${g}`),
  ];
  if (sorun.length) throw new Error(`menuCards: menu.json ile ayrıştı\n  ${sorun.join('\n  ')}`);
}

export const MENU_CARDS: MenuCard[] = SECTIONS.map((sec) => ({
  key: sec.slug,
  title: sec.title,
  ...TASARIM[sec.slug],
}));

/** Kartın açtığı bölüm — Section.astro'nun beklediği şekil. */
export const cardSection = (card: MenuCard): Section => {
  const sec = SECTIONS.find((s) => s.slug === card.key);
  if (!sec) throw new Error(`menuCards: bölüm bulunamadı → ${card.key}`);
  return sec;
};

/** Kartın kapsadığı bütün ürünler, DOM sırasında. */
export const cardItems = (card: MenuCard) => cardSection(card).subs.flatMap((s) => s.items);

/**
 * Kart kapağı: açıkça verilmişse o, yoksa fotoğrafı olan ilk ürün.
 * Hiçbiri yoksa null — sağ yarıda ikon ya da hiçbir şey durur.
 */
export const cardPhoto = (card: MenuCard): string | null => {
  if (card.cover && hasPhoto(card.cover)) return card.cover;
  return cardItems(card).find((i) => hasPhoto(i.slug))?.slug ?? null;
};
