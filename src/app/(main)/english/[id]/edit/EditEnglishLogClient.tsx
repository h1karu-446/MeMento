'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Loader2, ArrowLeftRight } from 'lucide-react'
import { updateEnglishLog } from '../../actions'
import { translateTextClaude, checkEnglishText } from '@/lib/ai-actions'
import { useToast } from '@/components/Toast'

type Word = { word: string; description: string; example: string }

type Props = {
  logId: string
  initialTitle: string
  initialContent: string
  initialWords: Word[]
}

export default function EditEnglishLogClient({
  logId,
  initialTitle,
  initialContent,
  initialWords,
}: Props) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)
  const [words, setWords] = useState<Word[]>(initialWords)
  const [wordInput, setWordInput] = useState({ word: '', description: '', example: '' })
  const [translateFrom, setTranslateFrom] = useState<'ja' | 'en'>('ja')
  const [translateInput, setTranslateInput] = useState('')
  const [translateResult, setTranslateResult] = useState('')
  const [correctionResult, setCorrectionResult] = useState<{ corrected: string; hasErrors: boolean } | null>(null)
  const [translating, setTranslating] = useState(false)
  const toast = useToast()

  async function handleTranslate() {
    if (!translateInput.trim()) return toast('翻訳したいテキストを入力してください', 'info')
    setTranslating(true)
    if (translateFrom === 'en') {
      const res = await checkEnglishText(translateInput.trim())
      setTranslating(false)
      if (!res.ok) return toast(`チェックに失敗しました: ${res.error}`)
      setCorrectionResult({ corrected: res.corrected, hasErrors: res.hasErrors })
      setTranslateResult(res.translation)
    } else {
      const res = await translateTextClaude(translateInput.trim(), translateFrom)
      setTranslating(false)
      if (!res.ok) return toast(`翻訳に失敗しました: ${res.error}`)
      setCorrectionResult(null)
      setTranslateResult(res.result)
    }
  }

  async function handleSave() {
    if (!title.trim()) return toast('タイトルを入力してください', 'info')
    if (!content.trim()) return toast('学習メモを入力してください', 'info')
    setSaving(true)
    await updateEnglishLog(logId, { title, content, words })
  }

  function addWord() {
    if (!wordInput.word.trim()) return
    setWords([...words, wordInput])
    setWordInput({ word: '', description: '', example: '' })
  }

  function removeWord(index: number) {
    setWords(words.filter((_, i) => i !== index))
  }

  return (
    <div className="p-4 md:p-8 w-full min-h-screen flex flex-col">

      <div className="flex items-center gap-3 mb-6">
        <Link href={`/english/${logId}`} className="text-text-secondary hover:text-foreground transition">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-foreground">英語学習ログを編集</h1>
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

          {/* 学習メモ */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">学習メモ</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 bg-surface text-sm text-foreground placeholder:text-text-secondary focus:outline-none resize-none h-24 border border-black/10 rounded-xl"
            />
          </div>

          {/* 翻訳 */}
          <div className="flex-1 flex flex-col rounded-xl border border-accent/25 bg-accent/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ArrowLeftRight size={14} className="text-accent" />
                <span className="text-sm font-medium text-accent">翻訳</span>
              </div>
              <div className="flex gap-1 bg-surface border border-black/10 rounded-lg p-0.5">
                <button
                  onClick={() => setTranslateFrom('ja')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                    translateFrom === 'ja' ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-foreground'
                  }`}
                >
                  日本語→English
                </button>
                <button
                  onClick={() => setTranslateFrom('en')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                    translateFrom === 'en' ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-foreground'
                  }`}
                >
                  English→日本語
                </button>
              </div>
            </div>
            <textarea
              placeholder="翻訳したいテキストを入力..."
              value={translateInput}
              onChange={(e) => setTranslateInput(e.target.value)}
              className="w-full px-4 py-3 bg-surface text-sm text-foreground placeholder:text-text-secondary focus:outline-none resize-none min-h-24 border border-black/10 rounded-xl mb-3"
            />
            <button
              onClick={handleTranslate}
              disabled={translating}
              className="self-start inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium transition cursor-pointer disabled:opacity-50 mb-3"
            >
              {translating ? <><Loader2 size={12} className="animate-spin" />チェック中...</> : translateFrom === 'en' ? 'チェックする' : '翻訳する'}
            </button>
            {translateFrom === 'en' && correctionResult && (
              <div className="mb-3">
                <p className="text-xs text-text-secondary mb-1">
                  {correctionResult.hasErrors ? '修正後の英文' : '✓ 誤りは見つかりませんでした'}
                </p>
                {correctionResult.hasErrors && (
                  <p className="text-sm text-foreground bg-surface rounded-lg px-4 py-3 border border-black/5 whitespace-pre-line">
                    {correctionResult.corrected}
                  </p>
                )}
              </div>
            )}
            <p className="flex-1 text-sm text-foreground bg-surface rounded-lg px-4 py-3 border border-black/5 whitespace-pre-line min-h-[3rem]">
              {translateResult || '翻訳結果がここに表示されます。'}
            </p>
          </div>

        </div>

        {/* 右カラム */}
        <div className="lg:col-span-3 flex flex-col gap-5">

          {/* 記録した単語・センテンス */}
          <div className="flex-1 bg-surface rounded-xl border border-black/5 p-4">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-foreground">記録した単語・センテンス</label>
            </div>

            <div className="space-y-3 mb-4">
              {words.map((w, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{w.word}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{w.description}</p>
                    {w.example && <p className="text-xs text-text-secondary mt-0.5 italic">{w.example}</p>}
                  </div>
                  <button onClick={() => removeWord(i)} className="text-text-secondary hover:text-red-500 text-xs cursor-pointer mt-0.5">✕</button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="単語・センテンス"
                value={wordInput.word}
                onChange={(e) => setWordInput({ ...wordInput, word: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-black/10 bg-background text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                type="text"
                placeholder="意味・訳"
                value={wordInput.description}
                onChange={(e) => setWordInput({ ...wordInput, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-black/10 bg-background text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                type="text"
                placeholder="例文"
                value={wordInput.example}
                onChange={(e) => setWordInput({ ...wordInput, example: e.target.value })}
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
          href={`/english/${logId}`}
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
