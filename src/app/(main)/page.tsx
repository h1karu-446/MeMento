import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
import type { Recommendation } from '@/lib/ai-actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims.sub) redirect('/login')
  const userId = data.claims.sub

  // 今週の記録（月曜日起点）
  const now = new Date()
  const dow = now.getDay()
  const mondayOffset = dow === 0 ? -6 : 1 - dow
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() + mondayOffset)
  weekStart.setHours(0, 0, 0, 0)

  const [
    { data: words, error: wordsError }, { data: reviews, error: reviewsError },
    { data: diaries, error: diariesError }, { data: weekReviews, error: weekReviewsError },
    { data: weekDiaries, error: weekDiariesError }, { data: cachedRec, error: recError },
  ] = await Promise.all([
    supabase.from('words').select('id, word, description, example, genre, source_title, created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('reviews').select('id, title, genre, rate, impressions, created_at').order('created_at', { ascending: false }).limit(30),
    supabase.from('diaries').select('id, title, body, language, created_at').order('created_at', { ascending: false }).limit(30),
    supabase.from('reviews').select('created_at').gte('created_at', weekStart.toISOString()),
    supabase.from('diaries').select('created_at').gte('created_at', weekStart.toISOString()),
    supabase.from('ai_recommendations').select('content, generated_at').eq('user_id', userId).maybeSingle(),
  ])
  const queryError = wordsError ?? reviewsError ?? diariesError ?? weekReviewsError ?? weekDiariesError ?? recError
  if (queryError) throw new Error('ダッシュボードの取得に失敗しました', { cause: queryError })

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

  return (
    <div className="p-4 md:p-8 w-full">
      <DashboardClient
        words={words ?? []}
        reviews={reviews ?? []}
        diaries={diaries ?? []}
        weekActivity={weekActivity}
        streak={streak}
        userId={userId}
        initialRecommendations={(cachedRec?.content ?? null) as Recommendation[] | null}
        initialGeneratedAt={cachedRec?.generated_at ?? null}
      />
    </div>
  )
}
