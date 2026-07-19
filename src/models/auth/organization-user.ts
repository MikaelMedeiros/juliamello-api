export type OrganizationRole =
  | "OWNER"
  | "ADMIN"
  | "STAFF";

export interface OrganizationUser {
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  createdAt: string;
}