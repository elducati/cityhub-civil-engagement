'use client';

import { useProposals } from '@/hooks/useProposals';
import { Button } from '@/components/atoms/Button';
import { StatusChip } from '@/components/atoms/Badge';
import { formatRelativeDate } from '@/lib/utils';

export default function AdminProposalsPage() {
  const { data, isLoading } = useProposals({ status: 'OPEN', limit: 50 });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-default flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-default p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Moderation Queue</h1>
            <p className="text-text-secondary mt-1">Review and manage submitted proposals</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Filter</Button>
            <Button>Export</Button>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-primary/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Author</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Votes</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.data.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary line-clamp-1">{proposal.title}</div>
                    <div className="text-xs text-text-secondary line-clamp-1">{proposal.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{proposal.authorId}</td>
                  <td className="px-6 py-4">
                    <StatusChip status={proposal.status} />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-text-primary">{proposal.voteCount}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{formatRelativeDate(proposal.createdAt)}</td>
                  <td className="px-6 py-4 space-x-2">
                    <Button size="sm" variant="success">Approve</Button>
                    <Button size="sm" variant="danger">Reject</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!data?.data || data.data.length === 0) && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-text-secondary">No proposals pending moderation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}