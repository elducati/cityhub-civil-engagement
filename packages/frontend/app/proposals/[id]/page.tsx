'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProposal, useVote, useRemoveVote } from '@/hooks/useProposals';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatRelativeDate } from '@/lib/utils';
import { ArrowLeft, Search, Share2, FileText, ArrowRight } from 'lucide-react';

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
    <div className="flex items-center gap-2">
      <div className="text-3xl font-bold text-primary">{count}</div>
      <span className="text-on-surface-variant">votes</span>
    </div>
  );
}

export default function ProposalDetailPage() {
  const params = useParams();
  const proposalId = params.id as string;
  const { data: proposal, isLoading } = useProposal(proposalId);
  const voteMutation = useVote();
  const removeVoteMutation = useRemoveVote();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="text-center">
          <Search className="w-16 h-16 mx-auto text-on-surface-variant mb-4" />
          <h2 className="text-2xl font-bold text-on-surface mb-2">Proposal not found</h2>
          <Link href="/proposals">
            <Button className="rounded-full">Back to Proposals</Button>
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
    <div className="min-h-screen bg-surface-base py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/proposals" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Proposals
        </Link>

        <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-2 mb-6">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <div className="flex-1">
                <StatusBadge status={proposal.status} />
                <h1 className="text-3xl font-bold text-on-surface mt-3">{proposal.title}</h1>
              </div>
              <VoteCount count={proposal.voteCount} />
            </div>

            <div className="mb-8">
              <p className="text-on-surface-variant whitespace-pre-wrap leading-relaxed">{proposal.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-outline">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 bg-primary-container">
                  <AvatarFallback className="text-primary font-semibold">
                    {proposal.author.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-on-surface">{proposal.author.email}</p>
                  <p className="text-xs text-on-surface-variant">{formatRelativeDate(proposal.createdAt)}</p>
                </div>
              </div>
              <div>
                {proposal.userHasVoted ? (
                  <Button
                    variant="outline"
                    onClick={handleRemoveVote}
                    disabled={removeVoteMutation.isPending}
                    className="rounded-full"
                  >
                    {removeVoteMutation.isPending ? 'Removing...' : 'Remove Vote'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleVote}
                    disabled={voteMutation.isPending}
                    className="rounded-full"
                  >
                    {voteMutation.isPending ? 'Voting...' : 'Vote for this Proposal'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-1">
            <CardContent className="p-6">
              <h3 className="font-semibold text-on-surface mb-2 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                Share this proposal
              </h3>
              <p className="text-sm text-on-surface-variant mb-4">Help this proposal gain more support by sharing it with others.</p>
              <Button variant="outline" className="w-full rounded-full">Share</Button>
            </CardContent>
          </Card>
          <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-1">
            <CardContent className="p-6">
              <h3 className="font-semibold text-on-surface mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Similar proposals
              </h3>
              <p className="text-sm text-on-surface-variant mb-4">Browse other proposals in the same category.</p>
              <Link href="/proposals">
                <Button variant="outline" className="w-full rounded-full">View Proposals</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}