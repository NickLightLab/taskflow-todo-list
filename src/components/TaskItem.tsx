import { useEffect, useRef, useState, type KeyboardEvent, type Ref } from 'react'
import { motion } from 'motion/react'
import { Check, Pencil, Trash2 } from 'lucide-react'
import { MAX_LENGTH, validateText, type Task } from '../lib/tasks'

interface Props {
  task: Task
  delay: number
  fresh?: boolean
  onToggle: (id: string) => void
  onRemove: (task: Task) => void
  onEdit: (id: string, text: string) => void
  onInvalid: (message: string) => void
  ref?: Ref<HTMLLIElement>
}

const timeFmt = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })
const dayFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })

function stamp(ts: number): string {
  const d = new Date(ts)
  const today = new Date()
  return d.toDateString() === today.toDateString() ? timeFmt.format(d) : dayFmt.format(d).replace('.', '')
}

export function TaskItem({ task, delay, fresh = false, onToggle, onRemove, onEdit, onInvalid, ref }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.text)
  const [leaving, setLeaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const editBtnRef = useRef<HTMLButtonElement>(null)
  const cancelled = useRef(false)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const startEdit = () => {
    cancelled.current = false
    setDraft(task.text)
    setEditing(true)
  }

  const finish = (save: boolean) => {
    if (save) {
      const r = validateText(draft)
      if (!r.ok) {
        onInvalid(r.reason === 'empty' ? 'Текст задачи не может быть пустым' : `Не длиннее ${MAX_LENGTH} символов`)
        inputRef.current?.focus()
        return
      }
      if (r.text !== task.text) onEdit(task.id, r.text)
    }
    setEditing(false)
    requestAnimationFrame(() => editBtnRef.current?.focus())
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      finish(true)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      cancelled.current = true
      finish(false)
    }
  }

  const remove = () => {
    setLeaving(true)
    onRemove(task)
  }

  return (
    <motion.li
      ref={ref}
      layout="position"
      initial={
        fresh
          ? { opacity: 0, y: -36, scale: 0.94, filter: 'blur(8px)' }
          : { opacity: 0, y: 14, scale: 0.985 }
      }
      animate={
        fresh
          ? {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
              transition: { type: 'spring', stiffness: 380, damping: 26, mass: 0.9, filter: { duration: 0.35 } },
            }
          : { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] } }
      }
      exit={{ opacity: 0, x: -28, transition: { duration: 0.22, ease: 'easeIn' } }}
      transition={{ layout: { type: 'spring', stiffness: 500, damping: 40 } }}
      onKeyDown={(e) => {
        if (e.key === 'Delete' && !editing && e.target === e.currentTarget.querySelector('[role=checkbox]')) remove()
      }}
      className={[
        'group relative border-b border-line transition-colors duration-300 first:border-t',
        leaving ? 'bg-danger/10' : 'hover:bg-surface/70',
      ].join(' ')}
    >
      {fresh && (
        <>
          <span aria-hidden="true" className="flash pointer-events-none absolute inset-0 bg-gradient-to-r from-lime/25 via-lime/5 to-transparent" />
          <span aria-hidden="true" className="bar pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-lime" />
        </>
      )}
      <div className="flex items-start gap-4 px-1 py-4 sm:gap-5 sm:px-3 sm:py-5">
        <button
          type="button"
          role="checkbox"
          aria-checked={task.done}
          aria-label={task.done ? `Вернуть в работу: ${task.text}` : `Отметить выполненной: ${task.text}`}
          onClick={() => onToggle(task.id)}
          className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full outline-offset-2 transition-transform active:scale-90"
        >
          <span
            className={[
              'absolute inset-1 rounded-full border-[1.5px] transition-all duration-300',
              task.done ? 'border-lime bg-lime' : 'border-faint group-hover:border-muted',
            ].join(' ')}
          />
          <motion.svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="#10130a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="relative"
            aria-hidden="true"
          >
            <motion.path
              d="M5 12.5l4.5 4.5L19 7.5"
              initial={false}
              animate={{ pathLength: task.done ? 1 : 0, opacity: task.done ? 1 : 0 }}
              transition={{ duration: 0.3, delay: task.done ? 0.08 : 0, ease: 'easeOut' }}
            />
          </motion.svg>
          {task.done && (
            <motion.span
              key="ring"
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-lime"
              initial={{ scale: 0.6, opacity: 0.9 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          )}
        </button>

        <div className="min-w-0 flex-1">
          {editing ? (
            <>
              <label htmlFor={`edit-${task.id}`} className="sr-only">
                Редактировать задачу
              </label>
              <input
                id={`edit-${task.id}`}
                ref={inputRef}
                autoFocus
                value={draft}
                maxLength={MAX_LENGTH}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
                onBlur={() => {
                  if (cancelled.current) return
                  // потеря фокуса сохраняет валидный текст, пустой — откатывает
                  if (validateText(draft).ok) finish(true)
                  else setEditing(false)
                }}
                className="w-full rounded-md border border-lime/50 bg-bg px-3 py-1.5 -my-1.5 text-[17px] font-medium text-fg focus:outline-none focus-visible:outline-none sm:text-[19px]"
              />
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                Enter — сохранить · Esc — отмена
              </p>
            </>
          ) : (
            <p
              onDoubleClick={startEdit}
              className={[
                fresh ? 'reveal' : '',
                'break-words pt-[4px] text-[17px] font-medium leading-6 tracking-[-0.01em] sm:pt-[3px] sm:text-[19px] sm:leading-[26px]',
                task.done ? 'text-faint' : 'text-fg',
              ].join(' ')}
            >
              <span className="strike" data-done={task.done}>
                {task.text}
              </span>
            </p>
          )}
        </div>

        {!editing && (
          <div className="flex shrink-0 items-center gap-1">
            <time
              dateTime={new Date(task.createdAt).toISOString()}
              className="mr-1 hidden pt-0 font-mono text-[11px] tabular-nums text-faint sm:block"
              title="Создана"
            >
              {stamp(task.createdAt)}
            </time>
            <button
              ref={editBtnRef}
              type="button"
              onClick={startEdit}
              aria-label={`Редактировать: ${task.text}`}
              className="-my-0.5 grid h-9 w-9 place-items-center rounded-lg text-muted transition-all hover:bg-raised hover:text-fg active:scale-90 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100"
            >
              <Pencil size={16} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={remove}
              aria-label={`Удалить: ${task.text}`}
              className="-my-0.5 grid h-9 w-9 place-items-center rounded-lg text-muted transition-all hover:bg-danger/15 hover:text-danger active:scale-90 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100"
            >
              <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        )}
        {editing && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => finish(true)}
            aria-label="Сохранить изменения"
            className="-my-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-lime text-[#10130a] active:scale-90"
          >
            <Check size={17} strokeWidth={2.5} aria-hidden="true" />
          </button>
        )}
      </div>
    </motion.li>
  )
}
