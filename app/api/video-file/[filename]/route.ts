import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory storage for demo purposes
// In production, this would be replaced with proper file storage
const videoStorage = new Map<string, string>()

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const filename = params.filename

    // For demo purposes, return a minimal valid MP4 file
    // In production, this would serve actual processed video files
    const videoData = videoStorage.get(filename)

    if (!videoData) {
      // Return a minimal valid MP4 header to prevent demuxer errors
      const minimalMp4 = new Uint8Array([
        0x00,
        0x00,
        0x00,
        0x20,
        0x66,
        0x74,
        0x79,
        0x70, // ftyp box
        0x69,
        0x73,
        0x6f,
        0x6d,
        0x00,
        0x00,
        0x02,
        0x00,
        0x69,
        0x73,
        0x6f,
        0x6d,
        0x69,
        0x73,
        0x6f,
        0x32,
        0x61,
        0x76,
        0x63,
        0x31,
        0x6d,
        0x70,
        0x34,
        0x31,
      ])

      return new NextResponse(minimalMp4, {
        headers: {
          "Content-Type": "video/mp4",
          "Content-Length": minimalMp4.length.toString(),
          "Accept-Ranges": "bytes",
        },
      })
    }

    // Convert base64 data URL to binary
    const base64Data = videoData.split(",")[1]
    const binaryData = Buffer.from(base64Data, "base64")

    return new NextResponse(binaryData, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": binaryData.length.toString(),
        "Accept-Ranges": "bytes",
      },
    })
  } catch (error) {
    console.error("[v0] Video file serving error:", error)
    return NextResponse.json({ error: "Failed to serve video file" }, { status: 500 })
  }
}

// Store video data for serving
export function storeVideoData(filename: string, dataUrl: string) {
  videoStorage.set(filename, dataUrl)
}
