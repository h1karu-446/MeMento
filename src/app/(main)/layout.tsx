'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, LayoutDashboard, Star, BookOpen, CaseSensitive, GraduationCap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { label: 'ダッシュボード', href: '/',        icon: LayoutDashboard },
  { label: 'レビュー',       href: '/reviews',  icon: Star },
  { label: 'ダイアリー',     href: '/diaries',  icon: BookOpen },
  { label: '英語学習',       href: '/english',  icon: GraduationCap },
  { label: 'ワード',         href: '/words',    icon: CaseSensitive },
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  useEffect(() => {
    const supabase = createClient()
    // Session data is only used for the sidebar label, never for authorization.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user
      setUserEmail(user?.email ?? '')
      setUserName(user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? '')
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="flex h-screen">
      {/* サイドバー */}
      <aside className={`flex flex-col bg-surface border-r border-black/5 transition-all duration-300 ${open ? 'w-60' : 'w-16'}`}>

        {/* ロゴ */}
        <div className="px-4 py-5 border-b border-black/5 flex items-center justify-between">
          {open && (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">M</span>
              </div>
              <span className="font-bold text-foreground">MeMento</span>
            </Link>
          )}
          {!open && (
            <Link href="/" className="mx-auto">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
            </Link>
          )}
          {open && (
            <button onClick={() => setOpen(false)} className="text-text-secondary hover:text-foreground transition cursor-pointer">
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-black/5'
                } ${!open ? 'justify-center' : ''}`}
                title={!open ? item.label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {open && item.label}
              </Link>
            )
          })}
        </nav>

        {/* 開くボタン（閉じた時） */}
        {!open && (
          <div className="px-2 pb-3">
            <button
              onClick={() => setOpen(true)}
              className="w-full flex justify-center py-2 text-text-secondary hover:text-foreground hover:bg-black/5 rounded-lg transition cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ユーザー情報 */}
        <div className="px-2 py-4 border-t border-black/5">
          <Link
            href="/mypage"
            className={`flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-black/5 transition ${!open ? 'justify-center' : ''}`}
            title={!open ? 'マイページ' : undefined}
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {userName ? userName[0].toUpperCase() : '?'}
            </div>
            {open && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                <p className="text-xs text-text-secondary truncate">{userEmail}</p>
              </div>
            )}
          </Link>
        </div>

      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  )
}
