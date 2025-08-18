import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { fileId, fileData, fileName, fileType } = await request.json()

    if (fileType.startsWith("video/") || fileType.startsWith("audio/")) {
      // For v0 compatibility, we'll return the original audio data or provide guidance for video files
      if (fileType.startsWith("audio/")) {
        const audioBlob = `data:${fileType};base64,${fileData}`

        return NextResponse.json({
          success: true,
          fileId,
          extractedAudio: {
            url: audioBlob,
            fileName: fileName,
            duration: "Unknown",
            format: fileType.split("/")[1],
            size: "Original size",
            note: "Audio file ready for processing",
          },
        })
      } else {
        // For video files, provide guidance since we can't extract audio without ffmpeg
        return NextResponse.json({
          success: false,
          fileId,
          message:
            "Video audio extraction requires server-side processing. Please extract audio separately and upload as an audio file.",
          suggestion: "Use tools like VLC or online converters to extract audio from video files.",
        })
      }
    }

    return NextResponse.json({ error: "File type not supported for audio extraction" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Audio extraction failed: " + (error as Error).message }, { status: 500 })
  }
}
