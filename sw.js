// 无弦琴 Service Worker:轻量壳预缓存 + 重资源(模型/wasm)用到时缓存
// 首次打开只预缓存几百 KB——不与页面自身的模型下载抢带宽/内存(手机首载死机主因);
// vendor 大文件在页面首次真正请求时由 fetch 处理器写入缓存,之后照样离线可用。
// 策略:导航请求网络优先(更新即时生效,断网退缓存);静态资源缓存优先
const CACHE = 'wuxianqin-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;   // CDN 兜底等外部请求直连网络

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((r) => {
          const cp = r.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', cp));
          return r;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit || fetch(e.request).then((r) => {
        if (r.ok) {
          const cp = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, cp));
        }
        return r;
      })
    )
  );
});
