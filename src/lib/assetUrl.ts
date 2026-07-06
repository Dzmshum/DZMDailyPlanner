/** Public asset path — works in Vite dev, browser build, and Electron (base: './'). */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL
  const normalized = path.replace(/^\//, '')
  return `${base}${normalized}`
}
