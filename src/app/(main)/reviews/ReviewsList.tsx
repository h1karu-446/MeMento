'use client'

import Link from 'next/link'
import { useState } from 'react'

type Review = {
  id: string
  title: string
  genre: string
  rate: number
  impressions: string
  created_at: string
}

const genreColor: Record<string, string> = {
  映画: 'bg-yellow-100 text-yellow-700',
  小説: 'bg-blue-100 text-blue-700',
  音楽: 'bg-orange-100 text-orange-700',
}

const filters = ['すべて', '映画', '小説', '音楽'] as const
const sorts = ['新しい順', '古い順'] as const

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export default function ReviewsList({ reviews }: { reviews: Review[] }) {
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]>('すべて')
  const [activeSort, setActiveSort] = useState<typeof sorts[number]>('新しい順')

  const filtered = reviews
    .filter((r) => activeFilter === 'すべて' || r.genre === activeFilter)
    .sort((a, b) => {
      const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      return activeSort === '新しい順' ? diff : -diff
    })

  return (
    <>
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
      {filtered.length === 0 ? (
        <p className="text-text-secondary text-sm text-center py-20">レビューがまだありません</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filtered.map((review) => (
            <Link key={review.id} href={`/reviews/${review.id}`} className="h-full">
              <div className="h-full flex flex-col bg-surface rounded-xl border border-black/5 overflow-hidden hover:shadow-md transition cursor-pointer group">
                {/* サムネイル */}
                <div className="w-full h-[136px] bg-primary/10 group-hover:bg-primary/15 transition flex-shrink-0 flex items-center justify-center">
                  <span className="text-text-secondary text-xs">サムネイル</span>
                </div>
                <div className="flex flex-col flex-1 p-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium self-start ${genreColor[review.genre] ?? 'bg-gray-100 text-gray-600'}`}>
                    {review.genre}
                  </span>
                  <p className="text-sm font-semibold text-foreground mt-2 mb-1">{review.title}</p>
                  <p className="text-xs text-text-secondary line-clamp-2">{review.impressions}</p>
                  <div className="flex items-center justify-between mt-auto pt-3">
                    <span className="text-yellow-500 text-xs">{'★'.repeat(review.rate)}</span>
                    <span className="text-xs text-text-secondary">{formatDate(review.created_at)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
