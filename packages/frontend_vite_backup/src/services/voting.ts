import api from './api';
import type { VoteResponse } from '../types';

export async function castVote(proposalId: string): Promise<VoteResponse> {
  const response = await api.post<VoteResponse>(`/proposals/${proposalId}/vote`);
  return response.data;
}

export async function removeVote(proposalId: string): Promise<VoteResponse> {
  const response = await api.delete<VoteResponse>(`/proposals/${proposalId}/vote`);
  return response.data;
}