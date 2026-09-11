import { defineConfig } from 'astro/config';

/* ============================================================
   leo-lounge — TEK SAYFALIK tanıtım sitesi.

   Cloudflare Pages hedefi: tamamen statik çıktı, adapter yok.

   Bu proje cafe-leo'nun kopyası DEĞİL. Menü verisi, ürün fotoğrafları
   ve menü bileşenleri burada yok — yalnız landing page var. Lounge'un
   menüsü yazıldığında bu projeye eklenecek; o güne kadar taşınacak
   ölü ağırlık da yok.

   Tailwind BAĞIMLILIĞI DA YOK: cafe-leo'da @theme yalnız utility
   köprüsü kuruyordu ve bu sayfada tek bir utility sınıfı kullanılmıyor.
   Tokenlar düz CSS değişkeni olarak duruyor.
   ============================================================ */

export default defineConfig({
  output: 'static',
  site: 'https://leo-lounge.onlinemenu-qr.com',
});
