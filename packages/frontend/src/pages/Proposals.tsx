import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listProposals } from '../services/proposals';
import type { Proposal } from '../types';

type StatusFilter = 'OPEN' | 'CLOSED' | 'ARCHIVED' | '';
type SortOption = 'createdAt' | 'voteCount';

export default function Proposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<StatusFilter>('');
  const [sort, setSort] = useState<SortOption>('createdAt');

  useEffect(() => {
    setLoading(true);
    listProposals({ page, limit: 10, status: status || undefined, sort })
      .then((res) => {
        setProposals(res.data);
        setTotalPages(res.pagination.totalPages);
      })
      .catch((err) => {
        setError('Failed to load proposals');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [page, status, sort]);

  return (
    <div className="proposals-page">
      <div className="proposals-header">
        <h1>Proposals</h1>
        <Link to="/proposals/create" className="btn btn-primary">Create Proposal</Link>
      </div>

      <div className="proposals-filters">
        <div className="filter-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusFilter);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="sort">Sort by:</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortOption);
              setPage(1);
            }}
          >
            <option value="createdAt">Newest</option>
            <option value="voteCount">Most Votes</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="loading">Loading proposals...</p>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : proposals.length === 0 ? (
        <div className="empty-state">
          <p>No proposals found.</p>
          <Link to="/proposals/create" className="btn btn-outline">Create the first proposal</Link>
        </div>
      ) : (
        <>
          <div className="proposals-list">
            {proposals.map((proposal) => (
              <Link key={proposal.id} to={`/proposals/${proposal.id}`} className="proposal-item">
                <div className="proposal-content">
                  <h3>{proposal.title}</h3>
                  <p>{proposal.description.slice(0, 150)}...</p>
                </div>
                <div className="proposal-info">
                  <span className={`status ${proposal.status.toLowerCase()}`}>{proposal.status}</span>
                  <span className="vote-count">{proposal.voteCount} votes</span>
                  <span className="date">
                    {new Date(proposal.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="page-info">Page {page} of {totalPages}</span>
              <button
                className="btn btn-outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}