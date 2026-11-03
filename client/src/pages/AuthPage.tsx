import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { AuthResult } from '../types/user.types';
import { login, register, verifyEmail, resendVerification } from '../api/auth.api';
import { ApiError } from '../api/axios';
import { Button } from '../components/ui/Button';
import { ErrorNotice } from '../components/common/States';
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '../schemas/auth.schema';
type Login = LoginInput;
type Register = RegisterInput;
const fieldClass =
  'h-[50px] w-full rounded-xl border border-[#e1e7e1] bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#87a18c] focus:ring-2 focus:ring-[#e6eee6]';

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const isRegister = mode === 'register';
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [codeSeconds, setCodeSeconds] = useState(10 * 60);
  useEffect(() => {
    if (!verificationEmail || codeSeconds <= 0) return;
    const timer = window.setInterval(
      () => setCodeSeconds((seconds) => Math.max(0, seconds - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [verificationEmail, codeSeconds]);
  const redirectTo = (location.state as { from?: { pathname?: string; search?: string } } | null)
    ?.from;
  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });
  const mutation = useMutation<
    AuthResult | { verificationRequired: true },
    Error,
    Login | Register
  >({
    mutationFn: (data: Login | Register) =>
      isRegister ? register(data as RegisterInput) : login(data as LoginInput),
    onSuccess: (result) => {
      if ('verificationRequired' in result) {
        setVerificationEmail(registerForm.getValues('email').trim().toLowerCase());
        return;
      }
      signIn(result);
      navigate(
        redirectTo?.pathname ? `${redirectTo.pathname}${redirectTo.search ?? ''}` : '/services',
        { replace: true },
      );
    },
  });
  const verify = useMutation({
    mutationFn: () => verifyEmail(verificationEmail, verificationCode),
    onSuccess: (result) => {
      signIn(result);
      navigate(
        redirectTo?.pathname ? `${redirectTo.pathname}${redirectTo.search ?? ''}` : '/services',
        { replace: true },
      );
    },
    onError: (error) =>
      setVerificationError(error instanceof Error ? error.message : 'Could not verify your email.'),
  });
  const resend = useMutation({
    mutationFn: () => resendVerification(verificationEmail),
    onSuccess: () => {
      setCodeSeconds(10 * 60);
      setVerificationCode('');
      setVerificationError('A new code has been sent.');
    },
    onError: (error) =>
      setVerificationError(error instanceof Error ? error.message : 'Could not resend the code.'),
  });
  const errors = isRegister ? registerForm.formState.errors : loginForm.formState.errors;
  function submit(data: Login | Register) {
    mutation.mutate(data);
  }
  const linkMode = isRegister ? 'login' : 'register';
  if (user)
    return (
      <Navigate
        to={redirectTo?.pathname ? `${redirectTo.pathname}${redirectTo.search ?? ''}` : '/services'}
        replace
      />
    );
  return (
    <main className="auth-backdrop min-h-[calc(100vh-76px)] px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_30px_100px_-50px_rgba(29,60,39,.35)] md:grid-cols-[.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-[#234a38] p-10 text-white md:block">
          <div className="auth-orb absolute -right-14 -top-10 size-72 rounded-full bg-[#729579]/45 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-[#bea87c]/25 blur-2xl" />
          <div className="relative flex h-full min-h-[530px] flex-col justify-between">
            <Link to="/" className="font-display text-2xl font-extrabold">
              eventora<span className="text-[#bdd5bd]">.</span>
            </Link>
            <div>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-white/70">
                The moments start here
              </span>
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-[-.04em]">
                Bring the good
                <br />
                <span className="italic text-[#c8dec9]">stuff</span> together.
              </h1>
              <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">
                A thoughtful place to plan the gatherings you’ll remember.
              </p>
            </div>
            <p className="text-xs text-white/45">Made for the moments worth making.</p>
          </div>
        </aside>
        <section className="px-6 py-8 sm:px-10 sm:py-11">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#385c44]"
          >
            <ArrowLeft size={14} /> Back to home
          </Link>
          <div className="mt-8">
            <p className="eyebrow">{isRegister ? 'Start something lovely' : 'Welcome back'}</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#23392c]">
              {isRegister ? 'Make yourself at home.' : 'Good to see you.'}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {isRegister
                ? 'Create an account to keep your plans together.'
                : 'Log in to pick up where your plans left off.'}
            </p>
          </div>
          {mutation.isError && !verificationEmail && (
            <div className="mt-6">
              <ErrorNotice
                message={
                  mutation.error instanceof ApiError
                    ? mutation.error.message
                    : 'We couldn’t complete that request.'
                }
              />
            </div>
          )}
          {verificationEmail ? (
            <form
              className="mt-7 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setVerificationError('');
                verify.mutate();
              }}
            >
              <p className="text-sm text-slate-600">
                Enter the 6 digit code sent to <strong>{verificationEmail}</strong>.
              </p>
              <p
                role="timer"
                aria-live="polite"
                className={`text-sm font-medium ${codeSeconds === 0 ? 'text-rose-700' : 'text-slate-500'}`}
              >
                {codeSeconds === 0
                  ? 'This code has expired. Request a new code to continue.'
                  : `Code expires in ${String(Math.floor(codeSeconds / 60)).padStart(2, '0')}:${String(codeSeconds % 60).padStart(2, '0')}`}
              </p>
              <input
                value={verificationCode}
                onChange={(event) =>
                  setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                }
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className={fieldClass}
                placeholder="Verification code"
              />
              {verificationError && <ErrorNotice message={verificationError} />}
              <Button
                type="submit"
                disabled={verificationCode.length !== 6 || verify.isPending || codeSeconds === 0}
                className="w-full"
              >
                {verify.isPending ? 'Verifying…' : 'Verify email'}
              </Button>
              <button
                type="button"
                onClick={() => resend.mutate()}
                disabled={resend.isPending}
                className="w-full text-center text-sm font-semibold text-[#365d45]"
              >
                {resend.isPending ? 'Sending…' : 'Resend code'}
              </button>
            </form>
          ) : (
            <form
              className="mt-7 space-y-4"
              onSubmit={
                isRegister ? registerForm.handleSubmit(submit) : loginForm.handleSubmit(submit)
              }
            >
              {isRegister && (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Your name
                  </span>
                  <span className="relative block">
                    <UserRound
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      autoComplete="name"
                      className={fieldClass}
                      placeholder="How should we call you?"
                      {...registerForm.register('name')}
                    />
                  </span>
                  {isRegister && registerForm.formState.errors.name && (
                    <span className="mt-1 block text-xs text-rose-600">
                      {registerForm.formState.errors.name.message}
                    </span>
                  )}
                </label>
              )}
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Email address
                </span>
                <span className="relative block">
                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    autoComplete="email"
                    inputMode="email"
                    className={fieldClass}
                    placeholder="you@example.com"
                    {...(isRegister ? registerForm.register('email') : loginForm.register('email'))}
                  />
                </span>
                {errors.email && (
                  <span className="mt-1 block text-xs text-rose-600">{errors.email.message}</span>
                )}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">Password</span>
                <span className="relative block">
                  <LockKeyhole
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    type={showPassword ? 'text' : 'password'}
                    className={`${fieldClass} pr-12`}
                    placeholder={isRegister ? 'At least 12 characters' : 'Your password'}
                    {...(isRegister
                      ? registerForm.register('password')
                      : loginForm.register('password'))}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
                {errors.password && (
                  <span className="mt-1 block text-xs text-rose-600">
                    {errors.password.message}
                  </span>
                )}
              </label>
              <Button type="submit" disabled={mutation.isPending} className="mt-2 w-full">
                {mutation.isPending
                  ? 'Please wait…'
                  : isRegister
                    ? 'Create your account'
                    : 'Log in'}{' '}
                {!mutation.isPending && <ArrowRight size={16} />}
              </Button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-slate-500">
            {isRegister ? 'Already have an account?' : 'New to Eventora?'}{' '}
            <Link to={`/${linkMode}`} className="font-bold text-[#365d45] hover:underline">
              {isRegister ? 'Log in' : 'Create an account'}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
