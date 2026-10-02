import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
const require = createRequire(import.meta.url)

export function loadSource(relative, client, root = process.cwd()) {
  const cache = new Map()
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports
    const loadedModule = { exports: {} }
    cache.set(file, loadedModule)
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText
    const resolve = name => {
      if (name === '@/lib/supabase/server') return { createClient: async () => client }
      if (name === 'next/navigation') return { redirect: url => { throw new Error('REDIRECT:' + url) }, notFound: () => { throw new Error('NOT_FOUND') } }
      if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type: typeof type === 'function' ? type.name : type, props }), jsxs: (type, props) => ({ type: typeof type === 'function' ? type.name : type, props }), Fragment: 'Fragment' }
      if (name === 'next/link' || name === 'next/image') return { default: name }
      if (name === 'lucide-react') return new Proxy({}, { get: (_, key) => key })
      if (name.includes('Client') || name.includes('List') || name.endsWith('DeleteButton')) return { default: name }
      if (name.startsWith('@/') || name.startsWith('.')) {
        const base = name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : path.resolve(path.dirname(file), name)
        const resolved = ['.ts', '.tsx', ''].map(ext => base + ext).find(p => fs.existsSync(p) && fs.statSync(p).isFile())
        return load(resolved)
      }
      return require(name)
    }
    vm.runInThisContext(`(function(require,module,exports){${source}\n})`, { filename: file })(resolve, loadedModule, loadedModule.exports)
    return loadedModule.exports
  }
  return load(path.resolve(root, relative))
}

export function fixtureClient({ size = 1205, latency = 0, failure, authenticated = true } = {}) {
  const stats = { calls: [], active: 0, maxActive: 0, returnedRows: 0 }
  const rows = Array.from({ length: size }, (_, i) => ({ id: i + 1, user_id: 'test-user', title: `Title ${i + 1}`, word: `Word ${i + 1}`, description: 'meaning', example: null, source_title: 'source', body: '本文'.repeat(1000) + (i === 1200 ? 'UniqueNeedle' : ''), content: 'content'.repeat(500), impressions: 'review'.repeat(500), rate: 4, language: i % 2 ? 'en' : 'ja', genre: ['映画', '小説', '音楽', null][i % 4], created_at: new Date(Date.now() - i * 86400000).toISOString() }))
  async function run(info, result) {
    stats.calls.push(info); stats.active++; stats.maxActive = Math.max(stats.maxActive, stats.active)
    await new Promise(resolve => setTimeout(resolve, latency))
    stats.active--
    return result
  }
  const client = {
    stats, rows,
    auth: {
      getUser: () => run({ auth: 'getUser' }, { data: { user: authenticated ? { id: 'test-user', email: 'demo@example.test', user_metadata: {} } : null }, error: null }),
      getClaims: async () => ({ data: authenticated ? { claims: { sub: 'test-user' } } : null, error: null }),
    },
    rpc(name) {
      const stats = { reviewTotal: size, reviewMonth: 1, diaryTotal: size, diaryMonth: 1, wordTotal: size, wordMonth: 1, movies: 1, novels: 1, music: 1, weekReviews: [{ created_at: rows[0]?.created_at }], weekDiaries: [] }
      return run({ rpc: name }, { data: stats, error: null })
    },
    from(table) {
      let columns = '*', options = {}, lower = 0, upper = 999, single = false
      const filters = [], orders = []
      const query = {
        select(value, opts = {}) { columns = value; options = opts; return query },
        order(key, opts) { orders.push([key, opts.ascending]); return query },
        limit(n) { upper = n - 1; return query },
        range(from, to) { lower = from; upper = to; return query },
        eq(key, value) { filters.push(row => String(row[key]) === String(value)); return query },
        gte(key, value) { filters.push(row => row[key] >= value); return query },
        or(value) {
          if (value === 'genre.is.null,genre.eq.その他') filters.push(row => row.genre === null || row.genre === 'その他')
          else {
            const parts = [...value.matchAll(/(\w+)\.ilike\.("(?:\\.|[^"\\])*")/g)]
            filters.push(row => parts.some(([, key, pattern]) => String(row[key]).toLowerCase().includes(JSON.parse(pattern).slice(1, -1).replace(/\\([\\%_])/g, '$1').toLowerCase())))
          }
          return query
        },
        overrideTypes() { return query },
        single() { single = true; return query },
        maybeSingle() { single = true; return query },
        then(resolve, reject) {
          let data = table === 'ai_recommendations' ? [] : rows.filter(row => filters.every(filter => filter(row)))
          const count = data.length
          data = [...data].sort((a, b) => { for (const [key, asc] of orders) { if (a[key] < b[key]) return asc ? -1 : 1; if (a[key] > b[key]) return asc ? 1 : -1 } return 0 }).slice(lower, upper + 1)
          if (columns !== '*') data = data.map(row => Object.fromEntries(columns.split(',').map(key => [key.trim(), row[key.trim()]])))
          stats.returnedRows += options.head ? 0 : data.length
          return run({ table, columns, lower, upper, head: !!options.head }, { data: options.head ? null : single ? data[0] ?? null : data, count: options.count ? count : null, error: table === failure ? { code: 'TEST', message: 'failure' } : options.count && lower > 0 && lower >= count ? { code: 'PGRST103', message: 'Requested range not satisfiable' } : null }).then(resolve, reject)
        },
      }
      return query
    },
  }
  return client
}
