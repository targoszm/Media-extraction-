"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText, Video, Music, ImageIcon, X, Play, Link } from "lucide-react"

interface UploadedFile {
  id: string
  file?: File
  url?: string
  name: string
  type: string
  status: "uploaded" | "processing" | "completed" | "error"
  progress: number
  results?: any
  error?: string
}

export function MediaExtractor() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [urlInput, setUrlInput] = useState("")
  const [showUrlInput, setShowUrlInput] = useState(true)

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)

    const newFiles = droppedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      type: file.type,
      status: "uploaded" as const,
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const selectedFiles = Array.from(e.target.files)
    const newFiles = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      type: file.type,
      status: "uploaded" as const,
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return

    const newFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      url: urlInput,
      name: urlInput.includes("youtube") ? "YouTube Video" : "Audio/Podcast",
      type: urlInput.includes("youtube") ? "video" : "audio",
      status: "uploaded",
      progress: 0,
    }

    setFiles((prev) => [...prev, newFile])
    setUrlInput("")
    setShowUrlInput(false)
  }

  const startProcessing = async (fileId: string) => {
    const file = files.find((f) => f.id === fileId)
    if (!file) return

    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "processing" as const, progress: 0 } : f)))

    try {
      if (file.url) {
        // Process URL (including YouTube links)
        const response = await fetch("/api/process-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: file.url,
            type: file.type,
          }),
        })

        const data = await response.json()

        if (data.success && data.results) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    status: "completed" as const,
                    progress: 100,
                    results: {
                      transcript: data.results.transcript,
                      summary: data.results.summary,
                      keyPoints: data.results.keyPoints,
                      speakers: data.results.speakers || [],
                      metadata: data.results.metadata,
                    },
                  }
                : f,
            ),
          )
        } else {
          throw new Error(data.error || "Failed to process URL")
        }
      } else if (file.file) {
        // Process uploaded file
        const formData = new FormData()
        formData.append("file", file.file)

        const response = await fetch("/api/process", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (data.success && data.results) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    status: "completed" as const,
                    progress: 100,
                    results: data.results,
                  }
                : f,
            ),
          )
        } else {
          throw new Error(data.error || "Failed to process file")
        }
      }
    } catch (error) {
      console.error("Processing error:", error)
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error" as const,
                progress: 0,
                error: error instanceof Error ? error.message : "Processing failed",
              }
            : f,
        ),
      )
    }
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const getFileIcon = (file: UploadedFile) => {
    if (file.file?.type.startsWith("video/") || file.type === "video") return Video
    if (file.file?.type.startsWith("audio/") || file.type === "audio") return Music
    if (file.file?.type.startsWith("image/")) return ImageIcon
    return FileText
  }

  return (
    <div className="space-y-8">
      <div
        className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors"
        onDrop={handleFileDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <Upload className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Upload Media Files</h3>
        <p className="text-muted-foreground mb-4">Drag & drop files here or click to browse</p>
        <input
          type="file"
          multiple
          accept="video/*,audio/*,application/pdf,image/*"
          onChange={handleFileInput}
          className="hidden"
          id="file-input"
        />
        <label
          htmlFor="file-input"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 cursor-pointer"
        >
          Choose Files
        </label>
      </div>

      <div className="text-center">
        <div className="text-muted-foreground mb-4">or</div>
        {showUrlInput ? (
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste YouTube URL or media link here..."
                className="flex-1 px-3 py-2 border border-border rounded-lg"
              />
              <button onClick={handleUrlSubmit} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                <Play className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => setShowUrlInput(false)} className="text-sm text-muted-foreground">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowUrlInput(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted"
          >
            <Link className="w-4 h-4" />
            Add YouTube URL or Link
          </button>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Files</h3>
          {files.map((file) => {
            const FileIcon = getFileIcon(file)

            return (
              <div key={file.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileIcon className="w-6 h-6 text-primary" />
                    <div>
                      <h4 className="font-medium">{file.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {file.file ? `${(file.file.size / 1024 / 1024).toFixed(2)} MB` : "URL"}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => removeFile(file.id)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {file.status === "uploaded" && (
                  <button
                    onClick={() => startProcessing(file.id)}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                  >
                    Start Processing
                  </button>
                )}

                {file.status === "processing" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing...</span>
                      <span>Please wait</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full animate-pulse w-full" />
                    </div>
                  </div>
                )}

                {file.status === "completed" && file.results && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-green-600">✓ Processing Complete</div>
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      {file.results.summary && (
                        <div>
                          <strong>Summary:</strong>
                          <div className="text-sm mt-1">{file.results.summary}</div>
                        </div>
                      )}
                      {file.results.keyPoints && file.results.keyPoints.length > 0 && (
                        <div>
                          <strong>Key Points:</strong>
                          <ul className="text-sm mt-1 list-disc list-inside">
                            {file.results.keyPoints.map((point: string, index: number) => (
                              <li key={index}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {file.results.speakers && file.results.speakers.length > 0 && (
                        <div>
                          <strong>Speakers:</strong> {file.results.speakers.join(", ")}
                        </div>
                      )}
                      {file.results.transcript && (
                        <div>
                          <strong>Content/Transcript:</strong>
                          <div className="text-sm bg-background p-2 rounded border max-h-40 overflow-y-auto">
                            {file.results.transcript}
                          </div>
                        </div>
                      )}
                      {file.results.metadata && (
                        <div className="text-xs text-muted-foreground">
                          {file.results.metadata.platform && `Platform: ${file.results.metadata.platform}`}
                          {file.results.metadata.videoId && ` | Video ID: ${file.results.metadata.videoId}`}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {file.status === "error" && (
                  <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">Error: {file.error}</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
