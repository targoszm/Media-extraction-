"use client"

import { Users, Clock, Hash, TrendingUp, Download } from "lucide-react"
import { MediaPlayer } from "./media-player"
import { TextViewer } from "./text-viewer"

interface ResultsDisplayProps {
  results: {
    transcript?: string
    speakers?: (string | { id: string; name: string; segments?: any[]; duration?: string })[]
    duration?: string
    extractedData?: {
      keyPoints?: string[]
      sentiment?: string
      topics?: string[]
    }
    extractedAudio?: {
      url: string
      fileName: string
      duration: string
      format: string
      size: string
    }
    extractedVideo?: {
      url: string
      fileName: string
      duration: string
      format: string
      size: string
      resolution: string
    }
    extractedText?: string
    fileName?: string
    type?: string
    pages?: number
  }
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  const transcript = results?.transcript || "No transcript available"
  const speakers = results?.speakers || []
  const duration = results?.duration || "Unknown"
  const extractedData = results?.extractedData || {}
  const keyPoints = extractedData.keyPoints || []
  const sentiment = extractedData.sentiment || "Neutral"
  const topics = extractedData.topics || []

  const downloadAudio = () => {
    if (results.extractedAudio) {
      const link = document.createElement("a")
      link.href = results.extractedAudio.url
      link.download = results.extractedAudio.fileName
      link.click()
    }
  }

  const downloadVideo = () => {
    if (results.extractedVideo) {
      const link = document.createElement("a")
      link.href = results.extractedVideo.url
      link.download = results.extractedVideo.fileName
      link.click()
    }
  }

  const exportTranscript = () => {
    const transcriptData = `Transcript Export\n\nDuration: ${duration}\nSpeakers: ${speakers.length}\nSentiment: ${sentiment}\n\n${transcript}`
    const blob = new Blob([transcriptData], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "transcript.txt"
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportText = () => {
    const textData = results.extractedText || transcript
    const blob = new Blob([textData], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${results.fileName?.replace(/\.[^/.]+$/, "") || "extracted"}_text.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="results-panel space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold font-serif">Extraction Results</h4>
        <div className="flex gap-2">
          {(results.extractedText || transcript) && (
            <button
              onClick={results.extractedText ? exportText : exportTranscript}
              className="secondary-button text-sm py-1 px-3"
            >
              <Download className="w-4 h-4 mr-1" />
              Text File
            </button>
          )}
        </div>
      </div>

      {results.extractedText && (
        <TextViewer
          text={results.extractedText}
          fileName={results.fileName || "extracted_content"}
          type={results.type || "text"}
          metadata={{
            pages: results.pages,
            language: "English",
          }}
        />
      )}

      {results.extractedAudio && (
        <div className="space-y-3">
          <h5 className="font-medium">Extracted Audio</h5>
          <MediaPlayer
            type="audio"
            url={results.extractedAudio.url}
            fileName={results.extractedAudio.fileName}
            duration={results.extractedAudio.duration}
            onDownload={downloadAudio}
          />
        </div>
      )}

      {results.extractedVideo && (
        <div className="space-y-3">
          <h5 className="font-medium">Extracted Video</h5>
          <MediaPlayer
            type="video"
            url={results.extractedVideo.url}
            fileName={results.extractedVideo.fileName}
            duration={results.extractedVideo.duration}
            onDownload={downloadVideo}
          />
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <Users className="w-5 h-5 text-primary mx-auto mb-1" />
          <div className="text-sm font-medium">{speakers.length}</div>
          <div className="text-xs text-muted-foreground">Speakers</div>
        </div>
        <div className="text-center">
          <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
          <div className="text-sm font-medium">{duration}</div>
          <div className="text-xs text-muted-foreground">Duration</div>
        </div>
        <div className="text-center">
          <Hash className="w-5 h-5 text-primary mx-auto mb-1" />
          <div className="text-sm font-medium">{topics.length}</div>
          <div className="text-xs text-muted-foreground">Topics</div>
        </div>
        <div className="text-center">
          <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
          <div className="text-sm font-medium">{sentiment}</div>
          <div className="text-xs text-muted-foreground">Sentiment</div>
        </div>
      </div>

      {/* Transcript Preview */}
      {transcript && transcript !== "No transcript available" && !results.extractedText && (
        <div className="transcript-section">
          <h5 className="font-medium mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Transcript with Speaker Diarization
          </h5>
          <div className="space-y-2">
            {speakers.length > 0 ? (
              speakers.map((speaker, index) => (
                <div key={index} className="flex gap-3">
                  <span className="speaker-label">
                    {typeof speaker === "string" ? speaker : speaker.name || `Speaker ${index + 1}`}
                  </span>
                  <p className="text-sm text-muted-foreground flex-1">
                    {transcript.slice(index * 50, (index + 1) * 50)}...
                  </p>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                <p>{transcript}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Points */}
      {keyPoints.length > 0 && (
        <div>
          <h5 className="font-medium mb-3">Key Points Extracted</h5>
          <ul className="space-y-2">
            {keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Topics */}
      {topics.length > 0 && (
        <div>
          <h5 className="font-medium mb-3">Identified Topics</h5>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, index) => (
              <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
