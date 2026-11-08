import { useEffect, useRef } from 'react'
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react'
import { plural, type Stats } from '../lib/tasks'

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const mv = useMotionValue(value)
  const reduce = useReducedMotion()

  useEffect(() => {
    const unsub = mv.on('change', (v) => {
      if (ref.current) ref.current.textContent = String(Math.round(v))
    })
    if (reduce) mv.set(value)
    else {
      const c = animate(mv, value, { duration: 0.7, ease: [0.16, 1, 0.3, 1] })
      return () => {
        c.stop()
        unsub()
      }
    }
    return unsub
  }, [value, mv, reduce])

  return <span ref={ref}>{value}</span>
}

function Ring({ percent, size = 104 }: { percent: number; size?: number }) {
  const stroke = 5
  const r = (size - stroke) / 2
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* деления по кругу — как на циферблате */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r + 0.5}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={stroke}
          strokeDasharray={`1.5 ${(2 * Math.PI * (r + 0.5)) / 40 - 1.5}`}
        />
        <circle cx={size / 2} cy={size / 2} r={r - 8} fill="none" stroke="var(--color-line)" strokeWidth="1" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r - 8}
          fill="none"
          stroke="var(--color-lime)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * (r - 8)}
          initial={false}
          animate={{ strokeDashoffset: 2 * Math.PI * (r - 8) * (1 - percent / 100) }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center font-semibold tracking-tight">
        <span className="text-[22px] tabular-nums">
          <AnimatedNumber value={percent} />
          <span className="ml-px text-[12px] text-muted">%</span>
        </span>
      </div>
    </div>
  )
}

function caption(s: Stats): string {
  if (s.total === 0) return 'Добавьте первую задачу, и здесь появится ваш прогресс.'
  if (s.active === 0) return 'Всё выполнено. Чистый лист — можно начинать новое.'
  if (s.done === 0) return `${s.active} ${plural(s.active, 'задача ждёт', 'задачи ждут', 'задач ждут')} старта.`
  return `Осталось ${s.active} ${plural(s.active, 'задача', 'задачи', 'задач')}. Движение — уже результат.`
}

export function ProgressCard({ stats, className = '', compact = false }: { stats: Stats; className?: string; compact?: boolean }) {
  return (
    <section
      aria-label="Прогресс"
      className={`rounded-xl border border-line bg-surface/80 p-4 ${className}`}
    >
      <div className="flex items-center gap-4">
        <Ring percent={stats.percent} size={compact ? 84 : 104} />
        <dl className="min-w-0 flex-1 font-mono text-[11px] uppercase tracking-[0.12em]">
          <div className="flex items-baseline justify-between gap-2 border-b border-line pb-2">
            <dt className="text-faint">Всего</dt>
            <dd className="text-[15px] tabular-nums text-fg">{stats.total}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2 pt-2">
            <dt className="text-faint">Готово</dt>
            <dd className="text-[15px] tabular-nums text-lime">{stats.done}</dd>
          </div>
        </dl>
      </div>
      {!compact && <p className="mt-4 text-[13px] leading-snug text-muted">{caption(stats)}</p>}
      <div
        role="progressbar"
        aria-label="Выполнено задач"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={stats.percent}
        aria-valuetext={`${stats.done} из ${stats.total}, ${stats.percent}%`}
        className="sr-only"
      />
    </section>
  )
}
