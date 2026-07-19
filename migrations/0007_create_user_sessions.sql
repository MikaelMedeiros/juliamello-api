CREATE TABLE user_sessions (

    id TEXT PRIMARY KEY,

    user_id TEXT NOT NULL,

    refresh_token_hash TEXT NOT NULL,

    expires_at TEXT NOT NULL,

    created_at TEXT NOT NULL,

    revoked_at TEXT,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_user_sessions_user
ON user_sessions(user_id);

CREATE INDEX idx_user_sessions_expires
ON user_sessions(expires_at);