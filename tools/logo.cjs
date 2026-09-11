/* ============================================================
   Logo dönüştürücü — müşterinin logosu → public/brand/leo-lounge-logo.png

   Müşteriden gelen dosya (`LeoLogo.PNG`) adına rağmen BEYAZ ZEMİNLİ BİR
   JPEG. Koyu sitede beyaz kutu olarak dururdu. Bu betik:
     · kenardaki ince gri çerçeveyi kırpar
     · altın pikselleri altın bırakır (kenar yumuşatması korunarak:
       beyaz→altın doğrusu üzerindeki konum = opaklık)
     · siyah "lounge" yazısını sitenin beyazına çevirir (müşteri izni;
       siyah antrasit zeminde görünmüyordu)
     · beyaz zemini saydam yapar, içeriğe kırpar, 600px yüksekliğe indirir

   Renkler sabit yazılmadı, görselin kendisinden ölçülüyor (altın,
   mürekkep, zemin) — logo değişirse betik yeniden koşturulur.

   KULLANIM (sharp proje bağımlılığı DEĞİL, tek seferlik):
     npm i --no-save sharp
     node tools/logo.cjs                      # kökteki LeoLogo.PNG
     LEO_LOGO_SRC="<dosya>" node tools/logo.cjs

   Kaynak dosya repoda değil (.gitignore) — yerelde duruyor.
   ============================================================ */

const path = require('path');
const os = require('os');
const sharp = require('sharp');

const SRC = process.env.LEO_LOGO_SRC || path.join(__dirname, '..', 'LeoLogo.PNG');
const OUT = path.join(__dirname, '..', 'public', 'brand', 'leo-lounge-logo.png');
const PREVIEW = path.join(os.tmpdir(), 'leo-logo-onizleme-antrasit.png');
const TEXT = [237, 230, 216]; // --text
const EDGE = 8;               // kaynağın kenarındaki ince gri çerçeve
const TARGET_H = 600;

(async () => {
  const meta = await sharp(SRC).metadata();
  console.log('kaynak:', meta.format, `${meta.width}x${meta.height}`, 'alfa:', meta.hasAlpha);

  const { data, info } = await sharp(SRC)
    .extract({ left: EDGE, top: EDGE, width: meta.width - 2 * EDGE, height: meta.height - 2 * EDGE })
    .removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;

  // --- ölçüm: gerçek renkler
  const sat = (r, g, b) => {
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    return (mx - mn) / (255 - mn + 1);
  };
  const acc = { gold: [0, 0, 0, 0], ink: [0, 0, 0, 0], bg: [0, 0, 0, 0] };
  for (let i = 0; i < W * H; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const k = mx - mn > 120 && b < 110 ? 'gold' : mx < 70 ? 'ink' : mn > 245 ? 'bg' : null;
    if (k) { acc[k][0] += r; acc[k][1] += g; acc[k][2] += b; acc[k][3]++; }
  }
  const avg = (a) => a.slice(0, 3).map((v) => Math.round(v / a[3]));
  const gold = avg(acc.gold), ink = avg(acc.ink), WHITE = avg(acc.bg);
  console.log('altın:', gold, '| mürekkep:', ink, '| zemin:', WHITE);

  const gw = [WHITE[0] - gold[0], WHITE[1] - gold[1], WHITE[2] - gold[2]];
  const gw2 = gw[0] ** 2 + gw[1] ** 2 + gw[2] ** 2;
  const inkMax = Math.max(...ink), whiteMax = Math.max(...WHITE);

  // --- ayrıştırma
  const out = Buffer.alloc(W * H * 4);
  let minX = W, minY = H, maxX = -1, maxY = -1;
  for (let i = 0; i < W * H; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    let a, col;
    if (sat(r, g, b) > 0.35) {
      const d = [WHITE[0] - r, WHITE[1] - g, WHITE[2] - b];
      a = (d[0] * gw[0] + d[1] * gw[1] + d[2] * gw[2]) / gw2;
      col = gold;
    } else {
      a = (whiteMax - Math.max(r, g, b)) / (whiteMax - inkMax);
      col = TEXT;
    }
    const A = Math.round(Math.min(1, Math.max(0, a)) * 255);
    out.set([col[0], col[1], col[2], A], i * 4);
    if (A > 10) {
      const x = i % W, y = (i / W) | 0;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }

  const cw = maxX - minX + 1, ch = maxY - minY + 1;
  const pad = Math.round(Math.max(cw, ch) * 0.02);
  const trimmed = await sharp(out, { raw: { width: W, height: H, channels: 4 } })
    .extract({ left: minX, top: minY, width: cw, height: ch })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();

  const final = await sharp(trimmed).resize({ height: TARGET_H }).png({ compressionLevel: 9 }).toBuffer();
  await sharp(final).toFile(OUT);
  const fm = await sharp(final).metadata();
  console.log('çıktı:', OUT, `${fm.width}x${fm.height}`, 'en/boy', (fm.width / fm.height).toFixed(4));
  console.log('→ oran değiştiyse global.css → .logo { --logo-ar } ve Logo.astro width/height güncellenmeli.');

  await sharp(final).flatten({ background: '#15181B' }).resize({ height: 420 }).toFile(PREVIEW);
  console.log('antrasit önizleme:', PREVIEW);
})().catch((e) => { console.error(e); process.exit(1); });
