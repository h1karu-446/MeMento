import Link from 'next/link'
import { CaseSensitive, Star, BookOpen } from 'lucide-react'

// スタブデータ（後でSupabaseから取得）
const todayWord = {
  word: '逡巡',
  description: 'ためらって決断できないこと。前後に迷いぐずぐずすること。',
  source: 'ショーシャンクの空に',
}

const pastRecord = {
  id: '1',
  genre: '映画',
  title: 'ショーシャンクの空に',
  excerpt: '希望を失わないことの大切さを改めて感じた。アンディの静かな強さとレッドとの友情が心に響いた。',
  rate: 5,
  yearsAgo: 1,
}

const weeklyStreak = {
  days: ['月', '火', '水', '木', '金', '土', '日'],
  recorded: [true, true, true, true, true, true, false],
  streak: 6,
}

const aiRecommendations = [
  { id: '1', genre: '映画', genreColor: 'bg-yellow-100 text-yellow-700', title: 'グリーンブック', reason: 'ショーシャンクを見た方に' },
  { id: '2', genre: '小説', genreColor: 'bg-blue-100 text-blue-700', title: '夜と霧', reason: '人間の強さを感じたい方に' },
  { id: '3', genre: '音楽', genreColor: 'bg-orange-100 text-orange-700', title: 'A Love Supreme', reason: 'Kind of Blueが好きな方に' },
  { id: '4', genre: '映画', genreColor: 'bg-yellow-100 text-yellow-700', title: 'パリ、テキサス', reason: '静かな映像美が好きな方に' },
  { id: '5', genre: '小説', genreColor: 'bg-blue-100 text-blue-700', title: 'ノルウェイの森', reason: '孤独と再生を感じたい方に' },
]

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-8 w-full">

      <div className="flex items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ダッシュボード</h1>
          <p className="text-text-secondary text-sm mt-1">こんにちは、今日も記録しよう</p>
        </div>
        <div className='flex gap-x-3'>
          <Link
            href="/reviews/new"
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition"
          >
            <div className='flex gap-x-1'>
              レビューを書く
              <Star size={20}/>
            </div>
          </Link>
          <Link
            href="/diaries/new"
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition"
          >
            <div className='flex gap-x-1'>
              日記をつける
              <BookOpen size={20}/>
            </div>
          </Link>
          <Link
            href="/words/new"
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition"
          >
            <div className='flex gap-x-1'>
              ワードを記録する
              <CaseSensitive size={20}/>
            </div>
          </Link>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface rounded-xl p-5 border border-black/5">
          <p className="text-xs font-medium text-text-secondary mb-3">今日のワード</p>
          <p className="text-2xl font-bold text-foreground mb-2">{todayWord.word}</p>
          <p className="text-sm text-text-secondary leading-relaxed mb-4">{todayWord.description}</p>
          <p className="text-xs text-text-secondary">{todayWord.source}</p>
        </div>

        <div className="bg-surface rounded-xl p-5 border border-black/5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-text-secondary">過去の記録</p>
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {pastRecord.yearsAgo}年前の今日
            </span>
          </div>
          <div className="flex gap-3">
            <div className="w-12 h-16 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center">
              <span className="text-primary text-xs">{pastRecord.genre}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground mb-1">{pastRecord.title}</p>
              <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">{pastRecord.excerpt}</p>
              <p className="text-yellow-500 text-xs mt-2">{'★'.repeat(pastRecord.rate)}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-5 border border-black/5">
          <p className="text-xs font-medium text-text-secondary mb-3">今週の記録</p>
          <div className="flex gap-1 mb-3">
            {weeklyStreak.days.map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`w-full aspect-square rounded-md flex items-center justify-center text-xs font-medium ${
                    weeklyStreak.recorded[i]
                      ? 'bg-primary text-white'
                      : 'bg-black/5 text-text-secondary'
                  }`}
                >
                  {day}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm font-semibold text-foreground">
            {weeklyStreak.streak}日連続記録中
          </p>
        </div>

      </div>

      <div className="bg-surface rounded-xl p-5 border border-black/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-sm bg-accent" />
          <p className="text-sm font-semibold text-foreground">AIによるおすすめ</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {aiRecommendations.map((item) => (
            <div key={item.id} className="cursor-pointer group">
              <div className="w-full aspect-[3/4] rounded-lg bg-primary/10 mb-2 group-hover:bg-primary/20 transition" />
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.genreColor}`}>
                {item.genre}
              </span>
              <p className="text-sm font-medium text-foreground mt-1 leading-tight">{item.title}</p>
              <p className="text-xs text-text-secondary mt-0.5">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
