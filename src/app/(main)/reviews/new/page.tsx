'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'


const genres = ['映画', '小説', '音楽'] as const
type Genre = typeof genres[number]

export default function NewReviewPage() {
  const [selectedGenre, setSelectedGenre] = useState<Genre>('映画')
  const [rate, setRate] = useState(0)
  const [rateText, setRateText] = useState('0')
  const [hoverRate, setHoverRate] = useState(0)

  function applyRate(value: number) {
    const clamped = Math.min(5, Math.max(0, Math.round(value * 2) / 2))
    setRate(clamped)
    setRateText(String(clamped))
  }
  const [words, setWords] = useState<{ word: string; description: string }[]>([])
  const [wordInput, setWordInput] = useState({ word: '', description: '' })

  function addWord() {
    if (!wordInput.word.trim()) return
    setWords([...words, wordInput])
    setWordInput({ word: '', description: '' })
  }

  function removeWord(index: number) {
    setWords(words.filter((_, i) => i !== index))
  }

  return (
    <div className="p-4 md:p-8 w-full">

      {/* ヘッダー */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/reviews" className="flex items-center gap-1 text-sm text-text-secondary hover:text-foreground transition">
          <ChevronLeft size={16} />
          レビュー一覧
        </Link>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
        {/* 左カラム */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">作品タイトル</label>
            <input
              type="text"
              placeholder="例：ショーシャンクの空に"
              className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-surface text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">ジャンル</label>
            <div className="flex gap-2">
              {genres.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGenre(g)}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    selectedGenre === g
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'bg-surface border border-black/10 text-foreground hover:bg-black/5'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">レート</label>
            <div className="inline-flex items-center gap-4 px-4 py-3 bg-surface rounded-xl border border-black/5">
              <div className="flex gap-0.5" onMouseLeave={() => setHoverRate(0)}>
                {[1, 2, 3, 4, 5].map((i) => {
                  const display = hoverRate || rate
                  const filled = display >= i
                  const half = !filled && display >= i - 0.5
                  return (
                    <button
                      key={i}
                      type="button"
                      className="relative text-2xl w-7 cursor-pointer"
                      onMouseMove={(e) => {
                        const x = e.clientX - e.currentTarget.getBoundingClientRect().left
                        setHoverRate(x < e.currentTarget.offsetWidth / 2 ? i - 0.5 : i)
                      }}
                      onClick={(e) => {
                        const x = e.clientX - e.currentTarget.getBoundingClientRect().left
                        applyRate(x < e.currentTarget.offsetWidth / 2 ? i - 0.5 : i)
                      }}
                    >
                      <span className="text-black/15">★</span>
                      {(filled || half) && (
                        <span
                          className="absolute inset-0 text-yellow-400 overflow-hidden"
                          style={{ width: filled ? '100%' : '50%' }}
                        >
                          ★
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              {/* 区切り */}
              <div className="w-px h-5 bg-black/10" />
              {/* カスタム数値コントロール */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyRate(rate - 0.5)}
                  className="w-6 h-6 rounded-md bg-black/5 hover:bg-black/10 text-text-secondary text-sm font-bold leading-none cursor-pointer transition flex items-center justify-center"
                >
                  −
                </button>
                <input
                  type="text"
                  inputMode="decimal"
                  value={rateText}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    setRateText(e.target.value)
                    const v = parseFloat(e.target.value)
                    if (!isNaN(v)) {
                      const clamped = Math.min(5, Math.max(0, Math.round(v * 2) / 2))
                      setRate(clamped)
                    }
                  }}
                  onBlur={() => setRateText(String(rate))}
                  className="w-8 text-center text-sm font-semibold text-foreground bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => applyRate(rate + 0.5)}
                  className="w-6 h-6 rounded-md bg-black/5 hover:bg-black/10 text-text-secondary text-sm font-bold leading-none cursor-pointer transition flex items-center justify-center"
                >
                  ＋
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">ワード</label>
            <div className="bg-surface rounded-xl border border-black/5 p-4">
              <p className="text-xs font-medium text-text-secondary mb-3">記録した語彙・表現</p>
              {words.length > 0 && (
                <div className="space-y-2 mb-3">
                  {words.map((w, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 p-2 bg-background rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-foreground">{w.word}</p>
                        <p className="text-xs text-text-secondary">{w.description}</p>
                      </div>
                      <button onClick={() => removeWord(i)} className="text-text-secondary hover:text-red-500 text-xs cursor-pointer">✕</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="語彙・表現を入力"
                  value={wordInput.word}
                  onChange={(e) => setWordInput({ ...wordInput, word: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 bg-background text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <textarea
                  placeholder="意味・説明"
                  rows={1}
                  value={wordInput.description}
                  onChange={(e) => setWordInput({ ...wordInput, description: e.target.value })}
                  onInput={(e) => {
                    const el = e.currentTarget
                    el.style.height = 'auto'
                    el.style.height = el.scrollHeight + 'px'
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 bg-background text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none overflow-hidden"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addWord}
                    className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition cursor-pointer"
                  >
                    追加
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 右カラム：感想 */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-foreground mb-1.5">感想</label>
          <textarea
            placeholder="観た感想・気づき・学んだことを自由に書いてください..."
            className="flex-1 min-h-64 w-full px-4 py-3 rounded-xl border border-black/10 bg-surface text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

      </div>

      {/* フッターボタン */}
      <div className="flex justify-end gap-3 mt-6">
        <Link
          href="/reviews"
          className="px-6 py-2.5 rounded-lg border border-black/10 bg-surface text-sm font-medium text-foreground hover:bg-black/5 transition"
        >
          キャンセル
        </Link>
        <button
          type="button"
          className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition cursor-pointer"
        >
          保存する
        </button>
      </div>

    </div>
  )
}
