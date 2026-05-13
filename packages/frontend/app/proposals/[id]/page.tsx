'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useProposal, useVote, useRemoveVote } from '@/hooks/useProposals';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatRelativeDate } from '@/lib/utils';
import { ArrowLeft, Search, Share2, FileText, MapPin, MessageSquare } from 'lucide-react';
import { useComments, useCreateComment } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';

const categoryLabels: Record<string, string> = {
  infrastructure: 'Infrastructure',
  environment: 'Environment',
  safety: 'Public Safety',
  transportation: 'Transportation',
  community: 'Community',
  other: 'Other',
};

const categoryColors: Record<string, string> = {
  infrastructure: 'bg-blue-100 text-blue-700',
  environment: 'bg-green-100 text-green-700',
  safety: 'bg-red-100 text-red-700',
  transportation: 'bg-amber-100 text-amber-700',
  community: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-700',
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: 'bg-success text-white',
    UNDER_REVIEW: 'bg-secondary text-white',
    FEASIBILITY: 'bg-primary text-white',
    PLANNED: 'bg-warning text-white',
    IMPLEMENTED: 'bg-success text-white',
    REJECTED: 'bg-error text-white',
  };
  const labels: Record<string, string> = {
    OPEN: 'Open',
    UNDER_REVIEW: 'Under Review',
    FEASIBILITY: 'Feasibility',
    PLANNED: 'Planned',
    IMPLEMENTED: 'Implemented',
    REJECTED: 'Rejected',
  };
  return (
    <Badge className={`${styles[status as keyof typeof styles] || 'bg-outline text-on-surface-variant'} rounded-full`}>
      {labels[status as keyof typeof labels] || status}
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

  usePageTitle(proposal ? proposal.title : 'Proposal');
  const { data: comments, isLoading: commentsLoading } = useComments(proposalId);
  const createCommentMut = useCreateComment(proposalId);
  const { user } = useAuth();
  const [commentBody, setCommentBody] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

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

  const handleAddComment = async () => {
    if (!commentBody.trim()) return;
    try {
      await createCommentMut.mutateAsync({ body: commentBody, parentId: replyTo || undefined });
      setCommentBody('');
      setReplyTo(null);
    } catch (err) {
      console.error('Failed to add comment:', err);
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
                {proposal.category && (
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[proposal.category] || 'bg-gray-100 text-gray-700'}`}>
                    {categoryLabels[proposal.category] || proposal.category}
                  </span>
                )}
                <h1 className="text-3xl font-bold text-on-surface mt-3">{proposal.title}</h1>
              </div>
              <VoteCount count={proposal.voteCount} />
            </div>

            <div className="mb-8">
              <p className="text-on-surface-variant whitespace-pre-wrap leading-relaxed">{proposal.description}</p>
            </div>

            {proposal.latitude != null && proposal.longitude != null && (
              <div className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{Number(proposal.latitude).toFixed(4)}, {Number(proposal.longitude).toFixed(4)}</span>
              </div>
            )}

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

        {/* Comments Section */}
        <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-1 mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Discussion ({comments?.length || 0})
            </h3>

            {user && (
              <div className="mb-6 space-y-2">
                {replyTo && (
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-2">
                    Replying to a comment
                    <button onClick={() => setReplyTo(null)} className="text-primary hover:underline text-xs">Cancel</button>
                  </div>
                )}
                <textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={3}
                  className="flex w-full rounded-xl border border-outline bg-surface-base p-4 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={!commentBody.trim() || createCommentMut.isPending}
                    className="rounded-full"
                    size="sm"
                  >
                    {createCommentMut.isPending ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </div>
            )}

            {commentsLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-16 bg-surface-container-high rounded-xl" />)}
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="p-4 bg-surface-base rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-on-surface">{comment.authorEmail}</span>
                        <span className="text-xs text-on-surface-variant">{formatRelativeDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant">{comment.body}</p>
                      {user && (
                        <button
                          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                          className="text-xs text-primary hover:underline mt-2"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                    {comment.replies && comment.replies.map((reply) => (
                      <div key={reply.id} className="ml-8 p-4 bg-surface-base rounded-xl border-l-2 border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-on-surface">{reply.authorEmail}</span>
                          <span className="text-xs text-on-surface-variant">{formatRelativeDate(reply.createdAt)}</span>
                        </div>
                        <p className="text-sm text-on-surface-variant">{reply.body}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant text-center py-6">No comments yet. Start the discussion!</p>
            )}
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