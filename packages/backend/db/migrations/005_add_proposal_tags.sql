ALTER TABLE proposals ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_proposals_tags ON proposals USING GIN(tags);
