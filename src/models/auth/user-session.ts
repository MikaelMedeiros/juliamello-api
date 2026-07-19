export interface UserSession {
  id: string;

  userId: string;

  refreshTokenHash: string;

  expiresAt: string;

  createdAt: string;

  revokedAt?: string;
}