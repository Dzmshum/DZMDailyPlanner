import { useEffect, useRef } from 'react'
import { getImageFilesFromClipboard } from '../lib/clipboardImages'

export function useClipboardImagePaste(
  enabled: boolean,
  onFiles: (files: File[]) => void,
): void {
  const onFilesRef = useRef(onFiles)
  onFilesRef.current = onFiles

  useEffect(() => {
    if (!enabled) return

    const handler = (event: ClipboardEvent) => {
      const files = getImageFilesFromClipboard(event.clipboardData)
      if (files.length === 0) return

      event.preventDefault()
      event.stopPropagation()
      onFilesRef.current(files)
    }

    window.addEventListener('paste', handler, true)
    return () => window.removeEventListener('paste', handler, true)
  }, [enabled])
}
