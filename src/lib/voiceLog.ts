const PREFIX = '[Voice]'

export function voiceLog(...args: unknown[]) {
  console.log(PREFIX, ...args)
}

export function voiceWarn(...args: unknown[]) {
  console.warn(PREFIX, ...args)
}

export function voiceError(...args: unknown[]) {
  console.error(PREFIX, ...args)
}
