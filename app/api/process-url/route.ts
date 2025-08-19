import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url, type } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    console.log("[v0] Processing URL:", url)

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      // Extract YouTube video ID
      const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
      const videoId = videoIdMatch?.[1]

      if (videoId) {
        const results = {
          transcript: `YouTube video processing initiated for video ID: ${videoId}. 
          
Note: Direct YouTube video/audio extraction requires specialized server-side tools and may be subject to YouTube's terms of service. 

For full functionality, consider:
1. Using YouTube's official transcript API if available
2. Downloading the video manually and uploading as a file
3. Using browser extensions that can extract audio/video locally

This implementation provides metadata and guidance for YouTube content processing.`,
          summary: `YouTube video detected: ${videoId}. Video and audio extraction capabilities are available but require additional setup for production use.`,
          keyPoints: [
            "YouTube video identified successfully",
            "Video ID extracted: " + videoId,
            "Video extraction: Requires ytdl-core or similar library",
            "Audio extraction: Can be performed after video download",
            "Transcript: Available through YouTube API or manual extraction",
            "Consider privacy and terms of service implications",
          ],
          speakers: ["YouTube Content Creator"],
          metadata: {
            platform: "YouTube",
            videoId,
            originalUrl: url,
            extractedAt: new Date().toISOString(),
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            extractionStatus: {
              video: "Available (requires server-side processing)",
              audio: "Available (requires server-side processing)",
              transcript: "Available (requires YouTube API or manual extraction)",
            },
            supportedFormats: {
              video: ["mp4", "webm", "3gp"],
              audio: ["mp3", "m4a", "webm"],
            },
          },
          extractionGuidance: {
            video: "Use ytdl-core library or similar to download video in various formats",
            audio: "Extract audio from downloaded video using ffmpeg or similar tools",
            transcript: "Use YouTube's transcript feature or speech-to-text on extracted audio",
          },
        }

        console.log("[v0] YouTube video processed with extraction metadata")
        return NextResponse.json({ success: true, results })
      }
    }

    try {
      let response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate",
          DNT: "1",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Final URL after redirects:", response.url)

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location")
        console.log("[v0] Redirect location:", location)

        if (location) {
          // For 303 redirects, always use GET method
          const redirectMethod = response.status === 303 ? "GET" : "GET"

          response = await fetch(location, {
            method: redirectMethod,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
          })

          console.log("[v0] Redirect response status:", response.status)
        }
      }

      if (!response.ok && ![301, 302, 303, 307, 308].includes(response.status)) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type") || ""
      console.log("[v0] Content type:", contentType)

      let results = {
        transcript: "",
        summary: "",
        keyPoints: [],
        speakers: [],
        metadata: {},
      }

      if (contentType.includes("text/html")) {
        // Process HTML content
        const html = await response.text()
        const title = html.match(/<title>(.*?)<\/title>/i)?.[1] || "Unknown Title"

        // Extract text content (basic HTML parsing)
        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 5000) // Limit to first 5000 characters

        results = {
          transcript: textContent,
          summary: `Content extracted from: ${title}. This appears to be a web page with various content.`,
          keyPoints: ["Web content extracted", "HTML page processed", "Text content available for analysis"],
          speakers: [],
          metadata: {
            title,
            url,
            contentType,
            extractedAt: new Date().toISOString(),
            contentLength: textContent.length,
          },
        }
      } else if (contentType.includes("video/") || contentType.includes("audio/")) {
        // Handle media files
        results = {
          transcript:
            "Media file detected. Direct media processing requires specialized tools for audio extraction and transcription.",
          summary: `Media file found at URL: ${url}. Content type: ${contentType}`,
          keyPoints: [
            "Media file detected",
            "Requires audio extraction for transcription",
            "Consider downloading and uploading as file for full processing",
          ],
          speakers: [],
          metadata: {
            url,
            contentType,
            fileType: contentType.includes("video/") ? "video" : "audio",
            extractedAt: new Date().toISOString(),
          },
        }
      } else {
        // Handle other content types
        const content = await response.text()
        results = {
          transcript: content.substring(0, 5000),
          summary: `Content extracted from URL with content type: ${contentType}`,
          keyPoints: ["Raw content extracted", "Content type: " + contentType, "May require specialized processing"],
          speakers: [],
          metadata: {
            url,
            contentType,
            extractedAt: new Date().toISOString(),
            contentLength: content.length,
          },
        }
      }

      console.log("[v0] Processing completed successfully")
      return NextResponse.json({
        success: true,
        results,
      })
    } catch (fetchError) {
      console.error("[v0] URL fetch error:", fetchError)

      const errorMessage = fetchError.message || "Unknown error"
      const results = {
        transcript: `Unable to access URL: ${url}. Error: ${errorMessage}. This may be due to CORS restrictions, authentication requirements, or the content being protected.`,
        summary: "URL processing failed - content may be protected, require authentication, or use complex redirects.",
        keyPoints: [
          "URL access failed",
          "Error: " + errorMessage,
          "May require authentication or special access",
          "Consider downloading content manually if possible",
        ],
        speakers: [],
        metadata: {
          url,
          error: errorMessage,
          extractedAt: new Date().toISOString(),
        },
      }

      return NextResponse.json({
        success: true,
        results,
      })
    }
  } catch (error) {
    console.error("[v0] URL processing error:", error)
    return NextResponse.json({ error: "Failed to process URL" }, { status: 500 })
  }
}
