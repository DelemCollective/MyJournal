'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

const DEFAULT_QUESTIONS_NL = [
  'Wat was het beste moment van vandaag?',
  'Wat heb ik vandaag geleerd?',
  'Waar ben ik dankbaar voor?',
  'Wat wil ik morgen anders doen?',
  'Hoe voel ik me op dit moment?',
]

const DEFAULT_QUESTIONS_EN = [
  'What was the best moment of today?',
  'What did I learn today?',
  'What am I grateful for?',
  'What do I want to do differently tomorrow?',
  'How do I feel right now?',
]

export function NewSessionDialog() {
  const t = useTranslations('journal')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'custom'>('morning')
  const [triggerTime, setTriggerTime] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: session, error } = await supabase.from('journal_sessions').insert({
      user_id: user!.id,
      name: name.trim(),
      time_of_day: timeOfDay,
      trigger_time: triggerTime || null,
      is_active: true,
    }).select().single()

    if (error || !session) {
      toast.error(tCommon('error'))
      setLoading(false)
      return
    }

    // Insert default questions
    const questions = DEFAULT_QUESTIONS_NL.map((q, i) => ({
      session_id: session.id,
      question_text_nl: q,
      question_text_en: DEFAULT_QUESTIONS_EN[i],
      sort_order: i,
    }))

    await supabase.from('journal_questions').insert(questions)

    setOpen(false)
    setName('')
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" />
        {t('newSession')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('newSession')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>{t('sessionName')}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Avond reflectie"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('timeOfDay')}</Label>
            <Select value={timeOfDay} onValueChange={(v) => setTimeOfDay(v as typeof timeOfDay)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">{t('morning')}</SelectItem>
                <SelectItem value="afternoon">{t('afternoon')}</SelectItem>
                <SelectItem value="evening">{t('evening')}</SelectItem>
                <SelectItem value="custom">{t('custom')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t('triggerTime') ?? 'Herinnertijd'}</Label>
            <Input
              type="time"
              value={triggerTime}
              onChange={(e) => setTriggerTime(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {tCommon('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
