export interface OAuthAccount {
  id: string;

  userId: string;

  provider: "GOOGLE";

  providerUserId: string;

  accessToken?: string;

  refreshToken?: string;

  expiresAt?: string;

  createdAt: string;

  updatedAt: string;
}