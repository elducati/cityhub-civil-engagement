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
  
  return useMutation({
    mutationFn: (input: CreateProposalInput) => createProposal(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}

export function useUpdateProposal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ proposalId, input }: { proposalId: string; input: UpdateProposalInput }) =>
      updateProposal(proposalId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal', variables.proposalId] });
    },
  });
}

export function useDeleteProposal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (proposalId: string) => deleteProposal(proposalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}

export function useVote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (proposalId: string) => voteForProposal(proposalId),
    onSuccess: (_, proposalId) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] });
    },
  });
}

export function useRemoveVote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (proposalId: string) => removeVote(proposalId),
    onSuccess: (_, proposalId) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] });
    },
  });
}