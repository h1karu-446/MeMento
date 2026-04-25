'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, Sparkles, ArrowLeftRight, Undo2, Loader2 } from 'lucide-react'
import { updateDiary } from '../../actions'
import { proofreadText } from '@/lib/ai-actions'
import { useToast } from '@/components/Toast'

type Word = { word: string; description: string }

type Props = {
  diaryId: string
  initialTitle: string
  initialBody: string
  initialLanguage: string
  initialWords: Word[]
}

export default function EditDiaryClient({
  diaryId,
  initialTitle,
  initialBody,
  initialLanguage,
  initialWords,
}: Props) {
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [language, setLanguage] = useState(initialLanguage)
  const [saving, setSaving] = useState(false)
  const [words, setWords] = useState<Word[]>(initialWords)
  const [wordInput, setWordInput] = useState({ word: '', description: '' })
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [prevText, setPrevText] = useState('')
  const toast = useToast()

  async function handleProofread() {
    if (!body.trim()) return toast('本文を入力してください', 'info')
    setAiLoading(true)
    const res = await proofreadText(body, language as 'ja' | 'en', 'diary')
    setAiLoading(false)
    if (!res.ok) return toast(`添削に失敗しました: ${res.error}`)
    setAiResult(res.result)
  }

  async function handleSave() {
    if (!title.trim()) return toast('タイトルを入力してください', 'info')
    if (!body.trim()) return toast('本文を入力してください', 'info')
    setSaving(true)
    await updateDiary(diaryId, { title, body, language, words })
  }

  function addWord() {
    if (!wordInput.word.trim()) return
    setWords([...words, wordInput])
    setWordInput({ word: '', description: '' })
  }

  function removeWord(index: number) {
    setWords(words.filter((_, i) => i !== index))
  }

  return (
    <div className="p-4 md:p-8 w-full min-h-screen flex flex-col">

      <div className="flex items-center gap-3 mb-6">
        <Link href={`/diaries/${diaryId}`} className="text-text-secondary hover:text-foreground transition">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-foreground">ダイアリーを編集</h1>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-10 gap-6 flex-1">

        {/* 左カラム */}
        <div className="lg:col-span-7 flex flex-col gap-5">

          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-surface text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            />
          </div>

          {/* 本文 */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-foreground">本文</label>
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <ArrowLeftRight size={12} />
                言語：
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-xs text-text-secondary focus:outline-none cursor-pointer"
                >
                  <option value="ja">日本語</option>
                  <option value="en">English</option>
                </select>
              </span>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="flex-1 w-full px-4 py-3 bg-surface text-sm text-foreground placeholder:text-text-secondary focus:outline-none resize-none min-h-32 border border-black/10 rounded-xl"
            />
          </div>

          {/* AI文章添削 */}
          <div className="rounded-xl border border-accent/25 bg-accent/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-accent" />
                <span className="text-sm font-medium text-accent">AI文章添削</span>
              </div>
              <button
                onClick={handleProofread}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium transition cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? <><Loader2 size={12} className="animate-spin" />添削中...</> : '添削する'}
              </button>
            </div>
            <p className="text-sm text-foreground bg-surface rounded-lg px-4 py-3 border border-black/5 mb-3 whitespace-pre-line min-h-[3rem]">
              {aiResult || '添削後の文章がここに表示されます。元の文章と見比べながら、適用するか選べます。'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setPrevText(body); setBody(aiResult); setAiResult('') }}
                disabled={!aiResult}
                className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-white text-xs font-medium transition cursor-pointer disabled:opacity-30"
              >
                この内容で更新する
              </button>
              <button
                onClick={() => setAiResult('')}
                disabled={!aiResult}
                className="px-4 py-2 rounded-lg border border-black/10 bg-surface text-xs font-medium text-foreground hover:bg-black/5 transition cursor-pointer disabled:opacity-30"
              >
                破棄する
              </button>
              {prevText && (
                <button
                  onClick={() => { setBody(prevText); setPrevText('') }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-orange-300 bg-orange-50 text-xs font-medium text-orange-600 hover:bg-orange-100 transition cursor-pointer"
                >
                  <Undo2 size={12} />
                  元に戻す
                </button>
              )}
            </div>
          </div>

        </div>

        {/* 右カラム */}
        <div className="lg:col-span-3 flex flex-col gap-5">

          {/* 画像 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">画像</label>
            <div className="w-full h-36 rounded-xl border border-black/10 bg-surface hover:bg-black/5 transition cursor-pointer flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full border border-black/15 flex items-center justify-center">
                <Plus size={16} className="text-text-secondary" />
              </div>
              <p className="text-xs text-text-secondary">クリックして画像をアップロード</p>
            </div>
          </div>

          {/* 記録したワード */}
          <div className="flex-1 bg-surface rounded-xl border border-black/5 p-4">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-foreground">記録した語彙・表現</label>
              <span className="text-xs font-medium text-primary flex items-center gap-0.5">
                <Plus size={12} />
                追加
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {words.map((w, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{w.word}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{w.description}</p>
                  </div>
                  <button onClick={() => removeWord(i)} className="text-text-secondary hover:text-red-500 text-xs cursor-pointer mt-0.5">✕</button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="語彙・表現"
                value={wordInput.word}
                onChange={(e) => setWordInput({ ...wordInput, word: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-black/10 bg-background text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                type="text"
                placeholder="意味"
                value={wordInput.description}
                onChange={(e) => setWordInput({ ...wordInput, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-black/10 bg-background text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={addWord}
                className="w-full py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition cursor-pointer"
              >
                追加
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* フッター */}
      <div className="flex justify-end gap-3 mt-6">
        <Link
          href={`/diaries/${diaryId}`}
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
  )
}
