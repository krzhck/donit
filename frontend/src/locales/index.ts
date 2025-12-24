import { zhCN } from './zh-CN'

export const locales = {
  'zh-CN': zhCN,
} as const

export type LocaleSchema = typeof zhCN
export type LocaleKey = keyof typeof locales

// 导出当前语言的字典（可切换）
export const t = zhCN

export default locales
