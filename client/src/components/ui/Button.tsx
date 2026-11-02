import { Link, type LinkProps } from 'react-router-dom';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/utils';

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
export function Button({
  className = '',
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  const style =
    variant === 'primary'
      ? 'bg-[#173d33] text-white hover:bg-[#245546] hover:-translate-y-0.5 shadow-lg shadow-emerald-950/10'
      : variant === 'secondary'
        ? 'bg-[#e5eee9] text-[#173d33] hover:bg-[#d8e7df]'
        : 'text-slate-600 hover:bg-slate-100';
  return <button className={cn(base, style, className)} {...props} />;
}
export function ButtonLink({
  className = '',
  variant = 'primary',
  children,
  ...props
}: LinkProps & {
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  children: ReactNode;
}) {
  const style =
    variant === 'primary'
      ? 'bg-[#173d33] text-white hover:bg-[#245546] hover:-translate-y-0.5 shadow-lg shadow-emerald-950/10'
      : variant === 'secondary'
        ? 'bg-[#e5eee9] text-[#173d33] hover:bg-[#d8e7df]'
        : 'text-slate-600 hover:bg-slate-100';
  return (
    <Link className={cn(base, style, className)} {...props}>
      {children}
    </Link>
  );
}
