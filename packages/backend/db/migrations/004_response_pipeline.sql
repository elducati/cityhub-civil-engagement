-- Response Pipeline: expand proposal status to full government workflow
-- OPEN → UNDER_REVIEW → FEASIBILITY → PLANNED → IMPLEMENTED | REJECTED

-- Map old statuses to new ones before applying constraint
UPDATE proposals SET status = 'IMPLEMENTED' WHERE status = 'CLOSED';
UPDATE proposals SET status = 'REJECTED' WHERE status = 'ARCHIVED';

ALTER TABLE proposals DROP CONSTRAINT IF EXISTS proposals_status_check;

ALTER TABLE proposals ADD CONSTRAINT proposals_status_check
  CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'FEASIBILITY', 'PLANNED', 'IMPLEMENTED', 'REJECTED'));

ALTER TABLE proposals ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_proposals_status_new ON proposals(status);
