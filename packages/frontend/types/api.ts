export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProposalListResponse {
  data: import('./proposal').Proposal[];
  pagination: PaginationResult;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode?: number;
}

export interface VoteResponse {
  proposalId: string;
  voteCount: number;
  userVoted: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}