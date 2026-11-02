import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../api/user.api';

export function useUser(enabled = true) {
  return useQuery({ queryKey: ['me'], queryFn: getCurrentUser, enabled, retry: false });
}
