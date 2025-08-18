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
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const fileUrl = URL.createObjectURL(file)

    switch (type) {
      case "video":
        return {
          videoUrl: fileUrl,
          audioUrl: fileUrl, // In real implementation, extract audio
          transcript: `[00:00] Speaker 1: This is a sample transcript from ${file.name}\n[00:15] Speaker 2: Video content has been processed successfully.\n[00:30] Speaker 1: You can now preview and download the extracted content.`,
        }
      case "audio":
        return {
          audioUrl: fileUrl,
          transcript: `[00:00] Speaker 1: Audio transcript from ${file.name}\n[00:12] Speaker 2: Voice content extracted successfully.\n[00:25] Speaker 1: Ready for download and playback.`,
        }
      case "text":
        const text = await file.text()
        return {
          text:
            text ||
            `Extracted text content from ${file.name}:\n\nThis is sample extracted text content. In a real implementation, this would contain the actual text extracted from your document using OCR or direct text extraction methods.`,
        }
      default:
        return {}
    }
  }

  const downloadContent = (file: ProcessedFile, contentType: "video" | "audio" | "text") => {
    const { extractedContent } = file
    let content = ""
    let filename = ""
    let mimeType = ""

    switch (contentType) {
      case "video":
        if (extractedContent.videoUrl) {
          const link = document.createElement("a")
          link.href = extractedContent.videoUrl
          link.download = `${file.name}_video.mp4`
          link.click()
        }
        return
      case "audio":
        if (extractedContent.audioUrl) {
          const link = document.createElement("a")
          link.href = extractedContent.audioUrl
          link.download = `${file.name}_audio.mp3`
          link.click()
        }
        return
      case "text":
        content = extractedContent.text || extractedContent.transcript || ""
        filename = `${file.name}_extracted.txt`
        mimeType = "text/plain"
        break
    }

    if (content) {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
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
