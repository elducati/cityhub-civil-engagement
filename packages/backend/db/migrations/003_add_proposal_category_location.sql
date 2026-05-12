-- Add category and location columns to proposals table
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7);
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7);

CREATE INDEX IF NOT EXISTS idx_proposals_category ON proposals(category);
