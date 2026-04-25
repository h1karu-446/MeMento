'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex mt-15 justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">パスワードをリセット</h1>
          <p className="text-sm text-text-secondary mt-2">
            登録済みのメールアドレスにリセットリンクを送信します
          </p>
        </div>

        {sent ? (
          <div className="w-4/5 mx-auto text-center">
            <div className="px-4 py-5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm mb-6">
              <p className="font-medium mb-1">メールを送信しました</p>
              <p className="text-xs">{email} にリセットリンクを送りました。メールをご確認ください。</p>
            </div>
            <Link href="/login" className="text-sm text-primary hover:underline">
              ログイン画面に戻る
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="w-4/5 mx-auto">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                メールアドレス
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-background text-foreground placeholder:text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
              />
            </div>
            <div className="w-4/5 mx-auto">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
              >
                {loading ? <><Loader2 size={14} className="animate-spin" />送信中...</> : 'リセットリンクを送信'}
              </button>
            </div>
            <p className="text-center text-sm text-text-secondary">
              <Link href="/login" className="text-primary hover:underline">
                ログイン画面に戻る
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
