import type { Proposal as SharedProposal, ProposalStatus, CreateProposalInput, UpdateProposalInput } from '@cityhub/types';

export type { ProposalStatus, CreateProposalInput, UpdateProposalInput };
export type Proposal = SharedProposal;

export interface ProposalDetail extends Proposal {
  author: {
    id: string;
    email: string;
  };
  userHasVoted: boolean;
}
