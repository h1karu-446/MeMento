import { ChevronLeft, Pencil } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DeleteButton from './DeleteButton'
import { formatDateTime } from '@/lib/utils'

export default async function EnglishLogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: log } = await supabase.from('english_logs').select('*').eq('id', id).single()
  if (!log) notFound()

  const { data: words } = await supabase
    .from('words').select('*').eq('english_log_id', id).order('created_at', { ascending: false })

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/english" className="text-text-secondary hover:text-foreground transition">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-foreground">英語学習ログ詳細</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/english/${log.id}/edit`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-black/10 bg-surface text-sm font-medium hover:bg-black/5 transition"
          >
            <Pencil size={14} />
            編集する
          </Link>
          <DeleteButton logId={log.id} />
        </div>
      </div>

      <div className="bg-surface rounded-xl p-6 border border-black/5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center">
            <span className="text-primary text-xs font-medium">EN</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">{log.title}</h2>
            <p className="text-xs text-text-secondary">{formatDateTime(log.created_at)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-surface rounded-xl p-6 border border-black/5">
          <h2 className="text-sm font-semibold text-foreground mb-4">学習メモ</h2>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{log.content}</p>
        </div>
        <div className="lg:col-span-2 bg-surface rounded-xl p-5 border border-black/5">
          <h2 className="text-sm font-semibold text-foreground mb-4">単語・センテンス</h2>
          {words && words.length > 0 ? (
            <div className="space-y-3">
              {words.map((w) => (
                <div key={w.id}>
                  <p className="text-sm font-medium text-foreground">{w.word}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{w.description}</p>
                  {w.example && <p className="text-xs text-text-secondary mt-0.5 italic">{w.example}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-secondary">単語・センテンスは登録されていません</p>
          )}
        </div>
      </div>
    </div>
  )
}
