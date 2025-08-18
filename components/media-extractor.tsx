"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, Video, Music, ImageIcon, X, Download, Eye } from "lucide-react"
import { ProcessingPanel } from "./processing-panel"
import { ResultsDisplay } from "./results-display"

interface UploadedFile {
  id: string
  file: File
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  results?: any
}

export function MediaExtractor() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: "uploading" as const,
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // Simulate upload and processing
    newFiles.forEach((uploadedFile) => {
      simulateProcessing(uploadedFile.id)
    })
  }, [])

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

  const simulateProcessing = async (fileId: string) => {
    setIsProcessing(true)

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: i } : f)))
    }

    // Change to processing
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "processing", progress: 0 } : f)))

    // Simulate processing
    for (let i = 0; i <= 100; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, 150))
      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: i } : f)))
    }

    // Complete processing with mock results
    const mockResults = {
      transcript: "This is a sample transcript extracted from the media file...",
      speakers: ["Speaker 1", "Speaker 2"],
      duration: "5:23",
      extractedData: {
        keyPoints: ["Important point 1", "Key insight 2", "Main topic 3"],
        sentiment: "Positive",
        topics: ["Technology", "AI", "Innovation"],
      },
    }

    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              status: "completed",
              progress: 100,
              results: mockResults,
            }
          : f,
      ),
    )

    setIsProcessing(false)
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("video/")) return Video
    if (file.type.startsWith("audio/")) return Music
    if (file.type.startsWith("image/")) return ImageIcon
    if (file.type === "application/pdf") return FileText
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

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Processing Files</h3>
          <div className="grid gap-4">
            {files.map((uploadedFile) => {
              const FileIcon = getFileIcon(uploadedFile.file)

              return (
                <div key={uploadedFile.id} className="file-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{uploadedFile.file.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
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

                  {uploadedFile.status !== "completed" && (
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
