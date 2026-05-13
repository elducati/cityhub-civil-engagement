import { api } from './api';

export interface Comment {
  id: string;
  proposalId: string;
  parentId: string | null;
  authorId: string;
  authorEmail: string;
  body: string;
  createdAt: string;
  replies?: Comment[];
}

export async function getComments(proposalId: string): Promise<Comment[]> {
  return api.get<Comment[]>(`/api/proposals/${proposalId}/comments`);
}

export async function createComment(proposalId: string, body: string, parentId?: string): Promise<Comment> {
  return api.post<Comment>(`/api/proposals/${proposalId}/comments`, { body, parentId });
}
