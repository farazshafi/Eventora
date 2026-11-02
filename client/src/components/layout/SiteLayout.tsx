import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CalendarDays, Menu, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, ButtonLink } from '../ui/Button';

export function SiteLayout() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition ${isActive ? 'text-[#173d33]' : 'text-slate-500 hover:text-[#173d33]'}`;
  async function logout() {
    await signOut();
    navigate('/');
  }
  return (
    <div className="min-h-screen text-[#202c26]">
      <header className="sticky top-0 z-40 border-b border-[#e8ece7] bg-[#fbfcf9]/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Eventora home">
            <span className="flex size-10 items-center justify-center rounded-[15px] bg-[#173d33] text-white">
              <CalendarDays size={19} />
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight">
              eventora<span className="text-[#83a28d]">.</span>
            </span>
          </Link>
          <div className="hidden items-center gap-9 md:flex">
            <NavLink to="/services" className={navClass}>
              Explore services
            </NavLink>
            <a
              href="/#how-it-works"
              className="text-sm font-medium text-slate-500 hover:text-[#173d33]"
            >
              How it works
            </a>
            <a
              href="/#why-eventora"
              className="text-sm font-medium text-slate-500 hover:text-[#173d33]"
            >
              Why Eventora
            </a>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <NavLink to="/bookings" className={navClass}>
                  My bookings
                </NavLink>
                <NavLink
                  to="/profile"
                  className="flex size-10 items-center justify-center rounded-full bg-[#e8efe9] text-[#31584a]"
                  title={user.name}
                >
                  <UserRound size={18} />
                </NavLink>
                <Button onClick={logout} variant="ghost" className="px-3">
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-600 hover:text-[#173d33]"
                >
                  Log in
                </Link>
                <ButtonLink to="/register" className="min-h-10 px-5">
                  Get started
                </ButtonLink>
              </>
            )}
          </div>
          <button
            className="flex size-10 items-center justify-center rounded-full border border-slate-200 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close navigation' : 'Open navigation'}
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </nav>
        {open && (
          <div className="border-t border-slate-100 bg-[#fbfcf9] px-5 py-5 md:hidden">
            <div className="flex flex-col gap-4">
              <NavLink onClick={() => setOpen(false)} to="/services" className={navClass}>
                Explore services
              </NavLink>
              {user ? (
                <>
                  <NavLink onClick={() => setOpen(false)} to="/bookings" className={navClass}>
                    My bookings
                  </NavLink>
                  <NavLink onClick={() => setOpen(false)} to="/profile" className={navClass}>
                    My profile
                  </NavLink>
                  <button onClick={logout} className="text-left text-sm font-medium text-slate-500">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <NavLink onClick={() => setOpen(false)} to="/login" className={navClass}>
                    Log in
                  </NavLink>
                  <ButtonLink to="/register" className="w-full">
                    Get started
                  </ButtonLink>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      <Outlet />
      <footer className="mt-24 bg-[#173d33] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link to="/" className="font-display text-2xl font-extrabold">
              eventora<span className="text-[#a9c4ad]">.</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">
              The good things happen when everything comes together. Find the people and places to
              make it happen.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-white/45">Explore</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/75">
              <Link to="/services">All services</Link>
              <a href="/#how-it-works">How it works</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-white/45">
              Your account
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/75">
              <Link to={user ? '/bookings' : '/login'}>My bookings</Link>
              <Link to={user ? '/profile' : '/register'}>
                {user ? 'My profile' : 'Create account'}
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-white/45 sm:flex-row sm:justify-between sm:px-8">
            <span>Made for the moments worth making.</span>
            <span>© {new Date().getFullYear()} Eventora</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
