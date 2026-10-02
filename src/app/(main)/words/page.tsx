import Link from 'next/link'
import { loadList, type SearchParams } from '@/lib/lists/query'
import { createClient } from '@/lib/supabase/server'
import WordsList from './WordsList'

export default async function WordsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const supabase = await createClient()

  const { rows, state } = await loadList(supabase, 'words', await searchParams)

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">ワード</h1>
        <Link href="/words/new" className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition">
          + ワードを追加
        </Link>
      </div>
      <WordsList words={rows as unknown as Parameters<typeof WordsList>[0]['words']} state={state} />
    </div>
  )
}
