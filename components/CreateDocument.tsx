"use client"

import { useState } from "react"
import { FileText, Briefcase, ArrowRight } from "lucide-react"
import DocumentEditor from "./DocumentEditor"

export default function CreateDocument() {
  const [selectedType, setSelectedType] = useState<"tz" | "brief" | null>(null)

  if (selectedType) {
    return <DocumentEditor type={selectedType} onBack={() => setSelectedType(null)} />
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-neumorphic-primary mb-2">Выберите тип документа</h2>
          <p className="text-neumorphic-secondary text-sm">Создайте техническое задание или бриф для клиента</p>
        </div>

        <div className="space-y-4 max-w-sm mx-auto pb-8">
          <div
            className="neumorphic-card p-6 neumorphic-active neumorphic-transition cursor-pointer"
            onClick={() => setSelectedType("tz")}
          >
            <div className="text-center">
              <div className="mx-auto w-16 h-16 neumorphic-inset rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-base font-semibold text-neumorphic-primary mb-3">Техническое задание</h3>
              <p className="text-neumorphic-secondary mb-4 text-sm">
                Создайте подробное ТЗ с описанием, задачами и референсами
              </p>
              <div className="neumorphic-blue px-4 py-2 rounded-lg text-white text-sm font-medium inline-flex items-center">
                Создать ТЗ
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          </div>

          <div
            className="neumorphic-card p-6 neumorphic-active neumorphic-transition cursor-pointer"
            onClick={() => setSelectedType("brief")}
          >
            <div className="text-center">
              <div className="mx-auto w-16 h-16 neumorphic-inset rounded-full flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-base font-semibold text-neumorphic-primary mb-3">Бриф</h3>
              <p className="text-neumorphic-secondary mb-4 text-sm">
                Создайте интерактивный бриф с вопросами для клиента
              </p>
              <div className="neumorphic-green px-4 py-2 rounded-lg text-white text-sm font-medium inline-flex items-center">
                Создать бриф
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
