import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { format } from 'date-fns'
import { HabitListCard } from '@/components/habits/habit-list-card'
import { NewListDialog } from '@/components/habits/new-list-dialog'
import { BookOpen } from 'lucide-react'

export default async function HabitsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await params
  const t = await getTranslations('habits')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: lists } = await supabase
    .from('habit_lists')
    .select('*, habits(id, name, description, sort_order, list_id, user_id, created_at)')
    .eq('user_id', user!.id)
    .order('sort_order', { ascending: true })
    .order('sort_order', { foreignTable: 'habits', ascending: true })

  const habitIds = (lists ?? []).flatMap(l => (l.habits ?? []).map((h: { id: string }) => h.id))

  const { data: completions } = habitIds.length > 0
    ? await supabase
        .from('habit_completions')
        .select('habit_id')
        .in('habit_id', habitIds)
        .eq('completed_date', today)
    : { data: [] }

  const completedIds = new Set((completions ?? []).map(c => c.habit_id))

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
        <NewListDialog />
      </div>

      {(!lists || lists.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-indigo-300" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">{t('noLists')}</p>
          <p className="text-sm text-gray-400">{t('noListsDesc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <HabitListCard
              key={list.id}
              list={list}
              completedIds={completedIds}
            />
          ))}
        </div>
      )}
    </div>
  )
}
