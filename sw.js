/* MNEMOSCIENCES — service worker (v13)
   Pourquoi ce fichier : sans lui, le navigateur va chercher l'application sur internet à chaque ouverture.
   Avec lui, il en garde une copie sur l'appareil (la « réserve ») et s'en sert quand il n'y a pas de réseau.
   Règle :
   - pages, app.js, style.css : on essaie d'abord internet (pour avoir la dernière version), sinon la réserve ;
   - images et bibliothèques Firebase : la réserve d'abord (elles ne changent pas), sinon internet.
   À chaque nouvelle version, changer VERSION ci-dessous : l'ancienne réserve est alors effacée. */
const VERSION = 'mnemosciences-v13';
const FICHIERS = [
  './', 'index.html', 'index.html?v=13', 'app.js?v=13', 'style.css?v=13', 'manifest.json',
  'fiche-matiere.html', 'fiche-vivant.html', 'fiche-technique.html',
  'icons/icone.svg', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
  'assets/accueil.jpg',
  'assets/mosaique/quatre-savants.jpg', 'assets/mosaique/science-symbole.jpg', 'assets/mosaique/adn.gif',
  'assets/mosaique/einstein.jpg', 'assets/mosaique/diapirisme.gif', 'assets/mosaique/machine-a-vapeur.gif',
  'assets/mosaique/pasteur.jpg', 'assets/mosaique/spirales.gif', 'assets/mosaique/grossesse.gif',
  'assets/mosaique/etat-quantique.gif',
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => Promise.all(FICHIERS.map((f) => c.add(f).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((cles) => Promise.all(cles.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const ici = url.origin === location.origin;
  /* Firebase (comptes, scores) gère lui-même le hors connexion : on ne s'en mêle pas. */
  if (!ici && url.hostname !== 'www.gstatic.com') return;
  const image = /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url.pathname);
  if (ici && !image) {
    e.respondWith(fetch(req).then((rep) => {
      if (rep.ok) { const copie = rep.clone(); caches.open(VERSION).then((c) => c.put(req, copie)); }
      return rep;
    }).catch(() => caches.match(req).then((r) => r || caches.match(req, { ignoreSearch: true })).then((r) => r || (req.mode === 'navigate' ? caches.match('index.html') : undefined))));
    return;
  }
  e.respondWith(caches.match(req).then((r) => r || fetch(req).then((rep) => {
    if (rep.ok) { const copie = rep.clone(); caches.open(VERSION).then((c) => c.put(req, copie)); }
    return rep;
  })));
});
