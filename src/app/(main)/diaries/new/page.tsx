'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Upload, Sparkles, ArrowLeftRight } from 'lucide-react'
import { createDiary } from '../actions'

export default function NewDiaryPage() {
  const [title, setTitle] = useState('')
  const [bodyJa, setBodyJa] = useState('')
  const [bodyEn, setBodyEn] = useState('')
  const [saving, setSaving] = useState(false)
  const [words, setWords] = useState<{ word: string; description: string }[]>([])
  const [wordInput, setWordInput] = useState({ word: '', description: '' })
  const [showAiResult, setShowAiResult] = useState(false)

  async function handleSave() {
    if (!title.trim()) return alert('タイトルを入力してください')
    if (!bodyJa.trim() && !bodyEn.trim()) return alert('本文を入力してください')
    setSaving(true)
    const body = bodyJa.trim() || bodyEn.trim()
    const language = bodyJa.trim() ? 'ja' : 'en'
    await createDiary({ title, body, language, words })
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

      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/diaries" className="text-text-secondary hover:text-foreground transition">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-foreground">ダイアリーを作成</h1>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-10 gap-6 flex-1">

        {/* 左カラム */}
        <div className="lg:col-span-7 flex flex-col gap-5">

          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">タイトル</label>
            <input
              type="text"
              placeholder="例：今日の振り返り"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-surface text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            />
          </div>

          {/* 本文（日英並列） */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">本文</label>
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <ArrowLeftRight size={12} />
                入力すると自動翻訳
              </span>
            </div>
            <div className="flex gap-3 flex-1">
              {/* 日本語 */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="pl-2 py-2">
                  <span className="text-xs font-semibold text-primary">日本語</span>
                </div>
                <textarea
                  placeholder="今日感じたこと、学んだことを自由に書いてください..."
                  value={bodyJa}
                  onChange={(e) => setBodyJa(e.target.value)}
                  className="flex-1 w-full px-4 py-3 bg-surface text-sm text-foreground placeholder:text-text-secondary focus:outline-none resize-none min-h-48 border border-black/10 rounded-xl"
                />
              </div>

              {/* English */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="pl-2 py-2">
                  <span className="text-xs font-semibold text-accent">English</span>
                </div>
                <textarea
                  placeholder="自動翻訳されます..."
                  value={bodyEn}
                  onChange={(e) => setBodyEn(e.target.value)}
                  className="flex-1 w-full px-4 py-3 bg-surface text-sm text-text-secondary placeholder:text-text-secondary focus:outline-none resize-none min-h-48 border border-black/10 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* AI文章添削 */}
          <div className="rounded-xl border border-accent/25 bg-accent/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-accent" />
                <span className="text-sm font-medium text-accent">AI文章添削</span>
              </div>
              <button className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium transition cursor-pointer">
                添削する
              </button>
            </div>
            {showAiResult && (
              <>
                <p className="text-sm text-foreground bg-surface rounded-lg px-4 py-3 border border-black/5 mb-3">
                  添削後の文章がここに表示されます。元の文章と見比べながら、適用するか選べます。
                </p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-white text-xs font-medium transition cursor-pointer">
                    この内容で更新する
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-black/10 bg-surface text-xs font-medium text-foreground hover:bg-black/5 transition cursor-pointer">
                    破棄する
                  </button>
                </div>
              </>
            )}
          </div>

        </div>

        {/* 右カラム */}
        <div className="lg:col-span-3 flex flex-col gap-5">

          {/* 画像 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">画像</label>
            <div className="w-full h-36 rounded-xl border-2 border-dashed border-black/10 bg-surface hover:bg-black/5 transition cursor-pointer flex flex-col items-center justify-center gap-2">
              <Upload size={18} className="text-text-secondary" />
              <p className="text-xs text-text-secondary">クリックして画像をアップロード</p>
            </div>
          </div>

          {/* 記録したワード */}
          <div className="flex-1 bg-surface rounded-xl border border-black/5 p-4">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-foreground">記録したワード</label>
            </div>

            {/* 既存ワード */}
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

            {/* 入力フォーム */}
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
          href="/diaries"
          className="px-6 py-2.5 rounded-lg border border-black/10 bg-surface text-sm font-medium text-foreground hover:bg-black/5 transition"
        >
          キャンセル
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition cursor-pointer disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存する'}
        </button>
      </div>

    </div>
  )
}
