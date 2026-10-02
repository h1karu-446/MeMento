'use client'

import Link from 'next/link'
import { useListNavigation } from '@/components/useListNavigation'
import { ListPagination } from '@/components/ListPagination'
import type { ListState } from '@/lib/lists/query'
import { genreColor } from '@/lib/genre-colors'
import { formatDate } from '@/lib/utils'

type Review = {
  id: string
  title: string
  genre: string
  rate: number
  impressions: string
  created_at: string
}

const filters = ['すべて', '映画', '小説', '音楽'] as const
const sorts = ['新しい順', '古い順'] as const


function renderStars(rate: number) {
  const full = Math.floor(rate)
  const half = rate % 1 >= 0.5
  return (
    <span className="inline-flex text-yellow-400">
      {'★'.repeat(full)}
      {half && <span>☆</span>}
    </span>
  )
}

export default function ReviewsList({ reviews, state }: { reviews: Review[]; state: ListState }) {
  const { searchQuery, setSearchQuery, activeSort, setActiveSort, page, totalPages, setPage, isPending, activeFilter, setActiveFilter } = useListNavigation(state)
  const q = state.q
  const filtered = reviews
  const paged = reviews

  return (
    <div aria-busy={isPending}>
      {/* 検索・フィルター・ソート */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="タイトル・感想で検索..."
          value={searchQuery}
          maxLength={200}
          onChange={(e) => { setSearchQuery(e.target.value) }}
          className="w-40 sm:w-56 md:w-72 px-4 py-2 rounded-lg border border-black/10 bg-surface text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => { setActiveFilter(f) }}
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
                onClick={() => { setActiveSort(s) }}
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
        <p className="text-text-secondary text-sm text-center py-20">{q ? '検索結果がありません' : 'レビューがまだありません'}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {paged.map((review) => (
              <Link key={review.id} href={`/reviews/${review.id}`} className="h-full">
                <div className="h-full flex flex-col bg-surface rounded-xl border border-black/5 overflow-hidden hover:shadow-md transition cursor-pointer group">
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
                      <span className="text-xs">{renderStars(review.rate)}</span>
                      <span className="text-xs text-text-secondary">{formatDate(review.created_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <ListPagination page={page} totalPages={totalPages} setPage={setPage} />
        </>
      )}
    </div>
  )
}
