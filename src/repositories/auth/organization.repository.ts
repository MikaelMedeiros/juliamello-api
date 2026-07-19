import { Organization } from "../../models/auth/organization";

export interface OrganizationRepository {

  findById(id: string): Promise<Organization | null>;

  findBySlug(slug: string): Promise<Organization | null>;

  save(organization: Organization): Promise<void>;

  findByUserId(userId: string): Promise<Organization | null>;

}