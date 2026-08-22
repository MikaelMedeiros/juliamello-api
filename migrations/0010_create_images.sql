CREATE TABLE images (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    key TEXT NOT NULL,
    url TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    filename TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX idx_images_organization_id
ON images(organization_id);

CREATE INDEX idx_images_user_id
ON images(user_id);

CREATE INDEX idx_images_organization_user
ON images(organization_id, user_id);