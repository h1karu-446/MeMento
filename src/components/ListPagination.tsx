'use client'

export function ListPagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (page: number) => void }) {
  if (totalPages <= 1) return null
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])].filter(p => p > 0 && p <= totalPages).sort((a, b) => a - b)
  return <nav aria-label="ページ切り替え" className="flex items-center justify-center gap-1 mt-6">
    <button type="button" aria-label="前のページ" onClick={() => setPage(page - 1)} disabled={page === 1} className="w-9 h-9 rounded-lg bg-surface disabled:opacity-30">«</button>
    {pages.map((p, i) => <span key={p} className="flex items-center gap-1">
      {i > 0 && p > pages[i - 1] + 1 && <span>…</span>}
      <button type="button" aria-current={p === page ? 'page' : undefined} onClick={() => setPage(p)} className={`w-9 h-9 rounded-lg text-sm ${page === p ? 'bg-primary text-white' : 'bg-surface text-foreground'}`}>{p}</button>
    </span>)}
    <button type="button" aria-label="次のページ" onClick={() => setPage(page + 1)} disabled={page === totalPages} className="w-9 h-9 rounded-lg bg-surface disabled:opacity-30">»</button>
  </nav>
}
