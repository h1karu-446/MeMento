// ダッシュボード skeleton
export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-8 w-full animate-pulse">

      {/* ヘッダー */}
      <div className="flex items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <div className="h-8 w-44 bg-foreground/10 rounded-lg mb-2" />
          <div className="h-4 w-36 bg-foreground/10 rounded" />
        </div>
        <div className="flex gap-x-3">
          <div className="h-9 w-28 bg-foreground/10 rounded-lg" />
          <div className="h-9 w-28 bg-foreground/10 rounded-lg" />
          <div className="h-9 w-32 bg-foreground/10 rounded-lg" />
        </div>
      </div>

      {/* 3カラム */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface rounded-xl p-5 border border-black/5 h-48 flex flex-col gap-3">
            <div className="h-3 w-20 bg-foreground/10 rounded" />
            <div className="h-8 w-32 bg-foreground/10 rounded-lg" />
            <div className="h-px bg-foreground/10" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-foreground/10 rounded" />
              <div className="h-3 w-4/5 bg-foreground/10 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* AI おすすめ */}
      <div className="bg-surface rounded-xl p-5 border border-black/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-foreground/10" />
            <div className="h-4 w-32 bg-foreground/10 rounded" />
          </div>
          <div className="h-7 w-28 bg-foreground/10 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-background rounded-xl border border-black/5 overflow-hidden">
              <div className="w-full h-32 bg-foreground/10" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-12 bg-foreground/10 rounded-full" />
                <div className="h-4 w-full bg-foreground/10 rounded" />
                <div className="h-3 w-4/5 bg-foreground/10 rounded" />
                <div className="h-3 w-3/5 bg-foreground/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
