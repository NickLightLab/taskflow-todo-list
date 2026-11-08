import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'

export type EmptyKind = 'none' | 'no-active' | 'no-done'

const LINE = 'var(--color-line-strong)'
const LIME = 'var(--color-lime)'

/** Три абстрактные геометрические композиции — по одной на состояние. */
function Art({ kind }: { kind: EmptyKind }) {
  const draw = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
  }
  const t = (d: number) => ({ duration: 1, delay: d, ease: [0.16, 1, 0.3, 1] as const })

  if (kind === 'none') {
    return (
      <svg viewBox="0 0 220 160" width="220" height="160" fill="none" aria-hidden="true">
        <motion.rect x="30" y="34" width="96" height="96" rx="4" stroke={LINE} strokeWidth="1.5" {...draw} transition={t(0.1)} />
        <motion.rect x="58" y="22" width="96" height="96" rx="4" stroke={LINE} strokeWidth="1.5" strokeDasharray="3 5" {...draw} transition={t(0.2)} />
        <motion.rect x="86" y="10" width="96" height="96" rx="4" stroke={LIME} strokeWidth="1.5" {...draw} transition={t(0.3)} />
        <motion.circle cx="182" cy="106" r="5" fill={LIME} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9, type: 'spring', stiffness: 400, damping: 18 }} />
      </svg>
    )
  }
  if (kind === 'no-active') {
    return (
      <svg viewBox="0 0 220 160" width="220" height="160" fill="none" aria-hidden="true">
        <motion.circle cx="110" cy="80" r="62" stroke={LINE} strokeWidth="1.5" {...draw} transition={t(0.1)} />
        <motion.circle cx="110" cy="80" r="42" stroke={LIME} strokeWidth="1.5" {...draw} transition={t(0.25)} />
        <motion.path d="M92 82l12 12 24-26" stroke={LIME} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...draw} transition={t(0.6)} />
        <motion.path d="M20 80h28M172 80h28" stroke={LINE} strokeWidth="1.5" {...draw} transition={t(0.4)} />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 220 160" width="220" height="160" fill="none" aria-hidden="true">
      <motion.circle cx="110" cy="80" r="56" stroke={LINE} strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" {...draw} transition={t(0.1)} />
      <motion.path d="M110 24a56 56 0 0 1 56 56" stroke={LIME} strokeWidth="1.5" strokeLinecap="round" {...draw} transition={t(0.4)} />
      <motion.line x1="70" y1="80" x2="150" y2="80" stroke={LINE} strokeWidth="1.5" {...draw} transition={t(0.3)} />
      <motion.circle cx="110" cy="80" r="4" fill={LIME} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring', stiffness: 400, damping: 18 }} />
    </svg>
  )
}

const COPY: Record<EmptyKind, { title: string; text: string }> = {
  none: { title: 'Пока тихо', text: 'Здесь будут ваши задачи. Запишите первую — и пространство начнёт работать на вас.' },
  'no-active': { title: 'Всё сделано', text: 'Активных задач нет. Добавьте новую или очистите выполненные.' },
  'no-done': { title: 'Пока ничего не завершено', text: 'Отметьте задачу кружком слева — и она появится в этом разделе.' },
}

export function EmptyState({ kind, onStart }: { kind: EmptyKind; onStart: () => void }) {
  const { title, text } = COPY[kind]
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center border-y border-line px-4 py-14 text-center sm:py-20"
    >
      <Art kind={kind} />
      <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted">{text}</p>
      {kind !== 'no-done' && (
        <button
          type="button"
          onClick={onStart}
          className="group mt-7 inline-flex h-11 items-center gap-2 rounded-xl border border-line-strong px-5 text-[14px] font-medium transition-colors hover:border-lime/60 hover:text-lime active:scale-[0.97]"
        >
          {kind === 'none' ? 'Добавить первую задачу' : 'Добавить задачу'}
          <ArrowUpRight size={16} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
      )}
    </motion.div>
  )
}
