CREATE TABLE organization_users (

    organization_id TEXT NOT NULL,

    user_id TEXT NOT NULL,

    role TEXT NOT NULL CHECK (
        role IN (
            'OWNER',
            'ADMIN',
            'STAFF'
        )
    ),

    created_at TEXT NOT NULL,

    PRIMARY KEY (
        organization_id,
        user_id
    ),

    FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_organization_users_user
ON organization_users(user_id);