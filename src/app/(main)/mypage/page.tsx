import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MypageClient from './MypageClient'

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // 統計（総数・今月数）
  const [
    { count: reviewTotal },
    { count: reviewMonth },
    { count: diaryTotal },
    { count: diaryMonth },
    { count: wordTotal },
    { count: wordMonth },
  ] = await Promise.all([
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
    supabase.from('diaries').select('*', { count: 'exact', head: true }),
    supabase.from('diaries').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
    supabase.from('words').select('*', { count: 'exact', head: true }),
    supabase.from('words').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
  ])

  // ジャンル内訳
  const { data: reviews } = await supabase.from('reviews').select('genre')
  const { count: diaryCount } = await supabase.from('diaries').select('*', { count: 'exact', head: true })

  const genreMap: Record<string, number> = { 映画: 0, 小説: 0, 音楽: 0 }
  reviews?.forEach((r) => { if (r.genre in genreMap) genreMap[r.genre]++ })

  const genres = [
    { label: '映画', count: genreMap['映画'], color: 'bg-yellow-400' },
    { label: '小説', count: genreMap['小説'], color: 'bg-blue-400' },
    { label: '音楽', count: genreMap['音楽'], color: 'bg-orange-400' },
    { label: '日記', count: diaryCount ?? 0,  color: 'bg-green-400' },
  ]

  // 今週の記録・連続日数（ダッシュボードと同じ計算）
  const dow = now.getDay()
  const mondayOffset = dow === 0 ? -6 : 1 - dow
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() + mondayOffset)
  weekStart.setHours(0, 0, 0, 0)

  const [{ data: weekReviews }, { data: weekDiaries }] = await Promise.all([
    supabase.from('reviews').select('created_at').gte('created_at', weekStart.toISOString()),
    supabase.from('diaries').select('created_at').gte('created_at', weekStart.toISOString()),
  ])

  const recordedDays = new Set<number>()
  ;[...(weekReviews ?? []), ...(weekDiaries ?? [])].forEach((r) => {
    const d = new Date(r.created_at)
    recordedDays.add(d.getDay() === 0 ? 6 : d.getDay() - 1)
  })
  const weekActivity = [0, 1, 2, 3, 4, 5, 6].map((i) => recordedDays.has(i))

  const todayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1
  let streak = 0
  for (let i = todayIdx; i >= 0; i--) {
    if (weekActivity[i]) streak++
    else break
  }

  // ユーザー表示名・イニシャル
  const email = user.email ?? ''
  const displayName = user.user_metadata?.full_name ?? email.split('@')[0]
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <MypageClient
      email={email}
      displayName={displayName}
      initials={initials}
      stats={{
        reviewTotal: reviewTotal ?? 0,
        reviewMonth: reviewMonth ?? 0,
        diaryTotal: diaryTotal ?? 0,
        diaryMonth: diaryMonth ?? 0,
        wordTotal: wordTotal ?? 0,
        wordMonth: wordMonth ?? 0,
        streak,
      }}
      genres={genres}
      weekActivity={weekActivity}
    />
  )
}
