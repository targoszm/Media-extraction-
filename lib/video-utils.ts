export interface VideoFormat {
  container: string
  codec: string
  quality: string
  bitrate: number
}

export interface VideoProcessingOptions {
  extractAudio?: boolean
  generateThumbnail?: boolean
  targetFormat?: "mp4" | "webm" | "avi" | "mov"
  targetQuality?: "480p" | "720p" | "1080p" | "1440p" | "2160p"
  startTime?: number // seconds
  endTime?: number // seconds
  fps?: number
}

export const VIDEO_FORMATS: Record<string, VideoFormat> = {
  mp4: {
    container: "mp4",
    codec: "h264",
    quality: "high",
    bitrate: 2500000,
  },
  webm: {
    container: "webm",
    codec: "vp9",
    quality: "high",
    bitrate: 2000000,
  },
  avi: {
    container: "avi",
    codec: "h264",
    quality: "medium",
    bitrate: 1500000,
  },
  mov: {
    container: "mov",
    codec: "h264",
    quality: "high",
    bitrate: 3000000,
  },
}

export const QUALITY_SETTINGS = {
  "480p": { width: 854, height: 480, bitrate: 1000000 },
  "720p": { width: 1280, height: 720, bitrate: 2500000 },
  "1080p": { width: 1920, height: 1080, bitrate: 5000000 },
  "1440p": { width: 2560, height: 1440, bitrate: 10000000 },
  "2160p": { width: 3840, height: 2160, bitrate: 20000000 },
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }
}

export function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  if (bytes === 0) return "0 Bytes"

  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
}

export function getVideoQualityFromResolution(width: number, height: number): string {
  if (height >= 2160) return "2160p"
  if (height >= 1440) return "1440p"
  if (height >= 1080) return "1080p"
  if (height >= 720) return "720p"
  if (height >= 480) return "480p"
  return "360p"
}

export function isVideoFile(fileName: string): boolean {
  const videoExtensions = [
    ".mp4",
    ".avi",
    ".mov",
    ".wmv",
    ".flv",
    ".webm",
    ".mkv",
    ".m4v",
    ".3gp",
    ".ogv",
    ".ts",
    ".mts",
  ]

  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."))
  return videoExtensions.includes(extension)
}

export function getVideoMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".avi": "video/x-msvideo",
    ".mov": "video/quicktime",
    ".wmv": "video/x-ms-wmv",
    ".flv": "video/x-flv",
    ".mkv": "video/x-matroska",
    ".m4v": "video/x-m4v",
    ".3gp": "video/3gpp",
    ".ogv": "video/ogg",
  }

  return mimeTypes[extension.toLowerCase()] || "video/mp4"
}

export function generateThumbnailTimestamps(duration: number, count = 5): number[] {
  const timestamps: number[] = []
  const interval = duration / (count + 1)

  for (let i = 1; i <= count; i++) {
    timestamps.push(Math.floor(interval * i))
  }

  return timestamps
}
