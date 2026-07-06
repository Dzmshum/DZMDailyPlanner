export function getImageFilesFromClipboard(
  clipboardData: DataTransfer | null | undefined,
): File[] {
  if (!clipboardData) return []

  const files: File[] = []
  for (const item of clipboardData.items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) files.push(file)
    }
  }
  return files
}
