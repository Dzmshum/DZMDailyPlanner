import { useEffect, useState } from 'react'
import type { TaskAttachment } from '../../types'
import { getAttachmentBlobUrl } from '../../lib/attachmentStorage'
import { ImageLightbox } from '../ui/ImageLightbox'

export function TaskAttachmentPreview({
  taskId,
  attachment,
}: {
  taskId: string
  attachment: TaskAttachment
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    let active = true
    void getAttachmentBlobUrl(taskId, attachment)
      .then((blobUrl) => {
        if (active) setUrl(blobUrl)
      })
      .catch(() => {
        if (active) setUrl(null)
      })
    return () => {
      active = false
    }
  }, [taskId, attachment.id, attachment.fileName])

  if (!url) return null

  return (
    <>
      <button
        type="button"
        className="task-card-attachment-thumb-btn"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setLightboxOpen(true)
        }}
        title={attachment.name}
      >
        <img
          src={url}
          alt=""
          className="task-card-attachment-thumb"
        />
      </button>

      <ImageLightbox
        open={lightboxOpen}
        src={url}
        title={attachment.name}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}
