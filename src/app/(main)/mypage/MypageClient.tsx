'use client'

import { useState } from 'react'
import { signOut } from './actions'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/components/ThemeProvider'

type Stats = {
  reviewTotal: number
  reviewMonth: number
  diaryTotal: number
  diaryMonth: number
  wordTotal: number
  wordMonth: number
  streak: number
}

type GenreCount = { label: string; count: number; color: string }

const weekDays = ['月', '火', '水', '木', '金', '土', '日']

export default function MypageClient({
  email,
  displayName,
  initials,
  stats,
  genres,
  weekActivity,
}: {
  email: string
  displayName: string
  initials: string
  stats: Stats
  genres: GenreCount[]
  weekActivity: boolean[]
}) {
  const { theme, toggle } = useTheme()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)
  const [nameInput, setNameInput] = useState(displayName)
  const [currentName, setCurrentName] = useState(displayName)
  const [nameSaving, setNameSaving] = useState(false)
  const genreTotal = genres.reduce((sum, g) => sum + g.count, 0)

  async function handleNameChange() {
    if (!nameInput.trim()) return alert('名前を入力してください')
    setNameSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ data: { full_name: nameInput.trim() } })
    setNameSaving(false)
    if (error) return alert('変更に失敗しました: ' + error.message)
    setCurrentName(nameInput.trim())
    setShowNameModal(false)
  }

  async function handlePasswordChange() {
    if (newPassword.length < 6) return alert('パスワードは6文字以上で入力してください')
    if (newPassword !== confirmPassword) return alert('パスワードが一致しません')
    setPasswordSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordSaving(false)
    if (error) return alert('変更に失敗しました: ' + error.message)
    alert('パスワードを変更しました')
    setShowPasswordModal(false)
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="p-4 md:p-8 w-full">
      <h1 className="text-2xl font-bold text-foreground mb-6">マイページ</h1>

      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6 items-start">

        {/* 左：プロフィール＋今週の記録 */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-black/5 p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mb-3">
            {initials}
          </div>
          <p className="text-base font-bold text-foreground">{currentName}</p>
          <p className="text-sm text-text-secondary mb-6">{email}</p>

          <p className="text-xs text-text-secondary mb-3">今週の記録</p>
          <div className="flex gap-1.5 mb-3">
            {weekDays.map((day, i) => (
              <div key={day} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                weekActivity[i] ? 'bg-primary text-white' : 'bg-black/5 text-text-secondary'
              }`}>
                {day}
              </div>
            ))}
          </div>
          <p className="text-xs font-medium text-primary">
            {stats.streak > 0 ? `${stats.streak}日連続記録中` : '連続記録がありません'}
          </p>
        </div>

        {/* 右：統計・ジャンル・設定 */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* 統計 */}
          <div className="bg-surface rounded-xl border border-black/5 p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">統計</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'レビュー',   total: stats.reviewTotal, month: stats.reviewMonth },
                { label: 'ダイアリー', total: stats.diaryTotal,  month: stats.diaryMonth },
                { label: 'ワード',     total: stats.wordTotal,   month: stats.wordMonth },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-xs text-text-secondary mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground">{s.total}</p>
                  <p className="text-xs text-primary mt-0.5">+{s.month} 今月</p>
                </div>
              ))}
            </div>
          </div>

          {/* ジャンル内訳 */}
          <div className="bg-surface rounded-xl border border-black/5 p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">ジャンル内訳</h2>
            {genreTotal === 0 ? (
              <p className="text-sm text-text-secondary">まだ記録がありません</p>
            ) : (
              <div className="space-y-3">
                {genres.map((g) => (
                  <div key={g.label} className="flex items-center gap-3">
                    <p className="text-xs text-text-secondary w-8 flex-shrink-0">{g.label}</p>
                    <div className="flex-1 h-2 bg-black/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${g.color}`}
                        style={{ width: `${(g.count / genreTotal) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-secondary w-4 text-right flex-shrink-0">{g.count}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* アカウント設定 */}
          <div className="bg-surface rounded-xl border border-black/5 p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">アカウント設定</h2>
            <div className="space-y-0 divide-y divide-black/5">
              <div className="flex items-center justify-between py-3 text-sm">
                <span className="text-foreground">アカウント名</span>
                <button
                  onClick={() => { setNameInput(currentName); setShowNameModal(true) }}
                  className="text-text-secondary text-xs hover:text-foreground transition cursor-pointer"
                >
                  {currentName} ›
                </button>
              </div>
              <div className="flex items-center justify-between py-3 text-sm">
                <span className="text-foreground">メールアドレス</span>
                <span className="text-text-secondary text-xs">{email}</span>
              </div>
              <div className="flex items-center justify-between py-3 text-sm">
                <span className="text-foreground">パスワード変更</span>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="text-text-secondary text-xs hover:text-foreground transition cursor-pointer"
                >
                  変更する ›
                </button>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-foreground">テーマ</span>
                <div className="flex gap-1 bg-black/5 rounded-lg p-0.5">
                  {([['light', 'ライト'], ['dark', 'ダーク']] as const).map(([value, label]) => (
                    <button key={value} onClick={() => value !== theme && toggle()}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                        theme === value ? 'bg-surface text-foreground shadow-sm' : 'text-text-secondary hover:text-foreground'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => signOut()}
                className="flex-1 py-2.5 rounded-lg border border-black/10 bg-surface text-sm font-medium text-foreground hover:bg-black/5 transition cursor-pointer"
              >
                ログアウト
              </button>
            </div>
          </div>

        </div>
      </div>
      {/* アカウント名変更モーダル */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          onClick={() => setShowNameModal(false)}>
          <div className="bg-surface rounded-2xl border border-black/5 shadow-xl w-full max-w-sm mx-4 p-8"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <p className="text-base font-bold text-foreground">アカウント名の変更</p>
              <button onClick={() => setShowNameModal(false)} className="text-text-secondary hover:text-foreground cursor-pointer">✕</button>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">新しい名前</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="名前を入力"
                className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-background text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNameModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-black/10 bg-surface text-sm font-medium text-foreground hover:bg-black/5 transition cursor-pointer">
                キャンセル
              </button>
              <button onClick={handleNameChange} disabled={nameSaving}
                className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition cursor-pointer disabled:opacity-50">
                {nameSaving ? '変更中...' : '変更する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* パスワード変更モーダル */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          onClick={() => setShowPasswordModal(false)}>
          <div className="bg-surface rounded-2xl border border-black/5 shadow-xl w-full max-w-sm mx-4 p-8"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <p className="text-base font-bold text-foreground">パスワード変更</p>
              <button onClick={() => setShowPasswordModal(false)} className="text-text-secondary hover:text-foreground cursor-pointer">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">新しいパスワード</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="6文字以上"
                  className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-background text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">確認</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="もう一度入力"
                  className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-background text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPasswordModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-black/10 bg-surface text-sm font-medium text-foreground hover:bg-black/5 transition cursor-pointer">
                キャンセル
              </button>
              <button onClick={handlePasswordChange} disabled={passwordSaving}
                className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition cursor-pointer disabled:opacity-50">
                {passwordSaving ? '変更中...' : '変更する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
