import { FileText, Timer, Users, Clock } from "lucide-react"

export function StatsOverview() {
  const stats = [
    { icon: <FileText className="w-7 h-7 md:w-8 md:h-8 text-primary" />, value: "10K+", label: "Files Processed" },
    { icon: <Timer className="w-7 h-7 md:w-8 md:h-8 text-secondary" />, value: "40s", label: "Average Processing" },
    { icon: <Users className="w-7 h-7 md:w-8 md:h-8 text-green-600" />, value: "95%", label: "Accuracy" },
    { icon: <Clock className="w-7 h-7 md:w-8 md:h-8 text-primary" />, value: "24/7", label: "Availability" },
  ]

  return (
    <div className="extraction-stats leading-3">
      {stats.map((stat, i) => (
        <div key={i} className="stat-card text-foreground">
          <div className="flex items-center gap-4">
            <div className="shrink-0">{stat.icon}</div>

            <div className="min-w-0">
              <div className="stat-value leading-none">{stat.value}</div>
              <div className="stat-label mt-1 text-gray-700">{stat.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
