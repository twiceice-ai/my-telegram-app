"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, ImageIcon, FileText, CheckSquare, Link, Trash2 } from "lucide-react"
import type { TZBlock } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

interface TZEditorProps {
  blocks: TZBlock[]
  onChange: (blocks: TZBlock[]) => void
}

export default function TZEditor({ blocks, onChange }: TZEditorProps) {
  const [uploading, setUploading] = useState(false)

  const addBlock = (type: TZBlock["type"]) => {
    const newBlock: TZBlock = {
      id: uuidv4(),
      type,
      content: getDefaultContent(type),
    }
    onChange([...blocks, newBlock])
  }

  const getDefaultContent = (type: TZBlock["type"]) => {
    switch (type) {
      case "media":
        return { files: [] }
      case "description":
        return { text: "" }
      case "tasks":
        return { tasks: [] }
      case "references":
        return { images: [], links: [] }
      default:
        return {}
    }
  }

  const updateBlock = (index: number, content: any) => {
    const updated = blocks.map((block, i) => (i === index ? { ...block, content } : block))
    onChange(updated)
  }

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index))
  }

  const handleFileUpload = async (file: File, blockIndex: number) => {
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
        const block = blocks[blockIndex]

        if (block.type === "media") {
          const newFiles = [...(block.content.files || []), { url, type: file.type }]
          updateBlock(blockIndex, { files: newFiles })
        } else if (block.type === "references") {
          const newImages = [...(block.content.images || []), url]
          updateBlock(blockIndex, { ...block.content, images: newImages })
        }
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Ошибка загрузки файла")
    } finally {
      setUploading(false)
    }
  }

  const getBlockIcon = (type: TZBlock["type"]) => {
    switch (type) {
      case "media":
        return <ImageIcon className="h-5 w-5" />
      case "description":
        return <FileText className="h-5 w-5" />
      case "tasks":
        return <CheckSquare className="h-5 w-5" />
      case "references":
        return <Link className="h-5 w-5" />
    }
  }

  const getBlockTitle = (type: TZBlock["type"]) => {
    switch (type) {
      case "media":
        return "Медиа файлы"
      case "description":
        return "Описание проекта"
      case "tasks":
        return "Список задач"
      case "references":
        return "Референсы"
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Конструктор ТЗ</h3>
        <p className="text-gray-600">Добавьте блоки для создания технического задания</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Button variant="outline" onClick={() => addBlock("media")} className="h-20 flex-col gap-2">
          <ImageIcon className="h-6 w-6" />
          <span className="text-sm">Медиа</span>
        </Button>
        <Button variant="outline" onClick={() => addBlock("description")} className="h-20 flex-col gap-2">
          <FileText className="h-6 w-6" />
          <span className="text-sm">Описание</span>
        </Button>
        <Button variant="outline" onClick={() => addBlock("tasks")} className="h-20 flex-col gap-2">
          <CheckSquare className="h-6 w-6" />
          <span className="text-sm">Задачи</span>
        </Button>
        <Button variant="outline" onClick={() => addBlock("references")} className="h-20 flex-col gap-2">
          <Link className="h-6 w-6" />
          <span className="text-sm">Референсы</span>
        </Button>
      </div>

      <div className="space-y-4">
        {blocks.map((block, index) => (
          <Card key={block.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  {getBlockIcon(block.type)}
                  {getBlockTitle(block.type)}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBlock(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {block.type === "media" && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        files.forEach((file) => handleFileUpload(file, index))
                      }}
                      className="hidden"
                      id={`media-upload-${block.id}`}
                      disabled={uploading}
                    />
                    <label htmlFor={`media-upload-${block.id}`} className="cursor-pointer">
                      <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        {uploading ? "Загрузка..." : "Загрузите изображения или видео"}
                      </p>
                    </label>
                  </div>

                  {block.content.files && block.content.files.length > 0 && (
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {block.content.files.map((file: any, fileIndex: number) => (
                        <div key={fileIndex} className="relative">
                          {file.type.startsWith("image/") ? (
                            <img
                              src={file.url || "/placeholder.svg"}
                              alt={`Media ${fileIndex + 1}`}
                              className="w-full h-32 object-cover rounded"
                            />
                          ) : (
                            <video src={file.url} className="w-full h-32 object-cover rounded" controls />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-1 right-1 bg-white/80"
                            onClick={() => {
                              const newFiles = block.content.files.filter((_: any, i: number) => i !== fileIndex)
                              updateBlock(index, { files: newFiles })
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {block.type === "description" && (
                <Textarea
                  value={block.content.text || ""}
                  onChange={(e) => updateBlock(index, { text: e.target.value })}
                  placeholder="Опишите проект, его цели и требования..."
                  rows={6}
                />
              )}

              {block.type === "tasks" && (
                <div className="space-y-3">
                  {(block.content.tasks || []).map((task: any, taskIndex: number) => (
                    <div key={taskIndex} className="flex items-center gap-3">
                      <Checkbox
                        checked={task.completed || false}
                        onCheckedChange={(checked) => {
                          const newTasks = [...(block.content.tasks || [])]
                          newTasks[taskIndex] = { ...task, completed: checked }
                          updateBlock(index, { tasks: newTasks })
                        }}
                      />
                      <Input
                        value={task.text || ""}
                        onChange={(e) => {
                          const newTasks = [...(block.content.tasks || [])]
                          newTasks[taskIndex] = { ...task, text: e.target.value }
                          updateBlock(index, { tasks: newTasks })
                        }}
                        placeholder="Описание задачи..."
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newTasks = (block.content.tasks || []).filter((_: any, i: number) => i !== taskIndex)
                          updateBlock(index, { tasks: newTasks })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newTasks = [...(block.content.tasks || []), { text: "", completed: false }]
                      updateBlock(index, { tasks: newTasks })
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить задачу
                  </Button>
                </div>
              )}

              {block.type === "references" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Изображения-референсы</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          files.forEach((file) => handleFileUpload(file, index))
                        }}
                        className="hidden"
                        id={`ref-upload-${block.id}`}
                        disabled={uploading}
                      />
                      <label htmlFor={`ref-upload-${block.id}`} className="cursor-pointer">
                        <ImageIcon className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-600">{uploading ? "Загрузка..." : "Загрузите референсы"}</p>
                      </label>
                    </div>

                    {block.content.images && block.content.images.length > 0 && (
                      <div className="grid gap-2 grid-cols-2 md:grid-cols-4 mt-3">
                        {block.content.images.map((image: string, imgIndex: number) => (
                          <div key={imgIndex} className="relative">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Reference ${imgIndex + 1}`}
                              className="w-full h-20 object-cover rounded"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-1 right-1 bg-white/80"
                              onClick={() => {
                                const newImages = block.content.images.filter((_: string, i: number) => i !== imgIndex)
                                updateBlock(index, { ...block.content, images: newImages })
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Ссылки</h4>
                    <div className="space-y-2">
                      {(block.content.links || []).map((link: any, linkIndex: number) => (
                        <div key={linkIndex} className="flex gap-2">
                          <Input
                            value={link.url || ""}
                            onChange={(e) => {
                              const newLinks = [...(block.content.links || [])]
                              newLinks[linkIndex] = { ...link, url: e.target.value }
                              updateBlock(index, { ...block.content, links: newLinks })
                            }}
                            placeholder="https://example.com"
                            className="flex-1"
                          />
                          <Input
                            value={link.title || ""}
                            onChange={(e) => {
                              const newLinks = [...(block.content.links || [])]
                              newLinks[linkIndex] = { ...link, title: e.target.value }
                              updateBlock(index, { ...block.content, links: newLinks })
                            }}
                            placeholder="Название ссылки"
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newLinks = (block.content.links || []).filter(
                                (_: any, i: number) => i !== linkIndex,
                              )
                              updateBlock(index, { ...block.content, links: newLinks })
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newLinks = [...(block.content.links || []), { url: "", title: "" }]
                          updateBlock(index, { ...block.content, links: newLinks })
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить ссылку
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {blocks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>Добавьте блоки для создания ТЗ</p>
        </div>
      )}
    </div>
  )
}
