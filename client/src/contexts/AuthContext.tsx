import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logout, refreshSession } from '../api/auth.api';
import { authToken, unauthorizedEvent } from '../utils/auth-token';
import { useUser } from '../hooks/useUser';
import type { AuthResult, User } from '../types/user.types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: boolean;
  retry: () => void;
  signIn: (result: AuthResult) => void;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => authToken.get());
  const [booting, setBooting] = useState(true);
  const userQuery = useUser(Boolean(token));
  useEffect(() => {
    let active = true;
    if (token) {
      setBooting(false);
      return;
    }
    refreshSession()
      .then((result) => {
        if (active) {
          authToken.set(result.accessToken);
          setToken(result.accessToken);
          queryClient.setQueryData(['me'], result.user);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setBooting(false);
      });
    return () => {
      active = false;
    };
  }, [queryClient, token]);
  const {
    data: currentUser,
    isLoading: userLoading,
    isError: userError,
    refetch: refetchUser,
  } = userQuery;
  const retry = useCallback(() => {
    void refetchUser();
  }, [refetchUser]);
  useEffect(() => {
    const clearSession = () => {
      authToken.clear();
      setToken(null);
      queryClient.removeQueries({ queryKey: ['me'] });
    };
    window.addEventListener(unauthorizedEvent, clearSession);
    return () => window.removeEventListener(unauthorizedEvent, clearSession);
  }, [queryClient]);
  const signIn = useCallback(
    (result: AuthResult) => {
      authToken.set(result.accessToken);
      setToken(result.accessToken);
      queryClient.setQueryData(['me'], result.user);
    },
    [queryClient],
  );
  const signOut = useCallback(async () => {
    try {
      if (authToken.get()) await logout();
    } finally {
      authToken.clear();
      setToken(null);
      queryClient.clear();
    }
  }, [queryClient]);
  const value = useMemo(
    () => ({
      user: token ? (currentUser ?? null) : null,
      loading: booting || (Boolean(token) && userLoading),
      error: Boolean(token) && userError,
      retry,
      signIn,
      signOut,
    }),
    [token, booting, currentUser, userLoading, userError, retry, signIn, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
