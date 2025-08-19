"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Download, FileVideo, FileAudio, FileText, Trash2 } from "lucide-react"

interface BatchFile {
  fileId: string
  fileName: string
  fileUrl: string
  fileType: "video" | "audio" | "text"
  format?: string
  quality?: string
  size?: number
  selected: boolean
}

interface BatchDownloadProps {
  files: Omit<BatchFile, "selected">[]
  onBatchDownload?: (batchId: string) => void
}

export function BatchDownload({ files, onBatchDownload }: BatchDownloadProps) {
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>(files.map((file) => ({ ...file, selected: false })))
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState<"individual" | "zip">("individual")

  const toggleFileSelection = (fileId: string) => {
    setBatchFiles((prev) => prev.map((file) => (file.fileId === fileId ? { ...file, selected: !file.selected } : file)))
  }

  const toggleSelectAll = () => {
    const allSelected = batchFiles.every((file) => file.selected)
    setBatchFiles((prev) => prev.map((file) => ({ ...file, selected: !allSelected })))
  }

  const removeFile = (fileId: string) => {
    setBatchFiles((prev) => prev.filter((file) => file.fileId !== fileId))
  }

  const startBatchDownload = async () => {
    const selectedFiles = batchFiles.filter((file) => file.selected)
    if (selectedFiles.length === 0) return

    setIsProcessing(true)

    try {
      console.log(`[v0] Starting batch download for ${selectedFiles.length} files`)

      if (downloadFormat === "individual") {
        // Download files individually
        for (const file of selectedFiles) {
          const response = await fetch("/api/download-manager", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileId: file.fileId,
              fileName: file.fileName,
              fileUrl: file.fileUrl,
              fileType: file.fileType,
              format: file.format,
              quality: file.quality,
              size: file.size,
            }),
          })

          if (!response.ok) {
            console.error(`[v0] Failed to download ${file.fileName}`)
          }
        }
      } else {
        // Create ZIP download
        const response = await fetch("/api/batch-download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            files: selectedFiles.map(({ selected, ...file }) => file),
            zipFileName: `batch_download_${Date.now()}.zip`,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            onBatchDownload?.(data.batchId)
            console.log(`[v0] Batch download created: ${data.batchId}`)
          }
        }
      }

      // Clear selected files after download
      setBatchFiles((prev) => prev.map((file) => ({ ...file, selected: false })))
    } catch (error) {
      console.error("[v0] Batch download error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "video":
        return <FileVideo className="w-4 h-4 text-blue-500" />
      case "audio":
        return <FileAudio className="w-4 h-4 text-green-500" />
      case "text":
        return <FileText className="w-4 h-4 text-orange-500" />
      default:
        return <Download className="w-4 h-4" />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const selectedFiles = batchFiles.filter((file) => file.selected)
  const totalSize = selectedFiles.reduce((sum, file) => sum + (file.size || 0), 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Batch Download
          {selectedFiles.length > 0 && <Badge variant="secondary">{selectedFiles.length} selected</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {batchFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No files available for batch download</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={batchFiles.length > 0 && batchFiles.every((file) => file.selected)}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm font-medium">Select All ({batchFiles.length} files)</span>
              </div>

              <Select value={downloadFormat} onValueChange={(value: "individual" | "zip") => setDownloadFormat(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="zip">ZIP Archive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {batchFiles.map((file) => (
                <Card key={file.fileId} className="p-3">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={file.selected} onCheckedChange={() => toggleFileSelection(file.fileId)} />

                    {getFileIcon(file.fileType)}

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.fileName}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="outline" className="text-xs">
                          {file.fileType}
                        </Badge>
                        {file.format && (
                          <Badge variant="outline" className="text-xs">
                            {file.format.toUpperCase()}
                          </Badge>
                        )}
                        {file.quality && (
                          <Badge variant="outline" className="text-xs">
                            {file.quality}
                          </Badge>
                        )}
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" onClick={() => removeFile(file.fileId)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {selectedFiles.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{selectedFiles.length} files selected</span>
                    <span className="ml-2">Total size: {formatFileSize(totalSize)}</span>
                  </div>
                </div>

                <Button onClick={startBatchDownload} disabled={isProcessing} className="w-full">
                  {isProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      {downloadFormat === "zip" ? "Download as ZIP" : "Download All"}
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
