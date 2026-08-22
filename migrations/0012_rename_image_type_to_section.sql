ALTER TABLE images RENAME COLUMN type TO section;

DROP INDEX IF EXISTS idx_images_organization_type;

CREATE INDEX idx_images_organization_section
ON images(organization_id, section);