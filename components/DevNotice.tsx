"use client"

import { useState, useEffect } from "react"
import { Info, X } from "lucide-react"

export default function DevNotice() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Show notice in development mode
    if (process.env.NODE_ENV === "development") {
      setShow(true)
    }
  }, [])

  if (!show) return null

  return (
    <div className="mx-4 mt-4">
      <div className="neumorphic-card p-4 bg-blue-50">
        <div className="flex items-start gap-3">
          <div className="neumorphic-inset p-2 rounded-lg">
            <Info className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-blue-800">
              <strong>Режим разработки:</strong> Используются демо-данные. Для полной функциональности подключите Vercel
              Postgres и Blob Storage.
            </p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="neumorphic-button p-1 rounded-lg text-blue-600 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
