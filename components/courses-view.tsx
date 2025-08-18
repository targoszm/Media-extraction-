"use client"

import { useState } from "react"
import type { ViewType } from "@/app/page"

interface CoursesViewProps {
  onNavigate: (view: ViewType) => void
}

interface Lesson {
  id: number
  title: string
  duration: string
  type: "video" | "quiz" | "document" | "interactive"
  completed?: boolean
}

interface Chapter {
  id: number
  title: string
  lessons: Lesson[]
  duration: string
}

interface Course {
  id: number
  title: string
  description: string
  type: string
  duration: string
  learners: number
  completion_rate: number
  created: string
  status: "active" | "draft"
  thumbnail: string
  instructor: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  chapters: Chapter[]
  totalLessons: number
  tags: string[]
  enrolled?: boolean
  progress?: number
  completedChapters?: number
  priceInCents?: number
  currency?: string
  authorEmail?: string
  authorAvatarUrl?: string
  hasFreeChapters?: boolean
  thumbnailUrl?: string
}

const courses: Course[] = [
  {
    id: 1,
    title: "Compliance Training 2025",
    description: "Comprehensive compliance training covering all regulatory requirements and best practices for 2025.",
    type: "Regulatory",
    duration: "2h 15m",
    learners: 247,
    completion_rate: 89,
    created: "2025-08-10",
    status: "active",
    thumbnail: "compliance",
    instructor: "Sarah Johnson",
    difficulty: "Intermediate",
    totalLessons: 12,
    tags: ["Compliance", "Regulatory", "Legal"],
    enrolled: true,
    progress: 65,
    completedChapters: 1,
    authorEmail: "sarah.johnson@company.com",
    authorAvatarUrl: "/professional-woman-diverse.png",
    thumbnailUrl: "/compliance-training-office.png",
    chapters: [
      {
        id: 1,
        title: "Introduction to Compliance",
        duration: "45m",
        lessons: [
          { id: 1, title: "What is Compliance?", duration: "15m", type: "video", completed: true },
          { id: 2, title: "Regulatory Framework", duration: "20m", type: "document", completed: true },
          { id: 3, title: "Knowledge Check", duration: "10m", type: "quiz", completed: true },
        ],
      },
      {
        id: 2,
        title: "Risk Management",
        duration: "1h 30m",
        lessons: [
          { id: 4, title: "Identifying Risks", duration: "25m", type: "video", completed: false },
          { id: 5, title: "Risk Assessment Tools", duration: "35m", type: "interactive", completed: false },
          { id: 6, title: "Mitigation Strategies", duration: "30m", type: "document", completed: false },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "New Employee Onboarding",
    description: "Complete onboarding program for new hires covering company culture, policies, and procedures.",
    type: "HR",
    duration: "3h 25m",
    learners: 156,
    completion_rate: 94,
    created: "2025-08-05",
    status: "active",
    thumbnail: "onboarding",
    instructor: "Michael Chen",
    difficulty: "Beginner",
    totalLessons: 18,
    tags: ["Onboarding", "HR", "Culture"],
    enrolled: false,
    priceInCents: 4999,
    currency: "USD",
    authorEmail: "michael.chen@company.com",
    authorAvatarUrl: "/professional-man.png",
    hasFreeChapters: true,
    thumbnailUrl: "/placeholder-6194r.png",
    chapters: [
      {
        id: 1,
        title: "Welcome & Company Overview",
        duration: "1h 15m",
        lessons: [
          { id: 1, title: "Welcome Message", duration: "10m", type: "video" },
          { id: 2, title: "Company History", duration: "25m", type: "document" },
          { id: 3, title: "Mission & Values", duration: "20m", type: "video" },
          { id: 4, title: "Organizational Structure", duration: "20m", type: "interactive" },
        ],
      },
      {
        id: 2,
        title: "Policies & Procedures",
        duration: "2h 10m",
        lessons: [
          { id: 5, title: "Employee Handbook", duration: "45m", type: "document" },
          { id: 6, title: "Code of Conduct", duration: "30m", type: "video" },
          { id: 7, title: "IT Security Policies", duration: "35m", type: "interactive" },
          { id: 8, title: "Benefits Overview", duration: "40m", type: "document" },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Product Training Q3",
    description: "Advanced product training covering new features, sales techniques, and customer success strategies.",
    type: "Sales",
    duration: "1h 45m",
    learners: 89,
    completion_rate: 76,
    created: "2025-08-01",
    status: "draft",
    thumbnail: "product",
    instructor: "Emma Rodriguez",
    difficulty: "Advanced",
    totalLessons: 8,
    tags: ["Product", "Sales", "Features"],
    enrolled: true,
    progress: 25,
    completedChapters: 0,
    authorEmail: "emma.rodriguez@company.com",
    authorAvatarUrl: "/placeholder-f3yqu.png",
    thumbnailUrl: "/product-training-presentation.png",
    chapters: [
      {
        id: 1,
        title: "Product Overview",
        duration: "50m",
        lessons: [
          { id: 1, title: "New Features Q3", duration: "25m", type: "video", completed: true },
          { id: 2, title: "Feature Deep Dive", duration: "25m", type: "interactive", completed: false },
        ],
      },
      {
        id: 2,
        title: "Sales Strategies",
        duration: "55m",
        lessons: [
          { id: 3, title: "Customer Personas", duration: "20m", type: "document", completed: false },
          { id: 4, title: "Sales Techniques", duration: "25m", type: "video", completed: false },
          { id: 5, title: "Objection Handling", duration: "10m", type: "quiz", completed: false },
        ],
      },
    ],
  },
]

const CourseThumbnail = ({ type }: { type: string }) => {
  const getIconStyles = (type: string) => {
    switch (type) {
      case "compliance":
        return "bg-blue-50 text-blue-600 border-blue-100"
      case "onboarding":
        return "bg-green-50 text-green-600 border-green-100"
      case "product":
        return "bg-purple-50 text-purple-600 border-purple-100"
      default:
        return "bg-gray-50 text-gray-600 border-gray-100"
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "compliance":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case "onboarding":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )
      case "product":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        )
      default:
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        )
    }
  }

  return (
    <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center ${getIconStyles(type)}`}>
      {getIcon(type)}
    </div>
  )
}

const CourseProgress = ({
  progress,
  completedChapters,
  totalChapters,
}: { progress: number; completedChapters: number; totalChapters: number }) => {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-600">Course Progress</span>
        <span className="text-xs text-gray-500">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {completedChapters} of {totalChapters} chapters completed
      </div>
    </div>
  )
}

const EnhancedCourseCard = ({ course, onPreview }: { course: Course; onPreview: (course: Course) => void }) => {
  const formatPrice = (priceInCents: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(priceInCents / 100)
  }

  const getButtonLabel = () => {
    if (course.enrolled) {
      return (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Continue Learning
        </span>
      )
    }
    if (course.priceInCents) {
      return `Enroll - ${formatPrice(course.priceInCents, course.currency || "USD")}`
    }
    return "Enroll Now"
  }

  return (
    <div
      className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg overflow-hidden max-w-sm ${
        course.enrolled ? "border-green-200 hover:border-green-300" : "border-blue-200 hover:border-blue-300"
      }`}
    >
      {/* Course Image */}
      <div className="relative">
        <img
          src={course.thumbnailUrl || "/placeholder.svg?height=200&width=320&query=course thumbnail"}
          alt={course.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = "/course-thumbnail.png"
          }}
        />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                course.enrolled ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
              }`}
            >
              {course.type}
            </span>
            {course.hasFreeChapters && !course.enrolled && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
                Free Lessons!
              </span>
            )}
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              course.difficulty === "Beginner"
                ? "bg-green-100 text-green-800"
                : course.difficulty === "Intermediate"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {course.difficulty}
          </span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        {course.enrolled && (
          <CourseProgress
            progress={course.progress || 0}
            completedChapters={course.completedChapters || 0}
            totalChapters={course.chapters.length}
          />
        )}

        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>

        {course.authorEmail && (
          <div className="flex items-center gap-2 mb-2">
            <img
              src={course.authorAvatarUrl || "/placeholder.svg?height=20&width=20&query=instructor avatar"}
              alt={course.instructor}
              className="w-5 h-5 rounded-full"
            />
            <span className="text-sm text-gray-600">{course.instructor}</span>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            {course.totalLessons} lessons
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {course.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onPreview(course)}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Preview
          </button>
          <button
            className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors ${
              course.enrolled
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {getButtonLabel()}
          </button>
        </div>
      </div>
    </div>
  )
}

const CoursePreview = ({ course, onClose }: { course: Course; onClose: () => void }) => {
  const [activeChapter, setActiveChapter] = useState(0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <CourseThumbnail type={course.thumbnail} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <img
                      src={course.authorAvatarUrl || "/placeholder.svg?height=24&width=24&query=instructor"}
                      alt={course.instructor}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-gray-600">{course.instructor}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {course.duration}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  {course.totalLessons} lessons
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {course.learners} learners
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.difficulty === "Beginner"
                      ? "bg-green-100 text-green-800"
                      : course.difficulty === "Intermediate"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {course.difficulty}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex h-[60vh]">
          {/* Chapter Navigation */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-gray-50">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Course Curriculum
              </h3>
              {course.chapters.map((chapter, index) => (
                <div key={chapter.id} className="mb-3">
                  <button
                    onClick={() => setActiveChapter(index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                      activeChapter === index
                        ? "bg-white border-blue-200 text-blue-900 shadow-sm"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="font-medium mb-1">{chapter.title}</div>
                    <div className="text-sm text-gray-500 flex items-center justify-between">
                      <span>{chapter.lessons.length} lessons</span>
                      <span>{chapter.duration}</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Lesson Details */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                {course.chapters[activeChapter]?.title}
              </h4>
              <div className="space-y-3">
                {course.chapters[activeChapter]?.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className={`flex items-center p-4 rounded-lg border-2 transition-colors ${
                      lesson.completed ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex-shrink-0 mr-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                          lesson.type === "video"
                            ? "bg-red-100 text-red-600"
                            : lesson.type === "quiz"
                              ? "bg-blue-100 text-blue-600"
                              : lesson.type === "document"
                                ? "bg-green-100 text-green-600"
                                : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        {lesson.type === "video" && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {lesson.type === "quiz" && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {lesson.type === "document" && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {lesson.type === "interactive" && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">{lesson.title}</div>
                        {lesson.completed && (
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center justify-between mt-1">
                        <span>{lesson.duration}</span>
                        <span className="capitalize text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                          {lesson.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {course.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Edit Course
              </button>
              <button
                className={`px-6 py-2 rounded-lg transition-colors ${
                  course.enrolled
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {course.enrolled ? "Continue Learning" : "Start Learning"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CoursesView({ onNavigate }: CoursesViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [filterType, setFilterType] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"card" | "table">("card")
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false)

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || course.type.toLowerCase() === filterType.toLowerCase()
    const matchesEnrollment = !showEnrolledOnly || course.enrolled
    return matchesSearch && matchesType && matchesEnrollment
  })

  const enrolledCourses = courses.filter((course) => course.enrolled)

  return (
    <div className="view active">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Courses</h1>
              <p className="text-gray-600">Manage and track your learning progress</p>
            </div>
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
              onClick={() => onNavigate("create")}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Course
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="relative">
                <svg
                  className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="regulatory">Regulatory</option>
                <option value="hr">HR</option>
                <option value="sales">Sales</option>
              </select>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEnrolledOnly}
                  onChange={(e) => setShowEnrolledOnly(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enrolled only</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("card")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "card" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "table" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {enrolledCourses.length > 0 && !showEnrolledOnly && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Continue Learning</h2>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {enrolledCourses.map((course) => (
                <div key={`enrolled-${course.id}`} className="flex-shrink-0">
                  <EnhancedCourseCard course={course} onPreview={setSelectedCourse} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {showEnrolledOnly ? "My Enrolled Courses" : "All Courses"}
            <span className="text-lg font-normal text-gray-500 ml-2">({filteredCourses.length})</span>
          </h2>

          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <EnhancedCourseCard key={course.id} course={course} onPreview={setSelectedCourse} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Course</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Progress</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <CourseThumbnail type={course.thumbnail} />
                          <div>
                            <div className="font-medium text-gray-900">{course.title}</div>
                            <div className="text-sm text-gray-500">{course.instructor}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">{course.type}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{course.duration}</td>
                      <td className="py-4 px-4">
                        {course.enrolled ? (
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{course.progress}%</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not enrolled</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedCourse(course)}
                            className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                          >
                            Preview
                          </button>
                          <button
                            className={`px-3 py-1 text-sm rounded ${
                              course.enrolled
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {course.enrolled ? "Continue" : "Enroll"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or create a new course.</p>
          </div>
        )}
      </div>

      {selectedCourse && <CoursePreview course={selectedCourse} onClose={() => setSelectedCourse(null)} />}
    </div>
  )
}
