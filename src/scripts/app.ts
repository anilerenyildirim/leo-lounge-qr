/* ============================================================
   LEO LOUNGE — menü sayfalarının davranış katmanı.

   Üç iş var, üçü de menüye ait:
     1  büyük görünüm — fotoğrafa tıklayınca (§1)
     2  eksik kare    — CDN şemanın gerisindeyse (§2)
     3  geri tuşu     — doğrudan açılan kategori sayfası (§3)

   cafe-leo'nun app.ts'inde bunlardan başka scroll spy, öneri şeridi,
   mekan anahtarı morph'u ve açık/kapalı durumu da var. Hiçbiri buraya
   TAŞINMADI, çünkü karşılıkları yok: ray yok (ızgara gezindiriyor),
   şerit yok (seçki verilmedi), ikinci mekan yok, saat verisi yok.
   Taşınacak ölü ağırlık da yok.

   ClientRouter sayfa geçişlerini devralıyor, o yüzden kurulum
   `astro:page-load`'a bağlı — DOMContentLoaded ikinci sayfada bir
   daha ateşlenmez.
   ============================================================ */

const RM = matchMedia('(prefers-reduced-motion: reduce)');

/* ============================================================
   1 — BÜYÜK GÖRÜNÜM

   Veri kaynağı DOM'un kendisi: her ürün satırı zaten adı, fiyatı ve
   açıklamasını taşıyor. Ayrı bir JSON basılmıyor — aynı gerçek iki
   yerde durmasın, sayfa da şişmesin.

   <dialog> seçildi: focus trap ve Esc tarayıcıdan geliyor, arkadaki
   içerik inert oluyor. Zemin ::backdrop DEĞİL, dialog'un kendi
   zemini (::backdrop özel özellikleri her tarayıcıda miras almıyor).
   ============================================================ */

function lightbox(): void {
  const lb = document.getElementById('lb') as HTMLDialogElement | null;
  const triggers = [...document.querySelectorAll<HTMLElement>('[data-lb]')];
  if (!lb || !triggers.length) return;

  const img = document.getElementById('lbImg') as HTMLImageElement;
  const nameEl = document.getElementById('lbName')!;
  const priceEl = document.getElementById('lbPrice')!;
  const descEl = document.getElementById('lbDesc')!;

  /** slug → ürün satırı (adın, fiyatın, açıklamanın kaynağı) */
  const rows = new Map<string, HTMLElement>();
  /** FOTOĞRAFLI slug'lar, DOM sırasında — okla gezinmenin sırası */
  const order: string[] = [];

  for (const it of document.querySelectorAll<HTMLElement>('.item[data-slug]')) {
    const s = it.dataset['slug']!;
    if (!rows.has(s)) rows.set(s, it);
    if (it.querySelector('.shot img')) order.push(s);
  }

  let opener: HTMLElement | null = null;
  let slug = '';
  let closing = 0;

  const fill = (s: string): boolean => {
    const row = rows.get(s);
    const src = row?.querySelector<HTMLImageElement>('.shot img')?.getAttribute('src');
    if (!src) return false;

    /* EN-BOY ORANI SATIRDAN GELİYOR, buraya sayı yazılmıyor.
       Bugün her kutu 3:2 ama yarın bir grup kare olursa büyük görünüm
       yeniden kırpmasın diye satırın hesaplanmış değeri okunuyor. */
    const shotEl = row?.querySelector<HTMLElement>('.shot');
    const ar = shotEl ? getComputedStyle(shotEl).aspectRatio : '';
    lb.style.setProperty('--shot-ar', ar && ar !== 'auto' ? ar : '3 / 2');

    slug = s;
    img.src = src;

    const name = row?.querySelector('.name')?.textContent?.trim() ?? '';
    img.alt = name;
    nameEl.textContent = name;

    const price = row?.querySelector('.price')?.textContent?.trim() ?? '';
    priceEl.textContent = price;
    priceEl.hidden = !price;

    const desc = row?.querySelector('.desc')?.textContent?.trim() ?? '';
    descEl.textContent = desc;
    descEl.hidden = !desc;

    return true;
  };

  const open = (trigger: HTMLElement) => {
    if (!fill(trigger.dataset['lb']!)) return;

    opener = trigger;
    clearTimeout(closing);

    // scrollbar payı: overflow:hidden sayfayı yana sıçratmasın
    const gap = window.innerWidth - document.documentElement.clientWidth;
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    document.body.classList.add('lb-lock');

    lb.showModal();
    /* Geçişin başlaması için kapalı durumun bir kez hesaplanmış olması
       gerekiyor. rAF'a bırakılmıyor: arka plandaki sekmede rAF kısılıyor
       ve katman opacity:0'da takılı kalabiliyor. Zorunlu reflow bunu her
       koşulda garanti ediyor. */
    void lb.offsetWidth;
    lb.classList.add('is-open');
  };

  const finish = () => {
    lb.close();
    document.body.classList.remove('lb-lock');
    document.body.style.paddingRight = '';
    opener?.focus({ preventScroll: true });
    opener = null;
  };

  const close = () => {
    if (!lb.open) return;
    lb.classList.remove('is-open');
    clearTimeout(closing);
    closing = window.setTimeout(finish, RM.matches ? 0 : 160);
  };

  /** Sağa/sola. Sınırda durur, döngü yapmaz. */
  const step = (dir: 1 | -1) => {
    const i = order.indexOf(slug) + dir;
    if (i < 0 || i >= order.length) return;
    fill(order[i]!);
  };

  for (const tr of triggers) tr.addEventListener('click', () => open(tr));

  lb.addEventListener('click', (e) => {
    const el = e.target as HTMLElement;
    // zemine ya da kapat düğmesine tıklama kapatır; içeriğe tıklama kapatmaz
    if (el === lb || el.closest('[data-lb-close]')) close();
  });

  lb.addEventListener('cancel', (e) => {
    e.preventDefault(); // Esc'i kendi kapanış animasyonumuza bağla
    close();
  });

  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });

  document.querySelector('[data-lb-prev]')?.addEventListener('click', () => step(-1));
  document.querySelector('[data-lb-next]')?.addEventListener('click', () => step(1));
}

/* ============================================================
   2 — EKSİK KARE EMNİYET AĞI

   Build zamanı kararı menu.json'a bakıyor: "photo alanı doluysa
   <img> bas". Ama menu.json ile CDN BİRBİRİNİ TUTMAYABİLİR —
   şema dosyanın yüklendiğini söylerken dosya henüz orada olmayabilir.
   Bugün tam olarak bu durumdayız: 31 karenin şemadaki kaydı var,
   CDN'e yüklenmeleri bekleniyor.

   O aralıkta kart ve satır KIRIK İKON ya da boş kutu göstermiyor;
   görsel söküllüp `no-shot` giyiliyor, yani doğuştan tipografik
   olsaydı nasıl duracaksa öyle duruyor. Dosyalar yüklendiği an bu
   dal hiç çalışmıyor.

   `error` yakalanıyor, `load` değil: geçen kare için hiçbir iş
   yapılmıyor.
   ============================================================ */

function missingShots(): void {
  for (const img of document.querySelectorAll<HTMLImageElement>('.shot img')) {
    const drop = () => {
      const shot = img.closest<HTMLElement>('.shot');
      const host = shot?.closest<HTMLElement>('.item, .cat');
      shot?.remove();
      host?.classList.add('no-shot');
    };
    // zaten hata vermiş olabilir (önbellekten 404)
    if (img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener('error', drop, { once: true });
  }

  /* Kategori kartında kare sökülünce yerine BAŞ HARF geçiyor
     (CatCard.astro): harf zaten altta basılı, `cat-noimg` onu açıyor. */
  for (const img of document.querySelectorAll<HTMLImageElement>('.cat-media img')) {
    const drop = () => {
      img.closest('.cat')?.classList.add('cat-noimg');
      img.remove();
    };
    if (img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener('error', drop, { once: true });
  }
}

/* ============================================================
   3 — GERİ TUŞU

   Kategori sayfası doğrudan açıldığında (QR, paylaşılan bağlantı,
   arama sonucu) altında geçmiş kaydı olmaz ve geri tuşu SİTEDEN
   ÇIKARIR. Burada ızgara sayfası geçmişe bir kez yerleştiriliyor,
   böylece geri tuşu menüye dönüyor.

   Yalnız geçmiş BOŞSA çalışır: siteden gelen ziyaretçinin geçmişine
   dokunulmuyor, yoksa geri tuşu iki kez basılmayı gerektirirdi.

   Adres `data-back`'ten okunuyor — yol sayfada bir kez yazılı,
   burada ikinci kez değil.
   ============================================================ */

function backstop(): void {
  const el = document.querySelector<HTMLElement>('[data-back]');
  const to = el?.dataset['back'];
  if (!to || history.length > 1) return;

  history.replaceState(null, '', to);
  history.pushState(null, '', location.href);
}

/* ============================================================
   KURULUM
   ============================================================ */

function boot(): void {
  missingShots();
  lightbox();
  backstop();
}

document.addEventListener('astro:page-load', boot);
