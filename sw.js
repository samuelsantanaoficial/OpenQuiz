const CACHE_NAME = '2.1.0';
const ASSETS = [
	'./',
	'./index.html',
	'./app.js',
	'./manifest.json',
	'./maskable_icon_x512.png',
	'./audio/clock.wav',
	'./audio/error.wav',
	'./audio/success.wav',
	'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
	'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
	'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
];

self.addEventListener('install', (e) => {
	e.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
	);
	self.skipWaiting();
});

self.addEventListener('activate', (e) => {
	e.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(
				keyList.map((key) => {
					if (key !== CACHE_NAME) return caches.delete(key);
				})
			);
		})
	);
	self.clients.claim();
});

self.addEventListener('fetch', (e) => {
	e.respondWith(
		caches.match(e.request).then((cachedResponse) => {
			const fetchPromise = fetch(e.request).then((networkResponse) => {
				caches.open(CACHE_NAME).then((cache) => {
					cache.put(e.request, networkResponse.clone());
				});
				return networkResponse;
			});

			return cachedResponse || fetchPromise;
		})
	);
});
