import './App.css'
import RestaurantDetailScreen from './components/RestaurantDetailScreen'

/**
 * First real screen, built from the "Ting Irie" design mockup. Uses sample
 * data only — this client isn't wired up to the Express/SQLite API yet.
 * See CLAUDE.md for the design tokens/rules this is built against.
 */
function App() {
  return (
    <div className="app-backdrop">
      <RestaurantDetailScreen />
    </div>
  )
}

export default App
