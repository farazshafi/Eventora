import { LayoutDashboard, LogOut, Settings2, Sparkles, TicketCheck, UserRound } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminToastProvider } from './AdminUI';
import { cn } from '../../utils/utils';
import logo from '../../assets/logo.webp';

const links = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/services', label: 'Services', icon: Sparkles },
  { to: '/admin/bookings', label: 'Bookings', icon: TicketCheck },
  { to: '/admin/settings', label: 'Profile & settings', icon: Settings2 },
];

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const doSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };
  return (
    <AdminToastProvider>
      <div className="min-h-screen bg-[#f4f7f2] text-[#26372f] lg:flex">
        <aside className="flex w-full shrink-0 flex-col border-b border-[#e2eae2] bg-white px-5 py-4 lg:min-h-screen lg:w-[260px] lg:border-b-0 lg:border-r lg:px-6 lg:py-7">
          <NavLink to="/admin" className="flex items-center gap-3">
            <img src={logo} alt="" className="size-11 rounded-xl object-contain" />
            <span>
              <span className="block font-display text-lg font-extrabold text-[#173d33]">
                Eventora
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#829185]">
                Admin studio
              </span>
            </span>
          </NavLink>
          <nav
            aria-label="Admin navigation"
            className="mt-6 flex gap-2 overflow-x-auto lg:mt-12 lg:flex-col"
          >
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-[#eaf1eb] text-[#173d33]'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-[#173d33]',
                  )
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto hidden rounded-3xl bg-[#f3f6f0] p-4 lg:block">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7a8b7e]">
              Signed in as
            </p>
            <p className="mt-2 truncate text-sm font-bold">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
            <button
              onClick={() => void doSignOut()}
              className="mt-4 flex items-center gap-2 text-xs font-bold text-[#6d7c71] hover:text-rose-700"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-[#e2eae2] bg-white/80 px-5 py-4 backdrop-blur sm:px-8 lg:px-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#789080]">
                Event operations
              </p>
              <p className="mt-1 text-sm font-semibold text-[#293a31]">
                A little more joy, a lot more organized.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold">{user?.name}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <span className="grid size-10 place-items-center rounded-full bg-[#eaf1eb] text-[#456d57]">
                <UserRound size={18} />
              </span>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1500px] p-5 sm:p-8 lg:p-10">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminToastProvider>
  );
}
