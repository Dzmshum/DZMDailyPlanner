const MAX_DIMENSION = 1920
const JPEG_QUALITY = 0.85

export async function compressImageFile(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Можно прикрепить только изображение')
  }

  const bitmap = await createImageBitmap(file)
  let { width, height } = bitmap
  const maxSide = Math.max(width, height)

  if (maxSide > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / maxSide
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Не удалось обработать изображение')

  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
  })

  if (!blob) throw new Error('Не удалось сжать изображение')
  return blob
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Не удалось прочитать файл'))
        return
      }
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(reader.error ?? new Error('Ошибка чтения файла'))
    reader.readAsDataURL(blob)
  })
}

export function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: mimeType })
}
