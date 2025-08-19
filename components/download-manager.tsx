"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Trash2, CheckCircle, XCircle, Clock, FileVideo, FileAudio, FileText } from "lucide-react"

interface DownloadItem {
  downloadId: string
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  fileName: string
  fileSize: number
  downloadedBytes: number
  speed: number
  estimatedTimeRemaining: number
  fileType?: "video" | "audio" | "text"
  error?: string
}

interface DownloadManagerProps {
  onDownloadComplete?: (downloadId: string) => void
}

export function DownloadManager({ onDownloadComplete }: DownloadManagerProps) {
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [activeTab, setActiveTab] = useState("active")

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const response = await fetch("/api/download-manager?action=list")
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setDownloads(data.downloads)
          }
        }
      } catch (error) {
        console.error("[v0] Failed to fetch downloads:", error)
      }
    }

    fetchDownloads()
    const interval = setInterval(fetchDownloads, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Check for completed downloads
    downloads.forEach((download) => {
      if (download.status === "completed") {
        onDownloadComplete?.(download.downloadId)
      }
    })
  }, [downloads, onDownloadComplete])

  const cancelDownload = async (downloadId: string) => {
    try {
      const response = await fetch(`/api/download-manager?downloadId=${downloadId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setDownloads((prev) => prev.filter((d) => d.downloadId !== downloadId))
      }
    } catch (error) {
      console.error("[v0] Failed to cancel download:", error)
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatSpeed = (bytesPerSecond: number) => {
    return formatFileSize(bytesPerSecond) + "/s"
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  const getFileIcon = (fileType?: string) => {
    switch (fileType) {
      case "video":
        return <FileVideo className="w-4 h-4" />
      case "audio":
        return <FileAudio className="w-4 h-4" />
      case "text":
        return <FileText className="w-4 h-4" />
      default:
        return <Download className="w-4 h-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "processing":
        return <Download className="w-4 h-4 text-blue-500 animate-pulse" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const activeDownloads = downloads.filter((d) => d.status === "pending" || d.status === "processing")
  const completedDownloads = downloads.filter((d) => d.status === "completed")
  const failedDownloads = downloads.filter((d) => d.status === "failed")

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Download Manager
          {activeDownloads.length > 0 && <Badge variant="secondary">{activeDownloads.length} active</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active ({activeDownloads.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedDownloads.length})</TabsTrigger>
            <TabsTrigger value="failed">Failed ({failedDownloads.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeDownloads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Download className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No active downloads</p>
              </div>
            ) : (
              activeDownloads.map((download) => (
                <Card key={download.downloadId}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getFileIcon(download.fileType)}
                          <span className="font-medium truncate">{download.fileName}</span>
                          {getStatusIcon(download.status)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelDownload(download.downloadId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <Progress value={download.progress} className="w-full" />

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                          {formatFileSize(download.downloadedBytes)} / {formatFileSize(download.fileSize)}
                        </span>
                        <span>{Math.round(download.progress)}%</span>
                      </div>

                      {download.status === "processing" && (
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatSpeed(download.speed)}</span>
                          <span>ETA: {formatTime(download.estimatedTimeRemaining)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedDownloads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No completed downloads</p>
              </div>
            ) : (
              completedDownloads.map((download) => (
                <Card key={download.downloadId}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getFileIcon(download.fileType)}
                        <span className="font-medium truncate">{download.fileName}</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{formatFileSize(download.fileSize)}</span>
                        <Button variant="ghost" size="sm" onClick={() => cancelDownload(download.downloadId)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="failed" className="space-y-4">
            {failedDownloads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <XCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No failed downloads</p>
              </div>
            ) : (
              failedDownloads.map((download) => (
                <Card key={download.downloadId}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getFileIcon(download.fileType)}
                        <span className="font-medium truncate">{download.fileName}</span>
                        <XCircle className="w-4 h-4 text-red-500" />
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => cancelDownload(download.downloadId)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {download.error && <p className="text-sm text-red-600 mt-2">{download.error}</p>}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
