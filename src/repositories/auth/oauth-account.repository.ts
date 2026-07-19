import { OAuthAccount } from "../../models/auth/oauth-account";

export interface OAuthAccountRepository {

  findByProviderUserId(
    provider: "GOOGLE",
    providerUserId: string
  ): Promise<OAuthAccount | null>;

  save(account: OAuthAccount): Promise<void>;

  update(account: OAuthAccount): Promise<void>;

  findByUserId(userId: string): Promise<OAuthAccount | null>;

}