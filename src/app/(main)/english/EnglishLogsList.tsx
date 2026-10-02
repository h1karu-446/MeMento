'use client'

import Link from 'next/link'
import { useListNavigation } from '@/components/useListNavigation'
import { ListPagination } from '@/components/ListPagination'
import type { ListState } from '@/lib/lists/query'
import { ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type EnglishLog = {
  id: string
  title: string
  content: string
  created_at: string
}

const sorts = ['新しい順', '古い順'] as const

export default function EnglishLogsList({ logs, state }: { logs: EnglishLog[]; state: ListState }) {
  const { searchQuery, setSearchQuery, activeSort, setActiveSort, page, totalPages, setPage, isPending } = useListNavigation(state)
  const q = state.q
  const filtered = logs
  const paged = logs

  return (
    <div aria-busy={isPending}>
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="タイトル・内容で検索..."
          value={searchQuery}
          maxLength={200}
          onChange={(e) => { setSearchQuery(e.target.value) }}
          className="w-40 sm:w-56 md:w-72 px-4 py-2 rounded-lg border border-black/10 bg-surface text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex gap-1 bg-surface border border-black/10 rounded-lg p-0.5">
            {sorts.map((s) => (
              <button key={s} onClick={() => { setActiveSort(s) }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition cursor-pointer ${
                  activeSort === s ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-foreground'
                }`}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-text-secondary text-sm text-center py-20">{q ? '検索結果がありません' : '英語学習ログがまだありません'}</p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {paged.map((log) => (
              <Link key={log.id} href={`/english/${log.id}`} className="block">
                <div className="bg-surface rounded-xl border border-black/5 px-5 py-[22px] hover:shadow-md transition flex items-center gap-5 group">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex-shrink-0 flex items-center justify-center">
                    <span className="text-primary text-xs font-medium">EN</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-foreground mb-1">{log.title}</p>
                    <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">{log.content}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm text-text-secondary">{formatDate(log.created_at)}</span>
                    <ChevronRight size={16} className="text-text-secondary group-hover:text-foreground transition" />
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
