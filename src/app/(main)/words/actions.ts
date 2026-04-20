'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createWord(data: {
  word: string
  description: string
  
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('words')
    .insert({ word: data.word, description: data.description, user_id: user.id })

  if (error) throw new Error(error.message)

  redirect('/words')
}

export async function deleteWord(wordId: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('words').delete().eq('id', wordId)
  if (error) throw new Error(error.message)
}
