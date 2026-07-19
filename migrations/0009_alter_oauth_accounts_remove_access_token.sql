PRAGMA foreign_keys=OFF;

CREATE TABLE oauth_accounts_new (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL CHECK(provider IN ('GOOGLE')),
    provider_user_id TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

INSERT INTO oauth_accounts_new (
    id,
    user_id,
    provider,
    provider_user_id,
    refresh_token,
    expires_at,
    created_at,
    updated_at
)
SELECT
    id,
    user_id,
    provider,
    provider_user_id,
    refresh_token,
    expires_at,
    created_at,
    updated_at
FROM oauth_accounts;

DROP TABLE oauth_accounts;

ALTER TABLE oauth_accounts_new
RENAME TO oauth_accounts;

PRAGMA foreign_keys=ON;