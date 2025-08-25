export interface SlideExtractionOptions {
  threshold: number // Similarity threshold (0-1, lower = more sensitive)
  minInterval: number // Minimum seconds between slides
  maxSlides: number // Maximum number of slides to extract
  roi?: { x: number; y: number; width: number; height: number } // Region of interest
}

export interface ExtractedSlide {
  id: string
  imageUrl: string // Base64 data URL
  timestamp: number
  title: string
}

// Frame comparison using normalized cross-correlation (similar to slideextract's TM_CCORR_NORMED)
export function compareFrames(
  frame1: ImageData,
  frame2: ImageData,
  roi?: { x: number; y: number; width: number; height: number },
): number {
  const data1 = frame1.data
  const data2 = frame2.data

  // Apply ROI if specified
  let startX = 0,
    startY = 0,
    width = frame1.width,
    height = frame1.height
  if (roi) {
    startX = Math.max(0, roi.x)
    startY = Math.max(0, roi.y)
    width = Math.min(frame1.width - startX, roi.width)
    height = Math.min(frame1.height - startY, roi.height)
  }

  let sum1 = 0,
    sum2 = 0,
    sum1Sq = 0,
    sum2Sq = 0,
    pSum = 0
  let pixelCount = 0

  // Process pixels in the specified region
  for (let y = startY; y < startY + height; y++) {
    for (let x = startX; x < startX + width; x++) {
      const idx = (y * frame1.width + x) * 4

      // Convert RGBA to grayscale
      const gray1 = 0.299 * data1[idx] + 0.587 * data1[idx + 1] + 0.114 * data1[idx + 2]
      const gray2 = 0.299 * data2[idx] + 0.587 * data2[idx + 1] + 0.114 * data2[idx + 2]

      sum1 += gray1
      sum2 += gray2
      sum1Sq += gray1 * gray1
      sum2Sq += gray2 * gray2
      pSum += gray1 * gray2
      pixelCount++
    }
  }

  if (pixelCount === 0) return 0

  // Calculate normalized cross-correlation coefficient
  const num = pSum - (sum1 * sum2) / pixelCount
  const den = Math.sqrt((sum1Sq - (sum1 * sum1) / pixelCount) * (sum2Sq - (sum2 * sum2) / pixelCount))

  return den === 0 ? 1 : Math.max(0, Math.min(1, num / den))
}

// Extract video frames at specified intervals
export async function extractVideoFrames(
  videoElement: HTMLVideoElement,
  intervalSeconds: number,
): Promise<ImageData[]> {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!

  canvas.width = videoElement.videoWidth
  canvas.height = videoElement.videoHeight

  const frames: ImageData[] = []
  const duration = videoElement.duration

  for (let time = 0; time < duration; time += intervalSeconds) {
    await new Promise<void>((resolve) => {
      videoElement.currentTime = time
      videoElement.onseeked = () => {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
        frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
        resolve()
      }
    })
  }

  return frames
}

// Convert ImageData to base64 PNG (similar to slideextract's PNG output)
export function imageDataToPNG(imageData: ImageData): string {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!

  canvas.width = imageData.width
  canvas.height = imageData.height
  ctx.putImageData(imageData, 0, 0)

  return canvas.toDataURL("image/png", 0.9) // High quality PNG
}
