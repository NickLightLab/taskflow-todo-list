import { useEffect, useId, useState, type FormEvent, type KeyboardEvent, type RefObject } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUp, Plus } from 'lucide-react'
import { MAX_LENGTH, validateText } from '../lib/tasks'

interface Props {
  onAdd: (text: string) => void
  inputRef: RefObject<HTMLInputElement | null>
}

export function Composer({ onAdd, inputRef }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pulse, setPulse] = useState(0)
  const [shake, setShake] = useState(0)
  const [focused, setFocused] = useState(false)
  const inputId = useId()
  const errId = useId()

  // Быстрая клавиша «/» — фокус в поле, как в Linear/Raycast.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [inputRef])

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    const result = validateText(value)
    if (!result.ok) {
      setError(result.reason === 'empty' ? 'Введите текст задачи' : `Не длиннее ${MAX_LENGTH} символов`)
      setShake((n) => n + 1)
      inputRef.current?.focus()
      return
    }
    onAdd(result.text)
    setValue('')
    setError(null)
    setPulse((n) => n + 1)
    inputRef.current?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setValue('')
      setError(null)
      e.currentTarget.blur()
    }
  }

  const left = MAX_LENGTH - value.length
  const canSubmit = value.trim().length > 0

  return (
    <form onSubmit={submit} noValidate className="mt-10 sm:mt-12" aria-label="Новая задача">
      <div
        key={shake}
        className={[
          'relative overflow-hidden rounded-2xl border bg-surface transition-[border-color,box-shadow,background-color] duration-300',
          shake > 0 && error ? 'shake' : '',
          error
            ? 'border-danger/70'
            : focused
              ? 'border-lime/60 shadow-[0_0_0_4px_rgb(198_244_50/0.07),0_20px_60px_-30px_rgb(198_244_50/0.35)]'
              : 'border-line-strong hover:border-faint',
        ].join(' ')}
      >
        <div className="flex items-center gap-3 p-2 pl-4 sm:gap-4 sm:p-3 sm:pl-6">
          <Plus
            size={22}
            strokeWidth={1.5}
            aria-hidden="true"
            className={`shrink-0 transition-all duration-300 ${focused ? 'rotate-90 text-lime' : 'text-faint'}`}
          />
          <label htmlFor={inputId} className="sr-only">
            Текст новой задачи
          </label>
          <input
            id={inputId}
            ref={inputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (error) setError(null)
            }}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            maxLength={MAX_LENGTH}
            autoComplete="off"
            enterKeyHint="done"
            placeholder="Что сделать?"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errId : undefined}
            className="min-w-0 flex-1 bg-transparent py-3 text-[18px] font-medium tracking-tight text-fg placeholder:text-faint focus:outline-none focus-visible:outline-none sm:py-4 sm:text-[26px]"
          />
          <button
            type="submit"
            aria-label="Добавить задачу"
            className={[
              'group flex h-12 shrink-0 items-center gap-2 rounded-xl px-4 text-[14px] font-semibold transition-all duration-200 active:scale-[0.96] sm:h-14 sm:px-6',
              canSubmit
                ? 'bg-lime text-[#10130a] hover:bg-[#d4ff45] hover:shadow-[0_8px_30px_-8px_rgb(198_244_50/0.6)]'
                : 'bg-raised text-muted hover:text-fg',
            ].join(' ')}
          >
            <span className="hidden sm:inline">Добавить</span>
            <ArrowUp size={18} strokeWidth={2.25} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
        {pulse > 0 && (
          <span
            key={pulse}
            aria-hidden="true"
            className="sweep pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-lime"
          />
        )}
      </div>

      <div className="mt-3 flex min-h-6 items-center justify-between gap-4 px-1 font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            {error ? (
              <motion.p
                key="err"
                id={errId}
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-danger"
              >
                {error}
              </motion.p>
            ) : (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap items-center gap-x-2"
              >
                <kbd className="rounded border border-line-strong bg-raised px-1.5 py-0.5 text-muted">Enter</kbd>
                <span>добавить</span>
                <span className="hidden sm:inline" aria-hidden="true">
                  ·
                </span>
                <kbd className="hidden rounded border border-line-strong bg-raised px-1.5 py-0.5 text-muted sm:inline">/</kbd>
                <span className="hidden sm:inline">фокус</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        {value.length > MAX_LENGTH - 40 && (
          <span
            className={`tabular-nums ${left <= 0 ? 'text-danger' : 'text-muted'}`}
            aria-live="polite"
            aria-label={`Осталось символов: ${left}`}
          >
            {left}
          </span>
        )}
      </div>
    </form>
  )
}
