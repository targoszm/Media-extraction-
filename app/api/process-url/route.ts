import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url, type } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    console.log("[v0] Processing URL:", url)

    try {
      // Fetch the actual URL content
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      })

      if (!response.ok) {
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

      const results = {
        transcript: `Unable to directly access URL: ${url}. This may be due to CORS restrictions or the content requiring authentication.`,
        summary: "URL processing failed - content may be protected or require special access.",
        keyPoints: ["URL access restricted", "May require authentication", "Consider downloading content manually"],
        speakers: [],
        metadata: {
          url,
          error: fetchError.message,
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
