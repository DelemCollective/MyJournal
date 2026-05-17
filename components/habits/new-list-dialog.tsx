'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

const COLORS = [
  { value: '#4f46e5', label: 'Indigo' },
  { value: '#0ea5e9', label: 'Blauw' },
  { value: '#10b981', label: 'Groen' },
  { value: '#f59e0b', label: 'Geel' },
  { value: '#ef4444', label: 'Rood' },
  { value: '#8b5cf6', label: 'Paars' },
]

export function NewListDialog() {
  const t = useTranslations('habits')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [time, setTime] = useState('')
  const [color, setColor] = useState('#4f46e5')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('habit_lists').insert({
      user_id: user!.id,
      name: name.trim(),
      trigger_time: time || null,
      color,
    })

    if (error) {
      toast.error(tCommon('error'))
    } else {
      setOpen(false)
      setName('')
      setTime('')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      <Button size="sm" className="bg-gray-900 hover:bg-gray-800 gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" />
        {t('newList')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('newList')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>{t('listName')}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ochtend routine"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('triggerTime')}</Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="23:54"
              value={time}
              maxLength={5}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '')
                if (!digits) { setTime(''); return }
                if (digits.length <= 2) setTime(digits)
                else setTime(digits.slice(0, 2) + ':' + digits.slice(2, 4))
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('color')}</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className="w-7 h-7 rounded-full ring-offset-2 transition-all"
                  style={{
                    backgroundColor: c.value,
                    boxShadow: color === c.value ? `0 0 0 2px ${c.value}` : undefined,
                  }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" className="flex-1 bg-gray-900 hover:bg-gray-800" disabled={loading}>
              {tCommon('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
