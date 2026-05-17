'use client'

import { motion } from 'framer-motion'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { cn } from '@/lib/utils'

interface ActivityHeatmapProps {
  activityDays: string[]
  label: string
}

export function ActivityHeatmap({ activityDays, label }: ActivityHeatmapProps) {
  const today = new Date()
  const days = eachDayOfInterval({ start: subDays(today, 62), end: today })
  const activitySet = new Set(activityDays)

  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  days.forEach((day, i) => {
    currentWeek.push(day)
    if (currentWeek.length === 7 || i === days.length - 1) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <p className="text-xs font-medium text-gray-500 mb-3">{label}</p>
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const active = activitySet.has(dateStr)
              const isToday = dateStr === format(today, 'yyyy-MM-dd')
              return (
                <motion.div
                  key={di}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (wi * 7 + di) * 0.005 }}
                  title={dateStr}
                  className={cn(
                    'w-3 h-3 rounded-sm',
                    active
                      ? 'bg-indigo-500'
                      : 'bg-gray-100',
                    isToday && !active && 'bg-indigo-100 ring-1 ring-indigo-300'
                  )}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
