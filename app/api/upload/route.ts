import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get("content-length")
    const maxSize = 500 * 1024 * 1024 // 500MB

    if (contentLength && Number.parseInt(contentLength) > maxSize) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
        },
        { status: 413 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds ${maxSize / 1024 / 1024}MB limit. Please use a smaller file or compress your media.`,
        },
        { status: 413 },
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log("[v0] File uploaded:", file.name, file.type, `${(file.size / 1024 / 1024).toFixed(2)}MB`)

    const fileInfo = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      buffer: buffer.toString("base64"), // Store as base64 for now
      status: "uploaded",
    }

    return NextResponse.json({
      success: true,
      fileId: fileInfo.id,
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 },
    )
  }
}
