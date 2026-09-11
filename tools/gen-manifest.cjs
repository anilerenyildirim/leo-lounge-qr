const fs = require('fs');
const { manifest, missingPhoto, qrallPhoto } = JSON.parse(fs.readFileSync(require('path').join(__dirname,'manifest.json'), 'utf8'));

const byCat = {};
for (const m of manifest) (byCat[m.cat] = byCat[m.cat] || []).push(m);

const L = [];
L.push('# Fotoğraf manifestosu — leo-lounge');
L.push('');
L.push('Hedef: `cdn.onlinemenu-qr.com/leo-lounge/lounge/<slug>.webp`');
L.push('');
L.push('Adres menu.json tarafından DEĞİL slug tarafından belirleniyor');
L.push('(`src/data/menu.ts → photoSrc`), bu yüzden dosya adı ürün slug\'ıyla');
L.push('BİREBİR aynı olmalı. Tablodaki "yeni ad" yüklerken kullanılacak addır.');
L.push('');
L.push('Kaynak klasör: `LEO_FOTO_DIR` ortam değişkeni (bkz. tools/README.md)');
L.push('');
L.push('Hepsi 1200×800 webp — ölçü dosya başlığından okundu ve menu.json\'a');
L.push('öyle yazıldı, elle girilmedi.');
L.push('');
L.push('Dosyalar yüklenene kadar site KIRILMIYOR: eksik kare çalışma anında');
L.push('söküllüp satır/kart tipografiğe düşüyor (`src/scripts/app.ts` §2).');
L.push('');
L.push('---');
L.push('');
L.push(`## Yüklenecek ${manifest.length} dosya`);
L.push('');

for (const [cat, list] of Object.entries(byCat)) {
  L.push(`### ${cat}`);
  L.push('');
  L.push('| klasördeki ad | yüklenecek ad | ad değişiyor mu |');
  L.push('|---|---|---|');
  for (const m of list) {
    L.push(`| \`${m.file}\` | \`${m.slug}.webp\` | ${m.renamed ? '**evet**' : 'hayır'} |`);
  }
  L.push('');
}

L.push('---');
L.push('');
L.push(`## Fotoğrafı olmayan ${missingPhoto.length} yemek`);
L.push('');
L.push('Bu üç kategorinin HİÇBİR ürününde kare yok — ne klasörde ne qrall\'da.');
L.push('Üçü de tamamen tipografik duruyor; yarım kalan grup yok.');
L.push('');
for (const m of missingPhoto) L.push(`- ${m}`);
L.push('');
L.push('Çekilirlerse `src/lib/config.ts → NO_PHOTO` listesinden ilgili grubu');
L.push('silmek yeterli; başka hiçbir yere dokunulmuyor.');
L.push('');
L.push('---');
L.push('');
L.push(`## qrall'da karesi olup elimizde olmayan ${qrallPhoto.length} ürün`);
L.push('');
L.push('Hepsi kokteyl. qrall\'ın kendi deposunda (`minio-api-prod.qrall.co`)');
L.push('duruyorlar ama CDN\'e taşınmadılar.');
L.push('');
for (const m of qrallPhoto) L.push(`- ${m}`);
L.push('');
L.push('Kokteyller kategorisinde 23 ürün var; bu 14 kare grubu TAMAMLAMIYOR.');
L.push('"Grubun tamamı varsa fotoğraflı" kuralı gereği kategori şu an');
L.push('tipografik (`src/lib/config.ts → NO_PHOTO`). Eksik 9 kokteylin karesi');
L.push('çekilirse kategori fotoğraflıya döner.');
L.push('');

const out = L.join('\n');
fs.writeFileSync(require('path').join(__dirname,'..','FOTO-MANIFESTO.md'), out, 'utf8');
console.log('FOTO-MANIFESTO.md yazıldı —', out.length, 'bayt,', manifest.length, 'dosya');
