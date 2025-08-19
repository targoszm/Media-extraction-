import { type NextRequest, NextResponse } from "next/server"

interface DownloadRequest {
  fileId: string
  fileName: string
  fileUrl: string
  fileType: "video" | "audio" | "text"
  format?: string
  quality?: string
  size?: number
}

interface DownloadResponse {
  success: boolean
  downloadId: string
  downloadUrl: string
  fileName: string
  fileSize: number
  estimatedTime?: number
  error?: string
}

interface DownloadStatus {
  downloadId: string
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  fileName: string
  fileSize: number
  downloadedBytes: number
  speed: number // bytes per second
  estimatedTimeRemaining: number // seconds
  error?: string
}

// In-memory download tracking (in production, use Redis or database)
const downloadQueue = new Map<string, DownloadStatus>()

function generateDownloadId(): string {
  return `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function simulateDownloadProgress(downloadId: string, fileSize: number) {
  const status = downloadQueue.get(downloadId)
  if (!status) return

  const chunkSize = Math.max(1024 * 100, fileSize / 100) // 100KB or 1% of file
  const downloadSpeed = 1024 * 1024 * 2 // 2MB/s simulated speed

  const interval = setInterval(() => {
    const currentStatus = downloadQueue.get(downloadId)
    if (!currentStatus || currentStatus.status !== "processing") {
      clearInterval(interval)
      return
    }

    currentStatus.downloadedBytes = Math.min(currentStatus.downloadedBytes + chunkSize, fileSize)
    currentStatus.progress = (currentStatus.downloadedBytes / fileSize) * 100
    currentStatus.speed = downloadSpeed
    currentStatus.estimatedTimeRemaining = Math.max(0, (fileSize - currentStatus.downloadedBytes) / downloadSpeed)

    if (currentStatus.downloadedBytes >= fileSize) {
      currentStatus.status = "completed"
      currentStatus.progress = 100
      currentStatus.estimatedTimeRemaining = 0
      clearInterval(interval)
      console.log(`[v0] Download completed: ${downloadId}`)
    }

    downloadQueue.set(downloadId, currentStatus)
  }, 500) // Update every 500ms
}

export async function POST(request: NextRequest) {
  try {
    const body: DownloadRequest = await request.json()
    const { fileId, fileName, fileUrl, fileType, format, quality, size = 5242880 } = body

    console.log(`[v0] Download request - File: ${fileName}, Type: ${fileType}`)

    const downloadId = generateDownloadId()

    // Create download status
    const downloadStatus: DownloadStatus = {
      downloadId,
      status: "pending",
      progress: 0,
      fileName,
      fileSize: size,
      downloadedBytes: 0,
      speed: 0,
      estimatedTimeRemaining: 0,
    }

    downloadQueue.set(downloadId, downloadStatus)

    // Start processing
    setTimeout(() => {
      const status = downloadQueue.get(downloadId)
      if (status) {
        status.status = "processing"
        downloadQueue.set(downloadId, status)
        simulateDownloadProgress(downloadId, size)
      }
    }, 1000)

    const response: DownloadResponse = {
      success: true,
      downloadId,
      downloadUrl: fileUrl,
      fileName,
      fileSize: size,
      estimatedTime: Math.round(size / (1024 * 1024 * 2)), // Estimated at 2MB/s
    }

    console.log(`[v0] Download queued: ${downloadId}`)

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Download manager error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Download failed: ${(error as Error).message}`,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const downloadId = searchParams.get("downloadId")
  const action = searchParams.get("action")

  if (action === "list") {
    // Return all downloads
    const downloads = Array.from(downloadQueue.values())
    return NextResponse.json({ success: true, downloads })
  }

  if (downloadId) {
    // Return specific download status
    const status = downloadQueue.get(downloadId)
    if (status) {
      return NextResponse.json({ success: true, status })
    } else {
      return NextResponse.json({ success: false, error: "Download not found" }, { status: 404 })
    }
  }

  return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const downloadId = searchParams.get("downloadId")

  if (!downloadId) {
    return NextResponse.json({ success: false, error: "Download ID required" }, { status: 400 })
  }

  const status = downloadQueue.get(downloadId)
  if (status) {
    downloadQueue.delete(downloadId)
    console.log(`[v0] Download cancelled: ${downloadId}`)
    return NextResponse.json({ success: true, message: "Download cancelled" })
  }

  return NextResponse.json({ success: false, error: "Download not found" }, { status: 404 })
}
