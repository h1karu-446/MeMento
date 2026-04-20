'use client'

import { useState } from 'react'
import { deleteWord } from './actions'

type Word = {
  id: number
  word: string
  description: string
  created_at: string
  genre: string | null
  source_title: string | null
}

const genreColor: Record<string, string> = {
  映画: 'bg-yellow-100 text-yellow-700',
  小説: 'bg-blue-100 text-blue-700',
  音楽: 'bg-orange-100 text-orange-700',
  日記: 'bg-green-100 text-green-700',
  その他: 'bg-gray-100 text-gray-600',
}

const filters = ['すべて', '映画', '小説', '音楽', '日記', 'その他'] as const

function getGenre(w: Word): string {
  return w.genre ?? 'その他'
}

function getSourceTitle(w: Word): string {
  return w.source_title ?? ''
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

const PAGE_SIZE = 15

export default function WordsList({ words }: { words: Word[] }) {
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]>('すべて')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const [page, setPage] = useState(1)

  // テストモード
  const [mode, setMode] = useState<'list' | 'test'>('list')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [answered, setAnswered] = useState(0)

  const q = searchQuery.toLowerCase()
  const filteredWords = words
    .filter((w) => activeFilter === 'すべて' || getGenre(w) === activeFilter)
    .filter((w) => !q || w.word.toLowerCase().includes(q) || w.description.toLowerCase().includes(q))
  const totalPages = Math.max(1, Math.ceil(filteredWords.length / PAGE_SIZE))
  const pagedWords = filteredWords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const testWords = words.slice(0, 10)
  const currentWord = testWords[questionIndex]

  function handleAnswer(isCorrect: boolean) {
    setAnswered(a => a + 1)
    if (isCorrect) setCorrect(c => c + 1)
    if (questionIndex < testWords.length - 1) {
      setQuestionIndex(i => i + 1)
      setShowAnswer(false)
    }
  }

  return (
    <>
      {/* 検索・フィルター・切り替え */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="語彙・意味で検索..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
          className="w-40 sm:w-56 px-4 py-2 rounded-lg border border-black/10 bg-surface text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex gap-2">
            {filters.map((f) => (
              <button key={f} onClick={() => { setActiveFilter(f); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                  activeFilter === f ? 'bg-primary text-white' : 'bg-surface border border-black/10 text-foreground hover:bg-black/5'
                }`}>{f}</button>
            ))}
          </div>
          <div className="flex gap-1 bg-surface border border-black/10 rounded-lg p-0.5">
            {(['list', 'test'] as const).map((m) => (
              <button key={m}
                onClick={() => { setMode(m); setQuestionIndex(0); setShowAnswer(false); setCorrect(0); setAnswered(0) }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition cursor-pointer ${
                  mode === m ? 'bg-primary text-white' : 'text-text-secondary hover:text-foreground'
                }`}>
                {m === 'list' ? '一覧' : 'テスト'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 一覧モード */}
      {mode === 'list' && (
        <>
          {filteredWords.length === 0 ? (
            <p className="text-text-secondary text-sm text-center py-20">{q ? '検索結果がありません' : 'ワードがまだありません'}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {pagedWords.map((w) => {
                const genre = getGenre(w)
                return (
                  <div key={w.id} onClick={() => setSelectedWord(w)}
                    className="bg-surface rounded-xl border border-black/5 p-4 flex flex-col hover:shadow-md transition cursor-pointer h-44">
                    <p className="text-base font-bold text-foreground mb-1">{w.word}</p>
                    <p className="text-xs text-text-secondary leading-relaxed flex-1 overflow-hidden line-clamp-3">{w.description}</p>
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${genreColor[genre] ?? 'bg-gray-100 text-gray-600'}`}>{genre}</span>
                      <span className="text-xs text-text-secondary truncate">{getSourceTitle(w)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition cursor-pointer bg-surface border border-black/10 text-foreground ${page === 1 ? 'opacity-30 cursor-default' : 'hover:bg-black/5'}`}>«</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition cursor-pointer ${
                    page === p ? 'bg-primary text-white' : 'bg-surface border border-black/10 text-foreground hover:bg-black/5'
                  }`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition cursor-pointer bg-surface border border-black/10 text-foreground ${page === totalPages ? 'opacity-30 cursor-default' : 'hover:bg-black/5'}`}>»</button>
            </div>
          )}
        </>
      )}

      {/* テストモード */}
      {mode === 'test' && currentWord && (
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm text-text-secondary whitespace-nowrap">問題 {questionIndex + 1} / {testWords.length}</span>
            <div className="flex-1 h-2 bg-black/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((questionIndex + 1) / testWords.length) * 100}%` }} />
            </div>
            <span className="text-sm text-text-secondary whitespace-nowrap">正解 {correct} / {answered}</span>
          </div>
          <div className="bg-surface rounded-2xl border border-black/5 p-10 text-center mb-4">
            <p className="text-xs text-text-secondary mb-4">この語彙の意味は？</p>
            <p className="text-4xl font-bold text-foreground mb-4">{currentWord.word}</p>
            <p className="text-xs text-text-secondary mb-8">
              ヒント：{getGenre(currentWord)}「{getSourceTitle(currentWord)}」から
            </p>
            {!showAnswer && (
              <button onClick={() => setShowAnswer(true)}
                className="px-6 py-2 rounded-lg border border-black/10 bg-background hover:bg-black/5 text-sm font-medium text-foreground transition cursor-pointer">
                答えを見る
              </button>
            )}
          </div>
          {showAnswer && (
            <>
              <div className="bg-surface rounded-2xl border border-black/5 px-8 py-5 text-center mb-6 max-h-48 overflow-y-auto">
                <p className="text-sm text-foreground whitespace-pre-line">{currentWord.description}</p>
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={() => handleAnswer(true)}
                  className="px-10 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition cursor-pointer">正解</button>
                <button onClick={() => handleAnswer(false)}
                  className="px-10 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 font-medium transition cursor-pointer">不正解</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 詳細モーダル */}
      {selectedWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          onClick={() => setSelectedWord(null)}>
          <div className="bg-surface rounded-2xl border border-black/5 shadow-xl w-full max-w-lg mx-4 max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between px-8 pt-8 pb-3 flex-shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${genreColor[getGenre(selectedWord)] ?? 'bg-gray-100 text-gray-600'}`}>
                {getGenre(selectedWord)}
              </span>
              <button onClick={() => setSelectedWord(null)} className="text-text-secondary hover:text-foreground text-lg leading-none cursor-pointer">✕</button>
            </div>
            <p className="text-3xl font-bold text-foreground px-8 pb-3 flex-shrink-0">{selectedWord.word}</p>
            <div className="overflow-y-auto px-8 flex-1">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line pb-4">{selectedWord.description}</p>
            </div>
            <div className="border-t border-black/5 px-8 py-4 flex items-center justify-between flex-shrink-0">
              <p className="text-xs text-text-secondary">「{getSourceTitle(selectedWord)}」から</p>
              <div className="flex items-center gap-3">
                <p className="text-xs text-text-secondary">{formatDate(selectedWord.created_at)}</p>
                <button
                  onClick={async () => { if (!confirm('削除しますか？')) return; await deleteWord(selectedWord.id); setSelectedWord(null); location.reload() }}
                  className="text-xs text-red-400 hover:text-red-600 transition cursor-pointer">削除</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
