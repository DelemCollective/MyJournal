'use client'

import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

interface DashboardHeroProps {
  greeting: string
  email: string
  habitsCompleted: number
  habitsTotal: number
  journalCompleted: boolean
  labelCompleted: string
  labelAllDone: string
  locale: string
}

export function DashboardHero({
  greeting,
  email,
  habitsCompleted,
  habitsTotal,
  journalCompleted,
  labelCompleted,
  labelAllDone,
  locale,
}: DashboardHeroProps) {
  const name = email.split('@')[0]
  const pct = habitsTotal > 0 ? Math.round((habitsCompleted / habitsTotal) * 100) : 0
  const allDone = habitsCompleted >= habitsTotal && habitsTotal > 0 && journalCompleted

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200"
    >
      <p className="text-indigo-200 text-sm font-medium">{greeting},</p>
      <h1 className="text-2xl font-bold mt-0.5 mb-4 capitalize">{name}</h1>

      {allDone ? (
        <div className="flex items-center gap-2 text-indigo-100">
          <CheckCircle2 className="w-5 h-5 text-green-300" />
          <span className="text-sm font-medium">{labelAllDone}</span>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-indigo-200">{labelCompleted}</span>
            <span className="font-semibold">{habitsCompleted}/{habitsTotal}</span>
          </div>
          <Progress value={pct} className="h-2 bg-indigo-500 [&>div]:bg-white" />
        </div>
      )}

      {!journalCompleted && (
        <Link
          href={`/${locale}/journal`}
          className="mt-4 flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors rounded-xl px-3 py-2.5 text-sm font-medium"
        >
          <span className="flex-1">Start je dagboek voor vandaag</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </motion.div>
  )
}
