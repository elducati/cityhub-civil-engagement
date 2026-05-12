'use client';

import { useState } from 'react';
import { useAdminUsers, useUpdateUserRole } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials, formatRelativeDate } from '@/lib/utils';
import { Users, ChevronLeft, ChevronRight, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

const roleConfig = {
  USER: { label: 'User', variant: 'default' as const, icon: Shield },
  MODERATOR: { label: 'Moderator', variant: 'secondary' as const, icon: ShieldCheck },
  ADMIN: { label: 'Admin', variant: 'warning' as const, icon: ShieldAlert },
};

function UserRoleBadge({ role }: { role: 'USER' | 'MODERATOR' | 'ADMIN' }) {
  const config = roleConfig[role];
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

function RoleSelect({
  currentRole,
  userId,
  onRoleChange,
  disabled,
}: {
  currentRole: string;
  userId: string;
  onRoleChange: (userId: string, role: 'USER' | 'MODERATOR' | 'ADMIN') => void;
  disabled: boolean;
}) {
  const roles: Array<'USER' | 'MODERATOR' | 'ADMIN'> = ['USER', 'MODERATOR', 'ADMIN'];

  return (
    <select
      value={currentRole}
      onChange={(e) => onRoleChange(userId, e.target.value as 'USER' | 'MODERATOR' | 'ADMIN')}
      disabled={disabled}
      className="bg-surface-base border border-outline rounded-xl px-3 py-1.5 text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
    >
      {roles.map((role) => (
        <option key={role} value={role}>
          {roleConfig[role].label}
        </option>
      ))}
    </select>
  );
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminUsers(page);
  const { mutate: updateRole, isPending: isUpdating } = useUpdateUserRole();

  const handleRoleChange = (userId: string, role: 'USER' | 'MODERATOR' | 'ADMIN') => {
    updateRole({ userId, role });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-1 p-8 text-center">
          <Users className="w-12 h-12 mx-auto text-error mb-4" />
          <h2 className="text-xl font-bold text-on-surface mb-2">Failed to load users</h2>
          <p className="text-on-surface-variant">Unable to fetch user data</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">User Management</h1>
          <p className="text-on-surface-variant mt-1">
            {data?.total ?? 0} total users · Page {page} of {data?.totalPages ?? 1}
          </p>
        </div>

        <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-outline">
              <thead className="bg-surface-container-high">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Proposals</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Votes</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-surface-container divide-y divide-outline">
                {data?.data.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-high transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="bg-primary-container text-primary text-sm font-medium">
                            {getInitials(user.name || user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-on-surface">
                            {user.name || 'Unnamed'}
                          </div>
                          <div className="text-sm text-on-surface-variant">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <UserRoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">{user.proposalCount}</td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">{user.voteCount}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{formatRelativeDate(user.createdAt)}</td>
                    <td className="px-6 py-4">
                      <RoleSelect
                        currentRole={user.role}
                        userId={user.id}
                        onRoleChange={handleRoleChange}
                        disabled={isUpdating}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!data?.data || data.data.length === 0) && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-on-surface-variant mb-4" />
              <p className="text-on-surface-variant">No users found</p>
            </div>
          )}
        </Card>

        {data && data.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <Button
              variant="outline"
              className="rounded-full"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-on-surface-variant">
              Page {page} of {data.totalPages}
            </span>
            <Button
              variant="outline"
              className="rounded-full"
              disabled={page >= data.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
