import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const review = {
  id: '1',
  genre: '映画',
  title: 'ショーシャンクの空に',
  rate: 5,
  date: '2024年4月10日',
  impressions: '希望を失わないことの大切さを改めて感じた作品。アンディの静かな強さとレッドとの友情が心に響いた。\n\n「希望は良いものだ」というセリフが特に印象的だった。自由とは何か、希望とは何かを問いかけてくる映画。視聴後でも新たな発見がある。',
  words: [
    { id: '1', word: '刹那', description: '極めて短い時間のこと' },
    { id: '2', word: '逡巡', description: 'ためらって決断できないこと' },
    { id: '3', word: '諦観', description: 'あきらめの境地に達した心境' },
    { id: '4', word: '貴刹', description: 'その立場にいることの手柄・恩恵' },
  ],
}

const genreColor: Record<string, string> = {
  映画: 'bg-yellow-100 text-yellow-700',
  小説: 'bg-blue-100 text-blue-700',
  音楽: 'bg-orange-100 text-orange-700',
}

export default function ReviewDetailPage() {
  return (
    <div className="p-4 md:p-8 w-full">

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/reviews" className="flex items-center gap-1 text-sm text-text-secondary hover:text-foreground transition">
          <ChevronLeft size={16} />
          レビュー一覧
        </Link>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg border border-black/10 bg-surface text-sm font-medium hover:bg-black/5 transition cursor-pointer">
            編集する
          </button>
          <button className="px-4 py-2 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition cursor-pointer">
            削除する
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 min-w-0">
          <div className="bg-surface rounded-xl p-6 border border-black/5 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-28 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center">
                <span className="text-text-secondary text-xs">素材</span>
              </div>
              <div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${genreColor[review.genre]}`}>
                  {review.genre}
                </span>
                <h1 className="text-xl font-bold text-foreground mt-2 mb-1">{review.title}</h1>
                <p className="text-yellow-500 text-sm mb-1">{'★'.repeat(review.rate)}{' '}<span className="text-text-secondary">{review.rate}.0</span></p>
                <p className="text-xs text-text-secondary">{review.date}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-black/5">
            <h2 className="text-sm font-semibold text-foreground mb-4">感想</h2>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{review.impressions}</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-surface rounded-xl p-5 border border-black/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">ワード</h2>
              <button className="text-xs text-primary hover:underline cursor-pointer">+ 追加</button>
            </div>
            <div className="space-y-3">
              {review.words.map((w) => (
                <div key={w.id}>
                  <p className="text-sm font-medium text-foreground">{w.word}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{w.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
