"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { FileText, Briefcase, Calendar, User } from "lucide-react"
import type { Document, Question, TZBlock } from "@/lib/types"

interface DocumentViewerProps {
  document: Document
}

export default function DocumentViewer({ document }: DocumentViewerProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: Document["status"]) => {
    const variants = {
      draft: { variant: "secondary" as const, text: "Черновик" },
      active: { variant: "default" as const, text: "В работе" },
      completed: { variant: "success" as const, text: "Завершён" },
      rejected: { variant: "destructive" as const, text: "Отклонён" },
    }

    const config = variants[status]
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const renderDocumentStyle = () => {
    const style: React.CSSProperties = {}

    if (document.design_config.bgColor) {
      style.backgroundColor = document.design_config.bgColor
    }

    if (document.design_config.bgImage) {
      style.backgroundImage = `url(${document.design_config.bgImage})`
      style.backgroundSize = "cover"
      style.backgroundPosition = "center"
    }

    return style
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Заголовок документа */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {document.type === "tz" ? (
                <FileText className="h-6 w-6 text-blue-500" />
              ) : (
                <Briefcase className="h-6 w-6 text-green-500" />
              )}
              <div>
                <CardTitle className="text-xl">{document.title}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(document.created_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    ID: {document.user_id}
                  </div>
                </div>
              </div>
            </div>
            {getStatusBadge(document.status)}
          </div>
        </CardHeader>
      </Card>

      {/* Контент документа */}
      <div className="rounded-lg p-6 min-h-[400px]" style={renderDocumentStyle()}>
        {/* Логотип и баннер */}
        {(document.design_config.logoUrl || document.design_config.bannerUrl) && (
          <div className="mb-6 text-center">
            {document.design_config.logoUrl && (
              <img
                src={document.design_config.logoUrl || "/placeholder.svg"}
                alt="Logo"
                className="mx-auto h-16 w-16 object-contain mb-4"
              />
            )}
            {document.design_config.bannerUrl && (
              <img
                src={document.design_config.bannerUrl || "/placeholder.svg"}
                alt="Banner"
                className="w-full max-h-48 object-cover rounded-lg"
              />
            )}
          </div>
        )}

        {/* Контент брифа */}
        {document.type === "brief" && document.content.questions && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">Бриф</h2>
            {document.content.questions.map((question: Question, index: number) => (
              <Card key={question.id} className="bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-gray-500">{index + 1}.</span>
                    <div className="flex-1">
                      <h3 className="font-medium">
                        {question.title}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </h3>
                      {question.subtitle && <p className="text-sm text-gray-600 mt-1">{question.subtitle}</p>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {question.type === "text" && <Textarea placeholder="Ваш ответ..." rows={3} />}

                  {question.type === "multichoice" && question.options && (
                    <RadioGroup>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                          <Label htmlFor={`${question.id}-${optionIndex}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.type === "image" && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600">Загрузите изображение</p>
                    </div>
                  )}

                  {question.type === "video" && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600">Загрузите видео</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Контент ТЗ */}
        {document.type === "tz" && document.content.blocks && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">Техническое задание</h2>
            {document.content.blocks.map((block: TZBlock, index: number) => (
              <Card key={block.id} className="bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  {block.type === "media" && block.content.files && (
                    <div>
                      <h3 className="font-medium mb-4">Медиа материалы</h3>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {block.content.files.map((file: any, fileIndex: number) => (
                          <div key={fileIndex}>
                            {file.type.startsWith("image/") ? (
                              <img
                                src={file.url || "/placeholder.svg"}
                                alt={`Media ${fileIndex + 1}`}
                                className="w-full h-48 object-cover rounded"
                              />
                            ) : (
                              <video src={file.url} className="w-full h-48 object-cover rounded" controls />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {block.type === "description" && (
                    <div>
                      <h3 className="font-medium mb-4">Описание проекта</h3>
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-wrap">{block.content.text}</p>
                      </div>
                    </div>
                  )}

                  {block.type === "tasks" && block.content.tasks && (
                    <div>
                      <h3 className="font-medium mb-4">Список задач</h3>
                      <div className="space-y-2">
                        {block.content.tasks.map((task: any, taskIndex: number) => (
                          <div key={taskIndex} className="flex items-center gap-3">
                            <Checkbox checked={task.completed} disabled />
                            <span className={task.completed ? "line-through text-gray-500" : ""}>{task.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {block.type === "references" && (
                    <div>
                      <h3 className="font-medium mb-4">Референсы</h3>

                      {block.content.images && block.content.images.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2">Изображения</h4>
                          <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
                            {block.content.images.map((image: string, imgIndex: number) => (
                              <img
                                key={imgIndex}
                                src={image || "/placeholder.svg"}
                                alt={`Reference ${imgIndex + 1}`}
                                className="w-full h-24 object-cover rounded"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {block.content.links && block.content.links.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Ссылки</h4>
                          <div className="space-y-2">
                            {block.content.links.map((link: any, linkIndex: number) => (
                              <div key={linkIndex}>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {link.title || link.url}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
