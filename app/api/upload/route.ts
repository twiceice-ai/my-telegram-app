import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const initData = request.headers.get("x-telegram-init-data")
    if (!initData && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file size (max 4.5 MB)
    if (file.size > 4.5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Check if Vercel Blob is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.warn("Vercel Blob not configured, using placeholder URL")

      // Return a placeholder URL for development
      const placeholderUrl = file.type.startsWith("image/")
        ? `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(file.name)}`
        : `/placeholder.svg?height=200&width=200&text=Video`

      return NextResponse.json({ url: placeholderUrl })
    }

    // Real Vercel Blob upload
    try {
      const { put } = await import("@vercel/blob")
      const filename = `${Date.now()}-${file.name}`
      const blob = await put(filename, file, {
        access: "public",
      })

      return NextResponse.json({ url: blob.url })
    } catch (blobError) {
      console.error("Blob upload error:", blobError)

      // Fallback to placeholder
      const placeholderUrl = file.type.startsWith("image/")
        ? `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(file.name)}`
        : `/placeholder.svg?height=200&width=200&text=Video`

      return NextResponse.json({ url: placeholderUrl })
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
