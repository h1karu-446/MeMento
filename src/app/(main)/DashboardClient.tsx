'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RefreshCw, Star, BookOpen, CaseSensitive, Sparkles } from 'lucide-react'
import { deleteWord } from './words/actions'
import { generateRecommendation, type Recommendation } from '@/lib/ai-actions'
import { genreColor } from '@/lib/genre-colors'

type Word = {
  id: number
  word: string
  description: string
  genre: string | null
  source_title: string | null
  created_at: string
}

type Review = {
  id: string
  title: string
  genre: string
  rate: number
  impressions: string
  created_at: string
}

type Diary = {
  id: string
  title: string
  body: string
  language: string
  created_at: string
}

type PastRecord =
  | { type: 'review'; data: Review }
  | { type: 'diary'; data: Diary }
  | { type: 'word'; data: Word & { created_at: string } }

// recGenreColor は genreColor と同じなので共通化
const recGenreColor = genreColor

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function renderStars(rate: number) {
  const full = Math.floor(rate)
  const half = rate % 1 >= 0.5
  return (
    <span className="inline-flex text-yellow-400">
      {'★'.repeat(full)}
      {half && <span>☆</span>}
    </span>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return '今日'
  if (days < 7) return `${days}日前`
  if (days < 30) return `${Math.floor(days / 7)}週間前`
  if (days < 365) return `${Math.floor(days / 30)}ヶ月前`
  return `${Math.floor(days / 365)}年前`
}

function randomIndex(length: number) {
  return Math.floor(Math.random() * length)
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function DashboardClient({
  words,
  reviews,
  diaries,
  weekActivity,
  streak,
  userId,
  initialRecommendations,
  initialGeneratedAt,
}: {
  words: Word[]
  reviews: Review[]
  diaries: Diary[]
  weekActivity: boolean[]
  streak: number
  userId: string
  initialRecommendations: Recommendation[] | null
  initialGeneratedAt: string | null
}) {
  const weekDays = ['月', '火', '水', '木', '金', '土', '日']

  // 今日のワード（全件表示されるまで重複しない）
  const [wordIdx, setWordIdx] = useState(0)
  const [shownIds, setShownIds] = useState<Set<number>>(() => new Set(words.length > 0 ? [words[0].id] : []))
  const todayWord = words[wordIdx]

  function nextWord() {
    const remaining = words.filter(w => !shownIds.has(w.id))
    if (remaining.length === 0) {
      // 全件見た → リセット
      const next = randomIndex(words.length)
      setWordIdx(next)
      setShownIds(new Set([words[next].id]))
    } else {
      const next = remaining[randomIndex(remaining.length)]
      const idx = words.findIndex(w => w.id === next.id)
      setWordIdx(idx)
      setShownIds(prev => new Set([...prev, next.id]))
    }
  }

  // 過去の記録（レビュー＋ダイアリー）
  const allPast: PastRecord[] = [
    ...reviews.map(r => ({ type: 'review' as const, data: r })),
    ...diaries.map(d => ({ type: 'diary' as const, data: d })),
  ]
  const [pastIdx, setPastIdx] = useState(0)
  const [shownPastIds, setShownPastIds] = useState<Set<string>>(() =>
    allPast.length > 0 ? new Set([allPast[0].data.id]) : new Set()
  )
  const pastRecord = allPast[pastIdx]

  function nextPast() {
    const remaining = allPast.filter(r => !shownPastIds.has(r.data.id))
    if (remaining.length === 0) {
      const next = randomIndex(allPast.length)
      setPastIdx(next)
      setShownPastIds(new Set([allPast[next].data.id]))
    } else {
      const next = remaining[randomIndex(remaining.length)]
      const idx = allPast.findIndex(r => r.data.id === next.data.id)
      setPastIdx(idx)
      setShownPastIds(prev => new Set([...prev, next.data.id]))
    }
  }

  // ワード詳細モーダル（過去の記録がwordの場合用、今回はreview/diaryのみだが拡張用に残す）
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)

  // AIおすすめ
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(initialRecommendations)
  const [generatedAt, setGeneratedAt] = useState<string | null>(initialGeneratedAt)
  const [recLoading, setRecLoading] = useState(false)

  async function handleGenerateRecommendation() {
    setRecLoading(true)
    const res = await generateRecommendation({
      reviews: reviews.map(r => ({ title: r.title, genre: r.genre, rate: r.rate })),
      userId,
    })
    setRecLoading(false)
    if (!res.ok) return alert(`生成に失敗しました。\n${res.error}`)
    setRecommendations(res.recommendations)
    setGeneratedAt(new Date().toISOString())
  }

  return (
    <>
      {/* ヘッダー */}
      <div className="flex items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ダッシュボード</h1>
          <p className="text-text-secondary text-sm mt-1">こんにちは、今日も記録しよう</p>
        </div>
        <div className="flex gap-x-3">
          <Link href="/reviews/new" className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition">
            <div className="flex gap-x-1">レビューを書く<Star size={20} /></div>
          </Link>
          <Link href="/diaries/new" className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition">
            <div className="flex gap-x-1">日記をつける<BookOpen size={20} /></div>
          </Link>
          <Link href="/words/new" className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition">
            <div className="flex gap-x-1">ワードを記録する<CaseSensitive size={20} /></div>
          </Link>
        </div>
      </div>

      {/* 3カラム */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* 今日のワード */}
        <div className="bg-surface rounded-xl p-5 border border-black/5 h-48 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-text-secondary">今日のワード</p>
            {words.length > 1 && (
              <button
                onClick={nextWord}
                className="text-text-secondary hover:text-primary transition cursor-pointer"
                title="別のワードを見る"
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>
          {todayWord ? (
            <button onClick={() => setSelectedWord(todayWord)} className="w-full text-left cursor-pointer hover:opacity-80 transition flex flex-col flex-1 overflow-hidden">
              <p className="text-2xl font-bold text-foreground">{todayWord.word}</p>
              <div className="border-t border-black/8 my-2" />
              <p className="text-sm text-text-secondary leading-relaxed line-clamp-2 flex-1">{todayWord.description}</p>
              {todayWord.source_title && (
                <span className="mt-2 self-start text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium truncate max-w-full">
                  {todayWord.source_title}
                </span>
              )}
            </button>
          ) : (
            <p className="text-sm text-text-secondary">ワードがまだありません</p>
          )}
        </div>

        {/* 過去の記録 */}
        <div className="bg-surface rounded-xl p-5 border border-black/5 h-48 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-text-secondary">過去の記録</p>
            <div className="flex items-center gap-2">
              {pastRecord && (
                <>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    pastRecord.type === 'review'
                      ? (genreColor[pastRecord.data.genre] ?? 'bg-gray-100 text-gray-600')
                      : genreColor['日記']
                  }`}>
                    {pastRecord.type === 'review' ? pastRecord.data.genre : '日記'}
                  </span>
                  <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {timeAgo(pastRecord.data.created_at)}
                  </span>
                </>
              )}
              {allPast.length > 1 && (
                <button
                  onClick={nextPast}
                  className="text-text-secondary hover:text-primary transition cursor-pointer"
                  title="別の記録を見る"
                >
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
          </div>
          {pastRecord ? (
            pastRecord.type === 'review' ? (
              <Link href={`/reviews/${pastRecord.data.id}`} className="block hover:opacity-80 transition flex-1 flex flex-col overflow-hidden">
                <div className="flex gap-3 flex-1 overflow-hidden">
                  <div className="w-12 h-16 rounded-lg bg-primary/10 flex-shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                    <p className="text-sm font-semibold text-foreground">{pastRecord.data.title}</p>
                    <div className="border-t border-black/8 my-1.5" />
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 flex-1">{pastRecord.data.impressions}</p>
                    <p className="text-xs mt-1">{renderStars(pastRecord.data.rate)}</p>
                  </div>
                </div>
              </Link>
            ) : pastRecord.type === 'diary' ? (
              <Link href={`/diaries/${pastRecord.data.id}`} className="block hover:opacity-80 transition flex-1 flex flex-col overflow-hidden">
                <div className="flex gap-3 flex-1 overflow-hidden">
                  <div className="w-12 h-16 rounded-lg bg-primary/10 flex-shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                    <p className="text-sm font-semibold text-foreground">{pastRecord.data.title}</p>
                    <div className="border-t border-black/8 my-1.5" />
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 flex-1">{pastRecord.data.body}</p>
                  </div>
                </div>
              </Link>
            ) : (
              <button onClick={() => setSelectedWord(pastRecord.data)} className="w-full text-left hover:opacity-80 transition cursor-pointer">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium mb-2 inline-block ${
                  pastRecord.data.reviews ? genreColor[pastRecord.data.reviews.genre] ?? 'bg-gray-100 text-gray-600'
                  : pastRecord.data.diaries ? genreColor['日記']
                  : 'bg-gray-100 text-gray-600'
                }`}>
                  {pastRecord.data.reviews?.genre ?? (pastRecord.data.diaries ? '日記' : 'その他')}
                </span>
                <p className="text-sm font-semibold text-foreground mb-1">{pastRecord.data.word}</p>
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">{pastRecord.data.description}</p>
              </button>
            )
          ) : (
            <p className="text-sm text-text-secondary">記録がまだありません</p>
          )}
        </div>

        {/* 今週の記録 */}
        <div className="bg-surface rounded-xl p-5 border border-black/5 h-48 flex flex-col overflow-hidden">
          <p className="text-xs font-medium text-text-secondary mb-3">今週の記録</p>
          <div className="flex gap-1 mb-3">
            {weekDays.map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-full aspect-square rounded-md flex items-center justify-center text-xs font-medium ${
                  weekActivity[i] ? 'bg-primary text-white' : 'bg-black/5 text-text-secondary'
                }`}>
                  {day}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm font-semibold text-foreground">
            {streak > 0 ? `${streak}日連続記録中` : 'まだ記録がありません'}
          </p>
        </div>

      </div>

      {/* AIによるおすすめ */}
      <div className="bg-surface rounded-xl p-5 border border-black/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-accent" />
            <p className="text-sm font-semibold text-foreground">AIによるおすすめ</p>
          </div>
          <div className="flex items-center gap-3">
            {generatedAt && (
              <span className="text-xs text-text-secondary">最終更新：{formatDateTime(generatedAt)}</span>
            )}
            <button
              onClick={handleGenerateRecommendation}
              disabled={recLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent/80 text-white text-xs font-medium transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={12} />
              {recLoading ? '生成中...' : recommendations ? '更新する' : 'おすすめを生成'}
            </button>
          </div>
        </div>

        {recommendations ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="bg-background rounded-xl border border-black/5 overflow-hidden flex flex-col">
                <div className="w-full h-32 bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-text-secondary text-xs">サムネイル</span>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium self-start mb-1.5 ${recGenreColor[rec.genre] ?? 'bg-gray-100 text-gray-600'}`}>
                    {rec.genre}
                  </span>
                  <p className="text-sm font-bold text-foreground mb-1">{rec.title}</p>
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 flex-1">{rec.description}</p>
                  <p className="text-xs text-primary mt-2">{rec.reason}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">「おすすめを生成」を押すと、あなたの記録をもとにAIがおすすめ作品を提案します。</p>
        )}
      </div>

      {/* ワード詳細モーダル */}
      {selectedWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          onClick={() => setSelectedWord(null)}>
          <div className="bg-surface rounded-2xl border border-black/5 shadow-xl w-full max-w-lg mx-4 max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between px-8 pt-8 pb-3 flex-shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${genreColor[selectedWord.genre ?? 'その他'] ?? 'bg-gray-100 text-gray-600'}`}>
                {selectedWord.genre ?? 'その他'}
              </span>
              <button onClick={() => setSelectedWord(null)} className="text-text-secondary hover:text-foreground text-lg leading-none cursor-pointer">✕</button>
            </div>
            <p className="text-3xl font-bold text-foreground px-8 pb-3 flex-shrink-0">{selectedWord.word}</p>
            <div className="overflow-y-auto px-8 flex-1">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line pb-4">{selectedWord.description}</p>
            </div>
            <div className="border-t border-black/5 px-8 py-4 flex items-center justify-between flex-shrink-0">
              <p className="text-xs text-text-secondary">「{selectedWord.source_title ?? ''}」から</p>
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
