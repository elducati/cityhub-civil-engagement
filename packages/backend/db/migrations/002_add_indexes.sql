-- Performance indexes for CityHub

-- Proposals table indexes
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_vote_count ON proposals(vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_author_id ON proposals(author_id);

-- Votes table indexes (fix N+1 query)
CREATE INDEX IF NOT EXISTS idx_votes_user_proposal ON votes(user_id, proposal_id);
CREATE INDEX IF NOT EXISTS idx_votes_proposal_user ON votes(proposal_id, user_id);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Composite index for proposal listing with filters\nCREATE INDEX IF NOT EXISTS idx_proposals_status_created ON proposals(status, created_at DESC);\nCREATE INDEX IF NOT EXISTS idx_proposals_status_votes ON proposals(status, vote_count DESC);\n\n-- Full Text Search Index\nCREATE INDEX IF NOT EXISTS idx_proposals_fts ON proposals USING GIN (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')));