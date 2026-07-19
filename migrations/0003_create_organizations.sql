CREATE TABLE organizations (
    id TEXT PRIMARY KEY,

    name TEXT NOT NULL,

    slug TEXT NOT NULL UNIQUE,

    created_at TEXT NOT NULL,

    updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX idx_organizations_slug
ON organizations(slug);