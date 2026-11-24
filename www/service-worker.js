const CACHE_NAME = 'bld-letter-pairs-v23';
const APP_SHELL = [
    './',
    './index.html',
    './style.css?v=20261124n',
    './built-in-algorithms.js?v=20261005b',
    './script.js?v=20261124o',
    './lettering.js?v=20261124o',
    './manifest.webmanifest',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/apple-touch-icon.png'
];
const EXTERNAL_ASSETS = [
    'https://cdn.jsdelivr.net/npm/cubejs@1.3.2/lib/cube.min.js',
    'https://cdn.jsdelivr.net/npm/cubejs@1.3.2/lib/solve.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(APP_SHELL);

        await Promise.all(EXTERNAL_ASSETS.map(async (url) => {
            try {
                const response = await fetch(url, { mode: 'no-cors' });
                if (response.ok || response.type === 'opaque') await cache.put(url, response);
            } catch (error) {
                // The app shell still installs when an optional CDN asset is unavailable.
            }
        }));

        await self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames
                .filter((cacheName) => cacheName.startsWith('bld-letter-pairs-') && cacheName !== CACHE_NAME)
                .map((cacheName) => caches.delete(cacheName))
        );
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;

    if (request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const response = await fetch(request, { cache: 'no-cache' });
                const scope = new URL(self.registration.scope);
                const path = new URL(request.url).pathname;
                if (response.ok && (path === scope.pathname || path === scope.pathname + 'index.html')) {
                    await caches.open(CACHE_NAME).then(cache => cache.put('./index.html', response.clone())).catch(() => {});
                }
                return response;
            } catch (error) {
                return (await caches.match('./index.html')) || Response.error();
            }
        })());
        return;
    }

    event.respondWith((async () => {
        const requestUrl = new URL(request.url);
        const cachedResponse = await caches.match(request);

        if (requestUrl.origin !== self.location.origin && cachedResponse) {
            return cachedResponse;
        }

        try {
            const response = await fetch(request);
            if (response.ok || response.type === 'opaque') {
                await caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone())).catch(() => {});
            } else if (cachedResponse) {
                return cachedResponse;
            }
            return response;
        } catch (error) {
            return cachedResponse || Response.error();
        }
    })());
});
