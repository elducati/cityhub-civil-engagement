import { api } from './api';

export type ProposalStatus = 'OPEN' | 'CLOSED' | 'ARCHIVED';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  authorId: string;
  status: ProposalStatus;
  voteCount: number;
  createdAt: string;
  updatedAt?: string;
  userVote?: boolean;
}

export interface ProposalDetail extends Proposal {
  author: {
    id: string;
    email: string;
  };
  userHasVoted: boolean;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProposalListResponse {
  data: Proposal[];
  pagination: PaginationResult;
}

export interface CreateProposalInput {
  title: string;
  description: string;
}

export interface UpdateProposalInput {
  title?: string;
  description?: string;
  status?: ProposalStatus;
}

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