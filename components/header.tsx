import { Brain, Zap } from "lucide-react"

export function Header() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-foreground">MediaExtract AI</h2>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-secondary" />
                <span className="text-xs font-semibold text-secondary uppercase tracking-wide">
                  Powered by Gemini 2.0
                </span>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#extract" className="text-muted-foreground hover:text-primary transition-colors">
              Extract
            </a>
            <a href="#results" className="text-muted-foreground hover:text-primary transition-colors">
              Results
            </a>
            <a href="#api" className="text-muted-foreground hover:text-primary transition-colors">
              API
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
