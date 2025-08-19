import { Film } from "lucide-react"

export function Header() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            {/* Black square with white icon */}
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold font-serif text-foreground text-left tracking-wide leading-5 text-2xl">
                MediaExtract AI
              </h2>
              <span className="text-xs uppercase tracking-normal font-thin text-gray-600">
                Powered by Gemini 2.0
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#extract"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Extract
            </a>
            <a
              href="#results"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Results
            </a>
            <a
              href="#api"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              API
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
