import { api } from './api';
import type { Proposal, ProposalDetail, CreateProposalInput, UpdateProposalInput } from '@/types/proposal';
import type { ProposalListResponse } from '@/types/api';

export type ProposalStatus = 'OPEN' | 'CLOSED' | 'ARCHIVED';

export interface ProposalQueryParams {
  page?: number;
  limit?: number;
  status?: ProposalStatus;
  sort?: 'createdAt' | 'voteCount';
  search?: string;
}

export async function getProposals(params: ProposalQueryParams = {}): Promise<ProposalListResponse> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.set('page', String(params.page));
  if (params.limit) queryParams.set('limit', String(params.limit));
  if (params.status) queryParams.set('status', params.status);
  if (params.sort) queryParams.set('sort', params.sort);
  if (params.search) queryParams.set('search', params.search);

  return api.get<ProposalListResponse>(`/api/proposals?${queryParams.toString()}`);
}

export async function getTrendingProposals(limit: number = 10): Promise<Proposal[]> {
  const response = await getProposals({ limit, sort: 'voteCount', status: 'OPEN' });
  return response.data;
}

export async function getProposalById(proposalId: string): Promise<ProposalDetail> {
  return api.get<ProposalDetail>(`/api/proposals/${proposalId}`);
}

export async function createProposal(input: CreateProposalInput): Promise<Proposal> {
  return api.post<Proposal>('/api/proposals', input);
}

export async function updateProposal(proposalId: string, input: UpdateProposalInput): Promise<Proposal> {
  return api.put<Proposal>(`/api/proposals/${proposalId}`, input);
}

export async function deleteProposal(proposalId: string): Promise<void> {
  return api.delete(`/api/proposals/${proposalId}`);
}

export async function voteForProposal(proposalId: string): Promise<{ proposalId: string; voteCount: number; userVoted: boolean }> {
  return api.post(`/api/proposals/${proposalId}/vote`);
}

export async function removeVote(proposalId: string): Promise<{ proposalId: string; voteCount: number; userVoted: boolean }> {
  return api.delete(`/api/proposals/${proposalId}/vote`);
}
