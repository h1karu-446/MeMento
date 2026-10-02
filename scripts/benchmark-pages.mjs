// Read-only benchmark against a local production server and the configured demo account.
import { createServerClient } from '@supabase/ssr'
import { performance } from 'node:perf_hooks'
import { writeFile } from 'node:fs/promises'
process.loadEnvFile('.env.local')
const cookies = new Map()
const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  cookies: { getAll: () => [...cookies].map(([name, value]) => ({ name, value })), setAll: values => values.forEach(({ name, value }) => cookies.set(name, value)) },
})
const { error } = await supabase.auth.signInWithPassword({ email: process.env.DEMO_USER_EMAIL, password: process.env.DEMO_USER_PASSWORD })
if (error) throw new Error('Demo authentication failed: ' + error.message)
const cookie = [...cookies].map(([name, value]) => `${name}=${value}`).join('; ')
const paths = ['/', '/reviews', '/diaries', '/english', '/words', '/mypage']
for (const [table, route] of [['reviews','reviews'],['diaries','diaries'],['english_logs','english']]) {
  const { data: rows } = await supabase.from(table).select('id').limit(1)
  if (rows?.length) paths.push(`/${route}/${rows[0].id}`)
}
const results = []
for (const path of paths) {
  const times = [], sizes = []
  for (let i = 0; i < 6; i++) {
    const start = performance.now()
    const response = await fetch(`http://localhost:3100${path}`, { headers: { cookie }, redirect: 'manual' })
    const body = await response.text()
    if (response.status !== 200 || body.includes('NEXT_HTTP_ERROR_FALLBACK;500')) throw new Error(`Page failed: ${path}, status ${response.status}`)
    if (i) { times.push(performance.now() - start); sizes.push(Buffer.byteLength(body)) }
  }
  times.sort((a,b) => a-b)
  results.push({ path, medianMs: Math.round(times[2]), minMs: Math.round(times[0]), maxMs: Math.round(times[4]), htmlBytes: sizes[0] })
}
await writeFile(process.argv[2] ?? '/tmp/memento-benchmark.json', JSON.stringify({ measuredAt: new Date().toISOString(), samples: 5, warmups: 1, results }, null, 2))
console.table(results)
// This session is used only for read-only measurements. Never print credentials or cookies.
