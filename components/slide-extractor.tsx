"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Presentation, Download, Settings, ImageIcon, FileText } from "lucide-react"

interface Slide {
  id: string
  imageUrl: string
  timestamp: number
  title?: string
  correlation?: number
}

interface ProcessedFile {
  id: string
  name: string
  type: "video" | "audio" | "text"
  extractedContent: {
    slides?: Slide[]
    videoUrl?: string
  }
}

interface SlideExtractorProps {
  files: ProcessedFile[]
}

export function SlideExtractor({ files }: SlideExtractorProps) {
  const [selectedFile, setSelectedFile] = useState<ProcessedFile | null>(null)
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0)
  const [extractionSettings, setExtractionSettings] = useState({
    threshold: 0.1,
    minInterval: 10,
    maxSlides: 50,
    comparisonRegion: { x: 0, y: 0, width: 100, height: 100 },
  })
  const [processing, setProcessing] = useState(false)
  const [previewMode, setPreviewMode] = useState<"grid" | "list">("grid")
  const [extractedSlides, setExtractedSlides] = useState<Record<string, Slide[]>>({})

  const extractFramesFromVideo = async (videoUrl: string, fileId: string, options: any): Promise<Slide[]> => {
    const correlationThreshold = 0.999
    const minInterval = options.minInterval || 10
    const maxSlides = options.maxSlides || 50
    const slides: Slide[] = []

    console.log("[v0] Starting client-side frame extraction with threshold:", correlationThreshold)

    try {
      // Create video element
      const video = document.createElement("video")
      video.src = videoUrl
      video.crossOrigin = "anonymous"
      video.muted = true

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve
        video.onerror = reject
        video.load()
      })

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Canvas context not available")
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const duration = video.duration

      console.log("[v0] Video loaded - duration:", duration, "dimensions:", canvas.width, "x", canvas.height)

      const savedSlideTimestamps: number[] = []
      let slideCount = 0
      let previousFrameData: ImageData | null = null

      // Process frames at regular intervals
      for (let time = 0; time < duration && slideCount < maxSlides; time += minInterval) {
        video.currentTime = time

        await new Promise((resolve) => {
          video.onseeked = resolve
        })

        // Wait for frame to be ready
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Draw current frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const currentFrameData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        // Calculate correlation with previous frame
        let correlation = 1.0
        if (previousFrameData) {
          correlation = calculateFrameCorrelation(previousFrameData, currentFrameData)
        }

        console.log("[v0] Frame correlation at", time, "s:", correlation.toFixed(3))

        // Detect slide change
        if (correlation < correlationThreshold) {
          // Check for duplicates
          let isDuplicate = false
          for (const savedTime of savedSlideTimestamps) {
            if (Math.abs(savedTime - time) < minInterval * 0.5) {
              isDuplicate = true
              console.log("[v0] Skipping duplicate slide at", time, "s (similarity:", correlation.toFixed(3), ")")
              break
            }
          }

          if (!isDuplicate) {
            // Capture the frame as slide image
            const slideImageUrl = canvas.toDataURL("image/png")

            slides.push({
              id: `slide-${fileId}-${slideCount}`,
              imageUrl: slideImageUrl,
              timestamp: time,
              title: `Slide ${slideCount + 1}`,
              correlation: correlation,
            })

            savedSlideTimestamps.push(time)
            slideCount++
            console.log("[v0] Slide detected at", time, "s (correlation:", correlation.toFixed(3), ")")
          }
        }

        previousFrameData = currentFrameData
      }

      // Add final slide if needed
      if (slideCount < maxSlides && slideCount > 0) {
        video.currentTime = duration
        await new Promise((resolve) => {
          video.onseeked = resolve
        })
        await new Promise((resolve) => setTimeout(resolve, 100))

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const finalSlideUrl = canvas.toDataURL("image/png")

        slides.push({
          id: `slide-${fileId}-${slideCount}`,
          imageUrl: finalSlideUrl,
          timestamp: duration,
          title: `Slide ${slideCount + 1}`,
          correlation: 0,
        })
        console.log("[v0] Final slide saved at", duration, "s")
      }

      return slides
    } catch (error) {
      console.error("[v0] Client-side frame extraction failed:", error)
      throw error
    }
  }

  const calculateFrameCorrelation = (frame1: ImageData, frame2: ImageData): number => {
    const data1 = frame1.data
    const data2 = frame2.data

    if (data1.length !== data2.length) return 0

    let sumSquaredDiff = 0
    let sumSquared1 = 0
    let sumSquared2 = 0

    // Calculate correlation using normalized cross-correlation
    for (let i = 0; i < data1.length; i += 4) {
      // Convert to grayscale
      const gray1 = (data1[i] + data1[i + 1] + data1[i + 2]) / 3
      const gray2 = (data2[i] + data2[i + 1] + data2[i + 2]) / 3

      const diff = gray1 - gray2
      sumSquaredDiff += diff * diff
      sumSquared1 += gray1 * gray1
      sumSquared2 += gray2 * gray2
    }

    // Normalized cross-correlation
    const denominator = Math.sqrt(sumSquared1 * sumSquared2)
    if (denominator === 0) return 1.0

    const correlation = 1.0 - sumSquaredDiff / denominator
    return Math.max(0, Math.min(1, correlation))
  }

  const extractSlides = async (file: ProcessedFile) => {
    if (!file.extractedContent.videoUrl) return

    setProcessing(true)
    try {
      const clientSlides = await extractFramesFromVideo(file.extractedContent.videoUrl, file.id, extractionSettings)

      // Send extracted slides to server for processing
      const response = await fetch("/api/slide-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: file.extractedContent.videoUrl,
          fileName: file.name,
          fileId: file.id,
          options: extractionSettings,
          clientSlides: clientSlides,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.slides) {
          console.log("[v0] Slides extracted:", result.slides.length)
          setExtractedSlides((prev) => ({
            ...prev,
            [file.id]: result.slides,
          }))
          setSelectedFile(file)
          setSelectedSlideIndex(0)
        }
      }
    } catch (error) {
      console.log("[v0] Slide extraction error:", error)
    } finally {
      setProcessing(false)
    }
  }

  const downloadSlides = async (file: ProcessedFile, format: "images" | "pdf") => {
    const slides = extractedSlides[file.id]
    if (!slides) return

    try {
      const response = await fetch("/api/slides-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: file.id,
          slides: slides,
          format,
          fileName: file.name,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${file.name}_slides.${format === "pdf" ? "pdf" : "zip"}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.log("[v0] Download error:", error)
    }
  }

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const videoFiles = files.filter((f) => f.type === "video")
  const currentSlides = selectedFile ? extractedSlides[selectedFile.id] : null

  if (videoFiles.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Presentation className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg text-gray-600">No video files available</p>
          <p className="text-sm text-gray-500">Upload video files to extract slides</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* File Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Presentation className="w-5 h-5 text-primary" />
            Slide Extraction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label>Select Video File</Label>
              <div className="grid gap-2 mt-2">
                {videoFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedFile?.id === file.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{file.name}</span>
                      <div className="flex items-center gap-2">
                        {extractedSlides[file.id] && (
                          <Badge variant="secondary">{extractedSlides[file.id].length} slides</Badge>
                        )}
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            extractSlides(file)
                          }}
                          disabled={processing}
                        >
                          {processing ? "Extracting..." : "Extract"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Extraction Settings */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4" />
                <Label>Extraction Settings</Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">Sensitivity Threshold</Label>
                  <Slider
                    value={[extractionSettings.threshold]}
                    onValueChange={([value]) => setExtractionSettings((prev) => ({ ...prev, threshold: value }))}
                    min={0.01}
                    max={0.5}
                    step={0.01}
                    className="mt-2"
                  />
                  <span className="text-xs text-gray-500">{extractionSettings.threshold}</span>
                </div>
                <div>
                  <Label className="text-sm">Min Interval (seconds)</Label>
                  <Input
                    type="number"
                    value={extractionSettings.minInterval}
                    onChange={(e) =>
                      setExtractionSettings((prev) => ({ ...prev, minInterval: Number(e.target.value) }))
                    }
                    min={1}
                    max={30}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm">Max Slides</Label>
                  <Input
                    type="number"
                    value={extractionSettings.maxSlides}
                    onChange={(e) => setExtractionSettings((prev) => ({ ...prev, maxSlides: Number(e.target.value) }))}
                    min={10}
                    max={200}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {currentSlides && currentSlides.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                Extracted Slides ({currentSlides.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => downloadSlides(selectedFile!, "images")}>
                  <Download className="w-4 h-4 mr-2" />
                  Images
                </Button>
                <Button size="sm" onClick={() => downloadSlides(selectedFile!, "pdf")}>
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                You may now preview the extracted slides. Select a thumbnail to enlarge it.
              </p>

              <div className="relative">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                  <img
                    src={currentSlides[selectedSlideIndex]?.imageUrl || "/placeholder.svg"}
                    alt={`Slide ${selectedSlideIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                    {selectedSlideIndex + 1}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {currentSlides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`flex-shrink-0 cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                      index === selectedSlideIndex
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedSlideIndex(index)}
                  >
                    <img
                      src={slide.imageUrl || "/placeholder.svg"}
                      alt={`Slide ${index + 1}`}
                      className="w-24 h-16 object-cover"
                    />
                  </div>
                ))}
              </div>

              <div className="text-sm text-gray-600">
                Slide {selectedSlideIndex + 1} of {currentSlides.length} • Timestamp:{" "}
                {formatTimestamp(currentSlides[selectedSlideIndex]?.timestamp || 0)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
