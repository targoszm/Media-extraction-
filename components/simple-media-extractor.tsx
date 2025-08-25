"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FolderOpen, UploadCloud, Video, Music, FileText, Download, Play, Link, X, Presentation } from "lucide-react"
import { YouTubeMediaPlayer } from "./youtube-media-player"
import { EnhancedVideoPlayer } from "./enhanced-video-player"
import { WaveformAudioPlayer } from "./waveform-audio-player"
import { DownloadManager } from "./download-manager"
import { BatchDownload } from "./batch-download"
import { SlideExtractor } from "./slide-extractor"
import { isYouTubeUrl } from "@/lib/youtube-utils"

interface ProcessedFile {
  id: string
  name: string
  type: "video" | "audio" | "text"
  originalFile?: File
  url?: string
  cachedFileId?: string // Added cached file ID for file caching system
  extractedContent: {
    videoUrl?: string
    audioUrl?: string
    text?: string
    transcript?: string
    waveformData?: number[]
    thumbnailUrl?: string
    metadata?: any
    slides?: Array<{
      id: string
      imageUrl: string
      timestamp: number
      title?: string
    }>
  }
}

export default function SimpleMediaExtractor() {
  const [files, setFiles] = useState<ProcessedFile[]>([])
  const [processing, setProcessing] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [showUrlInput, setShowUrlInput] = useState(true)
  const [activeTab, setActiveTab] = useState("upload")

  const checkFileCache = async (file: File): Promise<string | null> => {
    try {
      const fileData = await fileToBase64(file)
      const response = await fetch("/api/file-cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          data: fileData,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          console.log(`[v0] File cached: ${file.name} (${result.fileId})`)
          return result.fileId
        }
      }
    } catch (error) {
      console.log("[v0] File caching failed:", error)
    }
    return null
  }

  const getCachedFile = async (cachedFileId: string) => {
    try {
      const response = await fetch(`/api/file-cache?fileId=${cachedFileId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          console.log(`[v0] Retrieved cached file: ${result.file.fileName}`)
          return result.file
        }
      }
    } catch (error) {
      console.log("[v0] Failed to retrieve cached file:", error)
    }
    return null
  }

  const extractSlides = async (file: ProcessedFile) => {
    if (!file.extractedContent.videoUrl && !file.url) return

    setProcessing(true)
    try {
      const response = await fetch("/api/slide-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: file.extractedContent.videoUrl || file.url,
          fileName: file.name,
          fileId: file.id,
          options: {
            threshold: 0.1,
            minInterval: 2,
            maxSlides: 50,
          },
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Update the file with extracted slides
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, extractedContent: { ...f.extractedContent, slides: result.slides } } : f,
            ),
          )
        }
      }
    } catch (error) {
      console.log("[v0] Slide extraction error:", error)
    } finally {
      setProcessing(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || [])
    if (uploadedFiles.length === 0) return

    setProcessing(true)

    for (const file of uploadedFiles) {
      const fileType = getFileType(file)

      const cachedFileId = await checkFileCache(file)

      let extractedContent
      if (cachedFileId) {
        // Try to use cached processing results
        const cachedFile = await getCachedFile(cachedFileId)
        if (cachedFile) {
          console.log(`[v0] Using cached file data for: ${file.name}`)
          // For cached files, we still need to process them but can skip some steps
          extractedContent = await processFile(file, fileType, cachedFileId)
        } else {
          extractedContent = await processFile(file, fileType)
        }
      } else {
        extractedContent = await processFile(file, fileType)
      }

      const processedFile: ProcessedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: fileType,
        originalFile: file,
        cachedFileId, // Store cached file ID
        extractedContent,
      }
      setFiles((prev) => [...prev, processedFile])
    }

    setProcessing(false)
    setActiveTab("results")
  }

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return

    setProcessing(true)

    if (isYouTubeUrl(urlInput)) {
      const processedFile: ProcessedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: "YouTube Video",
        type: "video",
        url: urlInput,
        extractedContent: await processYouTubeUrl(urlInput),
      }
      setFiles((prev) => [...prev, processedFile])
    } else {
      const processedFile: ProcessedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: "Media URL",
        type: "audio",
        url: urlInput,
        extractedContent: await processUrl(urlInput),
      }
      setFiles((prev) => [...prev, processedFile])
    }

    setUrlInput("")
    setShowUrlInput(false)
    setProcessing(false)
    setActiveTab("results")
  }

  const processYouTubeUrl = async (url: string) => {
    try {
      console.log("[v0] Processing YouTube URL with enhanced system:", url)

      // Use the new YouTube download API
      const downloadResponse = await fetch("/api/youtube-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, format: "both", quality: "medium" }),
      })

      if (downloadResponse.ok) {
        const downloadData = await downloadResponse.json()
        if (downloadData.success) {
          // Extract audio with waveform
          let waveformData: number[] = []
          if (downloadData.audioData) {
            try {
              const audioResponse = await fetch("/api/audio-extract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  source: "youtube",
                  url,
                  options: { format: "mp3", quality: "high", normalize: true },
                }),
              })

              if (audioResponse.ok) {
                const audioData = await audioResponse.json()
                if (audioData.success) {
                  waveformData = audioData.waveformData || []
                }
              }
            } catch (error) {
              console.log("[v0] Waveform extraction failed:", error)
            }
          }

          return {
            videoUrl: downloadData.videoData?.url,
            audioUrl: downloadData.audioData?.url,
            thumbnailUrl: downloadData.videoInfo?.thumbnail,
            waveformData,
            text: `YouTube Video: ${downloadData.videoInfo?.title}\n\nDuration: ${downloadData.videoInfo?.duration}\nAuthor: ${downloadData.videoInfo?.author}\nViews: ${downloadData.videoInfo?.viewCount}\n\nVideo and audio extracted successfully!`,
            metadata: downloadData.videoInfo,
          }
        }
      }

      throw new Error("YouTube processing failed")
    } catch (error) {
      return {
        text: `YouTube Processing Error: ${error instanceof Error ? error.message : "Failed"}\n\nURL: ${url}\n\nPlease check the URL and try again.`,
      }
    }
  }

  const processUrl = async (url: string) => {
    try {
      const response = await fetch("/api/process-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, type: "audio" }),
      })

      if (response.ok) {
        const result = await response.json()
        return {
          text: result.results?.transcript || result.results?.summary || `URL processed: ${url}`,
          transcript: result.results?.transcript,
        }
      }
      throw new Error(`URL processing failed: ${response.status}`)
    } catch (error) {
      return {
        text: `URL Processing Error: ${error instanceof Error ? error.message : "Failed"}\n\nURL: ${url}\n\nPlease check the URL and try again.`,
      }
    }
  }

  const getFileType = (file: File): "video" | "audio" | "text" => {
    if (file.type.startsWith("video/")) return "video"
    if (file.type.startsWith("audio/")) return "audio"
    return "text"
  }

  const processFile = async (file: File, type: "video" | "audio" | "text", cachedFileId?: string) => {
    const fileUrl = URL.createObjectURL(file)

    try {
      switch (type) {
        case "video": {
          try {
            const fileData = cachedFileId ? null : await fileToBase64(file)

            // Use new video processing API
            const videoResponse = await fetch("/api/video-process", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                source: "upload",
                fileData: fileData || (await fileToBase64(file)), // Fallback to fresh data if needed
                fileName: file.name,
                fileType: file.type,
                cachedFileId, // Pass cached file ID to API
                options: {
                  extractAudio: true,
                  generateThumbnail: true,
                  targetFormat: "mp4",
                },
              }),
            })

            if (videoResponse.ok) {
              const videoData = await videoResponse.json()
              if (videoData.success) {
                return {
                  videoUrl: videoData.videoUrl,
                  audioUrl: videoData.audioUrl,
                  thumbnailUrl: videoData.thumbnailUrl,
                  text: `Video processing completed for ${file.name}.\n\nDuration: ${videoData.metadata.duration}s\nResolution: ${videoData.metadata.width}x${videoData.metadata.height}\nFormat: ${videoData.metadata.format}${cachedFileId ? "\n\nNote: Used cached file data for faster processing." : ""}`,
                  metadata: videoData.metadata,
                }
              }
            }

            // Fallback to original processing
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
              }\n\nNext steps:\n- Configure ASSEMBLYAI_API_KEY for speech-to-text.\n- Extract audio locally and upload if needed.${cachedFileId ? "\n\nNote: File was cached for future use." : ""}`,
            }
          }
        }

        case "audio": {
          try {
            const audioData = cachedFileId ? null : await fileToBase64(file)

            // Try new Google Speech API transcription first
            const transcribeResponse = await fetch("/api/transcribe-audio", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                audioData: audioData || (await fileToBase64(file)), // Fallback to fresh data if needed
                fileName: file.name,
                fileType: file.type,
                cachedFileId, // Pass cached file ID to API
                options: {
                  language: "en-US",
                  splitOnSilence: true,
                  chunkDuration: 30,
                },
              }),
            })

            if (transcribeResponse.ok) {
              const transcribeData = await transcribeResponse.json()
              if (transcribeData.success) {
                return {
                  audioUrl: fileUrl,
                  text: `Audio transcription completed for ${file.name}.\n\nTranscription:\n${transcribeData.transcription}\n\nProcessing time: ${transcribeData.processingTime}\nWord count: ${transcribeData.wordCount}${cachedFileId ? "\n\nNote: Used cached file data for faster processing." : ""}`,
                  transcript: transcribeData.transcription,
                  metadata: {
                    processingTime: transcribeData.processingTime,
                    wordCount: transcribeData.wordCount,
                    chunks: transcribeData.chunks,
                  },
                }
              }
            }

            // Fallback to existing audio extraction API
            const audioResponse = await fetch("/api/audio-extract", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                source: "audio",
                audioData: await fileToBase64(file),
                fileName: file.name,
                fileType: file.type,
                options: { format: "mp3", quality: "high", normalize: true },
              }),
            })

            if (audioResponse.ok) {
              const audioData = await audioResponse.json()
              if (audioData.success) {
                return {
                  audioUrl: audioData.audioUrl,
                  waveformData: audioData.waveformData,
                  text: `Audio processing completed for ${file.name}.\n\nDuration: ${audioData.metadata.duration}s\nFormat: ${audioData.metadata.format}\nBitrate: ${audioData.metadata.bitrate} bps`,
                  metadata: audioData.metadata,
                }
              }
            }

            // Fallback to original processing
            const formData = new FormData()
            formData.append("file", file)
            formData.append("options", JSON.stringify({ audio: true, text: true, metadata: true, script: true }))
            const response = await fetch("/api/process", { method: "POST", body: formData })

            if (response.ok) {
              const result = await response.json()
              return {
                audioUrl: fileUrl,
                text: result.extractedText || result.transcript || `Audio processing completed for ${file.name}.`,
                transcript: result.transcript,
              }
            }
            throw new Error(`API processing failed: ${response.status}`)
          } catch (apiError) {
            return {
              audioUrl: fileUrl,
              text: `Audio File: ${file.name}\n\nProcessing Status: ${
                apiError instanceof Error ? apiError.message : "Failed"
              }\n\nConfigure ASSEMBLYAI_API_KEY for transcripts with speaker diarization.${cachedFileId ? "\n\nNote: File was cached for future use." : ""}`,
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
                  text: result.extractedText || `PDF processed: ${file.name}\n\nText extraction completed.`,
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
        text: `Error processing ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}${cachedFileId ? "\n\nNote: File was cached for future use." : ""}`,
      }
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(",")[1]) // Remove data:type;base64, prefix
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const downloadContent = async (file: ProcessedFile, contentType: "video" | "audio" | "text") => {
    const { extractedContent } = file
    try {
      let fileUrl: string | undefined
      let fileName: string
      let fileSize = 5242880 // Default 5MB

      switch (contentType) {
        case "video":
          fileUrl = extractedContent.videoUrl
          fileName = `${file.name.split(".")[0]}_video.mp4`
          break
        case "audio":
          fileUrl = extractedContent.audioUrl
          fileName = `${file.name.split(".")[0]}_audio.mp3`
          break
        case "text":
          const content = extractedContent.text || extractedContent.transcript || ""
          if (content) {
            const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
            const url = URL.createObjectURL(blob)
            fileUrl = url
            fileName = `${file.name.split(".")[0]}_extracted.txt`
            fileSize = blob.size
          }
          break
      }

      if (fileUrl) {
        if (fileUrl.includes("/placeholder.")) {
          const link = document.createElement("a")
          link.href = fileUrl
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          return
        }

        // Use download manager for other files
        const response = await fetch("/api/download-manager", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileId: file.id,
            fileName,
            fileUrl,
            fileType: contentType,
            size: fileSize,
          }),
        })

        if (response.ok) {
          const downloadData = await response.json()
          console.log("[v0] Download queued:", downloadData.downloadId)
          setActiveTab("downloads")
        }
      }
    } catch (error) {
      console.log("[v0] Download error:", error)
    }
  }

  const getBatchFiles = () => {
    return files
      .map((file) => ({
        fileId: file.id,
        fileName: file.name,
        fileUrl: file.extractedContent.videoUrl || file.extractedContent.audioUrl || "",
        fileType: file.type,
        size: 5242880, // Default size
      }))
      .filter((file) => file.fileUrl)
  }

  const extractTextFromAudio = async (file: ProcessedFile) => {
    if (!file.extractedContent.audioUrl && !file.url && !file.originalFile) return

    setProcessing(true)
    try {
      let audioData: string

      if (file.type === "video" && file.extractedContent.audioUrl) {
        try {
          // Check if the audio URL is a valid audio data URL
          if (file.extractedContent.audioUrl.startsWith("data:audio/")) {
            // Extract base64 data from the audio data URL
            audioData = file.extractedContent.audioUrl.split(",")[1]
            console.log("[v0] Using extracted MP3 audio data URL for transcription")
          } else {
            // Try to fetch the audio URL
            const response = await fetch(file.extractedContent.audioUrl)
            const blob = await response.blob()
            audioData = await new Promise((resolve) => {
              const reader = new FileReader()
              reader.onload = () => resolve((reader.result as string).split(",")[1])
              reader.readAsDataURL(blob)
            })
            console.log("[v0] Using extracted MP3 audio from URL for transcription:", file.extractedContent.audioUrl)
          }
        } catch (fetchError) {
          console.log("[v0] Failed to use extracted MP3, falling back to cached file or original:", fetchError)
          if (file.cachedFileId) {
            const cachedFile = await getCachedFile(file.cachedFileId)
            if (cachedFile) {
              audioData = cachedFile.data
              console.log("[v0] Using cached file data for transcription")
            } else if (file.originalFile) {
              audioData = await fileToBase64(file.originalFile)
            } else {
              throw new Error("No audio source available for transcription")
            }
          } else if (file.originalFile) {
            audioData = await fileToBase64(file.originalFile)
          } else {
            throw new Error("No audio source available for transcription")
          }
        }
      } else if (file.cachedFileId) {
        const cachedFile = await getCachedFile(file.cachedFileId)
        if (cachedFile) {
          audioData = cachedFile.data
          console.log("[v0] Using cached file data for transcription")
        } else if (file.originalFile) {
          audioData = await fileToBase64(file.originalFile)
        } else {
          throw new Error("No audio source available for transcription")
        }
      } else if (file.originalFile) {
        audioData = await fileToBase64(file.originalFile)
      } else {
        // For URL-based files, we'll need to fetch the audio data
        const response = await fetch(file.extractedContent.audioUrl || file.url!)
        const blob = await response.blob()
        audioData = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve((reader.result as string).split(",")[1])
          reader.readAsDataURL(blob)
        })
      }

      const transcribeResponse = await fetch("/api/transcribe-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioData,
          fileName: file.name,
          fileType:
            file.type === "video" && file.extractedContent.audioUrl
              ? "audio/mp3"
              : file.originalFile?.type || "audio/mp3",
          options: {
            language: "en-US",
            splitOnSilence: true,
            chunkDuration: 30,
          },
        }),
      })

      if (transcribeResponse.ok) {
        const transcribeData = await transcribeResponse.json()
        if (transcribeData.success) {
          // Update the file with transcription
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? {
                    ...f,
                    extractedContent: {
                      ...f.extractedContent,
                      transcript: transcribeData.transcription,
                      text: `Audio transcription completed for ${file.name}.\n\nTranscription:\n${transcribeData.transcription}\n\nProcessing time: ${transcribeData.processingTime}\nWord count: ${transcribeData.wordCount}${file.cachedFileId ? "\n\nNote: Used cached file data for faster processing." : ""}`,
                    },
                  }
                : f,
            ),
          )
        }
      }
    } catch (error) {
      console.log("[v0] Audio transcription error:", error)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="results">Results ({files.length})</TabsTrigger>
          <TabsTrigger value="transcription">Transcription</TabsTrigger>
          <TabsTrigger value="slides">Slides</TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
          <TabsTrigger value="batch">Batch</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
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
                  <span className="text-sm text-slate-500">Support for video, audio, PDF, and text files</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5 text-primary" />
                <span>Process YouTube URL or Media Link</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showUrlInput ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Paste YouTube URL or media link here..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={processing}
                    />
                    <Button onClick={handleUrlSubmit} disabled={processing || !urlInput.trim()}>
                      <Play className="w-4 h-4 mr-2" />
                      Process
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowUrlInput(false)} className="text-slate-500">
                    <X className="w-4 h-4 mr-1" />
                    Hide URL Input
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setShowUrlInput(true)} className="w-full">
                  <Link className="w-4 h-4 mr-2" />
                  Add YouTube URL or Media Link
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {files.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No files processed yet</p>
              <p className="text-sm">Upload files or process URLs to see results here</p>
            </div>
          ) : (
            files.map((file) => (
              <Card key={file.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {file.type === "video" && <Video className="w-5 h-5 text-primary" />}
                    {file.type === "audio" && <Music className="w-5 h-5 text-primary" />}
                    {file.type === "text" && <FileText className="w-5 h-5 text-primary" />}
                    <span className="truncate">{file.name}</span>
                    {file.url && <span className="text-xs bg-slate-100 px-2 py-1 rounded">URL</span>}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {file.url && isYouTubeUrl(file.url) && <YouTubeMediaPlayer youtubeUrl={file.url} />}

                  {file.type === "video" && file.extractedContent.videoUrl && !file.url && (
                    <EnhancedVideoPlayer
                      videoUrl={file.extractedContent.videoUrl}
                      thumbnailUrl={file.extractedContent.thumbnailUrl}
                      title={file.name}
                      onDownload={() => downloadContent(file, "video")}
                    />
                  )}

                  {(file.type === "audio" || file.type === "video") && file.extractedContent.audioUrl && !file.url && (
                    <WaveformAudioPlayer
                      audioUrl={file.extractedContent.audioUrl}
                      title={file.name}
                      waveformData={file.extractedContent.waveformData}
                      onDownload={() => downloadContent(file, "audio")}
                    />
                  )}

                  {file.type === "video" && (
                    <div className="flex gap-2">
                      <Button onClick={() => extractSlides(file)} disabled={processing} variant="outline" size="sm">
                        <Presentation className="w-4 h-4 mr-2" />
                        Extract Slides
                      </Button>
                      {file.extractedContent.slides && (
                        <span className="text-sm text-slate-600 flex items-center">
                          {file.extractedContent.slides.length} slides extracted
                        </span>
                      )}
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
            ))
          )}
        </TabsContent>

        <TabsContent value="transcription" className="space-y-4">
          {files.filter((f) => f.type === "audio" || (f.type === "video" && f.extractedContent.audioUrl)).length ===
          0 ? (
            <div className="text-center py-12 text-gray-500">
              <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No audio files available for transcription</p>
              <p className="text-sm">Upload audio or video files to extract text from speech</p>
            </div>
          ) : (
            files
              .filter((f) => f.type === "audio" || (f.type === "video" && f.extractedContent.audioUrl))
              .map((file) => (
                <Card key={file.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Music className="w-5 h-5 text-primary" />
                      <span className="truncate">{file.name}</span>
                      {file.extractedContent.transcript && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Transcribed</span>
                      )}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Audio Player */}
                    {file.extractedContent.audioUrl && (
                      <WaveformAudioPlayer
                        audioUrl={file.extractedContent.audioUrl}
                        title={file.name}
                        waveformData={file.extractedContent.waveformData}
                        onDownload={() => downloadContent(file, "audio")}
                      />
                    )}

                    {/* Transcription Controls */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => extractTextFromAudio(file)}
                        disabled={processing}
                        variant="outline"
                        size="sm"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {file.extractedContent.transcript ? "Re-transcribe Audio" : "Extract Text from Audio"}
                      </Button>
                      {file.extractedContent.transcript && (
                        <Button onClick={() => downloadContent(file, "text")} size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download Transcript
                        </Button>
                      )}
                    </div>

                    {/* Transcription Results */}
                    {file.extractedContent.transcript && (
                      <div>
                        <h4 className="font-medium mb-2">Transcription</h4>
                        <div className="bg-slate-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-sm text-slate-700">
                            {file.extractedContent.transcript}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    {file.extractedContent.metadata && (
                      <div className="text-xs text-slate-500 space-y-1">
                        {file.extractedContent.metadata.processingTime && (
                          <p>Processing time: {file.extractedContent.metadata.processingTime}</p>
                        )}
                        {file.extractedContent.metadata.wordCount && (
                          <p>Word count: {file.extractedContent.metadata.wordCount}</p>
                        )}
                        {file.extractedContent.metadata.duration && (
                          <p>Duration: {file.extractedContent.metadata.duration}s</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="slides">
          <SlideExtractor files={files.filter((f) => f.type === "video")} />
        </TabsContent>

        <TabsContent value="downloads">
          <DownloadManager />
        </TabsContent>

        <TabsContent value="batch">
          <BatchDownload files={getBatchFiles()} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
