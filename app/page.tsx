"use client"
import SimpleMediaExtractor from "@/components/simple-media-extractor"
import { Header } from "@/components/header"
import { StatsOverview } from "@/components/stats-overview"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="extraction-header rounded-2xl mb-8 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI Media Extractor
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Extract structured data, transcripts, and insights from videos, audio, and PDFs using advanced AI technology
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6 text-sm">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">Real-time Processing</span>
            <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full font-medium">
              Speaker Diarization
            </span>
            <span className="bg-green-600/10 text-green-600 px-3 py-1 rounded-full font-medium">
              Multi-format Support
            </span>
          </div>
        </div>

        <StatsOverview />

        <section className="mt-12">
          <SimpleMediaExtractor />
        </section>
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">
            Powered by Google Gemini 2.0 Flash and AssemblyAI • Built with Next.js and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  )
}
