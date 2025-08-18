import { Users, Clock, Hash, TrendingUp } from "lucide-react"

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

  return (
    <div className="results-panel space-y-6">
      <h4 className="text-lg font-semibold font-serif">Extraction Results</h4>

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
