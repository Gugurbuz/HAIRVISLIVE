/**
 * Service Worker for HairVis Platform
 *
 * Provides:
 * - Offline support for static assets
 * - Cache-first strategy for images
 * - Network-first for API calls
 * - Background sync for failed requests
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `hairvis-cache-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/index.css',
];

const IMAGE_CACHE = 'hairvis-images';
const API_CACHE = 'hairvis-api';

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error('[SW] Failed to cache some static assets', err);
      });
    })
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName.startsWith('hairvis-cache-') &&
            cacheName !== CACHE_NAME
          ) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.pathname.includes('/functions/v1/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
  ) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }

  if (
    url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/i) ||
    STATIC_ASSETS.includes(url.pathname)
  ) {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
    return;
  }

  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);

    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Offline</text></svg>',
        {
          headers: { 'Content-Type': 'image/svg+xml' },
        }
      );
    }

    throw error;
  }
}

async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Network request failed:', error);

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('hairvis-')) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
});
