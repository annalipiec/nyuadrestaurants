import './App.css'

/**
 * Intentionally blank app shell. No real screens yet — this just proves the
 * design tokens, Figtree font, and PWA setup all work end to end. See
 * CLAUDE.md for the design rules this is built against.
 */
function App() {
  return (
    <main className="app-shell">
      <div className="app-shell__mark" aria-hidden="true" />
      <h1 className="app-shell__title">NYUAD Eats</h1>
      <p className="app-shell__subtitle">
        Affordable restaurants near campus — shuttle directions, must-try dishes, and community
        tips. Screens coming soon.
      </p>
      <span className="app-shell__card tap-target">Setup complete</span>
    </main>
  )
}

export default App
