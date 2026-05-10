export const revalidate = 60;

import Link from 'next/link';
import { getProposals } from '@/lib/proposals';
import { Button } from '@/components/atoms/Button';
import { StatusChip, VoteCounter } from '@/components/atoms/Badge';
import { formatRelativeDate } from '@/lib/utils';
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

  const filters = [
    { label: 'All', value: undefined, bg: 'bg-gray-100 hover:bg-gray-200' },
    { label: 'Open', value: 'OPEN', bg: 'bg-success/10 text-success hover:bg-success/20' },
    { label: 'Closed', value: 'CLOSED', bg: 'bg-gray-100 hover:bg-gray-200' },
    { label: 'Archived', value: 'ARCHIVED', bg: 'bg-gray-100 hover:bg-gray-200' },
  ];

  return (
    <div className="min-h-screen bg-background-default py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Proposals</h1>
            <p className="text-text-secondary mt-1">Browse and support community proposals</p>
          </div>
          <Link href="/proposals/create">
            <Button>Create Proposal</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((filter) => {
            const isActive = status === filter.value || (!status && !filter.value);
            return (
              <Link
                key={filter.label}
                href={`/proposals${filter.value ? `?status=${filter.value}` : ''}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-button'
                    : filter.bg + ' text-text-secondary'
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        {/* Proposals Grid */}
        {proposals.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposals.map((proposal) => (
              <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
                <div className="glass-card p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <StatusChip status={proposal.status} />
                    <VoteCounter count={proposal.voteCount} />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">{proposal.title}</h3>
                  <p className="text-text-secondary text-sm line-clamp-3 mb-4 flex-grow">{proposal.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-text-secondary">{formatRelativeDate(proposal.createdAt)}</span>
                    <span className="text-xs text-primary font-medium">Read more →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass-card">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-text-secondary text-lg mb-4">No proposals found</p>
            <Link href="/proposals/create">
              <Button>Create the first proposal</Button>
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: pagination.totalPages }, (_, i) => {
              const isActive = pagination.page === i + 1;
              return (
                <Link
                  key={i + 1}
                  href={`/proposals?page=${i + 1}${status ? `&status=${status}` : ''}`}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-button'
                      : 'bg-white text-text-secondary hover:bg-primary/5'
                  }`}
                >
                  {i + 1}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}