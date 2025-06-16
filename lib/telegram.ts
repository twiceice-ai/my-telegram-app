export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    return window.Telegram.WebApp
  }
  return null
}

export function initTelegramWebApp() {
  const webApp = getTelegramWebApp()
  if (webApp) {
    webApp.ready()
    webApp.expand()

    // Настройка темы
    webApp.headerColor = "#ffffff"
    webApp.backgroundColor = "#ffffff"

    return webApp
  }
  return null
}

export function getTelegramUser(): TelegramUser | null {
  const webApp = getTelegramWebApp()
  return webApp?.initDataUnsafe?.user || null
}

export function validateTelegramData(initData: string): boolean {
  // В реальном приложении здесь должна быть валидация подписи
  // используя секретный ключ бота
  return initData.length > 0
}

export interface TelegramWebApp {
  ready: () => void
  expand: () => void
  headerColor: string
  backgroundColor: string
  initDataUnsafe: {
    user?: TelegramUser
  }
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}
