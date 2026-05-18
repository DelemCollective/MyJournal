'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DailyEggProps {
  completedHabits: number
  totalHabits: number
  journalCompleted: boolean
  labelHabits: string
  labelJournal: string
}

export function DailyEgg({
  completedHabits,
  totalHabits,
  journalCompleted,
  labelHabits,
  labelJournal,
}: DailyEggProps) {
  const totalItems = totalHabits + 1
  const completedItems = completedHabits + (journalCompleted ? 1 : 0)
  const pct = totalItems > 1 ? Math.round((completedItems / totalItems) * 100) : 0
  const allDone = pct === 100 && totalItems > 1

  // 0 = intact, 1 = tiny crack, 2 = cracking, 3 = breaking open, 4 = hatched
  const crackLevel = allDone ? 4 : pct === 0 ? 0 : pct < 34 ? 1 : pct < 67 ? 2 : 3

  const eggBg = allDone ? '#fef08a' : crackLevel >= 3 ? '#fef9c3' : '#fffbeb'
  const eggBorder = allDone ? '#facc15' : '#fde68a'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-5">
        {/* Egg */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <motion.div
            animate={
              allDone
                ? { scale: [1, 1.18, 1], rotate: [0, -10, 10, -5, 0] }
                : crackLevel > 0
                  ? { rotate: [-2, 2, -2, 0], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 } }
                  : { scale: [1, 1.025, 1], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }
            }
            transition={allDone ? { duration: 0.7 } : undefined}
            className="relative"
            style={{ width: 72, height: 88 }}
          >
            {/* Egg shell */}
            <div
              className="absolute inset-0 transition-colors duration-500"
              style={{
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                backgroundColor: eggBg,
                border: `2px solid ${eggBorder}`,
              }}
            />

            {/* Crack SVG */}
            {crackLevel >= 1 && (
              <svg
                className="absolute inset-0 pointer-events-none overflow-visible"
                viewBox="0 0 72 88"
                style={{ width: 72, height: 88 }}
              >
                <motion.path
                  d="M 36 28 L 32 40 L 38 47 L 34 58"
                  stroke="#b45309" strokeWidth="1.5" fill="none" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                />
                {crackLevel >= 2 && (
                  <motion.path
                    d="M 46 35 L 52 46 L 46 52"
                    stroke="#b45309" strokeWidth="1.2" fill="none" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                  />
                )}
                {crackLevel >= 3 && (
                  <>
                    <motion.path
                      d="M 26 38 L 20 48 L 28 55"
                      stroke="#b45309" strokeWidth="1.2" fill="none" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    />
                    <motion.path
                      d="M 38 47 L 42 58 L 36 65"
                      stroke="#b45309" strokeWidth="1" fill="none" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    />
                  </>
                )}
              </svg>
            )}

            {/* Emoji inside */}
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              <AnimatePresence mode="wait">
                {allDone ? (
                  <motion.span
                    key="chick"
                    initial={{ y: 16, opacity: 0, scale: 0.5 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                    className="text-3xl select-none"
                  >
                    🐥
                  </motion.span>
                ) : crackLevel >= 2 ? (
                  <motion.span
                    key="peeking"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl select-none"
                  >
                    🐣
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Percentage */}
          <div className="text-center">
            <span className={cn(
              'text-xl font-bold tabular-nums',
              allDone ? 'text-amber-500' : 'text-gray-900'
            )}>
              {pct}%
            </span>
            <p className="text-[10px] text-gray-400 -mt-0.5">vandaag</p>
          </div>
        </div>

        {/* Task list */}
        <div className="flex-1 space-y-3">
          {totalHabits > 0 && (
            <div className="flex items-center gap-2.5">
              {completedHabits >= totalHabits ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-200 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">
                  {completedHabits}/{totalHabits} gewoonten
                </p>
                {completedHabits < totalHabits && (
                  <p className="text-xs text-gray-400">{totalHabits - completedHabits} resterend</p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            {journalCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-gray-200 flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800">Dagboek</p>
              {!journalCompleted && (
                <p className="text-xs text-gray-400">Nog niet ingevuld</p>
              )}
            </div>
          </div>

          {allDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2"
            >
              <p className="text-xs font-semibold text-amber-700">Alles gedaan vandaag! 🎉</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
