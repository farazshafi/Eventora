import { CalendarDays, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminPageTitle } from '../../components/admin/AdminUI';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/format';

export default function AdminSettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const logout = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };
  return (
    <>
      <AdminPageTitle
        eyebrow="Your account"
        title="Profile & settings"
        detail="Your administrator account details and session controls."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-[28px] border border-[#e5ece4] bg-white p-6 sm:p-8">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <span className="grid size-14 place-items-center rounded-2xl bg-[#eaf1eb] text-[#477458]">
              <UserRound size={24} />
            </span>
            <div>
              <p className="font-display text-xl font-bold">{user?.name}</p>
              <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
          <dl className="grid gap-5 pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-[.16em] text-[#789080]">
                Account role
              </dt>
              <dd className="mt-2 flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck size={16} className="text-emerald-700" />
                Administrator
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[.16em] text-[#789080]">
                Member since
              </dt>
              <dd className="mt-2 flex items-center gap-2 text-sm font-semibold">
                <CalendarDays size={16} className="text-[#789080]" />
                {user ? formatDate(user.createdAt) : '—'}
              </dd>
            </div>
          </dl>
        </section>
        <aside className="h-fit rounded-[28px] border border-[#e5ece4] bg-white p-6">
          <h2 className="font-display text-lg font-bold">Session</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign out when you’re finished managing services and bookings on this device.
          </p>
          <Button variant="secondary" className="mt-5 w-full" onClick={() => void logout()}>
            <LogOut size={16} />
            Sign out
          </Button>
          <p className="mt-4 text-xs leading-5 text-slate-400">
            Profile details are read-only in the current account API.
          </p>
        </aside>
      </div>
    </>
  );
}
