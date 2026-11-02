import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Busy, ErrorNotice } from '../components/common/States';

export function RequireAuth() {
  const { user, loading, error, retry } = useAuth();
  const location = useLocation();
  if (loading) return <Busy label="Checking your account" />;
  if (error)
    return (
      <main className="mx-auto max-w-2xl px-5 py-12">
        <ErrorNotice message="We couldn’t verify your account right now." retry={retry} />
      </main>
    );
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
