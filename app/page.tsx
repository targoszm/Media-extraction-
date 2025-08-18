"use client"
import { MediaExtractor } from "@/components/media-extractor"
import { Header } from "@/components/header"
import { StatsOverview } from "@/components/stats-overview"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="extraction-header rounded-2xl mb-8">
          <h1 className="text-4xl font-bold font-serif mb-4">AI Media Extractor</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Extract structured data, transcripts, and insights from videos, audio, and PDFs using Gemini 2.0 Flash
          </p>
        </div>

        <StatsOverview />
        <MediaExtractor />
      </main>
    </div>
  )
}
