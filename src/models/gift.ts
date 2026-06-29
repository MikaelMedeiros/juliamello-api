export interface Gift {
  id: string;
  createdAt: string;
  claimed: boolean;
  claimedAt?: string;
  used: boolean;
  usedAt: string | null;
  expiresAt?: string;
  name: string | null;
  phone: string | null;
}