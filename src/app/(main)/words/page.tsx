import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import WordsList from './WordsList'

export default async function WordsPage() {
  const supabase = await createClient()

  const { data: words, error } = await supabase
    .from('words')
    .select('*, reviews(genre, title), diaries(title)')
    .order('created_at', { ascending: false })

  if (error) console.error(error)

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">ワード</h1>
        <Link href="/words/new" className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition">
          + 追加
        </Link>
      </div>
      <WordsList words={words ?? []} />
    </div>
  )
}
