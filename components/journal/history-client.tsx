'use client'

import { motion } from 'framer-motion'
import { format, subDays } from 'date-fns'
import { nl, enUS } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Answer {
  answer_text: string | null
  question: { question_text_nl: string; question_text_en: string | null } | null
}

interface Entry {
  id: string
  entry_date: string
  mood: number | null
  free_text: string | null
  session: { name: string } | null
  answers: Answer[]
}

interface HistoryClientProps {
  entries: Entry[]
  locale: string
}

const MOOD_EMOJI: Record<number, string> = { 1: '😔', 2: '😕', 3: '😐', 4: '😊', 5: '😄' }
const MOOD_LABEL: Record<number, string> = { 1: 'Slecht', 2: 'Matig', 3: 'Oké', 4: 'Goed', 5: 'Super' }

function MoodChart({ entries }: { entries: Entry[] }) {
  const WIDTH = 300
  const HEIGHT = 80
  const today = new Date()
  const days = Array.from({ length: 30 }, (_, i) =>
    format(subDays(today, 29 - i), 'yyyy-MM-dd')
  )

  const moodByDay = new Map<string, number>()
  entries.forEach(e => { if (e.mood !== null) moodByDay.set(e.entry_date, e.mood) })

  const points = days
    .map((day, i) => {
      const mood = moodByDay.get(day)
      if (mood === undefined) return null
      return {
        x: (i / (days.length - 1)) * WIDTH,
        y: ((5 - mood) / 4) * HEIGHT,
        mood,
        day,
      }
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)

  if (points.length < 2) {
    return (
      <div className="h-20 flex items-center justify-center">
        <p className="text-xs text-gray-400">Nog niet genoeg data voor een grafiek</p>
      </div>
    )
  }

  const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <div className="relative">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[9px] text-gray-300 -translate-x-5">
        <span>😄</span>
        <span>😊</span>
        <span>😐</span>
        <span>😕</span>
        <span>😔</span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-20 overflow-visible">
        {/* Horizontal grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={i}
            x1={0} y1={(i / 4) * HEIGHT}
            x2={WIDTH} y2={(i / 4) * HEIGHT}
            stroke="#f3f4f6" strokeWidth="1"
          />
        ))}
        {/* Area fill */}
        <defs>
          <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111827" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#111827" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`${points[0].x},${HEIGHT} ${polyPoints} ${points[points.length - 1].x},${HEIGHT}`}
          fill="url(#moodGrad)"
        />
        {/* Line */}
        <polyline
          points={polyPoints}
          fill="none"
          stroke="#111827"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#111827" />
        ))}
      </svg>
    </div>
  )
}

export function HistoryClient({ entries, locale }: HistoryClientProps) {
  const dateLocale = locale === 'nl' ? nl : enUS

  // Group entries by date
  const grouped = entries.reduce<Record<string, Entry[]>>((acc, e) => {
    if (!acc[e.entry_date]) acc[e.entry_date] = []
    acc[e.entry_date].push(e)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Nog geen inzendingen om te tonen.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mood chart */}
      {entries.some(e => e.mood !== null) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Stemming — laatste 30 dagen
          </p>
          <div className="pl-5">
            <MoodChart entries={entries} />
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {sortedDates.map((date, di) => (
          <div key={date}>
            {/* Date header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
                {format(new Date(date + 'T12:00:00'), 'd MMMM yyyy', { locale: dateLocale })}
              </span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            {/* Entries for this date */}
            {grouped[date].map((entry, ei) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: di * 0.04 + ei * 0.02 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3"
              >
                {/* Session header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {entry.session?.name ?? 'Dagboek'}
                  </span>
                  {entry.mood !== null && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{MOOD_EMOJI[entry.mood]}</span>
                      <span className="text-xs text-gray-400">{MOOD_LABEL[entry.mood]}</span>
                    </div>
                  )}
                </div>

                {/* Q&A */}
                {entry.answers.filter(a => a.answer_text).map((a, ai) => (
                  <div key={ai} className="mb-3">
                    <p className="text-[11px] font-medium text-gray-400 mb-1">
                      {locale === 'en' && a.question?.question_text_en
                        ? a.question.question_text_en
                        : a.question?.question_text_nl}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">{a.answer_text}</p>
                  </div>
                ))}

                {/* Free text */}
                {entry.free_text && (
                  <div className="mt-2 pt-2 border-t border-gray-50">
                    <p className="text-[11px] font-medium text-gray-400 mb-1">Vrij schrijven</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {entry.free_text}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
