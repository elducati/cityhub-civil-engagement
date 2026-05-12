'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDashboardStats, getUsers, updateUserRole, getAuditLogs } from '@/lib/admin';
import { useToast } from './useToast';

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getDashboardStats,
    refetchInterval: 30000,
  });
}

export function useAdminUsers(page: number = 1) {
  return useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: () => getUsers(page),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'USER' | 'MODERATOR' | 'ADMIN' }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User role updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update role');
    },
  });
}

export function useAdminAuditLogs(page: number = 1) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', page],
    queryFn: () => getAuditLogs(page),
  });
}
