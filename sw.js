// 无弦琴 Service Worker:轻量壳预缓存 + 重资源(模型/wasm)用到时缓存
// 首次打开只预缓存几百 KB——不与页面自身的模型下载抢带宽/内存(手机首载死机主因);
// vendor 大文件在页面首次真正请求时由 fetch 处理器写入缓存,之后照样离线可用。
// 策略:导航请求网络优先(更新即时生效,断网退缓存);静态资源缓存优先
const CACHE = 'wuxianqin-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // 开场视频必须预缓存:<video> 用 Range 请求(206 响应),Cache API 拒存 206,
  // 运行时缓存永远存不进——不预缓存则每次访问都从源站拉,弱网必超时回退
  './intro.mp4',
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
    // no-cache:绕开 HTTP 缓存向服务器再验证(Pages 给 index 设了 10 分钟
    // max-age,普通刷新会拿到陈旧页面),断网时退缓存
    e.respondWith(
      fetch(e.request, { cache: 'no-cache' })
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
        // 仅缓存完整 200 响应:206(Range 分段)进 cache.put 会抛异常
        if (r.status === 200) {
          const cp = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, cp)).catch(() => {});
        }
        return r;
      })
    )
  );
});
