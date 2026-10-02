'use client'

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="p-8" role="alert">
    <h1 className="text-xl font-bold mb-3">データを読み込めませんでした</h1>
    <p className="text-text-secondary mb-4">時間をおいて、もう一度お試しください。</p>
    <button onClick={reset} className="rounded-lg bg-primary px-4 py-2 text-white">再試行</button>
  </div>
}
