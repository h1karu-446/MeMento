import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import DiariesList from './DiariesList'

export default async function DiariesPage() {
  const supabase = await createClient()
  const { data: diaries, error } = await supabase
    .from('diaries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) console.error(error)

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">ダイアリー一覧</h1>
        <Link href="/diaries/new" className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition">
          + 新しい日記
        </Link>
      </div>
      <DiariesList diaries={diaries ?? []} />
    </div>
  )
}
