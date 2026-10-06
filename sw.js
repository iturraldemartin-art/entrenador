/* Entrenador Personal · service worker
   - La app (index.html) se busca primero en internet: así cada cambio que publicamos llega al toque.
     Si no hay señal, abre la última versión guardada en el celular.
   - Íconos, fotos, videos y librerías: se guardan la primera vez y después abren al instante.
   - Los datos (Firebase) NO pasan por acá: Firestore tiene su propio guardado sin conexión. */
const VERSION = "entrenador-v6";
const SHELL = ["./", "./index.html", "./manifest.webmanifest",
  "./lib/firebase-app-compat.js", "./lib/firebase-auth-compat.js", "./lib/firebase-firestore-compat.js",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png", "./imgpack.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;                 // Firebase, Google, fuentes: directo a internet
  if (req.headers.has("range")) return;                         // videos: los maneja el navegador
  const isPage = req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("index.html");
  if (isPage) {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  })));
});
