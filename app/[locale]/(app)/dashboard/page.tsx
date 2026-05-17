import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { format, subDays } from 'date-fns'
import { StreakCard } from '@/components/dashboard/streak-card'
import { ActivityHeatmap } from '@/components/dashboard/activity-heatmap'
import { DashboardHero } from '@/components/dashboard/dashboard-hero'
import { BadgesSection } from '@/components/dashboard/badges-section'

async function getDashboardData(userId: string) {
  const supabase = await createClient()
  const today = format(new Date(), 'yyyy-MM-dd')
  const since = format(subDays(new Date(), 365), 'yyyy-MM-dd')

  const [habitsRes, completionsRes, listsRes, journalRes, journalEntriesRes] = await Promise.all([
    supabase.from('habits').select('id').eq('user_id', userId),
    supabase.from('habit_completions').select('completed_date, habit_id').eq('user_id', userId).gte('completed_date', since),
    supabase.from('habit_lists').select('id').eq('user_id', userId),
    supabase.from('journal_sessions').select('id').eq('user_id', userId).eq('is_active', true),
    supabase.from('journal_entries').select('entry_date').eq('user_id', userId).gte('entry_date', since),
  ])

  const habits = habitsRes.data ?? []
  const completions = completionsRes.data ?? []
  const journalEntries = journalEntriesRes.data ?? []

  // Today's completions
  const todayCompletions = completions.filter(c => c.completed_date === today)
  const todayHabitsCompleted = todayCompletions.length
  const todayHabitsTotal = habits.length

  // Check today's journal
  const todayJournalCompleted = journalEntries.some(e => e.entry_date === today)

  // Build activity set (days with either habit or journal activity)
  const habitDays = new Set(completions.map(c => c.completed_date))
  const journalDays = new Set(journalEntries.map(e => e.entry_date))
  const allActivityDays = [...new Set([...habitDays, ...journalDays])]

  // Calculate habit streak
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
        const prevDate = new Date(prev)
        const curDate = new Date(d)
        const diff = (curDate.getTime() - prevDate.getTime()) / 86400000
        if (diff === 1) {
          current++
        } else {
          longest = Math.max(longest, current)
          current = 1
        }
      } else {
        current = 1
      }
      prev = d
    }
    return Math.max(longest, current)
  }

  const habitStreak = calcStreak(habitDays)
  const journalStreak = calcStreak(journalDays)
  const longestHabitStreak = calcLongestStreak(habitDays)
  const longestJournalStreak = calcLongestStreak(journalDays)
  const totalHabitDays = habitDays.size
  const totalJournalDays = journalDays.size

  return {
    habitStreak,
    journalStreak,
    longestHabitStreak,
    longestJournalStreak,
    totalHabitDays,
    totalJournalDays,
    todayHabitsTotal,
    todayHabitsCompleted,
    todayJournalCompleted,
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

  const stats = await getDashboardData(user!.id)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('greeting_morning') : hour < 18 ? t('greeting_afternoon') : t('greeting_evening')

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <DashboardHero
        greeting={greeting}
        email={user!.email ?? ''}
        habitsCompleted={stats.todayHabitsCompleted}
        habitsTotal={stats.todayHabitsTotal}
        journalCompleted={stats.todayJournalCompleted}
        labelCompleted={t('habitsCompleted')}
        labelAllDone={t('allDone')}
        locale={locale}
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
