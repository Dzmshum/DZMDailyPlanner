const path = require('path')
const fs = require('fs')
const os = require('os')

/** Synced from src createDefaultPlan via scripts/sync-default-plan.mjs */
const DEFAULT_PLAN_JSON = fs.readFileSync(
  path.join(__dirname, 'default-plan.json'),
  'utf8',
)

function appDataRoot() {
  if (process.platform === 'win32') {
    return process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming')
  }
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support')
  }
  return process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config')
}

const APP_DATA_DIR = 'PlanBoard'
const LEGACY_DATA_DIRS = ['DoomPlanner']

function planDir() {
  return path.join(appDataRoot(), APP_DATA_DIR)
}

function migrateLegacyDataDirIfNeeded() {
  const target = planDir()
  if (fs.existsSync(path.join(target, 'plan.json'))) return

  for (const legacyName of LEGACY_DATA_DIRS) {
    const legacyDir = path.join(appDataRoot(), legacyName)
    const legacyPlan = path.join(legacyDir, 'plan.json')
    if (!fs.existsSync(legacyPlan)) continue

    fs.mkdirSync(target, { recursive: true })
    fs.cpSync(legacyDir, target, { recursive: true })
    return
  }
}

function planPath() {
  return path.join(planDir(), 'plan.json')
}

function planBackupPath() {
  return path.join(planDir(), 'plan.json.bak')
}

function ensurePlanDir() {
  migrateLegacyDataDirIfNeeded()
  const dir = planDir()
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function readValidPlanFile(file) {
  const content = fs.readFileSync(file, 'utf8')
  JSON.parse(content)
  return content
}

function loadPlanContent() {
  ensurePlanDir()
  const file = planPath()
  const bak = planBackupPath()

  if (!fs.existsSync(file)) {
    if (fs.existsSync(bak)) {
      try {
        const restored = readValidPlanFile(bak)
        fs.writeFileSync(file, restored, 'utf8')
        return restored
      } catch {
        /* fall through */
      }
    }
    fs.writeFileSync(file, DEFAULT_PLAN_JSON, 'utf8')
    return DEFAULT_PLAN_JSON
  }

  try {
    return readValidPlanFile(file)
  } catch {
    if (fs.existsSync(bak)) {
      try {
        const restored = readValidPlanFile(bak)
        fs.copyFileSync(bak, file)
        return restored
      } catch {
        /* fall through */
      }
    }
    fs.writeFileSync(file, DEFAULT_PLAN_JSON, 'utf8')
    return DEFAULT_PLAN_JSON
  }
}

function savePlanContent(data) {
  ensurePlanDir()
  const file = planPath()
  const bak = planBackupPath()
  JSON.parse(data)
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, bak)
  }
  fs.writeFileSync(file, data, 'utf8')
}

module.exports = {
  DEFAULT_PLAN_JSON,
  planDir,
  planPath,
  planBackupPath,
  ensurePlanDir,
  loadPlanContent,
  savePlanContent,
}
