CREATE TABLE gifts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    claimed INTEGER NOT NULL DEFAULT 0,
    used INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    expires_at TEXT,
    claimed_at TEXT,
    used_at TEXT
);

CREATE INDEX idx_gifts_phone ON gifts(phone);
CREATE INDEX idx_gifts_claimed ON gifts(claimed);
CREATE INDEX idx_gifts_used ON gifts(used);
CREATE INDEX idx_gifts_created_at ON gifts(created_at);