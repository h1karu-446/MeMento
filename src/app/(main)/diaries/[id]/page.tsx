import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const diary = {
  id: '1',
  title: '今日の振り返り',
  body: '今日はいつもより少し早く起きて、静かな朝の時間を過ごした。窓を開けると清らしい風が入ってきて、なんとなく気分も軽くなった。午前中は大学の課題に取り組み、人間の強靭さと生きる意味を考えさせてくれた。昼食は普通のものを食べた。午後は全て外で過ごした。\n\n特別なことはなかったけれど、こういう穏やかな日も悪くないと思う。夜は軽く復習をしてからゆっくり過ごし、明日に向けて早めに休もうと思う。',
  language: 'ja',
  date: '2024年4月10日',
  words: [
    { id: '1', word: '刹那', description: '極めて短い時間のこと' },
    { id: '2', word: '逡巡', description: 'ためらって決断できないこと' },
    { id: '3', word: '諦観', description: 'あきらめの境地に達した心境' },
    { id: '4', word: '貴刹', description: 'その立場にいることの手柄・恩恵' },
  ],
}

export default function DiaryDetailPage() {
  return (
    <div className="p-4 md:p-8 w-full">

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/diaries" className="text-text-secondary hover:text-foreground transition">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-foreground">ダイアリー詳細</h1>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg border border-black/10 bg-surface text-sm font-medium hover:bg-black/5 transition cursor-pointer">
            編集する
          </button>
          <button className="px-4 py-2 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition cursor-pointer">
            削除する
          </button>
        </div>
      </div>

      {/* タイトルカード（全幅） */}
      <div className="bg-surface rounded-xl p-6 border border-black/5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-28 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center">
            <span className="text-text-secondary text-xs">素材・サムネイル</span>
          </div>
          <div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              diary.language === 'ja' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
            }`}>
              {diary.language === 'ja' ? '日本語' : 'English'}
            </span>
            <h1 className="text-xl font-bold text-foreground mt-2 mb-1">{diary.title}</h1>
            <p className="text-xs text-text-secondary">{diary.date}</p>
          </div>
        </div>
      </div>

      {/* 本文 + ワード */}
      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-surface rounded-xl p-6 border border-black/5">
          <h2 className="text-sm font-semibold text-foreground mb-4">本文</h2>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{diary.body}</p>
        </div>

        <div className="lg:col-span-2 bg-surface rounded-xl p-5 border border-black/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">ワード</h2>
            <button className="text-xs text-primary hover:underline cursor-pointer">+ 追加</button>
          </div>
          <div className="space-y-3">
            {diary.words.map((w) => (
              <div key={w.id}>
                <p className="text-sm font-medium text-foreground">{w.word}</p>
                <p className="text-xs text-text-secondary mt-0.5">{w.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
