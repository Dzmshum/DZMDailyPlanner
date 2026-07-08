import type { Plugin, Connect } from 'vite'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const planFile = require('../electron/plan-file.cjs') as {
  loadPlanContent: () => string
  savePlanContent: (data: string) => void
  planPath: () => string
}
const attachmentsFile = require('../electron/attachments-file.cjs') as {
  saveAttachmentFile: (taskId: string, fileName: string, base64: string) => void
  readAttachmentFile: (taskId: string, fileName: string) => string
  deleteAttachmentFile: (taskId: string, fileName: string) => void
  deleteTaskAttachments: (taskId: string) => void
}

function readBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

export function planApiPlugin(): Plugin {
  return {
    name: 'planboard-plan-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]

        if (url === '/api/plan' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(planFile.loadPlanContent())
          return
        }

        if (url === '/api/plan/path' && req.method === 'GET') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.end(planFile.planPath())
          return
        }

        if (
          url === '/api/plan' &&
          (req.method === 'PUT' || req.method === 'POST')
        ) {
          try {
            const body = await readBody(req)
            planFile.savePlanContent(body)
            res.statusCode = 200
            res.end('ok')
          } catch (err) {
            res.statusCode = 500
            res.end(err instanceof Error ? err.message : 'save failed')
          }
          return
        }

        const attachmentMatch = url?.match(
          /^\/api\/attachments\/([^/]+)(?:\/([^/]+))?$/,
        )
        if (attachmentMatch) {
          const taskId = decodeURIComponent(attachmentMatch[1])
          const fileName = attachmentMatch[2]
            ? decodeURIComponent(attachmentMatch[2])
            : null

          if (req.method === 'PUT' && fileName) {
            try {
              const body = await readBody(req)
              const json = JSON.parse(body) as { data: string }
              attachmentsFile.saveAttachmentFile(taskId, fileName, json.data)
              res.statusCode = 200
              res.end('ok')
            } catch (err) {
              res.statusCode = 500
              res.end(err instanceof Error ? err.message : 'save failed')
            }
            return
          }

          if (req.method === 'GET' && fileName) {
            try {
              const data = attachmentsFile.readAttachmentFile(taskId, fileName)
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ data }))
            } catch (err) {
              res.statusCode = 404
              res.end(err instanceof Error ? err.message : 'not found')
            }
            return
          }

          if (req.method === 'DELETE') {
            try {
              if (fileName) {
                attachmentsFile.deleteAttachmentFile(taskId, fileName)
              } else {
                attachmentsFile.deleteTaskAttachments(taskId)
              }
              res.statusCode = 200
              res.end('ok')
            } catch (err) {
              res.statusCode = 500
              res.end(err instanceof Error ? err.message : 'delete failed')
            }
            return
          }
        }

        next()
      })
    },
  }
}
