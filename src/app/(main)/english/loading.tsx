// 英語学習一覧 skeleton
export default function EnglishLogsLoading() {
  return (
    <div className="p-4 md:p-8 w-full animate-pulse">

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 bg-foreground/10 rounded-lg" />
        <div className="h-9 w-36 bg-foreground/10 rounded-lg" />
      </div>

      {/* 検索・ソートバー */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-9 w-40 sm:w-56 md:w-72 bg-foreground/10 rounded-lg" />
        <div className="h-9 w-28 bg-foreground/10 rounded-lg ml-auto" />
      </div>

      {/* カードリスト */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface rounded-xl border border-black/5 px-5 py-[22px] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-foreground/10 flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-4 w-2/5 bg-foreground/10 rounded" />
              <div className="h-3 w-full bg-foreground/10 rounded" />
              <div className="h-3 w-4/5 bg-foreground/10 rounded" />
            </div>
            <div className="flex-shrink-0">
              <div className="h-3 w-16 bg-foreground/10 rounded" />
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
