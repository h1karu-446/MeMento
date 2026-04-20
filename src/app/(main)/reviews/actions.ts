'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createReview(data: {
  title: string
  genre: string
  rate: number
  impressions: string
  words: { word: string; description: string }[]
}) {
  const supabase = await createClient()

  // ログイン中のユーザー情報を取得
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // reviewsテーブルにINSERT
  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      title: data.title,
      genre: data.genre,
      rate: data.rate,
      impressions: data.impressions,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // ワードがあればwordsテーブルにも保存
  if (data.words.length > 0) {
    await supabase.from('words').insert(
      data.words.map((w) => ({
        word: w.word,
        description: w.description,
        review_id: review.id,
        user_id: user.id,
        genre: data.genre,
        source_title: data.title,
      }))
    )
  }

  redirect('/reviews')
}

export async function deleteReview(reviewId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)

  if (error) throw new Error(error.message)

  redirect('/reviews')
}
