const { app, BrowserWindow, ipcMain, dialog, Menu, screen } = require('electron')
const path = require('path')
const {
  loadPlanContent,
  savePlanContent,
  planPath,
} = require('./plan-file.cjs')
const {
  saveAttachmentFile,
  readAttachmentFile,
  deleteAttachmentFile,
  deleteTaskAttachments,
} = require('./attachments-file.cjs')
const { loadWindowLayouts, saveWindowLayout } = require('./window-layouts.cjs')

const isDev =
  process.env.NODE_ENV === 'development' || !app.isPackaged

/** @type {import('electron').BrowserWindow | null} */
let mainWindow = null

/** @type {'standard' | 'maximized' | 'minimal'} */
let currentWindowMode = 'standard'

/** @type {{ standard?: import('./window-layouts.cjs').WindowLayout, minimal?: import('./window-layouts.cjs').WindowLayout }} */
let windowLayouts = loadWindowLayouts()

let suppressLayoutCapture = false
/** @type {ReturnType<typeof setTimeout> | null} */
let layoutSaveTimer = null

const MINIMAL_SIZE = { minWidth: 260, minHeight: 280, maxWidth: 380, maxHeight: 640 }
const STANDARD_SIZE = { minWidth: 900, minHeight: 600, maxWidth: 10000, maxHeight: 10000 }

function defaultStandardLayout() {
  const { workArea } = screen.getPrimaryDisplay()
  const width = 1200
  const height = 800
  return {
    x: workArea.x + Math.round((workArea.width - width) / 2),
    y: workArea.y + Math.round((workArea.height - height) / 2),
    width,
    height,
  }
}

function defaultMinimalLayout() {
  const { workArea } = screen.getPrimaryDisplay()
  const width = 280
  const height = 380
  return {
    x: workArea.x + workArea.width - width - 12,
    y: workArea.y + 12,
    width,
    height,
  }
}

/** @param {import('./window-layouts.cjs').WindowLayout} layout @param {'standard' | 'minimal'} mode */
function clampLayout(layout, mode) {
  const display = screen.getDisplayMatching(layout)
  const { workArea } = display
  let { x, y, width, height } = layout

  if (mode === 'minimal') {
    width = Math.min(MINIMAL_SIZE.maxWidth, Math.max(MINIMAL_SIZE.minWidth, width))
    height = Math.min(MINIMAL_SIZE.maxHeight, Math.max(MINIMAL_SIZE.minHeight, height))
  } else {
    width = Math.max(STANDARD_SIZE.minWidth, Math.min(width, workArea.width))
    height = Math.max(STANDARD_SIZE.minHeight, Math.min(height, workArea.height))
  }

  const minVisibleX = 80
  const minVisibleY = 48
  x = Math.min(
    Math.max(x, workArea.x - width + minVisibleX),
    workArea.x + workArea.width - minVisibleX,
  )
  y = Math.min(
    Math.max(y, workArea.y),
    workArea.y + workArea.height - minVisibleY,
  )

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  }
}

function captureCurrentLayout(mode = currentWindowMode) {
  if (!mainWindow || suppressLayoutCapture || mode === 'maximized') return
  if (mainWindow.isMaximized()) return

  const bounds = mainWindow.getBounds()
  const layout = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  }

  if (mode === 'standard' || mode === 'minimal') {
    const clamped = clampLayout(layout, mode)
    windowLayouts = saveWindowLayout(mode, clamped, windowLayouts)
  }
}

function scheduleLayoutSave() {
  if (layoutSaveTimer) clearTimeout(layoutSaveTimer)
  layoutSaveTimer = setTimeout(() => {
    layoutSaveTimer = null
    captureCurrentLayout(currentWindowMode)
  }, 250)
}

function runWithoutLayoutCapture(fn) {
  suppressLayoutCapture = true
  try {
    fn()
  } finally {
    setTimeout(() => {
      suppressLayoutCapture = false
    }, 150)
  }
}

/** @param {import('./window-layouts.cjs').WindowLayout} layout @param {'standard' | 'minimal'} mode */
function applyLayout(layout, mode) {
  if (!mainWindow) return
  mainWindow.setBounds(clampLayout(layout, mode))
}

function applyWindowMode(mode) {
  if (!mainWindow) return

  if (currentWindowMode !== mode) {
    captureCurrentLayout(currentWindowMode)
  }

  currentWindowMode = mode

  runWithoutLayoutCapture(() => {
    if (mode === 'minimal') {
      mainWindow.setMinimumSize(MINIMAL_SIZE.minWidth, MINIMAL_SIZE.minHeight)
      mainWindow.setMaximumSize(MINIMAL_SIZE.maxWidth, MINIMAL_SIZE.maxHeight)
      mainWindow.setAlwaysOnTop(true, 'floating')
      if (mainWindow.isMaximized()) mainWindow.unmaximize()
      applyLayout(windowLayouts.minimal ?? defaultMinimalLayout(), 'minimal')
      return
    }

    mainWindow.setAlwaysOnTop(false)
    mainWindow.setMinimumSize(STANDARD_SIZE.minWidth, STANDARD_SIZE.minHeight)
    mainWindow.setMaximumSize(STANDARD_SIZE.maxWidth, STANDARD_SIZE.maxHeight)

    if (mode === 'maximized') {
      if (mainWindow.isMaximized()) return
      mainWindow.maximize()
      return
    }

    if (mainWindow.isMaximized()) mainWindow.unmaximize()
    applyLayout(windowLayouts.standard ?? defaultStandardLayout(), 'standard')
  })
}

function attachWindowLayoutListeners() {
  if (!mainWindow) return
  mainWindow.on('moved', scheduleLayoutSave)
  mainWindow.on('resized', scheduleLayoutSave)
  mainWindow.on('close', () => {
    captureCurrentLayout(currentWindowMode)
  })
}

function createWindow() {
  const iconPath = path.join(__dirname, '..', 'resources', 'icon.png')
  const fallbackIcon = path.join(__dirname, '..', 'build', 'icon.png')
  const windowIcon = require('fs').existsSync(iconPath) ? iconPath : fallbackIcon
  const initialStandard = windowLayouts.standard ?? defaultStandardLayout()
  const windowOptions = {
    width: initialStandard.width,
    height: initialStandard.height,
    x: initialStandard.x,
    y: initialStandard.y,
    minWidth: STANDARD_SIZE.minWidth,
    minHeight: STANDARD_SIZE.minHeight,
    title: 'PlanBoard',
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  }

  if (require('fs').existsSync(windowIcon)) {
    windowOptions.icon = windowIcon
  }

  mainWindow = new BrowserWindow(windowOptions)
  attachWindowLayoutListeners()

  if (isDev) {
    mainWindow.loadURL('http://127.0.0.1:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'build', 'index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

ipcMain.handle('load-plan', () => loadPlanContent())

ipcMain.handle('save-plan', (_event, data) => {
  savePlanContent(data)
})

ipcMain.handle('export-plan', async (_event, data) => {
  const fs = require('fs')
  const result = await dialog.showSaveDialog({
    title: 'Экспорт плана',
    defaultPath: 'plan-export.json',
    filters: [{ name: 'JSON', extensions: ['json'] }],
  })
  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, data, 'utf8')
  }
})

ipcMain.handle('import-plan', async () => {
  const fs = require('fs')
  const result = await dialog.showOpenDialog({
    title: 'Импорт плана',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile'],
  })
  if (result.canceled || !result.filePaths[0]) {
    return null
  }
  const filePath = result.filePaths[0]
  const content = fs.readFileSync(filePath, 'utf8')
  JSON.parse(content)
  return { content, filePath }
})

ipcMain.handle('get-plan-path', () => planPath())

ipcMain.handle('save-attachment', (_event, taskId, fileName, base64Data) => {
  saveAttachmentFile(taskId, fileName, base64Data)
})

ipcMain.handle('read-attachment', (_event, taskId, fileName) => {
  return readAttachmentFile(taskId, fileName)
})

ipcMain.handle('delete-attachment', (_event, taskId, fileName) => {
  deleteAttachmentFile(taskId, fileName)
})

ipcMain.handle('delete-task-attachments', (_event, taskId) => {
  deleteTaskAttachments(taskId)
})

ipcMain.handle('window-close', () => {
  mainWindow?.close()
})

ipcMain.handle('window-toggle-maximize', () => {
  if (!mainWindow) return false
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize()
    if (currentWindowMode === 'standard') {
      runWithoutLayoutCapture(() => {
        applyLayout(windowLayouts.standard ?? defaultStandardLayout(), 'standard')
      })
    }
  } else {
    if (currentWindowMode === 'standard') {
      captureCurrentLayout('standard')
    }
    mainWindow.maximize()
  }
  return mainWindow.isMaximized()
})

ipcMain.handle('window-is-maximized', () => mainWindow?.isMaximized() ?? false)

ipcMain.handle('set-window-mode', (_event, mode) => {
  applyWindowMode(mode)
  return mode
})

ipcMain.handle('get-window-mode', () => currentWindowMode)

ipcMain.handle('expand-to-standard', (_event, taskId) => {
  applyWindowMode('standard')
  return taskId ?? null
})

ipcMain.handle(
  'create-jira-issue',
  async (
    _event,
    {
      baseUrl,
      email,
      apiToken,
      projectKey,
      issueType,
      summary,
      description,
      deadline,
    },
  ) => {
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64')
    const url = `${baseUrl.replace(/\/$/, '')}/rest/api/3/issue`

    const fields = {
      project: { key: projectKey },
      summary,
      issuetype: { name: issueType || 'Task' },
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: description }],
          },
        ],
      },
    }

    if (deadline) {
      fields.duedate = deadline
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    })

    const text = await response.text()
    if (!response.ok) {
      throw new Error(`Jira ${response.status}: ${text}`)
    }

    const json = JSON.parse(text)
    const issueKey = json.key
    if (!issueKey) {
      throw new Error(`Нет ключа задачи в ответе: ${text}`)
    }

    return {
      issueKey,
      issueUrl: `${baseUrl.replace(/\/$/, '')}/browse/${issueKey}`,
    }
  },
)

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('before-quit', () => {
  captureCurrentLayout(currentWindowMode)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
