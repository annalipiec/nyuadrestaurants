import type { Location } from 'react-router-dom'
import { Route, Routes, useLocation } from 'react-router-dom'
import ExploreMapScreen from './pages/ExploreMapScreen'
import RestaurantDetailScreen from './pages/RestaurantDetailScreen'
import LoginScreen from './pages/LoginScreen'
import SignupScreen from './pages/SignupScreen'
import VerifyEmailScreen from './pages/VerifyEmailScreen'
import DetailOverlay from './components/DetailOverlay'

type BackgroundLocationState = { backgroundLocation?: Location }

/**
 * Wired up to the real server/ API (see CLAUDE.md) — ExploreMapScreen is the
 * home screen (map + list of real restaurants), tapping one opens
 * RestaurantDetailScreen with real data, likes, and reviews.
 *
 * The restaurant detail route renders twice when opened from the map/list:
 * once for the main <Routes>, using the *previous* location (so the map
 * stays mounted underneath, per CLAUDE.md), and once more here as a
 * bottom-sheet overlay on top of it. This is react-router's standard
 * "modal route" pattern. A direct visit to /restaurants/:id (no prior
 * in-app location — a shared link, a refresh) has no backgroundLocation,
 * so it falls through to the plain main-route render: a full standalone
 * screen with its own illustrated header, not an overlay with nothing
 * underneath it.
 */
function App() {
  const location = useLocation()
  const state = location.state as BackgroundLocationState | null
  const backgroundLocation = state?.backgroundLocation

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<ExploreMapScreen />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/verify-email" element={<VerifyEmailScreen />} />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route
            path="/restaurants/:id"
            element={
              <DetailOverlay>
                <RestaurantDetailScreen embedded />
              </DetailOverlay>
            }
          />
        </Routes>
      )}
    </>
  )
}

export default App
