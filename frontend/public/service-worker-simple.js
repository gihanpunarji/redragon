// Simple Service Worker - Cache busting for HTML only
const CACHE_NAME = `redragon-simple-v${Date.now()}`;

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force immediate activation
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('redragon-') && cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - Only handle HTML files for cache busting
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip non-HTTP requests (chrome-extension, etc.)
  if (!event.request.url.startsWith('http://') && !event.request.url.startsWith('https://')) {
    return;
  }

  // Only intercept HTML requests to force fresh content
  if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          // Return cached version if available
          return caches.match(event.request);
        })
    );
  }
  
  // Let everything else (CSS, JS, images, API calls) pass through normally
});