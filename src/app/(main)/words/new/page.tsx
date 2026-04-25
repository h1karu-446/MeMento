'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { createWord } from '../actions'
import { useToast } from '@/components/Toast'

const genres = ['映画', '小説', '音楽', '日記', 'その他'] as const

export default function NewWordPage() {
  const [genre, setGenre] = useState<typeof genres[number] | ''>('')
  const [word, setWord] = useState('')
  const [description, setDescription] = useState('')
  const [sourceTitle, setSourceTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  async function handleSave() {
    if (!word.trim()) return toast('語彙を入力してください', 'info')
    if (!description.trim()) return toast('意味・説明を入力してください', 'info')
    setSaving(true)
    await createWord({ word, description, genre: genre || undefined, source_title: sourceTitle || undefined })
  }

  return (
    <div className="p-4 md:p-8 w-full">

      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/words" className="text-text-secondary hover:text-foreground transition">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-foreground">ワードを追加</h1>
      </div>

      <div className="max-w-lg">

        {/* 語彙 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-foreground mb-1.5">語彙・表現</label>
          <input
            type="text"
            placeholder="例：刹那"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-surface text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
          />
        </div>

        {/* 意味 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-foreground mb-1.5">意味・説明</label>
          <textarea
            placeholder="例：極めて短い時間のこと。仏教用語。"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-black/10 bg-surface text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition resize-none"
          />
        </div>

        {/* ジャンル */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-foreground mb-1.5">ジャンル</label>
          <div className="flex gap-2 flex-wrap">
            {genres.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGenre(g)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                  genre === g
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-black/10 text-foreground hover:bg-black/5'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 出典 */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-1.5">出典</label>
          <input
            type="text"
            placeholder="例：ノルウェイの森"
            value={sourceTitle}
            onChange={(e) => setSourceTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-surface text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
          />
        </div>

        {/* フッター */}
        <div className="flex gap-3">
          <Link
            href="/words"
            className="px-6 py-2.5 rounded-lg border border-black/10 bg-surface text-sm font-medium text-foreground hover:bg-black/5 transition"
          >
            キャンセル
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <><Loader2 size={14} className="animate-spin" />保存中...</> : '保存する'}
          </button>
        </div>

      </div>
    </div>
  )
}
