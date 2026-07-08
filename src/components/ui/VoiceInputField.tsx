import {
  useRef,
  useEffect,
  useCallback,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'

interface VoiceInputFieldBaseProps {
  value: string
  onChange: (value: string) => void
  voiceEnabled: boolean
  className?: string
  inputClassName?: string
}

type VoiceInputFieldProps = VoiceInputFieldBaseProps &
  (
    | ({ multiline?: false } & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>)
    | ({ multiline: true } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'>)
  )

function shouldRespondToVoiceHotkey(root: HTMLElement): boolean {
  const focusedVoice = document.activeElement?.closest('.input-with-voice')
  if (focusedVoice) return focusedVoice === root

  const scope = root.closest('.modal') ?? document.body
  const fields = scope.querySelectorAll('.input-with-voice')
  return fields.length > 0 && fields[0] === root
}

export function VoiceInputField({
  value,
  onChange,
  voiceEnabled,
  className,
  inputClassName,
  multiline,
  ...fieldProps
}: VoiceInputFieldProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const baseRef = useRef('')

  const { supported, listening, lastError, toggle, stop } = useSpeechRecognition(
    (sessionText, isFinal) => {
      const piece = sessionText.trim()
      if (!piece) return
      const merged = baseRef.current ? `${baseRef.current} ${piece}`.trim() : piece
      onChange(merged)
      if (isFinal) baseRef.current = merged
    },
  )

  const handleVoiceToggle = useCallback(() => {
    if (listening) {
      stop()
      return
    }
    baseRef.current = value.trim()
    toggle()
  }, [listening, stop, toggle, value])

  useEffect(() => {
    const onVoiceHotkey = () => {
      if (!voiceEnabled || !supported || !wrapperRef.current) return
      if (!shouldRespondToVoiceHotkey(wrapperRef.current)) return
      handleVoiceToggle()
    }
    window.addEventListener('planboard:voice-toggle', onVoiceHotkey)
    return () => window.removeEventListener('planboard:voice-toggle', onVoiceHotkey)
  }, [voiceEnabled, supported, handleVoiceToggle])

  const showVoice = voiceEnabled && supported

  const handleChange = (next: string) => {
    if (listening) stop()
    onChange(next)
  }

  const wrapperClass = [
    'input-with-voice',
    multiline ? 'input-with-voice-multiline' : '',
    listening ? 'is-listening' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  const fieldClass = multiline
    ? `form-textarea ${inputClassName ?? ''}`
    : `form-input ${inputClassName ?? ''}`

  return (
    <div ref={wrapperRef} className={wrapperClass}>
      {multiline ? (
        <textarea
          {...(fieldProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          className={fieldClass}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
        />
      ) : (
        <input
          {...(fieldProps as InputHTMLAttributes<HTMLInputElement>)}
          className={fieldClass}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
        />
      )}
      {showVoice && (
        <button
          type="button"
          className={`input-voice-btn ${listening ? 'is-active' : ''}`}
          onClick={handleVoiceToggle}
          title={listening ? 'Остановить запись (Ctrl+Shift+V)' : 'Голосовой ввод (Ctrl+Shift+V)'}
          aria-label={listening ? 'Остановить запись' : 'Голосовой ввод'}
        >
          <span className="input-voice-icon" aria-hidden>
            {listening ? '◉' : '🎤'}
          </span>
          {listening && <span className="input-voice-pulse" aria-hidden />}
        </button>
      )}
      {showVoice && lastError && (
        <p className="input-voice-error" role="status">
          {lastError} (см. консоль F12 → [Voice])
        </p>
      )}
    </div>
  )
}
