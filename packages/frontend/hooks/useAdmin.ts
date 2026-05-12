'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDashboardStats, getUsers, updateUserRole, getAuditLogs } from '@/lib/admin';

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

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'USER' | 'MODERATOR' | 'ADMIN' }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useAdminAuditLogs(page: number = 1) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', page],
    queryFn: () => getAuditLogs(page),
  });
}
