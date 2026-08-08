import { access, readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const distDirectory = new URL('../dist/', import.meta.url)
const base = process.env.VITE_BASE_PATH || '/go-far-away/'
const publicUrl = (process.env.VITE_PUBLIC_URL
  || (base === '/' ? 'https://gfw.yyj.moe' : 'https://yunyoujun.github.io/go-far-away'))
  .replace(/\/$/, '')
const indexHtml = await readFile(new URL('index.html', distDirectory), 'utf8')

function assert(condition, message) {
  if (!condition)
    throw new Error(message)
}

assert(
  indexHtml.includes('rel="manifest"'),
  'The production HTML must link to the generated web app manifest.',
)
if (base !== '/') {
  assert(
    !/["']\/assets\//.test(indexHtml),
    'Subpath deployment assets must not point at the domain root.',
  )
}
assert(
  indexHtml.includes(`${base}assets/`),
  `Production assets must use the configured base path ${base}.`,
)
assert(
  indexHtml.includes(`rel="canonical" href="${publicUrl}/"`)
  && indexHtml.includes(`property="og:url" content="${publicUrl}/"`)
  && !indexHtml.includes('%PUBLIC_URL%'),
  `Production metadata must use the configured public URL ${publicUrl}.`,
)
const manifest = JSON.parse(
  await readFile(new URL('manifest.webmanifest', distDirectory), 'utf8'),
)

assert(manifest.start_url === './', 'The manifest start_url must be relative to its deployment path.')
assert(manifest.scope === './', 'The manifest scope must be relative to its deployment path.')
await access(new URL('sw.js', distDirectory))

const localAssetPaths = [...indexHtml.matchAll(/(?:href|src)="([^"]+)"/g)]
  .map(match => match[1])
  .filter(path => path.startsWith(base))
  .map(path => path.slice(base.length))
  .filter(Boolean)

for (const assetPath of localAssetPaths)
  await access(join(distDirectory.pathname, assetPath))

const productionJavaScript = (
  await Promise.all(
    (await readdir(new URL('assets/', distDirectory)))
      .filter(filename => filename.endsWith('.js'))
      .map(filename => readFile(new URL(`assets/${filename}`, distDirectory), 'utf8')),
  )
).join('\n')

assert(
  productionJavaScript.includes(base)
  && productionJavaScript.includes('sw.js')
  && productionJavaScript.includes('serviceWorker.register'),
  'The application bundle must register the service worker under the deployment base path.',
)

console.log(`Verified ${localAssetPaths.length} production references under ${base}`)
