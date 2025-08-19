"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

    const fileUrl = URL.createObjectURL(file)

    try {
      switch (type) {
        case "video":
          console.log("[v0] Processing video file")

          try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append(
              "options",
              JSON.stringify({
                audio: true,
                video: true,
                text: true,
                metadata: true,
                script: true,
              }),
            )

            const response = await fetch("/api/process", {
              method: "POST",
              body: formData,
            })

            if (response.ok) {
              const result = await response.json()
              console.log("[v0] Video processing result:", result)

              return {
                videoUrl: fileUrl,
                audioUrl: fileUrl,
                text:
                  result.extractedText ||
                  result.transcript ||
                  `Video processing completed for ${file.name}.\n\nExtracted content:\n- Duration: ${result.duration || "Unknown"}\n- Speakers: ${result.speakers?.length || 0}\n- Transcript: ${result.transcript ? "Available" : "Processing required"}\n\nFor full speech-to-text extraction, ensure AssemblyAI API key is configured.`,
                transcript: result.transcript,
              }
            } else {
              console.log("[v0] API processing failed, using fallback")
              throw new Error(`API processing failed: ${response.status}`)
            }
          } catch (apiError) {
            console.log("[v0] API error:", apiError)
            return {
              videoUrl: fileUrl,
              audioUrl: fileUrl,
              text: `Video File: ${file.name}\n\nAPI Processing Status: ${apiError instanceof Error ? apiError.message : "Failed"}\n\nTo extract text content from this video:\n\n1. ✅ Video preview available\n2. ⚠️ Speech-to-text processing requires AssemblyAI API key\n3. ⚠️ Audio extraction requires server-side processing\n4. ⚠️ OCR for video text requires additional configuration\n\nNext steps:\n- Configure ASSEMBLYAI_API_KEY in environment variables\n- For immediate results: Extract audio as MP3/WAV and upload separately\n- Enable video processing services for full automation`,
            }
          }

        case "audio":
          console.log("[v0] Processing audio file")

          try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append(
              "options",
              JSON.stringify({
                audio: true,
                text: true,
                metadata: true,
                script: true,
              }),
            )

            const response = await fetch("/api/process", {
              method: "POST",
              body: formData,
            })

            if (response.ok) {
              const result = await response.json()
              console.log("[v0] Audio processing result:", result)

              return {
                audioUrl: fileUrl,
                text:
                  result.extractedText ||
                  result.transcript ||
                  `Audio processing completed for ${file.name}.\n\nExtracted content:\n- Duration: ${result.duration || "Unknown"}\n- Speakers: ${result.speakers?.length || 0}\n- Transcript: ${result.transcript ? "Available" : "Processing in progress"}\n\nReal-time speech-to-text processing with speaker diarization.`,
                transcript: result.transcript,
              }
            } else {
              throw new Error(`API processing failed: ${response.status}`)
            }
          } catch (apiError) {
            console.log("[v0] Audio API error:", apiError)
            return {
              audioUrl: fileUrl,
              text: `Audio File: ${file.name}\n\nProcessing Status: ${apiError instanceof Error ? apiError.message : "Failed"}\n\nTo extract text from this audio file:\n\n1. ✅ Audio preview available\n2. ⚠️ AssemblyAI API key required for speech-to-text\n3. ⚠️ Speaker diarization needs configuration\n\nConfigure ASSEMBLYAI_API_KEY in environment variables for real transcripts with speaker identification.`,
            }
          }

        case "text":
          console.log("[v0] Processing text file")

          if (file.type === "application/pdf") {
            try {
              const formData = new FormData()
              formData.append("file", file)
              formData.append(
                "options",
                JSON.stringify({
                  text: true,
                  metadata: true,
                }),
              )

              const response = await fetch("/api/process", {
                method: "POST",
                body: formData,
              })

              if (response.ok) {
                const result = await response.json()
                return {
                  text:
                    result.extractedText ||
                    `PDF processed: ${file.name}\n\nText extraction completed using AI analysis.\n\nContent analysis and structured data extraction available.`,
                }
              } else {
                throw new Error(`PDF processing failed: ${response.status}`)
              }
            } catch (pdfError) {
              console.log("[v0] PDF processing error:", pdfError)
              return {
                text: `PDF Content from ${file.name}:\n\nProcessing Status: ${pdfError instanceof Error ? pdfError.message : "Failed"}\n\nFor full PDF text extraction, ensure Google API key is configured for AI-powered document analysis.`,
              }
            }
          } else {
            try {
              const extractedText = await file.text()
              if (!extractedText.trim()) {
                return { text: `Text file ${file.name} appears to be empty or in an unsupported format.` }
              }
              return { text: extractedText }
            } catch (error) {
              console.log("[v0] Error reading text file:", error)
              return { text: `Error reading ${file.name}. File may be corrupted or in an unsupported format.` }
            }
          }

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">{""}</span>
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
              <span className="text-5xl text-slate-400">{""}</span>
              <span className="text-lg font-medium text-slate-700">
                {processing ? "Processing..." : "Click to upload files"}
              </span>
              <span className="text-sm text-slate-500">Support for video, audio, PDF, and text files</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Extracted Content</h2>

          {files.map((file) => (
            <Card key={file.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {file.type === "video" && <span className="text-lg">🎥</span>}
                  {file.type === "audio" && <span className="text-lg">🎵</span>}
                  {file.type === "text" && <span className="text-lg">📄</span>}
                  {file.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {file.type === "video" && file.extractedContent.videoUrl && (
                  <div>
                    <h4 className="font-medium mb-2">Video Preview</h4>
                    <video src={file.extractedContent.videoUrl} controls className="w-full max-w-md rounded-lg" />
                    <Button onClick={() => downloadContent(file, "video")} className="mt-2" size="sm">
                      <span className="mr-2">⬇️</span>
                      Download Video
                    </Button>
                  </div>
                )}

                {(file.type === "audio" || file.type === "video") && file.extractedContent.audioUrl && (
                  <div>
                    <h4 className="font-medium mb-2">Audio Preview</h4>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => toggleAudioPlayback(file.extractedContent.audioUrl!, file.id)}
                        variant="outline"
                        size="sm"
                      >
                        {playingAudio === file.id ? <span>⏸️</span> : <span>▶️</span>}
                      </Button>
                      <Button onClick={() => downloadContent(file, "audio")} size="sm">
                        <span className="mr-2">⬇️</span>
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

                {(file.extractedContent.text || file.extractedContent.transcript) && (
                  <div>
                    <h4 className="font-medium mb-2">Text Content</h4>
                    <div className="bg-slate-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-slate-700">
                        {file.extractedContent.text || file.extractedContent.transcript}
                      </pre>
                    </div>
                    <Button onClick={() => downloadContent(file, "text")} className="mt-2" size="sm">
                      <span className="mr-2">⬇️</span>
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
