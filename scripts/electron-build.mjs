import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const projectRoot = process.cwd()
const localOut = path.join(projectRoot, 'dist-electron')
const tempOut = path.join(os.tmpdir(), 'planboard-electron-build')

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function removeDir(dir, { retries = 3 } = {}) {
  if (!fs.existsSync(dir)) return true

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
      return true
    } catch (err) {
      if (attempt === retries) return false
      sleep(400 * attempt)
    }
  }
  return false
}

function publishOutput(source, target) {
  if (removeDir(target)) {
    fs.cpSync(source, target, { recursive: true })
    return target
  }

  const backup = `${target}.old-${Date.now()}`
  try {
    fs.renameSync(target, backup)
    console.log(`Старый dist-electron переименован: ${path.basename(backup)}`)
    fs.cpSync(source, target, { recursive: true })
    return target
  } catch {
    const alt = `${target}-new`
    fs.cpSync(source, alt, { recursive: true })
    console.error(`
Не удалось обновить dist-electron — папка занята.
Закройте PlanBoard.exe и удалите dist-electron вручную.

Новая сборка скопирована в:
  ${alt}
`)
    return alt
  }
}

removeDir(tempOut)

console.log(`Сборка во временную папку: ${tempOut}`)

let step = spawnSync('pnpm', ['build'], {
  stdio: 'inherit',
  shell: true,
  cwd: projectRoot,
})
if (step.status !== 0) process.exit(step.status ?? 1)

step = spawnSync('node', ['scripts/verify-icons.mjs'], {
  stdio: 'inherit',
  cwd: projectRoot,
})
if (step.status !== 0) process.exit(step.status ?? 1)

step = spawnSync(
  'pnpm',
  [
    'exec',
    'electron-builder',
    '--win',
    `-c.directories.output=${tempOut}`,
  ],
  { stdio: 'inherit', shell: true, cwd: projectRoot },
)

if (step.status !== 0) {
  console.error(`
Если видите EPERM — закройте PlanBoard, отключите блокировку папки антивирусом
или запустите PowerShell от имени администратора и повторите:
  pnpm electron:build
`)
  process.exit(step.status ?? 1)
}

const outDir = publishOutput(tempOut, localOut)
console.log(`\nГотово!`)
console.log(`  ${outDir}`)
console.log(`  Portable: ${path.join(outDir, 'PlanBoard *.exe')} (см. папку)`)
console.log(`  Unpacked: ${path.join(outDir, 'win-unpacked', 'PlanBoard.exe')}`)
