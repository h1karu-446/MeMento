'use client'

import { useState } from 'react'
import Link from 'next/link'

const words = [
  { id: '1',  word: 'モラトリアム', description: '「支払猶予」「一時停止」を意味する言葉。心理学において「大人としての社会的責任を猶予された準備期間（青年期）」。自己同一性（アイデンティティ）を確立するための、人生における猶予期間として使われます。', genre: '小説', sourceTitle: 'ノルウェイの森',   date: '3月27日' },
  { id: '2',  word: '逡巡',        description: 'ためらって決断できないこと。',             genre: '映画', sourceTitle: 'ショーシャンク...', date: '4月9日'  },
  { id: '3',  word: '諦観',        description: 'あきらめの境地に達した心境。',             genre: '小説', sourceTitle: '人間失格',          date: '4月8日'  },
  { id: '4',  word: '憂愁',        description: 'もの悲しく沈んだ気持ち。',                 genre: '日記', sourceTitle: '映画を観て感じ...', date: '4月7日'  },
  { id: '5',  word: '冥利',        description: 'その立場にいることの幸福・恩恵。',         genre: '小説', sourceTitle: 'ノルウェイの森',    date: '4月5日'  },
  { id: '6',  word: '慟哭',        description: '激しく泣き叫ぶこと。',                     genre: '日記', sourceTitle: '週末の散歩',        date: '4月3日'  },
  { id: '7',  word: '儚い',        description: '消えやすくはかない様子。',                 genre: '音楽', sourceTitle: 'Kind of Blue',      date: '4月4日'  },
  { id: '8',  word: '憐憫',        description: 'いつくしみあわれむ心。',                   genre: '日記', sourceTitle: '今日の振り返り',    date: '4月3日'  },
  { id: '9',  word: '邂逅',        description: '思いがけなく出会うこと。',                 genre: '映画', sourceTitle: '2001年宇宙の旅',    date: '4月2日'  },
  { id: '10', word: '矜持',        description: '自分の能力への誇りと自信。',               genre: '映画', sourceTitle: 'ゴッドファーザー',  date: '4月1日'  },
  { id: '11', word: '哀愁',        description: '何となくもの悲しい感情。',                 genre: '日記', sourceTitle: '春の散歩',          date: '3月31日' },
  { id: '12', word: '蒼然',        description: '青みがかって薄暗い様子。',                 genre: '映画', sourceTitle: 'タクシードライ...', date: '3月30日' },
  { id: '13', word: '幽玄',        description: '奥深く優美な趣のあること。',               genre: '音楽', sourceTitle: 'Abbey Road',        date: '3月28日' },
  { id: '14', word: '憧憬',        description: '憧れ慕いしたうこと。',                     genre: '小説', sourceTitle: 'ノルウェイの森',    date: '3月27日' },
  { id: '15', word: '刹那',        description: '極めて短い時間のこと。仏教用語。',         genre: '日記', sourceTitle: '今日の振り返り',    date: '4月10日' },
  { id: '16', word: '寂寥',        description: 'ひっそりとさびしい感じ。',                 genre: '小説', sourceTitle: '人間失格',          date: '3月25日' },
  { id: '17', word: '逡巡',        description: '前後にためらい迷うこと。',                 genre: '日記', sourceTitle: '週末の記録',        date: '3月24日' },
  { id: '18', word: '無常',        description: 'この世の万物は常に変化し、永遠に同じ状態を保てないこと。', genre: '小説', sourceTitle: '人間失格', date: '3月23日' },
  { id: '19', word: '慈悲',        description: 'いつくしみとあわれみの心。',               genre: '映画', sourceTitle: 'ゴッドファーザー',  date: '3月22日' },
  { id: '20', word: '恬淡',        description: '物事にこだわらず、あっさりしている様子。', genre: '音楽', sourceTitle: 'Kind of Blue',      date: '3月21日' },
  { id: '21', word: '陶冶',        description: '人の性質や能力を鍛え磨くこと。',           genre: '日記', sourceTitle: '朝の記録',          date: '3月20日' },
  { id: '22', word: '悲哀',        description: '悲しみとうれい。かなしさ。',               genre: '映画', sourceTitle: 'ショーシャンク...', date: '3月19日' },
  { id: '23', word: '郷愁',        description: '故郷を懐かしく思う気持ち。ノスタルジア。', genre: '音楽', sourceTitle: 'Abbey Road',        date: '3月18日' },
  { id: '24', word: '洒脱',        description: 'あかぬけていて品があること。',             genre: '日記', sourceTitle: '週末の散歩',        date: '3月17日' },
  { id: '25', word: '慚愧',        description: '自分の行為を恥じ、心が痛むこと。',         genre: '小説', sourceTitle: 'ノルウェイの森',    date: '3月16日' },
  { id: '26', word: '剽軽',        description: 'ひょうきんでおどけた性格。',               genre: '映画', sourceTitle: '2001年宇宙の旅',    date: '3月15日' },
  { id: '27', word: '懊悩',        description: '悩み苦しむこと。',                         genre: '日記', sourceTitle: '深夜の思索',        date: '3月14日' },
  { id: '28', word: '蒙昧',        description: '知識や道理に暗いこと。',                   genre: '小説', sourceTitle: '人間失格',          date: '3月13日' },
  { id: '29', word: '凛然',        description: '態度や雰囲気がきりっとしている様子。',     genre: '映画', sourceTitle: 'ゴッドファーザー',  date: '3月12日' },
  { id: '30', word: '朦朧',        description: 'ぼんやりとかすんでいる様子。',             genre: '音楽', sourceTitle: 'Kind of Blue',      date: '3月11日' },
  { id: '31', word: '溌剌',        description: '元気いっぱいな様子',             genre: 'その他',       date: '3月11日' },
]

const genreColor: Record<string, string> = {
  映画: 'bg-yellow-100 text-yellow-700',
  小説: 'bg-blue-100 text-blue-700',
  音楽: 'bg-orange-100 text-orange-700',
  日記: 'bg-green-100 text-green-700',
  その他: 'bg-gray-100 text-gray-600'
}

const filters = ['すべて', '映画', '小説', '音楽', '日記', 'その他'] as const

type Word = typeof words[number]

export default function WordsPage() {
  const [mode, setMode] = useState<'list' | 'test'>('list')
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]>('すべて')
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const [page, setPage] = useState(1)

  const PAGE_SIZE = 15
  const filteredWords = activeFilter === 'すべて' ? words : words.filter(w => w.genre === activeFilter)
  const totalPages = Math.max(1, Math.ceil(filteredWords.length / PAGE_SIZE))
  const pagedWords = filteredWords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const [questionIndex, setQuestionIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [answered, setAnswered] = useState(0)
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
    <div className="p-4 md:p-8 w-full">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">ワード</h1>
        <Link
          href="/words/new"
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition"
        >
          + 新しいワード
        </Link>
      </div>

      {/* 検索・フィルター・切り替え */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="語彙・意味で検索..."
          className="w-40 sm:w-56 px-4 py-2 rounded-lg border border-black/10 bg-surface text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => { setActiveFilter(f); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                  activeFilter === f
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-black/10 text-foreground hover:bg-black/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-surface border border-black/10 rounded-lg p-0.5">
            {(['list', 'test'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setQuestionIndex(0); setShowAnswer(false); setCorrect(0); setAnswered(0) }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition cursor-pointer ${
                  mode === m ? 'bg-primary text-white' : 'text-text-secondary hover:text-foreground'
                }`}
              >
                {m === 'list' ? '一覧' : 'テスト'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mode === 'list' && (
        <>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {pagedWords.map((w) => (
              <div key={w.id} onClick={() => setSelectedWord(w)} className="bg-surface rounded-xl border border-black/5 p-4 flex flex-col hover:shadow-md transition cursor-pointer h-44">
                <p className="text-base font-bold text-foreground mb-1">{w.word}</p>
                <p className="text-xs text-text-secondary leading-relaxed flex-1 overflow-hidden line-clamp-3">{w.description}</p>
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${genreColor[w.genre]}`}>
                    {w.genre}
                  </span>
                  <span className="text-xs text-text-secondary truncate">{w.sourceTitle}</span>
                  <span className="text-xs text-text-secondary ml-auto">{w.date}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== テストモード ===== */}
      {mode === 'test' && (
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm text-text-secondary whitespace-nowrap">問題 {questionIndex + 1} / {testWords.length}</span>
            <div className="flex-1 h-2 bg-black/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${((questionIndex + 1) / testWords.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-text-secondary whitespace-nowrap">正解 {correct} / {answered}</span>
          </div>

          <div className="bg-surface rounded-2xl border border-black/5 p-10 text-center mb-4">
            <p className="text-xs text-text-secondary mb-4">この語彙の意味は？</p>
            <p className="text-4xl font-bold text-foreground mb-4">{currentWord.word}</p>
            <p className="text-xs text-text-secondary mb-8">
              ヒント：{currentWord.genre}「{currentWord.sourceTitle}」から
            </p>
            {!showAnswer && (
              <button
                onClick={() => setShowAnswer(true)}
                className="px-6 py-2 rounded-lg border border-black/10 bg-background hover:bg-black/5 text-sm font-medium text-foreground transition cursor-pointer"
              >
                答えを見る
              </button>
            )}
          </div>

          {/* 答えカード */}
          {showAnswer && (
            <>
              <div className="bg-surface rounded-2xl border border-black/5 px-8 py-5 text-center mb-6 max-h-48 overflow-y-auto">
                <p className="text-sm text-foreground whitespace-pre-line">{currentWord.description}</p>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleAnswer(true)}
                  className="px-10 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition cursor-pointer"
                >
                  正解
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  className="px-10 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 font-medium transition cursor-pointer"
                >
                  不正解
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ページネーション */}
      {mode === 'list' && (
        <div className="flex items-center justify-center gap-1 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition cursor-pointer ${
              page === 1 ? 'bg-surface border border-black/10 text-foreground opacity-30 cursor-default' : 'bg-surface border border-black/10 text-foreground hover:bg-black/5'
            }`}
          >
            «
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition cursor-pointer ${
                page === p ? 'bg-primary text-white' : 'bg-surface border border-black/10 text-foreground hover:bg-black/5'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition cursor-pointer ${
              page === totalPages ? 'bg-surface border border-black/10 text-foreground opacity-30 cursor-default' : 'bg-surface border border-black/10 text-foreground hover:bg-black/5'
            }`}
          >
            »
          </button>
        </div>
      )}

      {/* ワード詳細モーダル */}
      {selectedWord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          onClick={() => setSelectedWord(null)}
        >
          <div
            className="bg-surface rounded-2xl border border-black/5 shadow-xl w-full max-w-lg mx-4 max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="flex items-start justify-between px-8 pt-8 pb-3 flex-shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${genreColor[selectedWord.genre]}`}>
                {selectedWord.genre}
              </span>
              <button
                onClick={() => setSelectedWord(null)}
                className="text-text-secondary hover:text-foreground text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-3xl font-bold text-foreground px-8 pb-3 flex-shrink-0">{selectedWord.word}</p>

            <div className="overflow-y-auto px-8 flex-1">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line pb-4">{selectedWord.description}</p>
            </div>
            <div className="border-t border-black/5 px-8 py-4 flex items-center justify-between flex-shrink-0">
              <p className="text-xs text-text-secondary">「{selectedWord.sourceTitle}」から</p>
              <p className="text-xs text-text-secondary">{selectedWord.date}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
