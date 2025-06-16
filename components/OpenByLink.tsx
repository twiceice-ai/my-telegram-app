"use client"

import { useState } from "react"
import { ExternalLink, AlertCircle } from "lucide-react"
import type { Document } from "@/lib/types"
import DocumentViewer from "./DocumentViewer"

export default function OpenByLink() {
  const [url, setUrl] = useState("")
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleOpenDocument = async () => {
    if (!url.trim()) {
      setError("Введите ссылку на документ")
      return
    }

    const match = url.match(/\/doc\/([a-f0-9-]+)/)
    if (!match) {
      setError("Неверный формат ссылки")
      return
    }

    const documentId = match[1]

    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/documents/${documentId}`)

      if (response.ok) {
        const doc = await response.json()
        setDocument(doc)
      } else if (response.status === 404) {
        setError("Документ не найден")
      } else {
        setError("Ошибка при загрузке документа")
      }
    } catch (error) {
      console.error("Error loading document:", error)
      setError("Ошибка при загрузке документа")
    } finally {
      setLoading(false)
    }
  }

  if (document) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-shrink-0 neumorphic-card p-3 mb-4">
          <button
            onClick={() => {
              setDocument(null)
              setUrl("")
              setError("")
            }}
            className="neumorphic-button px-4 py-2 rounded-lg text-neumorphic-primary text-sm"
          >
            ← Назад к поиску
          </button>
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          <DocumentViewer document={document} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="space-y-6 pb-8">
          <div className="neumorphic-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="neumorphic-inset p-2 rounded-lg">
                <ExternalLink className="h-5 w-5 text-blue-500" />
              </div>
              <h2 className="text-base font-semibold text-neumorphic-primary">Открыть документ по ссылке</h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="neumorphic-input p-3 rounded-lg">
                  <input
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value)
                      setError("")
                    }}
                    placeholder="https://tma.astrum.app/doc/..."
                    className="w-full bg-transparent text-sm text-neumorphic-primary placeholder-neumorphic-secondary outline-none"
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </div>

              <button
                onClick={handleOpenDocument}
                disabled={loading}
                className="w-full neumorphic-button px-4 py-3 rounded-lg text-neumorphic-primary font-medium text-sm neumorphic-transition disabled:opacity-50"
              >
                {loading ? "Загрузка..." : "Открыть документ"}
              </button>
            </div>
          </div>

          <div className="text-center text-sm text-neumorphic-secondary space-y-2 px-4">
            <p>Введите ссылку на документ, полученную от автора</p>
            <p>Формат: https://tma.astrum.app/doc/[ID]</p>
          </div>
        </div>
      </div>
    </div>
  )
}
