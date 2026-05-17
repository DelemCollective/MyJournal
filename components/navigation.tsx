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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe md:hidden">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-3 min-w-0 flex-1 transition-colors',
                active ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className={cn('text-[10px] font-medium', active ? 'text-gray-900' : 'text-gray-400')}>
                {label}
              </span>
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
