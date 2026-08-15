// 英語学習ログ詳細 skeleton
export default function EnglishLogDetailLoading() {
  return (
    <div className="p-4 md:p-8 w-full animate-pulse">

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-foreground/10 rounded" />
          <div className="h-6 w-40 bg-foreground/10 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 bg-foreground/10 rounded-lg" />
          <div className="h-9 w-16 bg-foreground/10 rounded-lg" />
        </div>
      </div>

      {/* タイトルカード */}
      <div className="bg-surface rounded-xl p-6 border border-black/5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-lg bg-foreground/10 flex-shrink-0" />
          <div className="space-y-2 pt-1">
            <div className="h-7 w-48 bg-foreground/10 rounded-lg" />
            <div className="h-3 w-24 bg-foreground/10 rounded" />
          </div>
        </div>
      </div>

      {/* 本文 + ワード */}
      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-surface rounded-xl p-6 border border-black/5 space-y-3">
          <div className="h-4 w-16 bg-foreground/10 rounded mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-3 bg-foreground/10 rounded ${i === 5 ? 'w-2/5' : i % 3 === 2 ? 'w-5/6' : 'w-full'}`} />
          ))}
        </div>
        <div className="lg:col-span-2 bg-surface rounded-xl p-5 border border-black/5 space-y-4">
          <div className="h-4 w-28 bg-foreground/10 rounded mb-4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-4 w-24 bg-foreground/10 rounded" />
              <div className="h-3 w-40 bg-foreground/10 rounded" />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
