'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { languageColor } from '@/lib/genre-colors'
import { formatDate } from '@/lib/utils'

type Diary = {
  id: string
  title: string
  body: string
  language: string
  created_at: string
}

const filters = ['すべて', '日本語', 'English'] as const
const sorts = ['新しい順', '古い順'] as const
const PAGE_SIZE = 4


export default function DiariesList({ diaries }: { diaries: Diary[] }) {
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]>('すべて')
  const [activeSort, setActiveSort] = useState<typeof sorts[number]>('新しい順')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const q = searchQuery.toLowerCase()
  const filtered = diaries
    .filter((d) => {
      if (activeFilter === 'すべて') return true
      return activeFilter === '日本語' ? d.language === 'ja' : d.language === 'en'
    })
    .filter((d) => !q || d.title.toLowerCase().includes(q) || d.body.toLowerCase().includes(q))
    .sort((a, b) => {
      const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      return activeSort === '新しい順' ? diff : -diff
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="タイトル・本文で検索..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
          className="w-40 sm:w-56 md:w-72 px-4 py-2 rounded-lg border border-black/10 bg-surface text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex gap-2">
            {filters.map((f) => (
              <button key={f} onClick={() => { setActiveFilter(f); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                  activeFilter === f ? 'bg-primary text-white' : 'bg-surface border border-black/10 text-foreground hover:bg-black/5'
                }`}>{f}</button>
            ))}
          </div>
          <div className="flex gap-1 bg-surface border border-black/10 rounded-lg p-0.5">
            {sorts.map((s) => (
              <button key={s} onClick={() => { setActiveSort(s); setPage(1) }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition cursor-pointer ${
                  activeSort === s ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-foreground'
                }`}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-text-secondary text-sm text-center py-20">{q ? '検索結果がありません' : '日記がまだありません'}</p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {paged.map((diary) => (
              <Link key={diary.id} href={`/diaries/${diary.id}`} className="block">
                <div className="bg-surface rounded-xl border border-black/5 px-5 py-[22px] hover:shadow-md transition flex items-center gap-5 group">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex-shrink-0 flex items-center justify-center">
                    <span className="text-primary text-xs font-medium">{diary.language === 'ja' ? '画像' : 'EN'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-foreground mb-1">{diary.title}</p>
                    <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">{diary.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${languageColor[diary.language] ?? languageColor['ja']}`}>
                        {diary.language === 'ja' ? '日本語' : 'English'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm text-text-secondary">{formatDate(diary.created_at)}</span>
                    <ChevronRight size={16} className="text-text-secondary group-hover:text-foreground transition" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition cursor-pointer bg-surface border border-black/10 text-foreground ${page === 1 ? 'opacity-30 cursor-default' : 'hover:bg-black/5'}`}>«</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition cursor-pointer ${
                    page === p ? 'bg-primary text-white' : 'bg-surface border border-black/10 text-foreground hover:bg-black/5'
                  }`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition cursor-pointer bg-surface border border-black/10 text-foreground ${page === totalPages ? 'opacity-30 cursor-default' : 'hover:bg-black/5'}`}>»</button>
            </div>
          )}
        </>
      )}
    </>
  )
}
