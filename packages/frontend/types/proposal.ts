export interface Proposal {
  id: string;
  title: string;
  description: string;
  authorId: string;
  status: 'OPEN' | 'CLOSED' | 'ARCHIVED';
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

export interface CreateProposalInput {
  title: string;
  description: string;
}

export interface UpdateProposalInput {
  title?: string;
  description?: string;
  status?: 'OPEN' | 'CLOSED' | 'ARCHIVED';
}
