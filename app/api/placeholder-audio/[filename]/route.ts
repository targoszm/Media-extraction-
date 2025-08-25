import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const filename = params.filename
    const { searchParams } = new URL(request.url)

    console.log(`[v0] Serving placeholder audio file: ${filename}`)

    // Generate a minimal valid MP3 file (silence)
    // This is a minimal MP3 header for a short silent audio file
    const mp3Header = new Uint8Array([
      0xff,
      0xfb,
      0x90,
      0x00, // MP3 frame header
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
    ])

    const duration = searchParams.get("duration") || "0"
    const title = searchParams.get("title") || "Audio File"

    return new NextResponse(mp3Header, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": mp3Header.length.toString(),
        "Content-Disposition": `attachment; filename="${title}.mp3"`,
        "Accept-Ranges": "bytes",
      },
    })
  } catch (error) {
    console.error("[v0] Placeholder audio serving error:", error)
    return NextResponse.json({ error: "Failed to serve audio file" }, { status: 500 })
  }
}
