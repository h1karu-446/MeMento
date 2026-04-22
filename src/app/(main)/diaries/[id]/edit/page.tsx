import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditDiaryClient from './EditDiaryClient'

export default async function EditDiaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: diary } = await supabase.from('diaries').select('*').eq('id', id).single()
  if (!diary) notFound()

  const { data: words } = await supabase
    .from('words').select('word, description').eq('diary_id', id).order('created_at', { ascending: true })

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
