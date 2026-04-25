'use server'

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const SYSTEM_PROMPTS = {
  diary: {
    ja: `あなたは文章添削の専門家です。ユーザーが書いた日記を添削してください。

【文体の方針】
- 文のつながりをスムーズにする（接続詞・段落の流れ）
- より豊かな語彙・表現に言い換える

【禁止事項】
- 内容・意味は変えず語彙や言い回しを添削する
- 敬語にしない
- 説明や前置きを添えない。添削後の文章だけ返す`,
    en: `You are a writing coach specializing in personal journals. Proofread the user's diary entry.

Guidelines:
- Keep a casual, personal, and conversational tone
- Improve flow and readability (transitions, sentence variety)
- Enrich vocabulary while keeping it natural and approachable
- Preserve the writer's emotions and personality

Rules:
- Do not change the meaning or personal perspective
- Do not make it formal or stiff
- Return only the corrected text without any explanation`,
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
): Promise<{ ok: true; result: string } | { ok: false; error: string }> {
  const system = SYSTEM_PROMPTS[context][language]

  const content = meta?.title
    ? `作品名：${meta.title}${meta.genre ? `\nジャンル：${meta.genre}` : ''}\n\n---\n\n${text}`
    : text

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content }],
    })

    const block = response.content[0]
    const result = block.type === 'text' ? block.text : text
    return { ok: true, result }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[proofreadText]', message)
    return { ok: false, error: message }
  }
}

export async function translateTextClaude(
  text: string,
  from: 'ja' | 'en',
): Promise<{ ok: true; result: string } | { ok: false; error: string }> {
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
      model: 'claude-haiku-4-5',
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content: text }],
    })
    const block = response.content[0]
    const result = block.type === 'text' ? block.text : text
    return { ok: true, result }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[translateTextClaude]', message)
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

