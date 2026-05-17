import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { SettingsClient } from '@/components/settings/settings-client'

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('settings')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">{t('title')}</h1>
      <SettingsClient user={user!} locale={locale} />
    </div>
  )
}
