"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Play, Music, Video, ExternalLink, Clock, Eye, User } from "lucide-react"
import { EnhancedVideoPlayer } from "./enhanced-video-player"
import { WaveformAudioPlayer } from "./waveform-audio-player"

interface YouTubeMediaPlayerProps {
  youtubeUrl: string
  onProcessComplete?: (data: any) => void
}

interface YouTubeData {
  videoInfo: {
    videoId: string
    title: string
    duration: string
    thumbnail: string
    author: string
    viewCount: string
    uploadDate: string
  }
  videoData?: {
    url: string
    format: string
    quality: string
    size: number
  }
  audioData?: {
    url: string
    format: string
    quality: string
    size: number
  }
  waveformData?: number[]
}

export function YouTubeMediaPlayer({ youtubeUrl, onProcessComplete }: YouTubeMediaPlayerProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [youtubeData, setYoutubeData] = useState<YouTubeData | null>(null)
  const [activeTab, setActiveTab] = useState("info")
  const [error, setError] = useState<string | null>(null)

  const processYouTubeUrl = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      console.log("[v0] Processing YouTube URL:", youtubeUrl)

      // Step 1: Download YouTube content
      const downloadResponse = await fetch("/api/youtube-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: youtubeUrl,
          format: "both",
          quality: "medium",
        }),
      })

      if (!downloadResponse.ok) {
        throw new Error("Failed to download YouTube content")
      }

      const downloadData = await downloadResponse.json()
      if (!downloadData.success) {
        throw new Error(downloadData.error || "YouTube download failed")
      }

      console.log("[v0] YouTube download completed")

      // Step 2: Process video if available
      let processedVideoData = downloadData.videoData
      if (downloadData.videoData) {
        const videoProcessResponse = await fetch("/api/video-process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "youtube",
            url: youtubeUrl,
            options: {
              extractAudio: true,
              generateThumbnail: true,
              targetFormat: "mp4",
              targetQuality: "1080p",
            },
          }),
        })

        if (videoProcessResponse.ok) {
          const videoProcessData = await videoProcessResponse.json()
          if (videoProcessData.success) {
            processedVideoData = {
              ...downloadData.videoData,
              thumbnailUrl: videoProcessData.thumbnailUrl,
            }
          }
        }
      }

      // Step 3: Extract audio with waveform
      let processedAudioData = downloadData.audioData
      let waveformData: number[] = []

      if (downloadData.audioData) {
        const audioExtractResponse = await fetch("/api/audio-extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "youtube",
            url: youtubeUrl,
            options: {
              format: "mp3",
              quality: "high",
              bitrate: 192000,
              normalize: true,
            },
          }),
        })

        if (audioExtractResponse.ok) {
          const audioExtractData = await audioExtractResponse.json()
          if (audioExtractData.success) {
            processedAudioData = {
              ...downloadData.audioData,
              url: audioExtractData.audioUrl,
            }
            waveformData = audioExtractData.waveformData || []
          }
        }
      }

      const finalData: YouTubeData = {
        videoInfo: downloadData.videoInfo,
        videoData: processedVideoData,
        audioData: processedAudioData,
        waveformData,
      }

      setYoutubeData(finalData)
      setActiveTab("video")
      onProcessComplete?.(finalData)

      console.log("[v0] YouTube processing completed successfully")
    } catch (error) {
      console.error("[v0] YouTube processing error:", error)
      setError(error instanceof Error ? error.message : "Processing failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadVideo = () => {
    if (youtubeData?.videoData) {
      const link = document.createElement("a")
      link.href = youtubeData.videoData.url
      link.download = `${youtubeData.videoInfo.title}.${youtubeData.videoData.format}`
      link.click()
    }
  }

  const downloadAudio = () => {
    if (youtubeData?.audioData) {
      const link = document.createElement("a")
      link.href = youtubeData.audioData.url
      link.download = `${youtubeData.videoInfo.title}.${youtubeData.audioData.format}`
      link.click()
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5 text-red-500" />
          YouTube Media Processor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!youtubeData && (
          <div className="text-center space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">YouTube URL:</p>
              <p className="font-mono text-sm break-all">{youtubeUrl}</p>
            </div>

            <Button onClick={processYouTubeUrl} disabled={isProcessing} size="lg">
              {isProcessing ? (
                <>Processing YouTube Content...</>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Extract Video & Audio
                </>
              )}
            </Button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}

        {youtubeData && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="download">Download</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={youtubeData.videoInfo.thumbnail || "/placeholder.svg"}
                  alt={youtubeData.videoInfo.title}
                  className="w-32 h-24 object-cover rounded-lg"
                />
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg">{youtubeData.videoInfo.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {youtubeData.videoInfo.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {youtubeData.videoInfo.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {youtubeData.videoInfo.viewCount} views
                    </span>
                  </div>
                  <Badge variant="secondary">{youtubeData.videoInfo.uploadDate}</Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="video">
              {youtubeData.videoData ? (
                <EnhancedVideoPlayer
                  videoUrl={youtubeData.videoData.url}
                  thumbnailUrl={youtubeData.videoInfo.thumbnail}
                  title={youtubeData.videoInfo.title}
                  onDownload={downloadVideo}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Video not available</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="audio">
              {youtubeData.audioData ? (
                <WaveformAudioPlayer
                  audioUrl={youtubeData.audioData.url}
                  title={youtubeData.videoInfo.title}
                  waveformData={youtubeData.waveformData}
                  onDownload={downloadAudio}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Audio not available</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="download" className="space-y-4">
              <div className="grid gap-4">
                {youtubeData.videoData && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Video ({youtubeData.videoData.quality})
                          </h4>
                          <p className="text-sm text-gray-600">
                            {youtubeData.videoData.format.toUpperCase()} • {formatFileSize(youtubeData.videoData.size)}
                          </p>
                        </div>
                        <Button onClick={downloadVideo}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {youtubeData.audioData && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            Audio ({youtubeData.audioData.quality})
                          </h4>
                          <p className="text-sm text-gray-600">
                            {youtubeData.audioData.format.toUpperCase()} • {formatFileSize(youtubeData.audioData.size)}
                          </p>
                        </div>
                        <Button onClick={downloadAudio}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex justify-center">
                <Button variant="outline" asChild>
                  <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on YouTube
                  </a>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
