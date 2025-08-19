"use client"

import type React from "react"

import { useState, useRef } from "react"
import type { ViewType } from "@/app/page"

interface CreateCourseViewProps {
  onNavigate: (view: ViewType) => void
}

const avatars = [
  {
    id: 1,
    name: "Sarah Professional",
    type: "Corporate Trainer",
    voice: "Clear, Authoritative",
    languages: ["English", "Spanish"],
    initials: "SP",
  },
  {
    id: 2,
    name: "Michael Expert",
    type: "Subject Matter Expert",
    voice: "Warm, Knowledgeable",
    languages: ["English", "French"],
    initials: "ME",
  },
  {
    id: 3,
    name: "Dr. Emma Johnson",
    type: "Medical Professional",
    voice: "Professional, Clear",
    languages: ["English"],
    initials: "EJ",
  },
]

const slides = [
  { title: "Welcome to Compliance Training", content: "Introduction to compliance requirements..." },
  { title: "Regulatory Overview", content: "Key regulations and policies..." },
  { title: "Best Practices", content: "Guidelines for compliance..." },
  { title: "Case Studies", content: "Real-world examples..." },
  { title: "Assessment & Conclusion", content: "Testing knowledge and wrap-up..." },
]

export function CreateCourseView({ onNavigate }: CreateCourseViewProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingText, setProcessingText] = useState("")
  const [selectedSlide, setSelectedSlide] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    setIsProcessing(true)

    // Simulate processing
    const steps = [
      { progress: 20, text: "Analyzing slides and extracting content..." },
      { progress: 40, text: "Identifying images and graphics..." },
      { progress: 60, text: "Processing text and formatting..." },
      { progress: 80, text: "Generating course structure..." },
      { progress: 100, text: "Content analysis complete!" },
    ]

    let stepIndex = 0
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setProcessingProgress(steps[stepIndex].progress)
        setProcessingText(steps[stepIndex].text)
        stepIndex++
      } else {
        clearInterval(interval)
        setIsProcessing(false)
      }
    }, 1000)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return uploadedFile && !isProcessing
      case 2:
        return selectedAvatar !== null
      default:
        return true
    }
  }

  const nextStep = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const publishCourse = () => {
    alert("Course published successfully! Redirecting to course library...")
    onNavigate("courses")
  }

  const getButtonText = () => {
    if (currentStep === 1) {
      return isProcessing ? "Processing..." : "Continue to Avatar Selection"
    } else if (currentStep === 2) {
      return "Continue to Content Editor"
    } else if (currentStep === 3) {
      return "Continue to Publishing"
    } else {
      return "Publish Course"
    }
  }

  return (
    <div className="view active">
      <div className="container">
        <div className="create-header">
          <h1 className="text-4xl font-semibold text-slate-900 mb-2">Create New Course</h1>
          <p className="text-slate-500 text-lg">
            Transform your PowerPoint into engaging AI avatar training in under 10 minutes
          </p>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          {[
            { step: 1, label: "Upload Content" },
            { step: 2, label: "Select Avatar" },
            { step: 3, label: "Optimize Content" },
            { step: 4, label: "Publish Course" },
          ].map(({ step, label }) => (
            <div key={step} className={`step ${currentStep === step ? "active" : ""}`}>
              <div className="step-number">{step}</div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="step-content">
          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <div className="step-panel active">
              {!isProcessing && !uploadedFile && (
                <div className="upload-area" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                  <div className="upload-content">
                    <div className="upload-icon paperclip-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Drag & Drop Your PowerPoint or PDF</h3>
                    <p className="text-slate-500 mb-6">
                      Our AI will extract content and create engaging training modules
                    </p>
                    <button className="btn btn--primary" onClick={() => fileInputRef.current?.click()}>
                      Choose File
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".ppt,.pptx,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
              />

              {(isProcessing || uploadedFile) && (
                <div className="processing-panel">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    {isProcessing ? "Processing Your Content..." : "Content Ready!"}
                  </h3>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${processingProgress}%` }} />
                  </div>
                  <p className="text-slate-500 mt-2">
                    {isProcessing
                      ? processingText
                      : "Your content has been successfully processed and is ready for the next step."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Avatar Selection */}
          {currentStep === 2 && (
            <div className="step-panel active">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Choose Your AI Avatar</h2>
              <p className="text-slate-500 mb-8">Select a professional avatar to narrate your training content</p>

              <div className="avatar-grid">
                {avatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    className={`avatar-card ${selectedAvatar === avatar.id ? "selected" : ""}`}
                    onClick={() => setSelectedAvatar(avatar.id)}
                  >
                    <div className="avatar-info">
                      <div className="avatar-image">{avatar.initials}</div>
                      <div className="avatar-details">
                        <h3 className="text-lg font-semibold text-slate-900">{avatar.name}</h3>
                        <p className="text-slate-500">{avatar.type}</p>
                      </div>
                    </div>
                    <div className="avatar-voice">
                      <strong>Voice:</strong> {avatar.voice}
                    </div>
                    <div className="avatar-languages">
                      {avatar.languages.map((lang) => (
                        <span key={lang} className="language-tag">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Content Optimization */}
          {currentStep === 3 && (
            <div className="step-panel active">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Optimize Your Content</h2>
              <p className="text-slate-500 mb-8">Review and enhance the AI-generated course structure</p>

              <div className="content-editor">
                <div className="slide-list">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Slides ({slides.length})</h3>
                  <div className="slides">
                    {slides.map((slide, index) => (
                      <div
                        key={index}
                        className={`slide-item ${selectedSlide === index ? "active" : ""}`}
                        onClick={() => setSelectedSlide(index)}
                      >
                        <h4 className="text-base font-medium text-slate-900">{slide.title}</h4>
                        <p className="text-slate-500 text-sm">{slide.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="slide-preview">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Preview</h3>
                  <div className="preview-area">
                    <div className="avatar-preview">
                      <div className="avatar-circle">SA</div>
                      <p className="text-slate-500">Sarah will narrate this slide</p>
                    </div>
                    <div className="slide-content">
                      <h4 className="text-lg font-semibold text-slate-900 mb-2">{slides[selectedSlide].title}</h4>
                      <p className="text-slate-500">{slides[selectedSlide].content}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Publishing */}
          {currentStep === 4 && (
            <div className="step-panel active">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Course Settings & Publishing</h2>
              <p className="text-slate-500 mb-8">Configure your course and make it available to learners</p>

              <div className="course-settings">
                <div className="form-group">
                  <label className="form-label">Course Title</label>
                  <input type="text" className="form-control" defaultValue="Compliance Training 2025" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    defaultValue="Essential compliance training for all employees covering regulatory requirements and best practices."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <select className="form-control">
                    <option>All Employees</option>
                    <option>New Hires</option>
                    <option>Managers</option>
                    <option>Sales Team</option>
                  </select>
                </div>
                <div className="publishing-options">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Publishing Options</h3>
                  <div className="option-cards">
                    <div className="option-card">
                      <h4 className="text-base font-semibold text-slate-900">
                        <div className="option-icon link-icon">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        Share Link
                      </h4>
                      <p className="text-slate-500">Generate a shareable link for easy access</p>
                    </div>
                    <div className="option-card">
                      <h4 className="text-base font-semibold text-slate-900">
                        <div className="option-icon mobile-icon">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              x="5"
                              y="2"
                              width="14"
                              height="20"
                              rx="2"
                              ry="2"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <line
                              x1="12"
                              y1="18"
                              x2="12.01"
                              y2="18"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        Embed Code
                      </h4>
                      <p className="text-slate-500">Embed in your website or portal</p>
                    </div>
                    <div className="option-card">
                      <h4 className="text-base font-semibold text-slate-900">
                        <div className="option-icon graduation-icon">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M22 10v6M6 12H4a2 2 0 0 1 0-4h16a2 2 0 0 1 0 4h-2"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M6 12v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 3L2 7l10 4 10-4-10-4z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        LMS Integration
                      </h4>
                      <p className="text-slate-500">Export to your Learning Management System</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="step-navigation">
          {currentStep > 1 && (
            <button className="btn btn--outline" onClick={prevStep}>
              Previous
            </button>
          )}
          <button
            className="btn btn--primary"
            onClick={currentStep === 4 ? publishCourse : nextStep}
            disabled={!canProceed()}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  )
}
