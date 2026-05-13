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
}

export interface ProposalDetail extends Proposal {
  author: {
    id: string;
    email: string;
  };
  userHasVoted: boolean;
}

export interface CreateProposalInput {
  title: string;
  description: string;
  category?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateProposalInput {
  title?: string;
  description?: string;
  status?: ProposalStatus;
  rejection_reason?: string;
}
