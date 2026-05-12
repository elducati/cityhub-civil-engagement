'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getProposals, 
  getTrendingProposals, 
  getProposalById, 
  createProposal, 
  updateProposal, 
  deleteProposal,
  voteForProposal,
  removeVote,
  type ProposalQueryParams,
  type Proposal,
  type ProposalDetail,
  type CreateProposalInput,
  type UpdateProposalInput
} from '@/lib/proposals';
import { useToast } from './useToast';

export function useProposals(params: ProposalQueryParams = {}) {
  return useQuery({
    queryKey: ['proposals', params],
    queryFn: () => getProposals(params),
    staleTime: 30000,
  });
}

export function useTrendingProposals(limit: number = 10) {
  return useQuery({
    queryKey: ['proposals', 'trending', limit],
    queryFn: () => getTrendingProposals(limit),
    staleTime: 60000,
  });
}

export function useProposal(proposalId: string) {
  return useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: () => getProposalById(proposalId),
    enabled: !!proposalId,
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  return useMutation({
    mutationFn: (input: CreateProposalInput) => createProposal(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal created successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create proposal');
    },
  });
}

export function useUpdateProposal() {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  return useMutation({
    mutationFn: ({ proposalId, input }: { proposalId: string; input: UpdateProposalInput }) =>
      updateProposal(proposalId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal', variables.proposalId] });
      toast.success('Proposal updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update proposal');
    },
  });
}

export function useDeleteProposal() {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  return useMutation({
    mutationFn: (proposalId: string) => deleteProposal(proposalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal deleted');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete proposal');
    },
  });
}

export function useVote() {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  return useMutation({
    mutationFn: (proposalId: string) => voteForProposal(proposalId),
    onSuccess: (_, proposalId) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] });
      toast.success('Vote cast');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to vote');
    },
  });
}

export function useRemoveVote() {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  return useMutation({
    mutationFn: (proposalId: string) => removeVote(proposalId),
    onSuccess: (_, proposalId) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] });
      toast.success('Vote removed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove vote');
    },
  });
}