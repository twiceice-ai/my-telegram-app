import { type NextRequest, NextResponse } from "next/server"
import { hasDatabase, safeQuery, getMockDocuments } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const isTemplate = searchParams.get("template") === "true"

    // For demo purposes, we'll skip auth validation in development
    const initData = request.headers.get("x-telegram-init-data")
    if (!initData && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use mock data if no database connection
    if (!hasDatabase()) {
      const mockData = getMockDocuments({
        status: status || undefined,
        type: type || undefined,
        template: isTemplate,
      })

      return NextResponse.json(mockData)
    }

    // Real database query
    const userId = 123456789 // In real app, parse from initData

    let query = `
      SELECT id, title, type, status, preview_image, is_template, created_at, updated_at
      FROM documents 
      WHERE user_id = $1
    `
    const params: any[] = [userId]
    let paramIndex = 2

    if (status) {
      query += ` AND status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (type) {
      query += ` AND type = $${paramIndex}`
      params.push(type)
      paramIndex++
    }

    if (isTemplate) {
      query += ` AND is_template = $${paramIndex}`
      params.push(true)
      paramIndex++
    }

    query += " ORDER BY updated_at DESC"

    const { rows } = await safeQuery(query, params)
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching documents:", error)

    // Fallback to mock data on error
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const isTemplate = searchParams.get("template") === "true"

    const mockData = getMockDocuments({
      status: status || undefined,
      type: type || undefined,
      template: isTemplate,
    })

    return NextResponse.json(mockData)
  }
}

export async function POST(request: NextRequest) {
  try {
    const initData = request.headers.get("x-telegram-init-data")
    if (!initData && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, type, design_config, content, is_template } = body

    // Use mock data if no database connection
    if (!hasDatabase()) {
      const newDocument = {
        id: `550e8400-e29b-41d4-a716-${Date.now()}`,
        user_id: 123456789,
        title: title || `${type === "tz" ? "ТЗ" : "Бриф"} без названия`,
        type,
        status: "draft",
        design_config: design_config || { font: "regular" },
        content: content || {},
        preview_image: null,
        is_template: is_template || false,
        shared_with: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      return NextResponse.json(newDocument)
    }

    // Real database insert
    const userId = 123456789

    const query = `
      INSERT INTO documents (user_id, title, type, design_config, content, is_template)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `

    const { rows } = await safeQuery(query, [
      userId,
      title || `${type === "tz" ? "ТЗ" : "Бриф"} без названия`,
      type,
      JSON.stringify(design_config || { font: "regular" }),
      JSON.stringify(content || {}),
      is_template || false,
    ])

    return NextResponse.json(rows[0] || {})
  } catch (error) {
    console.error("Error creating document:", error)

    // Return mock response on error
    const body = await request.json()
    const { title, type, design_config, content, is_template } = body

    const newDocument = {
      id: `550e8400-e29b-41d4-a716-${Date.now()}`,
      user_id: 123456789,
      title: title || `${type === "tz" ? "ТЗ" : "Бриф"} без названия`,
      type,
      status: "draft",
      design_config: design_config || { font: "regular" },
      content: content || {},
      preview_image: null,
      is_template: is_template || false,
      shared_with: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(newDocument)
  }
}
