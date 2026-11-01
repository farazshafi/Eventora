import { useEffect, useState } from 'react';
import { Activity, CalendarDays, CircleAlert, CircleCheck, LoaderCircle } from 'lucide-react';
import { getHealthStatus, type HealthStatus } from './services/health.service';

type ConnectionState = 'loading' | 'online' | 'offline';

export default function App() {
  const [connection, setConnection] = useState<ConnectionState>('loading');
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    let active = true;
    void getHealthStatus()
      .then((status) => {
        if (active) {
          setHealth(status);
          setConnection('online');
        }
      })
      .catch(() => {
        if (active) setConnection('offline');
      });
    return () => {
      active = false;
    };
  }, []);

  const connected = connection === 'online';
  const statusLabel =
    connection === 'loading'
      ? 'Checking connection'
      : connected
        ? 'All systems operational'
        : 'API unavailable';
  const StatusIcon =
    connection === 'loading' ? LoaderCircle : connected ? CircleCheck : CircleAlert;

  return (
    <main className="min-h-screen px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <a href="#home" className="flex items-center gap-3 text-slate-900 no-underline">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200/70">
              <CalendarDays size={21} strokeWidth={2.2} />
            </span>
            <span className="text-sm font-bold tracking-tight">
              Gather<span className="text-indigo-600">.ly</span>
            </span>
          </a>
          <div className="hidden rounded-full border border-slate-200 bg-white/75 px-4 py-2 text-xs font-semibold tracking-wide text-slate-500 shadow-sm sm:block">
            PLATFORM FOUNDATION
          </div>
        </header>
        <section className="grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3.5 py-2 text-xs font-semibold text-indigo-700">
              <Activity size={14} /> A better way to bring people together
            </div>
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.08] tracking-[-0.055em] text-slate-950 sm:text-6xl">
              Make room for <span className="text-indigo-600">what brings us together.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-500 sm:text-lg sm:leading-8">
              A thoughtful place to discover experiences, plan the details, and make the moments
              that stay with you.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200/70 transition hover:bg-indigo-700">
                Your next great day starts here <span aria-hidden="true">↗</span>
              </button>
              <span className="text-sm text-slate-400">A little something is on its way</span>
            </div>
          </div>
          <aside className="relative">
            <div className="absolute -right-4 -top-5 size-24 rounded-full bg-indigo-200/40 blur-2xl" />
            <div className="absolute -bottom-7 -left-5 size-28 rounded-full bg-amber-200/40 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 p-7 shadow-[0_30px_90px_-38px_rgba(51,65,120,0.32)] backdrop-blur sm:p-9">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    A little check-in
                  </span>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
                    Behind the scenes
                  </h2>
                </div>
                <span
                  className={`flex size-11 items-center justify-center rounded-2xl ${connected ? 'bg-emerald-50 text-emerald-600' : connection === 'offline' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}
                >
                  <StatusIcon
                    className={connection === 'loading' ? 'animate-spin' : ''}
                    size={21}
                  />
                </span>
              </div>
              <div className="mt-7 rounded-2xl bg-slate-50/90 p-5">
                <div className="flex items-center gap-3">
                  <span
                    className={`size-2 rounded-full ${connected ? 'bg-emerald-500' : connection === 'offline' ? 'bg-rose-500' : 'animate-pulse bg-indigo-500'}`}
                  />
                  <span className="text-sm font-semibold text-slate-700">{statusLabel}</span>
                </div>
                <p className="mt-2 pl-5 text-sm leading-6 text-slate-500">
                  {connected
                    ? `The API is responding${health?.timestamp ? ` · ${new Date(health.timestamp).toLocaleTimeString()}` : ''}.`
                    : connection === 'offline'
                      ? 'The frontend is ready. Start the API to bring this connection online.'
                      : 'Connecting to the event platform API…'}
                </p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  ['Frontend', 'React + Vite'],
                  ['Backend', 'Express + TypeScript'],
                ].map(([name, value]) => (
                  <div
                    key={name}
                    className="rounded-2xl border border-slate-100 bg-white px-4 py-3.5"
                  >
                    <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      {name}
                    </div>
                    <div className="mt-1.5 text-xs font-semibold text-slate-700">{value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 text-xs text-slate-400">
                <span>Good things are coming together.</span>
                <span className="font-medium text-indigo-500">Foundation v1</span>
              </div>
            </div>
          </aside>
        </section>
        <footer className="flex flex-col gap-2 border-t border-slate-200/70 pt-6 text-xs text-slate-400 sm:flex-row sm:justify-between">
          <span>Made for the moments worth making.</span>
          <span>Event Booking Platform · {new Date().getFullYear()}</span>
        </footer>
      </div>
    </main>
  );
}
