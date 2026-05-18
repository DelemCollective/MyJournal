'use client'

import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardHeroProps {
  greeting: string
  displayName: string
  habitsCompleted: number
  habitsTotal: number
  showJournalPrompt: boolean
  labelCompleted: string
  labelAllDone: string
  locale: string
}

function progressColorClass(pct: number) {
  if (pct >= 100) return '[&>div]:bg-emerald-400'
  if (pct >= 67) return '[&>div]:bg-green-400'
  if (pct >= 34) return '[&>div]:bg-orange-400'
  if (pct > 0) return '[&>div]:bg-red-400'
  return '[&>div]:bg-white/20'
}

export function DashboardHero({
  greeting,
  displayName,
  habitsCompleted,
  habitsTotal,
  showJournalPrompt,
  labelCompleted,
  labelAllDone,
  locale,
}: DashboardHeroProps) {
  const pct = habitsTotal > 0 ? Math.round((habitsCompleted / habitsTotal) * 100) : 0
  const allDone = habitsCompleted >= habitsTotal && habitsTotal > 0 && !showJournalPrompt

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-3xl p-6 text-white"
    >
      <p className="text-gray-400 text-sm font-medium">{greeting},</p>
      <h1 className="text-2xl font-bold mt-0.5 mb-4 capitalize">{displayName}</h1>

      {habitsTotal > 0 && (
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{labelCompleted}</span>
            <span className={cn(
              'font-semibold',
              pct >= 100 ? 'text-emerald-400' : pct >= 67 ? 'text-green-400' : pct >= 34 ? 'text-orange-400' : 'text-red-400'
            )}>
              {habitsCompleted}/{habitsTotal}
            </span>
          </div>
          <Progress
            value={pct}
            className={cn('h-2 bg-white/10', progressColorClass(pct))}
          />
        </div>
      )}

      {showJournalPrompt && (
        <Link
          href={`/${locale}/journal`}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/15 transition-colors rounded-xl px-3 py-2.5 text-sm font-medium"
        >
          <span className="flex-1">Start je dagboek voor vandaag</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}

      {allDone && (
        <p className="text-sm font-medium text-emerald-400">{labelAllDone} 🎉</p>
      )}
    </motion.div>
  )
}
