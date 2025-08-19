export interface AudioFormat {
  extension: string
  mimeType: string
  codec: string
  quality: "lossless" | "high" | "medium" | "low"
}

export interface AudioProcessingOptions {
  format?: "mp3" | "wav" | "aac" | "ogg" | "flac"
  quality?: "high" | "medium" | "low"
  bitrate?: number
  sampleRate?: number
  channels?: 1 | 2
  startTime?: number
  endTime?: number
  normalize?: boolean
  removeNoise?: boolean
  fadeIn?: number
  fadeOut?: number
}

export const AUDIO_FORMATS: Record<string, AudioFormat> = {
  mp3: {
    extension: "mp3",
    mimeType: "audio/mpeg",
    codec: "mp3",
    quality: "high",
  },
  wav: {
    extension: "wav",
    mimeType: "audio/wav",
    codec: "pcm",
    quality: "lossless",
  },
  aac: {
    extension: "aac",
    mimeType: "audio/aac",
    codec: "aac",
    quality: "high",
  },
  ogg: {
    extension: "ogg",
    mimeType: "audio/ogg",
    codec: "vorbis",
    quality: "medium",
  },
  flac: {
    extension: "flac",
    mimeType: "audio/flac",
    codec: "flac",
    quality: "lossless",
  },
}

export const QUALITY_BITRATES = {
  low: { mp3: 96000, aac: 64000, ogg: 96000 },
  medium: { mp3: 128000, aac: 128000, ogg: 160000 },
  high: { mp3: 320000, aac: 256000, ogg: 320000 },
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
  const sizes = ["Bytes", "KB", "MB", "GB"]
  if (bytes === 0) return "0 Bytes"

  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
}

export function formatBitrate(bitrate: number): string {
  if (bitrate >= 1000000) {
    return `${(bitrate / 1000000).toFixed(1)} Mbps`
  } else if (bitrate >= 1000) {
    return `${Math.round(bitrate / 1000)} kbps`
  } else {
    return `${bitrate} bps`
  }
}

export function isAudioFile(fileName: string): boolean {
  const audioExtensions = [".mp3", ".wav", ".aac", ".ogg", ".flac", ".m4a", ".wma", ".opus", ".aiff", ".au", ".ra"]

  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."))
  return audioExtensions.includes(extension)
}

export function getAudioMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".aac": "audio/aac",
    ".ogg": "audio/ogg",
    ".flac": "audio/flac",
    ".m4a": "audio/mp4",
    ".wma": "audio/x-ms-wma",
    ".opus": "audio/opus",
    ".aiff": "audio/aiff",
  }

  return mimeTypes[extension.toLowerCase()] || "audio/mpeg"
}

export function calculateAudioSize(duration: number, bitrate: number): number {
  // Size in bytes = (bitrate in bits per second * duration in seconds) / 8
  return Math.round((bitrate * duration) / 8)
}

export function normalizeWaveform(waveform: number[]): number[] {
  const max = Math.max(...waveform)
  if (max === 0) return waveform

  return waveform.map((value) => value / max)
}

export function downsampleWaveform(waveform: number[], targetLength: number): number[] {
  if (waveform.length <= targetLength) return waveform

  const step = waveform.length / targetLength
  const downsampled: number[] = []

  for (let i = 0; i < targetLength; i++) {
    const start = Math.floor(i * step)
    const end = Math.floor((i + 1) * step)
    const chunk = waveform.slice(start, end)
    const average = chunk.reduce((sum, val) => sum + val, 0) / chunk.length
    downsampled.push(average)
  }

  return downsampled
}
