import { OrganizationRepository } from "./organization.repository";
import { OrganizationUserRepository } from "./organization-user.repository";
import { OAuthAccountRepository } from "./oauth-account.repository";
import { UserRepository } from "./user.repository";

import { D1OrganizationRepository } from "./d1-organization.repository";
import { D1OrganizationUserRepository } from "./d1-organization-user.repository";
import { D1OAuthAccountRepository } from "./d1-oauth-account.repository";
import { D1UserRepository } from "./d1-user.repository";

export class RepositoryFactory {

  private _users?: UserRepository;
  private _organizations?: OrganizationRepository;
  private _organizationUsers?: OrganizationUserRepository;
  private _oauthAccounts?: OAuthAccountRepository;

  constructor(private readonly env: Env) {}

  users(): UserRepository {
    return this._users ??= new D1UserRepository(this.env);
  }

  organizations(): OrganizationRepository {
    return this._organizations ??= new D1OrganizationRepository(this.env);
  }

  organizationUsers(): OrganizationUserRepository {
    return this._organizationUsers ??=
      new D1OrganizationUserRepository(this.env);
  }

  oauthAccounts(): OAuthAccountRepository {
    return this._oauthAccounts ??=
      new D1OAuthAccountRepository(this.env);
  }

}