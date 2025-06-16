import { sql } from "@vercel/postgres"

// Check if we have a database connection
export const hasDatabase = () => {
  return !!(process.env.POSTGRES_URL || process.env.DATABASE_URL)
}

// Safe database query wrapper
export const safeQuery = async (query: string, params: any[] = []) => {
  if (!hasDatabase()) {
    console.warn("No database connection available, using mock data")
    return { rows: [] }
  }

  try {
    return await sql.query(query, params)
  } catch (error) {
    console.error("Database query error:", error)
    return { rows: [] }
  }
}

// Mock data for development
export const mockDocuments = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    user_id: 123456789,
    title: "Лендинг для стартапа",
    type: "tz",
    status: "active",
    design_config: {
      bgColor: "#E5F3FF",
      font: "regular",
    },
    content: {
      blocks: [
        {
          id: "block1",
          type: "description",
          content: { text: "Создать современный лендинг для IT-стартапа" },
        },
      ],
    },
    preview_image: null,
    is_template: false,
    shared_with: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    user_id: 123456789,
    title: "Бриф для дизайна логотипа",
    type: "brief",
    status: "draft",
    design_config: {
      bgColor: "#E5FFE5",
      font: "regular",
    },
    content: {
      questions: [
        {
          id: "q1",
          title: "Какой стиль логотипа вы предпочитаете?",
          type: "multichoice",
          options: ["Минималистичный", "Классический", "Современный"],
          required: true,
        },
      ],
    },
    preview_image: null,
    is_template: false,
    shared_with: [],
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    user_id: 123456789,
    title: "ТЗ на мобильное приложение",
    type: "tz",
    status: "completed",
    design_config: {
      bgColor: "#FFE5E5",
      font: "bold",
    },
    content: {
      blocks: [
        {
          id: "block1",
          type: "description",
          content: { text: "Разработка мобильного приложения для доставки еды" },
        },
        {
          id: "block2",
          type: "tasks",
          content: {
            tasks: [
              { text: "Создать дизайн интерфейса", completed: true },
              { text: "Разработать API", completed: true },
              { text: "Тестирование", completed: false },
            ],
          },
        },
      ],
    },
    preview_image: null,
    is_template: false,
    shared_with: [],
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    user_id: 123456789,
    title: "Шаблон брифа для веб-дизайна",
    type: "brief",
    status: "draft",
    design_config: {
      bgColor: "#F0E5FF",
      font: "regular",
    },
    content: {
      questions: [
        {
          id: "q1",
          title: "Какой тип сайта вы хотите создать?",
          type: "multichoice",
          options: ["Лендинг", "Корпоративный сайт", "Интернет-магазин", "Блог"],
          required: true,
        },
        {
          id: "q2",
          title: "Опишите вашу целевую аудиторию",
          type: "text",
          required: true,
        },
      ],
    },
    preview_image: null,
    is_template: true, // Это шаблон
    shared_with: [],
    created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    user_id: 123456789,
    title: "Шаблон ТЗ для мобильного приложения",
    type: "tz",
    status: "draft",
    design_config: {
      bgColor: "#FFE5F5",
      font: "regular",
    },
    content: {
      blocks: [
        {
          id: "block1",
          type: "description",
          content: { text: "Шаблон для создания ТЗ на мобильное приложение" },
        },
        {
          id: "block2",
          type: "tasks",
          content: {
            tasks: [
              { text: "Определить функциональные требования", completed: false },
              { text: "Создать wireframes", completed: false },
              { text: "Описать пользовательские сценарии", completed: false },
            ],
          },
        },
      ],
    },
    preview_image: null,
    is_template: true, // Это шаблон
    shared_with: [],
    created_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    updated_at: new Date(Date.now() - 345600000).toISOString(),
  },
  // Добавим еще документов для тестирования фильтров
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    user_id: 123456789,
    title: "Бриф для редизайна сайта",
    type: "brief",
    status: "active",
    design_config: {
      bgColor: "#E5FFFF",
      font: "regular",
    },
    content: {
      questions: [
        {
          id: "q1",
          title: "Что не устраивает в текущем дизайне?",
          type: "text",
          required: true,
        },
      ],
    },
    preview_image: null,
    is_template: false,
    shared_with: [],
    created_at: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    updated_at: new Date(Date.now() - 432000000).toISOString(),
  },
]

export const getMockDocuments = (
  filters: {
    status?: string
    type?: string
    template?: string
  } = {},
) => {
  let filtered = [...mockDocuments]

  // Фильтрация по шаблонам
  if (filters.template === "true") {
    filtered = filtered.filter((doc) => doc.is_template === true)
  } else if (filters.template === "false") {
    filtered = filtered.filter((doc) => doc.is_template === false)
  }

  // Фильтрация по статусу (только если не фильтруем шаблоны)
  if (filters.status && filters.template !== "true") {
    filtered = filtered.filter((doc) => doc.status === filters.status)
  }

  // Фильтрация по типу
  if (filters.type) {
    filtered = filtered.filter((doc) => doc.type === filters.type)
  }

  return filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
}
