import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProposal } from '../services/proposals';
import { castVote, removeVote } from '../services/voting';
import { useAuth } from '../context/AuthContext';
import type { Proposal } from '../types';

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProposal(id)
      .then(setProposal)
      .catch((err) => {
        setError('Failed to load proposal');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleVote() {
    if (!id || !user) {
      navigate('/login', { state: { from: { pathname: `/proposals/${id}` } } });
      return;
    }

    if (!proposal?.userHasVoted) {
      setVoting(true);
      try {
        const result = await castVote(id);
        setProposal((p) => p ? { ...p, voteCount: result.voteCount, userHasVoted: true } : null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to vote';
        setError(message);
      } finally {
        setVoting(false);
      }
    } else {
      setVoting(true);
      try {
        const result = await removeVote(id);
        setProposal((p) => p ? { ...p, voteCount: result.voteCount, userHasVoted: false } : null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to remove vote';
        setError(message);
      } finally {
        setVoting(false);
      }
    }
  }

  if (loading) {
    return <div className="loading">Loading proposal...</div>;
  }

  if (error && !proposal) {
    return (
      <div className="error-page">
        <div className="alert alert-error">{error}</div>
        <Link to="/proposals" className="btn btn-outline">Back to Proposals</Link>
      </div>
    );
  }

  if (!proposal) {
    return <div>Proposal not found</div>;
  }

  const isOwner = user?.id === proposal.authorId;
  const canVote = proposal.status === 'OPEN' && !isOwner;

  return (
    <div className="proposal-detail">
      <Link to="/proposals" className="back-link">&larr; Back to Proposals</Link>

      {error && <div className="alert alert-error">{error}</div>}

      <article className="proposal">
        <header>
          <h1>{proposal.title}</h1>
          <div className="proposal-meta">
            <span className={`status ${proposal.status.toLowerCase()}`}>{proposal.status}</span>
            <span className="author">by {proposal.author?.email}</span>
            <span className="date">
              {new Date(proposal.createdAt).toLocaleDateString()}
            </span>
          </div>
        </header>

        <div className="proposal-body">
          <p>{proposal.description}</p>
        </div>

        <footer className="proposal-footer">
          <div className="vote-section">
            <span className="vote-count">
              {proposal.voteCount} {proposal.voteCount === 1 ? 'vote' : 'votes'}
            </span>
            {canVote && (
              <button
                className={`btn ${proposal.userHasVoted ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleVote}
                disabled={voting}
              >
                {voting
                  ? 'Processing...'
                  : proposal.userHasVoted
                  ? 'Remove Vote'
                  : 'Vote'}
              </button>
            )}
            {!canVote && proposal.status !== 'OPEN' && (
              <span className="voting-closed">Voting is closed</span>
            )}
            {isOwner && (
              <span className="owner-notice">You cannot vote on your own proposal</span>
            )}
          </div>
        </footer>
      </article>
    </div>
  );
}
