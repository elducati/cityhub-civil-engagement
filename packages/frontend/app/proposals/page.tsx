export const revalidate = 60; // ISR: 60 seconds

import Link from 'next/link';
import { getProposals } from '@/lib/proposals';
import { Button } from '@/components/atoms/Button';
import { StatusChip, VoteCounter } from '@/components/atoms/Badge';
import type { ProposalQueryParams } from '@/lib/proposals';

interface ProposalsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProposalsPage({ searchParams }: ProposalsPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = typeof params.status === 'string' ? params.status as 'OPEN' | 'CLOSED' | 'ARCHIVED' : undefined;
  const search = typeof params.search === 'string' ? params.search : undefined;
  const sort = typeof params.sort === 'string' ? params.sort as 'createdAt' | 'voteCount' : undefined;

  const queryParams: ProposalQueryParams = { page, status, search, sort };
  const { data: proposals, pagination } = await getProposals(queryParams);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
        <Link href="/proposals/new">
          <Button>Create Proposal</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8">
        <Link href="/proposals" className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200">
          All
        </Link>
        <Link href="/proposals?status=OPEN" className="px-4 py-2 rounded-md bg-green-100 hover:bg-green-200">
          Open
        </Link>
        <Link href="/proposals?status=CLOSED" className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200">
          Closed
        </Link>
      </div>

      {/* Proposals Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {proposals.map((proposal) => (
          <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow h-full">
              <div className="flex justify-between items-start mb-3">
                <StatusChip status={proposal.status} />
                <VoteCounter count={proposal.voteCount} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{proposal.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">{proposal.description}</p>
              <p className="text-gray-400 text-xs">
                {new Date(proposal.createdAt).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {proposals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No proposals found</p>
          <Link href="/proposals/new">
            <Button variant="outline">Create the first proposal</Button>
          </Link>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <Link
              key={i + 1}
              href={`/proposals?page=${i + 1}${status ? `&status=${status}` : ''}`}
              className={`px-4 py-2 rounded-md ${
                pagination.page === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}