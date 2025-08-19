"use client"
import SimpleMediaExtractor from "@/components/simple-media-extractor"
import { Header } from "@/components/header"
import { StatsOverview } from "@/components/stats-overview"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="extraction-header mb-8 text-center bg-black font-sans rounded-4xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-4">
            AI Media Extractor
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Extract structured data, transcripts, and insights from videos, audio, and PDFs using advanced AI technology
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6 text-sm">
            <span className="bg-primary/20 px-3 py-1 rounded-full font-medium text-white">
              Real-time Processing
            </span>
            <span className="bg-secondary/20 px-3 py-1 rounded-full font-medium text-white">
              Speaker Diarization
            </span>
            <span className="bg-green-600/20 px-3 py-1 rounded-full font-medium text-white">
              Multi-format Support
            </span>
          </div>
        </div>

        <StatsOverview />

        <section className="mt-12">
          <SimpleMediaExtractor />
        </section>
      </main>

      <footer className="border-t border-gray-700 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="text-sm">
            Powered by Google Gemini 2.0 Flash and AssemblyAI • Built with Next.js and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  )
}
