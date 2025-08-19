"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Volume2, VolumeX, Maximize, Download, SkipBack, SkipForward } from "lucide-react"

interface VideoPlayerProps {
  videoUrl: string
  thumbnailUrl?: string
  title: string
  duration?: number
  qualities?: Array<{ label: string; url: string }>
  onDownload?: () => void
}

export function EnhancedVideoPlayer({
  videoUrl,
  thumbnailUrl,
  title,
  duration = 0,
  qualities = [],
  onDownload,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [selectedQuality, setSelectedQuality] = useState(qualities[0]?.label || "Auto")
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handleLoadedMetadata = () => setCurrentTime(0)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
    }
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0]
      videoRef.current.volume = newVolume / 100
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume / 100
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const changePlaybackRate = (rate: string) => {
    const rateValue = Number.parseFloat(rate)
    if (videoRef.current) {
      videoRef.current.playbackRate = rateValue
      setPlaybackRate(rateValue)
    }
  }

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, currentTime + seconds))
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="relative bg-black rounded-lg overflow-hidden group"
          onMouseMove={showControlsTemporarily}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            poster={thumbnailUrl}
            className="w-full aspect-video"
            onClick={togglePlay}
          />

          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
              {/* Progress Bar */}
              <Slider
                value={[currentTime]}
                max={videoRef.current?.duration || duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="w-full"
              />

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={togglePlay} className="text-white hover:bg-white/20">
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skipTime(-10)}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skipTime(10)}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-white/20">
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="w-20"
                    />
                  </div>

                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(videoRef.current?.duration || duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Playback Speed */}
                  <Select value={playbackRate.toString()} onValueChange={changePlaybackRate}>
                    <SelectTrigger className="w-20 h-8 text-white border-white/30 bg-black/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="0.75">0.75x</SelectItem>
                      <SelectItem value="1">1x</SelectItem>
                      <SelectItem value="1.25">1.25x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Quality Selection */}
                  {qualities.length > 0 && (
                    <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                      <SelectTrigger className="w-20 h-8 text-white border-white/30 bg-black/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {qualities.map((quality) => (
                          <SelectItem key={quality.label} value={quality.label}>
                            {quality.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                    <Maximize className="h-4 w-4" />
                  </Button>

                  {onDownload && (
                    <Button variant="ghost" size="sm" onClick={onDownload} className="text-white hover:bg-white/20">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
