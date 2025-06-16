"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, GripVertical, Trash2, Type, List, ImageIcon, Video } from "lucide-react"
import type { Question } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

interface BriefEditorProps {
  questions: Question[]
  onChange: (questions: Question[]) => void
}

export default function BriefEditor({ questions, onChange }: BriefEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const addQuestion = () => {
    const newQuestion: Question = {
      id: uuidv4(),
      title: "",
      type: "text",
      required: false,
    }
    onChange([...questions, newQuestion])
  }

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = questions.map((q, i) => (i === index ? { ...q, ...updates } : q))
    onChange(updated)
  }

  const removeQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index))
  }

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    const updated = [...questions]
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)
    onChange(updated)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      moveQuestion(draggedIndex, index)
      setDraggedIndex(index)
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const getQuestionIcon = (type: Question["type"]) => {
    switch (type) {
      case "text":
        return <Type className="h-4 w-4" />
      case "multichoice":
        return <List className="h-4 w-4" />
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Конструктор вопросов</h3>
        <p className="text-gray-600">Создайте вопросы для вашего брифа</p>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card
            key={question.id}
            className="relative"
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="cursor-move">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-2">
                  {getQuestionIcon(question.type)}
                  <span className="text-sm font-medium">Вопрос {index + 1}</span>
                </div>
                <div className="ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor={`title-${question.id}`}>Заголовок вопроса</Label>
                  <Input
                    id={`title-${question.id}`}
                    value={question.title}
                    onChange={(e) => updateQuestion(index, { title: e.target.value })}
                    placeholder="Введите вопрос..."
                  />
                </div>
                <div>
                  <Label htmlFor={`type-${question.id}`}>Тип ответа</Label>
                  <Select
                    value={question.type}
                    onValueChange={(value) => updateQuestion(index, { type: value as Question["type"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Текст</SelectItem>
                      <SelectItem value="multichoice">Множественный выбор</SelectItem>
                      <SelectItem value="image">Изображение</SelectItem>
                      <SelectItem value="video">Видео</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor={`subtitle-${question.id}`}>Подзаголовок (опционально)</Label>
                <Textarea
                  id={`subtitle-${question.id}`}
                  value={question.subtitle || ""}
                  onChange={(e) => updateQuestion(index, { subtitle: e.target.value })}
                  placeholder="Дополнительное описание или инструкция..."
                  rows={2}
                />
              </div>

              {question.type === "multichoice" && (
                <div>
                  <Label>Варианты ответов</Label>
                  <div className="space-y-2">
                    {(question.options || []).map((option, optionIndex) => (
                      <div key={optionIndex} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(question.options || [])]
                            newOptions[optionIndex] = e.target.value
                            updateQuestion(index, { options: newOptions })
                          }}
                          placeholder={`Вариант ${optionIndex + 1}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newOptions = (question.options || []).filter((_, i) => i !== optionIndex)
                            updateQuestion(index, { options: newOptions })
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
                        const newOptions = [...(question.options || []), ""]
                        updateQuestion(index, { options: newOptions })
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить вариант
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id={`required-${question.id}`}
                  checked={question.required}
                  onCheckedChange={(checked) => updateQuestion(index, { required: checked })}
                />
                <Label htmlFor={`required-${question.id}`}>Обязательный вопрос</Label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button onClick={addQuestion} className="w-full max-w-md">
          <Plus className="h-4 w-4 mr-2" />
          Добавить вопрос
        </Button>
      </div>
    </div>
  )
}
