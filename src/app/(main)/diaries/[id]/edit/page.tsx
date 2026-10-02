import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditDiaryClient from './EditDiaryClient'

export default async function EditDiaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: diary, error: recordError }, { data: words, error: wordsError }] = await Promise.all([
    supabase.from('diaries').select('*').eq('id', id).single(),
    supabase
    .from('words').select('word, description').eq('diary_id', id).order('created_at', { ascending: true }),
  ])
  if (recordError && recordError.code !== 'PGRST116') throw new Error('記録の取得に失敗しました', { cause: recordError })
  if (!diary) notFound()
  if (wordsError) throw new Error('ワードの取得に失敗しました', { cause: wordsError })

  return (
    <EditDiaryClient
      diaryId={id}
      initialTitle={diary.title}
      initialBody={diary.body}
      initialLanguage={diary.language}
      initialWords={words ?? []}
    />
  )
}
