'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComments, createComment } from '@/lib/comments';
import { useToast } from './useToast';

export function useComments(proposalId: string) {
  return useQuery({
    queryKey: ['comments', proposalId],
    queryFn: () => getComments(proposalId),
    enabled: !!proposalId,
  });
}

export function useCreateComment(proposalId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ body, parentId }: { body: string; parentId?: string }) =>
      createComment(proposalId, body, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', proposalId] });
      toast.success('Comment added');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add comment');
    },
  });
}
