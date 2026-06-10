const FITFLOW_TRANSITION_CACHE = 'fitflow-dev-transition-2026-06-10-01';
const FITFLOW_TRANSITION_SHELL = [
  './fitflow_dev.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(FITFLOW_TRANSITION_CACHE)
      .then(cache => cache.addAll(FITFLOW_TRANSITION_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key =>
            (key.startsWith('fitflow-dev-shell-') || key.startsWith('fitflow-dev-transition-')) &&
            key !== FITFLOW_TRANSITION_CACHE
          )
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || request.mode !== 'navigate') return;

  event.respondWith(
    fetch(request, {cache: 'no-store'})
      .then(response => {
        if (response && response.ok) {
          caches.open(FITFLOW_TRANSITION_CACHE)
            .then(cache => cache.put('./fitflow_dev.html', response.clone()));
        }
        return response;
      })
      .catch(async () =>
        (await caches.open(FITFLOW_TRANSITION_CACHE)).match('./fitflow_dev.html') ||
        Response.error()
      )
  );
});
