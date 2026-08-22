ALTER TABLE images
ADD COLUMN type TEXT NOT NULL DEFAULT 'portfolio';

CREATE INDEX idx_images_organization_type
ON images(organization_id, type);