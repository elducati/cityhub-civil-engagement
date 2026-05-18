export type ProposalStatus = 'OPEN' | 'UNDER_REVIEW' | 'FEASIBILITY' | 'PLANNED' | 'IMPLEMENTED' | 'REJECTED';

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
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  tags: string[];
  budgetEstimated: number | null;
  budgetActual: number | null;
  budgetCurrency: string;
}

export interface CreateProposalInput {
  title: string;
  description: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  tags?: string[];
}

export interface UpdateProposalInput {
  title?: string;
  description?: string;
  status?: ProposalStatus;
  rejection_reason?: string;
  tags?: string[];
  budgetEstimated?: number | null;
  budgetActual?: number | null;
  budgetCurrency?: string;
}
