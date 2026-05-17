'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { User, Globe, LogOut, Mail } from 'lucide-react'
import { toast } from 'sonner'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import Link from 'next/link'

interface SettingsClientProps {
  user: SupabaseUser
  locale: string
}

export function SettingsClient({ user, locale }: SettingsClientProps) {
  const t = useTranslations('settings')
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
    router.refresh()
  }

  const otherLocale = locale === 'nl' ? 'en' : 'nl'
  const otherLocaleLabel = locale === 'nl' ? t('english') : t('dutch')

  return (
    <div className="space-y-4">
      {/* Account */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-400">{t('account')}</p>
            <p className="text-sm font-medium text-gray-900 truncate flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">{t('language')}</p>
              <p className="text-sm font-medium text-gray-900">
                {locale === 'nl' ? t('dutch') : t('english')}
              </p>
            </div>
          </div>
          <Link href={`/${otherLocale}/settings`}>
            <Button variant="outline" size="sm" className="text-xs">
              {otherLocaleLabel}
            </Button>
          </Link>
        </div>
      </div>

      {/* App info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{t('version')}</span>
          <Badge variant="secondary">v1.0.0</Badge>
        </div>
      </div>

      {/* Sign out */}
      <Button
        onClick={handleSignOut}
        variant="outline"
        className="w-full gap-2 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
      >
        <LogOut className="w-4 h-4" />
        {t('signOut')}
      </Button>
    </div>
  )
}
