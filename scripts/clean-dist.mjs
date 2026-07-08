import fs from 'node:fs'
import path from 'node:path'

const dir = path.join(process.cwd(), 'dist-electron')

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

if (!fs.existsSync(dir)) {
  console.log('dist-electron уже отсутствует')
  process.exit(0)
}

for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
    console.log('Removed dist-electron')
    process.exit(0)
  } catch (err) {
    if (attempt === 3) {
      console.error(`
Не удалось удалить dist-electron (EPERM).
Закройте PlanBoard.exe и повторите: pnpm clean:dist
`)
      process.exit(1)
    }
    sleep(400 * attempt)
  }
}
