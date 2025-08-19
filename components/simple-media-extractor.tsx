"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FolderOpen,
  UploadCloud,
  Video,
  Music,
  FileText,
  Download,
  Play,
  Pause,
} from "lucide-react"

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
    const fileUrl = URL.createObjectURL(file)

    try {
      switch (type) {
        case "video": {
          try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append(
              "options",
              JSON.stringify({ audio: true, video: true, text: true, metadata: true, script: true }),
            )
            const response = await fetch("/api/process", { method: "POST", body: formData })

            if (response.ok) {
              const result = await response.json()
              return {
                videoUrl: fileUrl,
                audioUrl: fileUrl,
                text:
                  result.extractedText ||
                  result.transcript ||
                  `Video processing completed for ${file.name}.\n\nExtracted content:\n- Duration: ${result.duration || "Unknown"}\n- Speakers: ${result.speakers?.length || 0}\n- Transcript: ${result.transcript ? "Available" : "Processing required"}`,
                transcript: result.transcript,
              }
            }
            throw new Error(`API processing failed: ${response.status}`)
          } catch (apiError) {
            return {
              videoUrl: fileUrl,
              audioUrl: fileUrl,
              text: `Video File: ${file.name}\n\nAPI Processing Status: ${
                apiError instanceof Error ? apiError.message : "Failed"
              }\n\nNext steps:\n- Configure ASSEMBLYAI_API_KEY for speech-to-text.\n- Extract audio locally and upload if needed.`,
            }
          }
        }

        case "audio": {
          try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append(
              "options",
              JSON.stringify({ audio: true, text: true, metadata: true, script: true }),
            )
            const response = await fetch("/api/process", { method: "POST", body: formData })

            if (response.ok) {
              const result = await response.json()
              return {
                audioUrl: fileUrl,
                text:
                  result.extractedText ||
                  result.transcript ||
                  `Audio processing completed for ${file.name}.`,
                transcript: result.transcript,
              }
            }
            throw new Error(`API processing failed: ${response.status}`)
          } catch (apiError) {
            return {
              audioUrl: fileUrl,
              text: `Audio File: ${file.name}\n\nProcessing Status: ${
                apiError instanceof Error ? apiError.message : "Failed"
              }\n\nConfigure ASSEMBLYAI_API_KEY for transcripts with speaker diarization.`,
            }
          }
        }

        case "text": {
          if (file.type === "application/pdf") {
            try {
              const formData = new FormData()
              formData.append("file", file)
              formData.append("options", JSON.stringify({ text: true, metadata: true }))
              const response = await fetch("/api/process", { method: "POST", body: formData })
              if (response.ok) {
                const result = await response.json()
                return {
                  text:
                    result.extractedText ||
                    `PDF processed: ${file.name}\n\nText extraction completed.`,
                }
              }
              throw new Error(`PDF processing failed: ${response.status}`)
            } catch (pdfError) {
              return {
                text: `PDF Content from ${file.name}:\n\nProcessing Status: ${
                  pdfError instanceof Error ? pdfError.message : "Failed"
                }`,
              }
            }
          } else {
            try {
              const extractedText = await file.text()
              if (!extractedText.trim()) {
                return { text: `Text file ${file.name} appears to be empty or unsupported.` }
              }
              return { text: extractedText }
            } catch (error) {
              return { text: `Error reading ${file.name}. File may be corrupted or unsupported.` }
            }
          }
        }
      }
    } catch (error) {
      return {
        text: `Error processing ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  const downloadContent = (file: ProcessedFile, contentType: "video" | "audio" | "text") => {
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
          }
          return
        case "text": {
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
          }
          return
        }
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
            <FolderOpen className="w-5 h-5 text-primary" />
            <span>Upload Media Files</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
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
              <UploadCloud className="w-10 h-10 text-slate-400" />
              <span className="text-lg font-medium text-slate-700">
                {processing ? "Processing..." : "Click to upload files"}
              </span>
              <span className="text-sm text-slate-500">
                Support for video, audio, PDF, and text files
              </span>
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
                  {file.type === "video" && <Video className="w-5 h-5 text-primary" />}
                  {file.type === "audio" && <Music className="w-5 h-5 text-primary" />}
                  {file.type === "text" && <FileText className="w-5 h-5 text-primary" />}
                  <span className="truncate">{file.name}</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {file.type === "video" && file.extractedContent.videoUrl && (
                  <div>
                    <h4 className="font-medium mb-2">Video Preview</h4>
                    <video src={file.extractedContent.videoUrl} controls className="w-full max-w-md rounded-lg" />
                    <Button onClick={() => downloadContent(file, "video")} className="mt-2" size="sm">
                      <Download className="w-4 h-4 mr-2" />
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
                        {playingAudio === file.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button onClick={() => downloadContent(file, "audio")} size="sm">
                        <Download className="w-4 h-4 mr-2" />
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
                      <Download className="w-4 h-4 mr-2" />
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
