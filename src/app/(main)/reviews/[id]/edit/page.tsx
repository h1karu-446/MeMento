import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditReviewClient from './EditReviewClient'

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: review } = await supabase.from('reviews').select('*').eq('id', id).single()
  if (!review) notFound()

  const { data: words } = await supabase
    .from('words').select('word, description').eq('review_id', id).order('created_at', { ascending: true })

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
