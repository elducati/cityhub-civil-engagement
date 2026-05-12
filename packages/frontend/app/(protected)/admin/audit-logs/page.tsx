'use client';

import { useState } from 'react';
import { useAdminAuditLogs } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeDate } from '@/lib/utils';
import { ScrollText, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const actionColors: Record<string, 'success' | 'default' | 'error' | 'warning' | 'secondary'> = {
  CREATE: 'success',
  UPDATE: 'default',
  DELETE: 'error',
  VOTE: 'secondary',
  UNVOTE: 'warning',
  LOGIN: 'default',
};

function ActionBadge({ action }: { action: string }) {
  const variant = actionColors[action] || 'default';
  return <Badge variant={variant}>{action}</Badge>;
}

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>('');
  const { data, isLoading, error, refetch } = useAdminAuditLogs(page);

  const allActions = ['CREATE', 'UPDATE', 'DELETE', 'VOTE', 'UNVOTE', 'LOGIN'];
  const filteredLogs = data?.data.filter(log => !actionFilter || log.action === actionFilter) ?? [];

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
          <ScrollText className="w-12 h-12 mx-auto text-error mb-4" />
          <h2 className="text-xl font-bold text-on-surface mb-2">Failed to load audit logs</h2>
          <p className="text-on-surface-variant mb-4">Unable to fetch audit log data</p>
          <Button onClick={() => refetch()} className="rounded-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Audit Logs</h1>
            <p className="text-on-surface-variant mt-1">
              Track all administrative actions · {data?.total ?? 0} total entries
            </p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-sm font-medium text-on-surface-variant">Filter by action:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setActionFilter(''); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                !actionFilter ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              All
            </button>
            {allActions.map(action => (
              <button
                key={action}
                onClick={() => { setActionFilter(action); setPage(1); }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  actionFilter === action ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-outline">
              <thead className="bg-surface-container-high">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Entity Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Entity ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-surface-container divide-y divide-outline">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-surface-container-high transition-colors"
                  >
                    <td className="px-6 py-4">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface font-medium capitalize">{log.entityType}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant font-mono">
                      {log.entityId ? log.entityId.substring(0, 8) + '...' : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant font-mono">
                      {log.userId ? log.userId.substring(0, 8) + '...' : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{formatRelativeDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <ScrollText className="w-12 h-12 mx-auto text-on-surface-variant mb-4" />
              <p className="text-on-surface-variant">{actionFilter ? 'No matching audit logs' : 'No audit logs found'}</p>
            </div>
          ) : null}
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
