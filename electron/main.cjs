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

const isDev =
  process.env.NODE_ENV === 'development' || !app.isPackaged

/** @type {import('electron').BrowserWindow | null} */
let mainWindow = null

/** @type {'standard' | 'maximized' | 'minimal'} */
let currentWindowMode = 'standard'

function applyWindowMode(mode) {
  if (!mainWindow) return
  currentWindowMode = mode

  if (mode === 'minimal') {
    const { workArea } = screen.getPrimaryDisplay()
    mainWindow.setMinimumSize(280, 360)
    mainWindow.setMaximumSize(420, 720)
    mainWindow.setSize(320, 480)
    mainWindow.setAlwaysOnTop(true, 'floating')
    mainWindow.setPosition(workArea.x + workArea.width - 320 - 12, workArea.y + 12)
    if (mainWindow.isMaximized()) mainWindow.unmaximize()
    return
  }

  mainWindow.setAlwaysOnTop(false)
  mainWindow.setMinimumSize(900, 600)
  mainWindow.setMaximumSize(10000, 10000)

  if (mode === 'maximized') {
    mainWindow.maximize()
  } else {
    if (mainWindow.isMaximized()) mainWindow.unmaximize()
    mainWindow.setSize(1200, 800)
    mainWindow.center()
  }
}

function createWindow() {
  const iconPath = path.join(__dirname, '..', 'resources', 'icon.png')
  const fallbackIcon = path.join(__dirname, '..', 'build', 'icon.png')
  const windowIcon = require('fs').existsSync(iconPath) ? iconPath : fallbackIcon
  const windowOptions = {
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
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
  } else {
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
