'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createEnglishLog(data: {
  title: string
  content: string
  words: { word: string; description: string; example: string }[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: log, error } = await supabase
    .from('english_logs')
    .insert({ title: data.title, content: data.content, user_id: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (data.words.length > 0) {
    await supabase.from('words').insert(
      data.words.map((w) => ({
        word: w.word,
        description: w.description,
        example: w.example || null,
        english_log_id: log.id,
        user_id: user.id,
        genre: '英語学習',
        source_title: data.title,
      }))
    )
  }

  redirect('/english')
}

export async function updateEnglishLog(
  logId: string,
  data: {
    title: string
    content: string
    words: { word: string; description: string; example: string }[]
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('english_logs')
    .update({ title: data.title, content: data.content })
    .eq('id', logId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  await supabase.from('words').delete().eq('english_log_id', logId)

  if (data.words.length > 0) {
    await supabase.from('words').insert(
      data.words.map((w) => ({
        word: w.word,
        description: w.description,
        example: w.example || null,
        english_log_id: logId,
        user_id: user.id,
        genre: '英語学習',
        source_title: data.title,
      }))
    )
  }

  redirect(`/english/${logId}`)
}

export async function deleteEnglishLog(logId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { error } = await supabase.from('english_logs').delete().eq('id', logId).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  redirect('/english')
}
