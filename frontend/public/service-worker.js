// Service Worker for caching and offline support with cache busting
const CACHE_NAME = `redragon-colombo-v${Date.now()}`;
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/logo/redragon_logo.png',
  '/images/logo/dragon_logo.png',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache open failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
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

// Fetch event - Network first for HTML, cache first for assets
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip unsupported schemes (chrome-extension, etc.)
  if (!event.request.url.startsWith('http://') && !event.request.url.startsWith('https://')) {
    return;
  }

  // Skip chrome extension and other non-HTTP requests
  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }
  
  // Network first for HTML files (always get latest version)
  if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache first for other assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if available
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // Don't cache if not a success response
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache images, fonts, and static assets
          if (
            event.request.url.includes('/images/') ||
            event.request.url.includes('/static/') ||
            event.request.url.includes('.woff') ||
            event.request.url.includes('.woff2') ||
            event.request.url.includes('.css') ||
            event.request.url.includes('.js')
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              return cache.put(event.request, responseToCache);
            }).catch((error) => {
              console.log('Cache put failed:', error);
            });
          }

          return response;
        });
      })
      .catch(() => {
        // Return offline page if available
        return caches.match('/index.html');
      })
  );
});
