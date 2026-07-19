import { RepositoryFactory } from "../repositories/auth/repository-factory";
import { GoogleOAuthService, GoogleOAuthUser } from "./google-oauth.service";
import { JwtService } from "./jwt.service";
import { SlugService } from "./slug.service";
    
import { User } from "../models/auth/user";
import { Organization } from "../models/auth/organization";
import { OAuthAccount } from "../models/auth/oauth-account";
import { OrganizationUser } from "../models/auth/organization-user";
import { UserRepository } from "../repositories/auth/user.repository";
import { OrganizationRepository } from "../repositories/auth/organization.repository";
import { OrganizationUserRepository } from "../repositories/auth/organization-user.repository";
import { OAuthAccountRepository } from "../repositories/auth/oauth-account.repository";


export interface LoginResult {
  token: string;
  user: User;
  organization: Organization;
}

export class AuthService {

private readonly users: UserRepository;
private readonly organizations: OrganizationRepository;
private readonly organizationUsers: OrganizationUserRepository;
private readonly oauthAccounts: OAuthAccountRepository;

constructor(
  private readonly env: Env,
  private readonly repositories: RepositoryFactory,
  private readonly googleOAuth: GoogleOAuthService,
  private readonly jwtService: JwtService,
  private readonly slugService: SlugService
) {
  this.users = repositories.users();
  this.organizations = repositories.organizations();
  this.organizationUsers = repositories.organizationUsers();
  this.oauthAccounts = repositories.oauthAccounts();
}

    async login(code: string): Promise<LoginResult> {

        const tokens = await this.googleOAuth.exchangeCode(code);

        const googleUser = await this.googleOAuth.getUser(tokens.idToken);

        const account = await this.oauthAccounts.findByProviderUserId(
            "GOOGLE",
            googleUser.sub
        );

        if (account) {
            return this.loginExistingUser(
            account,
            tokens.refreshToken
            );
        }

        return this.registerNewUser(
            googleUser,
            tokens.refreshToken
        );

    }

  private async loginExistingUser(
    account: OAuthAccount,
    refreshToken?: string
    ): Promise<LoginResult> {

    const user = await this.users.findById(account.userId);

    if (!user) {
        throw new Error("User not found.");
    }

    const organization = await this.organizations.findByUserId(user.id);

    if (!organization) {
        throw new Error("Organization not found.");
    }

    const now = new Date().toISOString();

    user.lastLoginAt = now;
    user.updatedAt = now;

    await this.users.update(user);

    if (refreshToken) {

        account.refreshToken = refreshToken;
        account.updatedAt = now;

        await this.oauthAccounts.update(account);

    }

    const organizationUser = (
        await this.organizationUsers.findByUserId(user.id)
    )[0];

    const token = await this.jwtService.sign({
        sub: user.id,
        organizationId: organization.id,
        role: organizationUser.role,
        email: user.email,
        name: user.name
    });

    return {
        token,
        user,
        organization
    };

    }

  private async registerNewUser(
    googleUser: GoogleOAuthUser,
    refreshToken?: string
    ): Promise<LoginResult> {

    const now = new Date().toISOString();

    const organization: Organization = {
        id: crypto.randomUUID(),
        name: googleUser.name,
        slug: await this.slugService.generateUniqueSlug(
        googleUser.name,
        this.organizations
        ),
        createdAt: now,
        updatedAt: now
    };

    await this.organizations.save(organization);

    const user: User = {
        id: crypto.randomUUID(),
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now
    };

    await this.users.save(user);

    const organizationUser: OrganizationUser = {
        organizationId: organization.id,
        userId: user.id,
        role: "OWNER",
        createdAt: now
    };

    await this.organizationUsers.save(organizationUser);

    const oauthAccount: OAuthAccount = {
        id: crypto.randomUUID(),
        userId: user.id,
        provider: "GOOGLE",
        providerUserId: googleUser.sub,
        refreshToken,
        createdAt: now,
        updatedAt: now
    };

    await this.oauthAccounts.save(oauthAccount);

    const token = await this.jwtService.sign({
        sub: user.id,
        organizationId: organization.id,
        role: "OWNER",
        email: user.email,
        name: user.name
    });

    return {
        token,
        user,
        organization
    };

    }

}