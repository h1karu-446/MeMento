'use client'

import Link from 'next/link'
import { useState } from 'react'

const reviews = [
  { id: '1', genre: '映画', title: 'ショーシャンクの空に', excerpt: '希望を失わないことの大切さを改めて感じた作品。', rate: 5, date: '4月10日' },
  { id: '2', genre: '小説', title: '人間失格', excerpt: '人間の弱さと孤独を描いた...', rate: 4, date: '4月8日' },
  { id: '3', genre: '音楽', title: 'Kind of Blue', excerpt: 'マイルス・デイビスの最高傑作...', rate: 5, date: '4月6日' },
  { id: '4', genre: '映画', title: '2001年宇宙の旅', excerpt: '映像美と音楽が織りなす...', rate: 4, date: '4月5日' },
  { id: '5', genre: '小説', title: 'ノルウェイの森', excerpt: '喪失と再生の物語...', rate: 4, date: '4月3日' },
  { id: '6', genre: '音楽', title: 'Abbey Road', excerpt: 'ビートルズ最後のアルバム...', rate: 5, date: '4月1日' },
]

const genreColor: Record<string, string> = {
  映画: 'bg-yellow-100 text-yellow-700',
  小説: 'bg-blue-100 text-blue-700',
  音楽: 'bg-orange-100 text-orange-700',
}

const filters = ['すべて', '映画', '小説', '音楽'] as const
const sorts = ['新しい順', '古い順'] as const

export default function ReviewsPage() {
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]>('すべて')
  const [activeSort, setActiveSort] = useState<typeof sorts[number]>('新しい順')

  return (
    <div className="p-4 md:p-8 w-full">

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">レビュー一覧</h1>
        <Link
          href="/reviews/new"
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition"
        >
          + 新しいレビュー
        </Link>
      </div>

      {/* 検索・フィルター・ソート */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="タイトル・感想で検索..."
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

      {/* グリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {reviews.map((review) => (
          <Link key={review.id} href={`/reviews/${review.id}`} className="h-full">
            <div className="h-full flex flex-col bg-surface rounded-xl border border-black/5 overflow-hidden hover:shadow-md transition cursor-pointer group">
              {/* サムネイル */}
              <div className="w-full h-[136px] bg-primary/10 group-hover:bg-primary/15 transition flex-shrink-0 flex items-center justify-center">
                <span className="text-text-secondary text-xs">素材・サムネイル</span>
              </div>
              <div className="flex flex-col flex-1 p-4">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium self-start ${genreColor[review.genre]}`}>
                  {review.genre}
                </span>
                <p className="text-sm font-semibold text-foreground mt-2 mb-1">{review.title}</p>
                <p className="text-xs text-text-secondary line-clamp-2">{review.excerpt}</p>
                <div className="flex items-center justify-between mt-auto pt-3">
                  <span className="text-yellow-500 text-xs">{'★'.repeat(review.rate)}</span>
                  <span className="text-xs text-text-secondary">{review.date}</span>
                </div>
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
