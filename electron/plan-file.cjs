const path = require('path')
const fs = require('fs')
const os = require('os')

const DEFAULT_PLAN = {
  version: 1,
  settings: {
    theme: 'system',
    colorPalette: 'northrend',
    defaultView: 'dashboard',
    windowMode: 'standard',
    calendar: { showHolidays: true, calendarView: 'week' },
    daily: { enabled: true, days: [1, 4] },
    export: {
      includeDone: false,
      skipEmptyDays: true,
      exportTitle: 'Текущий план.',
    },
    voiceInputEnabled: false,
    jira: {
      enabled: false,
      baseUrl: '',
      email: '',
      apiToken: '',
      projectKey: '',
      issueType: 'Task',
    },
  },
  projects: [],
  tasks: [],
}

const DEFAULT_PLAN_JSON = JSON.stringify(DEFAULT_PLAN, null, 2)

function appDataRoot() {
  if (process.platform === 'win32') {
    return process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming')
  }
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support')
  }
  return process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config')
}

function planDir() {
  return path.join(appDataRoot(), 'DoomPlanner')
}

function planPath() {
  return path.join(planDir(), 'plan.json')
}

function planBackupPath() {
  return path.join(planDir(), 'plan.json.bak')
}

function ensurePlanDir() {
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
