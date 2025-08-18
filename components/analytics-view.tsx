"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

export function AnalyticsView() {
  const coursePerformanceData = [
    { name: "Compliance", value: 89, color: "#546ffd" },
    { name: "Onboarding", value: 94, color: "#10b981" },
    { name: "Product", value: 76, color: "#f59e0b" },
    { name: "Safety", value: 82, color: "#ef4444" },
    { name: "Leadership", value: 91, color: "#8b5cf6" },
  ]

  const engagementTrendData = [
    { month: "Jan", engagement: 65, completion: 78 },
    { month: "Feb", engagement: 72, completion: 82 },
    { month: "Mar", engagement: 68, completion: 79 },
    { month: "Apr", engagement: 85, completion: 91 },
    { month: "May", engagement: 89, completion: 94 },
    { month: "Jun", engagement: 92, completion: 96 },
  ]

  return (
    <div className="view active">
      <div className="container">
        <div className="analytics-header">
          <h1 className="text-4xl font-semibold text-slate-900 mb-2">Analytics Dashboard</h1>
          <p className="text-slate-500 text-lg">Track engagement, completion rates, and learning outcomes</p>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Course Performance</h3>
            <div className="chart-container h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coursePerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value) => [`${value}%`, "Performance"]}
                  />
                  <Bar dataKey="value" fill="#546ffd" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="analytics-card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Learner Engagement Trend</h3>
            <div className="chart-container h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value, name) => [`${value}%`, name === "engagement" ? "Engagement" : "Completion"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="#546ffd"
                    strokeWidth={3}
                    dot={{ fill: "#546ffd", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completion"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="analytics-card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Learning Metrics</h3>
            <div className="engagement-metrics">
              <div className="metric">
                <span className="metric-value">45%</span>
                <span className="metric-label">Engagement Increase</span>
              </div>
              <div className="metric">
                <span className="metric-value">89</span>
                <span className="metric-label">Monthly Active Users</span>
              </div>
              <div className="metric">
                <span className="metric-value">4.8/5</span>
                <span className="metric-label">Avg Rating</span>
              </div>
            </div>
          </div>

          <div className="analytics-card full-width">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Time Savings Analysis</h3>
            <div className="savings-breakdown">
              <div className="savings-item">
                <div className="savings-icon lightning-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">Content Creation</h4>
                  <p className="text-slate-500">Average 80% reduction in course creation time</p>
                  <span className="savings-hours">124 hours saved</span>
                </div>
              </div>
              <div className="savings-item">
                <div className="savings-icon refresh-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">Updates & Revisions</h4>
                  <p className="text-slate-500">Instant updates with AI-powered content refresh</p>
                  <span className="savings-hours">32 hours saved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
