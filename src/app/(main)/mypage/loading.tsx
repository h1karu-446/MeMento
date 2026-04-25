// マイページ skeleton
export default function MypageLoading() {
  return (
    <div className="p-4 md:p-8 w-full animate-pulse">
      <div className="h-8 w-28 bg-foreground/10 rounded-lg mb-6" />

      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6 items-start">

        {/* 左：プロフィール */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-black/5 p-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-foreground/10 mb-3" />
          <div className="h-5 w-28 bg-foreground/10 rounded mb-2" />
          <div className="h-3 w-40 bg-foreground/10 rounded mb-6" />
          <div className="h-3 w-20 bg-foreground/10 rounded mb-3" />
          <div className="flex gap-1.5 mb-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-lg bg-foreground/10" />
            ))}
          </div>
          <div className="h-3 w-28 bg-foreground/10 rounded" />
        </div>

        {/* 右：統計・ジャンル・設定 */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* 統計 */}
          <div className="bg-surface rounded-xl border border-black/5 p-6">
            <div className="h-4 w-8 bg-foreground/10 rounded mb-4" />
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-14 bg-foreground/10 rounded" />
                  <div className="h-8 w-10 bg-foreground/10 rounded" />
                  <div className="h-3 w-16 bg-foreground/10 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* ジャンル内訳 */}
          <div className="bg-surface rounded-xl border border-black/5 p-6">
            <div className="h-4 w-20 bg-foreground/10 rounded mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3 w-8 bg-foreground/10 rounded flex-shrink-0" />
                  <div className="flex-1 h-2 bg-foreground/10 rounded-full" />
                  <div className="h-3 w-4 bg-foreground/10 rounded flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* アカウント設定 */}
          <div className="bg-surface rounded-xl border border-black/5 p-6">
            <div className="h-4 w-28 bg-foreground/10 rounded mb-4" />
            <div className="divide-y divide-black/5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="h-4 w-24 bg-foreground/10 rounded" />
                  <div className="h-4 w-20 bg-foreground/10 rounded" />
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="h-10 w-full bg-foreground/10 rounded-lg" />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
