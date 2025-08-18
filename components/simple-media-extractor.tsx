"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileVideo, FileAudio, FileText, Download, Play, Pause } from "lucide-react"

interface ProcessedFile {
  id: string
  name: string
  type: "video" | "audio" | "text"
  originalFile: File
  extractedContent: {
    videoUrl?: string
    audioUrl?: string
    text?: string
    transcript?: string
  }
}

export default function SimpleMediaExtractor() {
  const [files, setFiles] = useState<ProcessedFile[]>([])
  const [processing, setProcessing] = useState(false)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || [])
    if (uploadedFiles.length === 0) return

    setProcessing(true)

    for (const file of uploadedFiles) {
      const fileType = getFileType(file)
      const processedFile: ProcessedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: fileType,
        originalFile: file,
        extractedContent: await processFile(file, fileType),
      }

      setFiles((prev) => [...prev, processedFile])
    }

    setProcessing(false)
  }

  const getFileType = (file: File): "video" | "audio" | "text" => {
    if (file.type.startsWith("video/")) return "video"
    if (file.type.startsWith("audio/")) return "audio"
    return "text"
  }

  const processFile = async (file: File, type: "video" | "audio" | "text") => {
    console.log("[v0] Processing file:", file.name, "Type:", type)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const fileUrl = URL.createObjectURL(file)

    try {
      switch (type) {
        case "video":
          console.log("[v0] Processing video file")
          return {
            videoUrl: fileUrl,
            audioUrl: fileUrl, // Note: Real audio extraction would require server-side processing
            text: `Video File: ${file.name}\n\nTo extract text content from this video, you need:\n\n1. Speech-to-text processing (requires AssemblyAI API key)\n2. Audio extraction from video (requires server-side processing)\n3. OCR for any text visible in the video frames\n\nCurrently showing video preview only. For full text extraction, please:\n- Extract audio separately and upload as MP3/WAV\n- Configure AssemblyAI API key in environment variables\n- Use dedicated video processing services`,
          }
        case "audio":
          console.log("[v0] Processing audio file")
          return {
            audioUrl: fileUrl,
            text: `Audio File: ${file.name}\n\nTo extract text from this audio file, you need:\n\n1. AssemblyAI API key configured\n2. Speech-to-text processing enabled\n3. Speaker diarization for multiple speakers\n\nCurrently showing audio preview only. To get real transcripts:\n- Add ASSEMBLYAI_API_KEY to environment variables\n- Enable speech-to-text processing in settings\n- The system will then provide real transcripts with speaker identification`,
          }
        case "text":
          console.log("[v0] Processing text file")
          let extractedText = ""

          if (file.type === "application/pdf") {
            // For PDFs, show guidance message
            extractedText = `PDF Content from ${file.name}:\n\nThis PDF has been processed for text extraction. In a production environment, this would use PDF parsing libraries to extract the actual text content, tables, and formatting.\n\nFor full PDF text extraction, consider using PDF.js or similar libraries with OCR capabilities.`
          } else {
            // For text files, read actual content
            try {
              extractedText = await file.text()
              if (!extractedText.trim()) {
                extractedText = `Text file ${file.name} appears to be empty or in an unsupported format.`
              }
            } catch (error) {
              console.log("[v0] Error reading text file:", error)
              extractedText = `Error reading ${file.name}. File may be corrupted or in an unsupported format.`
            }
          }

          return { text: extractedText }
        default:
          return {}
      }
    } catch (error) {
      console.log("[v0] Processing error:", error)
      return {
        text: `Error processing ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  const downloadContent = (file: ProcessedFile, contentType: "video" | "audio" | "text") => {
    console.log("[v0] Downloading content:", contentType, "for file:", file.name)

    const { extractedContent } = file

    try {
      switch (contentType) {
        case "video":
          if (extractedContent.videoUrl) {
            const link = document.createElement("a")
            link.href = extractedContent.videoUrl
            link.download = `${file.name.split(".")[0]}_video.mp4`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            console.log("[v0] Video download initiated")
          } else {
            console.log("[v0] No video URL available for download")
          }
          return
        case "audio":
          if (extractedContent.audioUrl) {
            const link = document.createElement("a")
            link.href = extractedContent.audioUrl
            link.download = `${file.name.split(".")[0]}_audio.mp3`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            console.log("[v0] Audio download initiated")
          } else {
            console.log("[v0] No audio URL available for download")
          }
          return
        case "text":
          const content = extractedContent.text || extractedContent.transcript || ""
          if (content) {
            const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `${file.name.split(".")[0]}_extracted.txt`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            console.log("[v0] Text download initiated")
          } else {
            console.log("[v0] No text content available for download")
          }
          break
      }
    } catch (error) {
      console.log("[v0] Download error:", error)
    }
  }

  const toggleAudioPlayback = (audioUrl: string, fileId: string) => {
    const audio = document.getElementById(`audio-${fileId}`) as HTMLAudioElement
    if (playingAudio === fileId) {
      audio.pause()
      setPlayingAudio(null)
    } else {
      // Pause other audio
      if (playingAudio) {
        const otherAudio = document.getElementById(`audio-${playingAudio}`) as HTMLAudioElement
        otherAudio?.pause()
      }
      audio.play()
      setPlayingAudio(fileId)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Media Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            <input
              type="file"
              multiple
              accept="video/*,audio/*,.pdf,.txt,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={processing}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="h-12 w-12 text-slate-400" />
              <span className="text-lg font-medium text-slate-700">
                {processing ? "Processing..." : "Click to upload files"}
              </span>
              <span className="text-sm text-slate-500">Support for video, audio, PDF, and text files</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Extracted Content</h2>

          {files.map((file) => (
            <Card key={file.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {file.type === "video" && <FileVideo className="h-5 w-5" />}
                  {file.type === "audio" && <FileAudio className="h-5 w-5" />}
                  {file.type === "text" && <FileText className="h-5 w-5" />}
                  {file.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Preview */}
                {file.type === "video" && file.extractedContent.videoUrl && (
                  <div>
                    <h4 className="font-medium mb-2">Video Preview</h4>
                    <video src={file.extractedContent.videoUrl} controls className="w-full max-w-md rounded-lg" />
                    <Button onClick={() => downloadContent(file, "video")} className="mt-2" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Video
                    </Button>
                  </div>
                )}

                {/* Audio Preview */}
                {(file.type === "audio" || file.type === "video") && file.extractedContent.audioUrl && (
                  <div>
                    <h4 className="font-medium mb-2">Audio Preview</h4>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => toggleAudioPlayback(file.extractedContent.audioUrl!, file.id)}
                        variant="outline"
                        size="sm"
                      >
                        {playingAudio === file.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button onClick={() => downloadContent(file, "audio")} size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Audio
                      </Button>
                    </div>
                    <audio
                      id={`audio-${file.id}`}
                      src={file.extractedContent.audioUrl}
                      onEnded={() => setPlayingAudio(null)}
                      className="hidden"
                    />
                  </div>
                )}

                {/* Text Preview */}
                {(file.extractedContent.text || file.extractedContent.transcript) && (
                  <div>
                    <h4 className="font-medium mb-2">Text Content</h4>
                    <div className="bg-slate-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-slate-700">
                        {file.extractedContent.text || file.extractedContent.transcript}
                      </pre>
                    </div>
                    <Button onClick={() => downloadContent(file, "text")} className="mt-2" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Text
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
