import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditReviewClient from './EditReviewClient'

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: review, error: recordError }, { data: words, error: wordsError }] = await Promise.all([
    supabase.from('reviews').select('*').eq('id', id).single(),
    supabase
    .from('words').select('word, description').eq('review_id', id).order('created_at', { ascending: true }),
  ])
  if (recordError && recordError.code !== 'PGRST116') throw new Error('記録の取得に失敗しました', { cause: recordError })
  if (!review) notFound()
  if (wordsError) throw new Error('ワードの取得に失敗しました', { cause: wordsError })

  return (
    <EditReviewClient
      reviewId={id}
      initialTitle={review.title}
      initialGenre={review.genre}
      initialRate={review.rate}
      initialImpressions={review.impressions ?? ''}
      initialWords={words ?? []}
    />
  )
}
