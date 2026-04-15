'use client'

import { useState } from 'react'

const stats = [
  { label: 'レビュー',   value: 24, sub: '+2 今月' },
  { label: 'ダイアリー', value: 12, sub: '+1 今月' },
  { label: 'ワード',     value: 87, sub: '+5 今月' },
  { label: '最長記録',   value: '14日', sub: '自己ベスト' },
]

const genres = [
  { label: '映画', count: 14, total: 36, color: 'bg-yellow-400' },
  { label: '小説', count: 8,  total: 36, color: 'bg-blue-400' },
  { label: '音楽', count: 2,  total: 36, color: 'bg-orange-400' },
  { label: '日記', count: 12, total: 36, color: 'bg-green-400' },
]

const weekDays = ['月', '火', '水', '木', '金', '土', '日']
const activeDays = [0, 1, 2, 3, 4] // 月〜金が記録済み

const settings = [
  { label: '表示名',       value: 'Your Name' },
  { label: 'メールアドレス', value: 'you@example.com' },
  { label: 'パスワード変更', value: '' },
]

export default function MyPage() {
  const [theme, setTheme] = useState<'ライト' | 'ダーク'>('ライト')

  return (
    <div className="p-4 md:p-8 w-full">

      <h1 className="text-2xl font-bold text-foreground mb-6">マイページ</h1>

      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6 items-start">

        <div className="lg:col-span-2 bg-surface rounded-xl border border-black/5 p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mb-3">
            YU
          </div>
          <p className="text-base font-bold text-foreground">Your Name</p>
          <p className="text-sm text-text-secondary mb-6">you@example.com</p>

          <p className="text-xs text-text-secondary mb-3 ">今週の記録</p>
          <div className="flex gap-1.5 mb-3">
            {weekDays.map((day, i) => (
              <div
                key={day}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                  activeDays.includes(i)
                    ? 'bg-primary text-white'
                    : 'bg-black/5 text-text-secondary'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          <p className="text-xs font-medium text-primary">6日連続記録中</p>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-surface rounded-xl border border-black/5 p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">統計</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-xs text-text-secondary mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-primary mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-black/5 p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">ジャンル内訳</h2>
            <div className="space-y-3">
              {genres.map((g) => (
                <div key={g.label} className="flex items-center gap-3">
                  <p className="text-xs text-text-secondary w-8 flex-shrink-0">{g.label}</p>
                  <div className="flex-1 h-2 bg-black/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${g.color}`}
                      style={{ width: `${(g.count / g.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-secondary w-4 text-right flex-shrink-0">{g.count}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-black/5 p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">アカウント設定</h2>
            <div className="space-y-0 divide-y divide-black/5">
              {settings.map((s) => (
                <button
                  key={s.label}
                  className="w-full flex items-center justify-between py-3 text-sm hover:bg-black/5 -mx-2 px-2 rounded transition cursor-pointer"
                >
                  <span className="text-foreground">{s.label}</span>
                  <span className="text-text-secondary text-xs flex items-center gap-1">
                    {s.value} <span className="text-black/30">›</span>
                  </span>
                </button>
              ))}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-foreground">テーマ</span>
                <div className="flex gap-1 bg-black/5 rounded-lg p-0.5">
                  {(['ライト', 'ダーク'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                        theme === t ? 'bg-surface text-foreground shadow-sm' : 'text-text-secondary hover:text-foreground'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 py-2.5 rounded-lg border border-black/10 bg-surface text-sm font-medium text-foreground hover:bg-black/5 transition cursor-pointer">
                ログアウト
              </button>
              <button className="flex-1 py-2.5 rounded-lg border border-red-200 text-sm font-medium text-red-500 hover:bg-red-50 transition cursor-pointer">
                アカウント削除
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
