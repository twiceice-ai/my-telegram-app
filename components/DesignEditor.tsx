"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, Palette, Type, ImageIcon, Camera } from "lucide-react"
import type { DesignConfig } from "@/lib/types"

interface DesignEditorProps {
  config: DesignConfig
  onChange: (config: DesignConfig) => void
  onNext: () => void
}

const pastelColors = ["#FFE5E5", "#E5F3FF", "#E5FFE5", "#FFF5E5", "#F0E5FF", "#FFE5F5", "#E5FFFF", "#F5FFE5"]

const fonts = [
  { value: "light", label: "Avenir Light" },
  { value: "regular", label: "Avenir Regular" },
  { value: "bold", label: "Avenir Bold" },
]

export default function DesignEditor({ config, onChange, onNext }: DesignEditorProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (file: File, type: "logo" | "banner" | "background") => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "x-telegram-init-data": "mock-init-data",
        },
        body: formData,
      })

      if (response.ok) {
        const { url } = await response.json()

        if (type === "logo") {
          onChange({ ...config, logoUrl: url })
        } else if (type === "banner") {
          onChange({ ...config, bannerUrl: url })
        } else if (type === "background") {
          onChange({ ...config, bgImage: url, bgColor: undefined })
        }

        // Telegram haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred("success")
        }
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Ошибка загрузки файла")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Фон документа */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Фон документа
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Цвет фона</Label>
            <div className="grid grid-cols-4 gap-3">
              {pastelColors.map((color) => (
                <button
                  key={color}
                  className={`aspect-square rounded-lg border-2 transition-all active:scale-95 ${
                    config.bgColor === color ? "border-gray-400 scale-110" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onChange({ ...config, bgColor: color, bgImage: undefined })
                    // Telegram haptic feedback
                    if (window.Telegram?.WebApp?.HapticFeedback) {
                      window.Telegram.WebApp.HapticFeedback.impactOccurred("light")
                    }
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Или загрузите изображение</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center active:bg-gray-50">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, "background")
                }}
                className="hidden"
                id="bg-upload"
                disabled={uploading}
              />
              <label htmlFor="bg-upload" className="cursor-pointer">
                <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">{uploading ? "Загрузка..." : "Нажмите для загрузки"}</p>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Логотип */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-4 w-4" />
            Логотип
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center active:bg-gray-50">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file, "logo")
              }}
              className="hidden"
              id="logo-upload"
              disabled={uploading}
            />
            <label htmlFor="logo-upload" className="cursor-pointer">
              {config.logoUrl ? (
                <img
                  src={config.logoUrl || "/placeholder.svg"}
                  alt="Logo"
                  className="mx-auto h-16 w-16 object-contain mb-2"
                />
              ) : (
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              )}
              <p className="text-sm text-gray-600">
                {uploading ? "Загрузка..." : config.logoUrl ? "Нажмите для замены" : "Загрузите логотип"}
              </p>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Баннер */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="h-4 w-4" />
            Баннер (опционально)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center active:bg-gray-50">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file, "banner")
              }}
              className="hidden"
              id="banner-upload"
              disabled={uploading}
            />
            <label htmlFor="banner-upload" className="cursor-pointer">
              {config.bannerUrl ? (
                <img
                  src={config.bannerUrl || "/placeholder.svg"}
                  alt="Banner"
                  className="mx-auto h-20 w-full object-cover rounded mb-2"
                />
              ) : (
                <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              )}
              <p className="text-sm text-gray-600">
                {uploading ? "Загрузка..." : config.bannerUrl ? "Нажмите для замены" : "Загрузите баннер"}
              </p>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Шрифт */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Type className="h-4 w-4" />
            Шрифт
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {fonts.map((font) => (
              <button
                key={font.value}
                className={`w-full p-3 text-left rounded-lg border transition-all active:scale-95 ${
                  config.font === font.value ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
                onClick={() => {
                  onChange({ ...config, font: font.value as any })
                  // Telegram haptic feedback
                  if (window.Telegram?.WebApp?.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred("light")
                  }
                }}
              >
                <span className={`font-${font.value}`}>{font.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="pt-4">
        <Button onClick={onNext} className="w-full">
          Далее: Контент
        </Button>
      </div>
    </div>
  )
}
