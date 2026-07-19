ALTER TABLE gifts
ADD COLUMN organization_id TEXT
REFERENCES organizations(id);

ALTER TABLE gifts
ADD COLUMN created_by_user_id TEXT
REFERENCES users(id);

CREATE INDEX idx_gifts_organization
ON gifts(organization_id);

CREATE INDEX idx_gifts_created_by
ON gifts(created_by_user_id);