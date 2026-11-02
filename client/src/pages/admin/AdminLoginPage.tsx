import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { adminLogin } from '../../api/auth.api';
import { ApiError } from '../../api/axios';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { loginSchema, type LoginInput } from '../../schemas/auth.schema';

export default function AdminLoginPage() {
  const { user, loading, signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [requestError, setRequestError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  if (loading)
    return (
      <main className="grid min-h-screen place-items-center text-sm text-slate-500">
        Checking your account…
      </main>
    );
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  const submit = async (input: LoginInput) => {
    setRequestError('');
    try {
      const result = await adminLogin(input);
      signIn(result);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from?.startsWith('/admin') ? from : '/admin', { replace: true });
    } catch (error) {
      setRequestError(
        error instanceof ApiError ? error.message : 'Could not sign in. Please try again.',
      );
    }
  };
  return (
    <main className="grid min-h-screen bg-[#f3f6f0] lg:grid-cols-[1fr_0.92fr]">
      <section className="relative hidden overflow-hidden bg-[#173d33] p-12 text-white lg:flex lg:flex-col lg:justify-between lg:p-16">
        <div className="absolute -right-28 -top-24 size-[440px] rounded-full border border-white/10" />
        <div className="absolute -right-12 -top-8 size-[310px] rounded-full border border-white/10" />
        <Link to="/" className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-white/10">
            <Sparkles />
          </span>
          <span className="font-display text-xl font-extrabold">Eventora</span>
        </Link>
        <div className="relative max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#c5ddcb]">
            A calmer way to bring it all together
          </p>
          <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.12]">
            The moments are magic. The details are yours.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/70">
            Manage your services and bookings from one thoughtful workspace.
          </p>
        </div>
        <p className="relative text-xs text-white/50">Administrator access · Eventora Studio</p>
      </section>
      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md rounded-[32px] border border-white bg-white p-7 shadow-[0_30px_90px_-45px_rgba(23,61,51,.28)] sm:p-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#173d33]"
          >
            <ArrowLeft size={16} />
            Back to Eventora
          </Link>
          <div className="mt-10 grid size-12 place-items-center rounded-2xl bg-[#eaf1eb] text-[#37654d]">
            <LockKeyhole size={21} />
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#688373]">
            Admin studio
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#1d3229]">
            Welcome back.
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in to manage the details that make each event special.
          </p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit(submit)} noValidate>
            <label className="block text-sm font-semibold text-slate-700">
              Email address
              <input
                {...register('email')}
                autoComplete="username"
                type="email"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-[#799985] focus:ring-4 focus:ring-[#dce9df]"
                placeholder="you@example.com"
              />
              {errors.email && (
                <span className="mt-1 block text-xs text-rose-700">{errors.email.message}</span>
              )}
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Password
              <span className="relative mt-2 block">
                <input
                  {...register('password')}
                  autoComplete="current-password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-12 outline-none transition focus:border-[#799985] focus:ring-4 focus:ring-[#dce9df]"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
              {errors.password && (
                <span className="mt-1 block text-xs text-rose-700">{errors.password.message}</span>
              )}
            </label>
            {requestError && (
              <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
                {requestError}
              </p>
            )}
            <Button className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in to admin'}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-400">
            This sign-in is reserved for administrator accounts.
          </p>
        </div>
      </section>
    </main>
  );
}
