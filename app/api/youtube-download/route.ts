import { NextRequest, NextResponse } from "next/server"

interface YouTubeDownloadRequest {
  url: string
  format?: "video" | "audio" | "both"
  quality?: "highest" | "lowest" | "medium"
}

interface YouTubeVideoInfo {
  videoId: string
  title: string
  duration: string
  thumbnail: string
  author: string
  viewCount: string
  uploadDate: string
}

interface YouTubeDownloadResponse {
  success: boolean
  videoInfo: YouTubeVideoInfo
  videoData?: {
    url: string
    format: string
    quality: string
    size: number
  }
  audioData?: {
    url: string
    format: string
    quality: string
    size: number
  }
  error?: string
}

// Extract YouTube video ID from various URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

// Mock YouTube video info (in production, this would come from ytdl-core or similar)
function getMockVideoInfo(videoId: string): YouTubeVideoInfo {
  return {
    videoId,
    title: "Sample YouTube Video",
    duration: "5:23",
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    author: "Sample Channel",
    viewCount: "1,234,567",
    uploadDate: "2024-01-15",
  }
}

// Simulate video/audio download (in production, this would use ytdl-core)
async function downloadYouTubeContent(videoId: string, format: string, quality: string) {
  console.log(`[v0] Simulating download for video ${videoId}, format: ${format}, quality: ${quality}`)

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Return real placeholder media URLs instead of fake blob URLs
  if (format === "video") {
    return {
      url: `/placeholder.mp4?width=1280&height=720&duration=323&title=Sample YouTube Video`,
      format: "mp4",
      quality,
      size: 15728640, // 15MB mock size
    }
  } else if (format === "audio") {
    return {
      url: `/placeholder.mp3?duration=323&title=Sample YouTube Audio`,
      format: "mp3",
      quality,
      size: 5242880, // 5MB mock size
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body: YouTubeDownloadRequest = await request.json()
    const { url, format = "both", quality = "medium" } = body

    console.log(`[v0] YouTube download request - URL: ${url}, Format: ${format}, Quality: ${quality}`)

    // Validate YouTube URL
    const videoId = extractVideoId(url)
    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid YouTube URL provided",
        },
        { status: 400 },
      )
    }

    console.log(`[v0] Extracted video ID: ${videoId}`)

    // Get video information
    const videoInfo = getMockVideoInfo(videoId)

    const response: YouTubeDownloadResponse = {
      success: true,
      videoInfo,
    }

    // Download video if requested
    if (format === "video" || format === "both") {
      console.log(`[v0] Downloading video for ${videoId}`)
      const videoData = await downloadYouTubeContent(videoId, "video", quality)
      if (videoData) {
        response.videoData = videoData
      }
    }

    // Download audio if requested
    if (format === "audio" || format === "both") {
      console.log(`[v0] Downloading audio for ${videoId}`)
      const audioData = await downloadYouTubeContent(videoId, "audio", quality)
      if (audioData) {
        response.audioData = audioData
      }
    }

    console.log(`[v0] YouTube download completed successfully`)

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] YouTube download error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to download YouTube content",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json(
      {
        success: false,
        error: "YouTube URL parameter is required",
      },
      { status: 400 },
    )
  }

  // Handle GET request same as POST
  return POST(
    new NextRequest(request.url, {
      method: "POST",
      body: JSON.stringify({ url, format: "both", quality: "medium" }),
      headers: { "Content-Type": "application/json" },
    }),
  )
}
