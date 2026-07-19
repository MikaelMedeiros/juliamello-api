import { OrganizationUser } from "../../models/auth/organization-user";
import { OrganizationUserRepository } from "./organization-user.repository";

export class D1OrganizationUserRepository
  implements OrganizationUserRepository {

  constructor(private readonly env: Env) {}

  async findByUserId(
    userId: string
  ): Promise<OrganizationUser[]> {

    const { results } = await this.env.app_db
      .prepare(`
        SELECT *
        FROM organization_users
        WHERE user_id = ?
      `)
      .bind(userId)
      .all<any>();

    return results.map(this.map);
  }

  async findByOrganizationId(
    organizationId: string
  ): Promise<OrganizationUser[]> {

    const { results } = await this.env.app_db
      .prepare(`
        SELECT *
        FROM organization_users
        WHERE organization_id = ?
      `)
      .bind(organizationId)
      .all<any>();

    return results.map(this.map);
  }

  async save(
    organizationUser: OrganizationUser
  ): Promise<void> {

    await this.env.app_db
      .prepare(`
        INSERT INTO organization_users (
          organization_id,
          user_id,
          role,
          created_at
        )
        VALUES (?, ?, ?, ?)
      `)
      .bind(
        organizationUser.organizationId,
        organizationUser.userId,
        organizationUser.role,
        organizationUser.createdAt
      )
      .run();

  }

  private map(row: any): OrganizationUser {

    return {
      organizationId: row.organization_id,
      userId: row.user_id,
      role: row.role,
      createdAt: row.created_at,
    };

  }

}