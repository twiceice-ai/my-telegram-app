"use client"

import { useState, useEffect } from "react"
import {
  MoreVertical,
  FileText,
  Briefcase,
  Calendar,
  Share2,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Document, DocumentStatus } from "@/lib/types"

type SortOrder = "newest" | "oldest" | "title-asc" | "title-desc"

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "draft" | "templates">("active")
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest")

  // Функция получения документов
  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (activeTab === "templates") {
        params.append("template", "true")
      } else {
        params.append("status", activeTab)
        params.append("template", "false")
      }

      const response = await fetch(`/api/documents?${params}`, {
        headers: {
          "x-telegram-init-data": "mock-init-data",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setLoading(false)
    }
  }

  // Функция сортировки документов
  const sortDocuments = (docs: Document[], order: SortOrder): Document[] => {
    const sorted = [...docs]

    switch (order) {
      case "newest":
        return sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      case "oldest":
        return sorted.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
      case "title-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      case "title-desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title))
      default:
        return sorted
    }
  }

  // Перезагружаем документы при изменении таба
  useEffect(() => {
    fetchDocuments()
  }, [activeTab])

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
    setSortOrder("newest") // Сбрасываем сортировку при смене таба
  }

  const handleSortChange = (order: SortOrder) => {
    setSortOrder(order)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Удалить документ?")) {
      try {
        const response = await fetch(`/api/documents/${id}`, {
          method: "DELETE",
          headers: {
            "x-telegram-init-data": "mock-init-data",
          },
        })

        if (response.ok) {
          setDocuments(documents.filter((doc) => doc.id !== id))
        }
      } catch (error) {
        console.error("Error deleting document:", error)
      }
    }
  }

  const handleShare = (document: Document) => {
    const url = `https://tma.astrum.app/doc/${document.id}`
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: url,
      })
    } else {
      navigator.clipboard.writeText(url)
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("success")
      }
      alert("Ссылка скопирована!")
    }
  }

  const getStatusBadge = (status: DocumentStatus) => {
    const variants = {
      draft: { className: "bg-gray-400", text: "Черновик" },
      active: { className: "neumorphic-blue", text: "В работе" },
      completed: { className: "neumorphic-green", text: "Завершён" },
      rejected: { className: "neumorphic-red", text: "Отклонён" },
    }

    const config = variants[status]
    return (
      <span className={`${config.className} text-white text-xs px-2 py-1 rounded-lg font-medium`}>{config.text}</span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
  }

  const getSortIcon = (order: SortOrder) => {
    switch (order) {
      case "newest":
        return <ArrowDown className="h-3 w-3" />
      case "oldest":
        return <ArrowUp className="h-3 w-3" />
      case "title-asc":
        return <ArrowUp className="h-3 w-3" />
      case "title-desc":
        return <ArrowDown className="h-3 w-3" />
      default:
        return <ArrowUpDown className="h-3 w-3" />
    }
  }

  const getSortLabel = (order: SortOrder) => {
    switch (order) {
      case "newest":
        return "Сначала новые"
      case "oldest":
        return "Сначала старые"
      case "title-asc":
        return "По названию А-Я"
      case "title-desc":
        return "По названию Я-А"
      default:
        return "Сортировка"
    }
  }

  // Применяем сортировку к документам
  const sortedDocuments = sortDocuments(documents, sortOrder)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="neumorphic p-4 rounded-full">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-400 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Табы статусов */}
      <div className="flex-shrink-0 neumorphic-card p-3 mb-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <button
            onClick={() => handleTabChange("active")}
            className={`whitespace-nowrap text-xs px-3 py-2 rounded-lg neumorphic-transition flex-shrink-0 ${
              activeTab === "active" ? "neumorphic-blue text-white" : "neumorphic-button text-neumorphic-primary"
            }`}
          >
            Активные
          </button>
          <button
            onClick={() => handleTabChange("completed")}
            className={`whitespace-nowrap text-xs px-3 py-2 rounded-lg neumorphic-transition flex-shrink-0 ${
              activeTab === "completed" ? "neumorphic-green text-white" : "neumorphic-button text-neumorphic-primary"
            }`}
          >
            Завершённые
          </button>
          <button
            onClick={() => handleTabChange("draft")}
            className={`whitespace-nowrap text-xs px-3 py-2 rounded-lg neumorphic-transition flex-shrink-0 ${
              activeTab === "draft" ? "neumorphic-blue text-white" : "neumorphic-button text-neumorphic-primary"
            }`}
          >
            Черновики
          </button>
          <button
            onClick={() => handleTabChange("templates")}
            className={`whitespace-nowrap text-xs px-3 py-2 rounded-lg neumorphic-transition flex-shrink-0 ${
              activeTab === "templates" ? "neumorphic-blue text-white" : "neumorphic-button text-neumorphic-primary"
            }`}
          >
            Шаблоны
          </button>
        </div>
      </div>

      {/* Сортировка */}
      <div className="flex-shrink-0 neumorphic-card p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neumorphic-primary">Сортировка:</span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="neumorphic-button px-3 py-2 rounded-lg flex items-center gap-2 text-xs">
                {getSortIcon(sortOrder)}
                <span>{getSortLabel(sortOrder)}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 neumorphic-card border-0">
              <DropdownMenuItem
                onClick={() => handleSortChange("newest")}
                className={`text-xs ${sortOrder === "newest" ? "bg-blue-50" : ""}`}
              >
                <ArrowDown className="mr-2 h-3 w-3" />
                Сначала новые
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("oldest")}
                className={`text-xs ${sortOrder === "oldest" ? "bg-blue-50" : ""}`}
              >
                <ArrowUp className="mr-2 h-3 w-3" />
                Сначала старые
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("title-asc")}
                className={`text-xs ${sortOrder === "title-asc" ? "bg-blue-50" : ""}`}
              >
                <ArrowUp className="mr-2 h-3 w-3" />
                По названию А-Я
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("title-desc")}
                className={`text-xs ${sortOrder === "title-desc" ? "bg-blue-50" : ""}`}
              >
                <ArrowDown className="mr-2 h-3 w-3" />
                По названию Я-А
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Список документов */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {sortedDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neumorphic-secondary px-4">
            <div className="neumorphic-inset p-8 rounded-full mb-4">
              <FileText className="h-12 w-12 text-neumorphic-secondary" />
            </div>
            <p className="text-sm text-center">
              {activeTab === "templates"
                ? "Шаблоны не найдены"
                : activeTab === "draft"
                  ? "Нет черновиков"
                  : activeTab === "completed"
                    ? "Нет завершённых документов"
                    : "Нет активных документов"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {sortedDocuments.map((document) => (
              <div key={document.id} className="neumorphic-card p-4 neumorphic-active neumorphic-transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-1 neumorphic-inset p-2 rounded-lg">
                      {document.type === "tz" ? (
                        <FileText className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Briefcase className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2 mb-2 text-neumorphic-primary">
                        {document.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(document.status)}
                        <div className="flex items-center gap-1 text-xs text-neumorphic-secondary">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(document.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="neumorphic-button p-2 rounded-lg flex-shrink-0">
                        <MoreVertical className="h-4 w-4 text-neumorphic-secondary" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 neumorphic-card border-0">
                      <DropdownMenuItem onClick={() => handleShare(document)} className="text-xs">
                        <Share2 className="mr-2 h-3 w-3" />
                        Поделиться
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(document.id)} className="text-red-600 text-xs">
                        <Trash2 className="mr-2 h-3 w-3" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
