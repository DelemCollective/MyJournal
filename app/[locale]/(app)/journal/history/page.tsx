import { createClient } from '@/lib/supabase/server'
import { format, subDays } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HistoryClient } from '@/components/journal/history-client'

export default async function JournalHistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const since = format(subDays(new Date(), 90), 'yyyy-MM-dd')

  const { data: entries } = await supabase
    .from('journal_entries')
    .select(`
      id,
      entry_date,
      mood,
      free_text,
      session:journal_sessions(name),
      answers:journal_answers(
        answer_text,
        question:journal_questions(question_text_nl, question_text_en)
      )
    `)
    .eq('user_id', user!.id)
    .gte('entry_date', since)
    .order('entry_date', { ascending: false })

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/${locale}/journal`}>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Geschiedenis</h1>
          <p className="text-xs text-gray-400">Laatste 90 dagen</p>
        </div>
      </div>

      <HistoryClient entries={(entries ?? []) as never} locale={locale} />
    </div>
  )
}
