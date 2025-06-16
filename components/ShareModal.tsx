"use client"

import { useState } from "react"
import { Copy, Send, X } from "lucide-react"

interface ShareModalProps {
  documentId: string
  documentTitle: string
  onClose: () => void
}

export default function ShareModal({ documentId, documentTitle, onClose }: ShareModalProps) {
  const [username, setUsername] = useState("")
  const [sending, setSending] = useState(false)

  const documentUrl = `https://tma.astrum.app/doc/${documentId}`

  const handleSendToTelegram = async () => {
    if (!username.trim()) {
      alert("Введите username получателя")
      return
    }

    try {
      setSending(true)
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-telegram-init-data": "mock-init-data",
        },
        body: JSON.stringify({
          username: username.replace("@", ""),
          documentId,
          documentTitle,
        }),
      })

      if (response.ok) {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred("success")
        }
        alert("Уведомление отправлено!")
        onClose()
      } else {
        alert("Ошибка при отправке")
      }
    } catch (error) {
      console.error("Error sending notification:", error)
      alert("Ошибка при отправке")
    } finally {
      setSending(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(documentUrl)
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred("success")
    }
    alert("Ссылка скопирована!")
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-xl p-4 space-y-4 animate-in slide-in-from-bottom duration-300 max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neumorphic-primary">Отправить документ</h2>
          <button onClick={onClose} className="neumorphic-button p-2 rounded-lg">
            <X className="h-4 w-4 text-neumorphic-secondary" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neumorphic-primary block mb-2">Username получателя</label>
            <div className="flex gap-2">
              <div className="flex-1 neumorphic-input p-3 rounded-lg">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@username"
                  className="w-full bg-transparent text-sm text-neumorphic-primary placeholder-neumorphic-secondary outline-none"
                />
              </div>
              <button
                onClick={handleSendToTelegram}
                disabled={sending}
                className="neumorphic-blue px-4 py-3 rounded-lg text-white font-medium text-sm neumorphic-transition disabled:opacity-50"
              >
                <Send className="h-3 w-3 mr-1" />
                <span className="text-xs">{sending ? "..." : "Отправить"}</span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="text-sm font-medium text-neumorphic-primary block mb-2">Прямая ссылка</label>
            <div className="flex gap-2">
              <div className="flex-1 neumorphic-input p-3 rounded-lg">
                <input
                  value={documentUrl}
                  readOnly
                  className="w-full bg-transparent text-xs text-neumorphic-secondary outline-none"
                />
              </div>
              <button onClick={handleCopyLink} className="neumorphic-button p-3 rounded-lg">
                <Copy className="h-3 w-3 text-neumorphic-secondary" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
