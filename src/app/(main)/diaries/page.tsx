'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

const diaries = [
  { id: '1', title: '今日の振り返り', body: '新しい言葉を覚えた。「判断」という言葉の重みがなんとなく好きだった。その一瞬に全て凝縮されているような...', language: 'ja', wordCount: 2, date: '4月10日' },
  { id: '2', title: 'My thoughts on reading', body: "I've been reading more books lately. It feels like every book opens a new world. The more I read, the more I realize how much I don't know...", language: 'en', wordCount: 3, date: '4月9日' },
  { id: '3', title: '映画を観て感じたこと', body: '希望を持ち続けることの大切さを改めて感じた。どんな状況でも諦めない姿が...', language: 'ja', wordCount: 1, date: '4月8日' },
  { id: '4', title: '週末の散歩', body: '久しぶりに長い距離を歩いた。春の高さが心地よく、桜が少し残っていた。歩くことで頭が整理される...', language: 'ja', wordCount: 1, date: '4月7日' },
]

const filters = ['すべて', '日本語', 'English'] as const
const sorts = ['新しい順', '古い順'] as const

export default function DiariesPage() {
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]>('すべて')
  const [activeSort, setActiveSort] = useState<typeof sorts[number]>('新しい順')

  return (
    <div className="p-4 md:p-8 w-full">

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">ダイアリー一覧</h1>
        <Link
          href="/diaries/new"
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition"
        >
          + 新しい日記
        </Link>
      </div>

      {/* 検索・フィルター・ソート */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="タイトル・本文・日付で検索..."
          className="w-40 sm:w-56 md:w-72 px-4 py-2 rounded-lg border border-black/10 bg-surface text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeFilter === f
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-black/10 text-foreground hover:bg-black/5'
              }`}
            >
              {f}
            </button>
          ))}
          </div>
          <div className="flex gap-1 bg-surface border border-black/10 rounded-lg p-0.5">
            {sorts.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSort(s)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition cursor-pointer ${
                  activeSort === s
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* リスト */}
      <div className="space-y-4 mb-8">
        {diaries.map((diary) => (
          <Link key={diary.id} href={`/diaries/${diary.id}`} className="block">
            <div className="bg-surface rounded-xl border border-black/5 px-5 py-[22px] hover:shadow-md transition flex items-center gap-5 group">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex-shrink-0 flex items-center justify-center">
                <span className="text-primary text-xs font-medium">{diary.language === 'ja' ? '画像' : 'EN'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-foreground mb-1">{diary.title}</p>
                <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">{diary.body}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    diary.language === 'ja' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {diary.language === 'ja' ? '日本語' : 'English'}
                  </span>
                  <span className="text-xs text-text-secondary">ワード {diary.wordCount}件</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm text-text-secondary">{diary.date}</span>
                <ChevronRight size={16} className="text-text-secondary group-hover:text-foreground transition" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ページネーション */}
      <div className="flex items-center justify-center gap-1 mt-6">
        {['«', '1', '2', '3', '»'].map((p) => (
          <button
            key={p}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition cursor-pointer ${
              p === '1'
                ? 'bg-primary text-white'
                : 'bg-surface border border-black/10 text-foreground hover:bg-black/5'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

    </div>
  )
}
