const CACHE = 'ghiras-v45';
const FILES = ['./', './index.html', './dua.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable.png', './apple-touch-icon.png', './favicon-32.png', './fonts/amiri-400.ttf', './fonts/amiri-700.ttf'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || /\.html$|\/$/.test(url.pathname);
  if (isPage) {
    /* pages: always try the network first so updates arrive on the first open; fall back to the saved copy offline */
    e.respondWith(fetch(req).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(h => h || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; })));
});
