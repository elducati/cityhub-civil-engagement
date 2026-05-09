import api from './api';
import type { Proposal, ProposalsResponse } from '../types';

interface ListProposalsParams {
  page?: number;
  limit?: number;
  status?: 'OPEN' | 'CLOSED' | 'ARCHIVED';
  sort?: 'createdAt' | 'voteCount';
}

interface CreateProposalData {
  title: string;
  description: string;
}

interface UpdateProposalData {
  title?: string;
  description?: string;
  status?: 'OPEN' | 'CLOSED' | 'ARCHIVED';
}

export async function listProposals(params: ListProposalsParams = {}): Promise<ProposalsResponse> {
  const response = await api.get<ProposalsResponse>('/proposals', { params });
  return response.data;
}

export async function getProposal(id: string): Promise<Proposal> {
  const response = await api.get<Proposal>(`/proposals/${id}`);
  return response.data;
}

export async function createProposal(data: CreateProposalData): Promise<Proposal> {
  const response = await api.post<Proposal>('/proposals', data);
  return response.data;
}

export async function updateProposal(id: string, data: UpdateProposalData): Promise<Proposal> {
  const response = await api.put<Proposal>(`/proposals/${id}`, data);
  return response.data;
}

export async function deleteProposal(id: string): Promise<void> {
  await api.delete(`/proposals/${id}`);
}

export async function getUserProposals(): Promise<ProposalsResponse> {
  const response = await api.get<ProposalsResponse>('/proposals/me');
  return response.data;
}

export async function getUserVotes(): Promise<ProposalsResponse> {
  const response = await api.get<ProposalsResponse>('/proposals/voted');
  return response.data;
}