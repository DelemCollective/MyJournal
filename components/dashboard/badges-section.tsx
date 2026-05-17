'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BadgesSectionProps {
  habitStreak: number
  journalStreak: number
  label: string
  badge7: string
  badge30: string
  badge100: string
  badge365: string
}

const BADGE_THRESHOLDS = [
  { days: 7, emoji: '🌱', color: 'bg-green-50 border-green-200 text-green-700' },
  { days: 30, emoji: '🔥', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { days: 100, emoji: '💎', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { days: 365, emoji: '👑', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
]

export function BadgesSection({ habitStreak, journalStreak, label, badge7, badge30, badge100, badge365 }: BadgesSectionProps) {
  const bestStreak = Math.max(habitStreak, journalStreak)
  const badgeLabels = [badge7, badge30, badge100, badge365]

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <p className="text-xs font-medium text-gray-500 mb-3">{label}</p>
      <div className="grid grid-cols-4 gap-2">
        {BADGE_THRESHOLDS.map((badge, i) => {
          const unlocked = bestStreak >= badge.days
          return (
            <motion.div
              key={badge.days}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
              className={cn(
                'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center',
                unlocked ? badge.color : 'bg-gray-50 border-gray-100 text-gray-300'
              )}
            >
              <span className={cn('text-2xl', !unlocked && 'grayscale opacity-40')}>
                {badge.emoji}
              </span>
              <span className="text-[10px] font-medium leading-tight">{badgeLabels[i]}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
