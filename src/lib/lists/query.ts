import type { SupabaseClient } from '@supabase/supabase-js'

export type ListKind = 'reviews' | 'diaries' | 'english' | 'words'
export type SearchParams = Record<string, string | string[] | undefined>
export type ListState = { q: string; filter: string; sort: string; page: number; totalPages: number }
export const listConfig = {
  reviews: { table: 'reviews', size: 9, columns: 'id,title,genre,rate,impressions,created_at', search: ['title', 'impressions'], filters: ['映画', '小説', '音楽'], preview: 'impressions' },
  diaries: { table: 'diaries', size: 4, columns: 'id,title,body,language,created_at', search: ['title', 'body'], filters: ['日本語', 'English'], preview: 'body' },
  english: { table: 'english_logs', size: 4, columns: 'id,title,content,created_at', search: ['title', 'content'], filters: [], preview: 'content' },
  words: { table: 'words', size: 15, columns: 'id,word,description,example,genre,source_title,created_at', search: ['word', 'description'], filters: ['映画', '小説', '音楽', '日記', '英語学習', 'その他'], preview: '' },
} as const

export function parseListState(kind: ListKind, params: SearchParams): ListState {
  const scalar = (key: string) => typeof params[key] === 'string' ? params[key] as string : ''
  const page = Number(scalar('page'))
  const filters: readonly string[] = listConfig[kind].filters
  return {
    q: scalar('q').slice(0, 200),
    filter: filters.includes(scalar('filter')) ? scalar('filter') : 'すべて',
    sort: scalar('sort') === '古い順' && kind !== 'words' ? '古い順' : '新しい順',
    page: Number.isSafeInteger(page) && page > 0 ? Math.min(page, 1_000_000) : 1,
    totalPages: 1,
  }
}

// Quote PostgREST values and escape LIKE wildcards so search stays literal.
export function searchPattern(value: string) {
  const literal = value.replace(/[\\%_]/g, '\\$&')
  return JSON.stringify(`%${literal}%`)
}

export function filteredQuery(client: SupabaseClient, kind: ListKind, state: ListState, count = true) {
  const config = listConfig[kind]
  let query = client.from(config.table).select<string>(config.columns, count ? { count: 'exact' } : {})
  if (state.q) query = query.or(config.search.map(column => `${column}.ilike.${searchPattern(state.q)}`).join(','))
  if (state.filter !== 'すべて') {
    if (kind === 'diaries') query = query.eq('language', state.filter === '日本語' ? 'ja' : 'en')
    else if (kind === 'words' && state.filter === 'その他') query = query.or('genre.is.null,genre.eq.その他')
    else query = query.eq('genre', state.filter)
  }
  return query.order('created_at', { ascending: state.sort === '古い順' }).order('id', { ascending: state.sort === '古い順' })
}

export async function loadList(client: SupabaseClient, kind: ListKind, params: SearchParams) {
  const state = parseListState(kind, params)
  const config = listConfig[kind]
  const run = (page: number) => filteredQuery(client, kind, state).range((page - 1) * config.size, page * config.size - 1)
  let fetchedPage = state.page
  let result = await run(fetchedPage)
  // PostgREST returns 416/PGRST103 (not an empty array) for stale offsets.
  // Re-read the first page to obtain the current count after deletes/filtering.
  if (result.error?.code === 'PGRST103' && fetchedPage > 1) {
    fetchedPage = 1
    result = await run(fetchedPage)
  }
  if (result.error) throw new Error('一覧の取得に失敗しました', { cause: result.error })
  state.totalPages = Math.max(1, Math.ceil((result.count ?? 0) / config.size))
  state.page = Math.min(state.page, state.totalPages)
  if (state.page !== fetchedPage) {
    result = await run(state.page)
    if (result.error) throw new Error('一覧の取得に失敗しました', { cause: result.error })
  }
  const rows = ((result.data ?? []) as unknown as Record<string, unknown>[]).map(row => config.preview ? { ...row, [config.preview]: String(row[config.preview] ?? '').slice(0, 240) } : row)
  return { rows, state }
}
