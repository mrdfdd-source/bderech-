try {
    importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
} catch(e) {}

const CACHE_NAME = 'bderech-v11';
const URLS_TO_CACHE = ['./', './index.html', './aiCoach.js', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(URLS_TO_CACHE)));
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    const isPage = url.pathname.endsWith('/') || url.pathname.endsWith('index.html');
    event.respondWith(
        isPage
            ? fetch(event.request).then(r => { caches.open(CACHE_NAME).then(c => c.put(event.request, r.clone())); return r; }).catch(() => caches.match(event.request))
            : caches.match(event.request).then(c => c || fetch(event.request))
    );
});

self.addEventListener('message', event => {
    const { type, unlockTime } = event.data || {};
    if (type === 'SCHEDULE_NOTIFICATION' && unlockTime) saveNotifTime(unlockTime);
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
            const c = clients.find(c => c.url.includes('bderech'));
            return c ? c.focus() : self.clients.openWindow('./');
        })
    );
});

function openDB() {
    return new Promise((res, rej) => {
        const r = indexedDB.open('bderech-sw', 1);
        r.onupgradeneeded = e => e.target.result.createObjectStore('data');
        r.onsuccess = e => res(e.target.result);
        r.onerror = rej;
    });
}
async function saveNotifTime(time) {
    const db = await openDB();
    return new Promise((res, rej) => { const tx = db.transaction('data','readwrite'); tx.objectStore('data').put(time,'notifTime'); tx.oncomplete=res; tx.onerror=rej; });
}
