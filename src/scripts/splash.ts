/* ============================================================
   AÇILIŞ EKRANI — sıralama (components/Splash.astro).

   1  bekle   — yazı tipleri + kart kareleri + ilk ekrandaki ürün
                kareleri. En az MIN, en fazla MAX.
   2  kapan   — dönüş durur, açık yay tam daireye kapanır
   3  yat     — daire dikeyde basılıp çizgiye döner; beyaz → altın
   4  uza     — çizgi iki yana ekran kenarına kadar uzar, logo söner
   5  açıl    — ekran çizgiden ikiye ayrılır, üstü yukarı altı aşağı

   Hareket azaltılmışsa 2–5 yok: ekran yalnız söner.

   Oturumda ikinci kez (yenileme) MIN beklenmez — ekran yalnız
   görseller hazır olana kadar durur. İlk girişteki gösteri her
   yenilemede tekrar izletilmesin.
   ============================================================ */

const MIN = 900;    // ilk girişte en az — halka görülsün
const MAX = 4500;   // bir kare hiç gelmezse menü bekletilmez
const KEY = 'leo-splash';
const GOLD = 'rgb(236, 211, 130)';
const RM = matchMedia('(prefers-reduced-motion: reduce)');

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Yüklenmiş ve çözülmüş (decode) — ya da denenip vazgeçilmiş. */
const settle = (img: HTMLImageElement): Promise<unknown> =>
  img.complete
    ? img.decode().catch(() => undefined)
    : new Promise((res) => {
        img.addEventListener('load', () => res(img.decode().catch(() => undefined)), { once: true });
        img.addEventListener('error', () => res(undefined), { once: true });
      });

const ready = (): Promise<unknown> => {
  const fold = window.innerHeight * 1.2;
  const imgs = [
    ...document.querySelectorAll<HTMLImageElement>('#splash img, .bar img, .cat-media img, .shot img'),
  ].filter((i) => !i.closest('.shot') || i.getBoundingClientRect().top < fold);
  return Promise.all([document.fonts?.ready ?? Promise.resolve(), ...imgs.map(settle)]);
};

const anim = (
  el: Element,
  frames: Keyframe[],
  opts: KeyframeAnimationOptions,
): Promise<unknown> => el.animate(frames, { fill: 'forwards', ...opts }).finished;

async function open(el: HTMLElement): Promise<void> {
  const ring = el.querySelector<SVGSVGElement>('.splash-ring');
  const circle = ring?.querySelector('circle');
  const loader = el.querySelector<HTMLElement>('.splash-loader');
  const line = el.querySelector<HTMLElement>('.splash-line');
  const logo = el.querySelector<HTMLElement>('.splash-logo');
  const top = el.querySelector<HTMLElement>('.splash-top');
  const bottom = el.querySelector<HTMLElement>('.splash-bottom');
  if (!ring || !circle || !loader || !line || !top || !bottom) return;

  // dikiş = halkanın merkezi; paneller tam oradan ayrılacak
  const r = loader.getBoundingClientRect();
  el.style.setProperty('--split', `${r.top + r.height / 2}px`);

  // 2 — dönüş durur, yay kapanır (tam daire hangi açıda durursa dursun aynı)
  ring.getAnimations().forEach((a) => a.pause());
  await anim(circle, [{ strokeDasharray: '80 46' }, { strokeDasharray: '126 0' }], {
    duration: 180,
    easing: 'ease-out',
  });

  // 3 — düzleme yatar; beyazdan altına
  await Promise.all([
    anim(loader, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(.05)' }], {
      duration: 360,
      easing: 'cubic-bezier(.5, 0, .3, 1)',
    }),
    anim(circle, [{ stroke: '#FFFFFF' }, { stroke: GOLD }], { duration: 360 }),
  ]);

  // halka ↔ çizgi: aynı çap, aynı yer — takas görünmez
  ring.style.opacity = '0';
  line.style.opacity = '1';

  // 4 — iki yana uzar; logo söner
  const k = (window.innerWidth / 40) * 1.1;
  const extend = anim(line, [{ transform: 'scaleX(1)' }, { transform: `scaleX(${k})` }], {
    duration: 560,
    easing: 'cubic-bezier(.65, 0, .25, 1)',
  });
  if (logo) anim(logo, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 });

  // 5 — uzama bitmeden açılmaya başlar (akış kesilmesin)
  await sleep(390);
  const ease = 'cubic-bezier(.7, 0, .2, 1)';
  await Promise.all([
    anim(top, [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], { duration: 640, easing: ease }),
    anim(bottom, [{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }], { duration: 640, easing: ease }),
    anim(line, [{ opacity: 1 }, { opacity: 0 }], { duration: 480, delay: 160 }),
    extend,
  ]);
}

async function run(el: HTMLElement): Promise<void> {
  el.style.animation = 'none'; // CSS emniyetini devral
  const root = document.documentElement;
  root.classList.add('splash-lock');

  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch { /* gizli sekme */ }

  const t0 = performance.now();
  await Promise.race([ready(), sleep(MAX)]);
  const rest = (seen ? 0 : MIN) - (performance.now() - t0);
  if (rest > 0) await sleep(rest);

  try {
    if (RM.matches) await anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 250 });
    else await open(el);
  } finally {
    el.remove();
    root.classList.remove('splash-lock');
    try { sessionStorage.setItem(KEY, '1'); } catch { /* yok say */ }
  }
}

/* ClientRouter: sayfa değiştirirken gelen yeni belgedeki açılış ekranını
   takastan ÖNCE sil — açılış yalnız gerçek yüklemede. */
document.addEventListener('astro:before-swap', (e) => {
  (e as unknown as { newDocument: Document }).newDocument.getElementById('splash')?.remove();
});

const splash = document.getElementById('splash');
if (splash) void run(splash);

/* Modül: app.ts ve waves.ts ile aynı küresel kapsama düşmesin
   (ikisinde de RM gibi ortak adlar var). */
export {};
