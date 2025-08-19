"use client"

import type { ViewType } from "@/app/page"

interface NavbarProps {
  currentView: ViewType
  onNavigate: (view: ViewType) => void
}

export function Navbar({ currentView, onNavigate }: NavbarProps) {
  const navItems = [
    { id: "dashboard" as ViewType, label: "Dashboard" },
    { id: "create" as ViewType, label: "Create Course" },
    { id: "courses" as ViewType, label: "My Courses" },
    { id: "analytics" as ViewType, label: "Analytics" },
    { id: "team" as ViewType, label: "Team" },
  ]

  return (
    <nav className="mentingo-navbar leading-3 rounded-sm">
      <div className="mentingo-nav-container flex items-center justify-between px-2 md:px-4 min-w-0">
        <div className="mentingo-brand flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-4">
            <img
              src="/skills-studio-logo.svg"
              alt="Skills Studio AI Logo"
              className="w-6 h-6 md:w-8 md:h-8"
            />
            <div>
              <h3 className="leading-tight whitespace-nowrap text-xs md:text-sm font-medium">
                Skills Studio AI
              </h3>
            </div>
          </div>
        </div>

        <div className="mentingo-nav-items flex-1 flex justify-center min-w-0 mx-1 md:mx-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`mentingo-nav-item text-xs md:text-sm px-2 md:px-3 py-0 ${
                currentView === item.id ? "active" : ""
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mentingo-nav-actions flex items-center gap-1 md:gap-2 flex-shrink-0">
          <button className="mentingo-search-btn hidden md:block"></button>
          <button className="mentingo-notification-btn">
            <svg
              className="w-3 h-3 md:w-4 md:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            ></svg>
          </button>
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-xs font-medium text-gray-700 hidden md:inline">
              Sarah Johnson
            </span>
            <div className="mentingo-user-avatar">
              <img
                src="/professional-headshot.png"
                alt="User"
                className="w-6 h-6 md:w-8 md:h-8 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
