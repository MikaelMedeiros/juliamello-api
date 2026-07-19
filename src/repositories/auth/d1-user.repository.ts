
import { User } from "../../models/auth/user";
import { UserRepository } from "./user.repository";

export class D1UserRepository implements UserRepository {

  constructor(private readonly env: Env) {}

  async findById(id: string): Promise<User | null> {

    const row = await this.env.app_db
      .prepare(`
        SELECT *
        FROM users
        WHERE id = ?
      `)
      .bind(id)
      .first<any>();

    return row ? this.map(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {

    const row = await this.env.app_db
      .prepare(`
        SELECT *
        FROM users
        WHERE email = ?
      `)
      .bind(email)
      .first<any>();

    return row ? this.map(row) : null;
  }

  async save(user: User): Promise<void> {

    await this.env.app_db
      .prepare(`
        INSERT INTO users (
          id,
          email,
          name,
          picture,
          created_at,
          updated_at,
          last_login_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        user.id,
        user.email,
        user.name,
        user.picture ?? null,
        user.createdAt,
        user.updatedAt,
        user.lastLoginAt ?? null
      )
      .run();
  }

  async update(user: User): Promise<void> {

    await this.env.app_db
      .prepare(`
        UPDATE users
        SET
          email = ?,
          name = ?,
          picture = ?,
          updated_at = ?,
          last_login_at = ?
        WHERE id = ?
      `)
      .bind(
        user.email,
        user.name,
        user.picture ?? null,
        user.updatedAt,
        user.lastLoginAt ?? null,
        user.id
      )
      .run();
  }

  private map(row: any): User {

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      picture: row.picture ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at ?? undefined,
    };

  }

}