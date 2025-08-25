import { NextRequest, NextResponse } from "next/server"
import { fileCache } from "@/lib/file-cache"
import { extractAudioFromVideo } from "@/lib/audio-extraction"

interface VideoProcessRequest {
  source: "youtube" | "upload"
  url?: string // For YouTube videos
  fileData?: string // For uploaded files
  fileName?: string
  fileType?: string
  options?: {
    extractAudio?: boolean
    generateThumbnail?: boolean
    targetFormat?: "mp4" | "webm" | "avi"
    targetQuality?: "720p" | "1080p" | "480p"
  }
}

interface VideoMetadata {
  duration: number
  width: number
  height: number
  frameRate: number
  bitrate: number
  format: string
  size: number
}

interface VideoProcessResponse {
  success: boolean
  videoId: string
  metadata: VideoMetadata
  videoUrl: string
  thumbnailUrl?: string
  audioUrl?: string
  error?: string
}

// Mock video metadata extraction (in production, would use ffprobe or similar)
function extractVideoMetadata(source: string): VideoMetadata {
  console.log(`[v0] Extracting metadata for video source: ${source}`)

  return {
    duration: 323, // 5:23 in seconds
    width: 1920,
    height: 1080,
    frameRate: 30,
    bitrate: 2500000, // 2.5 Mbps
    format: "mp4",
    size: 15728640, // 15MB
  }
}

// Mock video processing (in production, would use ffmpeg)
async function processVideo(
  source: string,
  options: VideoProcessRequest["options"] = {},
): Promise<{
  videoUrl: string
  thumbnailUrl?: string
  audioUrl?: string
}> {
  console.log(`[v0] Processing video with options:`, options)

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const videoId = `processed-${Date.now()}`
  const targetFormat = options.targetFormat || "mp4"

  const results: any = {
    videoUrl: source.startsWith("data:") ? source : `/api/video-file/${videoId}.${targetFormat}`,
  }

  if (options.generateThumbnail) {
    results.thumbnailUrl = `/placeholder.svg?height=180&width=320&query=video thumbnail`
    console.log(`[v0] Generated thumbnail for video ${videoId}`)
  }

  if (options.extractAudio) {
    if (source.startsWith("data:")) {
      try {
        console.log("[v0] Extracting audio from video data URL")
        results.audioUrl = await extractAudioFromVideo(source)
        console.log(`[v0] Successfully extracted audio for video ${videoId}`)
      } catch (error) {
        console.error("[v0] Audio extraction failed:", error)
        // Fallback to placeholder
        results.audioUrl = `/api/placeholder-audio/${videoId}.mp3`
      }
    } else {
      results.audioUrl = `/api/audio-file/${videoId}.mp3`
    }
    console.log(`[v0] Audio extraction completed for video ${videoId}`)
  }

  return results
}

export async function POST(request: NextRequest) {
  try {
    const body: VideoProcessRequest = await request.json()
    const { source, url, fileData, fileName, fileType, options = {} } = body

    console.log(`[v0] Video processing request - Source: ${source}`)

    let videoSource: string
    let videoId: string

    if (source === "youtube") {
      if (!url) {
        return NextResponse.json({ success: false, error: "YouTube URL is required" }, { status: 400 })
      }

      // First download the YouTube video
      console.log(`[v0] Downloading YouTube video: ${url}`)
      const downloadResponse = await fetch(`${request.nextUrl.origin}/api/youtube-download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, format: "video", quality: "medium" }),
      })

      if (!downloadResponse.ok) {
        throw new Error("Failed to download YouTube video")
      }

      const downloadData = await downloadResponse.json()
      if (!downloadData.success) {
        throw new Error(downloadData.error || "YouTube download failed")
      }

      videoSource = downloadData.videoData.url
      videoId = downloadData.videoInfo.videoId
      console.log(`[v0] YouTube video downloaded successfully: ${videoId}`)
    } else if (source === "upload") {
      if (!fileData || !fileName || !fileType) {
        return NextResponse.json(
          { success: false, error: "File data, name, and type are required for uploads" },
          { status: 400 },
        )
      }

      const cachedFileId = fileCache.store(fileName, fileType, fileData)
      console.log(`[v0] File cached with ID: ${cachedFileId}`)

      videoSource = `data:${fileType};base64,${fileData}`
      videoId = cachedFileId
      console.log(`[v0] Processing uploaded video: ${fileName}`)
    } else {
      return NextResponse.json({ success: false, error: "Invalid source type" }, { status: 400 })
    }

    // Extract video metadata
    const metadata = extractVideoMetadata(videoSource)
    console.log(`[v0] Extracted metadata:`, metadata)

    // Process video with options
    const processedResults = await processVideo(videoSource, options)
    console.log(`[v0] Video processing completed`)

    const response: VideoProcessResponse = {
      success: true,
      videoId,
      metadata,
      videoUrl: processedResults.videoUrl,
      thumbnailUrl: processedResults.thumbnailUrl,
      audioUrl: processedResults.audioUrl,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Video processing error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Video processing failed: ${(error as Error).message}`,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")
  const source = searchParams.get("source") || "youtube"

  if (!url) {
    return NextResponse.json({ success: false, error: "URL parameter is required" }, { status: 400 })
  }

  // Handle GET request same as POST
  return POST(
    new NextRequest(request.url, {
      method: "POST",
      body: JSON.stringify({
        source,
        url,
        options: {
          extractAudio: true,
          generateThumbnail: true,
          targetFormat: "mp4",
          targetQuality: "1080p",
        },
      }),
      headers: { "Content-Type": "application/json" },
    }),
  )
}
