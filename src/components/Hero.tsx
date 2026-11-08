import { motion } from 'motion/react'
import { plural, type Stats } from '../lib/tasks'

function subtitle(s: Stats): string {
  if (s.total === 0) return 'Чистый лист. Запишите то, что действительно важно — остальное подождёт.'
  if (s.active === 0) return 'Всё закрыто. Редкое и приятное состояние — задержитесь в нём.'
  const n = s.active
  return `${plural(n, 'Осталась', 'Осталось', 'Осталось')} ${n} ${plural(n, 'задача', 'задачи', 'задач')}. Начните с той, что страшнее всего.`
}

const rise = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.05 + i * 0.09, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

export function Hero({ date, stats }: { date: string; stats: Stats }) {
  return (
    <header className="pt-8 sm:pt-12 lg:pt-16">
      <motion.p
        variants={rise}
        custom={0}
        initial="hidden"
        animate="show"
        className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted sm:text-xs"
      >
        <span className="h-px w-8 bg-lime" aria-hidden="true" />
        <time>{date}</time>
      </motion.p>
      <h1 className="display mt-6 sm:mt-8">
        <motion.span variants={rise} custom={1} initial="hidden" animate="show" className="block">
          Сделай
        </motion.span>
        <motion.span variants={rise} custom={2} initial="hidden" animate="show" className="display-accent block pb-2">
          главное.
        </motion.span>
      </h1>
      <motion.p
        variants={rise}
        custom={3}
        initial="hidden"
        animate="show"
        className="mt-6 max-w-[34rem] text-[16px] leading-relaxed text-muted sm:text-lg"
        aria-live="polite"
      >
        {subtitle(stats)}
      </motion.p>
    </header>
  )
}
