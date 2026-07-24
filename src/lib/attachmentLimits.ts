/** Max decoded attachment size (bytes). Kept in sync with electron/attachments-file.cjs */
export const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024

export function assertAttachmentSize(byteLength: number): void {
  if (byteLength > MAX_ATTACHMENT_BYTES) {
    throw new Error(
      `Файл слишком большой (макс. ${Math.round(MAX_ATTACHMENT_BYTES / (1024 * 1024))} МБ)`,
    )
  }
}
