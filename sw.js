// ===== Service Worker - בדרך =====
const CACHE_NAME = 'bderech-v8';
const URLS_TO_CACHE = ['./', './index.html', './aiCoach.js', './manifest.json', './icon-192.png', './icon-512.png'];

// ===== התקנה: שמור קבצים ב-cache =====
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
    );
});

// ===== הפעלה: נקה cache ישן + הודע לכל הלקוחות לרענן =====
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
          .then(() => self.clients.matchAll({ type: 'window' }))
          .then(clients => clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' })))
    );
});

// ===== Fetch: network-first לדף הראשי, cache-first לשאר =====
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    const isPage = url.pathname.endsWith('/') || url.pathname.endsWith('index.html');

    if (isPage) {
        // network-first — תמיד נסה לקבל גרסה עדכנית
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
    } else {
        // cache-first לתמונות, manifest וכו'
        event.respondWith(
            caches.match(event.request).then(cached => cached || fetch(event.request))
        );
    }
});

// ===== הודעות מהדף הראשי =====
self.addEventListener('message', event => {
    const { type, unlockTime } = event.data || {};

    if (type === 'SCHEDULE_NOTIFICATION' && unlockTime) {
        const delay = unlockTime - Date.now();

        if (delay <= 0) {
            fireNotification();
            return;
        }

        saveNotifTime(unlockTime);
    }
});

// ===== Periodic Background Sync (אנדרואיד Chrome) =====
self.addEventListener('periodicsync', event => {
    if (event.tag === 'check-bderech-notification') {
        event.waitUntil(checkAndNotify());
    }
});

async function checkAndNotify() {
    try {
        const time = await getNotifTime();
        if (time && Date.now() >= time) {
            await clearNotifTime();
            await fireNotification();
        }
    } catch(e) { /* SW fallback */ }
}

function fireNotification() {
    return self.registration.showNotification('בדרך — זמן לתנועה היומית! 🎯', {
        body: 'ה-7 דקות שלך מחכות. בוא נמשיך את הדרך.',
        icon: './icon.svg',
        badge: './icon.svg',
        dir: 'rtl',
        lang: 'he',
        vibrate: [200, 100, 200],
        tag: 'bderech-daily',
        renotify: true,
        actions: [
            { action: 'open', title: 'פתח עכשיו ←' },
            { action: 'snooze', title: 'עוד שעה' }
        ]
    });
}

// ===== לחיצה על ההתראה =====
self.addEventListener('notificationclick', event => {
    event.notification.close();
    if (event.action === 'snooze') {
        const newTime = Date.now() + 60 * 60 * 1000;
        if (self._notifTimeout) clearTimeout(self._notifTimeout);
        self._notifTimeout = setTimeout(fireNotification, 60 * 60 * 1000);
        saveNotifTime(newTime);
        return;
    }
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
            const existing = clients.find(c => c.url.includes('bderech'));
            if (existing) return existing.focus();
            return self.clients.openWindow('./');
        })
    );
});

// ===== IndexedDB helpers =====
function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open('bderech-sw', 1);
        req.onupgradeneeded = e => e.target.result.createObjectStore('data');
        req.onsuccess = e => resolve(e.target.result);
        req.onerror = reject;
    });
}

async function saveNotifTime(time) {
    const db = await openDB();
    return new Promise((res, rej) => {
        const tx = db.transaction('data', 'readwrite');
        tx.objectStore('data').put(time, 'notifTime');
        tx.oncomplete = res; tx.onerror = rej;
    });
}

async function getNotifTime() {
    const db = await openDB();
    return new Promise((res, rej) => {
        const tx = db.transaction('data', 'readonly');
        const req = tx.objectStore('data').get('notifTime');
        req.onsuccess = () => res(req.result);
        req.onerror = rej;
    });
}

async function clearNotifTime() {
    const db = await openDB();
    return new Promise((res, rej) => {
        const tx = db.transaction('data', 'readwrite');
        tx.objectStore('data').delete('notifTime');
        tx.oncomplete = res; tx.onerror = rej;
    });
}
