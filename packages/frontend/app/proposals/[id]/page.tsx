'use client';

import { useParams } from 'next/navigation';
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
    return <div className="p-8">Loading...</div>;
  }

  if (!proposal) {
    return <div className="p-8">Proposal not found</div>;
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg border p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <StatusChip status={proposal.status} />
            <h1 className="text-3xl font-bold mt-2">{proposal.title}</h1>
          </div>
          <div className="text-right">
            <VoteCounter count={proposal.voteCount} />
          </div>
        </div>

        <p className="text-gray-600 mb-6 whitespace-pre-wrap">{proposal.description}</p>

        <div className="border-t pt-4 mt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              By {proposal.author.email} • {formatRelativeDate(proposal.createdAt)}
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
                  variant="primary"
                  onClick={handleVote}
                  isLoading={voteMutation.isPending}
                >
                  Vote
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}