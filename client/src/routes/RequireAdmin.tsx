import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Busy, ErrorNotice } from '../components/common/States';

export function RequireAdmin() {
  const { user, loading, error, retry } = useAuth();
  const location = useLocation();
  if (loading) return <Busy label="Checking administrator access" />;
  if (error)
    return (
      <main className="mx-auto max-w-2xl px-5 py-12">
        <ErrorNotice message="We couldn’t verify administrator access." retry={retry} />
      </main>
    );
  return user?.role === 'ADMIN' ? (
    <Outlet />
  ) : (
    <Navigate to="/admin/login" replace state={{ from: location }} />
  );
}
