import { FileText, Clock, Users, Zap } from "lucide-react"

export function StatsOverview() {
  const stats = [
    {
      icon: FileText,
      value: "10K+",
      label: "Files Processed",
      color: "text-primary",
    },
    {
      icon: Clock,
      value: "< 30s",
      label: "Average Processing",
      color: "text-secondary",
    },
    {
      icon: Users,
      value: "95%",
      label: "Accuracy Rate",
      color: "text-green-600",
    },
    {
      icon: Zap,
      value: "24/7",
      label: "AI Processing",
      color: "text-primary",
    },
  ]

  return (
    <div className="extraction-stats">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
