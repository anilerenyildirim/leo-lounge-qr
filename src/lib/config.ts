import { photoOf } from '../data/menu';

/* ============================================================
   Sunum öncesi çevrilebilir anahtarlar.
   ============================================================ */

/**
 * Fotoğraf genel anahtarı. Kapatılırsa site tamamen tipografik kalır.
 *
 * Fotoğraflar CDN'de (`cdn.onlinemenu-qr.com/leo-lounge/lounge/…`).
 * Adres menu.json + slug'dan türetiliyor, bkz. `data/menu.ts → photoSrc`.
 */
export const FOTO_VAR = true;

/**
 * Tipografik kalan GRUPLAR (alt kategori slug'ları).
 *
 * Kural cafe-leo'dan alındı ve burada da geçerli:
 * GRUBUN TAMAMININ fotoğrafı varsa fotoğraflı. Yarısı eksik grup
 * fotoğraflı yapılmaz — tek fotoğraflı satırın yanında dört boş
 * satır, hiç fotoğraf olmamasından kötü görünür.
 *
 * Lounge'da bu kural kendiliğinden uyguladı: 46 yemek ürününün
 * 31'inin karesi var ve eksik 15'i ÜÇ kategoride toplanıyor
 * (Aperatifler 0/5, Çerez 0/4, Meyve & Meze 0/6). Yani yarım kalan
 * tek bir yemek grubu YOK; üçü tamamen tipografik, yedisi tamamen
 * fotoğraflı.
 *
 * İÇKİLER LİSTESİ ZATEN TİPOGRAFİK ve öyle kalmalı: 186 ürünün
 * (viski, şarap, bira, likör) hiçbirinin karesi yok, olması da
 * gerekmiyor — şişe fotoğrafı menüye bilgi katmaz. Burada tek tek
 * SAYILMIYORLAR: bir grupta hiç fotoğraf yoksa `groupIsPhoto` onu
 * zaten tipografik sayıyor. Aşağıdaki liste yalnız "fotoğrafı VAR
 * ama yine de tipografik dursun" kararlarını tutuyor.
 */
export const NO_PHOTO: string[] = [
  'aperatifler',   // 0/5
  'cerez',         // 0/4
  'meyve-ve-meze', // 0/6
  /* Kokteyller: 23 üründen 14'ünün karesi qrall'da duruyor ama
     CDN'e taşınmadı; bugün elimizde dosya YOK. Dosyalar gelince
     karar yeniden verilecek — 14/23 yarım grup olduğu için önce
     eksik 9 kare çekilmeli, yoksa burada kalmalı. */
  'kokteyller',
];

/**
 * Grup ELLE tipografiğe çekilmiş mi? Yalnız yukarıdaki listeye bakar.
 * Tek başına düzen kararı DEĞİL — bkz. `groupIsPhoto`.
 */
export const isPhotoGroup = (group: string): boolean =>
  FOTO_VAR && !NO_PHOTO.includes(group);

/**
 * Grup fotoğraf öncelikli düzende mi? DÜZEN KARARI BU.
 *
 * İki kapı: elle verilen karar (NO_PHOTO) ve grubun elinde gerçekten
 * kare olup olmadığı. İkincisi olmadan 186 içki ürünü "fotoğraflı
 * grup" sayılıyordu — hiçbirinin karesi olmadığı için ekranda fark
 * edilmiyordu ama sütun düzenini yanlış yere bağlıyordu.
 *
 * Veriden türetiliyor, listeden değil: yeni bir içki kategorisi
 * eklendiğinde hiçbir yere yazmak gerekmiyor.
 */
export const groupIsPhoto = (group: string, slugs: string[]): boolean =>
  isPhotoGroup(group) && slugs.some(hasPhoto);

/**
 * Fotoğrafı GERÇEKTEN var mı? Grup kapısını atlar.
 * Küratörlü yerlerde (kart kapağı) doğrudan bu kullanılır.
 */
export const hasPhoto = (slug: string): boolean => FOTO_VAR && photoOf(slug) !== null;

/**
 * Bu ürün liste içinde görsel basacak mı?
 *
 * Üç kapı: genel anahtar → grubun düzeni → fotoğrafın gerçekten var
 * olması. Üçü de geçmezse <img> hiç üretilmez — 404 yok, düzen
 * sıçraması yok, satır DOĞUŞTAN tipografik gelir.
 */
export const itemHasPhoto = (slug: string, group: string): boolean =>
  isPhotoGroup(group) && hasPhoto(slug);
