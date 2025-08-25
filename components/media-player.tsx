"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Download, Volume2 } from "lucide-react"

interface MediaPlayerProps {
  type: "audio" | "video"
  url: string
  fileName: string
  duration?: string
  onDownload?: () => void
}

export function MediaPlayer({ type, url, fileName, duration, onDownload }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(100)
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null)

  const togglePlay = async () => {
    if (mediaRef.current) {
      try {
        if (isPlaying) {
          mediaRef.current.pause()
          setIsPlaying(false)
        } else {
          // Check if media has a valid source before attempting to play
          if (!mediaRef.current.src || mediaRef.current.src === "") {
            console.error("[v0] Media element has no source URL")
            return
          }

          // Wait for the media to be ready before playing
          if (mediaRef.current.readyState < 2) {
            await new Promise((resolve, reject) => {
              const handleCanPlay = () => {
                mediaRef.current?.removeEventListener("canplay", handleCanPlay)
                mediaRef.current?.removeEventListener("error", handleError)
                resolve(void 0)
              }

              const handleError = () => {
                mediaRef.current?.removeEventListener("canplay", handleCanPlay)
                mediaRef.current?.removeEventListener("error", handleError)
                reject(new Error("Media failed to load"))
              }

              mediaRef.current?.addEventListener("canplay", handleCanPlay)
              mediaRef.current?.addEventListener("error", handleError)
            })
          }

          await mediaRef.current.play()
          setIsPlaying(true)
        }
      } catch (error) {
        console.error("[v0] Media playback error:", error)
        // Reset playing state if play failed
        setIsPlaying(false)
      }
    }
  }

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime)
    }
  }

  const handleSeek = (value: number[]) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (mediaRef.current) {
      mediaRef.current.volume = value[0] / 100
      setVolume(value[0])
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{fileName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {type === "video" ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={url}
            className="w-full rounded-lg"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => {
              if (mediaRef.current) {
                setCurrentTime(0)
              }
            }}
            onError={(e) => {
              console.error("[v0] Video loading error:", e)
              setIsPlaying(false)
            }}
            onLoadStart={() => {
              console.log("[v0] Video loading started")
            }}
          />
        ) : (
          <audio
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            src={url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => {
              if (mediaRef.current) {
                setCurrentTime(0)
              }
            }}
            onError={(e) => {
              console.error("[v0] Audio loading error:", e)
              setIsPlaying(false)
            }}
            onLoadStart={() => {
              console.log("[v0] Audio loading started")
            }}
          />
        )}

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={mediaRef.current?.duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">{duration || "0:00"}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <div className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4" />
                <Slider value={[volume]} max={100} step={1} onValueChange={handleVolumeChange} className="w-20" />
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
