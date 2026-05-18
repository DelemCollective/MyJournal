import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { format, subDays } from 'date-fns'
import { StreakCard } from '@/components/dashboard/streak-card'
import { ActivityHeatmap } from '@/components/dashboard/activity-heatmap'
import { DashboardHero } from '@/components/dashboard/dashboard-hero'
import { BadgesSection } from '@/components/dashboard/badges-section'
import { DailyEgg } from '@/components/dashboard/daily-egg'

async function getDashboardData(userId: string) {
  const supabase = await createClient()
  const today = format(new Date(), 'yyyy-MM-dd')
  const since = format(subDays(new Date(), 365), 'yyyy-MM-dd')

  const [habitsRes, completionsRes, journalRes, journalEntriesRes] = await Promise.all([
    supabase.from('habits').select('id').eq('user_id', userId),
    supabase.from('habit_completions').select('completed_date, habit_id').eq('user_id', userId).gte('completed_date', since),
    supabase.from('journal_sessions').select('id, trigger_time').eq('user_id', userId).eq('is_active', true),
    supabase.from('journal_entries').select('entry_date, session_id').eq('user_id', userId).gte('entry_date', since),
  ])

  const habits = habitsRes.data ?? []
  const completions = completionsRes.data ?? []
  const sessions = journalRes.data ?? []
  const journalEntries = journalEntriesRes.data ?? []

  const todayCompletions = completions.filter(c => c.completed_date === today)
  const todayHabitsCompleted = todayCompletions.length
  const todayHabitsTotal = habits.length

  const todayEntrySessionIds = new Set(
    journalEntries.filter(e => e.entry_date === today).map(e => e.session_id)
  )
  const todayJournalCompleted = todayEntrySessionIds.size > 0

  // Time-based journal prompt: only show after session trigger_time
  const now = new Date()
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const showJournalPrompt = sessions.length > 0 && sessions.some(session => {
    if (todayEntrySessionIds.has(session.id)) return false
    if (!session.trigger_time) return true
    return session.trigger_time.slice(0, 5) <= currentTimeStr
  })

  const habitDays = new Set(completions.map(c => c.completed_date))
  const journalDays = new Set(journalEntries.map(e => e.entry_date))
  const allActivityDays = [...new Set([...habitDays, ...journalDays])]

  function calcStreak(daysSet: Set<string>): number {
    let streak = 0
    let d = new Date()
    while (true) {
      const dateStr = format(d, 'yyyy-MM-dd')
      if (!daysSet.has(dateStr)) break
      streak++
      d = subDays(d, 1)
    }
    return streak
  }

  function calcLongestStreak(daysSet: Set<string>): number {
    const sorted = [...daysSet].sort()
    let longest = 0, current = 0
    let prev: string | null = null
    for (const d of sorted) {
      if (prev) {
        const diff = (new Date(d).getTime() - new Date(prev).getTime()) / 86400000
        current = diff === 1 ? current + 1 : 1
      } else {
        current = 1
      }
      longest = Math.max(longest, current)
      prev = d
    }
    return longest
  }

  return {
    habitStreak: calcStreak(habitDays),
    journalStreak: calcStreak(journalDays),
    longestHabitStreak: calcLongestStreak(habitDays),
    longestJournalStreak: calcLongestStreak(journalDays),
    todayHabitsTotal,
    todayHabitsCompleted,
    todayJournalCompleted,
    showJournalPrompt,
    activityDays: allActivityDays,
  }
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('dashboard')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [stats, profileRes] = await Promise.all([
    getDashboardData(user!.id),
    supabase.from('profiles').select('display_name').eq('id', user!.id).single(),
  ])

  const displayName = profileRes.data?.display_name ?? user!.email!.split('@')[0]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('greeting_morning') : hour < 18 ? t('greeting_afternoon') : t('greeting_evening')

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <DashboardHero
        greeting={greeting}
        displayName={displayName}
        habitsCompleted={stats.todayHabitsCompleted}
        habitsTotal={stats.todayHabitsTotal}
        showJournalPrompt={stats.showJournalPrompt}
        labelCompleted={t('habitsCompleted')}
        labelAllDone={t('allDone')}
        locale={locale}
      />

      <DailyEgg
        completedHabits={stats.todayHabitsCompleted}
        totalHabits={stats.todayHabitsTotal}
        journalCompleted={stats.todayJournalCompleted}
        labelHabits={t('habitsCompleted')}
        labelJournal={t('journalStreak')}
      />

      <StreakCard
        habitStreak={stats.habitStreak}
        journalStreak={stats.journalStreak}
        longestHabitStreak={stats.longestHabitStreak}
        longestJournalStreak={stats.longestJournalStreak}
        labelHabit={t('habitStreak')}
        labelJournal={t('journalStreak')}
        labelLongest={t('longestStreak')}
      />

      <ActivityHeatmap
        activityDays={stats.activityDays}
        label={t('activityHeatmap')}
      />

      <BadgesSection
        habitStreak={stats.habitStreak}
        journalStreak={stats.journalStreak}
        label={t('badges')}
        badge7={t('badge7days')}
        badge30={t('badge30days')}
        badge100={t('badge100days')}
        badge365={t('badge365days')}
      />
    </div>
  )
}
