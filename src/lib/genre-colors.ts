// ジャンルバッジの色定義（ライト・ダーク共通）
export const genreColor: Record<string, string> = {
  映画: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  小説: 'bg-blue-100  text-blue-700  dark:bg-blue-900/40  dark:text-blue-300',
  音楽: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  日記: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  英語学習: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  その他: 'bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-400',
}

// 言語バッジの色
export const languageColor: Record<string, string> = {
  ja: 'bg-blue-100  text-blue-700  dark:bg-blue-900/40  dark:text-blue-300',
  en: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
}

// マイページのジャンル内訳バーの色
export const genreBarColor: Record<string, string> = {
  映画: 'bg-yellow-400 dark:bg-yellow-600',
  小説: 'bg-blue-400  dark:bg-blue-500',
  音楽: 'bg-orange-400 dark:bg-orange-500',
}
