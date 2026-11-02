import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Busy, ErrorNotice } from '../components/common/States';
import { ButtonLink } from '../components/ui/Button';
import { useUser } from '../hooks/useUser';
import { ProfileCard } from '../components/user/ProfileCard';

export default function ProfilePage() {
  const { user: cached } = useAuth();
  const query = useUser();
  const user = query.data ?? cached;
  if (query.isLoading)
    return (
      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <Busy label="Loading your profile" />
      </main>
    );
  if (query.isError || !user)
    return (
      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <ErrorNotice
          message="We couldn’t load your account details."
          retry={() => void query.refetch()}
        />
      </main>
    );
  return (
    <main className="mx-auto max-w-4xl px-5 pb-12 pt-12 sm:px-8 sm:pt-16">
      <p className="eyebrow">Your Eventora account</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-[#21382b]">
        Hello, {user.name.split(' ')[0]}.
      </h1>
      <p className="mt-2 text-sm text-slate-500">Here are the details connected to your account.</p>
      <ProfileCard user={user} />
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#e7ece7] bg-white p-5">
        <ShieldCheck size={18} className="mt-0.5 text-[#64816b]" />
        <p className="text-xs leading-5 text-slate-500">
          Your account details are read-only here. Need help with your account? Contact the service
          team through your booking.
        </p>
      </div>
      <ButtonLink to="/bookings" className="mt-7">
        View my bookings <ArrowRight size={16} />
      </ButtonLink>
      <Link to="/services" className="ml-4 text-sm font-semibold text-[#52715b] hover:underline">
        Explore services
      </Link>
    </main>
  );
}
