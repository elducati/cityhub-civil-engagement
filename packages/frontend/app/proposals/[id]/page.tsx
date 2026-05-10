'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProposal, useVote, useRemoveVote } from '@/hooks/useProposals';
import { Button } from '@/components/atoms/Button';
import { StatusChip, VoteCounter } from '@/components/atoms/Badge';
import { formatRelativeDate } from '@/lib/utils';

export default function ProposalDetailPage() {
  const params = useParams();
  const proposalId = params.id as string;
  const { data: proposal, isLoading } = useProposal(proposalId);
  const voteMutation = useVote();
  const removeVoteMutation = useRemoveVote();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-default flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-background-default flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Proposal not found</h2>
          <Link href="/proposals">
            <Button>Back to Proposals</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleVote = async () => {
    try {
      await voteMutation.mutateAsync(proposalId);
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleRemoveVote = async () => {
    try {
      await removeVoteMutation.mutateAsync(proposalId);
    } catch (error) {
      console.error('Failed to remove vote:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background-default py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Link */}
        <Link href="/proposals" className="inline-flex items-center text-text-secondary hover:text-primary mb-6">
          ← Back to Proposals
        </Link>

        {/* Main Card */}
        <div className="glass-card p-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div className="flex-1">
              <StatusChip status={proposal.status} />
              <h1 className="text-3xl font-bold text-text-primary mt-3">{proposal.title}</h1>
            </div>
            <div className="flex flex-col items-end gap-2">
              <VoteCounter count={proposal.voteCount} />
              <span className="text-sm text-text-secondary">votes</span>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">{proposal.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {proposal.author.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{proposal.author.email}</p>
                <p className="text-xs text-text-secondary">{formatRelativeDate(proposal.createdAt)}</p>
              </div>
            </div>
            <div>
              {proposal.userHasVoted ? (
                <Button
                  variant="outline"
                  onClick={handleRemoveVote}
                  isLoading={removeVoteMutation.isPending}
                >
                  Remove Vote
                </Button>
              ) : (
                <Button
                  onClick={handleVote}
                  isLoading={voteMutation.isPending}
                >
                  Vote for this Proposal
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="font-semibold text-text-primary mb-2">Share this proposal</h3>
            <p className="text-sm text-text-secondary mb-4">Help this proposal gain more support by sharing it with others.</p>
            <Button variant="outline" className="w-full">Share</Button>
          </div>
          <div className="glass-card p-6">
            <h3 className="font-semibold text-text-primary mb-2">Similar proposals</h3>
            <p className="text-sm text-text-secondary mb-4">Browse other proposals in the same category.</p>
            <Link href="/proposals">
              <Button variant="outline" className="w-full">View Proposals</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}