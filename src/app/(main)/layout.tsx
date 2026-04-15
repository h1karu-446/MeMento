'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'ダッシュボード', href: '/' },
  { label: 'レビュー', href: '/reviews' },
  { label: 'ダイアリー', href: '/diaries' },
  { label: 'ワード', href: '/words' },
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen">
      {/* サイドバー */}
      <aside className="w-60 flex flex-col bg-surface border-r border-black/5">

        {/* ロゴ */}
        <div className="px-6 py-5 border-b border-black/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="font-bold text-foreground">MeMento</span>
          </Link>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-black/5'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* ユーザー情報 */}
        <div className="px-4 py-4 border-t border-black/5">
          <Link
            href="/mypage"
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-black/5 transition"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Your Name</p>
              <p className="text-xs text-text-secondary truncate">you@example.com</p>
            </div>
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
