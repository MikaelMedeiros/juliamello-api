export interface Gift {
  id: string;
  createdAt: string;
  claimed: boolean;
  claimedAt: string | null;
  used: boolean;
  usedAt: string | null;
  expiresAt: string | null;
  name: string | null;
  phone: string | null;
}