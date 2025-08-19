export function StatsOverview() {
  const stats = [
    { icon: "📄", value: "10K+", label: "Files Processed" },
    { icon: "⏱️", value: "40s",  label: "Average Processing" },
    { icon: "👥", value: "95%",  label: "Accuracy" },
    { icon: "🕒", value: "24/7", label: "Availability" },
  ]

  return (
    <div className="extraction-stats leading-3">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card text-foreground">
          <div className="stat-value text-foreground">{stat.value}</div>
          <div className="stat-label text-gray-700">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
