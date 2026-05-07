export interface User {
  id: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  createdAt?: string;
}

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
  author?: {
    id: string;
    email: string;
  };
  userHasVoted?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProposalsResponse {
  data: Proposal[];
  pagination: Pagination;
}

export interface VoteResponse {
  proposalId: string;
  voteCount: number;
  userVoted: boolean;
}

export interface AuthResponse {
  id: string;
  email: string;
  role: string;
  token: string;
}

export interface ProposalAnalytics {
  total: number;
  byStatus: {
    OPEN: number;
    CLOSED: number;
    ARCHIVED: number;
  };
  thisMonth: number;
  lastMonth: number;
}

export interface VotingAnalytics {
  totalVotes: number;
  uniqueVoters: number;
  turnoutRate: number;
  votesByProposal: Array<{ proposalId: string; votes: number }>;
}