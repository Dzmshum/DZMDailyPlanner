const path = require('path')
const fs = require('fs')
const { planDir, ensurePlanDir } = require('./plan-file.cjs')

function attachmentsRoot() {
  return path.join(planDir(), 'attachments')
}

function safeSegment(value, label) {
  const safe = path.basename(value)
  if (!safe || safe !== value || value.includes('..')) {
    throw new Error(`Invalid ${label}`)
  }
  return safe
}

function taskAttachmentsDir(taskId) {
  return path.join(attachmentsRoot(), safeSegment(taskId, 'task id'))
}

function attachmentPath(taskId, fileName) {
  const safeName = safeSegment(fileName, 'attachment file name')
  return path.join(taskAttachmentsDir(taskId), safeName)
}

function ensureTaskAttachmentsDir(taskId) {
  ensurePlanDir()
  const dir = taskAttachmentsDir(taskId)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

/** Keep in sync with src/lib/attachmentLimits.ts */
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024

function saveAttachmentFile(taskId, fileName, base64Data) {
  const file = attachmentPath(taskId, fileName)
  ensureTaskAttachmentsDir(taskId)
  const buf = Buffer.from(base64Data, 'base64')
  if (buf.length > MAX_ATTACHMENT_BYTES) {
    throw new Error(
      `Файл слишком большой (макс. ${Math.round(MAX_ATTACHMENT_BYTES / (1024 * 1024))} МБ)`,
    )
  }
  fs.writeFileSync(file, buf)
}

function readAttachmentFile(taskId, fileName) {
  const file = attachmentPath(taskId, fileName)
  if (!fs.existsSync(file)) {
    throw new Error('Attachment not found')
  }
  const buf = fs.readFileSync(file)
  return buf.toString('base64')
}

function deleteAttachmentFile(taskId, fileName) {
  const file = attachmentPath(taskId, fileName)
  if (fs.existsSync(file)) {
    fs.unlinkSync(file)
  }
  const dir = taskAttachmentsDir(taskId)
  if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir)
  }
}

function deleteTaskAttachments(taskId) {
  const dir = taskAttachmentsDir(taskId)
  if (!fs.existsSync(dir)) return
  fs.rmSync(dir, { recursive: true, force: true })
}

module.exports = {
  attachmentsRoot,
  taskAttachmentsDir,
  attachmentPath,
  saveAttachmentFile,
  readAttachmentFile,
  deleteAttachmentFile,
  deleteTaskAttachments,
}
