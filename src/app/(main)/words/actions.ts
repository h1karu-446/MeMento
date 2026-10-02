'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createWord(data: {
  word: string
  description: string
  genre?: string
  source_title?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('words')
    .insert({
      word: data.word,
      description: data.description,
      genre: data.genre || null,
      source_title: data.source_title || null,
      user_id: user.id,
    })

  if (error) throw new Error(error.message)

  redirect('/words')
}

export async function deleteWord(wordId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { error } = await supabase.from('words').delete().eq('id', wordId).eq('user_id', user.id)
  if (error) throw new Error(error.message)
}

// Load the full filtered vocabulary only when a quiz starts, in bounded batches.
export async function loadQuizWords(params: { q: string; filter: string }) {
  const { filteredQuery, parseListState } = await import('@/lib/lists/query')
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims.sub) redirect('/login')
  const state = parseListState('words', params)
  const words = []
  const batchSize = 500
  for (let offset = 0; ; offset += batchSize) {
    const { data: batch, error: queryError } = await filteredQuery(supabase, 'words', state, false).range(offset, offset + batchSize - 1)
    if (queryError?.code === 'PGRST103' && offset > 0) break
    if (queryError) throw new Error('テスト用ワードの取得に失敗しました')
    words.push(...(batch ?? []))
    if (!batch || batch.length < batchSize) break
  }
  return words
}
