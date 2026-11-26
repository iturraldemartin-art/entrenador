/* Entrenador Personal · service worker
   - La app (index.html) se busca primero en internet: así cada cambio que publicamos llega al toque.
     Si no hay señal, abre la última versión guardada en el celular.
   - Íconos, fotos, videos y librerías: se guardan la primera vez y después abren al instante.
   - Los datos (Firebase) NO pasan por acá: Firestore tiene su propio guardado sin conexión. */
const VERSION = "entrenador-v15";
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
    e.respondWith(fetch(req.url, { cache: "no-cache", credentials: "same-origin" }).then(res => {   // no-cache: siempre pregunta a GitHub si hay versión nueva
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  })));
});

/* Avisos con la app en segundo plano: la página le pide "avisame en X ms" (fin del descanso, apagar el
   reloj) y el service worker muestra una notificación del celular con vibración, salvo que la app esté
   a la vista (ahí avisa la propia app). Un aviso nuevo con el mismo nombre reemplaza al anterior. */
const AVISOS = {};
self.addEventListener("message", e => {
  const m = e.data || {};
  if (m.tipo === "cancelar") { const a = AVISOS[m.tag]; if (a) { clearTimeout(a.t); a.fin(); delete AVISOS[m.tag]; } return; }
  if (m.tipo !== "avisar") return;
  const prev = AVISOS[m.tag]; if (prev) { clearTimeout(prev.t); prev.fin(); }
  e.waitUntil(new Promise(fin => {
    const t = setTimeout(async () => {
      try {
        const cs = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        const aLaVista = cs.some(c => c.visibilityState === "visible");
        if (!aLaVista && self.registration.showNotification) {
          await self.registration.showNotification(m.title || "Entrenador", {
            body: m.body || "", tag: m.tag, renotify: true, vibrate: [500, 200, 500, 200, 900],
            icon: "./icons/icon-192.png", badge: "./icons/icon-192.png", requireInteraction: false
          });
        }
      } catch (_) {}
      delete AVISOS[m.tag]; fin();
    }, Math.max(0, Math.min(Number(m.ms) || 0, 4.5 * 60 * 1000)));
    AVISOS[m.tag] = { t, fin };
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    const c = cs[0]; if (c) return c.focus(); return self.clients.openWindow("./");
  }));
});
