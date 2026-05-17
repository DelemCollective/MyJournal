import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { format } from 'date-fns'
import { NewSessionDialog } from '@/components/journal/new-session-dialog'
import { SessionCard } from '@/components/journal/session-card'
import { BookOpen } from 'lucide-react'

export default async function JournalPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('journal')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: sessions } = await supabase
    .from('journal_sessions')
    .select('*, questions:journal_questions(id, question_text_nl, question_text_en, sort_order)')
    .eq('user_id', user!.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .order('sort_order', { foreignTable: 'questions', ascending: true })

  const sessionIds = (sessions ?? []).map(s => s.id)

  const { data: todayEntries } = sessionIds.length > 0
    ? await supabase
        .from('journal_entries')
        .select('session_id')
        .in('session_id', sessionIds)
        .eq('user_id', user!.id)
        .eq('entry_date', today)
    : { data: [] }

  const completedSessionIds = new Set((todayEntries ?? []).map(e => e.session_id))

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
        <NewSessionDialog />
      </div>

      {(!sessions || sessions.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-indigo-300" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">{t('noSessions')}</p>
          <p className="text-sm text-gray-400">{t('noSessionsDesc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              completedToday={completedSessionIds.has(session.id)}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  )
}
