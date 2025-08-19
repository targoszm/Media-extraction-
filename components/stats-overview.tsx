export function StatsOverview() {
  const stats = [
    {
      icon: "📄",
      value: "10K+",
      label: "Files Processed",
      color: "text-primary",
    },
    {
      icon: "⏱️",
      value: "40s",
      label: "Average Processing",
      color: "text-secondary",
    },
    {
      icon: "👥",
      value: "95%",
      label: "Accuracy Rate",
      color: "text-green-600",
    },
    {
      icon: "⚡",
      value: "24/7",
      label: "AI Processing",
      color: "text-primary",
    },
  ]

  return (
    <div className="extraction-stats leading-3">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
