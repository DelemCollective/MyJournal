'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { JournalSession, JournalEntry } from '@/lib/types'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

interface JournalEntryViewProps {
  session: JournalSession
  entry: JournalEntry
  locale: string
}

const MOOD_EMOJIS: Record<number, string> = { 1: '😔', 2: '😕', 3: '😐', 4: '😊', 5: '😄' }

export function JournalEntryView({ session, entry, locale }: JournalEntryViewProps) {
  const t = useTranslations('journal')
  const tCommon = useTranslations('common')
  const questions = session.questions ?? []
  const answers = entry.answers ?? []
  const answerMap = new Map(answers.map(a => [a.question_id, a.answer_text]))

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/${locale}/journal`}>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-gray-900">{session.name}</h1>
          <p className="text-xs text-gray-400">{tCommon('today')}</p>
        </div>
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => {
          const answer = answerMap.get(q.id)
          if (!answer) return null
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl border border-gray-100 p-4"
            >
              <p className="text-xs font-medium text-indigo-600 mb-2">
                {locale === 'en' && q.question_text_en ? q.question_text_en : q.question_text_nl}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{answer}</p>
            </motion.div>
          )
        })}

        {entry.free_text && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: questions.length * 0.06 }}
            className="bg-purple-50 rounded-2xl border border-purple-100 p-4"
          >
            <p className="text-xs font-medium text-purple-600 mb-2">{t('freeText')}</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.free_text}</p>
          </motion.div>
        )}

        {entry.mood && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (questions.length + 1) * 0.06 }}
            className="bg-amber-50 rounded-2xl border border-amber-100 p-4 flex items-center gap-3"
          >
            <span className="text-3xl">{MOOD_EMOJIS[entry.mood]}</span>
            <div>
              <p className="text-xs font-medium text-amber-600">{t('mood')}</p>
              <p className="text-sm text-gray-700">{entry.mood}/5</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
