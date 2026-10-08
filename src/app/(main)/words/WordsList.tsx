'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'
import { useListNavigation } from '@/components/useListNavigation'
import { ListPagination } from '@/components/ListPagination'
import type { ListState } from '@/lib/lists/query'
import { deleteWord, loadQuizWords } from './actions'
import { genreColor } from '@/lib/genre-colors'
import { formatDate } from '@/lib/utils'

type Word = {
  id: number
  word: string
  description: string
  example: string | null
  created_at: string
  genre: string | null
  source_title: string | null
}


const filters = ['すべて', '映画', '小説', '音楽', '日記', '英語学習', 'その他'] as const

const SET_SIZE = 10

function getGenre(w: Word): string { return w.genre ?? 'その他' }
function getSourceTitle(w: Word): string { return w.source_title ?? '' }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}


export default function WordsList({ words, state }: { words: Word[]; state: ListState }) {
  const { searchQuery, setSearchQuery, activeFilter, setActiveFilter, page, totalPages, setPage, isPending } = useListNavigation(state)
  const router = useRouter()
  const toast = useToast()
  const [quizLoading, setQuizLoading] = useState(false)
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const [mode, setMode] = useState<'list' | 'test'>('list')

  // テストモード
  const [shuffledAll, setShuffledAll] = useState<Word[]>([])  // フィルター結果をシャッフルした全件
  const [setIndex, setSetIndex] = useState(0)                  // 現在のセット番号（0始まり）
  const [testWords, setTestWords] = useState<Word[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [wrongWords, setWrongWords] = useState<Word[]>([])
  const [finished, setFinished] = useState(false)

  const q = state.q
  const filteredWords = words
  const pagedWords = words
  const currentWord = testWords[questionIndex]
  const totalSets = Math.ceil(shuffledAll.length / SET_SIZE)
  const hasNextSet = (setIndex + 1) < totalSets

  function beginSet(all: Word[], idx: number, currentTestWords: Word[]) {
    setTestWords(currentTestWords)
    setQuestionIndex(0)
    setShowAnswer(false)
    setCorrect(0)
    setAnswered(0)
    setWrongWords([])
    setFinished(false)
    setShuffledAll(all)
    setSetIndex(idx)
    setMode('test')
  }

  async function startTest() {
    setQuizLoading(true)
    try {
      const all = shuffle(await loadQuizWords({ q: state.q, filter: state.filter }) as unknown as Word[])
      if (!all.length) { toast('出題できるワードがありません', 'info'); return }
      beginSet(all, 0, all.slice(0, SET_SIZE))
    } catch {
      toast('テスト用ワードの取得に失敗しました')
    } finally {
      setQuizLoading(false)
    }
  }

  function handleAnswer(isCorrect: boolean) {
    if (isCorrect) setCorrect(c => c + 1)
    else setWrongWords(prev => [...prev, currentWord])
    setAnswered(a => a + 1)

    if (questionIndex < testWords.length - 1) {
      setQuestionIndex(i => i + 1)
      setShowAnswer(false)
    } else {
      setFinished(true)
    }
  }

  function retryWrong() {
    beginSet(shuffledAll, setIndex, shuffle(wrongWords))
  }

  function goNextSet() {
    const nextIdx = setIndex + 1
    const next = shuffledAll.slice(nextIdx * SET_SIZE, (nextIdx + 1) * SET_SIZE)
    beginSet(shuffledAll, nextIdx, next)
  }

  function exitTest() {
    setMode('list')
    setFinished(false)
  }

  return (
    <div aria-busy={isPending || quizLoading}>
      {/* 検索・フィルター（テスト中は非表示） */}
      {mode === 'list' && (
        <div className="flex items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="語彙・意味で検索..."
            value={searchQuery}
          maxLength={200}
            onChange={(e) => { setSearchQuery(e.target.value) }}
            className="w-40 sm:w-56 px-4 py-2 rounded-lg border border-black/10 bg-surface text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex gap-2">
              {filters.map((f) => (
                <button key={f} onClick={() => { setActiveFilter(f) }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                    activeFilter === f ? 'bg-primary text-white' : 'bg-surface border border-black/10 text-foreground hover:bg-black/5'
                  }`}>{f}</button>
              ))}
            </div>
            <button
              onClick={startTest}
              disabled={filteredWords.length === 0 || quizLoading || isPending || searchQuery !== state.q}
              className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition cursor-pointer disabled:opacity-40"
            >
              {quizLoading ? '読み込み中…' : 'テスト開始'}
            </button>
          </div>
        </div>
      )}

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
          <ListPagination page={page} totalPages={totalPages} setPage={setPage} />
        </>
      )}

      {/* テストモード */}
      {mode === 'test' && (
        <div className="max-w-3xl mx-auto">

          {/* 結果画面 */}
          {finished ? (
            <div className="flex flex-col items-center text-center py-12">
              <p className="text-xs text-text-secondary mb-2">セット {setIndex + 1} / {totalSets} 結果</p>
              <p className="text-5xl font-bold text-foreground mb-2">{correct} / {testWords.length}</p>
              <p className="text-sm text-text-secondary mb-2">正解</p>
              <p className="text-lg font-medium text-primary mb-10">
                {correct === testWords.length ? '満点！完璧です' :
                  correct >= testWords.length * 0.8 ? 'よくできました！' :
                  correct >= testWords.length * 0.5 ? 'もう少し！' : '復習しましょう'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={retryWrong}
                  disabled={wrongWords.length === 0}
                  className="px-6 py-3 rounded-xl bg-red-50 border border-red-200 text-red-500 font-medium hover:bg-red-100 transition cursor-pointer disabled:opacity-30 disabled:cursor-default"
                >
                  間違えた {wrongWords.length} 問だけ再挑戦
                </button>
                <button
                  onClick={goNextSet}
                  disabled={!hasNextSet}
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition cursor-pointer disabled:opacity-30 disabled:cursor-default"
                >
                  次のセットへ ({setIndex + 2} / {totalSets})
                </button>
                <button onClick={exitTest}
                  className="px-6 py-3 rounded-xl border border-black/10 bg-surface text-foreground font-medium hover:bg-black/5 transition cursor-pointer">
                  一覧に戻る
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 進捗バー */}
              <div className="flex items-center gap-4 mb-8">
                <button onClick={exitTest} className="text-text-secondary hover:text-foreground text-xs transition cursor-pointer whitespace-nowrap">✕ 終了</button>
                <div className="flex-1 h-2 bg-black/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(questionIndex / testWords.length) * 100}%` }} />
                </div>
                <span className="text-sm text-text-secondary whitespace-nowrap">{questionIndex + 1} / {testWords.length}</span>
                <span className="text-sm text-text-secondary whitespace-nowrap">正解 {correct} / {answered}</span>
              </div>

              {/* 問題カード */}
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

              {/* 答え */}
              {showAnswer && (
                <>
                  <div className="bg-surface rounded-2xl border border-black/5 px-8 py-5 text-center mb-6 max-h-48 overflow-y-auto">
                    <p className="text-sm text-foreground whitespace-pre-line">{currentWord.description}</p>
                    {currentWord.example && (
                      <p className="text-xs text-text-secondary italic whitespace-pre-line mt-3">{currentWord.example}</p>
                    )}
                  </div>
                  <div className="flex justify-center gap-4">
                    <button onClick={() => handleAnswer(true)}
                      className="px-10 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition cursor-pointer">正解</button>
                    <button onClick={() => handleAnswer(false)}
                      className="px-10 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 font-medium transition cursor-pointer">不正解</button>
                  </div>
                </>
              )}
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
              {selectedWord.example && (
                <p className="text-sm text-text-secondary italic leading-relaxed whitespace-pre-line pb-4">{selectedWord.example}</p>
              )}
            </div>
            <div className="border-t border-black/5 px-8 py-4 flex items-center justify-between flex-shrink-0">
              <p className="text-xs text-text-secondary">「{getSourceTitle(selectedWord)}」から</p>
              <div className="flex items-center gap-3">
                <p className="text-xs text-text-secondary">{formatDate(selectedWord.created_at)}</p>
                <button
                  onClick={async () => { if (!confirm('削除しますか？')) return; await deleteWord(selectedWord.id); setSelectedWord(null); router.refresh() }}
                  className="text-xs text-red-400 hover:text-red-600 transition cursor-pointer">削除</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
