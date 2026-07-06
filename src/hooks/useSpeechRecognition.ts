import { useCallback, useEffect, useRef, useState } from 'react'
import { voiceError, voiceLog } from '../lib/voiceLog'

interface SpeechRecognitionResultLike {
  isFinal: boolean
  [index: number]: { transcript: string }
}

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: {
    length: number
    [index: number]: SpeechRecognitionResultLike
  }
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onaudiostart: (() => void) | null
  onaudioend: (() => void) | null
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error: string; message?: string }) => void) | null
  onend: (() => void) | null
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  const ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
  voiceLog('API available:', Boolean(ctor), {
    SpeechRecognition: Boolean(w.SpeechRecognition),
    webkitSpeechRecognition: Boolean(w.webkitSpeechRecognition),
    isSecureContext: window.isSecureContext,
    protocol: window.location.protocol,
  })
  return ctor
}

export function useSpeechRecognition(
  onTranscript: (text: string, isFinal: boolean) => void,
) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const onTranscriptRef = useRef(onTranscript)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  useEffect(() => {
    setSupported(getSpeechRecognition() !== null)
  }, [])

  const stop = useCallback(() => {
    voiceLog('stop()')
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setListening(false)
  }, [])

  const start = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) {
      voiceError('SpeechRecognition not supported in this environment')
      setLastError('API недоступен (нужен Chromium / Electron)')
      return
    }

    recognitionRef.current?.abort()

    const recognition = new SpeechRecognition()
    recognition.lang = 'ru-RU'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => {
      voiceLog('onstart')
      setLastError(null)
    }

    recognition.onaudiostart = () => voiceLog('onaudiostart — микрофон активен')

    recognition.onaudioend = () => voiceLog('onaudioend')

    recognition.onresult = (event) => {
      let session = ''
      let hasInterim = false
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const chunk = result[0]?.transcript ?? ''
        session += chunk
        if (!result.isFinal) hasInterim = true
        voiceLog(`result[${i}]`, { final: result.isFinal, chunk })
      }
      const text = session.trim()
      if (text) {
        voiceLog('transcript:', text, hasInterim ? '(interim)' : '(final)')
        onTranscriptRef.current(text, !hasInterim)
      }
    }

    recognition.onerror = (event) => {
      const msg = event.message ? `${event.error}: ${event.message}` : event.error
      voiceError('onerror', msg)
      if (event.error === 'not-allowed') {
        setLastError('Нет доступа к микрофону — разрешите в настройках ОС')
      } else if (event.error === 'service-not-allowed') {
        setLastError('Служба распознавания недоступна (проверьте интернет в Electron)')
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setLastError(msg)
      }
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setListening(false)
      }
    }

    recognition.onend = () => {
      voiceLog('onend')
      setListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    setListening(true)
    try {
      voiceLog('start()')
      recognition.start()
    } catch (err) {
      voiceError('start() threw', err)
      setListening(false)
      setLastError(err instanceof Error ? err.message : 'Не удалось запустить запись')
    }
  }, [])

  const toggle = useCallback(() => {
    if (listening) stop()
    else start()
  }, [listening, start, stop])

  useEffect(() => () => recognitionRef.current?.abort(), [])

  return { supported, listening, lastError, start, stop, toggle }
}
