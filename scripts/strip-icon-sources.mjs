import { readdirSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'

const buildDir = join(process.cwd(), 'build')

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

if (!statSync(buildDir, { throwIfNoEntry: false })) {
  console.log('strip-icon-sources: build/ not found, skip')
  process.exit(0)
}

const removed = walk(buildDir).filter((file) => file.endsWith('-source.png'))
let bytes = 0
for (const file of removed) {
  bytes += statSync(file).size
  rmSync(file)
}

if (removed.length > 0) {
  console.log(`strip-icon-sources: removed ${removed.length} files (~${Math.round(bytes / 1024 / 1024)} MB)`)
}
