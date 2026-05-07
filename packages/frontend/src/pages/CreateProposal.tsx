import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createProposal } from '../services/proposals';
import { useAuth } from '../context/AuthContext';

export default function CreateProposal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="auth-required">
        <p>You must be logged in to create a proposal.</p>
        <Link to="/login" className="btn btn-primary">Login</Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (title.length < 5) {
      setError('Title must be at least 5 characters');
      return;
    }

    if (description.length < 20) {
      setError('Description must be at least 20 characters');
      return;
    }

    setLoading(true);

    try {
      const proposal = await createProposal({ title: title.trim(), description: description.trim() });
      navigate(`/proposals/${proposal.id}`);
    } catch (err) {
      setError('Failed to create proposal. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-proposal-page">
      <div className="create-proposal-card">
        <h1>Create New Proposal</h1>
        <p className="subtitle">Share your idea with the community</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, concise title"
              required
              minLength={5}
              maxLength={200}
            />
            <span className="help-text">5-200 characters</span>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your proposal in detail. Explain what you're proposing and why it would benefit the community."
              required
              minLength={20}
              rows={8}
            />
            <span className="help-text">Minimum 20 characters</span>
          </div>

          <div className="form-actions">
            <Link to="/proposals" className="btn btn-outline">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}