/**
 * Write electron/default-plan.json from createDefaultPlan() so Electron
 * and TS share one source of truth.
 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createDefaultPlan } from '../src/types/index.ts'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = path.join(root, 'electron', 'default-plan.json')
writeFileSync(out, `${JSON.stringify(createDefaultPlan(), null, 2)}\n`, 'utf8')
console.log('sync-default-plan: wrote', out)
