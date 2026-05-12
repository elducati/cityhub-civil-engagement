export interface ProposalListResponse {
  data: import('./proposal').Proposal[];
  pagination: PaginationResult;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
