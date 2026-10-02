import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditEnglishLogClient from './EditEnglishLogClient'

export default async function EditEnglishLogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: log, error: recordError }, { data: words, error: wordsError }] = await Promise.all([
    supabase.from('english_logs').select('*').eq('id', id).single(),
    supabase
    .from('words').select('word, description, example').eq('english_log_id', id).order('created_at', { ascending: true }),
  ])
  if (recordError && recordError.code !== 'PGRST116') throw new Error('記録の取得に失敗しました', { cause: recordError })
  if (!log) notFound()
  if (wordsError) throw new Error('ワードの取得に失敗しました', { cause: wordsError })

  return (
    <EditEnglishLogClient
      logId={id}
      initialTitle={log.title}
      initialContent={log.content}
      initialWords={(words ?? []).map((w) => ({ ...w, example: w.example ?? '' }))}
    />
  )
}
