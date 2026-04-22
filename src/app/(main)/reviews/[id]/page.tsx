import { ChevronLeft, Pencil } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DeleteButton from './DeleteButton'

const genreColor: Record<string, string> = {
  映画: 'bg-yellow-100 text-yellow-700',
  小説: 'bg-blue-100 text-blue-700',
  音楽: 'bg-orange-100 text-orange-700',
}

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

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // レビューを取得
  const { data: review } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', id)
    .single()

  if (!review) notFound()

  // このレビューに紐づくワードを取得
  const { data: words } = await supabase
    .from('words')
    .select('*')
    .eq('review_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 md:p-8 w-full">

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/reviews" className="text-text-secondary hover:text-foreground transition">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-foreground">レビュー詳細</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/reviews/${review.id}/edit`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-black/10 bg-surface text-sm font-medium hover:bg-black/5 transition"
          >
            <Pencil size={14} />
            編集する
          </Link>
          <DeleteButton reviewId={review.id} />
        </div>
      </div>

      {/* タイトルカード */}
      <div className="bg-surface rounded-xl p-6 border border-black/5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-28 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center">
            <span className="text-text-secondary text-xs">サムネイル</span>
          </div>
          <div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${genreColor[review.genre] ?? 'bg-gray-100 text-gray-600'}`}>
              {review.genre}
            </span>
            <h2 className="text-xl font-bold text-foreground mt-2 mb-1">{review.title}</h2>
            <p className="text-yellow-500 text-sm mb-1">
              {renderStars(review.rate)}{' '}
              <span className="text-text-secondary">{review.rate}</span>
            </p>
            <p className="text-xs text-text-secondary">{formatDate(review.created_at)}</p>
          </div>
        </div>
      </div>

      {/* 感想 + ワード */}
      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-surface rounded-xl p-6 border border-black/5">
          <h2 className="text-sm font-semibold text-foreground mb-4">感想</h2>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
            {review.impressions || '感想はまだ書かれていません'}
          </p>
        </div>

        <div className="lg:col-span-2 bg-surface rounded-xl p-5 border border-black/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">ワード</h2>
          </div>
          {words && words.length > 0 ? (
            <div className="space-y-3">
              {words.map((w) => (
                <div key={w.id}>
                  <p className="text-sm font-medium text-foreground">{w.word}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{w.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-secondary">ワードはまだ登録されていません</p>
          )}
        </div>
      </div>

    </div>
  )
}
