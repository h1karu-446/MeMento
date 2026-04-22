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
