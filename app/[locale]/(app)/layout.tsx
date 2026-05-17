import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNav, SideNav } from '@/components/navigation'

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav locale={locale} />
      <main className="flex-1 pb-20 md:pb-0 min-w-0">
        {children}
      </main>
      <BottomNav locale={locale} />
    </div>
  )
}
