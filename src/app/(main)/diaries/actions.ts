'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createDiary(data: {
  title: string
  body: string
  language: string
  words: { word: string; description: string }[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: diary, error } = await supabase
    .from('diaries')
    .insert({ title: data.title, body: data.body, language: data.language, user_id: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (data.words.length > 0) {
    await supabase.from('words').insert(
      data.words.map((w) => ({
        word: w.word,
        description: w.description,
        diary_id: diary.id,
        user_id: user.id,
        genre: '日記',
        source_title: data.title,
      }))
    )
  }

  redirect('/diaries')
}

export async function deleteDiary(diaryId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('diaries').delete().eq('id', diaryId)
  if (error) throw new Error(error.message)
  redirect('/diaries')
}
