/* MANTIS, service worker.
   Strategia „najpierw sieć": gdy jest internet, zawsze bierzemy najnowszą
   wersję gry i odświeżamy zapas; offline gramy z ostatniego zapasu. Dzięki
   temu aktualizacje pojawiają się od razu, a gra dalej działa bez sieci. */
const WERSJA = 'mantis-v6';
const PLIKI = [
  '.', 'index.html', 'manifest.webmanifest',
  'silnik/modliszka.js', 'silnik/swiat.js', 'silnik/owad.js',
  'silnik/zapis.js', 'silnik/dzwiek.js', 'silnik/album.js',
  'silnik/gra.js', 'silnik/menu.js',
  'ikony/icon-192.png', 'ikony/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(WERSJA).then(c => c.addAll(PLIKI)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(k => Promise.all(k.filter(x => x !== WERSJA).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(odp => {
      const kopia = odp.clone();
      caches.open(WERSJA).then(c => c.put(e.request, kopia)).catch(() => {});
      return odp;
    }).catch(() => caches.match(e.request).then(traf => traf || caches.match('index.html')))
  );
});
