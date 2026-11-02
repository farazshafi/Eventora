import { CalendarDays, Mail, UserRound } from 'lucide-react';
import type { User } from '../../types/user.types';
import { formatDate } from '../../utils/format';

export function ProfileCard({ user }: { user: User }) {
  return (
    <div className="mt-9 overflow-hidden rounded-[28px] border border-[#e6ebe6] bg-white">
      <div className="flex items-center gap-5 bg-[#f0f4ef] p-6 sm:p-8">
        <span className="flex size-16 items-center justify-center rounded-[22px] bg-white text-[#4e7159] shadow-sm">
          <UserRound size={26} />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold text-[#2a4332]">{user.name}</h2>
          <p className="mt-1 text-sm text-slate-500">Eventora member</p>
        </div>
      </div>
      <div className="grid gap-0 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0">
        <div className="flex items-start gap-3 p-6 sm:p-7">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#edf3ed] text-[#5c7c65]">
            <Mail size={17} />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-400">Email address</p>
            <p className="mt-1 text-sm font-bold text-[#34483a]">{user.email}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 border-slate-100 p-6 sm:border-l sm:p-7">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#edf3ed] text-[#5c7c65]">
            <CalendarDays size={17} />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-400">Member since</p>
            <p className="mt-1 text-sm font-bold text-[#34483a]">{formatDate(user.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
