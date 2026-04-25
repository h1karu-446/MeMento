import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'

type Props = {
  searchParams: Promise<{ error?: string; code?: string; next?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { error, code, next } = await searchParams

  // パスワードリセットのコードが来たら交換してリセット画面へ
  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      redirect(next ?? '/reset-password')
    }
  }

  async function login(formData: FormData) {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      redirect('/login?error=invalid_credentials')
    }

    redirect('/')
  }

  return (
    <div className="min-h-screen flex mt-15 justify-center bg-background px-4">
      <div className="w-full max-w-sm">

        {/* ロゴ */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-xl">
            <Image src="/logo_green.png" width={125} height={125} alt="MeMento" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Login to MeMento</h1>
        </div>

        {/* カード */}
        <div>
          {/* エラーメッセージ */}
          {error === 'invalid_credentials' && (
            <div className="w-4/5 mx-auto mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              メールアドレスまたはパスワードが正しくありません
            </div>
          )}

          <form action={login} className="space-y-4">
            <div className="w-4/5 mx-auto">
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-background text-foreground placeholder:text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
              />
            </div>

            <div className="w-4/5 mx-auto">
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-background text-foreground placeholder:text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
              />
            </div>

            <div className="w-4/5 mx-auto">
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition cursor-pointer"
              >
                ログイン
              </button>
            </div>
          </form>
        </div>
        {/* 区切り線 */}
        <div className="w-4/5 mx-auto flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-black/10" />
          <span className="text-text-secondary text-sm">or</span>
          <div className="flex-1 h-px bg-black/10" />
        </div>

        {/* SSOボタン */}
        <div className="w-4/5 mx-auto space-y-3">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg border border-black/10 bg-surface hover:bg-black/5 text-foreground text-sm font-medium transition cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg border border-black/10 bg-surface hover:bg-black/5 text-foreground text-sm font-medium transition cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        {/* パスワード忘れ */}
        <p className="text-center text-sm text-text-secondary mt-4">
          <Link href="/forgot-password" className="text-xs text-text-secondary hover:text-primary transition">
            パスワードをお忘れの方はこちら
          </Link>
        </p>

        {/* 新規登録リンク */}
        <p className="text-center text-sm text-text-secondary mt-3">
          アカウントをお持ちでない方は{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            新規登録
          </Link>
        </p>

      </div>
    </div>
  )
}
