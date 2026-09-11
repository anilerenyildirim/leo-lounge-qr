/* ============================================================
   leo-lounge — landing page'in ihtiyaç duyduğu KADAR veri.

   Burada menu.json YOK. Bu proje bir menü sitesi değil, tek sayfalık
   bir tanıtım sayfası; iki mekanın adı, bir cümlesi ve iki bağlantısı
   dışında hiçbir şeye ihtiyacı yok. Ürün listesi, fiyat ve fotoğraf
   cafe-leo'da duruyor ve oraya ait.

   İki kaynak arasında ELLE EŞLENEN alanlar: mekan adları, taglineler,
   mapsUrl ve instagram. Bunlar yılda bir değişen şeyler; ortak bir
   paket kurmanın maliyeti bugün kazandıracağından fazla. Değişirlerse
   cafe-leo/src/data/menu.json ile buranın aynı anda güncellenmesi
   gerekiyor — not düşülmüştür.
   ============================================================ */

export interface Venue {
  key: 'cafe' | 'lounge';
  name: string;
  tagline: string;
  mapsUrl: string;
  instagram: string;
}

export const CAFE: Venue = {
  key: 'cafe',
  name: 'Cafe Leo Teras',
  tagline: 'Sabah kahvesinden gün batımına, terasta.',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=40.9957484,28.5397417&query_place_id=ChIJO89T4VBntRQR32ZYApreDUI',
  instagram: 'https://www.instagram.com/cafeleoteras/',
};

export const LOUNGE: Venue = {
  key: 'lounge',
  name: 'Leo Lounge',
  tagline: 'Işık kısılır, gün üzerinden düşer.',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=40.9985511,28.5438501&query_place_id=ChIJo3xPAABntRQRV_qZNT6yuG8',
  instagram: 'https://www.instagram.com/leolounge.ist/',
};

/**
 * Lounge menüsü yayında mı?
 *
 * TEK ANAHTAR. Menü bu projeye eklendiğinde `true` yapılır ve landing
 * page'deki "Menü yakında" etiketi gerçek bir "Menü" butonuna döner.
 * 11 Eylül 2026: AÇILDI. /menu ve 23 kategori sayfası yayında.
 */
export const MENU_READY = true;
