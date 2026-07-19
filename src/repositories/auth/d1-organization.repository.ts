import { Organization } from "../../models/auth/organization";
import { OrganizationRepository } from "./organization.repository";

export class D1OrganizationRepository implements OrganizationRepository {

  constructor(private readonly env: Env) {}

  async findById(id: string): Promise<Organization | null> {

    const row = await this.env.app_db
      .prepare(`
        SELECT *
        FROM organizations
        WHERE id = ?
      `)
      .bind(id)
      .first<any>();

    return row ? this.map(row) : null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {

    const row = await this.env.app_db
      .prepare(`
        SELECT *
        FROM organizations
        WHERE slug = ?
      `)
      .bind(slug)
      .first<any>();

    return row ? this.map(row) : null;
  }

  async save(organization: Organization): Promise<void> {

    await this.env.app_db
      .prepare(`
        INSERT INTO organizations (
          id,
          name,
          slug,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(
        organization.id,
        organization.name,
        organization.slug,
        organization.createdAt,
        organization.updatedAt
      )
      .run();

  }

  async findByUserId(userId: string): Promise<Organization | null> {

    const row = await this.env.app_db
      .prepare(`
        SELECT o.*
        FROM organizations o
        INNER JOIN organization_users ou
          ON ou.organization_id = o.id
        WHERE ou.user_id = ?
        LIMIT 1
      `)
      .bind(userId)
      .first<any>();

    return row ? this.map(row) : null;

  }

  private map(row: any): Organization {

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

  }

}