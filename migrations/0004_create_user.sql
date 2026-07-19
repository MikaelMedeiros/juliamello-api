CREATE TABLE users (
    id TEXT PRIMARY KEY,

    email TEXT NOT NULL UNIQUE,

    name TEXT NOT NULL,

    picture TEXT,

    created_at TEXT NOT NULL,

    updated_at TEXT NOT NULL,

    last_login_at TEXT
);

CREATE UNIQUE INDEX idx_users_email
ON users(email);