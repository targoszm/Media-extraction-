import { type NextRequest, NextResponse } from "next/server"
import { fileCache } from "@/lib/file-cache"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get("fileId")
  const action = searchParams.get("action")

  if (action === "stats") {
    const stats = fileCache.getCacheStats()
    return NextResponse.json({ success: true, stats })
  }

  if (!fileId) {
    return NextResponse.json({ success: false, error: "File ID is required" }, { status: 400 })
  }

  const cachedFile = fileCache.retrieve(fileId)
  if (!cachedFile) {
    return NextResponse.json({ success: false, error: "File not found in cache" }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    file: {
      id: cachedFile.id,
      fileName: cachedFile.fileName,
      fileType: cachedFile.fileType,
      uploadedAt: cachedFile.uploadedAt,
      lastAccessed: cachedFile.lastAccessed,
      size: cachedFile.size,
      data: cachedFile.data,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, fileType, data } = body

    if (!fileName || !fileType || !data) {
      return NextResponse.json({ success: false, error: "fileName, fileType, and data are required" }, { status: 400 })
    }

    const fileId = fileCache.store(fileName, fileType, data)

    return NextResponse.json({
      success: true,
      fileId,
      message: "File cached successfully",
    })
  } catch (error) {
    console.error("[v0] File cache error:", error)
    return NextResponse.json(
      { success: false, error: `File caching failed: ${(error as Error).message}` },
      { status: 500 },
    )
  }
}
