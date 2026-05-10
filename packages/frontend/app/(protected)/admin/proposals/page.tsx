'use client';

import { useProposals } from '@/hooks/useProposals';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatRelativeDate } from '@/lib/utils';
import { Check, X, CheckCircle, Filter, Download } from 'lucide-react';

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
  const { data, isLoading } = useProposals({ status: 'OPEN', limit: 50 });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Moderation Queue</h1>
            <p className="text-on-surface-variant mt-1">Review and manage submitted proposals</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="rounded-full">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
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
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{proposal.authorId}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={proposal.status} />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">{proposal.voteCount}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{formatRelativeDate(proposal.createdAt)}</td>
                    <td className="px-6 py-4 space-x-2">
                      <Button size="sm" variant="success" className="rounded-full">
                        <Check className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="danger" className="rounded-full">
                        <X className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!data?.data || data.data.length === 0) && (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 mx-auto text-success mb-4" />
              <p className="text-on-surface-variant">No proposals pending moderation</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}