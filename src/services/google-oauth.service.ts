import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

export interface GoogleOAuthUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export interface GoogleOAuthTokens {
  accessToken: string;
  refreshToken?: string;
  idToken: string;
  expiresIn: number;
}

export class GoogleOAuthService {

  constructor(private readonly env: Env) {}

  async exchangeCode(code: string): Promise<GoogleOAuthTokens> {

    const response = await fetch(
        "https://oauth2.googleapis.com/token",
        {
        method: "POST",

        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },

        body: new URLSearchParams({

            code,

            client_id: this.env.GOOGLE_CLIENT_ID,

            client_secret: this.env.GOOGLE_CLIENT_SECRET,

            redirect_uri: "postmessage",

            grant_type: "authorization_code"

        })

        }
    );

    if (!response.ok) {
        throw new Error("Unable to exchange authorization code.");
    }

    const json = await response.json<any>();

    return {

        accessToken: json.access_token,

        refreshToken: json.refresh_token,

        idToken: json.id_token,

        expiresIn: json.expires_in

    };

    }

    async getUser(idToken: string): Promise<GoogleOAuthUser> {

        const { payload } = await jwtVerify(idToken, JWKS, {
            issuer: [
            "https://accounts.google.com",
            "accounts.google.com",
            ],
            audience: this.env.GOOGLE_CLIENT_ID,
        });

        return {
            sub: payload.sub as string,
            email: payload.email as string,
            name: payload.name as string,
            picture: payload.picture as string | undefined,
        };

    }

}