export const revalidate = 60;

import Link from 'next/link';
import { getProposals } from '@/lib/proposals';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeDate } from '@/lib/utils';
import type { ProposalQueryParams } from '@/lib/proposals';
import { FileText, ArrowRight, ClipboardList } from 'lucide-react';

interface ProposalsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

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

function VoteCount({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1.5 text-on-surface-variant text-sm">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
      </svg>
      <span className="font-medium">{count}</span>
    </div>
  );
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
    { label: 'All', value: undefined },
    { label: 'Open', value: 'OPEN' },
    { label: 'Closed', value: 'CLOSED' },
    { label: 'Archived', value: 'ARCHIVED' },
  ];

  return (
    <div className="min-h-screen bg-surface-base py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Proposals</h1>
            <p className="text-on-surface-variant mt-1">Browse and support community proposals</p>
          </div>
          <Link href="/proposals/create">
            <Button className="rounded-full">Create Proposal</Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((filter) => {
            const isActive = status === filter.value || (!status && !filter.value);
            return (
              <Link
                key={filter.label}
                href={`/proposals${filter.value ? `?status=${filter.value}` : ''}`}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-elevation-1'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        {proposals.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposals.map((proposal) => (
              <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
                <Card className="h-full bg-surface-container rounded-3xl border-none shadow-elevation-1 hover:shadow-elevation-2 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-3">
                      <StatusBadge status={proposal.status} />
                      <VoteCount count={proposal.voteCount} />
                    </div>
                    <h3 className="text-lg font-semibold text-on-surface mb-2 line-clamp-2">{proposal.title}</h3>
                    <p className="text-on-surface-variant text-sm line-clamp-3 mb-4 flex-grow">{proposal.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-outline">
                      <span className="text-xs text-on-surface-variant">{formatRelativeDate(proposal.createdAt)}</span>
                      <span className="text-xs text-primary font-medium flex items-center gap-1">
                        Read more <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-container rounded-3xl">
            <ClipboardList className="w-16 h-16 mx-auto text-on-surface-variant mb-4" />
            <p className="text-on-surface-variant text-lg mb-4">No proposals found</p>
            <Link href="/proposals/create">
              <Button className="rounded-full">Create the first proposal</Button>
            </Link>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: pagination.totalPages }, (_, i) => {
              const isActive = pagination.page === i + 1;
              return (
                <Link
                  key={i + 1}
                  href={`/proposals?page=${i + 1}${status ? `&status=${status}` : ''}`}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-elevation-1'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
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