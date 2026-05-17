export interface Profile {
  id: string
  email: string
  preferred_language: 'nl' | 'en'
  created_at: string
  updated_at: string
}

export interface HabitList {
  id: string
  user_id: string
  name: string
  trigger_time: string | null
  color: string
  sort_order: number
  created_at: string
  habits?: Habit[]
}

export interface Habit {
  id: string
  list_id: string
  user_id: string
  name: string
  description: string | null
  sort_order: number
  created_at: string
  completions?: HabitCompletion[]
}

export interface HabitCompletion {
  id: string
  habit_id: string
  user_id: string
  completed_date: string
  created_at: string
}

export interface JournalSession {
  id: string
  user_id: string
  name: string
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'custom'
  trigger_time: string | null
  is_active: boolean
  created_at: string
  questions?: JournalQuestion[]
}

export interface JournalQuestion {
  id: string
  session_id: string
  question_text_nl: string
  question_text_en: string | null
  sort_order: number
  created_at: string
}

export interface JournalEntry {
  id: string
  session_id: string
  user_id: string
  entry_date: string
  free_text: string | null
  mood: number | null
  created_at: string
  answers?: JournalAnswer[]
}

export interface JournalAnswer {
  id: string
  entry_id: string
  question_id: string
  answer_text: string | null
  created_at: string
}

export interface DashboardStats {
  habitStreak: number
  journalStreak: number
  longestHabitStreak: number
  longestJournalStreak: number
  totalHabitDays: number
  totalJournalDays: number
  todayHabitsTotal: number
  todayHabitsCompleted: number
  todayJournalCompleted: boolean
  activityDays: string[]
}
