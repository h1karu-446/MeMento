import Link from 'next/link'
import { loadList, type SearchParams } from '@/lib/lists/query'
import { createClient } from '@/lib/supabase/server'
import EnglishLogsList from './EnglishLogsList'

export default async function EnglishLogsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const supabase = await createClient()
  const { rows, state } = await loadList(supabase, 'english', await searchParams)

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">英語学習</h1>
        <Link href="/english/new" className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition">
          + 新しい学習ログ
        </Link>
      </div>
      <EnglishLogsList logs={rows as unknown as Parameters<typeof EnglishLogsList>[0]['logs']} state={state} />
    </div>
  )
}
