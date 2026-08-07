export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator))
    return

  window.addEventListener('load', () => {
    const baseUrl = import.meta.env.BASE_URL
    void navigator.serviceWorker
      .register(`${baseUrl}sw.js`, {
        scope: baseUrl,
      })
      .catch(() => undefined)
  })
}
