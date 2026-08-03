const CACHE_NAME = 'fmsc-offline-v1';

// الملفات التي يجب حفظها لتعمل بدون إنترنت
const ASSETS_TO_CACHE = [
    './',
    './FMSC.html',
    './manifest.json',
    './icons/icon-192.png' // أضف مسارات أي صور أو ملفات أخرى هنا
];

// تثبيت الـ Service Worker وحفظ الملفات
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// تفعيل وتحديث النسخ القديمة
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// اعتراض الطلبات وجلبها من الذاكرة المحلية (Offline) إذا لم يتوفر إنترنت
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse; // إرجاع النسخة المحفوظة
            }
            return fetch(event.request).catch(() => {
                // في حالة انقطاع الإنترنت وعدم وجود الملف في الكاش
                if (event.request.mode === 'navigate') {
                    return caches.match('./FMSC.html');
                }
            });
        })
    );
});