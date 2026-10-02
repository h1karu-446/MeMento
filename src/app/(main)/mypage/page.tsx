import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MypageClient from './MypageClient'
import { genreBarColor } from '@/lib/genre-colors'

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const dow = now.getDay()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() + (dow === 0 ? -6 : 1 - dow))
  weekStart.setHours(0, 0, 0, 0)

  const { data: stats, error: statsError } = await supabase.rpc('get_mypage_stats', {
    month_start: monthStart,
    week_start: weekStart.toISOString(),
  })
  if (statsError || !stats) throw new Error('統計の取得に失敗しました', { cause: statsError })
  const {
    reviewTotal, reviewMonth, diaryTotal, diaryMonth, wordTotal, wordMonth,
    movies, novels, music, weekReviews, weekDiaries,
  } = stats as {
    reviewTotal: number; reviewMonth: number; diaryTotal: number; diaryMonth: number
    wordTotal: number; wordMonth: number; movies: number; novels: number; music: number
    weekReviews: { created_at: string }[]; weekDiaries: { created_at: string }[]
  }
  const genres = [
    { label: '映画', count: movies ?? 0, color: genreBarColor['映画'] },
    { label: '小説', count: novels ?? 0, color: genreBarColor['小説'] },
    { label: '音楽', count: music ?? 0, color: genreBarColor['音楽'] },
    { label: '日記', count: diaryTotal ?? 0, color: 'bg-green-400 dark:bg-green-600' },
  ]

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
  const isDemo = !!process.env.DEMO_USER_EMAIL && email === process.env.DEMO_USER_EMAIL

  return (
    <MypageClient
      email={email}
      displayName={displayName}
      initials={initials}
      isDemo={isDemo}
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
