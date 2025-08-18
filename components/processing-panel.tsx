import { Loader2, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface ProcessingPanelProps {
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
}

export function ProcessingPanel({ status, progress }: ProcessingPanelProps) {
  const getStatusInfo = () => {
    switch (status) {
      case "uploading":
        return {
          icon: Clock,
          text: "Uploading...",
          color: "text-secondary",
        }
      case "processing":
        return {
          icon: Loader2,
          text: "AI Processing with Gemini 2.0 Flash...",
          color: "text-primary",
        }
      case "completed":
        return {
          icon: CheckCircle,
          text: "Processing Complete",
          color: "text-green-600",
        }
      case "error":
        return {
          icon: AlertCircle,
          text: "Processing Error",
          color: "text-destructive",
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <StatusIcon className={`w-4 h-4 ${statusInfo.color} ${status === "processing" ? "animate-spin" : ""}`} />
        <span className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
        <span className="text-sm text-muted-foreground ml-auto">{progress}%</span>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {status === "processing" && (
        <div className="text-xs text-muted-foreground">
          Extracting transcripts, identifying speakers, and analyzing content...
        </div>
      )}
    </div>
  )
}
