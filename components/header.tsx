import { Film } from "lucide-react"

export function Header() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            {/* Black square with white icon */}
            <div className="bg-black rounded-lg flex items-center tracking-normal flex-col justify-center gap-0 py-0.5 h-11 w-11">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold font-serif text-foreground text-left leading-5 tracking-normal text-3xl">
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
