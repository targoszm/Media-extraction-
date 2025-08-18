"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Copy, Search, ZoomIn, ZoomOut } from "lucide-react"
import { Input } from "@/components/ui/input"

interface TextViewerProps {
  text: string
  fileName: string
  type?: string
  metadata?: {
    pages?: number
    wordCount?: number
    language?: string
  }
}

export function TextViewer({ text, fileName, type = "text", metadata }: TextViewerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [fontSize, setFontSize] = useState(14)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName.replace(/\.[^/.]+$/, "")}_extracted.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text
    const regex = new RegExp(`(${searchTerm})`, "gi")
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
  }

  const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Extracted Text</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{type.toUpperCase()}</Badge>
            <Badge variant="outline">{wordCount} words</Badge>
            {metadata?.pages && <Badge variant="outline">{metadata.pages} pages</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setFontSize(Math.max(10, fontSize - 2))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">{fontSize}px</span>
            <Button variant="outline" size="sm" onClick={() => setFontSize(Math.min(24, fontSize + 2))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-1" />
            {copied ? "Copied!" : "Copy"}
          </Button>

          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div
          className="bg-muted/30 rounded-lg p-4 max-h-96 overflow-y-auto border"
          style={{ fontSize: `${fontSize}px` }}
        >
          <pre
            className="whitespace-pre-wrap font-mono leading-relaxed text-foreground"
            dangerouslySetInnerHTML={{
              __html: highlightText(text, searchTerm),
            }}
          />
        </div>

        {metadata && (
          <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
            {metadata.language && <span>Language: {metadata.language}</span>}
            <span>Characters: {text.length.toLocaleString()}</span>
            <span>Lines: {text.split("\n").length}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
