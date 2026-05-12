'use client';

import { useProposals, useUpdateProposal } from '@/hooks/useProposals';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRelativeDate } from '@/lib/utils';
import { Check, X, CheckCircle, Filter, Download, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { api } from '@/lib/api';

function StatusBadge({ status }: { status: string }) {
  const styles = {
    OPEN: 'bg-success text-white',
    CLOSED: 'bg-on-surface-variant text-on-surface',
    ARCHIVED: 'bg-outline text-on-surface-variant',
  };
  const labels = {
    OPEN: 'Open',
    CLOSED: 'Closed',
    ARCHIVED: 'Archived',
  };
  return (
    <Badge className={`${styles[status as keyof typeof styles]} rounded-full`}>
      {labels[status as keyof typeof labels]}
    </Badge>
  );
}

export default function AdminProposalsPage() {
  const [filter, setFilter] = useState<'OPEN' | 'CLOSED' | 'ARCHIVED' | undefined>('OPEN');
  const { data, isLoading, error, refetch } = useProposals({ status: filter, limit: 50 });
  const { mutate: updateProposal, isPending } = useUpdateProposal();

  const handleStatusChange = (proposalId: string, status: 'CLOSED' | 'ARCHIVED') => {
    updateProposal({ proposalId, input: { status } }, {
      onSuccess: () => refetch(),
    });
  };

  const handleExport = async () => {
    try {
      const token = api.getAuthToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${baseUrl}/api/proposals/export/csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'proposals.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
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
          <CheckCircle className="w-12 h-12 mx-auto text-error mb-4" />
          <h2 className="text-xl font-bold text-on-surface mb-2">Failed to load proposals</h2>
          <p className="text-on-surface-variant mb-4">Unable to fetch proposals</p>
          <Button onClick={() => refetch()} className="rounded-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const filters = [
    { label: 'Open', value: 'OPEN' as const },
    { label: 'Closed', value: 'CLOSED' as const },
    { label: 'Archived', value: 'ARCHIVED' as const },
    { label: 'All', value: undefined },
  ];

  return (
    <div className="min-h-screen bg-surface-base p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Moderation Queue</h1>
            <p className="text-on-surface-variant mt-1">Review and manage submitted proposals</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button className="rounded-full" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => setFilter(f.value)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                filter === f.value
                  ? 'bg-primary text-white shadow-elevation-1'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-outline">
              <thead className="bg-surface-container-high">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Author</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Votes</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-surface-container divide-y divide-outline">
                {data?.data.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-surface-container-high transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-on-surface line-clamp-1">{proposal.title}</div>
                      <div className="text-xs text-on-surface-variant line-clamp-1">{proposal.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant font-mono">
                      {proposal.authorId.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={proposal.status} />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">{proposal.voteCount}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{formatRelativeDate(proposal.createdAt)}</td>
                    <td className="px-6 py-4 space-x-2">
                      {proposal.status === 'OPEN' && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            className="rounded-full"
                            disabled={isPending}
                            onClick={() => handleStatusChange(proposal.id, 'CLOSED')}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            className="rounded-full"
                            disabled={isPending}
                            onClick={() => handleStatusChange(proposal.id, 'ARCHIVED')}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {proposal.status !== 'OPEN' && (
                        <span className="text-xs text-on-surface-variant italic">No actions available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!data?.data || data.data.length === 0) && (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 mx-auto text-success mb-4" />
              <p className="text-on-surface-variant">No proposals found for this filter</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
