ALTER TABLE gifts RENAME TO gifts_old;

CREATE TABLE gifts (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    claimed INTEGER NOT NULL DEFAULT 0,
    used INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    expires_at TEXT,
    claimed_at TEXT,
    used_at TEXT
);

INSERT INTO gifts (
    id,
    name,
    phone,
    claimed,
    used,
    created_at,
    expires_at,
    claimed_at,
    used_at
)
SELECT
    id,
    name,
    phone,
    claimed,
    used,
    created_at,
    expires_at,
    claimed_at,
    used_at
FROM gifts_old;

DROP TABLE gifts_old;

CREATE INDEX idx_gifts_phone ON gifts(phone);
CREATE INDEX idx_gifts_claimed ON gifts(claimed);
CREATE INDEX idx_gifts_used ON gifts(used);
CREATE INDEX idx_gifts_created_at ON gifts(created_at);