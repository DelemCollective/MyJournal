'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LayoutDashboard, CheckSquare, BookOpen, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavProps {
  locale: string
}

export function BottomNav({ locale }: NavProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()

  const links = [
    { href: `/${locale}/dashboard`, label: t('dashboard'), icon: LayoutDashboard },
    { href: `/${locale}/habits`, label: t('habits'), icon: CheckSquare },
    { href: `/${locale}/journal`, label: t('journal'), icon: BookOpen },
    { href: `/${locale}/settings`, label: t('settings'), icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-100 pb-safe md:hidden">
      <div className="flex items-center max-w-lg mx-auto px-2 py-1.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href} className="flex-1 flex justify-center">
              <div className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all min-w-0',
                active ? 'bg-gray-100' : 'hover:bg-gray-50'
              )}>
                <Icon
                  className={cn('w-6 h-6 flex-shrink-0', active ? 'text-gray-900' : 'text-gray-400')}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span className={cn(
                  'text-[10px] font-semibold leading-none',
                  active ? 'text-gray-900' : 'text-gray-400'
                )}>
                  {label}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function SideNav({ locale }: NavProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()

  const links = [
    { href: `/${locale}/dashboard`, label: t('dashboard'), icon: LayoutDashboard },
    { href: `/${locale}/habits`, label: t('habits'), icon: CheckSquare },
    { href: `/${locale}/journal`, label: t('journal'), icon: BookOpen },
    { href: `/${locale}/settings`, label: t('settings'), icon: Settings },
  ]

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen border-r border-gray-100 bg-white px-3 py-6">
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-gray-900 text-lg">MyJournal</span>
      </div>
      <nav className="space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="w-4.5 h-4.5" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
