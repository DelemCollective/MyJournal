import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { format } from 'date-fns'
import { notFound, redirect } from 'next/navigation'
import { JournalEntryForm } from '@/components/journal/journal-entry-form'
import { JournalEntryView } from '@/components/journal/journal-entry-view'

export default async function JournalSessionPage({
  params,
}: {
  params: Promise<{ locale: string; sessionId: string }>
}) {
  const { locale, sessionId } = await params
  const t = await getTranslations('journal')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: session } = await supabase
    .from('journal_sessions')
    .select('*, questions:journal_questions(id, question_text_nl, question_text_en, sort_order)')
    .eq('id', sessionId)
    .eq('user_id', user!.id)
    .order('sort_order', { foreignTable: 'questions', ascending: true })
    .single()

  if (!session) notFound()

  const { data: entry } = await supabase
    .from('journal_entries')
    .select('*, answers:journal_answers(id, question_id, answer_text)')
    .eq('session_id', sessionId)
    .eq('user_id', user!.id)
    .eq('entry_date', today)
    .maybeSingle()

  if (entry) {
    return (
      <JournalEntryView
        session={session}
        entry={entry}
        locale={locale}
      />
    )
  }

  return (
    <JournalEntryForm
      session={session}
      locale={locale}
      userId={user!.id}
    />
  )
}
