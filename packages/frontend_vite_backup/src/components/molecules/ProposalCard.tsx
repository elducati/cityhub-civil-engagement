import Card from '../atoms/Card';
import Badge from '../atoms/Badge';
import type { Proposal } from '../../types';

interface ProposalCardProps {
  proposal: Proposal;
  onClick?: () => void;
}

export function ProposalCard({ proposal, onClick }: ProposalCardProps) {
  const statusVariant = {
    OPEN: 'open',
    CLOSED: 'closed',
    ARCHIVED: 'archived',
  } as const;

  return (
    <Card onClick={onClick}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{proposal.title}</h3>
        <Badge variant={statusVariant[proposal.status]}>{proposal.status}</Badge>
      </div>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{proposal.description}</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{proposal.voteCount} votes</span>
        <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
      </div>
      {proposal.userVote && (
        <div className="mt-2 text-sm text-green-600 font-medium">You voted</div>
      )}
    </Card>
  );
}

export default ProposalCard;