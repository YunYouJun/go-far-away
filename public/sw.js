const cacheName = 'go-far-away-v1'
const baseUrl = new URL('./', globalThis.location.href)
const appShellUrl = baseUrl.href

async function cacheDocument(response) {
  const cache = await globalThis.caches.open(cacheName)
  const html = await response.clone().text()
  const localAssets = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map(match => new URL(match[1], appShellUrl))
    .filter(url =>
      url.origin === globalThis.location.origin
      && url.pathname.startsWith(baseUrl.pathname),
    )
    .map(url => url.href)

  await cache.put(appShellUrl, response)
  await cache.addAll([...new Set(localAssets)])
}

globalThis.addEventListener('install', (event) => {
  event.waitUntil(
    globalThis.fetch(appShellUrl)
      .then(response => cacheDocument(response)),
  )
  globalThis.skipWaiting()
})

globalThis.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      globalThis.caches
        .keys()
        .then(keys => Promise.all(
          keys
            .filter(key => key !== cacheName)
            .map(key => globalThis.caches.delete(key)),
        )),
      globalThis.clients.claim(),
    ]),
  )
})

globalThis.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET')
    return

  const requestUrl = new URL(request.url)
  if (requestUrl.origin !== globalThis.location.origin)
    return

  if (request.mode === 'navigate') {
    event.respondWith(
      globalThis.fetch(request)
        .then((response) => {
          event.waitUntil(cacheDocument(response.clone()))
          return response
        })
        .catch(async () => {
          const cachedShell = await globalThis.caches.match(appShellUrl)
          return cachedShell ?? Response.error()
        }),
    )
    return
  }

  event.respondWith(
    globalThis.caches.match(request).then(async (cachedResponse) => {
      if (cachedResponse)
        return cachedResponse

      const response = await globalThis.fetch(request)
      if (response.ok) {
        const responseToCache = response.clone()
        event.waitUntil(
          globalThis.caches
            .open(cacheName)
            .then(cache => cache.put(request, responseToCache)),
        )
      }
      return response
    }),
  )
})
