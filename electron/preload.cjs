const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('doomPlanner', {
  loadPlan: () => ipcRenderer.invoke('load-plan'),
  savePlan: (data) => ipcRenderer.invoke('save-plan', data),
  exportPlan: (data) => ipcRenderer.invoke('export-plan', data),
  importPlan: () => ipcRenderer.invoke('import-plan'),
  getPlanPath: () => ipcRenderer.invoke('get-plan-path'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  windowToggleMaximize: () => ipcRenderer.invoke('window-toggle-maximize'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  setWindowMode: (mode) => ipcRenderer.invoke('set-window-mode', mode),
  getWindowMode: () => ipcRenderer.invoke('get-window-mode'),
  expandToStandard: (taskId) => ipcRenderer.invoke('expand-to-standard', taskId),
  createJiraIssue: (payload) => ipcRenderer.invoke('create-jira-issue', payload),
  saveAttachment: (taskId, fileName, base64Data) =>
    ipcRenderer.invoke('save-attachment', taskId, fileName, base64Data),
  readAttachment: (taskId, fileName) =>
    ipcRenderer.invoke('read-attachment', taskId, fileName),
  deleteAttachment: (taskId, fileName) =>
    ipcRenderer.invoke('delete-attachment', taskId, fileName),
  deleteTaskAttachments: (taskId) =>
    ipcRenderer.invoke('delete-task-attachments', taskId),
})
