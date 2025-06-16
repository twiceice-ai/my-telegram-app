import { type NextRequest, NextResponse } from "next/server"
import { hasDatabase, safeQuery, mockDocuments } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Use mock data if no database connection
    if (!hasDatabase()) {
      const document = mockDocuments.find((doc) => doc.id === params.id)
      if (!document) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 })
      }
      return NextResponse.json(document)
    }

    // Real database query
    const { rows } = await safeQuery("SELECT * FROM documents WHERE id = $1", [params.id])

    if (rows.length === 0) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error fetching document:", error)

    // Fallback to mock data
    const document = mockDocuments.find((doc) => doc.id === params.id)
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }
    return NextResponse.json(document)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const initData = request.headers.get("x-telegram-init-data")
    if (!initData && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, design_config, content, status } = body

    // Use mock data if no database connection
    if (!hasDatabase()) {
      const updatedDocument = {
        id: params.id,
        user_id: 123456789,
        title: title || "Обновленный документ",
        type: "tz",
        status: status || "draft",
        design_config: design_config || { font: "regular" },
        content: content || {},
        preview_image: null,
        is_template: false,
        shared_with: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      return NextResponse.json(updatedDocument)
    }

    // Real database update
    const userId = 123456789

    const query = `
      UPDATE documents 
      SET title = $1, 
          design_config = $2, 
          content = $3,
          status = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND user_id = $6
      RETURNING *
    `

    const { rows } = await safeQuery(query, [
      title,
      JSON.stringify(design_config),
      JSON.stringify(content),
      status || "draft",
      params.id,
      userId,
    ])

    if (rows.length === 0) {
      return NextResponse.json({ error: "Document not found or access denied" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error updating document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const initData = request.headers.get("x-telegram-init-data")
    if (!initData && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use mock response if no database connection
    if (!hasDatabase()) {
      return NextResponse.json({ success: true })
    }

    // Real database delete
    const userId = 123456789

    const { rows } = await safeQuery("DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING id", [
      params.id,
      userId,
    ])

    if (rows.length === 0) {
      return NextResponse.json({ error: "Document not found or access denied" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
