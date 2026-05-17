'use client'

import { motion } from 'framer-motion'
import { Flame, Trophy, CalendarCheck } from 'lucide-react'

interface StreakCardProps {
  habitStreak: number
  journalStreak: number
  longestHabitStreak: number
  longestJournalStreak: number
  labelHabit: string
  labelJournal: string
  labelLongest: string
}

export function StreakCard({
  habitStreak,
  journalStreak,
  longestHabitStreak,
  longestJournalStreak,
  labelHabit,
  labelJournal,
  labelLongest,
}: StreakCardProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <span className="text-xs font-medium text-gray-500">{labelHabit}</span>
        </div>
        <div className="text-3xl font-bold text-gray-900">{habitStreak}</div>
        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
          <Trophy className="w-3 h-3" /> {labelLongest}: {longestHabitStreak}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
            <CalendarCheck className="w-4 h-4 text-gray-600" />
          </div>
          <span className="text-xs font-medium text-gray-500">{labelJournal}</span>
        </div>
        <div className="text-3xl font-bold text-gray-900">{journalStreak}</div>
        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
          <Trophy className="w-3 h-3" /> {labelLongest}: {longestJournalStreak}
        </div>
      </motion.div>
    </div>
  )
}
