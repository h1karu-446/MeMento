import test from 'node:test'
import assert from 'node:assert/strict'
import { fixtureClient, loadSource } from './helpers.mjs'
const query = loadSource('src/lib/lists/query.ts', null)

test('list pagination limits transfer and finds text beyond the original 1000 row cap', async () => {
  const client = fixtureClient()
  const first = await query.loadList(client, 'diaries', {})
  assert.equal(first.rows.length, 4)
  assert.equal(first.state.totalPages, 302)
  assert.equal(first.rows[0].body.length, 240)
  const found = await query.loadList(client, 'diaries', { q: 'UniqueNeedle' })
  assert.equal(found.rows.length, 1)
  assert.equal(found.rows[0].id, 1201)
})
test('filters, sort, page bounds, empty results and malicious query values', async () => {
  const client = fixtureClient()
  const result = await query.loadList(client, 'diaries', { filter: 'English', sort: '古い順', page: '2' })
  assert.equal(result.rows.length, 4)
  assert.ok(result.rows.every(row => row.language === 'en'))
  assert.ok(result.rows[0].id > result.rows[1].id)
  const last = await query.loadList(client, 'reviews', { page: '999999' })
  assert.equal(last.state.page, last.state.totalPages)
  const empty = await query.loadList(client, 'reviews', { q: 'absent' })
  assert.equal(empty.rows.length, 0)
  assert.equal(empty.state.totalPages, 1)
  for (const page of ['-1','0','NaN','Infinity','1.5']) assert.equal(query.parseListState('words', { page }).page, 1)
  assert.equal(query.parseListState('reviews', { filter: 'injected', q: ['x'] }).filter, 'すべて')
  assert.equal(JSON.parse(query.searchPattern('a%,_"\\')), '%a\\%,\\_"\\\\%')
  const other = await query.loadList(client, 'words', { filter: 'その他' })
  assert.ok(other.rows.every(row => row.genre === null))
})
test('database errors are surfaced rather than rendered as empty lists', async () => {
  await assert.rejects(query.loadList(fixtureClient({ failure: 'reviews' }), 'reviews', {}), /一覧の取得/)
})
test('dashboard launches all six queries together and rejects anonymous access', async () => {
  const client = fixtureClient({ latency: 10 })
  await loadSource('src/app/(main)/page.tsx', client).default()
  assert.equal(client.stats.maxActive, 6)
  await assert.rejects(loadSource('src/app/(main)/page.tsx', fixtureClient({ authenticated: false })).default(), /REDIRECT/)
})
test('mypage uses one aggregate query after authentication', async () => {
  const client = fixtureClient({ latency: 10 })
  await loadSource('src/app/(main)/mypage/page.tsx', client).default()
  assert.equal(client.stats.calls.filter(call => call.rpc).length, 1)
  assert.equal(client.stats.calls.filter(call => call.table).length, 0)
})
test('all six detail/edit routes fetch records and words concurrently; missing records still 404', async () => {
  for (const kind of ['reviews','diaries','english']) for (const suffix of ['page.tsx','edit/page.tsx']) {
    const client = fixtureClient({ latency: 10 })
    const page = loadSource(`src/app/(main)/${kind}/[id]/${suffix}`, client).default
    await page({ params: Promise.resolve({ id: '1' }) })
    assert.equal(client.stats.maxActive, 2)
    await assert.rejects(page({ params: Promise.resolve({ id: 'missing' }) }), /NOT_FOUND/)
  }
})
test('quiz retains all matching words across batch boundaries and requires authentication', async () => {
  const client = fixtureClient()
  const actions = loadSource('src/app/(main)/words/actions.ts', client)
  const words = await actions.loadQuizWords({ q: '', filter: 'すべて' })
  assert.equal(words.length, 1205)
  assert.equal(new Set(words.map(word => word.id)).size, 1205)
  const matching = await actions.loadQuizWords({ q: '', filter: '映画' })
  assert.ok(matching.every(word => word.genre === '映画'))
  await assert.rejects(loadSource('src/app/(main)/words/actions.ts', fixtureClient({ authenticated: false })).loadQuizWords({ q: '', filter: 'すべて' }), /REDIRECT/)
})
