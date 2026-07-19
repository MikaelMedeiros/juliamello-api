import { RepositoryFactory } from "../../repositories/auth/repository-factory";
import { AuthService } from "../../services/auth.service";
import { GoogleOAuthService } from "../../services/google-oauth.service";
import { JwtService } from "../../services/jwt.service";
import { SlugService } from "../../services/slug.service";

import { RequestContext } from "../../context";
import { json } from "../../response";

interface LoginRequest {
  code: string;
}

export async function googleLogin(
  context: RequestContext
): Promise<Response> {

  const body = context.body as LoginRequest;

  const repositories = new RepositoryFactory(context.env);

  const authService = new AuthService(
    context.env,
    repositories,
    new GoogleOAuthService(context.env),
    new JwtService(context.env),
    new SlugService()
  );

  const result = await authService.login(body.code);

  return json(result, context.corsHeaders);

}