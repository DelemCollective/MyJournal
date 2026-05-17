'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { JournalSession, JournalQuestion } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { format } from 'date-fns'
import { ArrowLeft, ArrowRight, Send } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface JournalEntryFormProps {
  session: JournalSession
  locale: string
  userId: string
}

const MOOD_OPTIONS = [
  { value: 1, emoji: '😔', label: 'Slecht' },
  { value: 2, emoji: '😕', label: 'Matig' },
  { value: 3, emoji: '😐', label: 'Oké' },
  { value: 4, emoji: '😊', label: 'Goed' },
  { value: 5, emoji: '😄', label: 'Super' },
]

export function JournalEntryForm({ session, locale, userId }: JournalEntryFormProps) {
  const t = useTranslations('journal')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const questions = session.questions ?? []
  const totalSteps = questions.length + 2 // questions + free text + mood

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [freeText, setFreeText] = useState('')
  const [mood, setMood] = useState<number | null>(null)
  const [direction, setDirection] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const isQuestionStep = step < questions.length
  const isFreeTextStep = step === questions.length
  const isMoodStep = step === questions.length + 1
  const currentQuestion = isQuestionStep ? questions[step] : null
  const progress = Math.round(((step) / totalSteps) * 100)

  function goNext() {
    setDirection(1)
    setStep(s => s + 1)
  }

  function goPrev() {
    setDirection(-1)
    setStep(s => s - 1)
  }

  const currentAnswer = currentQuestion ? (answers[currentQuestion.id] ?? '') : ''
  const canNext = isQuestionStep ? currentAnswer.trim().length > 0 : true

  async function handleSubmit() {
    setSubmitting(true)
    const supabase = createClient()
    const today = format(new Date(), 'yyyy-MM-dd')

    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .insert({
        session_id: session.id,
        user_id: userId,
        entry_date: today,
        free_text: freeText || null,
        mood,
      })
      .select()
      .single()

    if (entryError || !entry) {
      toast.error(tCommon('error'))
      setSubmitting(false)
      return
    }

    if (Object.keys(answers).length > 0) {
      const answersToInsert = Object.entries(answers).map(([questionId, text]) => ({
        entry_id: entry.id,
        question_id: questionId,
        answer_text: text,
      }))
      await supabase.from('journal_answers').insert(answersToInsert)
    }

    toast.success(t('entrySubmitted'))
    router.push(`/${locale}/journal`)
    router.refresh()
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 min-h-screen flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/${locale}/journal`}>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-gray-900">{session.name}</h1>
          <p className="text-xs text-gray-400">
            {isQuestionStep
              ? `${t('question')} ${step + 1} ${t('of')} ${questions.length}`
              : isFreeTextStep
              ? t('freeText')
              : t('mood')}
          </p>
        </div>
      </div>

      <Progress value={progress} className="mb-8 h-1.5 bg-gray-100 [&>div]:bg-gray-900" />

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ x: direction * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0"
          >
            {isQuestionStep && currentQuestion && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-lg font-medium text-gray-900 leading-relaxed">
                    {locale === 'en' && currentQuestion.question_text_en
                      ? currentQuestion.question_text_en
                      : currentQuestion.question_text_nl}
                  </p>
                </div>
                <Textarea
                  value={answers[currentQuestion.id] ?? ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                  placeholder={t('yourAnswer')}
                  className="min-h-36 text-base resize-none border-gray-200 rounded-xl"
                  autoFocus
                />
              </div>
            )}

            {isFreeTextStep && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-lg font-medium text-gray-900 leading-relaxed">
                    {t('freeText')}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{t('freeTextPlaceholder')}</p>
                </div>
                <Textarea
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder={t('freeTextPlaceholder')}
                  className="min-h-36 text-base resize-none border-gray-200 rounded-xl"
                  autoFocus
                />
              </div>
            )}

            {isMoodStep && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-lg font-medium text-gray-900">{t('mood')}</p>
                </div>
                <div className="flex gap-3 justify-center">
                  {MOOD_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setMood(option.value)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all flex-1',
                        mood === option.value
                          ? 'border-gray-900 bg-gray-100 scale-105'
                          : 'border-gray-100 hover:border-gray-300'
                      )}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="text-[10px] font-medium text-gray-600">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button variant="outline" onClick={goPrev} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            {tCommon('back')}
          </Button>
        )}
        <div className="flex-1" />
        {isMoodStep ? (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-gray-900 hover:bg-gray-800 gap-1.5"
          >
            <Send className="w-4 h-4" />
            {t('submitEntry')}
          </Button>
        ) : (
          <Button
            onClick={goNext}
            className="bg-gray-900 hover:bg-gray-800 gap-1.5"
          >
            {tCommon('next')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
