const DEFAULT_MS = 400

let suppressUntil = 0
let listenerAttached = false

function onCaptureClick(event: MouseEvent) {
  if (Date.now() >= suppressUntil) {
    detachSuppressListener()
    return
  }
  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()
}

function attachSuppressListener() {
  if (listenerAttached) return
  listenerAttached = true
  document.addEventListener('click', onCaptureClick, true)
}

function detachSuppressListener() {
  if (!listenerAttached) return
  listenerAttached = false
  document.removeEventListener('click', onCaptureClick, true)
}

/** Блокирует click-through на элементы под только что закрытым оверлеем. */
export function suppressClickThrough(ms = DEFAULT_MS): void {
  suppressUntil = Date.now() + ms
  attachSuppressListener()
  window.setTimeout(() => {
    if (Date.now() >= suppressUntil) {
      detachSuppressListener()
    }
  }, ms + 50)
}

export function isClickSuppressed(): boolean {
  return Date.now() < suppressUntil
}
