'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { HabitList, Habit } from '@/lib/types'
import { format } from 'date-fns'
import { Plus, Clock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface HabitListCardProps {
  list: HabitList
  completedIds: Set<string>
}

export function HabitListCard({ list, completedIds }: HabitListCardProps) {
  const t = useTranslations('habits')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const [expanded, setExpanded] = useState(true)
  const [checking, setChecking] = useState<string | null>(null)
  const [newHabitName, setNewHabitName] = useState('')
  const [addingHabit, setAddingHabit] = useState(false)
  const [localCompleted, setLocalCompleted] = useState<Set<string>>(new Set(completedIds))
  const habits = list.habits ?? []
  const completedCount = habits.filter(h => localCompleted.has(h.id)).length

  async function toggleHabit(habit: Habit) {
    if (checking) return
    setChecking(habit.id)
    const supabase = createClient()
    const today = format(new Date(), 'yyyy-MM-dd')
    const isCompleted = localCompleted.has(habit.id)

    if (isCompleted) {
      await supabase.from('habit_completions').delete()
        .eq('habit_id', habit.id)
        .eq('completed_date', today)
      setLocalCompleted(prev => { const next = new Set(prev); next.delete(habit.id); return next })
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('habit_completions').upsert({
        habit_id: habit.id,
        user_id: user!.id,
        completed_date: today,
      })
      setLocalCompleted(prev => new Set([...prev, habit.id]))
    }
    setChecking(null)
  }

  async function addHabit() {
    if (!newHabitName.trim()) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('habits').insert({
      list_id: list.id,
      user_id: user!.id,
      name: newHabitName.trim(),
      sort_order: habits.length,
    })
    if (!error) {
      setNewHabitName('')
      setAddingHabit(false)
      router.refresh()
    } else {
      toast.error(tCommon('error'))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4"
      >
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: list.color }} />
        <div className="flex-1 text-left">
          <span className="font-semibold text-gray-900 text-sm">{list.name}</span>
          {list.trigger_time && (
            <span className="ml-2 text-xs text-gray-400 inline-flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {list.trigger_time.slice(0, 5)}
            </span>
          )}
        </div>
        <Badge variant="secondary" className="text-xs">
          {completedCount}/{habits.length}
        </Badge>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-2 border-t border-gray-50">
              {habits.length === 0 && (
                <p className="text-xs text-gray-400 py-3 text-center">{t('noHabits')}</p>
              )}
              {habits.map((habit) => {
                const done = localCompleted.has(habit.id)
                return (
                  <motion.div
                    key={habit.id}
                    layout
                    className={cn(
                      'flex items-center gap-3 p-2.5 rounded-xl transition-colors',
                      done ? 'bg-gray-50' : 'hover:bg-gray-50'
                    )}
                  >
                    <Checkbox
                      checked={done}
                      onCheckedChange={() => toggleHabit(habit)}
                      disabled={checking === habit.id}
                      className={cn(
                        'rounded-full border-2',
                        done ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                      )}
                    />
                    <span className={cn(
                      'text-sm flex-1',
                      done ? 'line-through text-gray-400' : 'text-gray-700'
                    )}>
                      {habit.name}
                    </span>
                  </motion.div>
                )
              })}

              {addingHabit ? (
                <div className="flex gap-2 pt-1">
                  <Input
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder={t('habitName')}
                    onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                    autoFocus
                    className="h-8 text-sm"
                  />
                  <Button size="sm" onClick={addHabit} className="bg-indigo-600 hover:bg-indigo-700 h-8">
                    {tCommon('add')}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setAddingHabit(false)} className="h-8">
                    {tCommon('cancel')}
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingHabit(true)}
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-indigo-600 transition-colors pt-1 px-2.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('addHabit')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
