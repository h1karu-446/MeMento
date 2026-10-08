'use server'

import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic()

const MODEL = 'claude-haiku-5-5'
const MAX_INPUT_CHARS = 5000
const MAX_META_CHARS = 200

type Failure = { ok: false; error: string }

// ログイン中のユーザーを取得する（未ログインなら null）
async function getAuthedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ? { supabase, user } : null
}

// 入力チェック。問題があればエラーメッセージを返す
// Server Action は任意の値を送れるので、型も実行時に確認する
function validateInput(text: unknown): string | null {
  if (typeof text !== 'string' || !text.trim()) return '入力が空です'
  if (text.length > MAX_INPUT_CHARS) return `入力は${MAX_INPUT_CHARS}文字以内にしてください`
  return null
}

function isLanguage(value: unknown): value is 'ja' | 'en' {
  return value === 'ja' || value === 'en'
}

function isOptionalShortString(value: unknown): boolean {
  return value === undefined || (typeof value === 'string' && value.length <= MAX_META_CHARS)
}

// stop_reason を確認してから、応答の text ブロックを取り出す
// （Haiku 5.5 は先頭に thinking ブロックが来ることがあるので、位置ではなく type で探す）
function extractText(response: Anthropic.Message): { ok: true; text: string } | Failure {
  if (response.stop_reason === 'max_tokens') {
    return { ok: false, error: 'AIの出力が途中で切れました。文章を短くして試してください。' }
  }
  if (response.stop_reason === 'refusal') {
    return { ok: false, error: 'AIがこの内容への回答を控えました。' }
  }
  const block = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')
  if (!block) return { ok: false, error: 'AIから回答を得られませんでした。' }
  return { ok: true, text: block.text }
}

// 構造化出力の JSON をスキーマで検証する（失敗したら null）
function parseJson<T>(text: string, schema: z.ZodType<T>): T | null {
  try {
    const result = schema.safeParse(JSON.parse(text))
    return result.success ? result.data : null
  } catch {
    return null
  }
}

const SYSTEM_PROMPTS = {
  diary: {
    ja: `あなたは文章力・語彙力の向上を専門とする添削家です。
ユーザーが書いた日記を、表現の質を高める観点から添削してください。

【添削の方針】
- 平易すぎる語彙をより豊かな表現に言い換える（例：「すごい」→「圧倒的な」「目を見張る」）
- 同じ言葉の繰り返しを避け、類語・言い回しを活用する
- 文のリズムを整える（短文・長文のバランス、接続詞の工夫）
- 感情や情景をより具体的・鮮明に描写する
- 読み手に伝わる文章構造に整える（主語・述語の対応、段落の流れ）

【禁止事項】
- 敬語・丁寧語にしない（常体を維持する）
- 書き手の感情・個性・意見を変えない
- 内容・事実を変えない
- 説明・前置き・コメントを添えない。添削後の文章だけ返す`,

    en: `You are an expert writing coach focused on helping users develop their writing skills and vocabulary.
Proofread the user's diary entry with the goal of elevating the quality of expression.

Guidelines:
- Replace plain or overused words with more vivid, precise vocabulary
  (e.g. "good" → "remarkable", "deeply satisfying")
- Vary sentence structure for rhythm and readability
- Strengthen imagery and emotional expression with concrete, evocative language
- Eliminate redundancy; use synonyms and varied phrasing
- Improve paragraph flow and logical coherence

Rules:
- Maintain a casual, personal tone — never make it formal or stiff
- Preserve the writer's voice, emotions, and factual content
- Return only the corrected text without any explanation or commentary`,
  },
  review: {
    ja: `あなたは文芸・批評文章の添削専門家です。映画・小説・音楽のレビューを添削してください。

【文体の方針】
- やや改まったトーンで、読み手に説得力を与える文体にする
- 批評・文学で使われる洗練された語彙を積極的に取り入れる（例：「面白かった」→「深く心を揺さぶられた」「卓越した表現力」）
- 論理的な文章構成を意識する（主張→根拠→結論）
- 抽象的な感想を具体的・批評的な表現に昇華させる

【禁止事項】
- 個人の感想の方向性・評価を変えない
- 説明や前置きを添えない。添削後の文章だけ返す`,
    en: `You are a literary and cultural critic specializing in reviews. Proofread the user's review of a film, novel, or music.

Guidelines:
- Use a slightly formal yet engaging critical tone
- Actively incorporate literary and analytical vocabulary (e.g., "good" → "masterfully crafted", "moving")
- Strengthen logical structure (claim → evidence → conclusion)
- Elevate vague impressions into specific, critical expression

Rules:
- Do not change the writer's opinion or evaluation
- Return only the corrected text without any explanation`,
  },
}

export async function proofreadText(
  text: string,
  language: 'ja' | 'en',
  context: 'diary' | 'review',
  meta?: { title?: string; genre?: string },
): Promise<{ ok: true; result: string } | Failure> {
  if (!(await getAuthedUser())) return { ok: false, error: 'ログインが必要です' }
  const invalid = validateInput(text)
  if (invalid) return { ok: false, error: invalid }
  if (!isLanguage(language) || (context !== 'diary' && context !== 'review')) {
    return { ok: false, error: '不正なリクエストです' }
  }
  if (!isOptionalShortString(meta?.title) || !isOptionalShortString(meta?.genre)) {
    return { ok: false, error: `作品名・ジャンルは${MAX_META_CHARS}文字以内にしてください` }
  }

  const system = SYSTEM_PROMPTS[context][language]

  const content = meta?.title
    ? `作品名：${meta.title}${meta.genre ? `\nジャンル：${meta.genre}` : ''}\n\n---\n\n${text}`
    : text

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      output_config: { effort: 'low' },
      system,
      messages: [{ role: 'user', content }],
    })

    const extracted = extractText(response)
    if (!extracted.ok) return extracted
    return { ok: true, result: extracted.text }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[proofreadText]', message)
    return { ok: false, error: message }
  }
}

export async function translateTextClaude(
  text: string,
  from: 'ja' | 'en',
): Promise<{ ok: true; result: string } | Failure> {
  if (!(await getAuthedUser())) return { ok: false, error: 'ログインが必要です' }
  const invalid = validateInput(text)
  if (invalid) return { ok: false, error: invalid }
  if (!isLanguage(from)) return { ok: false, error: '不正なリクエストです' }

  const system = from === 'ja'
    ? `あなたはプロの日英翻訳者です。日本語のテキストを自然な英語に翻訳してください。
- 日本語特有の慣用表現・比喩は、英語圏で自然に通じる表現に意訳する（例：「空気を読む」→「read the room」）
- 直訳せず、英語として自然な文体にする
- Return ONE translation only — no alternatives. no explanations, no options
- 翻訳後のテキストだけを返す。説明や前置きは不要`
    : `You are a professional English-to-Japanese translator for a personal diary app. Translate the given English text into natural, casual Japanese as if writing in a diary.
- Use casual Japanese
- Translate idioms and expressions into their natural Japanese equivalents, not word-for-word
- Return ONE translation only — no alternatives, no explanations, no options like "or more casually:"
- Output the translated text and nothing else`

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      output_config: { effort: 'low' },
      system,
      messages: [{ role: 'user', content: text }],
    })
    const extracted = extractText(response)
    if (!extracted.ok) return extracted
    return { ok: true, result: extracted.text }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[translateTextClaude]', message)
    return { ok: false, error: message }
  }
}

const EnglishCheckSchema = z.object({
  hasErrors: z.boolean(),
  corrected: z.string(),
  translation: z.string(),
})

export async function checkEnglishText(
  text: string,
): Promise<
  | { ok: true; corrected: string; hasErrors: boolean; translation: string }
  | Failure
> {
  if (!(await getAuthedUser())) return { ok: false, error: 'ログインが必要です' }
  const invalid = validateInput(text)
  if (invalid) return { ok: false, error: invalid }

  const system = `あなたは日本人の英語学習者向けの英文チェッカーです。
ユーザーが書いた英語の例文について、以下を行ってください。

1. 文法・スペル・不自然な単語選びの誤りをチェックする（hasErrors）
2. 誤りがあれば自然な英語に修正する。誤りがなければ元の文をそのまま返す（corrected）
3. 修正後の文を自然な日本語に翻訳する（translation）`

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      output_config: { effort: 'low', format: zodOutputFormat(EnglishCheckSchema) },
      system,
      messages: [{ role: 'user', content: text }],
    })
    const extracted = extractText(response)
    if (!extracted.ok) return extracted

    const parsed = parseJson(extracted.text, EnglishCheckSchema)
    if (!parsed) {
      console.error('[checkEnglishText] スキーマ検証失敗:', extracted.text)
      return { ok: false, error: 'AIの返答を解析できませんでした。もう一度試してください。' }
    }

    return { ok: true, ...parsed }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[checkEnglishText]', message)
    return { ok: false, error: message }
  }
}

export async function translateTextAzure(
  text: string,
  from: 'ja' | 'en',
  to: 'ja' | 'en',
): Promise<{ ok: true; result: string } | { ok: false; error: string }> {
  const key = process.env.AZURE_TRANSLATOR_KEY
  const region = process.env.AZURE_TRANSLATOR_REGION
  if (!key || !region) return { ok: false, error: 'Azure Translator の設定が見つかりません' }

  try {
    const res = await fetch(
      `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${from}&to=${to}`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Ocp-Apim-Subscription-Region': region,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ text }]),
      }
    )
    if (!res.ok) {
      const err = await res.text()
      return { ok: false, error: err }
    }
    const data = await res.json()
    const result: string = data[0]?.translations[0]?.text ?? text
    return { ok: true, result }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[translateText]', message)
    return { ok: false, error: message }
  }
}

const RecommendationSchema = z.object({
  title: z.string(),
  genre: z.enum(['映画', '小説', '音楽']),
  reason: z.string(),
  description: z.string(),
})

// 件数は API 側で強制できない（minItems は 0/1 のみ）ため、スキーマでは制約せずプロンプトで指示する
const RecommendationsSchema = z.object({
  recommendations: z.array(RecommendationSchema),
})

export type Recommendation = z.infer<typeof RecommendationSchema>

export async function generateRecommendation(): Promise<
  { ok: true; recommendations: Recommendation[] } | Failure
> {
  const authed = await getAuthedUser()
  if (!authed) return { ok: false, error: 'ログインが必要です' }
  const { supabase, user } = authed

  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('title, genre, rate')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(300)
  if (reviewsError) {
    console.error('[generateRecommendation]', reviewsError.message)
    return { ok: false, error: 'レビュー履歴の取得に失敗しました' }
  }

  const genres = ['映画', '小説', '音楽'] as const
  const picked = genres.flatMap((genre) => {
    const byGenre = (reviews ?? []).filter(r => r.genre === genre)
    // シャッフルして最大10件
    const shuffled = [...byGenre].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 10)
  })

  const reviewSummary = picked.map(r =>
    `・${r.title}（${r.genre}）★${r.rate}`
  ).join('\n')

  const prompt = `以下はあるユーザーのレビュー履歴です。

【レビュー履歴】
${reviewSummary || 'なし'}

このユーザーの趣味・好みに基づいて、次に楽しめそうな作品を4つおすすめしてください。
映画・小説・音楽をバランスよく含めてください。

各項目の書き方：
- title：作品名
- genre：映画・小説・音楽のいずれか
- reason：おすすめ理由（自然な文章で本屋の営業になったつもりで。ユーザーの履歴を分析している感じは出さない）
- description：作品のあらすじや概要（2〜3文）`

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      output_config: { effort: 'low', format: zodOutputFormat(RecommendationsSchema) },
      messages: [{ role: 'user', content: prompt }],
    })

    const extracted = extractText(response)
    if (!extracted.ok) return extracted

    const parsed = parseJson(extracted.text, RecommendationsSchema)
    const recommendations = parsed?.recommendations.slice(0, 4) ?? []
    if (recommendations.length === 0) {
      console.error('[generateRecommendation] スキーマ検証失敗または0件:', extracted.text)
      return { ok: false, error: 'AIの返答を解析できませんでした。もう一度試してください。' }
    }

    // DBにupsert（user_idで上書き）
    const { error: upsertError } = await supabase.from('ai_recommendations').upsert({
      user_id: user.id,
      content: recommendations,
      generated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    if (upsertError) {
      console.error('[generateRecommendation]', upsertError.message)
      return { ok: false, error: 'おすすめの保存に失敗しました' }
    }

    return { ok: true, recommendations }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[generateRecommendation]', message)
    return { ok: false, error: message }
  }
}
