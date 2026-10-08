// Read-only integration checks against the configured Supabase demo account.
import assert from 'node:assert/strict'
import { createClient } from '@supabase/supabase-js'
import { loadSource } from '../tests/helpers.mjs'
process.loadEnvFile('.env.local')
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
const { error } = await client.auth.signInWithPassword({ email: process.env.DEMO_USER_EMAIL, password: process.env.DEMO_USER_PASSWORD })
assert.equal(error, null)
const { loadList } = loadSource('src/lib/lists/query.ts', client)
for (const kind of ['reviews','diaries','english','words']) {
  const { rows } = await loadList(client, kind, { q: 'literal%,_"\\()' })
  assert.equal(rows.length, 0)
}
await loadList(client, 'words', { q: 'literal%', filter: 'その他', page: '999' })
const { data: stats, error: statsError } = await client.rpc('get_mypage_stats', { month_start: '2026-10-01T00:00:00Z', week_start: '2026-09-28T00:00:00Z' })
assert.equal(statsError, null)
assert.equal(typeof stats.reviewTotal, 'number')
const encoded = value => Buffer.from(JSON.stringify(value)).toString('base64url')
const fakeJwt = `${encoded({ alg: 'HS256', typ: 'JWT' })}.${encoded({ sub: '00000000-0000-0000-0000-000000000000', exp: Math.floor(Date.now()/1000) + 3600 })}.${Buffer.alloc(32).toString('base64url')}`
const fakeSession = encoded({ access_token: fakeJwt, refresh_token: 'invalid', expires_at: Math.floor(Date.now()/1000) + 3600, user: { id: '00000000-0000-0000-0000-000000000000' } })
for (const cookie of ['', `sb-yattphsrkwxcozbifxjz-auth-token=base64-${fakeSession}`]) {
  const response = await fetch('http://localhost:3100/', { headers: { cookie }, redirect: 'manual' })
  assert.equal(response.status, 307)
  assert.ok(response.headers.get('location').endsWith('/login'))
}
console.log('PASS: 5 real PostgREST search/filter queries, aggregate RPC, anonymous and forged-token redirects')
