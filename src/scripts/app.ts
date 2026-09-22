/* ============================================================
   LEO LOUNGE — menü sayfalarının davranış katmanı.

   Beş iş var, beşi de menüye ait:
     1  büyük görünüm — fotoğrafa tıklayınca (§1)
     2  eksik kare    — CDN şemanın gerisindeyse (§2)
     3  geri tuşu     — doğrudan açılan kategori sayfası (§3)
     3b üst bar Menü  — önceki kayıt ızgaraysa geri adım (§3b)
     4  dönüş konumu  — ızgara, açılan kartın hizasında (§4)

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
   Bugün 31 kare sitenin kendi klasöründen geliyor (data/menu.ts →
   photoSrc); bu dal panel canlıya geçip o klasör silindiğinde, CDN
   henüz tamamlanmamışsa devreye girer.

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

  /* Kategori kartında kare sökülünce kart FOTOĞRAFSIZ hâle düşüyor
     (CatCard.astro): görsel kutusu kalkıyor, yalnız yazı kalıyor. */
  for (const img of document.querySelectorAll<HTMLImageElement>('.cat-media img')) {
    const drop = () => {
      const card = img.closest('.cat');
      card?.classList.add('cat-noimg');
      img.closest('.cat-media')?.remove();
    };
    if (img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener('error', drop, { once: true });
  }
}

/* ============================================================
   3 — GERİ TUŞU

   Kategori sayfası doğrudan açıldığında (QR, paylaşılan bağlantı,
   arama sonucu) altında sitenin hiçbir kaydı olmaz ve geri tuşu
   SİTEDEN ÇIKARIR. Burada ızgara sayfası geçmişe bir kez
   yerleştiriliyor, böylece geri tuşu menüye dönüyor.

   "Doğrudan açıldı" = ClientRouter'ın geçmiş sırası 0. Siteden
   gelinmişse sıra > 0 ve geçmişe dokunulmuyor, yoksa geri tuşu iki
   kez basılmayı gerektirirdi. (Eski koşul `history.length > 1` idi;
   sekmenin başka sitelerden kalan geçmişi de sayıldığı için çoğu
   telefonda hiç devreye girmiyordu.)

   İKİ TUZAK, İKİSİ DE CANLIDA YAŞANDI (22 Eylül):
   · Durum nesnesi ClientRouter'ın biçiminde ({ index, scrollX,
     scrollY }). `null` durumlu kaydı yönlendirici YOK SAYIYOR: adres
     /menu/ oluyor, sayfa kategoride kalıyordu; ikinci basış siteden
     çıkarıyordu.
   · Kayıt İLK DOKUNUŞTA ekleniyor. Chrome, kullanıcı sayfaya hiç
     dokunmadan eklenen geçmiş kaydını geri tuşunda ATLIYOR (geçmiş
     istismarına karşı önlem). Dokunmadan geri basan ziyaretçi yine
     çıkar; bunu aşmanın meşru yolu yok.

   Adres `data-back`'ten okunuyor — yol sayfada bir kez yazılı,
   burada ikinci kez değil.

   ÜÇÜNCÜ TUZAK (22 Eylül, telefonda): dokunmatikte `pointerdown`
   ve kaydırmayı bitiren `touchend` etkileşim SAYILMIYOR (fareninki
   sayılıyor — masaüstünde hata görünmüyordu). Kayıt etkileşimden önce
   ekleniyor, Chrome ızgara kaydını atlanacak diye işaretliyordu: geri
   tuşu ızgaraya dönmüyor, sayfada takılıyordu. Artık olaya değil
   `userActivation`'ın kendisine bakılıyor; etkileşim gelene kadar
   beklemeye devam ediliyor.

   Yerleştirilen kayıtlar `leoBack` taşıyor: aynı kayda ikinci kez
   yerleştirme yapılmasın, üst bardaki "Menü" de geri adım atabilsin
   (§3b).
   ============================================================ */

type RouterState = { index?: number; leoBack?: true } | null;

/** Etkileşimi tamamlayabilecek olaylar; asıl ölçü userActivation. */
const ACTIVATION = ['pointerup', 'touchend', 'click', 'keydown'] as const;

const active = (): boolean =>
  // userActivation yoksa (eski Safari) atlama önlemi de yok
  !navigator.userActivation || navigator.userActivation.hasBeenActive;

function backstop(): void {
  const el = document.querySelector<HTMLElement>('[data-back]');
  const to = el?.dataset['back'];
  const st = history.state as RouterState;
  if (!to || st?.index || st?.leoBack) return;

  const here = location.href;
  const stop = () => {
    for (const ev of ACTIVATION) removeEventListener(ev, plant, true);
  };
  const plant = () => {
    // bu arada başka sayfaya geçildiyse (ClientRouter) iş bitmiş demek
    const now = history.state as RouterState;
    if (location.href !== here || now?.index || now?.leoBack) return stop();
    if (!active()) return; // kaydırma dokunuşu — gerçek etkileşimi bekle
    stop();
    history.replaceState({ index: 0, scrollX: 0, scrollY: 0, leoBack: true }, '', to);
    history.pushState({ index: 1, scrollX, scrollY, leoBack: true }, '', here);
  };

  if (active()) plant();
  else for (const ev of ACTIVATION) addEventListener(ev, plant, { capture: true, passive: true });
}

/* ============================================================
   3b — ÜST BARDAKİ "MENÜ"

   Bağlantı ileri gezinme: ızgara → kategori → Menü → kategori → Menü
   geçmişe her seferinde yeni kayıt ekliyordu. Geri tuşu sonra aynı
   iki sayfa arasında gidip geliyor, ziyaretçi "hep aynı sayfaya
   dönüyor" diye görüyordu (22 Eylül). Bir önceki kayıt zaten ızgaraysa
   bağlantı yeni kayıt açmıyor, geri adım atıyor.

   Önceki kaydın ızgara olduğu iki durumda biliniyor: bu sayfaya
   ızgaradan gelindi (ileri ya da geri), ya da §3 ızgarayı altına
   yerleştirdi. Başka her durumda bağlantı normal çalışıyor.
   ============================================================ */

let prevPath = '';
const trim = (p: string) => p.replace(/\/+$/, '');

function barBack(): void {
  const from = prevPath;
  prevPath = location.pathname;

  const link = document.querySelector<HTMLAnchorElement>('.bar-back');
  if (!link) return;
  const grid = trim(new URL(link.href).pathname);

  link.addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const onTop = (history.state as RouterState)?.leoBack || (from && trim(from) === grid);
    if (!onTop) return;
    e.preventDefault(); // ClientRouter itmesin
    history.back();
  });
}

/* ============================================================
   4 — IZGARAYA DÖNÜŞTE KONUM

   Kategoriden ızgaraya dönen ziyaretçi (üst bardaki "Menü" ya da geri
   tuşu) ızgaranın BAŞINA değil, az önce açtığı kartın hizasına iner.
   "Menü" bağlantısı ileri gezinme olduğu için ClientRouter onu en üste
   açıyordu; telefonda kategorilerin yarısı kaydırılıp yeniden
   aranıyordu (müşteri şikâyeti, 22 Eylül).

   Kategori sayfası kendi anahtarını oturuma bırakıyor (`data-cat`),
   ızgara onu bir kez okuyup siliyor. Bir kez: sonraki yenileme ya da
   ana sayfadan gelen yeni giriş yine baştan açılır.
   ============================================================ */

const LAST = 'leo-cat';

function returnPoint(): void {
  const cat = document.querySelector<HTMLElement>('[data-cat]')?.dataset['cat'];
  if (cat) {
    try { sessionStorage.setItem(LAST, cat); } catch { /* gizli sekme */ }
    return;
  }

  const grid = document.querySelector('.cats');
  if (!grid) return;
  let key: string | null = null;
  try {
    key = sessionStorage.getItem(LAST);
    sessionStorage.removeItem(LAST);
  } catch { /* yok say */ }
  if (!key) return;

  grid
    .querySelector<HTMLElement>(`a.cat[href="/menu/${CSS.escape(key)}/"]`)
    ?.scrollIntoView({ block: 'center', behavior: 'instant' });
}

/* ============================================================
   5 — ADRES İLE EKRAN AYRIŞIRSA

   iPhone'daki Chrome'da (22 Eylül, canlıda) geri tuşu adresi
   değiştiriyor ama ClientRouter sayfayı yüklemiyordu: her basışta
   adres kısalıyor, ekranda yenileyene kadar aynı kategori kalıyordu.
   Masaüstü Chrome'da ve Safari motorunda (WebKit) tekrar üretilemedi —
   iOS Chrome geçmişi kendisi yönetiyor ve geri tuşunun olayı
   yönlendiricinin beklediği durumu taşımıyor olmalı (durumsuz olayı
   yönlendirici yok sayıyor).

   Sebebe değil sonuca bağlanıyor: ekrandaki sayfanın yolu biliniyor;
   adres ondan farklıysa ve yönlendirici bir geçiş başlatmadıysa sayfa
   adresten yeniden yükleniyor. Yönlendirici geçişi eşzamanlı olarak
   başlatıyor (astro:before-preparation), o yüzden kısa bir bekleme
   yetiyor. Geçiş sürerken adres zaten öndedir — o aralık `busy`.

   popstate hiç gelmezse diye adres yarım saniyede bir de
   karşılaştırılıyor; iş yok, yalnız iki metin kıyaslanıyor.
   ============================================================ */

let shown = location.pathname;
let busy = false;

function mismatch(): void {
  if (busy || trim(location.pathname) === trim(shown)) return;
  location.reload();
}

document.addEventListener('astro:before-preparation', () => { busy = true; });
document.addEventListener('astro:after-swap', () => { shown = location.pathname; });
document.addEventListener('astro:page-load', () => {
  shown = location.pathname;
  busy = false;
});
addEventListener('popstate', () => setTimeout(mismatch, 150));
setInterval(mismatch, 500);

/* ============================================================
   KURULUM
   ============================================================ */

function boot(): void {
  missingShots();
  lightbox();
  backstop();
  barBack();
  returnPoint();
}

document.addEventListener('astro:page-load', boot);
