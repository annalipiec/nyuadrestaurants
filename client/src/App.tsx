import { Route, Routes } from 'react-router-dom'
import ExploreMapScreen from './pages/ExploreMapScreen'
import RestaurantDetailScreen from './pages/RestaurantDetailScreen'
import LoginScreen from './pages/LoginScreen'
import SignupScreen from './pages/SignupScreen'
import VerifyEmailScreen from './pages/VerifyEmailScreen'

/**
 * Wired up to the real server/ API (see CLAUDE.md) — ExploreMapScreen is the
 * home screen (map + list of real restaurants), tapping one opens
 * RestaurantDetailScreen with real data, likes, and reviews.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<ExploreMapScreen />} />
      <Route path="/restaurants/:id" element={<RestaurantDetailScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/signup" element={<SignupScreen />} />
      <Route path="/verify-email" element={<VerifyEmailScreen />} />
    </Routes>
  )
}

export default App
