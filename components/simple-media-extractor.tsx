"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FolderOpen, UploadCloud, Video, Music, FileText, Download, Play, Link, X } from "lucide-react"
import { YouTubeMediaPlayer } from "./youtube-media-player"
import { EnhancedVideoPlayer } from "./enhanced-video-player"
import { WaveformAudioPlayer } from "./waveform-audio-player"
import { DownloadManager } from "./download-manager"
import { BatchDownload } from "./batch-download"
import { isYouTubeUrl } from "@/lib/youtube-utils"

interface ProcessedFile {
  id: string
  name: string
  type: "video" | "audio" | "text"
  originalFile?: File
  url?: string
  extractedContent: {
    videoUrl?: string
    audioUrl?: string
    text?: string
    transcript?: string
    waveformData?: number[]
    thumbnailUrl?: string
    metadata?: any
  }
}

export default function SimpleMediaExtractor() {
  const [files, setFiles] = useState<ProcessedFile[]>([])
  const [processing, setProcessing] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [showUrlInput, setShowUrlInput] = useState(true)
  const [activeTab, setActiveTab] = useState("upload")

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

  const processFile = async (file: File, type: "video" | "audio" | "text") => {
    const fileUrl = URL.createObjectURL(file)

    try {
      switch (type) {
        case "video": {
          try {
            // Use new video processing API
            const videoResponse = await fetch("/api/video-process", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                source: "upload",
                fileData: await fileToBase64(file),
                fileName: file.name,
                fileType: file.type,
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
                  text: `Video processing completed for ${file.name}.\n\nDuration: ${videoData.metadata.duration}s\nResolution: ${videoData.metadata.width}x${videoData.metadata.height}\nFormat: ${videoData.metadata.format}`,
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
              }\n\nNext steps:\n- Configure ASSEMBLYAI_API_KEY for speech-to-text.\n- Extract audio locally and upload if needed.`,
            }
          }
        }

        case "audio": {
          try {
            // Use new audio extraction API
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
        text: `Error processing ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
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
          if (file.url && file.url.includes("youtube")) {
            alert(
              "YouTube video download is not available. The video content remains on YouTube's servers. You can download the extracted transcript instead.",
            )
            return
          }
          fileUrl = extractedContent.videoUrl
          fileName = `${file.name.split(".")[0]}_video.mp4`
          break
        case "audio":
          if (file.url && file.url.includes("youtube")) {
            alert(
              "YouTube audio download is not available. The audio content remains on YouTube's servers. You can download the extracted transcript instead.",
            )
            return
          }
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
        // Use new download manager
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="results">Results ({files.length})</TabsTrigger>
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
