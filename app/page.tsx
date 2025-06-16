"use client"

import { useEffect, useState } from "react"
import { initTelegramWebApp, getTelegramUser } from "@/lib/telegram"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DocumentList from "@/components/DocumentList"
import CreateDocument from "@/components/CreateDocument"
import OpenByLink from "@/components/OpenByLink"
import type { TelegramUser } from "@/lib/types"
import { FileText, Plus, ExternalLink } from "lucide-react"
import DevNotice from "@/components/DevNotice"

export default function Home() {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const webApp = initTelegramWebApp()
    if (webApp) {
      const telegramUser = getTelegramUser()
      setUser(telegramUser)
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen gradient-bg">
        <div className="neumorphic p-6 rounded-full">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-400 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen gradient-bg font-avenir mobile-container">
      {/* Заголовок */}
      <header className="mobile-header neumorphic-card mx-4 mt-4 px-4 flex items-center justify-center flex-shrink-0">
        <div className="w-full max-w-sm py-3">
          <h1 className="text-base font-bold text-neumorphic-primary text-center">Astrium</h1>
          {user && <p className="text-xs text-neumorphic-secondary text-center mt-1">Привет, {user.first_name}! 👋</p>}
        </div>
      </header>

      <DevNotice />

      <Tabs defaultValue="documents" className="flex-1 flex flex-col">
        {/* Контент с отступом для фиксированной навигации */}
        <div className="flex-1 overflow-hidden px-4 mt-4 content-with-fixed-nav">
          <TabsContent value="documents" className="h-full m-0 overflow-hidden">
            <DocumentList />
          </TabsContent>

          <TabsContent value="create" className="h-full m-0 overflow-hidden">
            <CreateDocument />
          </TabsContent>

          <TabsContent value="open" className="h-full m-0 overflow-hidden">
            <OpenByLink />
          </TabsContent>
        </div>

        {/* Фиксированная нижняя навигация */}
        <div className="fixed-bottom-nav neumorphic-card mx-4 mb-4">
          <TabsList className="grid w-full grid-cols-3 h-full bg-transparent border-0 rounded-none p-2">
            <TabsTrigger
              value="documents"
              className="flex-col gap-1 h-full neumorphic-button data-[state=active]:neumorphic-blue rounded-lg border-0 mx-1"
            >
              <FileText className="h-4 w-4" />
              <span className="text-xs">Документы</span>
            </TabsTrigger>
            <TabsTrigger
              value="create"
              className="flex-col gap-1 h-full neumorphic-button data-[state=active]:neumorphic-green rounded-lg border-0 mx-1"
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs">Создать</span>
            </TabsTrigger>
            <TabsTrigger
              value="open"
              className="flex-col gap-1 h-full neumorphic-button data-[state=active]:neumorphic-blue rounded-lg border-0 mx-1"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="text-xs">Открыть</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  )
}
