"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save, Send, Palette, Type } from "lucide-react"
import type { DocumentType, DesignConfig, Question, TZBlock } from "@/lib/types"
import DesignEditor from "./DesignEditor"
import BriefEditor from "./BriefEditor"
import TZEditor from "./TZEditor"
import ShareModal from "./ShareModal"

interface DocumentEditorProps {
  type: DocumentType
  onBack: () => void
}

export default function DocumentEditor({ type, onBack }: DocumentEditorProps) {
  const [step, setStep] = useState<"design" | "content">("design")
  const [title, setTitle] = useState("")
  const [designConfig, setDesignConfig] = useState<DesignConfig>({
    font: "regular",
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [blocks, setBlocks] = useState<TZBlock[]>([])
  const [showShareModal, setShowShareModal] = useState(false)
  const [documentId, setDocumentId] = useState<string | null>(null)

  const handleSaveDraft = async () => {
    try {
      const content = type === "brief" ? { questions } : { blocks }

      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-telegram-init-data": "mock-init-data",
        },
        body: JSON.stringify({
          title: title || `${type === "tz" ? "ТЗ" : "Бриф"} без названия`,
          type,
          design_config: designConfig,
          content,
          status: "draft",
        }),
      })

      if (response.ok) {
        const document = await response.json()
        setDocumentId(document.id)

        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred("success")
        }
        alert("Черновик сохранён!")
      }
    } catch (error) {
      console.error("Error saving draft:", error)
      alert("Ошибка при сохранении")
    }
  }

  const handleSend = async () => {
    try {
      const content = type === "brief" ? { questions } : { blocks }

      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-telegram-init-data": "mock-init-data",
        },
        body: JSON.stringify({
          title: title || `${type === "tz" ? "ТЗ" : "Бриф"} без названия`,
          type,
          design_config: designConfig,
          content,
          status: "active",
        }),
      })

      if (response.ok) {
        const document = await response.json()
        setDocumentId(document.id)
        setShowShareModal(true)
      }
    } catch (error) {
      console.error("Error sending document:", error)
      alert("Ошибка при отправке")
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Заголовок */}
      <div className="flex-shrink-0 bg-white border-b px-3 py-2">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-1.5 h-auto">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold text-sm">{type === "tz" ? "Создание ТЗ" : "Создание брифа"}</h1>
        </div>

        <Input
          placeholder={`Название ${type === "tz" ? "ТЗ" : "брифа"}...`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-sm compact-input"
        />
      </div>

      {/* Переключатель шагов */}
      <div className="flex-shrink-0 flex border-b bg-white">
        <button
          className={`flex-1 py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
            step === "design" ? "border-blue-500 text-blue-600 bg-blue-50" : "border-transparent text-gray-500"
          }`}
          onClick={() => setStep("design")}
        >
          <Palette className="h-3 w-3 mx-auto mb-1" />
          Дизайн
        </button>
        <button
          className={`flex-1 py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
            step === "content" ? "border-blue-500 text-blue-600 bg-blue-50" : "border-transparent text-gray-500"
          }`}
          onClick={() => setStep("content")}
        >
          <Type className="h-3 w-3 mx-auto mb-1" />
          Контент
        </button>
      </div>

      {/* Контент */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {step === "design" && (
          <DesignEditor config={designConfig} onChange={setDesignConfig} onNext={() => setStep("content")} />
        )}

        {step === "content" && (
          <>
            {type === "brief" ? (
              <BriefEditor questions={questions} onChange={setQuestions} />
            ) : (
              <TZEditor blocks={blocks} onChange={setBlocks} />
            )}
          </>
        )}
      </div>

      {/* Нижняя панель действий */}
      {step === "content" && (
        <div className="flex-shrink-0 bg-white border-t p-3">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveDraft} className="flex-1 compact-button">
              <Save className="h-3 w-3 mr-1" />
              <span className="text-xs">Сохранить</span>
            </Button>
            <Button onClick={handleSend} className="flex-1 compact-button">
              <Send className="h-3 w-3 mr-1" />
              <span className="text-xs">Отправить</span>
            </Button>
          </div>
        </div>
      )}

      {showShareModal && documentId && (
        <ShareModal documentId={documentId} documentTitle={title} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  )
}
