import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listProposals } from '../services/proposals';
import type { Proposal } from '../types';

export default function Home() {
  const [featuredProposals, setFeaturedProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProposals({ limit: 6, sort: 'voteCount' })
      .then((res) => {
        setFeaturedProposals(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to CityHub</h1>
          <p>Your voice matters. Participate in civil engagement and help shape your community.</p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">Get Started</Link>
            <Link to="/proposals" className="btn btn-secondary">Browse Proposals</Link>
          </div>
        </div>
      </section>

      <section className="featured">
        <h2>Featured Proposals</h2>
        {loading ? (
          <p>Loading...</p>
        ) : featuredProposals.length === 0 ? (
          <p>No proposals yet. Be the first to create one!</p>
        ) : (
          <div className="proposals-grid">
            {featuredProposals.map((proposal) => (
              <Link key={proposal.id} to={`/proposals/${proposal.id}`} className="proposal-card">
                <h3>{proposal.title}</h3>
                <p>{proposal.description.slice(0, 100)}...</p>
                <div className="proposal-meta">
                  <span className={`status ${proposal.status.toLowerCase()}`}>{proposal.status}</span>
                  <span className="votes">{proposal.voteCount} votes</span>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="featured-footer">
          <Link to="/proposals" className="btn btn-outline">View All Proposals</Link>
        </div>
      </section>

      <section className="features">
        <h2>How It Works</h2>
        <div className="features-grid">
          <div className="feature">
            <h3>Submit Ideas</h3>
            <p>Share your ideas for improving your community.</p>
          </div>
          <div className="feature">
            <h3>Vote on Proposals</h3>
            <p>Support proposals you believe in.</p>
          </div>
          <div className="feature">
            <h3>Make a Difference</h3>
            <p>Help shape the future of your city.</p>
          </div>
        </div>
      </section>
    </div>
  );
}