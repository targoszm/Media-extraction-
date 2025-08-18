"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, Video, Music, ImageIcon, X, Download, Eye, Link, Play } from "lucide-react"
import { ProcessingPanel } from "./processing-panel"
import { ResultsDisplay } from "./results-display"

interface UploadedFile {
  id: string
  file?: File
  url?: string
  name: string
  type: string
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  results?: any
  error?: string
}

export function MediaExtractor() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [showUrlInput, setShowUrlInput] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      type: file.type,
      status: "uploading" as const,
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // Process each file with real API calls
    newFiles.forEach((uploadedFile) => {
      processFile(uploadedFile.id, uploadedFile.file)
    })
  }, [])

  const processUrl = async (url: string) => {
    const urlId = Math.random().toString(36).substr(2, 9)

    // Determine URL type
    let urlType = "podcast"
    let displayName = url

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      urlType = "youtube"
      displayName = "YouTube Video"
    } else if (url.includes("spotify.com")) {
      urlType = "spotify"
      displayName = "Spotify Podcast"
    } else if (url.includes("apple.com/podcast")) {
      urlType = "apple"
      displayName = "Apple Podcast"
    }

    const newUrlFile: UploadedFile = {
      id: urlId,
      url,
      name: displayName,
      type: urlType,
      status: "processing",
      progress: 0,
    }

    setFiles((prev) => [...prev, newUrlFile])
    setUrlInput("")
    setShowUrlInput(false)
    setIsProcessing(true)

    try {
      // Process URL with API
      const response = await fetch("/api/process-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          type: urlType,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "URL processing failed")
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === urlId
            ? {
                ...f,
                status: "completed",
                progress: 100,
                results: result.results,
              }
            : f,
        ),
      )
    } catch (error) {
      console.error("URL processing error:", error)
      setFiles((prev) =>
        prev.map((f) =>
          f.id === urlId
            ? {
                ...f,
                status: "error",
                progress: 0,
                error: error instanceof Error ? error.message : "URL processing failed",
              }
            : f,
        ),
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".avi", ".mov", ".mkv"],
      "audio/*": [".mp3", ".wav", ".m4a", ".flac"],
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png", ".gif"],
    },
    multiple: true,
  })

  const processFile = async (fileId: string, file?: File) => {
    if (!file) return

    setIsProcessing(true)

    try {
      // Upload file
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Upload failed")
      }

      // Update progress to processing
      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "processing", progress: 50 } : f)))

      // Convert file to base64 for processing
      const fileBuffer = await file.arrayBuffer()
      const base64Data = Buffer.from(fileBuffer).toString("base64")

      // Process file with Gemini
      const processResponse = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId,
          fileData: base64Data,
          fileName: file.name,
          fileType: file.type,
        }),
      })

      const processResult = await processResponse.json()

      if (!processResponse.ok) {
        throw new Error(processResult.error || "Processing failed")
      }

      // Complete processing
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "completed",
                progress: 100,
                results: processResult.results,
              }
            : f,
        ),
      )
    } catch (error) {
      console.error("Processing error:", error)
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error",
                progress: 0,
                error: error instanceof Error ? error.message : "Processing failed",
              }
            : f,
        ),
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const getFileIcon = (item: UploadedFile) => {
    if (item.file) {
      if (item.file.type.startsWith("video/")) return Video
      if (item.file.type.startsWith("audio/")) return Music
      if (item.file.type.startsWith("image/")) return ImageIcon
      if (item.file.type === "application/pdf") return FileText
    } else if (item.url) {
      if (item.type === "youtube") return Video
      if (item.type === "podcast" || item.type === "spotify" || item.type === "apple") return Music
    }
    return FileText
  }

  return (
    <div className="space-y-8">
      {/* Upload Zone */}
      <div {...getRootProps()} className={`upload-zone ${isDragActive ? "dragover" : ""}`}>
        <input {...getInputProps()} />
        <Upload className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{isDragActive ? "Drop files here..." : "Upload Media Files"}</h3>
        <p className="text-muted-foreground mb-4">
          Drag & drop videos, audio, PDFs, or images here, or click to browse
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
          <span className="bg-muted px-2 py-1 rounded">MP4</span>
          <span className="bg-muted px-2 py-1 rounded">MP3</span>
          <span className="bg-muted px-2 py-1 rounded">PDF</span>
          <span className="bg-muted px-2 py-1 rounded">JPG</span>
          <span className="bg-muted px-2 py-1 rounded">PNG</span>
        </div>
      </div>

      <div className="text-center">
        <div className="text-muted-foreground mb-4">or</div>
        {!showUrlInput ? (
          <button onClick={() => setShowUrlInput(true)} className="action-button inline-flex items-center gap-2">
            <Link className="w-4 h-4" />
            Add YouTube or Podcast URL
          </button>
        ) : (
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste YouTube or podcast URL here..."
                className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => urlInput && processUrl(urlInput)}
                disabled={!urlInput || isProcessing}
                className="action-button px-4 py-2"
              >
                <Play className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => {
                setShowUrlInput(false)
                setUrlInput("")
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <div className="text-xs text-muted-foreground">
              Supports YouTube, Spotify, Apple Podcasts, and direct audio URLs
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Processing Files</h3>
          <div className="grid gap-4">
            {files.map((uploadedFile) => {
              const FileIcon = getFileIcon(uploadedFile)

              return (
                <div key={uploadedFile.id} className="file-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{uploadedFile.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {uploadedFile.file
                            ? `${(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB`
                            : uploadedFile.url
                              ? "URL"
                              : "Unknown"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(uploadedFile.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {uploadedFile.status === "error" && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                      <p className="text-sm text-destructive">Error: {uploadedFile.error}</p>
                    </div>
                  )}

                  {uploadedFile.status !== "completed" && uploadedFile.status !== "error" && (
                    <ProcessingPanel status={uploadedFile.status} progress={uploadedFile.progress} />
                  )}

                  {uploadedFile.status === "completed" && uploadedFile.results && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">✓ Processing Complete</span>
                        <div className="flex gap-2">
                          <button className="secondary-button text-sm py-1 px-3">
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button className="action-button text-sm py-1 px-3">
                            <Download className="w-4 h-4" />
                            Export
                          </button>
                        </div>
                      </div>
                      <ResultsDisplay results={uploadedFile.results} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
