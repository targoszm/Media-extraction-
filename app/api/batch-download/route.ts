import { type NextRequest, NextResponse } from "next/server"

interface BatchDownloadRequest {
  files: Array<{
    fileId: string
    fileName: string
    fileUrl: string
    fileType: "video" | "audio" | "text"
    format?: string
    quality?: string
    size?: number
  }>
  zipFileName?: string
}

interface BatchDownloadResponse {
  success: boolean
  batchId: string
  downloads: Array<{
    fileId: string
    downloadId: string
    status: string
  }>
  zipUrl?: string
  totalSize: number
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchDownloadRequest = await request.json()
    const { files, zipFileName = "batch_download.zip" } = body

    console.log(`[v0] Batch download request - ${files.length} files`)

    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const downloads: Array<{ fileId: string; downloadId: string; status: string }> = []
    let totalSize = 0

    // Queue individual downloads
    for (const file of files) {
      try {
        const downloadResponse = await fetch(`${request.nextUrl.origin}/api/download-manager`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(file),
        })

        if (downloadResponse.ok) {
          const downloadData = await downloadResponse.json()
          downloads.push({
            fileId: file.fileId,
            downloadId: downloadData.downloadId,
            status: "queued",
          })
          totalSize += file.size || 0
        } else {
          downloads.push({
            fileId: file.fileId,
            downloadId: "",
            status: "failed",
          })
        }
      } catch (error) {
        downloads.push({
          fileId: file.fileId,
          downloadId: "",
          status: "failed",
        })
      }
    }

    // Simulate ZIP creation (in production, would actually create ZIP)
    const zipUrl = `blob:batch-${batchId}.zip`

    const response: BatchDownloadResponse = {
      success: true,
      batchId,
      downloads,
      zipUrl,
      totalSize,
    }

    console.log(`[v0] Batch download created: ${batchId}`)

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Batch download error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Batch download failed: ${(error as Error).message}`,
      },
      { status: 500 },
    )
  }
}
