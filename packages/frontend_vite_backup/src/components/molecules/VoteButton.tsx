import { useState } from 'react';
import Button from '../atoms/Button';
import { useAuth } from '../../context/AuthContext';

interface VoteButtonProps {
  proposalId: string;
  initialVoteCount: number;
  hasVoted: boolean;
  onVoteChange: (newCount: number, userVoted: boolean) => void;
}

export function VoteButton({ proposalId, initialVoteCount, hasVoted, onVoteChange }: VoteButtonProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [voted, setVoted] = useState(hasVoted);

  const handleVote = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = voted ? 'DELETE' : 'POST';
      const response = await fetch(`/api/proposals/${proposalId}/vote`, {
        method: endpoint,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVoteCount(data.voteCount);
        setVoted(data.userVoted);
        onVoteChange(data.voteCount, data.userVoted);
      }
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={voted ? 'secondary' : 'primary'}
        onClick={handleVote}
        isLoading={isLoading}
      >
        {voted ? 'Remove Vote' : 'Vote'}
      </Button>
      <span className="text-lg font-semibold">{voteCount} votes</span>
    </div>
  );
}

export default VoteButton;