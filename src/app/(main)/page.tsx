import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'
import type { Recommendation } from '@/lib/ai-actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 今日のワード用
  const { data: words } = await supabase
    .from('words')
    .select('id, word, description, genre, source_title, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  // 過去の記録用
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, title, genre, rate, impressions, created_at')
    .order('created_at', { ascending: false })
    .limit(30)

  const { data: diaries } = await supabase
    .from('diaries')
    .select('id, title, body, language, created_at')
    .order('created_at', { ascending: false })
    .limit(30)

  // 今週の記録（月曜日起点）
  const now = new Date()
  const dow = now.getDay()
  const mondayOffset = dow === 0 ? -6 : 1 - dow
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() + mondayOffset)
  weekStart.setHours(0, 0, 0, 0)

  const { data: weekReviews } = await supabase
    .from('reviews')
    .select('created_at')
    .gte('created_at', weekStart.toISOString())

  const { data: weekDiaries } = await supabase
    .from('diaries')
    .select('created_at')
    .gte('created_at', weekStart.toISOString())

  // 記録した曜日を集計（0=月 〜 6=日）
  const recordedDays = new Set<number>()
  ;[...(weekReviews ?? []), ...(weekDiaries ?? [])].forEach((r) => {
    const d = new Date(r.created_at)
    const idx = d.getDay() === 0 ? 6 : d.getDay() - 1
    recordedDays.add(idx)
  })
  const weekActivity = [0, 1, 2, 3, 4, 5, 6].map((i) => recordedDays.has(i))

  // 連続記録日数（今日から遡る）
  const todayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1
  let streak = 0
  for (let i = todayIdx; i >= 0; i--) {
    if (weekActivity[i]) streak++
    else break
  }

  // AIおすすめキャッシュを取得
  const { data: cachedRec } = await supabase
    .from('ai_recommendations')
    .select('content, generated_at')
    .eq('user_id', user?.id ?? '')
    .single()

  return (
    <div className="p-4 md:p-8 w-full">
      <DashboardClient
        words={words ?? []}
        reviews={reviews ?? []}
        diaries={diaries ?? []}
        weekActivity={weekActivity}
        streak={streak}
        userId={user?.id ?? ''}
        initialRecommendations={(cachedRec?.content ?? null) as Recommendation[] | null}
        initialGeneratedAt={cachedRec?.generated_at ?? null}
      />
    </div>
  )
}
