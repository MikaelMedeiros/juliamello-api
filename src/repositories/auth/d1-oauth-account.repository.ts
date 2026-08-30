import { OAuthAccount } from "../../models/auth/oauth-account";
import { OAuthAccountRepository } from "./oauth-account.repository";

export class D1OAuthAccountRepository implements OAuthAccountRepository {

  constructor(private readonly env: Env) {}

  async findByProviderUserId(
    provider: "GOOGLE",
    providerUserId: string
  ): Promise<OAuthAccount | null> {

    const row = await this.env.app_db
      .prepare(`
        SELECT *
        FROM oauth_accounts
        WHERE provider = ?
          AND provider_user_id = ?
      `)
      .bind(provider, providerUserId)
      .first<any>();

    return row ? this.map(row) : null;
  }

  async save(account: OAuthAccount): Promise<void> {

  await this.env.app_db
      .prepare(`
        INSERT INTO oauth_accounts (
          id,
          user_id,
          provider,
          provider_user_id,
          access_token,
          refresh_token,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        account.id,
        account.userId,
        account.provider,
        account.providerUserId,
        account.accessToken ?? null,
        account.refreshToken ?? null,
        account.createdAt,
        account.updatedAt
      )
      .run();

  }

  async update(account: OAuthAccount): Promise<void> {

    await this.env.app_db
      .prepare(`
        UPDATE oauth_accounts
        SET
          refresh_token = ?,
          updated_at = ?
        WHERE id = ?
      `)
      .bind(
        account.refreshToken ?? null,
        account.updatedAt,
        account.id
      )
      .run();

  }

  async findByUserId(
    userId: string
    ): Promise<OAuthAccount | null> {

      const row = await this.env.app_db
        .prepare(`
          SELECT *
          FROM oauth_accounts
          WHERE user_id = ?
          LIMIT 1
        `)
        .bind(userId)
        .first<any>();

      return row ? this.map(row) : null;

  }

  private map(row: any): OAuthAccount {

    return {
      id: row.id,
      userId: row.user_id,
      provider: row.provider,
      providerUserId: row.provider_user_id,      
      refreshToken: row.refresh_token ?? undefined,      
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

  }

}