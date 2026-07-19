import { OrganizationUser } from "../../models/auth/organization-user";

export interface OrganizationUserRepository {

  findByUserId(userId: string): Promise<OrganizationUser[]>;

  findByOrganizationId(
    organizationId: string
  ): Promise<OrganizationUser[]>;

  save(organizationUser: OrganizationUser): Promise<void>;

}