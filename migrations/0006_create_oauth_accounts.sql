CREATE TABLE oauth_accounts (

    id TEXT PRIMARY KEY,

    user_id TEXT NOT NULL,

    provider TEXT NOT NULL CHECK (
        provider IN (
            'GOOGLE'
        )
    ),

    provider_user_id TEXT NOT NULL,

    access_token TEXT,

    refresh_token TEXT,

    expires_at TEXT,

    created_at TEXT NOT NULL,

    updated_at TEXT NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_oauth_provider_user
ON oauth_accounts (
    provider,
    provider_user_id
);

CREATE INDEX idx_oauth_user
ON oauth_accounts(user_id);