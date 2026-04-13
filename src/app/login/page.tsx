import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'

type Props = {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams

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
            <Image src="/logo_green.png" width={120} height={120} alt="MeMento" />
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

        {/* 新規登録リンク */}
        <p className="text-center text-sm text-text-secondary mt-6">
          アカウントをお持ちでない方は{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            新規登録
          </Link>
        </p>

      </div>
    </div>
  )
}
