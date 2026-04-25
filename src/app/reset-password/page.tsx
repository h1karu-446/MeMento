'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) return toast('パスワードは6文字以上で入力してください', 'info')
    if (password !== confirm) return toast('パスワードが一致しません', 'info')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) return toast('変更に失敗しました: ' + error.message)
    toast('パスワードを変更しました', 'success')
    router.push('/')
  }

  return (
    <div className="min-h-screen flex mt-15 justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">新しいパスワードを設定</h1>
          <p className="text-sm text-text-secondary mt-2">6文字以上のパスワードを入力してください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="w-4/5 mx-auto">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              新しいパスワード
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6文字以上"
              className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-background text-foreground placeholder:text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            />
          </div>
          <div className="w-4/5 mx-auto">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              確認
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="もう一度入力"
              className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-background text-foreground placeholder:text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            />
          </div>
          <div className="w-4/5 mx-auto">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" />変更中...</> : 'パスワードを変更する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
