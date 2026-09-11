# tools — menü verisi üreteci

`src/data/menu.json` ELLE DÜZENLENMEZ. Kaynağı Lounge'un eski QR
menüsü (qrall.co) ve bu klasördeki üreteç.

## Kullanım

```
LEO_FOTO_DIR="<webp klasörü>" node tools/gen-menu.cjs   # api/*.json → src/data/menu.json
node tools/gen-manifest.cjs   # → FOTO-MANIFESTO.md
```

## Kaynak nasıl çekildi

qrall Next.js SSR; `curl` sayfaya 500 dönüyor, tarayıcı çalışıyor.
Ürünler bu uçtan geliyor:

```
https://viewapi.qrall.co/api/app/catalog/categories-with-variants-from-cache
  ?categoryId=<kategori>&tenantId=3a1ce59e-b49b-4648-c3d8-8760408ae5c4
```

Kategori id listesi `view.qrall.co/tr/categories` sayfasından çıkarıldı.
23 kategorinin ham yanıtı `tools/api/01..23.json` altında duruyor —
kaynak yarın kapanırsa veri yine elimizde.

## Elle verilen kararlar

Üretecin içindeki tablolar, dosyanın kendi başlığında açıklanıyor:

- `SOURCE`       — kategori slug ve başlıkları
- `SECTIONS`     — depolama ağacı (okuma sırası `src/lib/menuCards.ts`'te)
- `TEYIT`        — kaynaktaki şüpheli yazımlar; DÜZELTİLMİYOR, işaretleniyor
- `PHOTO_ALIAS`  — ürün slug'ı ↔ klasördeki dosya adı
- `ACRONYM`      — başlık düzeninde büyük kalanlar (DLC, IPA, VS…)
- `LATIN_I`      — Türkçe I→ı kuralının bozduğu yabancı sözcükler
                   (PASSION → passıon olurdu); 43 sözcük tek tek
                   gözden geçirilip 12'si listeye alındı

## Logo

```
npm i --no-save sharp
node tools/logo.cjs          # kökteki LeoLogo.PNG → public/brand/leo-lounge-logo.png
```

Müşterinin dosyası adına rağmen beyaz zeminli bir JPEG. Betik zemini
saydam yapıyor, altını koruyor, siyah "lounge" yazısını sitenin beyazına
çeviriyor. Kaynak dosya repoda değil (.gitignore). Oran değişirse
`global.css → .logo { --logo-ar }` ve `Logo.astro` width/height güncellenir.
