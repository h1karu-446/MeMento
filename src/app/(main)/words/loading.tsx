// ワード一覧 skeleton
export default function WordsLoading() {
  return (
    <div className="p-4 md:p-8 w-full animate-pulse">

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-20 bg-foreground/10 rounded-lg" />
        <div className="h-9 w-32 bg-foreground/10 rounded-lg" />
      </div>

      {/* 検索・フィルターバー */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-9 w-40 sm:w-56 bg-foreground/10 rounded-lg" />
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 w-12 bg-foreground/10 rounded-lg" />
            ))}
          </div>
          <div className="h-9 w-28 bg-foreground/10 rounded-lg" />
        </div>
      </div>

      {/* カードグリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-surface rounded-xl border border-black/5 p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="h-5 w-24 bg-foreground/10 rounded" />
              <div className="h-5 w-12 bg-foreground/10 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-foreground/10 rounded" />
              <div className="h-3 w-4/5 bg-foreground/10 rounded" />
            </div>
            <div className="h-4 w-20 bg-foreground/10 rounded-full" />
          </div>
        ))}
      </div>

    </div>
  )
}
