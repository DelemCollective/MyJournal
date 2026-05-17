'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { JournalSession } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ArrowRight, Clock, Sun, Sunset, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SessionCardProps {
  session: JournalSession
  completedToday: boolean
  locale: string
}

const timeIcons = {
  morning: Sun,
  afternoon: Sunset,
  evening: Moon,
  custom: Clock,
}

const timeColors = {
  morning: 'text-amber-500 bg-amber-50',
  afternoon: 'text-orange-500 bg-orange-50',
  evening: 'text-gray-700 bg-gray-100',
  custom: 'text-gray-500 bg-gray-50',
}

export function SessionCard({ session, completedToday, locale }: SessionCardProps) {
  const t = useTranslations('journal')
  const Icon = timeIcons[session.time_of_day] ?? Clock
  const colorClass = timeColors[session.time_of_day] ?? timeColors.custom
  const questionCount = session.questions?.length ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white rounded-2xl border shadow-sm p-4',
        completedToday ? 'border-green-100' : 'border-gray-100'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm">{session.name}</h3>
            {completedToday && (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-400">
            {questionCount} {t('questions')}
            {session.trigger_time && (
              <span className="ml-2 inline-flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {session.trigger_time.slice(0, 5)}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {completedToday ? (
          <Link href={`/${locale}/journal/${session.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-green-600 border-green-200">
              {t('viewEntry')}
            </Button>
          </Link>
        ) : (
          <Link href={`/${locale}/journal/${session.id}`} className="flex-1">
            <Button size="sm" className="w-full bg-gray-900 hover:bg-gray-800 gap-1.5">
              {t('startSession')}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  )
}
