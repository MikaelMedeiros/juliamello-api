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
          expires_at,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        account.id,
        account.userId,
        account.provider,
        account.providerUserId,
        account.accessToken ?? null,
        account.refreshToken ?? null,
        account.expiresAt ?? null,
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
          access_token = ?,
          refresh_token = ?,
          expires_at = ?,
          updated_at = ?
        WHERE id = ?
      `)
      .bind(
        account.accessToken ?? null,
        account.refreshToken ?? null,
        account.expiresAt ?? null,
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
      accessToken: row.access_token ?? undefined,
      refreshToken: row.refresh_token ?? undefined,
      expiresAt: row.expires_at ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

  }

}