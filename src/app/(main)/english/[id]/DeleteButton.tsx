'use client'

import { deleteEnglishLog } from '../actions'

export default function DeleteButton({ logId }: { logId: string }) {
  async function handleDelete() {
    if (!confirm('削除しますか？')) return
    await deleteEnglishLog(logId)
  }

  return (
    <button onClick={handleDelete} className="px-4 py-2 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition cursor-pointer">
      削除する
    </button>
  )
}
