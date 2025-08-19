import { FileText, Timer, Users, Clock } from "lucide-react"

export function StatsOverview() {
  const stats = [
    { icon: <FileText className="w-6 h-6 text-primary" />, value: "10K+", label: "Files Processed" },
    { icon: <Timer className="w-6 h-6 text-secondary" />, value: "40s", label: "Average Processing" },
    { icon: <Users className="w-6 h-6 text-green-600" />, value: "95%", label: "Accuracy" },
    { icon: <Clock className="w-6 h-6 text-primary" />, value: "24/7", label: "Availability" },
  ]

  return (
    <div className="extraction-stats leading-3">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card text-foreground">
          <div className="flex flex-col items-center">
            {stat.icon}
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label text-gray-700">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
