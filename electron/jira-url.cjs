/** Mirror of src/lib/jiraUrl.ts for Electron main (CommonJS). */

const BLOCKED_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  'metadata.goog',
])

function isPrivateOrLocalHostname(hostname) {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  if (BLOCKED_HOSTS.has(host)) return true
  if (host.endsWith('.localhost') || host.endsWith('.local')) return true

  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host)
  if (m) {
    const parts = m.slice(1).map(Number)
    if (parts.some((n) => n > 255)) return true
    const [a, b] = parts
    if (a === 10) return true
    if (a === 127) return true
    if (a === 0) return true
    if (a === 169 && b === 254) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 100 && b >= 64 && b <= 127) return true
  }

  if (host.includes(':')) {
    if (host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80')) {
      return true
    }
  }

  return false
}

function isAllowedJiraBaseUrl(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return false
  let url
  try {
    url = new URL(raw.trim())
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false
  if (url.username || url.password) return false
  if (url.port && url.port !== '443') return false
  if (!url.hostname || isPrivateOrLocalHostname(url.hostname)) return false
  return true
}

function assertAllowedJiraBaseUrl(raw) {
  if (!isAllowedJiraBaseUrl(raw)) {
    throw new Error(
      'Некорректный URL Jira: нужен https:// с публичным hostname (не localhost/IP).',
    )
  }
  return raw.trim().replace(/\/$/, '')
}

module.exports = {
  isAllowedJiraBaseUrl,
  assertAllowedJiraBaseUrl,
}
