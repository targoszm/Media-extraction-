"use client"

import type { ViewType } from "@/app/page"

interface DashboardViewProps {
  onNavigate: (view: ViewType) => void
  userName: string
}

const recentActivity = [
  {
    action: "Course completed by 15 learners",
    course: "Compliance Training 2025",
    timestamp: "2 hours ago",
  },
  {
    action: "New course published",
    course: "Safety Protocols Update",
    timestamp: "1 day ago",
  },
  {
    action: "Avatar voice updated",
    course: "Product Training Q3",
    timestamp: "2 days ago",
  },
]

export function DashboardView({ onNavigate, userName }: DashboardViewProps) {
  return (
    <div className="mentingo-dashboard">
      <div className="mentingo-container">
        <div className="mentingo-header">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome back, {userName}!</h1>
          <p className="text-gray-600 text-lg">Here's what's happening with your training programs.</p>
        </div>

        {/* Stats Cards */}
        <div className="mentingo-stats-grid">
          <div className="mentingo-stat-card compact">
            <div className="stat-icon courses-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" fill="currentColor" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" fill="currentColor" />
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="text-sm font-bold text-gray-800">12</h3>
              <p className="text-xs text-gray-600">Total Courses</p>
            </div>
          </div>

          <div className="mentingo-stat-card compact">
            <div className="stat-icon learners-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="9"
                  cy="7"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 21v-2a4 4 0 0 0-3-3.87"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 3.13a4 4 0 0 1 0 7.75"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="text-sm font-bold text-gray-800">1,247</h3>
              <p className="text-xs text-gray-600">Active Learners</p>
            </div>
          </div>

          <div className="mentingo-stat-card compact">
            <div className="stat-icon completion-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="22,4 12,14.01 9,11.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="text-sm font-bold text-gray-800">87%</h3>
              <p className="text-xs text-gray-600">Avg Completion</p>
            </div>
          </div>

          <div className="mentingo-stat-card compact">
            <div className="stat-icon time-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <polyline
                  points="12,6 12,12 16,14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="text-sm font-bold text-gray-800">156 hrs</h3>
              <p className="text-xs text-gray-600">Time Saved</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mentingo-quick-actions">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="mentingo-action-buttons">
            <button className="mentingo-btn mentingo-btn-primary" onClick={() => onNavigate("create")}>
              <div className="btn-icon rocket-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4.5 16.5c-1.5 1.5-1.5 3.5-1.5 3.5s2-0 3.5-1.5c1.5-1.5 1.5-3.5 1.5-3.5s-2 0-3.5 1.5z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
                    fill="currentColor"
                  />
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" fill="currentColor" />
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" fill="currentColor" />
                </svg>
              </div>
              Create New Course
            </button>
            <button className="mentingo-btn mentingo-btn-outline" onClick={() => onNavigate("courses")}>
              <div className="btn-icon folder-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              Browse Courses
            </button>
            <button className="mentingo-btn mentingo-btn-outline" onClick={() => onNavigate("analytics")}>
              <div className="btn-icon chart-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3 3v18h18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              View Analytics
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mentingo-activity-card">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
          <div className="mentingo-activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="mentingo-activity-item">
                <div className="mentingo-activity-content">
                  <h4>{activity.action}</h4>
                  <p>{activity.course}</p>
                </div>
                <div className="mentingo-activity-time">{activity.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
