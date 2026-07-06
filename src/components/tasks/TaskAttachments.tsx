import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react'
import type { TaskAttachment } from '../../types'
import {
  getAttachmentBlobUrl,
  removeTaskAttachment,
  revokeAttachmentUrl,
  saveTaskAttachment,
} from '../../lib/attachmentStorage'
import { useClipboardImagePaste } from '../../hooks/useClipboardImagePaste'
import { ImageLightbox } from '../ui/ImageLightbox'
import { UiIcon } from '../ui/UiIcon'

interface TaskAttachmentsProps {
  taskId: string
  attachments: TaskAttachment[]
  onChange: (attachments: TaskAttachment[]) => void
  compact?: boolean
  /** При редактировании — удалять файл только при сохранении задачи. */
  deferDiskDelete?: boolean
}

function AttachmentThumb({
  taskId,
  attachment,
  onRemove,
  onOpen,
}: {
  taskId: string
  attachment: TaskAttachment
  onRemove: () => void
  onOpen: (url: string) => void
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    void getAttachmentBlobUrl(taskId, attachment)
      .then((blobUrl) => {
        if (active) setUrl(blobUrl)
      })
      .catch(() => {
        if (active) setError(true)
      })
    return () => {
      active = false
    }
  }, [taskId, attachment.id, attachment.fileName])

  return (
    <div className="task-attachment-item">
      {url && !error ? (
        <button
          type="button"
          className="task-attachment-thumb"
          title={attachment.name}
          onClick={() => onOpen(url)}
        >
          <img src={url} alt={attachment.name} />
        </button>
      ) : (
        <div className="task-attachment-thumb task-attachment-thumb--error">
          ?
        </div>
      )}
      <button
        type="button"
        className="btn btn-ghost btn-icon task-attachment-remove"
        onClick={onRemove}
        title="Удалить фото"
        aria-label="Удалить фото"
      >
        <UiIcon icon="close" size="sm" />
      </button>
    </div>
  )
}

export function TaskAttachments({
  taskId,
  attachments,
  onChange,
  compact = false,
  deferDiskDelete = false,
}: TaskAttachmentsProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const attachmentsRef = useRef(attachments)
  attachmentsRef.current = attachments

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [lightbox, setLightbox] = useState<{ src: string; title: string } | null>(
    null,
  )

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (list.length === 0) {
        setUploadError('Выберите изображение (JPG, PNG, WebP…)')
        return
      }

      setUploading(true)
      setUploadError('')
      try {
        const added: TaskAttachment[] = []
        for (const file of list) {
          const attachment = await saveTaskAttachment(taskId, file)
          added.push(attachment)
        }
        onChange([...attachmentsRef.current, ...added])
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Не удалось загрузить фото')
      } finally {
        setUploading(false)
      }
    },
    [onChange, taskId],
  )

  useClipboardImagePaste(Boolean(taskId), addFiles)

  const handleRemove = (attachment: TaskAttachment) => {
    revokeAttachmentUrl(taskId, attachment.fileName)
    onChange(attachments.filter((a) => a.id !== attachment.id))
    if (!deferDiskDelete) {
      void removeTaskAttachment(taskId, attachment.fileName).catch(() => {})
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files?.length) void addFiles(files)
    e.target.value = ''
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files.length > 0) {
      void addFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <>
      <div
        className={`task-attachments ${compact ? 'task-attachments--compact' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="task-attachments-header">
          <span className="form-label">Фото</span>
          {!compact && (
            <span className="form-hint task-attachments-hint">
              Ctrl+V в любом поле · перетаскивание
            </span>
          )}
        </div>

        <div className="task-attachments-grid">
          {attachments.map((attachment) => (
            <AttachmentThumb
              key={attachment.id}
              taskId={taskId}
              attachment={attachment}
              onRemove={() => handleRemove(attachment)}
              onOpen={(src) =>
                setLightbox({ src, title: attachment.name })
              }
            />
          ))}

          <button
            type="button"
            className="task-attachment-add"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            title="Добавить фото"
          >
            {uploading ? '…' : '+'}
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden-file-input"
          onChange={handleFileInput}
        />

        {uploadError && <p className="form-error">{uploadError}</p>}
      </div>

      <ImageLightbox
        open={lightbox !== null}
        src={lightbox?.src ?? null}
        title={lightbox?.title}
        onClose={() => setLightbox(null)}
      />
    </>
  )
}
