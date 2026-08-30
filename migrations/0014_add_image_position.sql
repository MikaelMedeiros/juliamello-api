-- ============================================================
-- Images: add position/slot
-- ============================================================

ALTER TABLE images
ADD COLUMN position INTEGER NOT NULL DEFAULT 1;


WITH numbered_images AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY organization_id, user_id, section
            ORDER BY created_at ASC, id ASC
        ) AS new_position
    FROM images
)
UPDATE images
SET position = (
    SELECT new_position
    FROM numbered_images
    WHERE numbered_images.id = images.id
);

CREATE UNIQUE INDEX idx_images_organization_user_section_position
ON images(
    organization_id,
    user_id,
    section,
    position
);