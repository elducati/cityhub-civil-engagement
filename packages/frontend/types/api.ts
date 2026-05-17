import type { PaginationResult } from '@cityhub/types';
import type { Proposal } from './proposal';

export interface ProposalListResponse {
  data: Proposal[];
  pagination: PaginationResult;
}
