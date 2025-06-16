export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    chat_instance?: string
    chat_type?: string
    start_param?: string
  }
  version: string
  platform: string
  colorScheme: "light" | "dark"
  themeParams: any
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  isClosingConfirmationEnabled: boolean
  BackButton: any
  MainButton: any
  HapticFeedback: any
  close(): void
  expand(): void
  ready(): void
}

export type DocumentType = "tz" | "brief"
export type DocumentStatus = "draft" | "active" | "completed" | "rejected"

export interface Document {
  id: string
  user_id: number
  title: string
  type: DocumentType
  status: DocumentStatus
  design_config: DesignConfig
  content: DocumentContent
  preview_image?: string
  is_template: boolean
  shared_with: string[]
  created_at: string
  updated_at: string
}

export interface DesignConfig {
  bgColor?: string
  bgImage?: string
  logoUrl?: string
  bannerUrl?: string
  font: "light" | "regular" | "bold"
}

export interface Question {
  id: string
  title: string
  subtitle?: string
  type: "text" | "multichoice" | "image" | "video"
  options?: string[]
  required: boolean
}

export interface TZBlock {
  id: string
  type: "media" | "description" | "tasks" | "references"
  content: any
}

export interface DocumentContent {
  questions?: Question[] // для брифов
  blocks?: TZBlock[] // для ТЗ
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}
