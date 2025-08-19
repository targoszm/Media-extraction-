"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Volume2, VolumeX, Download, SkipBack, SkipForward, Repeat } from "lucide-react"

interface WaveformAudioPlayerProps {
  audioUrl: string
  title: string
  duration?: number
  waveformData?: number[]
  onDownload?: () => void
}

export function WaveformAudioPlayer({
  audioUrl,
  title,
  duration = 0,
  waveformData = [],
  onDownload,
}: WaveformAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isLooping, setIsLooping] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setCurrentTime(0)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || waveformData.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas
    const barWidth = width / waveformData.length
    const audioDuration = audioRef.current?.duration || duration

    ctx.clearRect(0, 0, width, height)

    waveformData.forEach((amplitude, index) => {
      const barHeight = amplitude * height * 0.8
      const x = index * barWidth
      const y = (height - barHeight) / 2

      // Color bars based on playback position
      const timePosition = (index / waveformData.length) * audioDuration
      const isPlayed = timePosition <= currentTime

      ctx.fillStyle = isPlayed ? "#3b82f6" : "#e2e8f0"
      ctx.fillRect(x, y, barWidth - 1, barHeight)
    })

    // Draw current position indicator
    if (audioDuration > 0) {
      const progressX = (currentTime / audioDuration) * width
      ctx.strokeStyle = "#ef4444"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(progressX, 0)
      ctx.lineTo(progressX, height)
      ctx.stroke()
    }
  }, [waveformData, currentTime, duration])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleWaveformClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const audio = audioRef.current
    if (!canvas || !audio) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const clickPosition = x / canvas.width
    const newTime = clickPosition * (audio.duration || duration)

    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    if (audioRef.current) {
      const newVolume = value[0]
      audioRef.current.volume = newVolume / 100
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume / 100
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const changePlaybackRate = (rate: string) => {
    const rateValue = Number.parseFloat(rate)
    if (audioRef.current) {
      audioRef.current.playbackRate = rateValue
      setPlaybackRate(rateValue)
    }
  }

  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration, currentTime + seconds))
    }
  }

  const toggleLoop = () => {
    if (audioRef.current) {
      audioRef.current.loop = !isLooping
      setIsLooping(!isLooping)
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
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <audio ref={audioRef} src={audioUrl} />

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={120}
            className="w-full h-24 bg-gray-50 rounded-lg cursor-pointer"
            onClick={handleWaveformClick}
          />
          <div className="absolute top-2 left-2 text-xs text-gray-500">
            {formatTime(currentTime)} / {formatTime(audioRef.current?.duration || duration)}
          </div>
        </div>

        {/* Progress Slider */}
        <Slider
          value={[currentTime]}
          max={audioRef.current?.duration || duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
        />

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => skipTime(-10)}>
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <Button variant="outline" size="sm" onClick={() => skipTime(10)}>
              <SkipForward className="h-4 w-4" />
            </Button>

            <Button variant={isLooping ? "default" : "outline"} size="sm" onClick={toggleLoop}>
              <Repeat className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Volume Control */}
            <Button variant="ghost" size="sm" onClick={toggleMute}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-20"
            />

            {/* Playback Speed */}
            <Select value={playbackRate.toString()} onValueChange={changePlaybackRate}>
              <SelectTrigger className="w-20">
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

            {onDownload && (
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
