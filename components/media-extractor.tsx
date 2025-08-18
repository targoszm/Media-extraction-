"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import {
  Upload,
  FileText,
  Video,
  Music,
  ImageIcon,
  X,
  Download,
  Eye,
  Link,
  Play,
  CheckSquare,
  Square,
} from "lucide-react"
import { ProcessingPanel } from "./processing-panel"
import { ResultsDisplay } from "./results-display"

interface ExtractionOptions {
  audio: boolean
  video: boolean
  text: boolean
  metadata: boolean
  script: boolean
}

interface UploadedFile {
  id: string
  file?: File
  url?: string
  name: string
  type: string
  status: "uploaded" | "previewing" | "processing" | "completed" | "error"
  progress: number
  results?: any
  error?: string
  extractionOptions?: ExtractionOptions
  previewUrl?: string
}

export function MediaExtractor() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [showUrlInput, setShowUrlInput] = useState(false)

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl)
        }
      })
    }
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => {
      let previewUrl = ""
      if ((file.type.startsWith("image/") || file.type.startsWith("video/")) && file.size < 50 * 1024 * 1024) {
        previewUrl = URL.createObjectURL(file)
      }

      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        type: file.type,
        status: "previewing" as const,
        progress: 0,
        previewUrl,
        extractionOptions: getDefaultExtractionOptions(file.type),
      }
    })

    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const getDefaultExtractionOptions = useMemo(
    () =>
      (fileType: string): ExtractionOptions => {
        if (fileType.startsWith("video/")) {
          return { audio: true, video: true, text: false, metadata: true, script: true }
        } else if (fileType.startsWith("audio/")) {
          return { audio: true, video: false, text: false, metadata: true, script: true }
        } else if (fileType === "application/pdf") {
          return { audio: false, video: false, text: true, metadata: true, script: false }
        } else if (fileType.startsWith("image/")) {
          return { audio: false, video: false, text: true, metadata: true, script: false }
        }
        return { audio: false, video: false, text: true, metadata: true, script: false }
      },
    [],
  )

  const updateExtractionOptions = useCallback((fileId: string, options: ExtractionOptions) => {
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, extractionOptions: options } : f)))
  }, [])

  const startProcessing = useCallback(
    (fileId: string) => {
      const file = files.find((f) => f.id === fileId)
      if (!file) return

      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "processing", progress: 0 } : f)))

      setTimeout(() => {
        if (file.file) {
          processFile(fileId, file.file, file.extractionOptions!)
        } else if (file.url) {
          processUrl(file.url, fileId, file.extractionOptions!)
        }
      }, 0)
    },
    [files],
  )

  const processUrl = async (url: string, fileId?: string, options?: ExtractionOptions) => {
    let urlId = fileId

    if (!urlId) {
      urlId = Math.random().toString(36).substr(2, 9)

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
        status: "previewing",
        progress: 0,
        extractionOptions: { audio: true, video: urlType === "youtube", text: false, metadata: true, script: true },
      }

      setFiles((prev) => [...prev, newUrlFile])
      setUrlInput("")
      setShowUrlInput(false)
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch("/api/process-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          type: files.find((f) => f.id === urlId)?.type || "podcast",
          extractionOptions: options,
        }),
      })

      let result
      try {
        result = await response.json()
      } catch (jsonError) {
        const textResponse = await response.text()
        console.error("[v0] URL process response not JSON:", textResponse)
        throw new Error(`URL processing failed: Server returned non-JSON response (${response.status})`)
      }

      if (!response.ok) {
        throw new Error(result.error || `URL processing failed with status ${response.status}`)
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
      console.error("[v0] URL processing error:", error)
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

  const processFile = async (fileId: string, file?: File, options?: ExtractionOptions) => {
    if (!file) return

    setIsProcessing(true)

    try {
      const maxSize = 500 * 1024 * 1024 // 500MB limit
      if (file.size > maxSize) {
        throw new Error(
          `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 500MB limit. Please use a smaller file or compress your media.`,
        )
      }

      // Upload file
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      let uploadResult
      try {
        uploadResult = await uploadResponse.json()
      } catch (jsonError) {
        const textResponse = await uploadResponse.text()
        console.error("[v0] Upload response not JSON:", textResponse)
        throw new Error(`Upload failed: Server returned non-JSON response (${uploadResponse.status})`)
      }

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || `Upload failed with status ${uploadResponse.status}`)
      }

      // Update progress to processing
      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "processing", progress: 25 } : f)))

      const fileBuffer = await file.arrayBuffer()
      const base64Data = await new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(Buffer.from(fileBuffer).toString("base64"))
        }, 0)
      })

      // Process with Gemini first
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
          extractionOptions: options,
        }),
      })

      let processResult
      try {
        processResult = await processResponse.json()
      } catch (jsonError) {
        const textResponse = await processResponse.text()
        console.error("[v0] Process response not JSON:", textResponse)
        throw new Error(`Processing failed: Server returned non-JSON response (${processResponse.status})`)
      }

      if (!processResponse.ok) {
        throw new Error(processResult.error || `Processing failed with status ${processResponse.status}`)
      }
      const results = processResult.results

      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: 50 } : f)))

      // Extract audio if requested
      if (options?.audio && (file.type.startsWith("video/") || file.type.startsWith("audio/"))) {
        try {
          const audioResponse = await fetch("/api/extract-audio", {
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

          if (audioResponse.ok) {
            const audioResult = await audioResponse.json()
            results.extractedAudio = audioResult.extractedAudio
          }
        } catch (audioError) {
          console.error("[v0] Audio extraction failed:", audioError)
          // Continue processing even if audio extraction fails
        }
      }

      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: 75 } : f)))

      // Extract video if requested
      if (options?.video && file.type.startsWith("video/")) {
        try {
          const videoResponse = await fetch("/api/extract-video", {
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

          if (videoResponse.ok) {
            const videoResult = await videoResponse.json()
            results.extractedVideo = videoResult.extractedVideo
          }
        } catch (videoError) {
          console.error("[v0] Video extraction failed:", videoError)
          // Continue processing even if video extraction fails
        }
      }

      // Complete processing
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "completed",
                progress: 100,
                results,
              }
            : f,
        ),
      )
    } catch (error) {
      console.error("[v0] Processing error:", error)
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

  const removeFile = useCallback(
    (fileId: string) => {
      const file = files.find((f) => f.id === fileId)
      if (file?.previewUrl) {
        URL.revokeObjectURL(file.previewUrl)
      }
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
    },
    [files],
  )

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

  const ExtractionOptionsPanel = ({ file }: { file: UploadedFile }) => {
    const options = file.extractionOptions!

    const toggleOption = (key: keyof ExtractionOptions) => {
      updateExtractionOptions(file.id, {
        ...options,
        [key]: !options[key],
      })
    }

    const getOptionLabel = (key: keyof ExtractionOptions) => {
      switch (key) {
        case "audio":
          return "Extract Audio/Transcription"
        case "video":
          return "Analyze Video Content"
        case "text":
          return "Extract Text Content"
        case "metadata":
          return "Extract Metadata"
        case "script":
          return "Generate Script/Dialogue"
      }
    }

    const isOptionAvailable = (key: keyof ExtractionOptions) => {
      if (file.file) {
        const type = file.file.type
        if (key === "audio") return type.startsWith("video/") || type.startsWith("audio/")
        if (key === "video") return type.startsWith("video/")
        if (key === "text") return type === "application/pdf" || type.startsWith("image/")
        if (key === "script") return type.startsWith("video/") || type.startsWith("audio/")
        return true
      } else if (file.url) {
        if (key === "audio") return true
        if (key === "video") return file.type === "youtube"
        if (key === "text") return false
        if (key === "script") return true
        return true
      }
      return true
    }

    const hasSelectedOptions = Object.values(options).some(Boolean)
    const availableOptionsCount = (Object.keys(options) as Array<keyof ExtractionOptions>).filter((key) =>
      isOptionAvailable(key),
    ).length

    return (
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h5 className="font-medium text-sm">Choose what to extract:</h5>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(options) as Array<keyof ExtractionOptions>).map((key) => {
            const available = isOptionAvailable(key)
            const checked = options[key]

            return (
              <button
                key={key}
                onClick={() => available && toggleOption(key)}
                disabled={!available}
                className={`flex items-center gap-2 p-2 rounded text-sm transition-colors ${
                  available ? "hover:bg-background cursor-pointer" : "opacity-50 cursor-not-allowed"
                }`}
              >
                {checked ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
                <span className={checked ? "text-foreground" : "text-muted-foreground"}>{getOptionLabel(key)}</span>
              </button>
            )
          })}
        </div>

        {!hasSelectedOptions && (
          <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
            Please select at least one extraction option to continue
          </div>
        )}

        <button
          onClick={() => startProcessing(file.id)}
          disabled={!hasSelectedOptions}
          className={`w-full mt-3 px-4 py-2 rounded-lg font-medium transition-colors ${
            hasSelectedOptions
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {hasSelectedOptions ? "Extract Content" : "Select Options First"}
        </button>
      </div>
    )
  }

  const dropzoneConfig = useMemo(
    () => ({
      onDrop,
      accept: {
        "video/*": [".mp4", ".avi", ".mov", ".mkv"],
        "audio/*": [".mp3", ".wav", ".m4a", ".flac"],
        "application/pdf": [".pdf"],
        "image/*": [".jpg", ".jpeg", ".png", ".gif"],
      },
      multiple: true,
    }),
    [onDrop],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneConfig)

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
          <h3 className="text-lg font-semibold">Files</h3>
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

                  {uploadedFile.previewUrl && (
                    <div className="mb-4">
                      {uploadedFile.file?.type.startsWith("image/") ? (
                        <img
                          src={uploadedFile.previewUrl || "/placeholder.svg"}
                          alt={uploadedFile.name}
                          className="max-w-full h-32 object-cover rounded-lg"
                        />
                      ) : uploadedFile.file?.type.startsWith("video/") ? (
                        <video
                          src={uploadedFile.previewUrl}
                          className="max-w-full h-32 object-cover rounded-lg"
                          controls
                        />
                      ) : null}
                    </div>
                  )}

                  {uploadedFile.status === "error" && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                      <p className="text-sm text-destructive">Error: {uploadedFile.error}</p>
                    </div>
                  )}

                  {uploadedFile.status === "previewing" && <ExtractionOptionsPanel file={uploadedFile} />}

                  {uploadedFile.status !== "completed" &&
                    uploadedFile.status !== "error" &&
                    uploadedFile.status !== "previewing" && (
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
