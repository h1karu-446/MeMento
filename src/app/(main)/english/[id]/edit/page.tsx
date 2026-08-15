import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditEnglishLogClient from './EditEnglishLogClient'

export default async function EditEnglishLogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: log } = await supabase.from('english_logs').select('*').eq('id', id).single()
  if (!log) notFound()

  const { data: words } = await supabase
    .from('words').select('word, description, example').eq('english_log_id', id).order('created_at', { ascending: true })

  return (
    <EditEnglishLogClient
      logId={id}
      initialTitle={log.title}
      initialContent={log.content}
      initialWords={(words ?? []).map((w) => ({ ...w, example: w.example ?? '' }))}
    />
  )
}
