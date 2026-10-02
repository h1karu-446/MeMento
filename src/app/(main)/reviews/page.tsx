import Link from 'next/link'
import { loadList, type SearchParams } from '@/lib/lists/query'
import { createClient } from '@/lib/supabase/server'
import ReviewsList from './ReviewsList'

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const supabase = await createClient()

  const { rows, state } = await loadList(supabase, 'reviews', await searchParams)

  return (
    <div className="p-4 md:p-8 w-full">

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">レビュー一覧</h1>
        <Link
          href="/reviews/new"
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition"
        >
          + 新しいレビュー
        </Link>
      </div>

      {/* 一覧（フィルター・ソート付き） */}
      <ReviewsList reviews={rows as unknown as Parameters<typeof ReviewsList>[0]['reviews']} state={state} />

    </div>
  )
}
