import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition ${
    isActive ? 'bg-nyuad-700 text-white' : 'text-nyuad-800 hover:bg-nyuad-100'
  }`;

export default function NavBar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-[1000] border-b border-nyuad-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-nyuad-700 font-bold text-white">
            N
          </span>
          <span className="font-semibold text-nyuad-950">NYUAD Eats</span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Explore
          </NavLink>
          <NavLink to="/add-restaurant" className={linkClass}>
            Add a spot
          </NavLink>
          {user ? (
            <div className="ml-2 flex items-center gap-2">
              <span className="hidden text-sm text-nyuad-600 sm:inline">Hi, {user.name.split(' ')[0]}</span>
              <button
                onClick={logout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-nyuad-800 hover:bg-nyuad-100"
              >
                Log out
              </button>
            </div>
          ) : (
            <NavLink to="/login" className={linkClass}>
              Log in
            </NavLink>
          )}
        </nav>
      </div>

      {user && !user.email_verified && location.pathname !== '/verify-email' && (
        <div className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
          Verify your @nyu.edu email to post reviews and add restaurants —{' '}
          <Link to="/verify-email" className="font-medium underline">
            verify now
          </Link>
          .
        </div>
      )}
    </header>
  );
}
