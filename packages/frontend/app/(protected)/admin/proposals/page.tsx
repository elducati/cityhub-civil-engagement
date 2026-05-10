'use client';

import { useProposals } from '@/hooks/useProposals';
import { Button } from '@/components/atoms/Button';
import { StatusChip } from '@/components/atoms/Badge';

export default function AdminProposalsPage() {
  const { data, isLoading } = useProposals({ status: 'OPEN', limit: 50 });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Moderation Queue</h1>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Votes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.data.map((proposal) => (
              <tr key={proposal.id}>
                <td className="px-6 py-4">{proposal.title}</td>
                <td className="px-6 py-4">{proposal.authorId}</td>
                <td className="px-6 py-4">
                  <StatusChip status={proposal.status} />
                </td>
                <td className="px-6 py-4">{proposal.voteCount}</td>
                <td className="px-6 py-4 space-x-2">
                  <Button size="sm" variant="outline">Approve</Button>
                  <Button size="sm" variant="danger">Reject</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}