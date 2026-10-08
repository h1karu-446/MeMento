import { fixtureClient, loadSource } from '../tests/helpers.mjs'
import { performance } from 'node:perf_hooks'
import { writeFile } from 'node:fs/promises'
const baseline = process.argv[2]
if (!baseline) throw new Error('Usage: node scripts/benchmark-fixtures.mjs /path/to/baseline/root')
const paths = ['page.tsx', 'mypage/page.tsx', 'reviews/[id]/page.tsx', 'reviews/page.tsx', 'diaries/page.tsx', 'words/page.tsx']
const results = []
for (const route of paths) {
  const row = { route }
  for (const [label, root] of [['before', baseline], ['after', process.cwd()]]) {
    const samples = []
    let last
    for (let i = 0; i < 4; i++) {
      const client = fixtureClient({ size: 1205, latency: 50 })
      const page = loadSource('src/app/(main)/' + route, client, root).default
      const start = performance.now()
      const output = await page({ params: Promise.resolve({ id: '1' }), searchParams: Promise.resolve({}) })
      const ms = performance.now() - start
      if (i) samples.push(ms)
      last = { returnedRows: client.stats.returnedRows, payloadBytes: Buffer.byteLength(JSON.stringify(output)), maxParallel: client.stats.maxActive }
    }
    row[label] = { medianMs: Math.round(samples.sort((a,b) => a-b)[1]), ...last }
  }
  results.push(row)
}
await writeFile('/tmp/memento-fixtures.json', JSON.stringify({ conditions: '1205 records per table, synthetic 50 ms/request, 1 warmup + 3 samples, source functions (not browser)', results }, null, 2))
console.log(JSON.stringify(results, null, 2))
